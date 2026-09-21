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
    return sorted(exams, key=lambda e: e.get("date") or e.get("examDate") or "")


def get_learning_progress(students, student_id):
    return _read_student(students, student_id).get("progress", [])


def get_weak_topics(students, student_id):
    return _read_student(students, student_id).get("weakTopics", [])


def save_quiz_result(activity, student_id, subject_id, topic, score, total_questions, difficulty, weak_concepts):
    """Save or UPDATE a quiz result. If student already has a result for this topic, replace it."""
    import uuid
    from datetime import datetime, timezone
    
    # Create a unique ID based on student + subject + topic (this is the upsert key)
    composite_id = f"{student_id}_{subject_id}_{topic}".replace(" ", "_").lower()
    
    # Check if a record already exists for this student+subject+topic
    query = "SELECT * FROM c WHERE c.id = @id"
    params = [{"name": "@id", "value": composite_id}]
    existing = list(activity.query_items(query=query, parameters=params, enable_cross_partition_query=True))
    
    quiz_data = {
        "id": composite_id,
        "student_id": student_id,
        "subject_id": subject_id,
        "topic": topic,
        "score": score,
        "total_questions": total_questions,
        "difficulty": difficulty,
        "weak_concepts": weak_concepts or [],
        "date": datetime.now(timezone.utc).isoformat(),
        "percentage": (score / total_questions * 100) if total_questions > 0 else 0,
    }
    
    if existing:
        # UPDATE existing record (replace old score)
        activity.replace_item(item=existing[0]["id"], body=quiz_data)
        print(f"🔄 Updated existing quiz result for {topic}")
    else:
        # CREATE new record
        activity.create_item(body=quiz_data)
        print(f"✨ Created new quiz result for {topic}")
    
    return quiz_data


def update_learning_progress(students, student_id, subject_id, topic, status, mastery_level, weakness_level=None, reason=None):
    """Update a student's mastery for a topic. If topic exists, UPDATE it; otherwise INSERT."""
    # Get the student document
    query = f"SELECT * FROM c WHERE c.id = '{student_id}'"
    student_docs = list(students.query_items(query=query, enable_cross_partition_query=True))
    
    if not student_docs:
        # Create a new student document if none exists
        student_doc = {
            "id": student_id,
            "name": "Student",
            "subjects": [],
            "progress": [],
            "weakTopics": [],
        }
    else:
        student_doc = student_docs[0]
    
    # Initialize arrays if they don't exist
    if "progress" not in student_doc:
        student_doc["progress"] = []
    if "weakTopics" not in student_doc:
        student_doc["weakTopics"] = []
    
    # Find existing progress entry for this subject+topic
    progress_entry = None
    for p in student_doc["progress"]:
        if p.get("subjectId") == subject_id and p.get("topic") == topic:
            progress_entry = p
            break
    
    if progress_entry:
        # UPDATE existing progress
        progress_entry["status"] = status
        progress_entry["masteryLevel"] = mastery_level
        progress_entry["lastStudied"] = datetime.now(timezone.utc).isoformat()
        if weakness_level:
            progress_entry["weaknessLevel"] = weakness_level
        elif "weaknessLevel" in progress_entry:
            del progress_entry["weaknessLevel"]
        print(f"🔄 Updated progress for {topic}: {mastery_level}%")
    else:
        # CREATE new progress entry
        new_entry = {
            "subjectId": subject_id,
            "topic": topic,
            "status": status,
            "masteryLevel": mastery_level,
            "lastStudied": datetime.now(timezone.utc).isoformat(),
        }
        if weakness_level:
            new_entry["weaknessLevel"] = weakness_level
        student_doc["progress"].append(new_entry)
        print(f"✨ Created new progress for {topic}: {mastery_level}%")
    
    # Update weak topics list
    if weakness_level:
        # Add or update in weak topics
        weak_entry = None
        for w in student_doc["weakTopics"]:
            if w.get("topic") == topic and w.get("subjectId") == subject_id:
                weak_entry = w
                break
        
        if weak_entry:
            weak_entry["mastery"] = mastery_level
            weak_entry["priority"] = "high" if weakness_level == "high" else "medium"
            weak_entry["reason"] = reason
        else:
            student_doc["weakTopics"].append({
                "subjectId": subject_id,
                "topic": topic,
                "mastery": mastery_level,
                "priority": "high" if weakness_level == "high" else "medium",
                "reason": reason,
            })
    else:
        # Remove from weak topics if mastery is good (>= 70)
        student_doc["weakTopics"] = [
            w for w in student_doc["weakTopics"]
            if not (w.get("topic") == topic and w.get("subjectId") == subject_id)
        ]
    
    # Save the updated student document
    students.replace_item(item=student_doc["id"], body=student_doc)
    
    return student_doc





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