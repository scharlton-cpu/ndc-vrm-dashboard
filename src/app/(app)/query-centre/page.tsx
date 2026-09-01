import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { QueryBuilder } from "@/components/query-centre/query-builder";
import { resolveConstituencyScope } from "@/lib/queries/scope";
import { listSavedQueries, listSavedSegments } from "@/lib/queries/query-centre";
import { ISSUE_CATEGORY_LABEL } from "@/lib/labels";
import type { OptionLookup } from "@/lib/query-centre/describe";

export const metadata = { title: "Query Centre" };

export default async function QueryCentrePage() {
  const session = await auth();
  const scopeIds = resolveConstituencyScope(session, undefined);

  const [constituencies, pollingDivisions, savedQueries, savedSegments] = await Promise.all([
    prisma.constituency.findMany({ where: scopeIds ? { id: { in: scopeIds } } : {}, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.pollingDivision.findMany({ where: scopeIds ? { constituencyId: { in: scopeIds } } : {}, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    listSavedQueries(session),
    listSavedSegments(session),
  ]);

  const optionLookup: OptionLookup = {
    constituency: Object.fromEntries(constituencies.map((c) => [c.id, c.name])),
    pollingDivision: Object.fromEntries(pollingDivisions.map((p) => [p.id, p.name])),
    issueCategory: ISSUE_CATEGORY_LABEL,
  };

  return (
    <div>
      <PageHeader
        title="Query Centre"
        subtitle="Build no-code database queries across the voter register — no SQL required"
      />
      <QueryBuilder
        optionLookup={optionLookup}
        savedQueries={savedQueries.map((q) => ({ id: q.id, name: q.name, category: q.category, filterJson: q.filterJson }))}
        savedSegments={savedSegments}
      />
    </div>
  );
}
