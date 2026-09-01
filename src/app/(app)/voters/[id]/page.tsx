import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MessageSquare, Home } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getVoterProfile } from "@/lib/queries/voters";
import { Badge } from "@/components/ui/badge";
import { DataQualityBadge } from "@/components/shared/data-quality-badge";
import { VoterProfileTabs } from "@/components/voter360/voter-profile-tabs";
import { CONTACT_STATUS_LABEL, CONTACT_STATUS_VARIANT, CANVASS_STATUS_LABEL } from "@/lib/labels";

export default async function Voter360Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const voter = await getVoterProfile(session, id);
  if (!voter) notFound();

  const auditLogs = await prisma.auditLog.findMany({
    where: { recordType: "Voter", recordId: voter.id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const df = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

  return (
    <div>
      <Link href="/voter-roll" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Voter Roll
      </Link>

      <div className="mb-5 rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">
                {voter.firstName} {voter.lastName}
              </h1>
              <DataQualityBadge source={voter.overallDataQuality} />
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{voter.voterNumber}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {voter.constituency.name} · {voter.pollingDivision.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={CONTACT_STATUS_VARIANT[voter.contactStatus]}>{CONTACT_STATUS_LABEL[voter.contactStatus]}</Badge>
            <Badge variant="outline">{CANVASS_STATUS_LABEL[voter.canvassStatus]}</Badge>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4 lg:grid-cols-6">
          <div>
            <p className="text-xs text-muted-foreground">Interactions</p>
            <p className="text-sm font-medium text-foreground">{voter.interactionCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Contact</p>
            <p className="text-sm font-medium text-foreground">{voter.lastContactAt ? df.format(voter.lastContactAt) : "—"}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="size-3" /> Phone</p>
            <p className="text-sm font-medium text-foreground">{voter.phone ?? "Unknown"}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" /> Email</p>
            <p className="text-sm font-medium text-foreground">{voter.email ?? "Unknown"}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Home className="size-3" /> Household</p>
            <p className="text-sm font-medium text-foreground">{voter.household ? `${voter.household.members.length} members` : "None on file"}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="size-3" /> Reported Issues</p>
            <p className="text-sm font-medium text-foreground">{voter.issueReports.length}</p>
          </div>
        </div>
      </div>

      <VoterProfileTabs voter={voter} auditLogs={auditLogs} />
    </div>
  );
}
