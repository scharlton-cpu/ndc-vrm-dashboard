import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export type ConstituencyRow = {
  id: string;
  name: string;
  parish: string;
  registeredElectors: number;
  pollingDivisionsCount: number;
  coveragePct: number;
  issuesOpen: number;
};

export function ConstituencyTable({ rows }: { rows: ConstituencyRow[] }) {
  const nf = new Intl.NumberFormat();
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Constituency</TableHead>
            <TableHead>Parish</TableHead>
            <TableHead className="text-right">Registered Electors</TableHead>
            <TableHead className="text-right">Polling Divisions</TableHead>
            <TableHead>Contact Coverage</TableHead>
            <TableHead className="text-right">Open Issues</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} className="group">
              <TableCell className="font-medium text-foreground">
                <Link href={`/constituencies/${r.id}`} className="hover:underline">
                  {r.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{r.parish}</TableCell>
              <TableCell className="text-right tabular-nums">{nf.format(r.registeredElectors)}</TableCell>
              <TableCell className="text-right tabular-nums">{r.pollingDivisionsCount}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, r.coveragePct).toFixed(0)}%` }}
                    />
                  </div>
                  <span className="w-10 text-xs tabular-nums text-muted-foreground">{r.coveragePct.toFixed(0)}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {r.issuesOpen > 0 ? (
                  <Badge variant={r.issuesOpen > 10 ? "destructive" : "warning"}>{r.issuesOpen}</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell>
                <Link href={`/constituencies/${r.id}`}>
                  <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
