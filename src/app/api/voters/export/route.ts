import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildVoterWhere } from "@/lib/queries/voters";
import { writeAuditLog } from "@/lib/audit";

function csvEscape(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const MAX_EXPORT_ROWS = 5000;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const where = buildVoterWhere(session, {
    q: sp.get("q") ?? undefined,
    constituencyId: sp.get("constituencyId") ?? undefined,
    pollingDivisionId: sp.get("pollingDivisionId") ?? undefined,
    contactStatus: sp.get("contactStatus") ?? undefined,
    sex: sp.get("sex") ?? undefined,
    dataQuality: sp.get("dataQuality") ?? undefined,
  });

  const rows = await prisma.voter.findMany({
    where,
    select: {
      voterNumber: true,
      firstName: true,
      lastName: true,
      constituency: { select: { name: true } },
      pollingDivision: { select: { name: true } },
      sex: true,
      ageBand: true,
      occupation: true,
      phone: true,
      email: true,
      contactStatus: true,
      canvassStatus: true,
      interactionCount: true,
      overallDataQuality: true,
      recordSource: true,
      updatedAt: true,
    },
    orderBy: [{ lastName: "asc" }],
    take: MAX_EXPORT_ROWS,
  });

  const header = [
    "Voter ID", "First Name", "Last Name", "Constituency", "Polling Division", "Sex", "Age Band",
    "Occupation", "Phone", "Email", "Contact Status", "Canvass Status", "Interactions",
    "Data Status", "Source", "Last Updated",
  ];
  const lines = [header.join(",")];
  for (const v of rows) {
    lines.push(
      [
        v.voterNumber, v.firstName, v.lastName, v.constituency.name, v.pollingDivision.name,
        v.sex ?? "", v.ageBand ?? "", v.occupation ?? "", v.phone ?? "", v.email ?? "",
        v.contactStatus, v.canvassStatus, v.interactionCount, v.overallDataQuality, v.recordSource,
        v.updatedAt.toISOString().slice(0, 10),
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  await writeAuditLog({
    userId: session.user.id,
    action: "EXPORT",
    recordType: "Voter",
    module: "Voter Roll",
    newValue: { rowCount: rows.length, filters: Object.fromEntries(sp.entries()) },
  });

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ndc-vrm-voter-roll-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
