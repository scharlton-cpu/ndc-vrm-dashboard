import { CheckCircle2, HelpCircle, CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type DataQuality = "KNOWN" | "ESTIMATED" | "UNKNOWN";

const CONFIG: Record<DataQuality, { label: string; icon: typeof CheckCircle2; className: string; explain: string }> = {
  KNOWN: {
    label: "Known",
    icon: CheckCircle2,
    className: "border-transparent bg-success/10 text-success",
    explain: "Recorded directly in the official voter register.",
  },
  ESTIMATED: {
    label: "Estimated",
    icon: HelpCircle,
    className: "border-transparent bg-warning/10 text-warning",
    explain: "Not present in the register — inferred from field canvassing or a demographic estimate model. Treat as indicative, not verified.",
  },
  UNKNOWN: {
    label: "Unknown",
    icon: CircleDashed,
    className: "border-transparent bg-muted text-muted-foreground",
    explain: "No information on file from any source.",
  },
};

export function DataQualityBadge({ source, className }: { source: DataQuality; className?: string }) {
  const c = CONFIG[source];
  const Icon = c.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className={cn(c.className, "gap-1 cursor-help", className)}>
          <Icon className="size-3" />
          {c.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{c.explain}</TooltipContent>
    </Tooltip>
  );
}

export function DataField({
  label,
  value,
  source,
}: {
  label: string;
  value: React.ReactNode;
  source: DataQuality;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-foreground">{value ?? "—"}</p>
        <DataQualityBadge source={source} />
      </div>
    </div>
  );
}
