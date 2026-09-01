// Canonical role definitions for NDC VRM. Seed script and permission
// checks both read from this single source of truth.

export const ROLE_DEFINITIONS = [
  {
    key: "ADMINISTRATOR",
    name: "Administrator",
    description: "Full system access: users, roles, settings, audit log.",
    isNational: true,
  },
  {
    key: "CAMPAIGN_MANAGER",
    name: "Campaign Manager",
    description: "Oversees the full national campaign operation.",
    isNational: true,
  },
  {
    key: "CANDIDATE",
    name: "Candidate",
    description: "Party candidate with visibility into campaign performance.",
    isNational: true,
  },
  {
    key: "DATA_LEAD",
    name: "Data Lead",
    description: "Owns the voter register, data quality, and Query Centre.",
    isNational: true,
  },
  {
    key: "COMMUNICATIONS_LEAD",
    name: "Communications Lead",
    description: "Owns messaging strategy, content, and channels.",
    isNational: true,
  },
  {
    key: "FINANCE_LEAD",
    name: "Finance Lead",
    description: "Owns donors, fundraising, vendors, and expenses.",
    isNational: true,
  },
  {
    key: "DATA_PROTECTION_LEAD",
    name: "Data Protection Lead",
    description: "Owns consent, suppression, and privacy compliance.",
    isNational: true,
  },
  {
    key: "FIELD_COORDINATOR",
    name: "Field Coordinator",
    description: "Coordinates canvassing and field operations for assigned constituencies.",
    isNational: false,
  },
  {
    key: "ORGANISER",
    name: "Organiser",
    description: "Runs day-to-day operations for assigned constituencies.",
    isNational: false,
  },
  {
    key: "CANVASSER",
    name: "Canvasser",
    description: "Field volunteer logging door-to-door canvass results.",
    isNational: false,
  },
] as const;

export type RoleKey = (typeof ROLE_DEFINITIONS)[number]["key"];

export const NATIONAL_ROLE_KEYS = ROLE_DEFINITIONS.filter((r) => r.isNational).map(
  (r) => r.key
);
