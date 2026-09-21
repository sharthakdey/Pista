import uuid
from datetime import date, datetime, timezone


def _read_student(students, student_id):
    return students.read_item(item=student_id, partition_key=student_id)


def get_student_context(students, student_id):
    doc = _read_student(students, student_id)
    return {k: v for k, v in doc.items() if not k.startswith("_")}


def get_upcoming_exams(students, student_id):
    doc = _read_student(students, student_id)
    today = date.today().isoformat()
    exams = [e for e in doc.get("exams", []) if e.get("examDate", "9999-12-31") >= today]
    return sorted(exams, key=lambda e: e["examDate"])


def get_learning_progress(students, student_id):
    return _read_student(students, student_id).get("progress", [])


def get_weak_topics(students, student_id):
    return _read_student(students, student_id).get("weakTopics", [])


def update_learning_progress(students, student_id, subject_id, topic,
                             status, mastery_level,
                             weakness_level=None, reason=None):
    doc = _read_student(students, student_id)
    today = date.today().isoformat()

    prog = doc.setdefault("progress", [])
    entry = next((p for p in prog
                  if p["topic"] == topic and p["subjectId"] == subject_id), None)
    if entry is None:
        entry = {"subjectId": subject_id, "topic": topic}
        prog.append(entry)
    entry.update({"status": status,
                  "masteryLevel": mastery_level,
                  "lastStudied": today})

    weak = doc.setdefault("weakTopics", [])
    if weakness_level:
        w = next((x for x in weak
                  if x["topic"] == topic and x["subjectId"] == subject_id), None)
        if w is None:
            w = {"subjectId": subject_id, "topic": topic}
            weak.append(w)
        w.update({"weaknessLevel": weakness_level,
                  "reason": reason or "",
                  "lastEvaluated": today})
    elif mastery_level >= 70:
        doc["weakTopics"] = [x for x in weak
                             if not (x["topic"] == topic
                                     and x["subjectId"] == subject_id)]

    students.replace_item(item=student_id, body=doc)
    return {"progress": doc["progress"], "weakTopics": doc["weakTopics"]}


def save_quiz_result(activity, student_id, subject_id, topic,
                     score, total_questions, difficulty, weak_concepts):
    doc = {
        "id": f"quiz-{uuid.uuid4().hex[:8]}",
        "docType": "quizResult",
        "studentId": student_id,
        "subjectId": subject_id,
        "topic": topic,
        "difficulty": difficulty,
        "score": score,
        "totalQuestions": total_questions,
        "weakConceptsIdentified": weak_concepts,
        "completedAt": datetime.now(timezone.utc).isoformat(),
    }
    activity.create_item(body=doc)
    return doc


def create_study_plan(activity, student_id, recommended_topics, reason):
    doc = {
        "id": f"plan-{uuid.uuid4().hex[:8]}",
        "docType": "studyPlan",
        "studentId": student_id,
        "date": date.today().isoformat(),
        "recommendedTopics": recommended_topics,
        "reason": reason,
        "completed": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    activity.create_item(body=doc)
    return doc