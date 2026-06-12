import {
  BarChart3,
  Briefcase,
  Building2,
  LayoutDashboard,
  type LucideIcon,
  Plus,
  Users,
  UserSquare2,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Applications", href: "/applications", icon: Briefcase },
  { label: "Add Application", href: "/applications/new", icon: Plus },
  { label: "Company Research", href: "/research", icon: Building2 },
  { label: "Interviews", href: "/interviews", icon: Users },
  { label: "Recruiters", href: "/recruiters", icon: UserSquare2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];
