"use client";

import { chartTooltipStyle } from "@/components/charts/chart-theme";
import { EmptyState } from "@/components/ui/empty-state";
import { CHART_COLORS } from "@/lib/constants";
import type { CountDatum } from "@/lib/analytics";
import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DistributionPieChartProps {
  data: CountDatum[];
  emptyTitle?: string;
}

export function DistributionPieChart({ data, emptyTitle = "No data yet" }: DistributionPieChartProps) {
  if (data.length === 0) {
    return <EmptyState icon={PieChartIcon} title={emptyTitle} />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Tooltip contentStyle={chartTooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ value }) => value}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
