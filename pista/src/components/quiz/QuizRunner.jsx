import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import Button from "../ui/Button.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import Modal from "../ui/Modal.jsx";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuizRunner({ quiz, answers, onAnswer, onSubmit, submitting, onQuit }) {
  const [index, setIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const total = quiz.questions.length;
  const q = quiz.questions[index];
  const answeredCount = Object.keys(answers).length;
  const isLast = index === total - 1;

  // Keyboard: 1–4 / A–D to pick, arrows to move.
  useEffect(() => {
    const onKey = (e) => {
      if (confirmOpen || e.target.closest("input,textarea,select")) return;
      const k = e.key.toLowerCase();
      const n = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : "abcd".indexOf(k);
      if (n >= 0 && n < q.options.length) onAnswer(q.id, n);
      if (e.key === "ArrowRight" && !isLast) setIndex((i) => i + 1);
      if (e.key === "ArrowLeft" && index > 0) setIndex((i) => i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, index, isLast, onAnswer, confirmOpen]);

  const trySubmit = () => (answeredCount < total ? setConfirmOpen(true) : onSubmit());

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-muted">
            <span className="text-ink-900">{quiz.topic}</span>, {quiz.difficulty}
          </p>
          <button onClick={onQuit} className="text-sm font-semibold text-muted hover:text-coral-600">Quit quiz</button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="font-display text-lg font-bold" aria-live="polite">Question {index + 1} of {total}</p>
          <p className="text-sm text-muted">{answeredCount} answered</p>
        </div>
        <ProgressBar value={((index + 1) / total) * 100} tone="brand" className="mt-3" label="Quiz progress" />
        {quiz.note && <p className="mt-3 text-xs text-muted">{quiz.note}</p>}

        <div key={q.id} className="animate-fade-in">
          {q.subtopic && <p className="mt-7 text-sm font-semibold text-violet-600">{q.subtopic}</p>}
          <h2 className={`${q.subtopic ? "mt-1.5" : "mt-7"} text-[22px] font-bold leading-snug sm:text-[26px]`} id={`q-${q.id}`}>{q.question}</h2>

          <div role="radiogroup" aria-labelledby={`q-${q.id}`} className="mt-6 space-y-3">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === i;
              return (
                <button key={i} type="button" role="radio" aria-checked={selected} onClick={() => onAnswer(q.id, i)}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition
                    ${selected ? "border-brand-500 bg-brand-50" : "border-line bg-white hover:border-brand-200 hover:bg-surface"}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-sm font-bold transition
                    ${selected ? "bg-brand-600 text-white" : "bg-surface text-ink-700"}`}>
                    {selected ? <Check className="h-4 w-4" aria-hidden /> : LETTERS[i]}
                  </span>
                  <span className={`text-[15px] leading-snug ${selected ? "font-semibold text-ink-900" : "text-ink-800"}`}>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="secondary" icon={ChevronLeft} onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>Previous</Button>
          {isLast ? (
            <Button onClick={trySubmit} loading={submitting}>{submitting ? "Grading..." : "Submit Quiz"}</Button>
          ) : (
            <Button onClick={() => setIndex((i) => i + 1)} iconRight={ChevronRight}>Next</Button>
          )}
        </div>
      </div>

      <nav className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Jump to question">
        {quiz.questions.map((qq, i) => (
          <button key={qq.id} onClick={() => setIndex(i)} aria-label={`Question ${i + 1}${answers[qq.id] != null ? ", answered" : ""}`}
            aria-current={i === index ? "step" : undefined}
            className={`h-9 w-9 rounded-xl text-sm font-semibold transition
              ${i === index ? "bg-ink-900 text-white" : answers[qq.id] != null ? "bg-brand-100 text-brand-700" : "bg-white text-muted ring-1 ring-line hover:ring-brand-200"}`}>
            {i + 1}
          </button>
        ))}
      </nav>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Submit with unanswered questions?"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Keep answering</Button>
          <Button onClick={() => { setConfirmOpen(false); onSubmit(); }}>Submit Quiz</Button>
        </>}>
        <p className="text-[15px] text-muted">
          You've answered {answeredCount} of {total} questions. Unanswered questions count as incorrect.
        </p>
      </Modal>
    </div>
  );
}
