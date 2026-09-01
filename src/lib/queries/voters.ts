import type { Session } from "next-auth";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveConstituencyScope } from "@/lib/queries/scope";

export type VoterRollParams = {
  q?: string;
  constituencyId?: string;
  pollingDivisionId?: string;
  contactStatus?: string;
  sex?: string;
  dataQuality?: string;
  page?: number;
  pageSize?: number;
};

export function buildVoterWhere(session: Session | null, params: VoterRollParams): Prisma.VoterWhereInput {
  const constituencyIds = resolveConstituencyScope(session, params.constituencyId);
  const where: Prisma.VoterWhereInput = {};
  if (constituencyIds) where.constituencyId = { in: constituencyIds };
  if (params.pollingDivisionId) where.pollingDivisionId = params.pollingDivisionId;
  if (params.contactStatus) where.contactStatus = params.contactStatus as Prisma.EnumContactStatusFilter["equals"];
  if (params.sex) where.sex = params.sex as Prisma.EnumSexNullableFilter["equals"];
  if (params.dataQuality) where.overallDataQuality = params.dataQuality as Prisma.EnumDataQualityFilter["equals"];
  if (params.q) {
    const q = params.q.trim();
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { voterNumber: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}

export async function listVoters(session: Session | null, params: VoterRollParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize ?? 25));
  const where = buildVoterWhere(session, params);

  const [rows, total] = await Promise.all([
    prisma.voter.findMany({
      where,
      select: {
        id: true,
        voterNumber: true,
        firstName: true,
        lastName: true,
        sex: true,
        ageBand: true,
        occupation: true,
        phone: true,
        email: true,
        contactStatus: true,
        overallDataQuality: true,
        recordSource: true,
        updatedAt: true,
        constituency: { select: { id: true, name: true } },
        pollingDivision: { select: { id: true, name: true } },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.voter.count({ where }),
  ]);

  return { rows, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getVoterRollStats(session: Session | null) {
  const constituencyIds = resolveConstituencyScope(session, undefined);
  const pdWhere = constituencyIds ? { constituencyId: { in: constituencyIds } } : {};
  const voterWhere: Prisma.VoterWhereInput = constituencyIds ? { constituencyId: { in: constituencyIds } } : {};

  const [pds, totalDetailed, knownQuality, knownContact, lastUpdated] = await Promise.all([
    prisma.pollingDivision.findMany({ where: pdWhere, select: { constituencyId: true, registeredElectors: true } }),
    prisma.voter.count({ where: voterWhere }),
    prisma.voter.count({ where: { ...voterWhere, overallDataQuality: "KNOWN" } }),
    prisma.voter.count({ where: { ...voterWhere, OR: [{ phoneSource: "KNOWN" }, { emailSource: "KNOWN" }] } }),
    prisma.voter.aggregate({ where: voterWhere, _max: { updatedAt: true } }),
  ]);

  const registeredElectors = pds.reduce((s, p) => s + p.registeredElectors, 0);
  const constituenciesCount = new Set(pds.map((p) => p.constituencyId)).size;

  return {
    registeredElectors,
    constituenciesCount,
    pollingDivisionsCount: pds.length,
    totalDetailed,
    dataCompletenessPct: totalDetailed > 0 ? (knownQuality / totalDetailed) * 100 : 0,
    knownContactPct: totalDetailed > 0 ? (knownContact / totalDetailed) * 100 : 0,
    lastRegisterUpdate: lastUpdated._max.updatedAt,
  };
}

const voterProfileInclude = {
  constituency: true,
  pollingDivision: true,
  household: { include: { members: { include: { voter: { select: { id: true, firstName: true, lastName: true } as const } } } } },
  contacts: true,
  consentRecords: true,
  suppressionRecords: true,
  interactions: { include: { type: true, recordedBy: { select: { name: true } as const } }, orderBy: { occurredAt: "desc" as const } },
  issueReports: { include: { issue: true }, orderBy: { createdAt: "desc" as const } },
  relationshipsA: { include: { voterB: { select: { id: true, firstName: true, lastName: true } as const } } },
  relationshipsB: { include: { voterA: { select: { id: true, firstName: true, lastName: true } as const } } },
} satisfies Prisma.VoterInclude;

export type VoterProfile = Prisma.VoterGetPayload<{ include: typeof voterProfileInclude }>;

export async function getVoterProfile(session: Session | null, voterId: string): Promise<VoterProfile | null> {
  const constituencyIds = resolveConstituencyScope(session, undefined);
  const voter = await prisma.voter.findFirst({
    where: { id: voterId, ...(constituencyIds ? { constituencyId: { in: constituencyIds } } : {}) },
    include: voterProfileInclude,
  });
  return voter;
}

export async function searchVoters(session: Session | null, params: VoterRollParams, limit = 30) {
  const hasCriteria = Boolean(params.q?.trim() || params.constituencyId || params.pollingDivisionId);
  if (!hasCriteria) return [];
  const where = buildVoterWhere(session, params);
  return prisma.voter.findMany({
    where,
    select: {
      id: true,
      voterNumber: true,
      firstName: true,
      lastName: true,
      phone: true,
      contactStatus: true,
      constituency: { select: { name: true } },
      pollingDivision: { select: { name: true } },
    },
    take: limit,
    orderBy: [{ lastName: "asc" }],
  });
}
