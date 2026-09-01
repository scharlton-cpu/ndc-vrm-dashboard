import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, MapPinned, PhoneCall, Footprints, ClipboardList, CheckCircle2, UsersRound, CalendarDays, ListChecks, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PollingDivisionTable } from "@/components/dashboard/polling-division-table";
import { getConstituencyDetail } from "@/lib/queries/constituency";
import { getPollingDivisionBreakdown } from "@/lib/queries/dashboard";
import { formatNumber, formatPct } from "@/lib/format";

export default async function ConstituencyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const detail = await getConstituencyDetail(session, id);
  if (!detail) notFound();

  const pdRows = await getPollingDivisionBreakdown(session, { constituencyId: id });

  return (
    <div>
      <Link href="/" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Campaign HQ
      </Link>
      <PageHeader title={detail.constituency.name} subtitle={`${detail.constituency.parish} · Constituency Dashboard`} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Registered Electors" value={formatNumber(detail.registeredElectors)} icon={Users} />
        <KpiCard label="Polling Divisions" value={formatNumber(detail.pollingDivisionsCount)} icon={MapPinned} />
        <KpiCard label="Contact Coverage" value={formatPct(detail.contactCoveragePct)} caption={`${formatNumber(detail.votersContacted)} of ${formatNumber(detail.totalDetailed)}`} icon={PhoneCall} />
        <KpiCard label="Field Coverage" value={formatPct(detail.fieldCoveragePct)} caption="Canvassed share of working file" icon={Footprints} />
        <KpiCard label="Election Readiness" value={formatPct(detail.electionReadinessPct)} icon={ShieldCheck} href="/election-readiness" />
        <KpiCard label="Issues Raised" value={formatNumber(detail.issuesRaised)} icon={ClipboardList} href="/issues" />
        <KpiCard label="Issues Resolved" value={formatNumber(detail.issuesResolved)} caption={`${formatNumber(detail.issuesOpen)} still open`} icon={CheckCircle2} href="/issues" />
        <KpiCard label="Active Volunteers" value={formatNumber(detail.activeVolunteers)} icon={UsersRound} />
        <KpiCard label="Campaign Events" value={formatNumber(detail.campaignEvents)} caption="Logged event interactions" icon={CalendarDays} />
        <KpiCard label="Constituency Tasks" value={formatNumber(detail.tasksOpen)} caption={`of ${formatNumber(detail.tasksTotal)} total`} icon={ListChecks} href="/campaign-workflow" />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Polling Divisions in {detail.constituency.name}</h2>
        <PollingDivisionTable rows={pdRows} />
      </div>
    </div>
  );
}
