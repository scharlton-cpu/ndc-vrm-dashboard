import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function DeltaBadge({ delta }: { delta: number | null | undefined }) {
  if (delta === null || delta === undefined) return null;
  const flat = Math.abs(delta) < 0.5;
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
        flat
          ? "bg-muted text-muted-foreground"
          : up
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive"
      )}
    >
      {flat ? <Minus className="size-3" /> : up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(delta).toFixed(0)}%
    </span>
  );
}

export function KpiCard({
  label,
  value,
  caption,
  delta,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: string;
  caption?: string;
  delta?: number | null;
  icon?: LucideIcon;
  href?: string;
  accent?: "default" | "warning" | "destructive";
}) {
  const body = (
    <Card className={cn("h-full transition-colors", href && "hover:border-primary/40")}>
      <CardContent className="flex h-full flex-col gap-2 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-md",
                accent === "destructive"
                  ? "bg-destructive/10 text-destructive"
                  : accent === "warning"
                    ? "bg-warning/10 text-warning"
                    : "bg-secondary text-primary"
              )}
            >
              <Icon className="size-4" />
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <DeltaBadge delta={delta} />
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          {caption ? <p className="text-[11px] text-muted-foreground">{caption}</p> : <span />}
          {href && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              View <ArrowRight className="size-3" />
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return body;
  return (
    <Link href={href} className="group block h-full">
      {body}
    </Link>
  );
}
