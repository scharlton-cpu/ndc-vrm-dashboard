"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Option = { id: string; name: string; constituencyId?: string };

export function VoterDeskSearch({ constituencies, pollingDivisions }: { constituencies: Option[]; pollingDivisions: Option[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const constituencyId = searchParams.get("constituencyId") ?? "";
  const pollingDivisionId = searchParams.get("pollingDivisionId") ?? "";
  const availablePDs = constituencyId ? pollingDivisions.filter((p) => p.constituencyId === constituencyId) : pollingDivisions;

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "constituencyId") params.delete("pollingDivisionId");
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (q !== (searchParams.get("q") ?? "")) updateParam("q", q || null);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="rounded-lg border bg-card p-4">
      <Label className="text-xs text-muted-foreground">Search by name, phone, voter ID, or email</Label>
      <div className="relative mt-1.5">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Charles, +1 473-403-8842, GD1002345"
          className="h-11 pl-9 text-sm"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] text-muted-foreground">Constituency</Label>
          <Select value={constituencyId || "ALL"} onValueChange={(v) => updateParam("constituencyId", v === "ALL" ? null : v)}>
            <SelectTrigger size="sm" className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Constituencies</SelectItem>
              {constituencies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] text-muted-foreground">Polling Division</Label>
          <Select value={pollingDivisionId || "ALL"} onValueChange={(v) => updateParam("pollingDivisionId", v === "ALL" ? null : v)}>
            <SelectTrigger size="sm" className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Polling Divisions</SelectItem>
              {availablePDs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
