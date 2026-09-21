import os
import re
import time
import io
import json
import uuid
from typing import List, Optional
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from azure.cosmos import CosmosClient
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

import db_tools as T

load_dotenv()

app = FastAPI(title="Pista-Tutor Backend")

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ACTIVE_QUIZZES = {}
MODEL_DEPLOYMENT = "gpt-5-mini"

# --- Cosmos DB Setup ---
client = CosmosClient(url=os.environ["COSMOS_ENDPOINT"],
                      credential=os.environ["COSMOS_KEY"])
database = client.get_database_client(os.environ["COSMOS_DATABASE"])
students = database.get_container_client("students")
activity = database.get_container_client("activity")

# --- Microsoft Foundry Setup ---
endpoint = "https://sharthakdey21891-2768-resource.services.ai.azure.com/api/projects/sharthakdey21891-2768"
project_client = AIProjectClient(endpoint=endpoint, credential=DefaultAzureCredential())
openai_client = project_client.get_openai_client()

VECTOR_STORE_ID = "vs_PJK0MieeEf3dJG0GlPgzytiv"
ALLOWED_EXTENSIONS = {".pdf", ".ppt", ".pptx", ".doc", ".docx", ".txt", ".md"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


# --- Pydantic Models ---
class ChatRequest(BaseModel):
    message: str
    conversationId: Optional[str] = None
    history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    conversationId: str
    reply: str
    sources: List[str] = []
    citations: Optional[List[dict]] = []
    action: Optional[dict] = None

class ProgressUpdate(BaseModel):
    student_id: str
    subject_id: str
    topic: str
    status: str
    mastery_level: int = Field(ge=0, le=100)
    weakness_level: Optional[str] = None
    reason: Optional[str] = None

class QuizResultIn(BaseModel):
    student_id: str
    subject_id: str
    topic: str
    score: int = Field(ge=0)
    total_questions: int = Field(gt=0)
    difficulty: str = "medium"
    weak_concepts: List[str] = []

class StudyPlanIn(BaseModel):
    student_id: str
    recommended_topics: List[str]
    reason: str


# --- Helpers ---
def _pretty(raw):
    """'dbms' -> 'DBMS', 'Massive_MIMO-OFDM...' -> 'Massive MIMO OFDM ...'"""
    if not raw:
        return "General"
    s = str(raw).replace("_", " ").replace("-", " ").strip()
    out = []
    for w in s.split():
        if not any(v in w.lower() for v in "aeiou") and len(w) <= 6:
            out.append(w.upper())
        else:
            out.append(w[:1].upper() + w[1:])
    return " ".join(out)

def _slug(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())

def _upsert_exam(doc, exam):
    """Insert or UPDATE an exam. Key = subject+date+sem+branch. Never duplicates."""
    exams = doc.setdefault("exams", [])
    def key(e):
        return "|".join([_slug(e.get("subject")), str(e.get("date")),
                         str(e.get("sem") or ""), str(e.get("branch") or "")])
    for e in exams:
        if key(e) == key(exam):
            e.update(exam)
            return doc, False
    exam.setdefault("id", key(exam))
    exams.append(exam)
    return doc, True


# --- Core Endpoints ---

@app.get("/")
def root():
    return {"status": "Pista-Tutor backend is running"}


# --- MESSAGE ROUTER: decides which agent answers ---
GUIDE_KEYWORDS = [
    "exam", "test date", "when is", "schedule", "what should i study",
    "study plan", "plan my", "progress", "weak", "improve", "reminder",
    "today", "tomorrow", "this week", "how am i doing", "score",
    "performance", "revise", "revision", "semester", "branch",
]

def route_message(message: str) -> str:
    m = message.lower()
    if any(k in m for k in GUIDE_KEYWORDS):
        return "guide"
    return "tutor"

def to_message_item(role: str, content) -> dict:
    """Convert any message into the strict typed format the Azure Responses API requires."""
    if isinstance(content, list):
        text = "".join(p.get("text", "") for p in content if isinstance(p, dict))
    elif isinstance(content, str):
        text = content
    else:
        text = json.dumps(content)
    if not text.strip():
        text = "[empty message]"
    part_type = "output_text" if role == "assistant" else "input_text"
    return {
        "type": "message",
        "role": role,
        "content": [{"type": part_type, "text": text}],
    }

def sanitize_history(history):
    """Drop any malformed or empty history entries before sending to Azure."""
    clean = []
    for msg in history or []:
        if not isinstance(msg, dict):
            continue
        role = msg.get("role")
        if role in ("user", "assistant", "system", "developer") and msg.get("content") is not None:
            clean.append(to_message_item(role, msg.get("content")))
    return clean


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, x_student_id: Optional[str] = Header(None)):
    student_id = x_student_id or "student-001"
    destination = route_message(req.message)
    print(f"🧭 Routing message to: {destination.upper()}")

    history = sanitize_history(req.history)

    if destination == "guide":
        # Guide gets LIVE Cosmos DB data injected as its system context
        exams = T.get_upcoming_exams(students, student_id)
        weak = T.get_weak_topics(students, student_id)
        progress = T.get_learning_progress(students, student_id)
        snapshot = f"""--- STUDENT CONTEXT SNAPSHOT (live from Cosmos DB) ---
UPCOMING EXAMS: {json.dumps(exams)}
WEAK TOPICS: {json.dumps(weak)}
PROGRESS: {json.dumps(progress)}
-------------------------------------------------------"""
        input_messages = [to_message_item("system", snapshot)]
        input_messages += history
        input_messages.append(to_message_item("user", req.message))
        agent_ref = {"name": "Pista-Guide", "version": "1", "type": "agent_reference"}
        sources = ["personalized", "database"]
    else:
        # Tutor keeps its portal behaviour (instructions + File Search on your notes)
        input_messages = history + [to_message_item("user", req.message)]
        agent_ref = {"name": "Pista-Tutor", "version": "2", "type": "agent_reference"}
        sources = ["course_material"]

    try:
        response = openai_client.responses.create(
            input=input_messages,
            extra_body={"agent_reference": agent_ref},
        )
        ai_reply = response.output_text
    except Exception as e:
        print(f"\n❌ AZURE ERROR FOR {destination.upper()}: {e}\n")
        raise HTTPException(status_code=500, detail=f"Foundry Agent Error: {str(e)}")

    # Natural-language capture for the Guide: save what the student says about their profile/exams
    if destination == "guide":
        low = req.message.lower()
        if any(k in low for k in ["semester", "sem ", "branch", "my exam", "exam is on", "exam on", "i am in"]):
            try:
                parse = openai_client.chat.completions.create(
                    model=MODEL_DEPLOYMENT,
                    messages=[{"role": "user", "content": f"""Extract structured updates from the student's message. Return ONLY JSON:
{{"semester": string|null, "branch": string|null, "exams": [{{"subject": string, "date": "YYYY-MM-DD"}}]}}
Use null / [] when not mentioned. Today is 2026-09-22; resolve relative dates against it.
Message: {req.message}"""}],
                    response_format={"type": "json_object"},
                )
                upd = json.loads(parse.choices[0].message.content)
                doc = T.get_student_context(students, student_id) or {}
                doc.setdefault("id", student_id)
                notes = []
                if upd.get("semester"):
                    doc["semester"] = str(upd["semester"]); notes.append(f"semester {upd['semester']}")
                if upd.get("branch"):
                    doc["branch"] = upd["branch"]; notes.append(f"branch {upd['branch']}")
                for ex in upd.get("exams", []):
                    if ex.get("subject") and ex.get("date"):
                        doc, _ = _upsert_exam(doc, {
                            "subject": _pretty(ex["subject"]),
                            "subjectId": _slug(ex["subject"]),
                            "date": ex["date"], "topics": [],
                            "title": "Reported by student", "sem": doc.get("semester", ""), "branch": doc.get("branch", "")})
                        notes.append(f"{ex['subject']} on {ex['date']}")
                if notes:
                    students.upsert_item(doc)
                    ai_reply += "\n\n✅ Saved to your profile: " + "; ".join(notes) + "."
            except Exception as e:
                print(f"⚠️ profile parse skipped: {e}")

    return ChatResponse(
        conversationId=req.conversationId or str(uuid.uuid4()),
        reply=ai_reply,
        sources=sources,
        citations=[],
        action=None,
    )


# --- Materials Upload/List/Delete Endpoints ---

@app.post("/materials")
async def upload_material(
    file: UploadFile = File(...),
    subject: str = Form(...),
    x_student_id: Optional[str] = Header(None),
):
    student_id = x_student_id or "student-001"

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 50MB)")

    try:
        file_obj = openai_client.files.create(
            file=(file.filename, content, file.content_type or "application/octet-stream"),
            purpose="assistants",
        )

        openai_client.vector_stores.files.create(
            vector_store_id=VECTOR_STORE_ID,
            file_id=file_obj.id,
        )

        status = "in_progress"
        for _ in range(30):
            try:
                vs_file = openai_client.vector_stores.files.retrieve(
                    vector_store_id=VECTOR_STORE_ID,
                    file_id=file_obj.id,
                )
                status = vs_file.status
                if status == "completed":
                    break
            except Exception:
                pass
            time.sleep(1)

        return {
            "id": file_obj.id,
            "fileName": file.filename,
            "fileType": ext.lstrip("."),
            "sizeBytes": len(content),
            "subjectId": subject,
            "subject": subject,
            "status": "processed" if status == "completed" else "processing",
            "searchable": status == "completed",
            "uploadedAt": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as e:
        import traceback
        print("\n--- UPLOAD ERROR ---")
        traceback.print_exc()
        print("--------------------\n")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/materials")
def list_materials(x_student_id: Optional[str] = Header(None)):
    try:
        vs_files = openai_client.vector_stores.files.list(
            vector_store_id=VECTOR_STORE_ID,
            limit=100,
        )
        result = []
        for vf in vs_files.data:
            try:
                file_obj = openai_client.files.retrieve(vf.id)
                fname = file_obj.filename or ""
                size = getattr(file_obj, "bytes", 0) or 0
            except Exception:
                fname = vf.id
                size = 0

            ext = ""
            if "." in fname:
                ext = fname.rsplit(".", 1)[-1].lower()

            created_ts = getattr(vf, "created_at", None)
            uploaded = None
            if created_ts:
                try:
                    uploaded = datetime.fromtimestamp(int(created_ts), tz=timezone.utc).isoformat()
                except (TypeError, ValueError):
                    uploaded = None

            result.append({
                "id": vf.id,
                "fileName": fname,
                "fileType": ext,
                "sizeBytes": size,
                "subjectId": "general",
                "subject": "General",
                "status": "processed" if vf.status == "completed" else "processing",
                "searchable": vf.status == "completed",
                "uploadedAt": uploaded,
            })
        return result
    except Exception as e:
        import traceback
        print("\n--- LIST MATERIALS ERROR ---")
        traceback.print_exc()
        print("------------------------------\n")
        raise HTTPException(status_code=500, detail=f"List failed: {str(e)}")


@app.delete("/materials/{file_id}")
def delete_material(file_id: str, x_student_id: Optional[str] = Header(None)):
    try:
        try:
            openai_client.vector_stores.files.delete(
                vector_store_id=VECTOR_STORE_ID,
                file_id=file_id,
            )
        except Exception:
            pass

        openai_client.files.delete(file_id)
        return {"status": "deleted", "fileId": file_id}

    except Exception as e:
        import traceback
        print("\n--- DELETE MATERIAL ERROR ---")
        traceback.print_exc()
        print("---------------------------\n")
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@app.get("/students/me")
def student_me(x_student_id: Optional[str] = Header(None)):
    student_id = x_student_id or "student-001"
    doc = T.get_student_context(students, student_id) or {}
    try:
        quiz_docs = list(activity.query_items(
            query="SELECT * FROM c WHERE c.student_id = @sid",
            parameters=[{"name": "@sid", "value": student_id}],
            enable_cross_partition_query=True))
    except Exception:
        quiz_docs = []
    progress = doc.get("progress", []) or []
    mastered = sum(1 for p in progress if (p.get("masteryLevel", p.get("mastery", 0)) or 0) >= 70)
    return {
        "id": doc.get("id", student_id),
        "name": doc.get("name", "Student"),
        "program": doc.get("program", ""),
        "semester": doc.get("semester", ""),
        "branch": doc.get("branch", ""),
        "preferences": doc.get("preferences", {}) or {},
        "stats": {
            "streakDays": doc.get("streakDays", 0),
            "studyHours": doc.get("studyHours", 0),
            "quizzesTaken": len(quiz_docs),
            "topicsMastered": mastered,
        },
    }


@app.get("/progress")
def progress_me(x_student_id: Optional[str] = Header(None)):
    student_id = x_student_id or "student-001"
    doc = T.get_student_context(students, student_id) or {}

    raw_progress = doc.get("progress", []) or []
    raw_weak = doc.get("weakTopics", []) or []
    raw_subjects = doc.get("subjects", []) or []
    exams = doc.get("exams", []) or []

    try:
        quiz_docs = list(activity.query_items(
            query="SELECT * FROM c WHERE c.student_id = @sid",
            parameters=[{"name": "@sid", "value": student_id}],
            enable_cross_partition_query=True))
    except Exception:
        quiz_docs = []
        
    quiz_history = sorted([{
        "id": q.get("id"),
        "date": q.get("date"),
        "subject": _pretty(q.get("subject_id") or q.get("subject")),
        "subjectId": (q.get("subject_id") or q.get("subject") or "general"),
        "topic": _pretty(q.get("topic")),
        "score": q.get("percentage", 0),
    } for q in quiz_docs], key=lambda x: x.get("date") or "", reverse=True)

    topics = [{
        "id": f"{p.get('subjectId', 'general')}-{p.get('topic', '')}",
        "name": _pretty(p.get("topic")),
        "subject": _pretty(p.get("subjectId") or p.get("subject")),
        "subjectId": p.get("subjectId") or p.get("subject") or "general",
        "mastery": p.get("masteryLevel", p.get("mastery", 0)),
    } for p in raw_progress]

    subj_map = {}
    for s in raw_subjects:
        sid = s.get("subjectId") or s.get("id")
        if sid:
            subj_map[sid] = {"id": sid, "name": s.get("subjectName") or s.get("name") or _pretty(sid), "progress": s.get("progress", 0)}
    for t in topics:
        subj_map.setdefault(t["subjectId"], {"id": t["subjectId"], "name": t["subject"], "progress": 0})
    for q in quiz_history:
        subj_map.setdefault(q["subjectId"], {"id": q["subjectId"], "name": q["subject"], "progress": 0})
    for sid, s in subj_map.items():
        vals = [t["mastery"] for t in topics if t["subjectId"] == sid]
        if vals:
            s["progress"] = round(sum(vals) / len(vals))
    subjects = list(subj_map.values())

    weak_topics = []
    for w in raw_weak:
        sid = w.get("subjectId") or w.get("subject") or "general"
        exam_days = None
        for e in exams:
            if (e.get("subjectId") or e.get("subject")) == sid and e.get("date"):
                try:
                    d = datetime.fromisoformat(str(e["date"]).replace("Z", "+00:00"))
                    exam_days = max(0, (d - datetime.now(timezone.utc)).days)
                except Exception:
                    pass
        weak_topics.append({
            "topic": _pretty(w.get("topic")),
            "subject": subj_map.get(sid, {}).get("name", _pretty(sid)),
            "subjectId": sid,
            "mastery": w.get("mastery", w.get("masteryLevel", 0)),
            "priority": w.get("priority") or w.get("weaknessLevel") or "medium",
            "examInDays": exam_days,
        })

    overall = round(sum(t["mastery"] for t in topics) / len(topics)) if topics else 0

    return {
        "studentId": student_id,
        "overall": overall,
        "subjects": subjects,
        "topics": topics,
        "weakTopics": weak_topics,
        "quizHistory": quiz_history,
        "exams": exams,
        "streakDays": doc.get("streakDays", 0),
    }


# --- Quiz Engine Endpoints ---

@app.post("/quizzes")
async def create_quiz(
    topic: str = Form(""),
    subject: str = Form("General"),
    difficulty: str = Form("medium"),
    numQuestions: int = Form(5),
    file: Optional[UploadFile] = File(None)
):
    quiz_id = f"quiz-{uuid.uuid4().hex[:8]}"
    context_text = ""
    file_name = ""
    
    if file and file.filename:
        file_name = file.filename
        content = await file.read()
        ext = file_name.split(".")[-1].lower()
        
        if ext == "pdf":
            try:
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(content))
                context_text = "\n".join([page.extract_text() or "" for page in reader.pages])
            except Exception as e:
                print(f"PDF extraction failed: {e}")
        else:
            context_text = content.decode("utf-8", errors="ignore")
        
        context_text = context_text[:12000]

    quiz_topic = topic if topic else (file_name if file_name else "General Knowledge")

    prompt = f"""You are an expert tutor. Generate a {difficulty} difficulty multiple-choice quiz about "{quiz_topic}" for the subject "{subject}".
{"Use the following context from the student's uploaded file to create the questions:\n---\n" + context_text + "\n---" if context_text else ""}

Return ONLY valid JSON. No markdown formatting (no ```json). No conversational text.
{{
  "quizId": "{quiz_id}",
  "subject": "{subject}",
  "topic": "{quiz_topic}",
  "difficulty": "{difficulty}",
  "questions": [
    {{
      "id": "q1",
      "question": "What is 2NF?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOption": 1,
      "explanation": "Because it eliminates partial dependencies.",
      "subtopic": "{quiz_topic}"
    }}
  ]
}}
Generate exactly {numQuestions} questions. 'correctOption' MUST be the 0-based index of the correct answer in the 'options' array."""

    try:
        response = openai_client.chat.completions.create(
            model=MODEL_DEPLOYMENT,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        quiz_data = json.loads(response.choices[0].message.content)
        
        if "quizId" not in quiz_data:
            quiz_data["quizId"] = quiz_id
            
        ACTIVE_QUIZZES[quiz_data["quizId"]] = quiz_data
        
        safe_quiz = json.loads(json.dumps(quiz_data))
        for q in safe_quiz["questions"]:
            q.pop("correctOption", None)
            q.pop("explanation", None)
        return safe_quiz
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")


@app.post("/quizzes/{quiz_id}/submit")
def submit_quiz(quiz_id: str, payload: dict, x_student_id: Optional[str] = Header(None)):
    student_id = x_student_id or "student-001"
    answers = payload.get("answers", {})
    
    if quiz_id not in ACTIVE_QUIZZES:
        raise HTTPException(status_code=404, detail="Quiz not found or expired.")
        
    quiz_data = ACTIVE_QUIZZES[quiz_id]
    
    review = []
    correct_count = 0
    topic_stats = {}
    
    for q in quiz_data["questions"]:
        selected = answers.get(q["id"])
        is_correct = (selected == q["correctOption"])
        if is_correct: 
            correct_count += 1
            
        subtopic = q.get("subtopic", quiz_data["topic"])
        if subtopic not in topic_stats:
            topic_stats[subtopic] = {"correct": 0, "total": 0}
        topic_stats[subtopic]["total"] += 1
        if is_correct:
            topic_stats[subtopic]["correct"] += 1
            
        review.append({
            "questionId": q["id"],
            "question": q["question"],
            "options": q["options"],
            "selected": selected,
            "correct": q["correctOption"],
            "isCorrect": is_correct,
            "explanation": q.get("explanation", "")
        })
        
    total_questions = len(quiz_data["questions"])
    percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
    weak_identified = percentage < 70
    
    topic_performance = []
    weak_areas = []
    for sub, stats in topic_stats.items():
        acc = (stats["correct"] / stats["total"]) * 100 if stats["total"] > 0 else 0
        topic_performance.append({
            "topic": sub,
            "correct": stats["correct"],
            "total": stats["total"],
            "accuracy": acc
        })
        if acc < 70:
            weak_areas.append({"topic": sub, "accuracy": acc})
    
    try:
        mastery = int(percentage)
        weakness_level = "high" if percentage < 50 else ("medium" if percentage < 70 else None)
        
        T.update_learning_progress(
            students, student_id, quiz_data["subject"], quiz_data["topic"],
            status="completed", mastery_level=mastery,
            weakness_level=weakness_level,
            reason=f"Scored {correct_count}/{total_questions} on quiz" if weakness_level else None
        )
        
        T.save_quiz_result(
            activity, student_id, quiz_data["subject"], quiz_data["topic"],
            correct_count, total_questions, quiz_data["difficulty"],
            [w["topic"] for w in weak_areas]
        )
        print(f"✅ Cosmos DB updated for student {student_id} on topic {quiz_data['topic']}")
    except Exception as e:
        print(f"❌ DB Update Error: {e}")

    del ACTIVE_QUIZZES[quiz_id]

    return {
        "quizId": quiz_id,
        "topic": quiz_data["topic"],
        "subject": quiz_data["subject"],
        "correctCount": correct_count,
        "total": total_questions,
        "percentage": percentage,
        "topicPerformance": topic_performance,
        "weakAreas": weak_areas,
        "weakTopicIdentified": weak_identified,
        "review": review,
        "recommendation": {
            "title": "Review weak areas" if weak_identified else "Great job!",
            "message": "Focus on the concepts you missed." if weak_identified else "You mastered this topic.",
            "actionLabel": "Study",
            "prompt": f"Explain {quiz_data['topic']} simply."
        }
    }


# --- Pista-Guide Agent Endpoints ---

@app.post("/guide", response_model=ChatResponse)
def guide_chat(req: ChatRequest, x_student_id: Optional[str] = Header(None)):
    student_id = x_student_id or "student-001"
    
    context_doc = T.get_student_context(students, student_id) or {}
    exams = T.get_upcoming_exams(students, student_id)
    weak_topics = T.get_weak_topics(students, student_id)
    progress = T.get_learning_progress(students, student_id)
    
    snapshot = f"""--- STUDENT CONTEXT SNAPSHOT ---
Student Name: {context_doc.get('name', 'Student')}

UPCOMING EXAMS:
{json.dumps(exams, indent=2) if exams else 'No upcoming exams in the database.'}

WEAK TOPICS:
{json.dumps(weak_topics, indent=2) if weak_topics else 'No weak topics identified recently.'}

RECENT PROGRESS & MASTERY:
{json.dumps(progress, indent=2) if progress else 'No recent progress recorded.'}
--------------------------------"""

    input_messages = [to_message_item("system", snapshot)]
    for msg in (req.history or []):
        input_messages.append(to_message_item(msg["role"], msg["content"]))
    input_messages.append(to_message_item("user", req.message))

    try:
        response = openai_client.responses.create(
            input=input_messages,
            extra_body={
                "agent_reference": {
                    "name": "Pista-Guide", 
                    "version": "1", 
                    "type": "agent_reference"
                }
            },
        )
        ai_reply = response.output_text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Guide Agent Error: {str(e)}")

    return ChatResponse(
        conversationId=req.conversationId or str(uuid.uuid4()),
        reply=ai_reply,
        sources=["personalized", "database"],
        citations=[],
        action=None
    )


@app.get("/recommendations/today")
def recommendation_today(x_student_id: Optional[str] = Header(None)):
    student_id = x_student_id or "student-001"
    
    exams = T.get_upcoming_exams(students, student_id)
    weak_topics = T.get_weak_topics(students, student_id)
    
    snapshot = f"""--- STUDENT CONTEXT SNAPSHOT ---
UPCOMING EXAMS: {json.dumps(exams)}
WEAK TOPICS: {json.dumps(weak_topics)}
--------------------------------"""
    
    prompt = "Based on my context snapshot, what exactly should I study today and why? Give me a focused, encouraging daily plan."
    
    input_messages = [
        to_message_item("system", snapshot),
        to_message_item("user", prompt)
    ]
    
    try:
        response = openai_client.responses.create(
            input=input_messages,
            extra_body={
                "agent_reference": {
                    "name": "Pista-Guide", 
                    "version": "1", 
                    "type": "agent_reference"
                }
            },
        )
        ai_reply = response.output_text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Guide Agent Error: {str(e)}")
        
    return {
        "kind": "focus",
        "subject": weak_topics[0].get("subjectId", "General") if weak_topics else "General",
        "topic": weak_topics[0].get("topic", "Review") if weak_topics else "Review",
        "title": "Today's Study Plan",
        "message": ai_reply,
        "reasons": [{"type": "progress", "label": "Based on your recent quiz scores"}],
        "action": {"label": "Start Studying", "prompt": ai_reply}
    }


# --- Database Tool Endpoints ---

@app.get("/tools/context/{student_id}")
def context(student_id: str): return T.get_student_context(students, student_id)

@app.get("/tools/exams/{student_id}")
def exams_tool(student_id: str): return T.get_upcoming_exams(students, student_id)

@app.get("/tools/progress/{student_id}")
def progress_tool(student_id: str): return T.get_learning_progress(students, student_id)

@app.get("/tools/weak-topics/{student_id}")
def weak_tool(student_id: str): return T.get_weak_topics(students, student_id)

@app.post("/tools/progress/update")
def update_progress(p: ProgressUpdate):
    return T.update_learning_progress(students, p.student_id, p.subject_id,
                                      p.topic, p.status, p.mastery_level,
                                      p.weakness_level, p.reason)

@app.post("/tools/quiz-result")
def quiz(q: QuizResultIn):
    return T.save_quiz_result(activity, q.student_id, q.subject_id, q.topic,
                              q.score, q.total_questions, q.difficulty,
                              q.weak_concepts)

@app.post("/tools/study-plan")
def plan(s: StudyPlanIn):
    return T.create_study_plan(activity, s.student_id,
                               s.recommended_topics, s.reason)


# --- Exams Endpoints (Datesheet & Manual) ---

@app.get("/exams")
def list_exams(x_student_id: Optional[str] = Header(None)):
    student_id = x_student_id or "student-001"
    doc = T.get_student_context(students, student_id) or {}
    sem = str(doc.get("semester") or "")
    branch = str(doc.get("branch") or "")
    progress = doc.get("progress", []) or []
    out = []
    for e in doc.get("exams", []) or []:
        if sem and e.get("sem") and str(e.get("sem")) != sem:
            continue
        if branch and e.get("branch") and str(e.get("branch")) != branch:
            continue
        subj = e.get("subject") or "General"
        prep = e.get("preparedness")
        if prep is None:
            vals = [p.get("masteryLevel", p.get("mastery", 0)) for p in progress
                    if _slug(p.get("subjectId") or p.get("subject"))
                    and (_slug(p.get("subjectId") or p.get("subject")) in _slug(subj)
                         or _slug(subj) in _slug(p.get("subjectId") or p.get("subject")))]
            prep = round(sum(vals) / len(vals)) if vals else 0
        out.append({
            "id": e.get("id") or (_slug(subj) + "|" + str(e.get("date"))),
            "subject": subj,
            "subjectId": e.get("subjectId") or _slug(subj),
            "title": e.get("title"),
            "date": e.get("date"),
            "preparedness": prep,
            "topics": e.get("topics", []),
        })
    out.sort(key=lambda x: x.get("date") or "")
    return out


@app.post("/exams")
def add_exam(exam: dict, x_student_id: Optional[str] = Header(None)):
    student_id = x_student_id or "student-001"
    doc = T.get_student_context(students, student_id) or {}
    doc.setdefault("id", student_id)
    entry = {"subject": exam.get("subject"), "title": exam.get("title"),
             "date": exam.get("date"), "topics": exam.get("topics", []),
             "sem": exam.get("sem"), "branch": exam.get("branch")}
    doc, created = _upsert_exam(doc, entry)
    students.upsert_item(doc)
    return {"status": "created" if created else "updated", "exam": entry}


@app.post("/exams/extract")
async def extract_exams(
    file: UploadFile = File(...),
    semester: str = Form(""),
    branch: str = Form(""),
    x_student_id: Optional[str] = Header(None),
):
    student_id = x_student_id or "student-001"
    content = await file.read()
    
    # Relaxed filename check (strips hidden spaces)
    fname = (file.filename or "").lower().strip()
    if not fname.endswith(".pdf"):
        raise HTTPException(status_code=400, detail=f"Please upload a PDF file. Got: {file.filename}")
        
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        text = "\n".join(p.extract_text() or "" for p in reader.pages)[:20000]
        if not text.strip():
             raise ValueError("Extracted text is empty. The PDF might be scanned images instead of text.")
    except Exception as e:
        import traceback
        print("\n--- PDF READ ERROR ---")
        traceback.print_exc()
        print("----------------------\n")
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {str(e)}")

    prompt = f"""You parse university datesheet PDFs into structured exam rows.
Today's date: 2026-09-22. Convert dates like "12-Sep-2026" to ISO "2026-09-12".
{"Only include rows for semester " + semester + "." if semester else "Include all semesters."}
{"Only include rows for branch " + branch + "." if branch else "Include all branches."}
If the same subject+date+sem+branch appears multiple times (different groups/sessions), output it ONCE.
Return ONLY valid JSON:
{{"exams": [{{"date": "YYYY-MM-DD", "subject": "Subject Name", "subjectCode": "...", "sem": "5", "branch": "CSE-AIML", "durationMins": 90}}]}}
--- PDF TEXT ---
{text}"""

    try:
        resp = openai_client.chat.completions.create(
            model=MODEL_DEPLOYMENT,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        data = json.loads(resp.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")

    doc = T.get_student_context(students, student_id) or {}
    doc.setdefault("id", student_id)
    if semester: doc["semester"] = semester
    if branch: doc["branch"] = branch

    saved = []
    for r in data.get("exams", []):
        if not r.get("subject") or not r.get("date"):
            continue
        entry = {
            "subject": _pretty(r.get("subject")),
            "subjectId": _slug(r.get("subject")),
            "title": "End Term Exam" + (f" ({r['subjectCode']})" if r.get("subjectCode") else ""),
            "date": r.get("date"),
            "topics": [],
            "sem": str(r.get("sem") or semester or ""),
            "branch": r.get("branch") or branch or "",
        }
        doc, _ = _upsert_exam(doc, entry)
        saved.append(entry)

    students.upsert_item(doc)
    return {"saved": len(saved), "exams": saved}