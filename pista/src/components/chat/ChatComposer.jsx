import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";

/** Auto-growing message box. Enter sends, Shift+Enter adds a new line. */
const ChatComposer = forwardRef(function ChatComposer({ value, onChange, onSend, onStop, busy }, ref) {
  const taRef = useRef(null);
  useImperativeHandle(ref, () => ({ focus: () => taRef.current?.focus() }));

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  }, [value]);

  const submit = (e) => {
    e?.preventDefault();
    if (busy) return;
    if (value.trim()) onSend(value.trim());
  };

  return (
    <div className="rounded-3xl border border-line bg-white p-2 shadow-lift transition focus-within:border-brand-200 focus-within:ring-4 focus-within:ring-brand-100">
      <div className="flex items-end gap-2">
        <label htmlFor="chat-input" className="sr-only">Message PISTA</label>
        <textarea
          id="chat-input"
          ref={taRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
          }}
          placeholder="Ask PISTA anything about your studies..."
          className="max-h-[180px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-ink-900 placeholder:text-ink-400 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {busy ? (
          <button type="button" onClick={onStop} aria-label="Stop response"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white transition hover:bg-ink-800">
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={!value.trim()} aria-label="Send message"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow transition hover:bg-brand-700 disabled:bg-ink-900/10 disabled:text-ink-400 disabled:shadow-none">
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
});

export default ChatComposer;
