import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, MOBILE_PRIMARY } from "./navItems.js";
import Logo from "../ui/Logo.jsx";
import Avatar from "../ui/Avatar.jsx";
import { useStudy } from "../../context/StudyContext.jsx";

export function MobileHeader() {
  const { student } = useStudy();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink-900 px-4 md:hidden">
      <Logo to="/dashboard" size={30} />
      <NavLink to="/settings" aria-label="Student profile"><Avatar name={student?.name || "Student"} size={32} /></NavLink>
    </header>
  );
}

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const primary = NAV_ITEMS.filter((n) => MOBILE_PRIMARY.includes(n.to));
  const more = NAV_ITEMS.filter((n) => !MOBILE_PRIMARY.includes(n.to));
  const moreActive = more.some((n) => pathname.startsWith(n.to));

  const item = "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold";
  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-ink-950/40 animate-fade-in" />
          <div className="absolute inset-x-3 bottom-[76px] animate-pop-in rounded-3xl bg-white p-2 shadow-lift" onClick={(e) => e.stopPropagation()}>
            {more.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setMoreOpen(false)}
                className={({ isActive }) => `flex h-12 items-center gap-3 rounded-2xl px-4 font-semibold ${isActive ? "bg-brand-50 text-brand-700" : "text-ink-800"}`}>
                <Icon className="h-5 w-5" aria-hidden />{label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-label="Main navigation">
        <div className="flex h-16">
          {primary.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMoreOpen(false)}
              className={({ isActive }) => `${item} ${isActive ? "text-brand-600" : "text-ink-400"}`}>
              {({ isActive }) => (
                <>
                  <span className={`grid h-7 w-12 place-items-center rounded-full transition ${isActive ? "bg-brand-50" : ""}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
          <button onClick={() => setMoreOpen((o) => !o)} aria-expanded={moreOpen}
            className={`${item} ${moreActive || moreOpen ? "text-brand-600" : "text-ink-400"}`}>
            <span className={`grid h-7 w-12 place-items-center rounded-full ${moreActive ? "bg-brand-50" : ""}`}>
              {moreOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </span>
            More
          </button>
        </div>
      </nav>
    </>
  );
}
