/**
 * Demo Mode backend. Implements the same functions as services/api.js using
 * in-browser state seeded from data/demoData.js. Quiz results genuinely change
 * topic mastery, weak topics and the daily recommendation, so the full demo flow
 * behaves like the real system would. Delete this file's usage once the backend is live.
 */
import {
  DEMO_STUDENT, DEMO_SUBJECTS, DEMO_TOPICS, DEMO_EXAMS, DEMO_QUIZ_HISTORY,
  DEMO_MATERIALS, QUESTION_BANKS, SUBJECT_FALLBACK_BANK,
} from "../data/demoData.js";
import { LESSONS, matchIntent, TOPIC_KEYWORDS } from "../data/demoTutor.js";
import { offsetDate, daysUntil, startOfDay } from "../utils/dates.js";
import { priorityFor, uid, fileTypeOf, UPLOAD_TYPES, validateUpload } from "../utils/format.js";
import { ApiError } from "./http.js";

const STORAGE_KEY = "pista:demo-state:v1";
const WEAK_THRESHOLD = 65;
const ALLOWED_TYPES = UPLOAD_TYPES;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

/* ───────────── state ───────────── */

function seed() {
  return {
    seededOn: startOfDay().toISOString(),
    student: structuredClone(DEMO_STUDENT),
    subjects: structuredClone(DEMO_SUBJECTS),
    topics: structuredClone(DEMO_TOPICS),
    exams: DEMO_EXAMS.map(({ dayOffset, hour, ...e }) => ({ ...e, date: offsetDate(dayOffset, hour) })),
    quizHistory: DEMO_QUIZ_HISTORY.map(({ dayOffset, ...q }) => ({ ...q, date: offsetDate(dayOffset, 18) })),
    materials: DEMO_MATERIALS.map(({ dayOffset, ...m }) => ({
      ...m, uploadedAt: offsetDate(dayOffset, 11), searchable: m.status === "processed",
    })),
    lastQuiz: null,
    quizzes: {},
  };
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Re-seed on a new day so countdowns ("4 days left") stay true to the demo script.
      if (parsed.seededOn === startOfDay().toISOString()) return parsed;
    }
  } catch { /* fall through */ }
  return seed();
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function resetDemoState() {
  state = seed();
  save();
  return Promise.resolve(true);
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new ApiError({ code: "ABORTED", userMessage: "Request stopped." }));
    });
  });
}
const jitter = (base) => base + Math.round(Math.random() * base * 0.4);
const clone = (x) => structuredClone(x);

/* ───────────── derived data ───────────── */

const subjectName = (id) => state.subjects.find((s) => s.id === id)?.name || id;

function subjectProgress(id) {
  const ts = state.topics.filter((t) => t.subject === id);
  if (!ts.length) return 0;
  return Math.round(ts.reduce((a, t) => a + t.mastery, 0) / ts.length);
}

function nextExamFor(subjectId) {
  return state.exams
    .filter((e) => e.subject === subjectId && daysUntil(e.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
}

function urgency(topic) {
  const exam = nextExamFor(topic.subject);
  const days = exam ? daysUntil(exam.date) : 60;
  return topic.mastery + days * 2;
}

function weakTopics() {
  return state.topics
    .filter((t) => t.mastery < WEAK_THRESHOLD)
    .sort((a, b) => urgency(a) - urgency(b))
    .map((t) => {
      const exam = nextExamFor(t.subject);
      return {
        id: t.id, topic: t.name, subject: subjectName(t.subject), subjectId: t.subject,
        mastery: t.mastery, priority: priorityFor(t.mastery),
        examInDays: exam ? daysUntil(exam.date) : null,
      };
    });
}

function lastQuizFor(topicName) {
  return [...state.quizHistory].reverse().find((q) => q.topic === topicName);
}

function examReason(subjectId) {
  const exam = nextExamFor(subjectId);
  if (!exam) return null;
  const d = daysUntil(exam.date);
  const label = d === 0 ? "Exam today" : d === 1 ? "Exam tomorrow" : `Exam in ${d} days`;
  return { type: "exam", label };
}

function teachPrompt(topic) {
  return `Teach me ${topic === "ARQ Protocols" ? "ARQ protocols" : topic}`;
}

function computeRecommendation() {
  const lq = state.lastQuiz;
  if (lq && lq.weak) {
    const t = state.topics.find((x) => x.name === lq.topic);
    return {
      kind: "review",
      subject: subjectName(lq.subject),
      topic: lq.topic,
      title: `Review ${lq.topic}`,
      message: "Your recent quiz shows this topic needs more practice.",
      reasons: [
        { type: "quiz", label: `Latest quiz: ${lq.score}%` },
        { type: "progress", label: `Topic progress: ${t?.mastery ?? lq.mastery}% (was ${lq.previousMastery}%)` },
        examReason(lq.subject),
        { type: "weak", label: "Still a weak topic" },
      ].filter(Boolean),
      action: {
        label: "Start Review",
        prompt: lq.topic === "ARQ Protocols" ? "Explain ARQ protocols simply" : teachPrompt(lq.topic),
      },
    };
  }

  const [top] = weakTopics();
  if (!top) {
    return {
      kind: "focus", subject: "All subjects", topic: "Mixed revision",
      title: "Keep your streak going with mixed revision",
      message: "No weak topics right now. A short mixed quiz keeps everything fresh.",
      reasons: [{ type: "progress", label: "All topics above 65%" }],
      action: { label: "Start Learning", prompt: "Create a quiz for me" },
    };
  }
  const quiz = lastQuizFor(top.topic);
  const message = lq && !lq.weak
    ? `Nice work on ${lq.topic}. Next, strengthen ${top.topic}.`
    : "Your exam is close and this topic has the most room to grow.";
  return {
    kind: "focus",
    subject: top.subject,
    topic: top.topic,
    title: `Focus on ${top.subject} — ${top.topic}`,
    message,
    reasons: [
      examReason(top.subjectId),
      { type: "progress", label: `Topic progress: ${top.mastery}%` },
      { type: "quiz", label: quiz ? `Recent quiz accuracy: ${quiz.score}%` : "No quiz on this topic yet" },
      top.mastery < 60 ? { type: "weak", label: "Identified as a weak topic" } : null,
    ].filter(Boolean),
    action: { label: "Start Learning", prompt: teachPrompt(top.topic) },
  };
}

function subjectsWithProgress() {
  return state.subjects.map((s) => ({ id: s.id, name: s.name, progress: subjectProgress(s.id) }));
}

/* ───────────── Student ───────────── */

export async function getStudent() {
  await wait(jitter(350));
  const stats = { ...state.student.stats, quizzesTaken: state.quizHistory.length,
    topicsMastered: state.topics.filter((t) => t.mastery >= 80).length };
  return clone({ ...state.student, stats, subjects: subjectsWithProgress() });
}

export async function createStudent(payload) {
  await wait(400);
  state.student = { ...state.student, ...payload, id: state.student.id };
  save();
  return getStudent();
}

export async function updateStudent(patch) {
  await wait(350);
  state.student = {
    ...state.student,
    ...patch,
    preferences: { ...state.student.preferences, ...(patch.preferences || {}) },
  };
  save();
  return getStudent();
}

/* ───────────── Exams ───────────── */

export async function getExams() {
  await wait(jitter(350));
  return clone(state.exams.map((e) => ({
    ...e,
    subjectId: e.subject,
    subject: subjectName(e.subject),
    preparedness: subjectProgress(e.subject),
    topics: state.topics.filter((t) => t.subject === e.subject).map((t) => t.name),
  })));
}

export async function addExam({ subject, title, date }) {
  await wait(500);
  if (!subject || !date) throw new ApiError({ status: 400, userMessage: "Add a subject and a date for the exam." });
  let s = state.subjects.find((x) => x.id === subject || x.name.toLowerCase() === String(subject).toLowerCase());
  if (!s) {
    s = { id: uid("sub"), name: String(subject).trim() };
    state.subjects.push(s);
  }
  const exam = { id: uid("ex"), subject: s.id, title: title || "Exam", date: new Date(date).toISOString() };
  state.exams.push(exam);
  save();
  return clone({ ...exam, subject: s.name, subjectId: s.id, preparedness: subjectProgress(s.id), topics: [] });
}

/* ───────────── Progress ───────────── */

export async function getProgress() {
  await wait(jitter(450));
  const subjects = subjectsWithProgress();
  const withTopics = subjects.filter((s) => state.topics.some((t) => t.subject === s.id));
  const overall = withTopics.length
    ? Math.round(withTopics.reduce((a, s) => a + s.progress, 0) / withTopics.length) : 0;
  return clone({
    overall,
    subjects,
    topics: state.topics.map((t) => ({ ...t, subjectId: t.subject, subject: subjectName(t.subject) })),
    weakTopics: weakTopics(),
    quizHistory: state.quizHistory.map((q) => ({ ...q, subjectId: q.subject, subject: subjectName(q.subject) })),
    streakDays: state.student.stats.streakDays,
  });
}

export async function updateProgress({ topic, mastery }) {
  await wait(300);
  const t = state.topics.find((x) => x.name === topic || x.id === topic);
  if (!t) throw new ApiError({ status: 404 });
  if (typeof mastery === "number") t.mastery = Math.max(0, Math.min(100, Math.round(mastery)));
  save();
  return clone(t);
}

export async function getRecommendation() {
  await wait(jitter(500));
  return clone(computeRecommendation());
}

/* ───────────── Quiz ───────────── */

function resolveBank(topic, subject) {
  if (QUESTION_BANKS[topic]) return { name: topic, bank: QUESTION_BANKS[topic], exact: true };
  const subjId = state.subjects.find((s) => s.id === subject || s.name === subject)?.id;
  const name = SUBJECT_FALLBACK_BANK[subjId] || "ARQ Protocols";
  return { name, bank: QUESTION_BANKS[name], exact: false };
}

export async function createQuiz({ subject, topic, difficulty = "medium", numQuestions = 5 }) {
  await wait(jitter(1500));
  const { name, bank, exact } = resolveBank(topic, subject);
  const selected = bank.slice(0, numQuestions);
  const quizId = uid("quiz");
  const t = state.topics.find((x) => x.name === name);
  state.quizzes = { [quizId]: { topic: name, subject: t?.subject || "cn", questionIds: selected.map((q) => q.id) } };
  save();

  let note;
  if (!exact) note = `Demo question bank: showing ${name} questions for this subject.`;
  else if (numQuestions > bank.length) note = `The demo question bank has ${bank.length} questions for this topic.`;

  return {
    quizId,
    subject: subjectName(t?.subject || subject),
    topic: name,
    difficulty,
    note,
    // Answers and explanations stay "server-side".
    questions: selected.map(({ id, question, options, subtopic }) => ({ id, question, options, subtopic })),
  };
}

export async function submitQuiz(quizId, answers) {
  await wait(jitter(1100));
  const quiz = state.quizzes?.[quizId];
  if (!quiz) throw new ApiError({ status: 404, userMessage: "This quiz has expired. Generate a new one to continue." });

  const bank = QUESTION_BANKS[quiz.topic];
  const questions = quiz.questionIds.map((id) => bank.find((q) => q.id === id));
  const review = questions.map((q) => {
    const selected = answers?.[q.id] ?? null;
    return {
      questionId: q.id, question: q.question, options: q.options, subtopic: q.subtopic,
      selected, correct: q.answer, isCorrect: selected === q.answer, explanation: q.explanation,
    };
  });
  const correctCount = review.filter((r) => r.isCorrect).length;
  const total = review.length;
  const percentage = Math.round((correctCount / total) * 100);

  const bySub = {};
  review.forEach((r) => {
    bySub[r.subtopic] ??= { topic: r.subtopic, correct: 0, total: 0 };
    bySub[r.subtopic].total += 1;
    if (r.isCorrect) bySub[r.subtopic].correct += 1;
  });
  const topicPerformance = Object.values(bySub).map((s) => ({ ...s, accuracy: Math.round((s.correct / s.total) * 100) }));
  const weakAreas = topicPerformance.filter((s) => s.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy);
  const weak = percentage < 70;

  // Update learning state.
  const topic = state.topics.find((t) => t.name === quiz.topic);
  const previous = topic?.mastery ?? 0;
  if (topic) topic.mastery = Math.round(previous * 0.6 + percentage * 0.4);
  state.quizHistory.push({ id: uid("qh"), date: new Date().toISOString(), topic: quiz.topic, subject: quiz.subject, score: percentage });
  state.lastQuiz = { topic: quiz.topic, subject: quiz.subject, score: percentage, weak, previousMastery: previous, mastery: topic?.mastery ?? previous };
  delete state.quizzes[quizId];
  save();

  const focus = weakAreas[0]?.topic || quiz.topic;
  return clone({
    quizId,
    topic: quiz.topic,
    subject: subjectName(quiz.subject),
    correctCount,
    total,
    percentage,
    topicPerformance,
    weakAreas,
    weakTopicIdentified: weak,
    review,
    progressUpdate: { topic: quiz.topic, previous, current: topic?.mastery ?? previous },
    recommendation: weak
      ? {
          title: "PISTA's Recommendation",
          message: `Review ${focus} before attempting another quiz.`,
          actionLabel: "Study Weak Topics",
          prompt: quiz.topic === "ARQ Protocols" ? "Explain ARQ protocols simply" : teachPrompt(quiz.topic),
        }
      : {
          title: "PISTA's Recommendation",
          message: weakAreas.length
            ? `Strong result. A quick look at ${focus} will make it airtight.`
            : `Strong result on ${quiz.topic}. You're ready to move to your next weak topic.`,
          actionLabel: "See what's next",
          prompt: "What should I study today?",
        },
  });
}

export async function getQuizHistory() {
  await wait(jitter(300));
  return clone(state.quizHistory.map((q) => ({ ...q, subject: subjectName(q.subject) })));
}

/* ───────────── Chat ───────────── */

function topicFromText(text) {
  return TOPIC_KEYWORDS.find((k) => k.re.test(text));
}

function topicFromHistory(history = []) {
  for (let i = history.length - 1; i >= 0; i--) {
    const hit = topicFromText(history[i].content || "");
    if (hit) return hit;
  }
  return null;
}

function todayReply() {
  const rec = computeRecommendation();
  const minutes = state.student.preferences.sessionLength || 45;
  const a = Math.round(minutes * 0.35), b = Math.round(minutes * 0.4), c = minutes - a - b;
  return {
    sources: ["personalized"],
    reply: `## Today's plan: ${rec.topic}

**${rec.title}.** ${rec.message}

Why this topic:
${rec.reasons.map((r) => `- ${r.label}`).join("\n")}

A ${minutes}-minute session that fits your preferences:

1. **${a} min**: learn the core ideas with me. Say *"${rec.action.prompt}"*.
2. **${b} min**: work through the examples in your notes.
3. **${c} min**: take a short quiz so I can track what stuck.`,
  };
}

function weakReply() {
  const list = weakTopics().slice(0, 4);
  if (!list.length) return { sources: ["personalized"], reply: "You have no weak topics right now. Everything is above 65%." };
  const lines = list.map((w, i) =>
    `${i + 1}. **${w.topic}** (${w.subject}): ${w.mastery}% mastery${w.examInDays != null ? `, exam in ${w.examInDays} days` : ""}`
  );
  return {
    sources: ["personalized"],
    reply: `## Your weakest topics right now

${lines.join("\n")}

I rank these by **mastery and how soon the exam is**, so **${list[0].topic}** comes first. Say *"${teachPrompt(list[0].topic)}"* to start there.`,
  };
}

export async function sendMessage({ message, conversationId, history = [] }, { signal } = {}) {
  const intent = matchIntent(message);
  await wait(jitter(intent === "arq" ? 1400 : 1000), signal);
  const cid = conversationId || uid("conv");
  const base = { conversationId: cid, citations: [] };

  switch (intent) {
    case "arq": return { ...base, ...LESSONS.arq };
    case "arqSimple": return { ...base, ...LESSONS.arqSimple };
    case "tcp": return { ...base, ...LESSONS.tcp };
    case "deadlocks": return { ...base, ...LESSONS.deadlocks };
    case "explainWhich": return { ...base, ...LESSONS.explainWhich };
    case "today": return { ...base, ...todayReply() };
    case "weak": return { ...base, ...weakReply() };
    case "simpleContext": {
      const t = topicFromHistory(history);
      if (t?.topic === "ARQ Protocols") return { ...base, ...LESSONS.arqSimple };
      return { ...base, ...LESSONS.explainWhich };
    }
    case "quiz": {
      const t = topicFromText(message) || topicFromHistory(history) || (() => {
        const rec = computeRecommendation();
        return { topic: rec.topic, subject: state.topics.find((x) => x.name === rec.topic)?.subject || "cn" };
      })();
      const bank = QUESTION_BANKS[t.topic] || QUESTION_BANKS["ARQ Protocols"];
      const topicName = QUESTION_BANKS[t.topic] ? t.topic : "ARQ Protocols";
      const subs = [...new Set(bank.map((q) => q.subtopic))];
      return {
        ...base,
        sources: ["personalized"],
        reply: `Your quiz on **${topicName}** is ready: **5 questions** at medium difficulty, covering ${subs.join(", ")}.\n\nWhen you submit, I'll grade it and update your progress and weak topics.`,
        action: { type: "quiz", subject: subjectName(t.subject), topic: topicName, difficulty: "medium", numQuestions: 5 },
      };
    }
    default: return { ...base, ...LESSONS.fallback };
  }
}

/* ───────────── Materials ───────────── */

export async function getMaterials() {
  await wait(jitter(350));
  const now = Date.now();
  let changed = false;
  state.materials.forEach((m) => {
    if (m.status === "processing" && m.readyAt && now >= m.readyAt) {
      m.status = "processed"; m.searchable = true; changed = true;
    }
  });
  if (changed) save();
  return clone(
    [...state.materials]
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .map(({ readyAt, ...m }) => ({ ...m, subjectId: m.subject, subject: subjectName(m.subject) }))
  );
}

export async function uploadMaterial(file, { subject }, onProgress) {
  const type = fileTypeOf(file.name);
  const invalid = validateUpload(file);
  if (invalid && !ALLOWED_TYPES.includes(type)) throw new ApiError({ status: 415, userMessage: invalid });
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError({ status: 413, userMessage: "That file is larger than 50 MB. Split it or compress it, then upload again." });
  }
  const steps = 14;
  for (let i = 1; i <= steps; i++) {
    await wait(90 + Math.random() * 90);
    onProgress?.(Math.round((i / steps) * 100));
  }
  const s = state.subjects.find((x) => x.id === subject || x.name === subject) || state.subjects[0];
  const material = {
    id: uid("mat"), fileName: file.name, subject: s.id, fileType: type, sizeBytes: file.size,
    uploadedAt: new Date().toISOString(), status: "processing", searchable: false,
    readyAt: Date.now() + 7000,
  };
  state.materials.push(material);
  save();
  const { readyAt, ...out } = material;
  return clone({ ...out, subjectId: s.id, subject: s.name });
}
