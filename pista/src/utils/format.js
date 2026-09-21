export const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
export const pct = (n) => `${Math.round(clamp(Number(n) || 0))}%`;

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "S";
}

/** Mastery → priority bucket used for weak-topic styling. */
export function priorityFor(mastery) {
  if (mastery < 50) return "high";
  if (mastery < 60) return "medium";
  return "low";
}

export const PRIORITY_META = {
  high: { label: "High priority", dot: "bg-coral-500", text: "text-coral-600", bg: "bg-coral-50", bar: "bg-coral-500" },
  medium: { label: "Needs practice", dot: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-500" },
  low: { label: "Improving", dot: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50", bar: "bg-yellow-400" },
};

/** Colour for a 0–100 value on progress bars. */
export function toneFor(value) {
  if (value < 50) return "coral";
  if (value < 70) return "amber";
  return "brand";
}

export const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

export const fileTypeOf = (name = "") => (name.split(".").pop() || "").toLowerCase();

/** Upload rules shared by the Materials page (pre-check) and the demo adapter. */
export const UPLOAD_TYPES = ["pdf", "ppt", "pptx", "doc", "docx", "txt"];
export const MAX_UPLOAD_MB = 50;
export function validateUpload(file) {
  const type = fileTypeOf(file?.name);
  if (!UPLOAD_TYPES.includes(type)) return "PISTA can read PDF, PPT, PPTX, DOC, DOCX and TXT files. Choose a file in one of those formats.";
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `That file is larger than ${MAX_UPLOAD_MB} MB. Split it or compress it, then upload again.`;
  if (file.size === 0) return "That file is empty. Choose a file with some content.";
  return null;
}
