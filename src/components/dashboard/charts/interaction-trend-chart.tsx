"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function InteractionTrendChart({ data }: { data: { week: string; count: number }[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ left: -16, right: 16, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="interactionFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
        <Area type="monotone" dataKey="count" name="Interactions" stroke="var(--chart-1)" fill="url(#interactionFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
