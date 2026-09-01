"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Vote } from "lucide-react";

import { NAV_GROUPS } from "@/config/nav";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav({
  roles,
  onNavigate,
}: {
  roles: string[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Vote className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">NDC VRM</p>
          <p className="truncate text-[11px] leading-tight text-sidebar-foreground/60">
            Campaign HQ
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2 pb-4 scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.roles || item.roles.some((r) => roles.includes(r))
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-white font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.status === "stub" && (
                          <Badge
                            variant="outline"
                            className="ml-auto border-sidebar-foreground/25 px-1 py-0 text-[9px] text-sidebar-foreground/50"
                          >
                            soon
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
