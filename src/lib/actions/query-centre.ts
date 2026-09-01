"use server";

import type { Session } from "next-auth";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveConstituencyScope } from "@/lib/queries/scope";
import { resolveQueryDefinition } from "@/lib/query-centre/resolve";
import type { QueryDefinition } from "@/lib/query-centre/fields";
import { writeAuditLog } from "@/lib/audit";
import { canAccessModule } from "@/lib/permissions";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 25;

function scopedWhere(session: Session | null, def: QueryDefinition): Prisma.VoterWhereInput {
  const constituencyIds = resolveConstituencyScope(session, undefined);
  const built = resolveQueryDefinition(def);
  if (!constituencyIds) return built;
  return { AND: [built, { constituencyId: { in: constituencyIds } }] };
}

export async function runQueryAction(def: QueryDefinition, page = 1) {
  const session = await auth();
  if (!session?.user || !canAccessModule(session, "query-centre")) {
    return { rows: [], total: 0, page: 1, pageCount: 1 };
  }

  const where = scopedWhere(session, def);
  const [rows, total] = await Promise.all([
    prisma.voter.findMany({
      where,
      select: {
        id: true,
        voterNumber: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        contactStatus: true,
        canvassStatus: true,
        interactionCount: true,
        lastContactAt: true,
        overallDataQuality: true,
        recordSource: true,
        constituency: { select: { name: true } },
        pollingDivision: { select: { name: true } },
        _count: { select: { issueReports: true } },
      },
      orderBy: [{ lastName: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.voter.count({ where }),
  ]);

  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function exportQueryAction(def: QueryDefinition) {
  const session = await auth();
  if (!session?.user || !canAccessModule(session, "query-centre")) return { csv: "" };
  const where = scopedWhere(session, def);
  const rows = await prisma.voter.findMany({
    where,
    select: {
      voterNumber: true,
      firstName: true,
      lastName: true,
      constituency: { select: { name: true } },
      pollingDivision: { select: { name: true } },
      contactStatus: true,
      phone: true,
      email: true,
      lastContactAt: true,
      interactionCount: true,
      overallDataQuality: true,
      recordSource: true,
    },
    take: 5000,
    orderBy: [{ lastName: "asc" }],
  });

  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["Voter ID", "First Name", "Last Name", "Constituency", "Polling Division", "Contact Status", "Phone", "Email", "Last Contact", "Total Interactions", "Data Quality", "Record Source"];
  const lines = [header.join(",")];
  for (const v of rows) {
    lines.push(
      [v.voterNumber, v.firstName, v.lastName, v.constituency.name, v.pollingDivision.name, v.contactStatus, v.phone ?? "", v.email ?? "", v.lastContactAt?.toISOString().slice(0, 10) ?? "", v.interactionCount, v.overallDataQuality, v.recordSource]
        .map(esc)
        .join(",")
    );
  }

  await writeAuditLog({
    userId: session.user.id,
    action: "EXPORT",
    recordType: "Voter",
    module: "Query Centre",
    newValue: { rowCount: rows.length, query: def as unknown as Prisma.InputJsonValue },
  });

  return { csv: lines.join("\n") };
}

export async function saveQueryAction(name: string, category: string, def: QueryDefinition) {
  const session = await auth();
  if (!session?.user || !canAccessModule(session, "query-centre")) throw new Error("Unauthorized");
  const saved = await prisma.savedQuery.create({
    data: {
      name,
      category,
      filterJson: def as unknown as Prisma.InputJsonValue,
      createdByUserId: session.user.id,
    },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "CREATE",
    recordType: "SavedQuery",
    recordId: saved.id,
    module: "Query Centre",
    newValue: { name, category },
  });
  return saved;
}

export async function saveSegmentAction(name: string, description: string, kind: string, def: QueryDefinition) {
  const session = await auth();
  if (!session?.user || !canAccessModule(session, "query-centre")) throw new Error("Unauthorized");
  const where = scopedWhere(session, def);
  const voterCount = await prisma.voter.count({ where });

  const saved = await prisma.savedSegment.create({
    data: {
      name,
      description,
      kind: kind as never,
      filterJson: def as unknown as Prisma.InputJsonValue,
      voterCount,
      createdByUserId: session.user.id,
    },
  });
  await writeAuditLog({
    userId: session.user.id,
    action: "CREATE",
    recordType: "SavedSegment",
    recordId: saved.id,
    module: "Query Centre",
    newValue: { name, kind, voterCount },
  });
  return saved;
}

export async function deleteSavedQueryAction(id: string) {
  const session = await auth();
  if (!session?.user || !canAccessModule(session, "query-centre")) throw new Error("Unauthorized");

  const existing = await prisma.savedQuery.findUnique({ where: { id }, select: { createdByUserId: true } });
  if (!existing) return;
  const isOwner = existing.createdByUserId === session.user.id;
  const isAdmin = session.user.roles.includes("ADMINISTRATOR");
  if (!isOwner && !isAdmin) throw new Error("Unauthorized");

  await prisma.savedQuery.delete({ where: { id } });
  await writeAuditLog({ userId: session.user.id, action: "DELETE", recordType: "SavedQuery", recordId: id, module: "Query Centre" });
}
