import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, CalendarClock, Gauge, ListChecks, Target, RefreshCcw } from "lucide-react";
import Button from "../ui/Button.jsx";
import { Skeleton } from "../ui/Skeleton.jsx";
import { ErrorState } from "../ui/StateViews.jsx";

const REASON_ICON = { exam: CalendarClock, progress: Gauge, quiz: ListChecks, weak: Target };
const REASON_TONE = {
  exam: "text-electric-400",
  progress: "text-violet-400",
  quiz: "text-amber-500",
  weak: "text-coral-500",
};

/** The signal-to-destination path: each reason is a start point, all merging into the topic. */
function PathGraphic({ reasons, topic }) {
  const n = Math.max(reasons.length, 1);
  const ys = reasons.map((_, i) => 40 + (i * 200) / Math.max(n - 1, 1));
  return (
    <svg viewBox="0 0 320 280" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="rec-path" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5B9BFF" stopOpacity=".25" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
        <radialGradient id="rec-glow">
          <stop offset="0" stopColor="#8B5CF6" stopOpacity=".55" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
      </defs>
      {ys.map((y, i) => (
        <g key={i}>
          <path
            d={`M24 ${y} C 130 ${y}, 150 140, 250 140`}
            fill="none" stroke="url(#rec-path)" strokeWidth="2.5" strokeLinecap="round"
            className="path-draw" style={{ "--len": 320, animationDelay: `${i * 120}ms` }}
          />
          <circle cx="24" cy={y} r="5" className="fill-ink-800 stroke-electric-400" strokeWidth="2" />
        </g>
      ))}
      <circle cx="262" cy="140" r="56" fill="url(#rec-glow)" />
      <circle cx="262" cy="140" r="22" fill="#fff" />
      <circle cx="262" cy="140" r="9" fill="#8B5CF6" />
      <text x="262" y="200" textAnchor="middle" className="fill-white font-display text-[13px] font-semibold">
        {topic.length > 24 ? `${topic.slice(0, 22)}…` : topic}
      </text>
    </svg>
  );
}

export default function RecommendationCard({ data, loading, error, onRetry }) {
  const navigate = useNavigate();

  if (error) return <ErrorState error={error} onRetry={onRetry} title="Today's recommendation isn't available" className="min-h-[300px] justify-center" />;

  if (loading || !data) {
    return (
      <div className="rounded-3xl bg-ink-900 p-6 sm:p-8" aria-busy="true">
        <Skeleton className="h-5 w-56 !bg-ink-800 !bg-none" />
        <Skeleton className="mt-6 h-9 w-4/5 !bg-ink-800 !bg-none" />
        <Skeleton className="mt-3 h-4 w-2/3 !bg-ink-800 !bg-none" />
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-44 !bg-ink-800 !bg-none" />)}
        </div>
        <p className="sr-only">Loading today's recommendation…</p>
      </div>
    );
  }

  const isReview = data.kind === "review";
  const start = () => navigate("/tutor", { state: { prompt: data.action?.prompt, topic: data.topic } });

  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-ink-900 text-white shadow-lift ring-1 ${isReview ? "ring-coral-500/50" : "ring-white/5"}`}
      aria-labelledby="rec-title"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" aria-hidden />
      <div className="relative grid gap-4 p-6 sm:p-8 md:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-300">
              <Sparkles className="h-4 w-4 text-violet-400" aria-hidden />
              Today's Study Recommendation
            </span>
            {isReview && (
              <span className="inline-flex animate-pop-in items-center gap-1.5 rounded-full bg-coral-500/15 px-2.5 py-1 text-xs font-semibold text-coral-500">
                <RefreshCcw className="h-3 w-3" aria-hidden /> Updated after your latest quiz
              </span>
            )}
          </div>

          <h2 id="rec-title" key={data.title} className="mt-4 animate-fade-in text-[26px] font-bold leading-[1.15] sm:text-[32px]">
            {data.title}
          </h2>
          <p className="mt-2 max-w-lg text-[15px] text-ink-300">{data.message}</p>

          <h3 className="mt-6 font-sans text-sm font-semibold text-white">Why?</h3>
          <ul className="relative mt-3 space-y-3 pl-1">
            <span className="absolute bottom-3 left-[13px] top-3 w-px bg-gradient-to-b from-electric-400/60 to-violet-400/60" aria-hidden />
            {data.reasons.map((r, i) => {
              const Icon = REASON_ICON[r.type] || Sparkles;
              return (
                <li key={i} className="relative flex items-center gap-3 text-[15px]">
                  <span className="relative grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-ink-800 ring-1 ring-white/10">
                    <Icon className={`h-3.5 w-3.5 ${REASON_TONE[r.type] || "text-white"}`} aria-hidden />
                  </span>
                  <span className="text-white/90">{r.label}</span>
                </li>
              );
            })}
          </ul>

          <Button variant="light" size="lg" className="mt-7" onClick={start} iconRight={ArrowRight}>
            {data.action?.label || "Start Learning"}
          </Button>
        </div>

        <div className="hidden md:block">
          <PathGraphic reasons={data.reasons} topic={data.topic} key={data.title} />
        </div>
      </div>
    </section>
  );
}
