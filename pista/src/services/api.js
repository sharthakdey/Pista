/**
 * PISTA API layer — the only place the UI talks to the backend.
 *
 * Every function has two implementations:
 *   • Live: calls the Python backend at VITE_API_BASE_URL (routes in ENDPOINTS below).
 *   • Demo: calls ./demoAdapter.js, which serves sample data for student "Harman".
 * Pages never know which one they got. To connect the real backend, set
 * VITE_API_BASE_URL and make the backend return the shapes documented here.
 */
import { DEMO_MODE } from "../config.js";
import { request, upload } from "./http.js";
import * as demo from "./demoAdapter.js";

export const ENDPOINTS = {
  student: "/students/me",
  students: "/students",
  exams: "/exams",
  progress: "/progress",
  recommendation: "/recommendations/today",
  quizzes: "/quizzes",
  quizSubmit: (quizId) => `/quizzes/${encodeURIComponent(quizId)}/submit`,
  quizHistory: "/quizzes/history",
  chat: "/chat",
  materials: "/materials",
};

/* ───────────────────────── Student ───────────────────────── */

/**
 * @returns {Promise<{
 *   id: string, name: string, program?: string, semester?: string,
 *   subjects: {id: string, name: string, progress: number}[],
 *   preferences: {explanationStyle: string, sessionLength: number, dailyGoalMinutes: number},
 *   stats: {streakDays: number, studyHours: number, quizzesTaken: number, topicsMastered: number}
 * }>}
 */
export function getStudent() {
  return DEMO_MODE ? demo.getStudent() : request(ENDPOINTS.student);
}

/** @param {{name: string, subjects?: string[], preferences?: object}} payload */
export function createStudent(payload) {
  return DEMO_MODE ? demo.createStudent(payload) : request(ENDPOINTS.students, { method: "POST", body: payload });
}

/** @param {Partial<{name: string, preferences: object}>} patch */
export function updateStudent(patch) {
  return DEMO_MODE ? demo.updateStudent(patch) : request(ENDPOINTS.student, { method: "PATCH", body: patch });
}

/* ───────────────────────── Exams ───────────────────────── */

/**
 * @returns {Promise<{id: string, subject: string, title?: string, date: string, preparedness: number, topics?: string[]}[]>}
 *   `date` is an ISO 8601 date string. Sorted by the UI, so any order is fine.
 */
export function getExams() {
  return DEMO_MODE ? demo.getExams() : request(ENDPOINTS.exams);
}

/** @param {{subject: string, title?: string, date: string, topics?: string[]}} exam */
export function addExam(exam) {
  return DEMO_MODE ? demo.addExam(exam) : request(ENDPOINTS.exams, { method: "POST", body: exam });
}

/* ───────────────────────── Progress ───────────────────────── */

/**
 * @returns {Promise<{
 *   overall: number,
 *   subjects: {id: string, name: string, progress: number}[],
 *   topics: {id: string, name: string, subject: string, mastery: number}[],
 *   weakTopics: {topic: string, subject: string, mastery: number, priority: "high"|"medium"|"low"}[],
 *   quizHistory: {id: string, date: string, topic: string, subject: string, score: number}[],
 *   streakDays: number
 * }>}
 */
export function getProgress() {
  return DEMO_MODE ? demo.getProgress() : request(ENDPOINTS.progress);
}

/** @param {{topic: string, subject: string, mastery?: number, minutesStudied?: number}} update */
export function updateProgress(update) {
  return DEMO_MODE ? demo.updateProgress(update) : request(ENDPOINTS.progress, { method: "PATCH", body: update });
}

/**
 * Today's personalized study recommendation (computed by the agent from exams, progress and quiz results).
 * @returns {Promise<{
 *   kind: "focus"|"review", subject: string, topic: string, title: string, message: string,
 *   reasons: {type: "exam"|"progress"|"quiz"|"weak", label: string}[],
 *   action: {label: string, prompt: string}
 * }>}
 */
export function getRecommendation() {
  return DEMO_MODE ? demo.getRecommendation() : request(ENDPOINTS.recommendation);
}

/* ───────────────────────── Quiz ───────────────────────── */

/**
 * @param {{subject: string, topic: string, difficulty: "easy"|"medium"|"hard", numQuestions: number}} params
 * @returns {Promise<{quizId: string, subject: string, topic: string, difficulty: string,
 *   questions: {id: string, question: string, options: string[], subtopic?: string}[], note?: string}>}
 *   Answers are NOT sent to the browser; the backend grades in submitQuiz.
 */
/** Alias matching the backend naming: generateQuiz === createQuiz. */
export function generateQuiz(params) {
  return createQuiz(params);
}

export function createQuiz(params) {
  return DEMO_MODE ? demo.createQuiz(params) : request(ENDPOINTS.quizzes, { method: "POST", body: params });
}

/**
 * @param {string} quizId
 * @param {Record<string, number>} answers  questionId → selected option index
 * @returns {Promise<{
 *   quizId: string, topic: string, subject: string, correctCount: number, total: number, percentage: number,
 *   topicPerformance: {topic: string, correct: number, total: number, accuracy: number}[],
 *   weakAreas: {topic: string, accuracy: number}[],
 *   weakTopicIdentified: boolean,
 *   review: {questionId: string, question: string, options: string[], selected: number|null, correct: number, isCorrect: boolean, explanation: string}[],
 *   progressUpdate?: {topic: string, previous: number, current: number},
 *   recommendation: {title: string, message: string, actionLabel: string, prompt: string}
 * }>}
 */
export function submitQuiz(quizId, answers) {
  return DEMO_MODE ? demo.submitQuiz(quizId, answers) : request(ENDPOINTS.quizSubmit(quizId), { method: "POST", body: { answers } });
}

/** @returns {Promise<{id: string, date: string, topic: string, subject: string, score: number}[]>} */
export function getQuizHistory() {
  return DEMO_MODE ? demo.getQuizHistory() : request(ENDPOINTS.quizHistory);
}

/* ───────────────────────── Chat ───────────────────────── */

/**
 * Sends a message to the PISTA tutor agent (Foundry agent + RAG on the backend).
 * @param {{message: string, conversationId?: string, history?: {role: "user"|"assistant", content: string}[]}} payload
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<{
 *   conversationId: string,
 *   reply: string,                               // Markdown (GFM + $math$)
 *   sources: ("course_material"|"general_knowledge"|"personalized")[],
 *   citations?: {title: string, location?: string}[],
 *   action?: {type: "quiz", subject: string, topic: string, difficulty: string, numQuestions: number}
 * }>}
 */
export function sendMessage(payload, opts = {}) {
  return DEMO_MODE ? demo.sendMessage(payload, opts) : request(ENDPOINTS.chat, { method: "POST", body: payload, signal: opts.signal });
}

/* ───────────────────────── Materials ───────────────────────── */

/**
 * @returns {Promise<{id: string, fileName: string, subject: string, fileType: string, sizeBytes?: number,
 *   uploadedAt: string, status: "processing"|"processed"|"failed", searchable: boolean}[]>}
 */
export function getMaterials() {
  return DEMO_MODE ? demo.getMaterials() : request(ENDPOINTS.materials);
}

/**
 * @param {File} file
 * @param {{subject: string}} meta
 * @param {(percent: number) => void} onProgress
 * @returns {Promise<object>} the created material (same shape as getMaterials items)
 */
export function uploadMaterial(file, meta, onProgress) {
  if (DEMO_MODE) return demo.uploadMaterial(file, meta, onProgress);
  const form = new FormData();
  form.append("file", file);
  form.append("subject", meta.subject);
  return upload(ENDPOINTS.materials, form, onProgress);
}

/**
 * Deletes a material from Azure and the vector store.
 * @param {string} materialId 
 */
export function deleteMaterial(materialId) {
  if (DEMO_MODE) {
    // If in demo mode, just resolve immediately
    return demo.deleteMaterial ? demo.deleteMaterial(materialId) : Promise.resolve();
  }
  return request(`${ENDPOINTS.materials}/${encodeURIComponent(materialId)}`, { method: "DELETE" });
}

/** Demo-only helper used by Settings. */
export function resetDemoData() {
  return demo.resetDemoState();
}
