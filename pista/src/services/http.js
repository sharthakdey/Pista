import { API_BASE_URL, API_TIMEOUT_MS } from "../config.js";

/**
 * Error type used across the app. `userMessage` is always safe to show;
 * raw backend details stay in `details` (logged, never rendered).
 */
export class ApiError extends Error {
  constructor({ status = 0, code = "UNKNOWN", userMessage, details } = {}) {
    super(userMessage || "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.userMessage = userMessage || friendlyMessage(status);
    this.details = details;
  }
}

function friendlyMessage(status) {
  if (status === 0) return "PISTA couldn't connect to the study service. Check your connection and try again.";
  if (status === 401 || status === 403) return "PISTA couldn't confirm your student profile. Refresh the page and try again.";
  if (status === 404) return "PISTA couldn't find what you were looking for.";
  if (status === 413) return "That file is too large to upload.";
  if (status === 429) return "PISTA is getting a lot of requests. Wait a moment and try again.";
  if (status >= 500) return "PISTA couldn't connect to the study service. Please try again.";
  return "Something went wrong with that request. Please try again.";
}

const STUDENT_ID_KEY = "pista:student-id";
export function getStudentId() {
  try { return localStorage.getItem(STUDENT_ID_KEY) || ""; } catch { return ""; }
}
export function setStudentId(id) {
  try { localStorage.setItem(STUDENT_ID_KEY, id); } catch { /* ignore */ }
}

// ✅ ONLY ONE buildHeaders function with auth token support
function buildHeaders(extra = {}, json = true) {
  const headers = { Accept: "application/json", ...extra };
  if (json) headers["Content-Type"] = "application/json";
  const studentId = getStudentId();
  if (studentId) headers["X-Student-Id"] = studentId;
  
  // Auth token support
  try {
    const token = localStorage.getItem("pista:token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch { /* ignore */ }
  
  return headers;
}

/**
 * JSON request helper with timeout + abort support.
 * @param {string} path  e.g. "/exams"
 * @param {{method?: string, body?: any, query?: object, signal?: AbortSignal, timeout?: number}} opts
 */
export async function request(path, { method = "GET", body, query, signal, timeout = API_TIMEOUT_MS } = {}) {
  if (!API_BASE_URL) {
    throw new ApiError({ code: "NO_BACKEND", userMessage: "PISTA isn't connected to a study service yet. Turn on Demo Mode in Settings or set VITE_API_BASE_URL." });
  }
  const url = new URL(API_BASE_URL + path);
  if (query) Object.entries(query).forEach(([k, v]) => v != null && url.searchParams.set(k, v));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), timeout);
  const onAbort = () => controller.abort(signal.reason);
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(url, {
      method,
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    const data = text ? safeJson(text) : null;
    if (!res.ok) {
      console.warn(`[PISTA API] ${method} ${path} → ${res.status}`, data);
      throw new ApiError({ status: res.status, code: data?.code, details: data });
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err?.name === "AbortError" && signal?.aborted) {
      throw new ApiError({ code: "ABORTED", userMessage: "Request stopped." });
    }
    if (err?.name === "TimeoutError" || controller.signal.reason?.name === "TimeoutError") {
      throw new ApiError({ code: "TIMEOUT", userMessage: "PISTA took too long to respond. Please try again." });
    }
    console.warn(`[PISTA API] ${method} ${path} failed`, err);
    throw new ApiError({ status: 0, code: "NETWORK", details: String(err) });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

/**
 * Multipart upload with progress (fetch has no upload progress, so XHR is used).
 * @param {string} path
 * @param {FormData} formData
 * @param {(percent:number)=>void} onProgress
 */
export function upload(path, formData, onProgress) {
  return new Promise((resolve, reject) => {
    if (!API_BASE_URL) {
      reject(new ApiError({ code: "NO_BACKEND", userMessage: "PISTA isn't connected to a study service yet." }));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", API_BASE_URL + path);
    Object.entries(buildHeaders({}, false)).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      const data = xhr.responseText ? safeJson(xhr.responseText) : null;
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new ApiError({ status: xhr.status, details: data }));
    };
    xhr.onerror = () => reject(new ApiError({ status: 0, code: "NETWORK" }));
    xhr.send(formData);
  });
}