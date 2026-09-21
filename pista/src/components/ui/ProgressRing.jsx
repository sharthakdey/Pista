import { useEffect, useId, useState } from "react";
import { clamp } from "../../utils/format.js";

export default function ProgressRing({ value = 0, size = 180, stroke = 14, children, label = "Progress" }) {
  const [shown, setShown] = useState(0);
  const gid = useId().replace(/:/g, "");
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(clamp(value)));
    return () => cancelAnimationFrame(t);
  }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}
      role="img" aria-label={`${label}: ${Math.round(value)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2F7BFF" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDEFF7" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (shown / 100) * c}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.3,.7,.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
