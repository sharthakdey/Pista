import { AlertTriangle, RotateCw } from "lucide-react";
import Button from "./Button.jsx";

export function ErrorState({ error, onRetry, title = "Something went wrong", compact = false, className = "" }) {
  const message = error?.userMessage || "PISTA couldn't connect to the study service. Please try again.";
  return (
    <div role="alert" className={`card flex flex-col items-center text-center ${compact ? "p-5" : "px-6 py-10"} ${className}`}>
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-50 text-coral-500">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RotateCw} className="mt-5" onClick={onRetry}>Retry</Button>
      )}
    </div>
  );
}

export function EmptyState({ emoji, title, message, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center rounded-2xl border border-dashed border-ink-300/60 bg-white/60 px-6 py-12 text-center ${className}`}>
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-3xl" aria-hidden>{emoji}</div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Centered loading message with the PISTA pulse (used for longer AI operations). */
export function LoadingState({ message, sub, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-14 text-center ${className}`} role="status" aria-live="polite">
      <div className="relative grid h-16 w-16 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
        <span className="relative grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-electric-500 to-violet-500 shadow-glow">
          <span className="h-3 w-3 rounded-full bg-white" />
        </span>
      </div>
      <p className="mt-5 font-display text-lg font-semibold">{message}</p>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}
