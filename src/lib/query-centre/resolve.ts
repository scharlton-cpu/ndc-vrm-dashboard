import type { Prisma } from "@prisma/client";

import type { QueryDefinition, QueryRow, Operator } from "@/lib/query-centre/fields";

function stringFieldCondition(field: string, operator: Operator, value: string): Prisma.VoterWhereInput | null {
  switch (operator) {
    case "equals":
      return { [field]: { equals: value, mode: "insensitive" } } as Prisma.VoterWhereInput;
    case "not_equals":
      return { NOT: { [field]: { equals: value, mode: "insensitive" } } } as Prisma.VoterWhereInput;
    case "contains":
      return { [field]: { contains: value, mode: "insensitive" } } as Prisma.VoterWhereInput;
    case "not_contains":
      return { NOT: { [field]: { contains: value, mode: "insensitive" } } } as Prisma.VoterWhereInput;
    case "is_empty":
      return { [field]: null } as Prisma.VoterWhereInput;
    case "is_not_empty":
      return { [field]: { not: null } } as Prisma.VoterWhereInput;
    default:
      return null;
  }
}

function resolveRow(row: QueryRow): Prisma.VoterWhereInput | null {
  if (!row.fieldId || !row.operator) return null;
  const op = row.operator;
  const v = row.value?.trim() ?? "";
  if (op !== "is_empty" && op !== "is_not_empty" && v === "" && row.fieldId !== "interactionCount") return null;

  switch (row.fieldId) {
    case "voterNumber":
    case "firstName":
    case "lastName":
    case "occupation":
    case "parish":
    case "phone":
    case "email":
      return stringFieldCondition(row.fieldId, op, v);
    case "phoneKnown":
      return { phoneSource: op === "is_not_empty" ? "KNOWN" : { not: "KNOWN" } };
    case "emailKnown":
      return { emailSource: op === "is_not_empty" ? "KNOWN" : { not: "KNOWN" } };

    case "sex":
      return { sex: op === "equals" ? (v as never) : op === "not_equals" ? { not: v as never } : op === "is_empty" ? null : { not: null } };
    case "ageBand":
      if (op === "equals") return { ageBand: v };
      if (op === "not_equals") return { ageBand: { not: v } };
      if (op === "is_empty") return { ageBand: null };
      if (op === "is_not_empty") return { ageBand: { not: null } };
      return null;
    case "dataQuality":
      if (op === "equals") return { overallDataQuality: v as never };
      if (op === "not_equals") return { overallDataQuality: { not: v as never } };
      return null;

    case "constituency":
      if (op === "equals") return { constituencyId: v };
      if (op === "not_equals") return { constituencyId: { not: v } };
      return null;
    case "pollingDivision":
      if (op === "equals") return { pollingDivisionId: v };
      if (op === "not_equals") return { pollingDivisionId: { not: v } };
      return null;

    case "contactStatus":
      if (op === "equals") return { contactStatus: v as never };
      if (op === "not_equals") return { contactStatus: { not: v as never } };
      return null;
    case "canvassStatus":
      if (op === "equals") return { canvassStatus: v as never };
      if (op === "not_equals") return { canvassStatus: { not: v as never } };
      return null;

    case "interactionCount": {
      const n = Number(v);
      if (op === "equals") return { interactionCount: n };
      if (op === "not_equals") return { interactionCount: { not: n } };
      if (op === "greater_than") return { interactionCount: { gt: n } };
      if (op === "less_than") return { interactionCount: { lt: n } };
      if (op === "between") {
        const n2 = Number(row.value2);
        return { interactionCount: { gte: n, lte: n2 } };
      }
      return null;
    }
    case "lastContactAt": {
      if (op === "is_empty") return { lastContactAt: null };
      if (op === "is_not_empty") return { lastContactAt: { not: null } };
      const d = new Date(v);
      if (op === "before") return { lastContactAt: { lt: d } };
      if (op === "after") return { lastContactAt: { gt: d } };
      if (op === "between") {
        const d2 = new Date(row.value2 ?? v);
        return { lastContactAt: { gte: d, lte: d2 } };
      }
      return null;
    }

    case "hasIssueReport":
      return { issueReports: op === "is_not_empty" ? { some: {} } : { none: {} } };
    case "issueCategory":
      if (op === "equals") return { issueReports: { some: { issue: { category: v as never } } } };
      if (op === "not_equals") return { issueReports: { none: { issue: { category: v as never } } } };
      return null;

    case "hasHousehold":
      return { householdId: op === "is_not_empty" ? { not: null } : null };
    case "hasRelationship":
      return op === "is_not_empty"
        ? { OR: [{ relationshipsA: { some: {} } }, { relationshipsB: { some: {} } }] }
        : { AND: [{ relationshipsA: { none: {} } }, { relationshipsB: { none: {} } }] };

    case "hasOptIn":
      return { contacts: op === "is_not_empty" ? { some: { consentStatus: "OPT_IN" } } : { none: { consentStatus: "OPT_IN" } } };
    case "hasOptOut":
      return { contacts: op === "is_not_empty" ? { some: { consentStatus: "OPT_OUT" } } : { none: { consentStatus: "OPT_OUT" } } };
    case "isSuppressed":
      return { suppressionRecords: op === "is_not_empty" ? { some: {} } : { none: {} } };

    default:
      return null;
  }
}

export function resolveQueryDefinition(def: QueryDefinition): Prisma.VoterWhereInput {
  const groupClauses: Prisma.VoterWhereInput[] = [];

  for (const group of def.groups) {
    const rowClauses = group.rows.map(resolveRow).filter((c): c is Prisma.VoterWhereInput => c !== null);
    if (rowClauses.length === 0) continue;
    groupClauses.push(group.conjunction === "OR" ? { OR: rowClauses } : { AND: rowClauses });
  }

  if (groupClauses.length === 0) return {};
  return def.groupConjunction === "OR" ? { OR: groupClauses } : { AND: groupClauses };
}
