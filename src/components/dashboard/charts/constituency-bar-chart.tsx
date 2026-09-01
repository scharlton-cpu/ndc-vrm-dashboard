"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type ConstituencyBarDatum = { name: string; registeredElectors: number };

export function ConstituencyBarChart({ data }: { data: ConstituencyBarDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(360, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis type="number" tickFormatter={(v) => new Intl.NumberFormat().format(v)} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <YAxis
          type="category"
          dataKey="name"
          width={168}
          tick={{ fontSize: 11 }}
          stroke="var(--muted-foreground)"
        />
        <Tooltip
          formatter={(v) => new Intl.NumberFormat().format(Number(v))}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
        />
        <Bar dataKey="registeredElectors" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
