import { fieldById, OPERATOR_LABEL, type QueryDefinition } from "@/lib/query-centre/fields";

export type OptionLookup = Record<string, Record<string, string>>;

export function describeQueryDefinition(def: QueryDefinition, lookup: OptionLookup): string {
  const groupTexts = def.groups
    .map((group) => {
      const rowTexts = group.rows
        .filter((r) => r.fieldId && r.operator)
        .map((r) => {
          const field = fieldById(r.fieldId);
          if (!field) return "";
          const opLabel = OPERATOR_LABEL[r.operator as keyof typeof OPERATOR_LABEL];
          if (r.operator === "is_empty" || r.operator === "is_not_empty") {
            return `${field.label} ${opLabel}`;
          }
          const resolveLabel = (v: string) => {
            if (field.optionsKey && lookup[field.optionsKey]?.[v]) return lookup[field.optionsKey][v];
            const opt = field.staticOptions?.find((o) => o.value === v);
            return opt?.label ?? v;
          };
          const val = resolveLabel(r.value);
          if (r.operator === "between") {
            return `${field.label} ${opLabel} ${val} and ${resolveLabel(r.value2 ?? "")}`;
          }
          return `${field.label} ${opLabel} "${val}"`;
        })
        .filter(Boolean);
      if (rowTexts.length === 0) return "";
      if (rowTexts.length === 1) return rowTexts[0];
      return `(${rowTexts.join(` ${group.conjunction} `)})`;
    })
    .filter(Boolean);

  if (groupTexts.length === 0) return "No filters applied — showing all voters in scope.";
  return `Show voters WHERE ${groupTexts.join(` ${def.groupConjunction} `)}`;
}
