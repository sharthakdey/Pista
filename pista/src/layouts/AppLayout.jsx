import { Suspense, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import { MobileHeader, BottomNav } from "../components/layout/MobileNav.jsx";
import Toasts from "../components/ui/Toasts.jsx";
import { LoadingState } from "../components/ui/StateViews.jsx";

const FULL_BLEED = ["/tutor"];

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [tabletOpen, setTabletOpen] = useState(false);

  // desktop sidebar state
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // 🔐 AUTH GUARD: no token → straight to /login
  const authed = !!localStorage.getItem("pista:token");

  const fullBleed = FULL_BLEED.includes(pathname);

  useEffect(() => {
    if (!authed) navigate("/login", { replace: true });
  }, [authed, navigate]);

  useEffect(() => {
    setTabletOpen(false);
    if (!fullBleed) window.scrollTo({ top: 0 });
  }, [pathname, fullBleed]);

  if (!authed) return null; // guard: render nothing while redirecting

  return (
    <div className="min-h-dvh bg-surface">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar
          collapsed={desktopCollapsed}
          showToggle
          onToggle={() => setDesktopCollapsed(!desktopCollapsed)}
        />
      </div>

      {/* Tablet rail + overlay */}
      <div className="fixed inset-y-0 left-0 z-30 hidden md:block lg:hidden">
        <Sidebar collapsed showToggle onToggle={() => setTabletOpen(true)} />
      </div>
      {tabletOpen && (
        <div className="fixed inset-0 z-50 hidden md:block lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50 animate-fade-in" onClick={() => setTabletOpen(false)} />
          <div className="relative h-full w-fit animate-slide-in-left shadow-lift">
            <Sidebar showToggle onToggle={() => setTabletOpen(false)} onNavigate={() => setTabletOpen(false)} />
          </div>
        </div>
      )}

      <MobileHeader />

      <main
        className={`transition-[padding-left] duration-200 md:pl-[76px] ${desktopCollapsed ? "lg:pl-[76px]" : "lg:pl-[264px]"
          }`}
      >
        {fullBleed ? (
          <div key={pathname} className="animate-fade-in"><Suspense fallback={<RouteFallback />}><Outlet /></Suspense></div>
        ) : (
          <div key={pathname} className="mx-auto max-w-[1320px] animate-fade-in px-4 pb-28 pt-6 sm:px-6 md:pb-12 md:pt-10 lg:px-10">
            <Suspense fallback={<RouteFallback />}><Outlet /></Suspense>
          </div>
        )}
      </main>

      <BottomNav />
      <Toasts />
    </div>
  );
}

function RouteFallback() {
  return <LoadingState message="Opening your study space..." className="min-h-[50vh]" />;
}