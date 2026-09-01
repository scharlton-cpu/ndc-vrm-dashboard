"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  NOT_CONTACTED: "var(--muted-foreground)",
  ATTEMPTED: "var(--chart-2)",
  CONTACTED: "var(--chart-1)",
  REFUSED: "var(--destructive)",
  MOVED: "var(--chart-3)",
  DECEASED: "var(--chart-5)",
};
const LABELS: Record<string, string> = {
  NOT_CONTACTED: "Not Contacted",
  ATTEMPTED: "Attempted",
  CONTACTED: "Contacted",
  REFUSED: "Refused",
  MOVED: "Moved",
  DECEASED: "Deceased",
};

export function ContactStatusDonut({ data }: { data: { status: string; count: number }[] }) {
  const chartData = data.map((d) => ({ name: LABELS[d.status] ?? d.status, key: d.status, value: d.count }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={64}
          outerRadius={96}
          paddingAngle={2}
          startAngle={90}
          endAngle={-270}
        >
          {chartData.map((d) => (
            <Cell key={d.key} fill={COLORS[d.key] ?? "var(--chart-5)"} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v, n) => [new Intl.NumberFormat().format(Number(v)), String(n)]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
        />
        <Legend
          verticalAlign="bottom"
          height={48}
          iconType="circle"
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
