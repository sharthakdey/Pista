import { Target } from "lucide-react";
import ProgressBar from "../ui/ProgressBar.jsx";
import Button from "../ui/Button.jsx";
import { CardSkeleton } from "../ui/Skeleton.jsx";
import { ErrorState, EmptyState } from "../ui/StateViews.jsx";
import { PRIORITY_META } from "../../utils/format.js";

export default function WeakTopicsCard({ progress, loading, error, onRetry }) {
  if (error) return <ErrorState compact error={error} onRetry={onRetry} title="Weak topics didn't load" />;
  if (loading) return <CardSkeleton lines={4} />;
  const list = (progress?.weakTopics || []).slice(0, 3);
  return (
    <section className="card flex h-full flex-col p-5 sm:p-6" aria-labelledby="weak-title">
      <div className="flex items-center justify-between">
        <h2 id="weak-title" className="font-sans text-sm font-semibold text-muted">Weak topics</h2>
        <Target className="h-5 w-5 text-coral-500" aria-hidden />
      </div>
      {list.length === 0 ? (
        <EmptyState emoji="🎉" title="No weak topics" message="Every topic is above 65%." className="mt-4 !border-0 !py-6" />
      ) : (
        <ul className="mt-4 space-y-4">
          {list.map((w) => {
            const meta = PRIORITY_META[w.priority];
            return (
              <li key={w.topic} className="animate-fade-in">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{w.topic}</span>
                    <span className="text-xs text-muted">{w.subject}</span>
                  </span>
                  <span className={`shrink-0 font-display text-lg font-bold ${meta.text}`}>{w.mastery}%</span>
                </div>
                <ProgressBar value={w.mastery} size="sm" className="mt-2" label={`${w.topic} mastery`} />
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-auto pt-5">
        <Button to="/progress#weak-topics" variant="secondary" size="sm" className="w-full">View weak topics</Button>
      </div>
    </section>
  );
}
