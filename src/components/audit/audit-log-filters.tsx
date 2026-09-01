"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Option = { id: string; name: string };

export function AuditLogFilters({
  users,
  constituencies,
  actions,
  modules,
  recordTypes,
}: {
  users: Option[];
  constituencies: Option[];
  actions: string[];
  modules: string[];
  recordTypes: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const userId = searchParams.get("userId") ?? "";
  const action = searchParams.get("action") ?? "";
  const module_ = searchParams.get("module") ?? "";
  const recordType = searchParams.get("recordType") ?? "";
  const constituencyId = searchParams.get("constituencyId") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";
  const hasFilters = userId || action || module_ || recordType || constituencyId || dateFrom || dateTo;

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">User</Label>
        <Select value={userId || "ALL"} onValueChange={(v) => updateParam("userId", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any User</SelectItem>
            {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Action</Label>
        <Select value={action || "ALL"} onValueChange={(v) => updateParam("action", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any Action</SelectItem>
            {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Module</Label>
        <Select value={module_ || "ALL"} onValueChange={(v) => updateParam("module", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any Module</SelectItem>
            {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Record Type</Label>
        <Select value={recordType || "ALL"} onValueChange={(v) => updateParam("recordType", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any Type</SelectItem>
            {recordTypes.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Constituency</Label>
        <Select value={constituencyId || "ALL"} onValueChange={(v) => updateParam("constituencyId", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any Constituency</SelectItem>
            {constituencies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">From</Label>
        <Input type="date" value={dateFrom} onChange={(e) => updateParam("dateFrom", e.target.value || null)} className="h-8 w-36 text-xs" />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">To</Label>
        <Input type="date" value={dateTo} onChange={(e) => updateParam("dateTo", e.target.value || null)} className="h-8 w-36 text-xs" />
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)} className="gap-1.5 text-muted-foreground">
          <RotateCcw className="size-3.5" /> Reset
        </Button>
      )}
    </div>
  );
}
