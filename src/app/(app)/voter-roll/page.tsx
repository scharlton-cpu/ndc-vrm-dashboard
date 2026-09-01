import { Users, Landmark, MapPinned, CheckCircle2, PhoneCall, CalendarClock } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { VoterRollFilters } from "@/components/voter-roll/voter-roll-filters";
import { VoterTable } from "@/components/voter-roll/voter-table";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Card, CardContent } from "@/components/ui/card";
import { listVoters, getVoterRollStats } from "@/lib/queries/voters";
import { resolveConstituencyScope } from "@/lib/queries/scope";
import { formatNumber, formatPct } from "@/lib/format";

export const metadata = { title: "Voter Roll" };

export default async function VoterRollPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

  const params = {
    q: str(sp.q),
    constituencyId: str(sp.constituencyId),
    pollingDivisionId: str(sp.pollingDivisionId),
    contactStatus: str(sp.contactStatus),
    sex: str(sp.sex),
    dataQuality: str(sp.dataQuality),
    page: sp.page ? Number(sp.page) : 1,
  };

  const scopeIds = resolveConstituencyScope(session, undefined);
  const [stats, result, constituencies, pollingDivisions] = await Promise.all([
    getVoterRollStats(session),
    listVoters(session, params),
    prisma.constituency.findMany({ where: scopeIds ? { id: { in: scopeIds } } : {}, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.pollingDivision.findMany({ where: scopeIds ? { constituencyId: { in: scopeIds } } : {}, select: { id: true, name: true, constituencyId: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="National Voter Profile" subtitle="Voter register management and data quality overview" />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Registered Electors" value={formatNumber(stats.registeredElectors)} icon={Users} />
        <KpiCard label="Constituencies" value={formatNumber(stats.constituenciesCount)} icon={Landmark} />
        <KpiCard label="Polling Divisions" value={formatNumber(stats.pollingDivisionsCount)} icon={MapPinned} />
        <KpiCard label="Data Completeness" value={formatPct(stats.dataCompletenessPct)} caption="Sex, age, occupation known" icon={CheckCircle2} />
        <KpiCard label="Known Contact %" value={formatPct(stats.knownContactPct)} caption="Phone or email on file" icon={PhoneCall} />
        <KpiCard
          label="Last Register Update"
          value={stats.lastRegisterUpdate ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(stats.lastRegisterUpdate) : "—"}
          icon={CalendarClock}
        />
      </div>

      <VoterRollFilters constituencies={constituencies} pollingDivisions={pollingDivisions} />

      <Card className="py-0">
        <CardContent className="p-0">
          <VoterTable rows={result.rows} />
          <PaginationBar page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
        </CardContent>
      </Card>
    </div>
  );
}
