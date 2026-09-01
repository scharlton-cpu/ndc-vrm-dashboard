import {
  Users,
  Landmark,
  MapPinned,
  PhoneCall,
  MessagesSquare,
  Percent,
  Footprints,
  ClipboardList,
  CheckCircle2,
  UsersRound,
  ListChecks,
  Wallet,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ConstituencyTable } from "@/components/dashboard/constituency-table";
import { PollingDivisionTable } from "@/components/dashboard/polling-division-table";
import { ConstituencyBarChart } from "@/components/dashboard/charts/constituency-bar-chart";
import { ContactStatusDonut } from "@/components/dashboard/charts/contact-status-donut";
import { InteractionTrendChart } from "@/components/dashboard/charts/interaction-trend-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  getDashboardData,
  getConstituencyBreakdown,
  getContactStatusDistribution,
  getInteractionTrend,
  getPollingDivisionBreakdown,
} from "@/lib/queries/dashboard";
import { resolveConstituencyScope } from "@/lib/queries/scope";
import { formatCurrency, formatNumber, formatPct } from "@/lib/format";

export default async function CampaignHqPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();

  const filters = {
    constituencyId: typeof sp.constituencyId === "string" ? sp.constituencyId : undefined,
    pollingDivisionId: typeof sp.pollingDivisionId === "string" ? sp.pollingDivisionId : undefined,
    dateFrom: typeof sp.dateFrom === "string" ? sp.dateFrom : undefined,
    dateTo: typeof sp.dateTo === "string" ? sp.dateTo : undefined,
  };

  const scopeIds = resolveConstituencyScope(session, undefined);

  const [elections, constituencies, pollingDivisions, data, breakdown, contactDistribution, trend, pdBreakdown] =
    await Promise.all([
      prisma.election.findMany({ select: { id: true, name: true }, orderBy: { electionDate: "desc" } }),
      prisma.constituency.findMany({
        where: scopeIds ? { id: { in: scopeIds } } : {},
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.pollingDivision.findMany({
        where: scopeIds ? { constituencyId: { in: scopeIds } } : {},
        select: { id: true, name: true, constituencyId: true },
        orderBy: { name: "asc" },
      }),
      getDashboardData(session, filters),
      getConstituencyBreakdown(session),
      getContactStatusDistribution(session, filters),
      getInteractionTrend(session, filters),
      getPollingDivisionBreakdown(session, filters),
    ]);

  const { kpis, comparisonAvailable } = data;
  const delta = (v: number | null) => (comparisonAvailable ? v : undefined);

  return (
    <div>
      <PageHeader title="Campaign HQ" subtitle="Grenada National Campaign Overview" />

      <FilterBar elections={elections} constituencies={constituencies} pollingDivisions={pollingDivisions} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <KpiCard
          label="Registered Electors"
          value={formatNumber(kpis.registeredElectors)}
          caption="Official register benchmark"
          icon={Users}
          href="/voter-roll"
        />
        <KpiCard label="Constituencies" value={formatNumber(kpis.constituenciesCount)} icon={Landmark} />
        <KpiCard label="Polling Divisions" value={formatNumber(kpis.pollingDivisionsCount)} icon={MapPinned} />
        <KpiCard
          label="Voters Contacted"
          value={formatNumber(kpis.votersContacted)}
          caption={`of ${formatNumber(kpis.totalDetailedVoters)} in working file`}
          icon={PhoneCall}
          href="/voter-roll?contactStatus=CONTACTED"
        />
        <KpiCard
          label="Contact Coverage"
          value={formatPct(kpis.contactCoveragePct)}
          caption="Share of working voter file"
          icon={Percent}
        />
        <KpiCard
          label="Total Interactions"
          value={formatNumber(kpis.interactions.current)}
          delta={delta(kpis.interactions.delta)}
          icon={MessagesSquare}
        />
        <KpiCard
          label="Field Visits"
          value={formatNumber(kpis.fieldVisits.current)}
          delta={delta(kpis.fieldVisits.delta)}
          caption="Canvass sessions"
          icon={Footprints}
          href="/field-polling"
        />
        <KpiCard
          label="Issues Reported"
          value={formatNumber(kpis.issuesReported.current)}
          delta={delta(kpis.issuesReported.delta)}
          icon={ClipboardList}
          href="/issues"
          accent={kpis.issuesOpen > 20 ? "warning" : "default"}
        />
        <KpiCard
          label="Issues Resolved"
          value={formatNumber(kpis.issuesResolved)}
          caption={`${formatNumber(kpis.issuesOpen)} still open`}
          icon={CheckCircle2}
          href="/issues"
        />
        <KpiCard label="Active Volunteers" value={formatNumber(kpis.activeVolunteers)} icon={UsersRound} />
        <KpiCard
          label="Campaign Tasks"
          value={formatNumber(kpis.campaignTasksOpen)}
          caption="Open tasks"
          icon={ListChecks}
          href="/campaign-workflow"
        />
        <KpiCard
          label="Funds Raised"
          value={formatCurrency(kpis.fundsRaised.current)}
          delta={delta(kpis.fundsRaised.delta)}
          icon={Wallet}
          href="/finance"
        />
        <KpiCard label="Funds Pledged" value={formatCurrency(kpis.fundsPledged)} icon={PiggyBank} href="/finance" />
        <KpiCard
          label="Election Readiness"
          value={formatPct(kpis.electionReadinessPct)}
          icon={ShieldCheck}
          href="/election-readiness"
          accent={kpis.electionReadinessPct < 40 ? "destructive" : kpis.electionReadinessPct < 70 ? "warning" : "default"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Registered Electors by Constituency</CardTitle>
            <CardDescription>Official register benchmark, ranked descending</CardDescription>
          </CardHeader>
          <CardContent>
            <ConstituencyBarChart
              data={breakdown.map((b) => ({ name: b.name, registeredElectors: b.registeredElectors }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Status</CardTitle>
            <CardDescription>Working voter file, current filter</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactStatusDonut data={contactDistribution} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Interaction Trend</CardTitle>
            <CardDescription>Weekly campaign interactions, last 12 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <InteractionTrendChart data={trend} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Constituency Ranking</CardTitle>
            <CardDescription>Click a constituency to drill into its dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <ConstituencyTable rows={breakdown} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Polling Division Comparison</CardTitle>
            <CardDescription>
              {filters.constituencyId ? "All divisions in the selected constituency" : "Top 10 divisions nationally by register size"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PollingDivisionTable rows={pdBreakdown} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
