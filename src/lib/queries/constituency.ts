import type { Session } from "next-auth";

import { prisma } from "@/lib/prisma";
import { resolveConstituencyScope } from "@/lib/queries/scope";

const READINESS_SCORE: Record<string, number> = {
  READY: 100,
  IN_PROGRESS: 60,
  AT_RISK: 30,
  BLOCKED: 10,
  NOT_STARTED: 0,
};

export async function getConstituencyDetail(session: Session | null, constituencyId: string) {
  const scope = resolveConstituencyScope(session, constituencyId);
  if (scope && !scope.includes(constituencyId)) return null;

  const constituency = await prisma.constituency.findUnique({ where: { id: constituencyId } });
  if (!constituency) return null;

  const [
    pollingDivisions,
    totalDetailed,
    votersContacted,
    votersCanvassed,
    issuesRaised,
    issuesResolved,
    activeVolunteers,
    interactionsTotal,
    campaignEvents,
    tasksOpen,
    tasksTotal,
    readinessItems,
  ] = await Promise.all([
    prisma.pollingDivision.findMany({ where: { constituencyId }, select: { id: true, registeredElectors: true } }),
    prisma.voter.count({ where: { constituencyId } }),
    prisma.voter.count({ where: { constituencyId, contactStatus: { not: "NOT_CONTACTED" } } }),
    prisma.voter.count({ where: { constituencyId, canvassStatus: "CANVASSED" } }),
    prisma.issue.count({ where: { constituencyId } }),
    prisma.issue.count({ where: { constituencyId, status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.user.count({
      where: {
        active: true,
        roles: { some: { role: { key: { in: ["CANVASSER", "ORGANISER", "FIELD_COORDINATOR"] } } } },
        constituencyAccess: { some: { constituencyId } },
      },
    }),
    prisma.interaction.count({ where: { constituencyId } }),
    prisma.interaction.count({ where: { constituencyId, type: { category: "EVENT" } } }),
    prisma.campaignTask.count({ where: { constituencyId, status: { not: "DONE" } } }),
    prisma.campaignTask.count({ where: { constituencyId } }),
    prisma.readinessItem.findMany({ where: { OR: [{ constituencyId: null }, { constituencyId }] }, select: { status: true } }),
  ]);

  const registeredElectors = pollingDivisions.reduce((s, p) => s + p.registeredElectors, 0);
  const electionReadinessPct =
    readinessItems.length > 0 ? readinessItems.reduce((s, r) => s + (READINESS_SCORE[r.status] ?? 0), 0) / readinessItems.length : 0;

  return {
    constituency,
    registeredElectors,
    pollingDivisionsCount: pollingDivisions.length,
    totalDetailed,
    votersContacted,
    contactCoveragePct: totalDetailed > 0 ? (votersContacted / totalDetailed) * 100 : 0,
    votersCanvassed,
    fieldCoveragePct: totalDetailed > 0 ? (votersCanvassed / totalDetailed) * 100 : 0,
    issuesRaised,
    issuesResolved,
    issuesOpen: issuesRaised - issuesResolved,
    activeVolunteers,
    interactionsTotal,
    campaignEvents,
    tasksOpen,
    tasksTotal,
    electionReadinessPct,
  };
}

export async function getPollingDivisionDetail(session: Session | null, pollingDivisionId: string) {
  const pd = await prisma.pollingDivision.findUnique({ where: { id: pollingDivisionId }, include: { constituency: true } });
  if (!pd) return null;
  const scope = resolveConstituencyScope(session, pd.constituencyId);
  if (scope && !scope.includes(pd.constituencyId)) return null;

  const [
    totalDetailed,
    votersContacted,
    votersCanvassed,
    votersRevisitNeeded,
    interactionsTotal,
    recentInteractions,
    issuesCount,
    households,
    householdsVisited,
    volunteerNames,
    electionDayOp,
  ] = await Promise.all([
    prisma.voter.count({ where: { pollingDivisionId } }),
    prisma.voter.count({ where: { pollingDivisionId, contactStatus: { not: "NOT_CONTACTED" } } }),
    prisma.voter.count({ where: { pollingDivisionId, canvassStatus: "CANVASSED" } }),
    prisma.voter.count({ where: { pollingDivisionId, canvassStatus: "REVISIT_NEEDED" } }),
    prisma.interaction.count({ where: { pollingDivisionId } }),
    prisma.interaction.findMany({
      where: { pollingDivisionId },
      include: { type: true, voter: { select: { firstName: true, lastName: true } }, recordedBy: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
      take: 8,
    }),
    prisma.issue.count({ where: { pollingDivisionId } }),
    prisma.household.count({ where: { pollingDivisionId } }),
    prisma.household.count({ where: { pollingDivisionId, lastVisitedAt: { not: null } } }),
    prisma.interaction.findMany({
      where: { pollingDivisionId, recordedByUserId: { not: null } },
      distinct: ["recordedByUserId"],
      select: { recordedBy: { select: { name: true } } },
      take: 10,
    }),
    prisma.electionDayOperation.findFirst({ where: { pollingDivisionId } }),
  ]);

  return {
    pollingDivision: pd,
    totalDetailed,
    votersContacted,
    contactCoveragePct: totalDetailed > 0 ? (votersContacted / totalDetailed) * 100 : 0,
    votersCanvassed,
    canvassingProgressPct: totalDetailed > 0 ? (votersCanvassed / totalDetailed) * 100 : 0,
    votersRevisitNeeded,
    outstandingFieldWork: totalDetailed - votersCanvassed,
    interactionsTotal,
    recentInteractions,
    issuesCount,
    households,
    householdsVisited,
    volunteerNames: volunteerNames.map((v) => v.recordedBy?.name).filter(Boolean) as string[],
    electionDayOp,
  };
}
