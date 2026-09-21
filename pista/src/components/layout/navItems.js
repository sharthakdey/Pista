import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  ListChecks,
  TrendingUp,
  CalendarDays,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "Study",
  },
  {
    to: "/tutor",
    label: "AI Tutor",
    icon: Sparkles,
    highlight: true,
    section: "Study",
  },
  {
    to: "/materials",
    label: "Materials",
    icon: BookOpen,
    section: "Study",
  },
  {
    to: "/quiz",
    label: "Quiz",
    icon: ListChecks,
    section: "Practice",
  },
  {
    to: "/progress",
    label: "Progress",
    icon: TrendingUp,
    section: "Progress",
  },
  {
    to: "/exams",
    label: "Exams",
    icon: CalendarDays,
    section: "Progress",
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    section: "Account",
  },
];

export const MOBILE_PRIMARY = [
  "/dashboard",
  "/tutor",
  "/quiz",
  "/progress",
];