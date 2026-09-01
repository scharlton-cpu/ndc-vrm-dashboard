import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  UserSearch,
  Workflow,
  MessagesSquare,
  Megaphone,
  ClipboardList,
  Newspaper,
  Radio,
  Images,
  MapPinned,
  Smartphone,
  Wallet,
  HeartHandshake,
  PiggyBank,
  Building2,
  Receipt,
  Banknote,
  Database,
  LineChart,
  Network,
  ShieldAlert,
  Landmark,
  Bot,
  Cog,
  CalendarCheck2,
  CalendarClock,
  History,
  UserCog,
  Settings,
  BookOpen,
  Search,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  status: "live" | "stub";
  roles?: string[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Campaign HQ",
    items: [
      { label: "Main Dashboard", href: "/", icon: LayoutDashboard, status: "live" },
      { label: "Voter Desk", href: "/voter-desk", icon: UserSearch, status: "live" },
      { label: "Campaign Workflow", href: "/campaign-workflow", icon: Workflow, status: "stub" },
      { label: "Messages", href: "/messages", icon: MessagesSquare, status: "stub" },
    ],
  },
  {
    label: "Strategy",
    items: [
      { label: "Candidates", href: "/candidates", icon: Megaphone, status: "stub" },
      { label: "Message Strategy", href: "/message-strategy", icon: Newspaper, status: "stub" },
      { label: "Issue Register", href: "/issues", icon: ClipboardList, status: "stub" },
    ],
  },
  {
    label: "Outreach",
    items: [
      { label: "Content Studio", href: "/content-studio", icon: Newspaper, status: "stub" },
      { label: "Channels", href: "/channels", icon: Radio, status: "stub" },
      { label: "Media & Ads", href: "/media-ads", icon: Images, status: "stub" },
      { label: "Field & Polling", href: "/field-polling", icon: MapPinned, status: "stub" },
      { label: "Field Tech", href: "/field-tech", icon: Smartphone, status: "stub" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Finance Overview", href: "/finance", icon: Wallet, status: "stub" },
      { label: "Donors", href: "/finance/donors", icon: HeartHandshake, status: "stub" },
      { label: "Fundraising", href: "/finance/fundraising", icon: PiggyBank, status: "stub" },
      { label: "Vendors", href: "/finance/vendors", icon: Building2, status: "stub" },
      { label: "Spending & Accounting", href: "/finance/spending", icon: Receipt, status: "stub" },
      { label: "Employee Payments", href: "/finance/payroll", icon: Banknote, status: "stub" },
    ],
  },
  {
    label: "Voter Intelligence",
    items: [
      { label: "Voter Roll", href: "/voter-roll", icon: Database, status: "live" },
      { label: "Query Centre", href: "/query-centre", icon: Search, status: "live" },
      { label: "Insights", href: "/insights", icon: LineChart, status: "stub" },
      { label: "Relationships", href: "/relationships", icon: Network, status: "stub" },
      { label: "Risk Register", href: "/risk-register", icon: ShieldAlert, status: "stub" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Governance", href: "/governance", icon: Landmark, status: "stub" },
      { label: "Automation", href: "/automation", icon: Cog, status: "stub" },
      { label: "Agent Workspace", href: "/agent-workspace", icon: Bot, status: "stub" },
    ],
  },
  {
    label: "Election Readiness",
    items: [
      { label: "Election Readiness", href: "/election-readiness", icon: CalendarCheck2, status: "stub" },
      { label: "Election Day Operations", href: "/election-day", icon: CalendarClock, status: "stub" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Audit Log", href: "/audit-log", icon: History, status: "live", roles: ["ADMINISTRATOR", "DATA_PROTECTION_LEAD"] },
      { label: "Users & Roles", href: "/users-roles", icon: UserCog, status: "stub", roles: ["ADMINISTRATOR"] },
      { label: "Settings", href: "/settings", icon: Settings, status: "stub" },
      { label: "User Guide", href: "/user-guide", icon: BookOpen, status: "stub" },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
