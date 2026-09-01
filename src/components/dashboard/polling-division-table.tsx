import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type PollingDivisionRow = {
  id: string;
  name: string;
  constituencyId: string;
  constituencyName: string;
  registeredElectors: number;
  coveragePct: number;
};

export function PollingDivisionTable({ rows }: { rows: PollingDivisionRow[] }) {
  const nf = new Intl.NumberFormat();
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Polling Division</TableHead>
            <TableHead>Constituency</TableHead>
            <TableHead className="text-right">Registered Electors</TableHead>
            <TableHead>Contact Coverage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium text-foreground">
                <Link href={`/constituencies/${r.constituencyId}/polling-divisions/${r.id}`} className="hover:underline">
                  {r.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{r.constituencyName}</TableCell>
              <TableCell className="text-right tabular-nums">{nf.format(r.registeredElectors)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, r.coveragePct).toFixed(0)}%` }} />
                  </div>
                  <span className="w-10 text-xs tabular-nums text-muted-foreground">{r.coveragePct.toFixed(0)}%</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
