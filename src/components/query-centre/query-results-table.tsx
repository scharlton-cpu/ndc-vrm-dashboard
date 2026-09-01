import Link from "next/link";
import { Phone, Mail } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataQualityBadge } from "@/components/shared/data-quality-badge";
import { CONTACT_STATUS_LABEL, CONTACT_STATUS_VARIANT, CANVASS_STATUS_LABEL } from "@/lib/labels";

export type QueryResultRow = {
  id: string;
  voterNumber: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  contactStatus: string;
  canvassStatus: string;
  interactionCount: number;
  lastContactAt: Date | null;
  overallDataQuality: "KNOWN" | "ESTIMATED" | "UNKNOWN";
  recordSource: string;
  constituency: { name: string };
  pollingDivision: { name: string };
  _count: { issueReports: number };
};

export function QueryResultsTable({ rows, loading }: { rows: QueryResultRow[]; loading: boolean }) {
  const df = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
  return (
    <div className={loading ? "opacity-50 transition-opacity" : "transition-opacity"}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Voter ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Constituency</TableHead>
            <TableHead>Polling Division</TableHead>
            <TableHead>Contact Status</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Last Contact</TableHead>
            <TableHead className="text-right">Interactions</TableHead>
            <TableHead className="text-right">Issues Raised</TableHead>
            <TableHead>Field Visit Status</TableHead>
            <TableHead>Data Quality</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <Link href={`/voters/${v.id}`} className="font-mono text-xs text-primary hover:underline">{v.voterNumber}</Link>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                <Link href={`/voters/${v.id}`} className="hover:underline">{v.firstName} {v.lastName}</Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{v.constituency.name}</TableCell>
              <TableCell className="text-muted-foreground">{v.pollingDivision.name}</TableCell>
              <TableCell><Badge variant={CONTACT_STATUS_VARIANT[v.contactStatus]}>{CONTACT_STATUS_LABEL[v.contactStatus]}</Badge></TableCell>
              <TableCell><Phone className={v.phone ? "size-3.5 text-success" : "size-3.5 opacity-30"} /></TableCell>
              <TableCell><Mail className={v.email ? "size-3.5 text-success" : "size-3.5 opacity-30"} /></TableCell>
              <TableCell className="text-xs text-muted-foreground">{v.lastContactAt ? df.format(new Date(v.lastContactAt)) : "—"}</TableCell>
              <TableCell className="text-right tabular-nums">{v.interactionCount}</TableCell>
              <TableCell className="text-right tabular-nums">{v._count.issueReports}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{CANVASS_STATUS_LABEL[v.canvassStatus]}</TableCell>
              <TableCell><DataQualityBadge source={v.overallDataQuality} /></TableCell>
              <TableCell className="max-w-32 truncate text-xs text-muted-foreground">{v.recordSource}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={13} className="py-14 text-center text-sm text-muted-foreground">
                No voters match this query.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
