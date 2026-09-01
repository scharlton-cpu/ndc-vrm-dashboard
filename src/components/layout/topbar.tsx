"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Search, Bell, LogOut, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { roleLabel } from "@/lib/permissions";
import { signOutAction } from "@/lib/actions/auth-signout";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Topbar({
  userName,
  userRoles,
}: {
  userName: string;
  userRoles: string[];
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length === 0) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-card px-3 sm:px-4">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav roles={userRoles} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <form onSubmit={onSearchSubmit} className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search voters, constituencies, polling divisions…"
          className="pl-8"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" asChild aria-label="Messages">
          <Link href="/messages">
            <Bell className="size-5" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-1.5">
              <Avatar className="size-7">
                <AvatarFallback>{initials(userName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{userName}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {userRoles.map(roleLabel).join(", ")}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <UserIcon /> Account settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => signOutAction()}
            >
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
