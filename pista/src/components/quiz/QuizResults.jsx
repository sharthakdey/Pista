import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, XCircle, Sparkles, ChevronDown, RotateCcw, LayoutDashboard, AlertTriangle } from "lucide-react";
import Button from "../ui/Button.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import ProgressRing from "../ui/ProgressRing.jsx";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function Review({ review }) {
  const [open, setOpen] = useState(null);
  return (
    <ul className="divide-y divide-line">
      {review.map((r, i) => {
        const isOpen = open === i;
        return (
          <li key={r.questionId}>
            <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}
              className="flex w-full items-start gap-3 py-4 text-left">
              {r.isCorrect
                ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" aria-label="Correct" />
                : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-coral-500" aria-label="Incorrect" />}
              <span className="flex-1 text-[15px] font-medium">{i + 1}. {r.question}</span>
              <ChevronDown className={`mt-0.5 h-5 w-5 shrink-0 text-ink-400 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {isOpen && (
              <div className="animate-fade-in pb-4 pl-8">
                <ul className="space-y-1.5">
                  {r.options.map((o, oi) => {
                    const correct = oi === r.correct;
                    const chosen = oi === r.selected;
                    return (
                      <li key={oi} className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm
                        ${correct ? "bg-mint-50 font-semibold text-mint-600" : chosen ? "bg-coral-50 text-coral-600" : "text-muted"}`}>
                        <span className="font-bold">{LETTERS[oi]}.</span><span className="flex-1">{o}</span>
                        {correct && <span className="shrink-0 text-xs">Correct answer</span>}
                        {chosen && !correct && <span className="shrink-0 text-xs">Your answer</span>}
                      </li>
                    );
                  })}
                </ul>
                {r.selected == null && <p className="mt-2 text-sm text-muted">You didn't answer this question.</p>}
                <p className="mt-3 rounded-xl bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink-800">{r.explanation}</p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function QuizResults({ result, onRetake, onNewQuiz }) {
  const navigate = useNavigate();
  const { correctCount, total, percentage, topicPerformance, weakAreas, weakTopicIdentified, recommendation, progressUpdate } = result;
  const incorrect = total - correctCount;
  const headline = percentage >= 80 ? "Quiz Complete! Great work." : "Quiz Complete!";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="card overflow-hidden">
        <div className="grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
          <div className="mx-auto">
            <ProgressRing value={percentage} size={168} stroke={14} label="Quiz score">
              <div>
                <div className="font-display text-[40px] font-extrabold leading-none">{percentage}%</div>
                <div className="mt-1 text-sm font-semibold text-muted">{correctCount} / {total}</div>
              </div>
            </ProgressRing>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[28px] font-bold leading-tight"><span aria-hidden>🎯</span> {headline}</h2>
            <p className="mt-1 text-muted">{result.topic}, {result.subject}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-md">
              <div className="rounded-2xl bg-mint-50 p-3 text-center">
                <div className="font-display text-2xl font-bold text-mint-600">{correctCount}</div>
                <div className="text-xs font-medium text-mint-600">Correct</div>
              </div>
              <div className="rounded-2xl bg-coral-50 p-3 text-center">
                <div className="font-display text-2xl font-bold text-coral-600">{incorrect}</div>
                <div className="text-xs font-medium text-coral-600">Incorrect</div>
              </div>
              <div className="rounded-2xl bg-brand-50 p-3 text-center">
                <div className="font-display text-2xl font-bold text-brand-700">{percentage}%</div>
                <div className="text-xs font-medium text-brand-700">Score</div>
              </div>
            </div>
          </div>
        </div>

        {weakTopicIdentified && (
          <div className="flex animate-fade-in items-start gap-3 border-t border-coral-500/15 bg-coral-50 px-6 py-4 sm:px-8" role="status">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-coral-500" aria-hidden />
            <p className="text-[15px] text-coral-600">
              <span className="font-semibold">{result.topic} identified as a weak topic.</span>{" "}
              {progressUpdate && <>Topic progress updated from {progressUpdate.previous}% to {progressUpdate.current}%.</>}
            </p>
          </div>
        )}
        {!weakTopicIdentified && progressUpdate && (
          <div className="border-t border-mint-500/15 bg-mint-50 px-6 py-4 text-[15px] text-mint-600 sm:px-8" role="status">
            <span className="font-semibold">Progress updated:</span> {result.topic} went from {progressUpdate.previous}% to {progressUpdate.current}%.
          </div>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card p-5 sm:p-6" aria-labelledby="topic-perf">
          <h3 id="topic-perf" className="text-lg font-bold">Topic performance</h3>
          <ul className="mt-4 space-y-4">
            {topicPerformance.map((t) => (
              <li key={t.topic}>
                <div className="mb-1.5 flex justify-between gap-2 text-sm">
                  <span className="font-medium">{t.topic}</span>
                  <span className="shrink-0 text-muted"><span className="font-semibold text-ink-900">{t.accuracy}%</span> ({t.correct}/{t.total})</span>
                </div>
                <ProgressBar value={t.accuracy} label={`${t.topic} accuracy`} />
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="weak-areas">
          <h3 id="weak-areas" className="text-lg font-bold">Needs Improvement</h3>
          {weakAreas.length === 0 ? (
            <p className="mt-4 text-[15px] text-muted">Nothing below 70% in this quiz. Nicely done.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {weakAreas.map((w) => (
                <li key={w.topic} className="flex items-center justify-between gap-3 rounded-2xl bg-coral-50 px-4 py-3">
                  <span className="font-semibold text-ink-900">{w.topic}</span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-xl font-bold leading-none text-coral-600">{w.accuracy}%</span>
                    <span className="text-xs text-coral-600">accuracy</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-8" aria-labelledby="pista-rec">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/25 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 id="pista-rec" className="flex items-center gap-2 text-lg font-bold"><Sparkles className="h-5 w-5 text-violet-400" aria-hidden />{recommendation.title}</h3>
            <p className="mt-1.5 max-w-lg text-[15px] text-ink-300">{recommendation.message}</p>
          </div>
          <Button variant="light" size="lg" iconRight={ArrowRight} className="shrink-0"
            onClick={() => navigate("/tutor", { state: { prompt: recommendation.prompt } })}>
            {recommendation.actionLabel}
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" icon={LayoutDashboard} to="/dashboard">Back to Dashboard</Button>
        <Button variant="secondary" icon={RotateCcw} onClick={onRetake}>Retake quiz</Button>
        <Button variant="ghost" onClick={onNewQuiz}>New quiz</Button>
      </div>

      <section className="card p-5 sm:p-6" aria-labelledby="answer-review">
        <h3 id="answer-review" className="text-lg font-bold">Answer review</h3>
        <Review review={result.review} />
      </section>
    </div>
  );
}
