export const CONTACT_STATUS_LABEL: Record<string, string> = {
  NOT_CONTACTED: "Not Contacted",
  ATTEMPTED: "Attempted",
  CONTACTED: "Contacted",
  REFUSED: "Refused",
  MOVED: "Moved",
  DECEASED: "Deceased",
};

export const CONTACT_STATUS_VARIANT: Record<string, "muted" | "warning" | "success" | "destructive"> = {
  NOT_CONTACTED: "muted",
  ATTEMPTED: "warning",
  CONTACTED: "success",
  REFUSED: "destructive",
  MOVED: "muted",
  DECEASED: "muted",
};

export const CANVASS_STATUS_LABEL: Record<string, string> = {
  NOT_CANVASSED: "Not Canvassed",
  CANVASSED: "Canvassed",
  REVISIT_NEEDED: "Revisit Needed",
};

export const ISSUE_STATUS_LABEL: Record<string, string> = {
  REPORTED: "Reported",
  ACKNOWLEDGED: "Acknowledged",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const ISSUE_STATUS_VARIANT: Record<string, "muted" | "warning" | "success" | "destructive"> = {
  REPORTED: "destructive",
  ACKNOWLEDGED: "warning",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "muted",
};

export const ISSUE_SEVERITY_VARIANT: Record<string, "muted" | "warning" | "success" | "destructive"> = {
  LOW: "muted",
  MEDIUM: "warning",
  HIGH: "destructive",
  CRITICAL: "destructive",
};

export const ISSUE_CATEGORY_LABEL: Record<string, string> = {
  ROADS: "Roads",
  DRAINAGE: "Drainage",
  WATER: "Water",
  GARBAGE: "Garbage",
  HOUSING: "Housing",
  LAND_TENURE: "Land Tenure",
  EMPLOYMENT: "Employment",
  HEALTH: "Health",
  SAFETY: "Safety",
  EDUCATION: "Education",
  INFRASTRUCTURE: "Infrastructure",
  OTHER: "Other",
};

export const READINESS_STATUS_LABEL: Record<string, string> = {
  READY: "Ready",
  IN_PROGRESS: "In Progress",
  NOT_STARTED: "Not Started",
  AT_RISK: "At Risk",
  BLOCKED: "Blocked",
};

export const READINESS_STATUS_VARIANT: Record<string, "muted" | "warning" | "success" | "destructive"> = {
  READY: "success",
  IN_PROGRESS: "warning",
  NOT_STARTED: "muted",
  AT_RISK: "warning",
  BLOCKED: "destructive",
};
