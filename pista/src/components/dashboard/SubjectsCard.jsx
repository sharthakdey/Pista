import { Link } from "react-router-dom";
import ProgressBar from "../ui/ProgressBar.jsx";
import SubjectDot from "../ui/SubjectDot.jsx";
import { CardSkeleton } from "../ui/Skeleton.jsx";
import { ErrorState } from "../ui/StateViews.jsx";

export default function SubjectsCard({ progress, loading, error, onRetry }) {
  if (error) return <ErrorState compact error={error} onRetry={onRetry} title="Subjects didn't load" />;
  if (loading) return <CardSkeleton lines={4} />;
  const subjects = progress?.subjects || [];
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="subjects-title">
      <div className="flex items-center justify-between">
        <h2 id="subjects-title" className="font-sans text-sm font-semibold text-muted">Subjects</h2>
        <Link
          to="/progress"
          className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-700"
        >
          Details
          <span
            className="transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden
          >
            →
          </span>
        </Link>
      </div>
      <ul className="mt-4 space-y-3.5">
        {subjects.map((s) => (
          <li key={s.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-medium"><SubjectDot subject={s.id} /><span className="truncate">{s.name}</span></span>
              <span className="font-semibold tabular-nums">{s.progress}%</span>
            </div>
            <ProgressBar value={s.progress} size="sm" tone="brand" label={`${s.name} progress`} />
          </li>
        ))}
      </ul>
    </section>
  );
}