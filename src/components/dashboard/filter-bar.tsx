"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Option = { id: string; name: string; constituencyId?: string };

export function FilterBar({
  elections,
  constituencies,
  pollingDivisions,
}: {
  elections: Option[];
  constituencies: Option[];
  pollingDivisions: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const constituencyId = searchParams.get("constituencyId") ?? "";
  const pollingDivisionId = searchParams.get("pollingDivisionId") ?? "";
  const electionId = searchParams.get("electionId") ?? elections[0]?.id ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const availablePDs = useMemo(
    () => (constituencyId ? pollingDivisions.filter((p) => p.constituencyId === constituencyId) : pollingDivisions),
    [constituencyId, pollingDivisions]
  );

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "constituencyId") params.delete("pollingDivisionId");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = constituencyId || pollingDivisionId || dateFrom || dateTo;

  return (
    <div className="mb-5 flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Election Cycle</Label>
        <Select value={electionId} onValueChange={(v) => updateParam("electionId", v)}>
          <SelectTrigger size="sm" className="w-48"><SelectValue placeholder="Election cycle" /></SelectTrigger>
          <SelectContent>
            {elections.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Constituency</Label>
        <Select value={constituencyId || "ALL"} onValueChange={(v) => updateParam("constituencyId", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-56"><SelectValue placeholder="All Constituencies" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Constituencies</SelectItem>
            {constituencies.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Polling Division</Label>
        <Select value={pollingDivisionId || "ALL"} onValueChange={(v) => updateParam("pollingDivisionId", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-56"><SelectValue placeholder="All Polling Divisions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Polling Divisions</SelectItem>
            {availablePDs.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">From</Label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => updateParam("dateFrom", e.target.value || null)}
          className="h-8 w-36 text-xs"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">To</Label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => updateParam("dateTo", e.target.value || null)}
          className="h-8 w-36 text-xs"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)} className="gap-1.5 text-muted-foreground">
          <RotateCcw className="size-3.5" /> Reset
        </Button>
      )}
    </div>
  );
}
