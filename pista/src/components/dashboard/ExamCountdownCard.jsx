import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressBar from "../ui/ProgressBar.jsx";
import { CardSkeleton } from "../ui/Skeleton.jsx";
import { ErrorState, EmptyState } from "../ui/StateViews.jsx";
import Button from "../ui/Button.jsx";
import { formatDate, formatTime, daysLeftLabel, daysUntil } from "../../utils/dates.js";

function useCountdown(iso) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, new Date(iso) - now);
  return { d: Math.floor(ms / 86_400_000), h: Math.floor(ms / 3_600_000) % 24, m: Math.floor(ms / 60_000) % 60 };
}

function Countdown({ iso }) {
  const { d, h, m } = useCountdown(iso);
  const cell = (v, l) => (
    <div className="flex-1 rounded-xl bg-surface py-2 text-center">
      <div className="font-display text-xl font-bold tabular-nums tracking-tight">{String(v).padStart(2, "0")}</div>
      <div className="text-[11px] font-medium text-muted">{l}</div>
    </div>
  );
  return <div className="flex gap-2" aria-label={`${d} days ${h} hours ${m} minutes until the exam`}>{cell(d, "days")}{cell(h, "hours")}{cell(m, "min")}</div>;
}

export default function ExamCountdownCard({ exams, loading, error, onRetry }) {
  if (error) return <ErrorState compact error={error} onRetry={onRetry} title="Exams didn't load" />;
  if (loading) return <CardSkeleton lines={3} />;
  const next = (exams || []).filter((e) => daysUntil(e.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  if (!next) {
    return (
      <EmptyState emoji="📅" title="No upcoming exams" className="h-full !py-8"
        action={<Button to="/exams" size="sm" variant="secondary">Add Exam</Button>} />
    );
  }
  const days = daysUntil(next.date);
  const urgent = days <= 5;
  return (
    <section className="card flex h-full flex-col p-5 sm:p-6" aria-labelledby="exam-card-title">
      <div className="flex items-center justify-between">
        <h2 id="exam-card-title" className="font-sans text-sm font-semibold text-muted">Upcoming exam</h2>
        <CalendarDays className="h-5 w-5 text-ink-400" aria-hidden />
      </div>
      <p className="mt-3 font-display text-xl font-bold leading-tight">{next.subject}</p>
      <p className="text-sm text-muted">{next.title}</p>
      <p className={`mt-4 font-display text-[40px] font-extrabold leading-none tracking-tight ${urgent ? "text-coral-500" : "text-ink-900"}`}>
        {daysLeftLabel(next.date)}
      </p>
      <p className="mt-1.5 text-sm text-muted">{formatDate(next.date, { weekday: "long", month: "long", day: "numeric" })}, {formatTime(next.date)}</p>
      <div className="mt-4"><Countdown iso={next.date} /></div>
      <div className="mt-auto pt-5">
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="text-muted">Prepared</span>
          <span className="font-semibold">{next.preparedness}%</span>
        </div>
        <ProgressBar value={next.preparedness} label="Exam preparedness" />
        <Link
          to="/exams"
          className="group mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-700"
        >
          See all exams
          <span
            className="transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden
          >
            →
          </span> 
        </Link>
      </div>
    </section>
  );
}