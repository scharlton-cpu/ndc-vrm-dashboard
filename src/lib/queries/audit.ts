import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AuditLogParams = {
  userId?: string;
  action?: string;
  module?: string;
  recordType?: string;
  constituencyId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
};

const PAGE_SIZE = 30;

export async function listAuditLogs(params: AuditLogParams) {
  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.AuditLogWhereInput = {};
  if (params.userId) where.userId = params.userId;
  if (params.action) where.action = params.action;
  if (params.module) where.module = params.module;
  if (params.recordType) where.recordType = params.recordType;
  if (params.constituencyId) where.constituencyId = params.constituencyId;
  if (params.dateFrom || params.dateTo) {
    where.createdAt = {
      ...(params.dateFrom ? { gte: new Date(params.dateFrom) } : {}),
      ...(params.dateTo ? { lte: new Date(params.dateTo) } : {}),
    };
  }

  const [rows, total, distinctActions, distinctModules, distinctRecordTypes] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, constituency: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ distinct: ["action"], select: { action: true } }),
    prisma.auditLog.findMany({ distinct: ["module"], select: { module: true } }),
    prisma.auditLog.findMany({ distinct: ["recordType"], select: { recordType: true } }),
  ]);

  return {
    rows,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
    facets: {
      actions: distinctActions.map((a) => a.action),
      modules: distinctModules.map((m) => m.module).filter((m): m is string => Boolean(m)),
      recordTypes: distinctRecordTypes.map((r) => r.recordType),
    },
  };
}
