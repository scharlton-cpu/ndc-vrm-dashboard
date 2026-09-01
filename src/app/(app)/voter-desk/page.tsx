import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { VoterDeskSearch } from "@/components/voter-desk/voter-desk-search";
import { VoterDeskResults } from "@/components/voter-desk/voter-desk-results";
import { searchVoters } from "@/lib/queries/voters";
import { resolveConstituencyScope } from "@/lib/queries/scope";

export const metadata = { title: "Voter Desk" };

export default async function VoterDeskPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

  const params = {
    q: str(sp.q),
    constituencyId: str(sp.constituencyId),
    pollingDivisionId: str(sp.pollingDivisionId),
  };
  const searched = Boolean(params.q?.trim() || params.constituencyId || params.pollingDivisionId);

  const scopeIds = resolveConstituencyScope(session, undefined);
  const [results, constituencies, pollingDivisions] = await Promise.all([
    searchVoters(session, params),
    prisma.constituency.findMany({ where: scopeIds ? { id: { in: scopeIds } } : {}, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.pollingDivision.findMany({ where: scopeIds ? { constituencyId: { in: scopeIds } } : {}, select: { id: true, name: true, constituencyId: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Voter Desk" subtitle="Universal voter search — find a constituent and open their profile" />
      <VoterDeskSearch constituencies={constituencies} pollingDivisions={pollingDivisions} />
      <VoterDeskResults results={results} searched={searched} />
    </div>
  );
}
