import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <SidebarNav roles={session.user.roles} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={session.user.name ?? session.user.email ?? "User"} userRoles={session.user.roles} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
