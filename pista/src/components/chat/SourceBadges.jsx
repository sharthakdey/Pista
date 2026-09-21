import { FileText } from "lucide-react";

const META = {
  course_material: { emoji: "📚", label: "Course Material", cls: "bg-electric-500/10 text-electric-600 ring-electric-500/20" },
  general_knowledge: { emoji: "🌐", label: "General Knowledge", cls: "bg-ink-900/[.05] text-ink-700 ring-ink-900/10" },
  personalized: { emoji: "✨", label: "Personalized Recommendation", cls: "bg-violet-500/10 text-violet-600 ring-violet-500/20" },
};

export default function SourceBadges({ sources = [], citations = [] }) {
  if (!sources.length && !citations.length) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
      {sources.map((s) => {
        const m = META[s];
        if (!m) return null;
        return (
          <span key={s} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${m.cls}`}>
            <span aria-hidden>{m.emoji}</span>{m.label}
          </span>
        );
      })}
      {citations.map((c) => (
        <span key={c.title + c.location} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-muted" title={c.title}>
          <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate font-medium text-ink-700">{c.title}</span>
          {c.location && <span className="shrink-0">({c.location})</span>}
        </span>
      ))}
    </div>
  );
}
