import PistaOrb from "./PistaOrb.jsx";

export default function TypingIndicator() {
  return (
    <div className="flex animate-fade-in items-start gap-3" role="status" aria-live="polite">
      <PistaOrb pulse />
      <div className="rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 animate-dot rounded-full bg-gradient-to-br from-electric-500 to-violet-500" style={{ animationDelay: `${i * 0.16}s` }} />
            ))}
          </span>
          <span className="text-sm font-medium text-muted">PISTA is thinking...</span>
        </div>
      </div>
    </div>
  );
}
