"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Download, RotateCcw } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = { id: string; name: string; constituencyId?: string };

export function VoterRollFilters({
  constituencies,
  pollingDivisions,
}: {
  constituencies: Option[];
  pollingDivisions: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const constituencyId = searchParams.get("constituencyId") ?? "";
  const pollingDivisionId = searchParams.get("pollingDivisionId") ?? "";
  const contactStatus = searchParams.get("contactStatus") ?? "";
  const sex = searchParams.get("sex") ?? "";
  const dataQuality = searchParams.get("dataQuality") ?? "";

  const availablePDs = constituencyId ? pollingDivisions.filter((p) => p.constituencyId === constituencyId) : pollingDivisions;

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    if (key === "constituencyId") params.delete("pollingDivisionId");
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (q !== (searchParams.get("q") ?? "")) updateParam("q", q || null);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilters = q || constituencyId || pollingDivisionId || contactStatus || sex || dataQuality;
  const exportHref = `/api/voters/export?${searchParams.toString()}`;

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, voter ID, phone, email"
            className="h-8 w-56 pl-7 text-xs"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Constituency</Label>
        <Select value={constituencyId || "ALL"} onValueChange={(v) => updateParam("constituencyId", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Constituencies</SelectItem>
            {constituencies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Polling Division</Label>
        <Select value={pollingDivisionId || "ALL"} onValueChange={(v) => updateParam("pollingDivisionId", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Polling Divisions</SelectItem>
            {availablePDs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Contact Status</Label>
        <Select value={contactStatus || "ALL"} onValueChange={(v) => updateParam("contactStatus", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any Status</SelectItem>
            <SelectItem value="NOT_CONTACTED">Not Contacted</SelectItem>
            <SelectItem value="ATTEMPTED">Attempted</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="REFUSED">Refused</SelectItem>
            <SelectItem value="MOVED">Moved</SelectItem>
            <SelectItem value="DECEASED">Deceased</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Sex</Label>
        <Select value={sex || "ALL"} onValueChange={(v) => updateParam("sex", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any</SelectItem>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[11px] text-muted-foreground">Data Status</Label>
        <Select value={dataQuality || "ALL"} onValueChange={(v) => updateParam("dataQuality", v === "ALL" ? null : v)}>
          <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any</SelectItem>
            <SelectItem value="KNOWN">Known</SelectItem>
            <SelectItem value="ESTIMATED">Estimated</SelectItem>
            <SelectItem value="UNKNOWN">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => router.push(pathname)} className="gap-1.5 text-muted-foreground">
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        )}
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <a href={exportHref}>
            <Download className="size-3.5" /> Export CSV
          </a>
        </Button>
      </div>
    </div>
  );
}
