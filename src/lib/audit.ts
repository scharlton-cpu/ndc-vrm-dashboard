import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAuditLog(entry: {
  userId?: string | null;
  action: string;
  recordType: string;
  recordId?: string | null;
  module?: string | null;
  constituencyId?: string | null;
  previousValue?: Prisma.InputJsonValue | null;
  newValue?: Prisma.InputJsonValue | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        recordType: entry.recordType,
        recordId: entry.recordId ?? null,
        module: entry.module ?? null,
        constituencyId: entry.constituencyId ?? null,
        previousValue: entry.previousValue ?? undefined,
        newValue: entry.newValue ?? undefined,
      },
    });
  } catch (err) {
    // Auditing must never block the primary action from completing.
    console.error("Failed to write audit log", err);
  }
}
