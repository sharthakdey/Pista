import { clamp, toneFor } from "../../utils/format.js";

const TONES = {
  brand: "bg-gradient-to-r from-electric-500 to-violet-500",
  coral: "bg-coral-500",
  amber: "bg-amber-500",
  mint: "bg-mint-500",
  white: "bg-white",
};

export default function ProgressBar({ value = 0, tone, size = "md", className = "", label }) {
  const v = clamp(value);
  const t = tone || toneFor(v);
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  return (
    <div
      className={`w-full overflow-hidden rounded-full ${tone === "white" ? "bg-white/15" : "bg-ink-900/[.06]"} ${h} ${className}`}
      role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}
    >
      <div className={`h-full rounded-full transition-[width] duration-700 ease-out ${TONES[t]}`} style={{ width: `${v}%` }} />
    </div>
  );
}
