import { CardSkeleton } from "../ui/Skeleton.jsx";

export default function StreakCard({ days, loading }) {
  if (loading) return <CardSkeleton lines={1} />;
  const week = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIdx = (new Date().getDay() + 6) % 7;
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="streak-title">
      <h2 id="streak-title" className="font-sans text-sm font-semibold text-muted">Study streak</h2>
      <p className="mt-2 flex items-center gap-2 font-display text-[36px] font-extrabold leading-none">
        <span aria-hidden>🔥</span>{days} {days === 1 ? "Day" : "Days"}
      </p>
      <div className="mt-4 flex justify-between gap-1" aria-label={`Studied ${days} days in a row`}>
        {week.map((d, i) => {
          const back = (todayIdx - i + 7) % 7;
          const done = i <= todayIdx && back < days;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className={`h-7 w-7 rounded-full transition-all duration-200 ${done ? "bg-gradient-to-br from-amber-500 to-coral-500" : "bg-ink-900/[.06]"} ${i === todayIdx ? "ring-2 ring-amber-500/40 ring-offset-2" : ""}`} />
              <span className="text-[11px] font-medium text-muted">{d}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}