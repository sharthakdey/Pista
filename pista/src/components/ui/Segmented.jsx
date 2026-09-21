export default function Segmented({ options, value, onChange, label, name }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-ink-900/[.05] p-1">
      {options.map((o) => {
        const v = typeof o === "object" ? o.value : o;
        const l = typeof o === "object" ? o.label : o;
        const active = v === value;
        return (
          <button key={v} type="button" role="radio" aria-checked={active} name={name}
            onClick={() => onChange(v)}
            className={`h-9 rounded-lg text-sm font-semibold transition ${active ? "bg-white text-brand-700 shadow-card" : "text-muted hover:text-ink-900"}`}>
            {l}
          </button>
        );
      })}
    </div>
  );
}
