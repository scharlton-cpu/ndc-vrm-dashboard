"use client";

import { Trash2 } from "lucide-react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FIELD_REGISTRY,
  QUERY_CATEGORIES,
  OPERATORS_BY_TYPE,
  OPERATOR_LABEL,
  fieldById,
  type QueryRow as QueryRowType,
  type Operator,
} from "@/lib/query-centre/fields";
import type { OptionLookup } from "@/lib/query-centre/describe";

export function QueryRowEditor({
  row,
  optionLookup,
  onChange,
  onRemove,
}: {
  row: QueryRowType;
  optionLookup: OptionLookup;
  onChange: (row: QueryRowType) => void;
  onRemove: () => void;
}) {
  const field = fieldById(row.fieldId);
  const operators = field ? OPERATORS_BY_TYPE[field.type] : [];
  const needsValue = row.operator && row.operator !== "is_empty" && row.operator !== "is_not_empty";
  const needsSecondValue = row.operator === "between";

  const options = field?.optionsKey
    ? Object.entries(optionLookup[field.optionsKey] ?? {}).map(([value, label]) => ({ value, label }))
    : field?.staticOptions ?? [];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-2.5 py-2">
      <Select
        value={row.fieldId}
        onValueChange={(v) => onChange({ ...row, fieldId: v, operator: "", value: "", value2: "" })}
      >
        <SelectTrigger size="sm" className="w-56"><SelectValue placeholder="Select field…" /></SelectTrigger>
        <SelectContent>
          {QUERY_CATEGORIES.map((cat) => (
            <SelectGroup key={cat}>
              <SelectLabel>{cat}</SelectLabel>
              {FIELD_REGISTRY.filter((f) => f.category === cat).map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={row.operator}
        onValueChange={(v) => onChange({ ...row, operator: v as Operator, value: "", value2: "" })}
        disabled={!field}
      >
        <SelectTrigger size="sm" className="w-40"><SelectValue placeholder="Operator…" /></SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op} value={op}>{OPERATOR_LABEL[op]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {needsValue && field && (field.type === "select" ? (
        <Select value={row.value} onValueChange={(v) => onChange({ ...row, value: v })}>
          <SelectTrigger size="sm" className="w-48"><SelectValue placeholder="Value…" /></SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : field.type === "date" ? (
        <Input type="date" value={row.value} onChange={(e) => onChange({ ...row, value: e.target.value })} className="h-8 w-40 text-xs" />
      ) : field.type === "number" ? (
        <Input type="number" value={row.value} onChange={(e) => onChange({ ...row, value: e.target.value })} className="h-8 w-28 text-xs" />
      ) : (
        <Input value={row.value} onChange={(e) => onChange({ ...row, value: e.target.value })} placeholder="Value" className="h-8 w-44 text-xs" />
      ))}

      {needsSecondValue && field && (
        <>
          <span className="text-xs text-muted-foreground">and</span>
          {field.type === "date" ? (
            <Input type="date" value={row.value2 ?? ""} onChange={(e) => onChange({ ...row, value2: e.target.value })} className="h-8 w-40 text-xs" />
          ) : (
            <Input type="number" value={row.value2 ?? ""} onChange={(e) => onChange({ ...row, value2: e.target.value })} className="h-8 w-28 text-xs" />
          )}
        </>
      )}

      <Button variant="ghost" size="icon" className="ml-auto size-7 text-muted-foreground hover:text-destructive" onClick={onRemove}>
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
