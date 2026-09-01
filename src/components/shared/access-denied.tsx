import { ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function AccessDenied({ module }: { module: string }) {
  return (
    <div>
      <PageHeader title="Access Restricted" />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <p className="text-sm font-medium text-foreground">You don&apos;t have access to {module}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            This module is restricted to specific roles. Contact your Administrator if you believe you should have access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
