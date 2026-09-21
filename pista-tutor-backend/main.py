import os
import time
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


# --- Core Endpoints ---

@app.get("/")
def root():
    return {"status": "Pista-Tutor backend is running"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, x_student_id: Optional[str] = Header(None)):
    input_messages = req.history or []
    input_messages.append({"role": "user", "content": req.message})

    try:
        response = openai_client.responses.create(
            input=input_messages,
            extra_body={
                "agent_reference": {
                    "name": "Pista-Tutor",
                    "version": "2",
                    "type": "agent_reference",
                }
            },
        )
        ai_reply = response.output_text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Foundry Agent Error: {str(e)}")

    return ChatResponse(
        conversationId=req.conversationId or str(uuid.uuid4()),
        reply=ai_reply,
        sources=["personalized"],
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
        # 1. Upload file bytes to Foundry
        file_obj = openai_client.files.create(
            file=(file.filename, content, file.content_type or "application/octet-stream"),
            purpose="assistants",
        )

        # 2. Attach file to our vector store (triggers chunking + embedding)
        openai_client.vector_stores.files.create(
            vector_store_id=VECTOR_STORE_ID,
            file_id=file_obj.id,
        )

        # 3. Poll until processed (up to 30s)
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
    """List all files currently in the vector store."""
    try:
        vs_files = openai_client.vector_stores.files.list(
            vector_store_id=VECTOR_STORE_ID,
            limit=100,
        )
        result = []
        for vf in vs_files.data:
            # VectorStoreFile has NO filename — fetch the real File object for name/size
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
    """Delete a file from both the vector store AND the files API."""
    try:
        # 1. Remove from vector store (stops it from being searched)
        try:
            openai_client.vector_stores.files.delete(
                vector_store_id=VECTOR_STORE_ID,
                file_id=file_id,
            )
        except Exception:
            # Might already be removed; continue to file deletion
            pass

        # 2. Delete the file itself from Foundry's storage
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
    doc = T.get_student_context(students, student_id)
    return {
        "id": doc.get("id", student_id),
        "name": doc.get("name", "Student"),
        "preferences": doc.get("preferences", {}),
    }


@app.get("/progress")
def progress_me(x_student_id: Optional[str] = Header(None)):
    student_id = x_student_id or "student-001"
    doc = T.get_student_context(students, student_id)
    subjects = [
        {"id": s.get("subjectId"),
         "name": s.get("subjectName"),
         "topics": s.get("topics", [])}
        for s in doc.get("subjects", [])
    ]
    return {
        "studentId": student_id,
        "subjects": subjects,
        "progress": doc.get("progress", []),
        "weakTopics": doc.get("weakTopics", []),
        "exams": doc.get("exams", []),
    }

# --- Database Tool Endpoints ---

@app.get("/tools/context/{student_id}")
def context(student_id: str): return T.get_student_context(students, student_id)

@app.get("/tools/exams/{student_id}")
def exams(student_id: str): return T.get_upcoming_exams(students, student_id)

@app.get("/tools/progress/{student_id}")
def progress(student_id: str): return T.get_learning_progress(students, student_id)

@app.get("/tools/weak-topics/{student_id}")
def weak(student_id: str): return T.get_weak_topics(students, student_id)

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