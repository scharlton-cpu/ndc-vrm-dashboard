"use client";

import Link from "next/link";
import { Home, ShieldQuestion, ListChecks, History, Users2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { OverviewTab } from "@/components/voter360/overview-tab";
import type { VoterProfile } from "@/lib/queries/voters";
import { ISSUE_STATUS_LABEL, ISSUE_STATUS_VARIANT, ISSUE_CATEGORY_LABEL } from "@/lib/labels";

type AuditRow = { id: string; action: string; recordType: string; module: string | null; createdAt: Date; user: { name: string } | null };

export function VoterProfileTabs({ voter, auditLogs }: { voter: VoterProfile; auditLogs: AuditRow[] }) {
  const df = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
  const dfShort = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="interactions">Interactions ({voter.interactions.length})</TabsTrigger>
        <TabsTrigger value="field-visits">Field Visits</TabsTrigger>
        <TabsTrigger value="issues">Issues ({voter.issueReports.length})</TabsTrigger>
        <TabsTrigger value="household">Household</TabsTrigger>
        <TabsTrigger value="relationships">Relationships</TabsTrigger>
        <TabsTrigger value="comms">Communication Prefs</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="history">Record History</TabsTrigger>
        <TabsTrigger value="audit">Audit History</TabsTrigger>
      </TabsList>

      <div className="mt-4 rounded-lg border bg-card p-5">
        <TabsContent value="overview">
          <OverviewTab voter={voter} />
        </TabsContent>

        <TabsContent value="interactions">
          {voter.interactions.length === 0 ? (
            <EmptyState message="No interactions recorded for this voter yet." />
          ) : (
            <ul className="divide-y">
              {voter.interactions.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{i.type.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{i.summary}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {df.format(i.occurredAt)} {i.recordedBy ? `· recorded by ${i.recordedBy.name}` : ""}
                    </p>
                  </div>
                  <Badge variant={i.outcome === "Positive" ? "success" : i.outcome === "Negative" || i.outcome === "Declined" ? "destructive" : "muted"}>
                    {i.outcome}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="field-visits">
          <EmptyState
            icon={ShieldQuestion}
            message="No field visit records linked to this voter yet. Field visits are tracked through walk lists in Field & Polling, which arrives in a later build phase."
          />
        </TabsContent>

        <TabsContent value="issues">
          {voter.issueReports.length === 0 ? (
            <EmptyState message="This voter has not raised or been linked to any reported issues." />
          ) : (
            <ul className="divide-y">
              {voter.issueReports.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.issue.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ISSUE_CATEGORY_LABEL[r.issue.category]} · {r.source} · {dfShort.format(r.createdAt)}
                    </p>
                  </div>
                  <Badge variant={ISSUE_STATUS_VARIANT[r.issue.status]}>{ISSUE_STATUS_LABEL[r.issue.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="household">
          {!voter.household ? (
            <EmptyState icon={Home} message="No household record linked to this voter." />
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">{voter.household.addressLine}</p>
              <p className="mb-4 text-xs text-muted-foreground">{voter.household.parish}</p>
              <ul className="divide-y rounded-md border">
                {voter.household.members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <Link href={`/voters/${m.voter.id}`} className={m.voter.id === voter.id ? "font-medium text-foreground" : "text-primary hover:underline"}>
                      {m.voter.firstName} {m.voter.lastName} {m.voter.id === voter.id && "(this voter)"}
                    </Link>
                    <span className="text-xs text-muted-foreground">{m.relationshipToHead}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="relationships">
          {voter.relationshipsA.length === 0 && voter.relationshipsB.length === 0 ? (
            <EmptyState icon={Users2} message="No lawful, explicitly entered relationships are recorded for this voter." />
          ) : (
            <ul className="divide-y">
              {voter.relationshipsA.map((r) => (
                <li key={r.id} className="py-2 text-sm">
                  {r.voterB.firstName} {r.voterB.lastName} — <span className="text-muted-foreground">{r.type.replaceAll("_", " ")}</span>
                </li>
              ))}
              {voter.relationshipsB.map((r) => (
                <li key={r.id} className="py-2 text-sm">
                  {r.voterA.firstName} {r.voterA.lastName} — <span className="text-muted-foreground">{r.type.replaceAll("_", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="comms">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact Channels</p>
              {voter.contacts.length === 0 ? (
                <EmptyState message="No structured contact channels on file." />
              ) : (
                <ul className="divide-y rounded-md border">
                  {voter.contacts.map((c) => (
                    <li key={c.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span>{c.channel} — {c.value}</span>
                      <Badge variant={c.consentStatus === "OPT_IN" ? "success" : c.consentStatus === "OPT_OUT" ? "destructive" : "muted"}>
                        {c.consentStatus.replaceAll("_", " ")}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {voter.suppressionRecords.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suppression</p>
                <ul className="divide-y rounded-md border border-destructive/30">
                  {voter.suppressionRecords.map((s) => (
                    <li key={s.id} className="px-3 py-2 text-sm text-destructive">
                      {s.reason} {s.channel ? `(${s.channel})` : "(all channels)"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <EmptyState icon={ListChecks} message="Campaign tasks are tracked at the constituency and pillar level, not per voter. See Campaign Workflow." />
        </TabsContent>

        <TabsContent value="history">
          {auditLogs.filter((a) => a.action === "CREATE" || a.action === "UPDATE").length === 0 ? (
            <EmptyState icon={History} message="No field-level changes have been recorded for this voter record." />
          ) : (
            <ul className="divide-y">
              {auditLogs
                .filter((a) => a.action === "CREATE" || a.action === "UPDATE")
                .map((a) => (
                  <li key={a.id} className="py-2 text-sm">
                    {a.action} · {df.format(a.createdAt)} {a.user ? `· ${a.user.name}` : ""}
                  </li>
                ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="audit">
          {auditLogs.length === 0 ? (
            <EmptyState icon={History} message="No audited actions reference this voter record yet." />
          ) : (
            <ul className="divide-y">
              {auditLogs.map((a) => (
                <li key={a.id} className="py-2 text-sm">
                  <span className="font-medium">{a.action}</span> on {a.recordType} · {df.format(a.createdAt)}{" "}
                  {a.user ? `· ${a.user.name}` : "· system"} {a.module ? `· ${a.module}` : ""}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}
