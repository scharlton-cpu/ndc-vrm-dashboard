import Link from "next/link";
import { Phone, Mail } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataQualityBadge } from "@/components/shared/data-quality-badge";
import { CONTACT_STATUS_LABEL, CONTACT_STATUS_VARIANT } from "@/lib/labels";

type VoterListRow = {
  id: string;
  voterNumber: string;
  firstName: string;
  lastName: string;
  sex: string | null;
  ageBand: string | null;
  occupation: string | null;
  phone: string | null;
  email: string | null;
  contactStatus: string;
  overallDataQuality: "KNOWN" | "ESTIMATED" | "UNKNOWN";
  recordSource: string;
  updatedAt: Date;
  constituency: { id: string; name: string };
  pollingDivision: { id: string; name: string };
};

export function VoterTable({ rows }: { rows: VoterListRow[] }) {
  const df = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Voter ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Constituency</TableHead>
            <TableHead>Polling Division</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Age Band</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Contactability</TableHead>
            <TableHead>Contact Status</TableHead>
            <TableHead>Data Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <Link href={`/voters/${v.id}`} className="font-mono text-xs text-primary hover:underline">
                  {v.voterNumber}
                </Link>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                <Link href={`/voters/${v.id}`} className="hover:underline">
                  {v.firstName} {v.lastName}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{v.constituency.name}</TableCell>
              <TableCell className="text-muted-foreground">{v.pollingDivision.name}</TableCell>
              <TableCell>{v.sex ? (v.sex === "MALE" ? "M" : "F") : "—"}</TableCell>
              <TableCell>{v.ageBand ?? "—"}</TableCell>
              <TableCell className="max-w-40 truncate">{v.occupation ?? "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className={v.phone ? "size-3.5 text-success" : "size-3.5 opacity-30"} />
                  <Mail className={v.email ? "size-3.5 text-success" : "size-3.5 opacity-30"} />
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={CONTACT_STATUS_VARIANT[v.contactStatus]}>{CONTACT_STATUS_LABEL[v.contactStatus]}</Badge>
              </TableCell>
              <TableCell>
                <DataQualityBadge source={v.overallDataQuality} />
              </TableCell>
              <TableCell className="max-w-36 truncate text-xs text-muted-foreground">{v.recordSource}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{df.format(new Date(v.updatedAt))}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={12} className="py-12 text-center text-sm text-muted-foreground">
                No voters match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
