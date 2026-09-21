import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { History, Plus, X } from "lucide-react";
import { sendMessage } from "../services/api.js";
import { useConversations } from "../hooks/useConversations.js";
import { useStudy } from "../context/StudyContext.jsx";
import { uid } from "../utils/format.js";
import MessageBubble from "../components/chat/MessageBubble.jsx";
import TypingIndicator from "../components/chat/TypingIndicator.jsx";
import ChatComposer from "../components/chat/ChatComposer.jsx";
import ConversationList from "../components/chat/ConversationList.jsx";
import PistaOrb from "../components/chat/PistaOrb.jsx";
import { QuickPromptGrid, QuickPromptChips } from "../components/chat/QuickPrompts.jsx";

export default function Tutor() {
  const { student } = useStudy();
  const location = useLocation();
  const navigate = useNavigate();
  const convos = useConversations();
  const { active, activeId, appendMessage, updateMessage, setServerId } = convos;

  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [stopId, setStopId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const listRef = useRef(null);
  const stickRef = useRef(true);
  const hasMessagesRef = useRef(false);
  const composerRef = useRef(null);

  const messages = active?.messages || [];
  const streaming = messages.some((m) => m.streaming);
  const busy = pending || streaming;

  // Arriving from "Start Learning": open a fresh conversation with the prompt ready to send.
  useEffect(() => {
    const prompt = location.state?.prompt;
    if (prompt) {
      convos.startNew();
      setInput(prompt);
      navigate(location.pathname, { replace: true, state: null });
      setTimeout(() => composerRef.current?.focus(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Keep the view pinned to the bottom while content grows, unless the student scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    const list = listRef.current;
    if (!el || !list) return undefined;
    const onScroll = () => { stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120; };
    const ro = new ResizeObserver(() => {
      // The welcome screen reads top-down; only pin to the bottom once a conversation exists.
      if (!hasMessagesRef.current) { el.scrollTop = 0; return; }
      if (stickRef.current) el.scrollTop = el.scrollHeight;
    });
    el.addEventListener("scroll", onScroll, { passive: true });
    ro.observe(list);
    return () => { el.removeEventListener("scroll", onScroll); ro.disconnect(); };
  }, [activeId]);

  hasMessagesRef.current = messages.length > 0 || Boolean(pending);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(async (text) => {
    if (!text.trim() || busy) return;
    stickRef.current = true;
    setInput("");
    const history = messages.filter((m) => !m.error && !m.streaming).slice(-12).map((m) => ({ role: m.role, content: m.content }));
    const cid = appendMessage(activeId, { id: uid("m"), role: "user", content: text, createdAt: Date.now() });

    const controller = new AbortController();
    abortRef.current = controller;
    setPending(true);
    try {
      const res = await sendMessage({ message: text, conversationId: active?.serverId || undefined, history }, { signal: controller.signal });
      if (res.conversationId) setServerId(cid, res.conversationId);
      appendMessage(cid, {
        id: uid("m"), role: "assistant", content: res.reply || "", sources: res.sources || [],
        citations: res.citations || [], action: res.action || null, streaming: true, createdAt: Date.now(),
      });
    } catch (e) {
      if (e?.code !== "ABORTED") {
        appendMessage(cid, { id: uid("m"), role: "assistant", error: e?.userMessage || "PISTA couldn't reply. Please try again.", retryText: text, content: "" });
      }
    } finally {
      setPending(false);
      abortRef.current = null;
    }
  }, [busy, messages, activeId, active?.serverId, appendMessage, setServerId]);

  const stop = () => {
    if (pending) abortRef.current?.abort();
    const s = messages.find((m) => m.streaming);
    if (s) setStopId(s.id);
  };

  const onRevealDone = useCallback((messageId, text, stopped) => {
    updateMessage(activeId, messageId, stopped ? { streaming: false, stopped: true, content: text } : { streaming: false });
    setStopId(null);
  }, [activeId, updateMessage]);

  const newConversation = () => {
    if (busy) stop();
    convos.startNew();
    setHistoryOpen(false);
    setInput("");
    composerRef.current?.focus();
  };

  const firstName = student?.name?.split(" ")[0];

  const historyPanel = (
    <ConversationList
      conversations={convos.conversations}
      activeId={activeId}
      onSelect={(id) => { if (!busy) { convos.setActiveId(id); setHistoryOpen(false); } }}
      onNew={newConversation}
      onDelete={convos.remove}
      collapsed={historyCollapsed}
      onToggle={() => setHistoryCollapsed((value) => !value)}
    />
  );

  return (
    <div className="flex h-[calc(100dvh-56px-64px-env(safe-area-inset-bottom))] md:h-dvh">
      {/* History (desktop) */}
      <aside
        className={`hidden shrink-0 border-r border-line bg-white transition-[width] duration-200 xl:block ${historyCollapsed ? "w-[56px]" : "w-[280px]"
          }`}
        aria-label="Conversation history"
      >
        {historyPanel}
      </aside>

      {/* History (smaller screens) */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-ink-950/40 animate-fade-in" onClick={() => setHistoryOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[300px] max-w-[85vw] animate-pop-in bg-white shadow-lift">
            <button onClick={() => setHistoryOpen(false)} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg bg-white text-ink-400 hover:bg-surface" aria-label="Close history">
              <X className="h-4 w-4" />
            </button>
            <div className="h-full pt-10">{historyPanel}</div>
          </div>
        </div>
      )}

      <section className="flex min-w-0 flex-1 flex-col" aria-label="PISTA AI Tutor">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white/80 px-4 py-3 backdrop-blur sm:px-6 md:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <PistaOrb size={40} />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold leading-tight sm:text-xl">PISTA AI Tutor</h1>
              <p className="truncate text-sm text-muted">Ask anything. Learn anything.</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button onClick={newConversation} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-sm font-semibold transition duration-150 ease-out hover:border-brand-200 hover:bg-brand-50 active:scale-[.98] xl:hidden" aria-label="New conversation">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">New</span>
            </button>
            <button onClick={() => setHistoryOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-sm font-semibold transition duration-150 ease-out hover:border-brand-200 hover:bg-brand-50 active:scale-[.98] xl:hidden" aria-label="Conversation history">
              <History className="h-4 w-4" /><span className="hidden sm:inline">History</span>
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin" aria-live="polite">
          <div ref={listRef} className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
            {messages.length === 0 && !pending ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center py-2 text-center sm:py-6">
                <PistaOrb size={64} pulse />
                <h2 className="mt-5 text-[24px] font-bold leading-tight sm:text-[32px]">
                  {firstName ? `What are we learning today, ${firstName}?` : "What are we learning today?"}
                </h2>
                <p className="mt-2 max-w-md text-[15px] text-muted">
                  PISTA answers from your uploaded course material, your exam dates and your quiz results.
                </p>
                <div className="mt-8 w-full max-w-xl"><QuickPromptGrid onPick={send} /></div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} studentName={student?.name}
                    stopRequested={stopId === m.id} onRevealDone={onRevealDone} onRetry={send} />
                ))}
                {pending && <TypingIndicator />}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-line/60 bg-surface/90 px-4 pb-4 pt-3 backdrop-blur sm:px-6">
          <div className="mx-auto w-full max-w-3xl space-y-2.5">
            {messages.length > 0 && <QuickPromptChips onPick={send} disabled={busy} />}
            <ChatComposer ref={composerRef} value={input} onChange={setInput} onSend={send} onStop={stop} busy={busy} />
            <p className="hidden text-center text-xs text-muted sm:block">
              PISTA can make mistakes. Check important details against your course material.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}