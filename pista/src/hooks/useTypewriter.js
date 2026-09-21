import { useEffect, useRef, useState } from "react";

/**
 * Reveals `text` progressively (word chunks) when `enabled`. Calls onDone when finished.
 * Respects prefers-reduced-motion by revealing instantly.
 */
export function useTypewriter(text, { enabled, stopped, onDone, wordsPerTick = 3, tickMs = 18 }) {
  const [shown, setShown] = useState(enabled ? "" : text);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!enabled) { setShown(text); return undefined; }
    if (stopped) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(text); doneRef.current?.(text); return undefined; }

    const tokens = text.split(/(\s+)/);
    let i = 0;
    const timer = setInterval(() => {
      i = Math.min(tokens.length, i + wordsPerTick * 2);
      setShown(tokens.slice(0, i).join(""));
      if (i >= tokens.length) {
        clearInterval(timer);
        doneRef.current?.(text);
      }
    }, tickMs);
    return () => clearInterval(timer);
  }, [text, enabled, stopped, wordsPerTick, tickMs]);

  // When stopped, freeze at the current point and report the partial text.
  const shownRef = useRef(shown);
  shownRef.current = shown;
  useEffect(() => {
    if (stopped && enabled) doneRef.current?.(shownRef.current, true);
  }, [stopped, enabled]);

  return shown;
}
