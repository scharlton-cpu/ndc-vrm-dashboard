import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, PhoneCall, Footprints, MessagesSquare, ClipboardList, Home, UsersRound, CalendarClock } from "lucide-react";

import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MapPlaceholder } from "@/components/shared/map-placeholder";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getPollingDivisionDetail } from "@/lib/queries/constituency";
import { formatNumber, formatPct } from "@/lib/format";
import { READINESS_STATUS_LABEL, READINESS_STATUS_VARIANT } from "@/lib/labels";

export default async function PollingDivisionPage({ params }: { params: Promise<{ id: string; pdId: string }> }) {
  const { id, pdId } = await params;
  const session = await auth();
  const detail = await getPollingDivisionDetail(session, pdId);
  if (!detail || detail.pollingDivision.constituencyId !== id) notFound();

  const df = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <Link href={`/constituencies/${id}`} className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to {detail.pollingDivision.constituency.name}
      </Link>
      <PageHeader title={detail.pollingDivision.name} subtitle={`${detail.pollingDivision.constituency.name} · Polling Division Dashboard`} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Registered Electors" value={formatNumber(detail.pollingDivision.registeredElectors)} icon={Users} />
        <KpiCard
          label="Contact Coverage"
          value={formatPct(detail.contactCoveragePct)}
          caption={`${formatNumber(detail.votersContacted)} of ${formatNumber(detail.totalDetailed)}`}
          icon={PhoneCall}
        />
        <KpiCard
          label="Canvassing Progress"
          value={formatPct(detail.canvassingProgressPct)}
          caption={`${formatNumber(detail.votersRevisitNeeded)} need revisit`}
          icon={Footprints}
        />
        <KpiCard label="Interactions" value={formatNumber(detail.interactionsTotal)} icon={MessagesSquare} />
        <KpiCard label="Reported Issues" value={formatNumber(detail.issuesCount)} icon={ClipboardList} href="/issues" />
        <KpiCard
          label="Households Visited"
          value={formatNumber(detail.householdsVisited)}
          caption={`of ${formatNumber(detail.households)} on file`}
          icon={Home}
        />
        <KpiCard label="Outstanding Field Work" value={formatNumber(detail.outstandingFieldWork)} caption="Not yet canvassed" icon={Footprints} />
        <KpiCard label="Volunteer Assignments" value={formatNumber(detail.volunteerNames.length)} caption="Distinct staff active here" icon={UsersRound} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Polling division boundary and location</CardDescription>
          </CardHeader>
          <CardContent>
            <MapPlaceholder label={detail.pollingDivision.name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Election Day Readiness</CardTitle>
              <CardDescription>Polling location operations plan</CardDescription>
            </div>
            <CalendarClock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {!detail.electionDayOp ? (
              <EmptyState
                icon={CalendarClock}
                message="No Election Day operations plan recorded for this polling division yet. Plans are managed in Election Day Operations."
              />
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={READINESS_STATUS_VARIANT[detail.electionDayOp.status]}>{READINESS_STATUS_LABEL[detail.electionDayOp.status]}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Poll Workers</span>
                  <span>{detail.electionDayOp.pollWorkersAssigned} / {detail.electionDayOp.pollWorkersRequired}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sign Holders</span>
                  <span>{detail.electionDayOp.signHoldersAssigned} / {detail.electionDayOp.signHoldersRequired}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Drivers</span>
                  <span>{detail.electionDayOp.driversAssigned} / {detail.electionDayOp.driversRequired}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest logged interactions in this polling division</CardDescription>
          </CardHeader>
          <CardContent>
            {detail.recentInteractions.length === 0 ? (
              <EmptyState message="No interactions logged in this polling division yet." />
            ) : (
              <ul className="divide-y">
                {detail.recentInteractions.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                    <div>
                      <span className="font-medium text-foreground">{i.type.label}</span>{" "}
                      <span className="text-muted-foreground">with {i.voter.firstName} {i.voter.lastName}</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {df.format(i.occurredAt)} {i.recordedBy ? `· ${i.recordedBy.name}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
