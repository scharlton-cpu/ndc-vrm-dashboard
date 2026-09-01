import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { AccessDenied } from "@/components/shared/access-denied";
import { AuditLogFilters } from "@/components/audit/audit-log-filters";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { canAccessModule } from "@/lib/permissions";
import { listAuditLogs } from "@/lib/queries/audit";

export const metadata = { title: "Audit Log" };

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!canAccessModule(session, "audit-log")) {
    return <AccessDenied module="the Audit Log" />;
  }

  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const params = {
    userId: str(sp.userId),
    action: str(sp.action),
    module: str(sp.module),
    recordType: str(sp.recordType),
    constituencyId: str(sp.constituencyId),
    dateFrom: str(sp.dateFrom),
    dateTo: str(sp.dateTo),
    page: sp.page ? Number(sp.page) : 1,
  };

  const [result, users, constituencies] = await Promise.all([
    listAuditLogs(params),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.constituency.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const df = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Immutable record of user actions across NDC VRM" />

      <AuditLogFilters
        users={users}
        constituencies={constituencies}
        actions={result.facets.actions}
        modules={result.facets.modules}
        recordTypes={result.facets.recordTypes}
      />

      <Card className="py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Record Type</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Constituency</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">{df.format(log.createdAt)}</TableCell>
                    <TableCell className="text-sm">{log.user?.name ?? "System"}</TableCell>
                    <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                    <TableCell className="text-sm">{log.recordType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.module ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.constituency?.name ?? "—"}</TableCell>
                    <TableCell className="max-w-64 truncate text-xs text-muted-foreground">
                      {log.newValue ? JSON.stringify(log.newValue) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {result.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      No audit entries match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationBar page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
        </CardContent>
      </Card>
    </div>
  );
}
