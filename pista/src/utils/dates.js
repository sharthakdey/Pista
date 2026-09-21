const DAY = 86_400_000;

export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function offsetDate(dayOffset, hour = 9) {
  const d = startOfDay();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/** Whole calendar days from today until `iso` (0 = today, negative = past). */
export function daysUntil(iso) {
  return Math.round((startOfDay(new Date(iso)) - startOfDay()) / DAY);
}

export function formatDate(iso, opts = { month: "long", day: "numeric" }) {
  return new Date(iso).toLocaleDateString(undefined, opts);
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function relativeDay(iso) {
  const n = daysUntil(iso);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  if (n < 0) return `${-n} days ago`;
  return `In ${n} days`;
}

export function daysLeftLabel(iso) {
  const n = daysUntil(iso);
  if (n < 0) return "Finished";
  if (n === 0) return "Today";
  if (n === 1) return "1 day left";
  return `${n} days left`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
