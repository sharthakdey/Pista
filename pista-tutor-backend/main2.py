import os
import uuid
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Header
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

# --- Pydantic Models (Matching Frontend) ---
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

# --- Endpoints ---

@app.get("/")
def root():
    return {"status": "Pista-Tutor backend is running"}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, x_student_id: Optional[str] = Header(None)):
    # 1. Build the message history for the AI
    input_messages = req.history or []
    input_messages.append({"role": "user", "content": req.message})

    try:
        # 2. Call the Foundry Agent
        response = openai_client.responses.create(
            input=input_messages,
            extra_body={
                "agent_reference": {
                    "name": "Pista-Tutor", 
                    "version": "2", 
                    "type": "agent_reference"
                }
            },
        )
        
        # 3. Extract the AI's reply
        ai_reply = response.output_text

    except Exception as e:
        # If the AI fails (e.g. 403 Forbidden), return a clear error so we can debug
        raise HTTPException(status_code=500, detail=f"Foundry Agent Error: {str(e)}")

    # 4. Return in the exact shape the frontend expects
    return ChatResponse(
        conversationId=req.conversationId or str(uuid.uuid4()),
        reply=ai_reply,
        sources=["personalized"], # We will refine this in the next step
        citations=[],
        action=None
    )

# --- Database Tool Endpoints (From Step 6) ---
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