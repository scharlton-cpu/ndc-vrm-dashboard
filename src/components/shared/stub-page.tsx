import { Construction } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function StubPage({
  title,
  description,
  icon: Icon = Construction,
  phaseNote,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  phaseNote?: string;
}) {
  return (
    <div>
      <PageHeader title={title} subtitle={description} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            <Icon className="size-6" />
          </div>
          <p className="text-sm font-medium text-foreground">
            This module is scheduled for a later build phase
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {phaseNote ??
              "The database schema already supports this module. Screens will be built out in a follow-up phase."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
