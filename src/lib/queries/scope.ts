import type { Session } from "next-auth";

import { accessibleConstituencyIds } from "@/lib/permissions";

export type DashboardFilters = {
  constituencyId?: string;
  pollingDivisionId?: string;
  dateFrom?: string;
  dateTo?: string;
};

/**
 * Resolves the set of constituency IDs a request is allowed to see, taking
 * both the caller's role-based access and any explicitly requested
 * constituency filter into account.
 *
 * Returns:
 *  - `undefined` — no restriction (national access, no filter selected)
 *  - `string[]`  — restrict to these constituency IDs
 */
export function resolveConstituencyScope(
  session: Session | null,
  requestedConstituencyId?: string
): string[] | undefined {
  const accessible = accessibleConstituencyIds(session); // null = unrestricted

  if (requestedConstituencyId) {
    if (accessible === null) return [requestedConstituencyId];
    return accessible.includes(requestedConstituencyId) ? [requestedConstituencyId] : [];
  }

  if (accessible === null) return undefined;
  return accessible;
}
