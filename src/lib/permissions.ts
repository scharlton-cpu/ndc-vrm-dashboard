import type { Session } from "next-auth";

/** Roles allowed to reach a given module. Empty/absent = all authenticated roles. */
export const MODULE_ROLES: Record<string, string[]> = {
  "users-roles": ["ADMINISTRATOR"],
  "audit-log": ["ADMINISTRATOR", "DATA_PROTECTION_LEAD"],
  "finance": [
    "ADMINISTRATOR",
    "CAMPAIGN_MANAGER",
    "FINANCE_LEAD",
    "CANDIDATE",
  ],
  "query-centre": [
    "ADMINISTRATOR",
    "CAMPAIGN_MANAGER",
    "DATA_LEAD",
    "DATA_PROTECTION_LEAD",
    "FIELD_COORDINATOR",
    "ORGANISER",
  ],
};

export function hasRole(session: Session | null, ...roles: string[]) {
  if (!session?.user) return false;
  return session.user.roles.some((r) => roles.includes(r));
}

export function canAccessModule(session: Session | null, moduleKey: string) {
  if (!session?.user) return false;
  const allowed = MODULE_ROLES[moduleKey];
  if (!allowed || allowed.length === 0) return true;
  return hasRole(session, ...allowed);
}

/**
 * Returns the Prisma `where` clause fragment restricting a constituency-keyed
 * table to the caller's accessible constituencies. Returns `undefined` when
 * the caller has unrestricted (national) access — meaning no filter needed.
 */
export function constituencyScopeFilter(session: Session | null) {
  if (!session?.user) return { id: { in: [] as string[] } };
  if (session.user.isNational) return undefined;
  return { id: { in: session.user.constituencyIds } };
}

export function accessibleConstituencyIds(session: Session | null): string[] | null {
  if (!session?.user) return [];
  if (session.user.isNational) return null; // null = unrestricted
  return session.user.constituencyIds;
}

export function roleLabel(roleKey: string) {
  return roleKey
    .toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}
