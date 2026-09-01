function titleCase(v: string) {
  return v
    .toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export type FieldType = "string" | "select" | "number" | "date" | "exists";

export type Operator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "between"
  | "before"
  | "after"
  | "is_empty"
  | "is_not_empty";

export const OPERATOR_LABEL: Record<Operator, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  not_contains: "does not contain",
  greater_than: "greater than",
  less_than: "less than",
  between: "between",
  before: "before",
  after: "after",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

export const OPERATORS_BY_TYPE: Record<FieldType, Operator[]> = {
  string: ["equals", "not_equals", "contains", "not_contains", "is_empty", "is_not_empty"],
  select: ["equals", "not_equals", "is_empty", "is_not_empty"],
  number: ["equals", "not_equals", "greater_than", "less_than", "between"],
  date: ["before", "after", "between", "is_empty", "is_not_empty"],
  exists: ["is_empty", "is_not_empty"],
};

export type FieldDef = {
  id: string;
  label: string;
  category: string;
  type: FieldType;
  staticOptions?: { value: string; label: string }[];
  optionsKey?: "constituency" | "pollingDivision" | "issueCategory";
};

export const QUERY_CATEGORIES = [
  "Voter Register",
  "Geography",
  "Contact Information",
  "Campaign Interactions",
  "Reported Issues",
  "Households",
  "Relationships",
  "Canvassing Status",
  "Communication Consent",
] as const;

export const FIELD_REGISTRY: FieldDef[] = [
  // Voter Register
  { id: "voterNumber", label: "Voter ID", category: "Voter Register", type: "string" },
  { id: "firstName", label: "First Name", category: "Voter Register", type: "string" },
  { id: "lastName", label: "Last Name", category: "Voter Register", type: "string" },
  {
    id: "sex",
    label: "Sex",
    category: "Voter Register",
    type: "select",
    staticOptions: [{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }],
  },
  {
    id: "ageBand",
    label: "Age Band",
    category: "Voter Register",
    type: "select",
    staticOptions: ["18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75+"].map((v) => ({ value: v, label: v })),
  },
  { id: "occupation", label: "Occupation", category: "Voter Register", type: "string" },
  {
    id: "dataQuality",
    label: "Known vs Estimated Data",
    category: "Voter Register",
    type: "select",
    staticOptions: [
      { value: "KNOWN", label: "Known" },
      { value: "ESTIMATED", label: "Estimated" },
      { value: "UNKNOWN", label: "Unknown" },
    ],
  },

  // Geography
  { id: "constituency", label: "Constituency", category: "Geography", type: "select", optionsKey: "constituency" },
  { id: "pollingDivision", label: "Polling Division", category: "Geography", type: "select", optionsKey: "pollingDivision" },
  { id: "parish", label: "Parish", category: "Geography", type: "string" },

  // Contact Information
  { id: "phone", label: "Phone Number", category: "Contact Information", type: "string" },
  { id: "phoneKnown", label: "Phone on File", category: "Contact Information", type: "exists" },
  { id: "email", label: "Email Address", category: "Contact Information", type: "string" },
  { id: "emailKnown", label: "Email on File", category: "Contact Information", type: "exists" },

  // Campaign Interactions
  {
    id: "contactStatus",
    label: "Contact Status",
    category: "Campaign Interactions",
    type: "select",
    staticOptions: ["NOT_CONTACTED", "ATTEMPTED", "CONTACTED", "REFUSED", "MOVED", "DECEASED"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  { id: "interactionCount", label: "Number of Interactions", category: "Campaign Interactions", type: "number" },
  { id: "lastContactAt", label: "Last Contact Date", category: "Campaign Interactions", type: "date" },

  // Reported Issues
  { id: "hasIssueReport", label: "Has Reported an Issue", category: "Reported Issues", type: "exists" },
  {
    id: "issueCategory",
    label: "Issue Category Reported",
    category: "Reported Issues",
    type: "select",
    optionsKey: "issueCategory",
  },

  // Households
  { id: "hasHousehold", label: "Has Household on File", category: "Households", type: "exists" },

  // Relationships
  { id: "hasRelationship", label: "Has Recorded Relationship", category: "Relationships", type: "exists" },

  // Canvassing Status
  {
    id: "canvassStatus",
    label: "Canvassed / Not Canvassed",
    category: "Canvassing Status",
    type: "select",
    staticOptions: [
      { value: "NOT_CANVASSED", label: "Not Canvassed" },
      { value: "CANVASSED", label: "Canvassed" },
      { value: "REVISIT_NEEDED", label: "Revisit Needed" },
    ],
  },

  // Communication Consent
  { id: "hasOptIn", label: "Has Opted In to a Channel", category: "Communication Consent", type: "exists" },
  { id: "hasOptOut", label: "Has Opted Out of a Channel", category: "Communication Consent", type: "exists" },
  { id: "isSuppressed", label: "On Suppression List", category: "Communication Consent", type: "exists" },
];

export function fieldById(id: string) {
  return FIELD_REGISTRY.find((f) => f.id === id);
}

export type QueryRow = {
  id: string;
  fieldId: string;
  operator: Operator | "";
  value: string;
  value2?: string;
};

export type QueryGroup = {
  id: string;
  conjunction: "AND" | "OR";
  rows: QueryRow[];
};

export type QueryDefinition = {
  groupConjunction: "AND" | "OR";
  groups: QueryGroup[];
};
