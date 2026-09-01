import type { Session } from "next-auth";

import { prisma } from "@/lib/prisma";

export async function listSavedQueries(session: Session | null) {
  if (!session?.user) return [];
  return prisma.savedQuery.findMany({
    where: { OR: [{ createdByUserId: session.user.id }, { isShared: true }] },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function listSavedSegments(session: Session | null) {
  if (!session?.user) return [];
  return prisma.savedSegment.findMany({
    where: { createdByUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}
