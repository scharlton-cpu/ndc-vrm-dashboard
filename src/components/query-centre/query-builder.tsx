"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Play, RotateCcw, Download, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { QueryRowEditor } from "@/components/query-centre/query-row";
import { QueryResultsTable, type QueryResultRow } from "@/components/query-centre/query-results-table";
import { SavedPanel } from "@/components/query-centre/saved-panel";
import { runQueryAction, exportQueryAction } from "@/lib/actions/query-centre";
import { describeQueryDefinition, type OptionLookup } from "@/lib/query-centre/describe";
import type { QueryDefinition, QueryGroup } from "@/lib/query-centre/fields";

function emptyRow() {
  return { id: crypto.randomUUID(), fieldId: "", operator: "" as const, value: "", value2: "" };
}
function emptyGroup(): QueryGroup {
  return { id: crypto.randomUUID(), conjunction: "AND", rows: [emptyRow()] };
}
function emptyDef(): QueryDefinition {
  return { groupConjunction: "AND", groups: [emptyGroup()] };
}

export function QueryBuilder({
  optionLookup,
  savedQueries,
  savedSegments,
}: {
  optionLookup: OptionLookup;
  savedQueries: { id: string; name: string; category: string; filterJson: unknown }[];
  savedSegments: { id: string; name: string; description: string | null; voterCount: number; kind: string }[];
}) {
  const [def, setDef] = useState<QueryDefinition>(emptyDef());
  const [rows, setRows] = useState<QueryResultRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pending, startTransition] = useTransition();
  const [hasRun, setHasRun] = useState(false);

  function run(p = 1) {
    startTransition(async () => {
      const result = await runQueryAction(def, p);
      setRows(result.rows as QueryResultRow[]);
      setTotal(result.total);
      setPage(result.page);
      setPageCount(result.pageCount);
      setHasRun(true);
    });
  }

  useEffect(() => {
    run(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateGroup(groupId: string, updater: (g: QueryGroup) => QueryGroup) {
    setDef((d) => ({ ...d, groups: d.groups.map((g) => (g.id === groupId ? updater(g) : g)) }));
  }

  function addGroup() {
    setDef((d) => ({ ...d, groups: [...d.groups, emptyGroup()] }));
  }
  function removeGroup(groupId: string) {
    setDef((d) => ({ ...d, groups: d.groups.filter((g) => g.id !== groupId) }));
  }
  function reset() {
    setDef(emptyDef());
  }

  async function handleExport() {
    const result = await exportQueryAction(def);
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ndc-vrm-query-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready");
  }

  const description = describeQueryDefinition(def, optionLookup);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <div className="order-2 lg:order-1">
        <SavedPanel savedQueries={savedQueries} savedSegments={savedSegments} currentDef={def} onLoad={setDef} />
      </div>

      <div className="order-1 flex flex-col gap-4 lg:order-2">
        <Card>
          <CardContent className="flex flex-col gap-3 pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Query Builder</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Combine groups with</span>
                <Select value={def.groupConjunction} onValueChange={(v) => setDef((d) => ({ ...d, groupConjunction: v as "AND" | "OR" }))}>
                  <SelectTrigger size="sm" className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {def.groups.map((group, gi) => (
              <div key={group.id}>
                {gi > 0 && (
                  <div className="my-2 flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-[11px] font-semibold text-muted-foreground">{def.groupConjunction}</span>
                    <Separator className="flex-1" />
                  </div>
                )}
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Match</span>
                      <Select
                        value={group.conjunction}
                        onValueChange={(v) => updateGroup(group.id, (g) => ({ ...g, conjunction: v as "AND" | "OR" }))}
                      >
                        <SelectTrigger size="sm" className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>of the following</span>
                    </div>
                    {def.groups.length > 1 && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => removeGroup(group.id)}>
                        Remove group
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {group.rows.map((row) => (
                      <QueryRowEditor
                        key={row.id}
                        row={row}
                        optionLookup={optionLookup}
                        onChange={(updated) =>
                          updateGroup(group.id, (g) => ({ ...g, rows: g.rows.map((r) => (r.id === row.id ? updated : r)) }))
                        }
                        onRemove={() => updateGroup(group.id, (g) => ({ ...g, rows: g.rows.filter((r) => r.id !== row.id) }))}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 gap-1.5 text-xs text-primary"
                    onClick={() => updateGroup(group.id, (g) => ({ ...g, rows: [...g.rows, emptyRow()] }))}
                  >
                    <Plus className="size-3.5" /> Add condition
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={addGroup}>
              <Plus className="size-3.5" /> Add group
            </Button>

            <div className="rounded-md bg-secondary px-3 py-2 text-xs text-secondary-foreground">{description}</div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" className="gap-1.5" onClick={() => run(1)} disabled={pending}>
                <Play className="size-3.5" /> Run Query
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={reset}>
                <RotateCcw className="size-3.5" /> Clear
              </Button>
              <Button variant="outline" size="sm" className="ml-auto gap-1.5" onClick={handleExport} disabled={!hasRun}>
                <Download className="size-3.5" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
                <Printer className="size-3.5" /> Print
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <p className="text-xs text-muted-foreground">
                {hasRun ? <><span className="font-medium text-foreground">{total.toLocaleString()}</span> voters match</> : "Run the query to see results"}
              </p>
            </div>
            <div className="overflow-x-auto">
              <QueryResultsTable rows={rows} loading={pending} />
            </div>
            {hasRun && total > 0 && (
              <div className="flex items-center justify-between border-t px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Page {page} of {pageCount}</p>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" disabled={page <= 1 || pending} onClick={() => run(page - 1)}>
                    <ChevronLeft className="size-4" /> Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= pageCount || pending} onClick={() => run(page + 1)}>
                    Next <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
