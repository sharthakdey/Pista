import { initials } from "../../utils/format.js";

export default function Avatar({ name, size = 40, className = "" }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-coral-500 font-display font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
