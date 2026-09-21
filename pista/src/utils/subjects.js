/** Visual identity per subject. Unknown subjects get a stable colour from the palette. */
const PALETTE = [
  { dot: "bg-electric-500", soft: "bg-electric-500/10", text: "text-electric-600", hex: "#2F7BFF" },
  { dot: "bg-violet-500", soft: "bg-violet-500/10", text: "text-violet-600", hex: "#8B5CF6" },
  { dot: "bg-mint-500", soft: "bg-mint-500/10", text: "text-mint-600", hex: "#16A765" },
  { dot: "bg-amber-500", soft: "bg-amber-500/10", text: "text-amber-600", hex: "#F09A0A" },
  { dot: "bg-coral-500", soft: "bg-coral-500/10", text: "text-coral-600", hex: "#E8475F" },
];
const KNOWN = {
  cn: 0, os: 1, dbms: 2, ml: 3,
  "computer networks": 0, "operating systems": 1, "machine learning": 3,
};

export function subjectStyle(idOrName = "") {
  const key = String(idOrName).toLowerCase();
  if (key in KNOWN) return PALETTE[KNOWN[key]];
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
