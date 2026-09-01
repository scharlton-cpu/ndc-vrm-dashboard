import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({ icon: Icon = Inbox, message }: { icon?: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <Icon className="size-6 text-muted-foreground/60" />
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
