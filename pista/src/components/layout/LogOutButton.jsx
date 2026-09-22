import { LogOut } from "lucide-react";

export default function LogoutButton({ iconOnly = false }) {
  const logout = () => {
    localStorage.removeItem("pista:token");
    localStorage.removeItem("pista:student-id");
    window.location.href = "/login";
  };

  if (iconOnly) {
    return (
      <button
        onClick={logout}
        aria-label="Log out"
        title="Log out"
        className="grid h-9 w-9 place-items-center rounded-xl text-ink-400 transition hover:bg-white/10 hover:text-coral-400"
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={logout}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-400 transition hover:bg-white/10 hover:text-coral-400"
    >
      <LogOut className="h-3.5 w-3.5" />
      Log out
    </button>
  );
}