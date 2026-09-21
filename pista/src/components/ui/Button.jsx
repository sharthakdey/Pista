import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-brand-600 text-white shadow-glow hover:bg-brand-700 active:bg-brand-700",
  secondary: "bg-white text-ink-900 border border-line hover:border-brand-200 hover:bg-brand-50",
  ghost: "text-ink-700 hover:bg-ink-900/5",
  light: "bg-white text-ink-900 hover:bg-brand-50",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
  glass: "bg-white/10 text-white border border-white/15 hover:bg-white/15",
  danger: "bg-coral-50 text-coral-600 hover:bg-coral-500 hover:text-white",
};
const SIZES = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-2xl",
  icon: "h-10 w-10 rounded-xl",
};

/** Button that can also render as a router Link via `to`. */
export default function Button({
  variant = "primary", size = "md", loading = false, icon: Icon, iconRight: IconRight,
  to, className = "", children, disabled, ...rest
}) {
  const cls = `inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition
    duration-150 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
      {children}
      {IconRight && !loading && <IconRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />}
    </>
  );
  if (to) return <Link to={to} className={`group ${cls}`} {...rest}>{content}</Link>;
  return (
    <button className={`group ${cls}`} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
