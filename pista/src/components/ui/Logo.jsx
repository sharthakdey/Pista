import { Link } from "react-router-dom";
import { useId } from "react";

export function LogoMark({ size = 36, className = "" }) {
  // Unique per instance: a shared id would resolve to a copy inside a hidden (display:none) sidebar and not paint.
  const gid = `pista-mark-${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2F7BFF" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#161C44" />
      <rect x=".5" y=".5" width="63" height="63" rx="17.5" fill="none" stroke="rgba(255,255,255,.08)" />
      <path d="M14 46c8 0 10-10 18-10s8-12 18-12" fill="none" stroke={`url(#${gid})`} strokeWidth="5" strokeLinecap="round" />
      <circle cx="14" cy="46" r="4" fill="#5B9BFF" />
      <circle cx="50" cy="24" r="6" fill="#fff" />
      <circle cx="50" cy="24" r="2.5" fill="#8B5CF6" />
    </svg>
  );
}

export default function Logo({ to = "/", light = true, size = 36, showTagline = false }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 rounded-xl" aria-label="PISTA home">
      <LogoMark size={size} />
      <span className="leading-none">
        <span className={`block font-display text-[22px] font-extrabold tracking-[-0.02em] ${light ? "text-white" : "text-ink-900"}`}>PISTA</span>
        {showTagline && <span className={`mt-1 block text-[11px] font-medium ${light ? "text-ink-300" : "text-muted"}`}>Your AI study path</span>}
      </span>
    </Link>
  );
}
