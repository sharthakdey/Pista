export default function PageHeader({ title, subtitle, actions, icon: Icon }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2.5 text-[28px] font-bold leading-tight sm:text-[34px]">
          {Icon && <Icon className="h-7 w-7 shrink-0 text-brand-600" aria-hidden />}
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
