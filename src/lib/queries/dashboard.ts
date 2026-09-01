import type { Session } from "next-auth";

import { prisma } from "@/lib/prisma";
import { resolveConstituencyScope, type DashboardFilters } from "@/lib/queries/scope";

const CAMPAIGN_START = new Date("2026-02-01T00:00:00Z");

const READINESS_SCORE: Record<string, number> = {
  READY: 100,
  IN_PROGRESS: 60,
  AT_RISK: 30,
  BLOCKED: 10,
  NOT_STARTED: 0,
};

function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  return Number(v);
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null; // null = "new" / not comparable
  return ((current - previous) / previous) * 100;
}

export async function getDashboardData(session: Session | null, filters: DashboardFilters) {
  const constituencyIds = resolveConstituencyScope(session, filters.constituencyId);
  const pollingDivisionId = filters.pollingDivisionId || undefined;

  const comparisonAvailable = Boolean(filters.dateFrom || filters.dateTo);
  const now = new Date();
  const currentTo = filters.dateTo ? new Date(filters.dateTo) : now;
  const currentFrom = filters.dateFrom ? new Date(filters.dateFrom) : CAMPAIGN_START;
  const windowMs = currentTo.getTime() - currentFrom.getTime();
  const previousTo = new Date(currentFrom.getTime());
  const previousFrom = new Date(currentFrom.getTime() - windowMs);

  const pdWhere = {
    ...(constituencyIds ? { constituencyId: { in: constituencyIds } } : {}),
    ...(pollingDivisionId ? { id: pollingDivisionId } : {}),
  };
  const pollingDivisions = await prisma.pollingDivision.findMany({
    where: pdWhere,
    select: { id: true, constituencyId: true, registeredElectors: true },
  });
  const registeredElectors = pollingDivisions.reduce((s, p) => s + p.registeredElectors, 0);
  const constituenciesInScope = new Set(pollingDivisions.map((p) => p.constituencyId));

  const voterWhere = {
    ...(constituencyIds ? { constituencyId: { in: constituencyIds } } : {}),
    ...(pollingDivisionId ? { pollingDivisionId } : {}),
  };
  const [totalDetailedVoters, votersContacted] = await Promise.all([
    prisma.voter.count({ where: voterWhere }),
    prisma.voter.count({ where: { ...voterWhere, contactStatus: { not: "NOT_CONTACTED" } } }),
  ]);
  const contactCoveragePct = totalDetailedVoters > 0 ? (votersContacted / totalDetailedVoters) * 100 : 0;

  const interactionWhere = {
    ...(constituencyIds ? { constituencyId: { in: constituencyIds } } : {}),
    ...(pollingDivisionId ? { pollingDivisionId } : {}),
  };
  const [interactionsCurrent, interactionsPrevious] = await Promise.all([
    prisma.interaction.count({ where: { ...interactionWhere, occurredAt: { gte: currentFrom, lte: currentTo } } }),
    prisma.interaction.count({ where: { ...interactionWhere, occurredAt: { gte: previousFrom, lt: previousTo } } }),
  ]);

  const issueWhere = {
    ...(constituencyIds ? { constituencyId: { in: constituencyIds } } : {}),
    ...(pollingDivisionId ? { pollingDivisionId } : {}),
  };
  const [issuesReportedCurrent, issuesReportedPrevious, issuesResolved, issuesOpen] = await Promise.all([
    prisma.issue.count({ where: { ...issueWhere, firstReportedAt: { gte: currentFrom, lte: currentTo } } }),
    prisma.issue.count({ where: { ...issueWhere, firstReportedAt: { gte: previousFrom, lt: previousTo } } }),
    prisma.issue.count({ where: { ...issueWhere, status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.issue.count({ where: { ...issueWhere, status: { notIn: ["RESOLVED", "CLOSED"] } } }),
  ]);

  const canvasserWhere = constituencyIds
    ? { constituencyAccess: { some: { constituencyId: { in: constituencyIds } } } }
    : {};
  const [fieldVisitsCurrent, fieldVisitsPrevious, activeVolunteers] = await Promise.all([
    prisma.canvassSession.count({
      where: { startedAt: { gte: currentFrom, lte: currentTo }, canvasser: canvasserWhere },
    }),
    prisma.canvassSession.count({
      where: { startedAt: { gte: previousFrom, lt: previousTo }, canvasser: canvasserWhere },
    }),
    prisma.user.count({
      where: {
        active: true,
        roles: { some: { role: { key: { in: ["CANVASSER", "ORGANISER", "FIELD_COORDINATOR"] } } } },
        ...canvasserWhere,
      },
    }),
  ]);

  const taskWhere = constituencyIds ? { constituencyId: { in: constituencyIds } } : {};
  const campaignTasksOpen = await prisma.campaignTask.count({
    where: { ...taskWhere, status: { not: "DONE" } },
  });

  const donorWhere = constituencyIds ? { constituencyId: { in: constituencyIds } } : {};
  const [fundsRaisedCurrentAgg, fundsRaisedPreviousAgg, fundsPledgedAgg] = await Promise.all([
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { date: { gte: currentFrom, lte: currentTo }, donor: donorWhere },
    }),
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { date: { gte: previousFrom, lt: previousTo }, donor: donorWhere },
    }),
    prisma.donor.aggregate({ _sum: { amountPledged: true }, where: donorWhere }),
  ]);
  const fundsRaisedCurrent = toNumber(fundsRaisedCurrentAgg._sum.amount);
  const fundsRaisedPrevious = toNumber(fundsRaisedPreviousAgg._sum.amount);
  const fundsPledged = toNumber(fundsPledgedAgg._sum.amountPledged);

  const readinessWhere = constituencyIds
    ? { OR: [{ constituencyId: null }, { constituencyId: { in: constituencyIds } }] }
    : {};
  const readinessItems = await prisma.readinessItem.findMany({
    where: readinessWhere,
    select: { status: true },
  });
  const electionReadinessPct =
    readinessItems.length > 0
      ? readinessItems.reduce((s, r) => s + (READINESS_SCORE[r.status] ?? 0), 0) / readinessItems.length
      : 0;

  return {
    filters: { constituencyIds, pollingDivisionId, currentFrom, currentTo },
    comparisonAvailable,
    kpis: {
      registeredElectors,
      constituenciesCount: constituenciesInScope.size,
      pollingDivisionsCount: pollingDivisions.length,
      totalDetailedVoters,
      votersContacted,
      contactCoveragePct,
      interactions: { current: interactionsCurrent, previous: interactionsPrevious, delta: pctDelta(interactionsCurrent, interactionsPrevious) },
      fieldVisits: { current: fieldVisitsCurrent, previous: fieldVisitsPrevious, delta: pctDelta(fieldVisitsCurrent, fieldVisitsPrevious) },
      issuesReported: { current: issuesReportedCurrent, previous: issuesReportedPrevious, delta: pctDelta(issuesReportedCurrent, issuesReportedPrevious) },
      issuesResolved,
      issuesOpen,
      activeVolunteers,
      campaignTasksOpen,
      fundsRaised: { current: fundsRaisedCurrent, previous: fundsRaisedPrevious, delta: pctDelta(fundsRaisedCurrent, fundsRaisedPrevious) },
      fundsPledged,
      electionReadinessPct,
    },
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getConstituencyBreakdown(session: Session | null) {
  const constituencyIds = resolveConstituencyScope(session, undefined);

  const constituencies = await prisma.constituency.findMany({
    where: constituencyIds ? { id: { in: constituencyIds } } : {},
    select: { id: true, name: true, code: true, parish: true, registeredElectors: true, _count: { select: { pollingDivisions: true } } },
    orderBy: { registeredElectors: "desc" },
  });

  const ids = constituencies.map((c) => c.id);
  const [totalByConstituency, contactedByConstituency, openIssuesByConstituency] = await Promise.all([
    prisma.voter.groupBy({ by: ["constituencyId"], _count: { _all: true }, where: { constituencyId: { in: ids } } }),
    prisma.voter.groupBy({
      by: ["constituencyId"],
      _count: { _all: true },
      where: { constituencyId: { in: ids }, contactStatus: { not: "NOT_CONTACTED" } },
    }),
    prisma.issue.groupBy({
      by: ["constituencyId"],
      _count: { _all: true },
      where: { constituencyId: { in: ids }, status: { notIn: ["RESOLVED", "CLOSED"] } },
    }),
  ]);
  const totalMap = new Map(totalByConstituency.map((r) => [r.constituencyId, r._count._all]));
  const contactedMap = new Map(contactedByConstituency.map((r) => [r.constituencyId, r._count._all]));
  const issuesMap = new Map(openIssuesByConstituency.map((r) => [r.constituencyId, r._count._all]));

  return constituencies.map((c) => {
    const total = totalMap.get(c.id) ?? 0;
    const contacted = contactedMap.get(c.id) ?? 0;
    return {
      id: c.id,
      name: c.name,
      code: c.code,
      parish: c.parish,
      registeredElectors: c.registeredElectors,
      pollingDivisionsCount: c._count.pollingDivisions,
      totalDetailedVoters: total,
      votersContacted: contacted,
      coveragePct: total > 0 ? (contacted / total) * 100 : 0,
      issuesOpen: issuesMap.get(c.id) ?? 0,
    };
  });
}

export async function getContactStatusDistribution(session: Session | null, filters: DashboardFilters) {
  const constituencyIds = resolveConstituencyScope(session, filters.constituencyId);
  const where = {
    ...(constituencyIds ? { constituencyId: { in: constituencyIds } } : {}),
    ...(filters.pollingDivisionId ? { pollingDivisionId: filters.pollingDivisionId } : {}),
  };
  const groups = await prisma.voter.groupBy({ by: ["contactStatus"], _count: { _all: true }, where });
  return groups.map((g) => ({ status: g.contactStatus, count: g._count._all }));
}

export async function getPollingDivisionBreakdown(
  session: Session | null,
  filters: DashboardFilters,
  limit = 10
) {
  const constituencyIds = resolveConstituencyScope(session, filters.constituencyId);
  const where = constituencyIds ? { constituencyId: { in: constituencyIds } } : {};

  const pds = await prisma.pollingDivision.findMany({
    where,
    select: { id: true, name: true, code: true, registeredElectors: true, constituencyId: true, constituency: { select: { name: true } } },
    orderBy: { registeredElectors: "desc" },
    ...(filters.constituencyId ? {} : { take: limit }),
  });
  const ids = pds.map((p) => p.id);
  const [totalByPd, contactedByPd] = await Promise.all([
    prisma.voter.groupBy({ by: ["pollingDivisionId"], _count: { _all: true }, where: { pollingDivisionId: { in: ids } } }),
    prisma.voter.groupBy({
      by: ["pollingDivisionId"],
      _count: { _all: true },
      where: { pollingDivisionId: { in: ids }, contactStatus: { not: "NOT_CONTACTED" } },
    }),
  ]);
  const totalMap = new Map(totalByPd.map((r) => [r.pollingDivisionId, r._count._all]));
  const contactedMap = new Map(contactedByPd.map((r) => [r.pollingDivisionId, r._count._all]));

  return pds.map((p) => {
    const total = totalMap.get(p.id) ?? 0;
    const contacted = contactedMap.get(p.id) ?? 0;
    return {
      id: p.id,
      name: p.name,
      code: p.code,
      constituencyId: p.constituencyId,
      constituencyName: p.constituency.name,
      registeredElectors: p.registeredElectors,
      totalDetailedVoters: total,
      votersContacted: contacted,
      coveragePct: total > 0 ? (contacted / total) * 100 : 0,
    };
  });
}

export async function getInteractionTrend(session: Session | null, filters: DashboardFilters) {
  const constituencyIds = resolveConstituencyScope(session, filters.constituencyId);
  const since = new Date();
  since.setDate(since.getDate() - 7 * 12);
  const where = {
    ...(constituencyIds ? { constituencyId: { in: constituencyIds } } : {}),
    ...(filters.pollingDivisionId ? { pollingDivisionId: filters.pollingDivisionId } : {}),
    occurredAt: { gte: since },
  };
  const rows = await prisma.interaction.findMany({ where, select: { occurredAt: true } });

  const buckets = new Map<string, number>();
  for (const r of rows) {
    const weekStart = new Date(r.occurredAt);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, count]) => ({ week, count }));
}
