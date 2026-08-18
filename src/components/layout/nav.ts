import {
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Cpu,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  RefreshCcw,
  Settings as SettingsIcon,
  Sparkles,
  Table2,
  TriangleAlert,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}

export const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Faculty", to: "/admin/faculty", icon: Users },
  { label: "Sections", to: "/admin/sections", icon: GraduationCap },
  { label: "Subjects", to: "/admin/subjects", icon: ClipboardList },
  { label: "Classrooms", to: "/admin/classrooms", icon: Building2 },
  { label: "Labs", to: "/admin/labs", icon: Cpu },
  { label: "Availability", to: "/admin/availability", icon: UserCheck },
  { label: "Constraints", to: "/admin/constraints", icon: ListChecks },
  { label: "Smart Scheduler", to: "/admin/scheduler", icon: Sparkles },
  { label: "Timetable", to: "/admin/timetable", icon: Table2 },
  { label: "Conflicts", to: "/admin/conflicts", icon: TriangleAlert },
  { label: "Rescheduling", to: "/admin/rescheduling", icon: RefreshCcw },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Notifications", to: "/admin/notifications", icon: Bell },
  { label: "Settings", to: "/admin/settings", icon: SettingsIcon },
];

export const facultyNav: NavItem[] = [
  { label: "Dashboard", to: "/faculty", icon: LayoutDashboard },
  { label: "My Timetable", to: "/faculty/timetable", icon: Table2 },
  { label: "My Availability", to: "/faculty/availability", icon: UserCheck },
  { label: "My Classes", to: "/faculty/classes", icon: CalendarDays },
  { label: "Reschedule Request", to: "/faculty/reschedule", icon: CalendarClock },
  { label: "Notifications", to: "/faculty/notifications", icon: Bell },
  { label: "Profile", to: "/faculty/profile", icon: User },
];

export const studentNav: NavItem[] = [
  { label: "Dashboard", to: "/student", icon: LayoutDashboard },
  { label: "My Timetable", to: "/student/timetable", icon: Table2 },
  { label: "Today's Classes", to: "/student/today", icon: CalendarDays },
  { label: "Classroom Info", to: "/student/classrooms", icon: Building2 },
  { label: "Notifications", to: "/student/notifications", icon: Bell },
  { label: "Profile", to: "/student/profile", icon: User },
];

export const navByRole: Record<Role, NavItem[]> = {
  admin: adminNav,
  faculty: facultyNav,
  student: studentNav,
};
