import { NavLink, Link } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV_ITEMS } from "./navItems.js";
import Logo, { LogoMark } from "../ui/Logo.jsx";
import Avatar from "../ui/Avatar.jsx";
import { useStudy } from "../../context/StudyContext.jsx";
import LogoutButton from "./LogOutButton.jsx";
/**
 * Desktop: full sidebar. Tablet: icon rail (`collapsed`) that can expand as an overlay.
 */
export default function Sidebar({ collapsed = false, onToggle, onNavigate, showToggle = false }) {
  const { student, demoMode } = useStudy();
  return (
    <aside
      className={`flex h-full flex-col bg-ink-900 text-ink-300 transition-[width] duration-200 ${collapsed ? "w-[76px]" : "w-[264px]"}`}
      aria-label="Main navigation"
    >
      <div className={`flex h-20 items-center ${collapsed ? "justify-center" : "justify-between px-5"}`}>
        {collapsed ? (
          <Link to="/" aria-label="PISTA home" className="rounded-xl"><LogoMark size={38} /></Link>
        ) : (
          <Logo to="/" size={38} showTagline />
        )}
        {showToggle && !collapsed && (
          <button onClick={onToggle} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10 hover:text-white" aria-label="Collapse sidebar">
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {showToggle && collapsed && (
        <button onClick={onToggle} className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10 hover:text-white" aria-label="Expand sidebar">
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {NAV_ITEMS.map(
          ({ to, label, icon: Icon, highlight, section }, index) => (
            <div key={to}>
              {!collapsed &&
                (index === 0 ||
                  NAV_ITEMS[index - 1].section !== section) && (
                  <div className="px-3.5 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                    {section}
                  </div>
                )}

              <NavLink
                to={to}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `group relative flex h-11 items-center gap-3 rounded-xl text-[15px] font-medium transition
          ${collapsed ? "justify-center" : "px-3.5"}
          ${isActive
                    ? "bg-white/[.08] text-white"
                    : "hover:bg-white/[.04] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute left-0 top-2.5 h-6 w-1 rounded-r-full bg-gradient-to-b from-electric-400 to-violet-400"
                        aria-hidden
                      />
                    )}

                    <Icon
                      className={`h-5 w-5 shrink-0 ${isActive
                        ? "text-electric-400"
                        : highlight
                          ? "text-violet-400"
                          : ""
                        }`}
                      aria-hidden
                    />

                    {!collapsed && (
                      <span className="flex-1">{label}</span>
                    )}

                    {!collapsed && highlight && !isActive && (
                      <span className="rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-violet-400">
                        AI
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </div>
          )
        )}
      </nav>

            <div className="border-t border-white/[.06] p-3">
        {demoMode && !collapsed && (
          <Link to="/settings" onClick={onNavigate}
            className="mb-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-ink-400 hover:text-ink-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
            Demo data
          </Link>
        )}

        <Link to="/settings" onClick={onNavigate}
          className={`flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[.05] ${collapsed ? "justify-center" : ""}`}
          aria-label="Student profile">
          <Avatar name={student?.name || "Student"} size={38} />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{student?.name || "Student"}</span>
              <span className="block truncate text-xs text-ink-400">
                {student?.semester
                  ? `Semester ${student.semester}${student?.branch ? ` • ${student.branch}` : ""}`
                  : "PISTA student"}
              </span>
            </span>
          )}
        </Link>

        {/* ✅ The logout button, finally rendered */}
        <div className={`mt-1 ${collapsed ? "flex justify-center" : ""}`}>
          <LogoutButton iconOnly={collapsed} />
        </div>
      </div>
    </aside>
  );
}