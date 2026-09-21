import { Compass, Lightbulb, BookOpenCheck, ListChecks, Target } from "lucide-react";

export const QUICK_PROMPTS = [
  { text: "What should I study today?", icon: Compass },
  { text: "Explain this topic simply", icon: Lightbulb },
  { text: "Teach me ARQ protocols", icon: BookOpenCheck },
  { text: "Give me a quiz", icon: ListChecks },
  { text: "What are my weakest topics?", icon: Target },
];

export function QuickPromptGrid({ onPick }) {
  return (
    <div className="grid w-full gap-2.5 sm:grid-cols-2">
      {QUICK_PROMPTS.map(({ text, icon: Icon }, i) => (
        <button key={text} onClick={() => onPick(text)}
          className={`group flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left text-[15px] font-medium shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift ${i === 4 ? "sm:col-span-2" : ""}`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
          {text}
        </button>
      ))}
    </div>
  );
}

export function QuickPromptChips({ onPick, disabled }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
      {QUICK_PROMPTS.map(({ text, icon: Icon }) => (
        <button key={text} disabled={disabled} onClick={() => onPick(text)}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700 transition duration-150 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50">
          <Icon className="h-3.5 w-3.5" aria-hidden />{text}
        </button>
      ))}
    </div>
  );
}