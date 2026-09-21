/** The AI avatar: a small path mark inside a glowing orb. */
export default function PistaOrb({ size = 34, pulse = false, className = "" }) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-electric-500 via-brand-500 to-violet-500 ${pulse ? "animate-pulse-ring" : ""} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56}>
        <path d="M4 17c3 0 4-4 7-4s3-5 7-5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="18" cy="8" r="2.6" fill="#fff" />
      </svg>
    </span>
  );
}
