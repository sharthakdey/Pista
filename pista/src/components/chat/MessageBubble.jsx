import { memo, useState } from "react";
import { Copy, Check, AlertTriangle, RotateCw } from "lucide-react";
import PistaOrb from "./PistaOrb.jsx";
import MarkdownMessage from "./MarkdownMessage.jsx";
import SourceBadges from "./SourceBadges.jsx";
import QuizActionCard from "./QuizActionCard.jsx";
import { useTypewriter } from "../../hooks/useTypewriter.js";
import Avatar from "../ui/Avatar.jsx";

function AssistantBody({ message, stopRequested, onRevealDone }) {
  const shown = useTypewriter(message.content, {
    enabled: !!message.streaming,
    stopped: stopRequested,
    onDone: (text, stopped) => onRevealDone?.(message.id, text, stopped),
  });
  const done = !message.streaming;
  return (
    <>
      <MarkdownMessage content={shown} />
      {message.stopped && <p className="mt-2 text-xs font-medium text-muted">Response stopped.</p>}
      {done && !message.stopped && (
        <div className="animate-fade-in">
          <QuizActionCard action={message.action} />
          <SourceBadges sources={message.sources} citations={message.citations} />
        </div>
      )}
    </>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <button onClick={copy} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-white hover:text-ink-900"
      aria-label="Copy response">
      {copied ? <Check className="h-3.5 w-3.5 text-mint-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function MessageBubble({ message, studentName, stopRequested, onRevealDone, onRetry }) {
  if (message.role === "user") {
    return (
      <div className="flex animate-fade-in justify-end gap-3">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-brand-600 px-4 py-3 text-[15px] leading-relaxed text-white shadow-glow sm:max-w-[75%]">
          {message.content}
        </div>
        <Avatar name={studentName} size={34} className="hidden sm:inline-grid" />
      </div>
    );
  }

  if (message.error) {
    return (
      <div className="flex animate-fade-in items-start gap-3">
        <PistaOrb />
        <div role="alert" className="flex flex-col gap-3 rounded-2xl rounded-tl-md border border-coral-500/20 bg-coral-50 px-4 py-3 text-sm text-coral-600 sm:flex-row sm:items-center">
          <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />{message.error}</span>
          {message.retryText && (
            <button onClick={() => onRetry(message.retryText)} className="inline-flex items-center gap-1.5 self-start rounded-lg bg-white px-2.5 py-1 font-semibold text-ink-900 shadow-card hover:bg-brand-50">
              <RotateCw className="h-3.5 w-3.5" aria-hidden /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex animate-fade-in items-start gap-3">
      <PistaOrb className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-md border border-line bg-white px-4 py-4 shadow-card sm:px-5">
          <AssistantBody message={message} stopRequested={stopRequested} onRevealDone={onRevealDone} />
        </div>
        {!message.streaming && (
          <div className="mt-1 flex opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
