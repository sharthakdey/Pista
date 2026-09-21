import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useStudy } from "../../context/StudyContext.jsx";

const ICONS = { success: CheckCircle2, info: Info, error: AlertTriangle };
const TONES = { success: "text-mint-500", info: "text-electric-400", error: "text-coral-500" };

export default function Toasts() {
  const { toasts, dismissToast } = useStudy();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone] || Info;
        return (
          <div key={t.id} className="pointer-events-auto flex max-w-sm animate-pop-in items-center gap-3 rounded-2xl bg-ink-900 py-3 pl-4 pr-2 text-sm text-white shadow-lift">
            <Icon className={`h-5 w-5 shrink-0 ${TONES[t.tone]}`} aria-hidden />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="grid h-7 w-7 place-items-center rounded-lg text-ink-300 hover:bg-white/10" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
