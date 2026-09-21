import { LayoutDashboard, Sparkles, BookOpen, ListChecks, TrendingUp, CalendarDays, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tutor", label: "AI Tutor", icon: Sparkles, highlight: true },
  { to: "/materials", label: "Materials", icon: BookOpen },
  { to: "/quiz", label: "Quiz", icon: ListChecks },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/exams", label: "Exams", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const MOBILE_PRIMARY = ["/dashboard", "/tutor", "/quiz", "/progress"];
