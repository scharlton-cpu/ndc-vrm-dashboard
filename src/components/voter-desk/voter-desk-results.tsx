import Link from "next/link";
import { ChevronRight, Phone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTACT_STATUS_LABEL, CONTACT_STATUS_VARIANT } from "@/lib/labels";

type Result = {
  id: string;
  voterNumber: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  contactStatus: string;
  constituency: { name: string };
  pollingDivision: { name: string };
};

export function VoterDeskResults({ results, searched }: { results: Result[]; searched: boolean }) {
  if (!searched) {
    return (
      <Card className="mt-4 flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
        <p>Search by name, phone, voter ID, or email — or narrow by constituency and polling division.</p>
      </Card>
    );
  }
  if (results.length === 0) {
    return (
      <Card className="mt-4 flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
        <p>No voters matched your search.</p>
      </Card>
    );
  }
  return (
    <div className="mt-4 divide-y overflow-hidden rounded-lg border bg-card">
      {results.map((r) => (
        <Link
          key={r.id}
          href={`/voters/${r.id}`}
          className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {r.firstName} {r.lastName}{" "}
              <span className="ml-1 font-mono text-xs font-normal text-muted-foreground">{r.voterNumber}</span>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {r.constituency.name} · {r.pollingDivision.name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {r.phone && (
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Phone className="size-3.5" /> {r.phone}
              </span>
            )}
            <Badge variant={CONTACT_STATUS_VARIANT[r.contactStatus]}>{CONTACT_STATUS_LABEL[r.contactStatus]}</Badge>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  );
}
