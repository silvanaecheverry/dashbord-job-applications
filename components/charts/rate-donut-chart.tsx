"use client";

import { chartTooltipStyle } from "@/components/charts/chart-theme";
import type { RateDatum } from "@/lib/analytics";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface RateDonutChartProps {
  data: RateDatum[];
  color?: string;
}

export function RateDonutChart({ data, color = "#3a1de1" }: RateDonutChartProps) {
  const rate = data[0]?.value ?? 0;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Tooltip
            contentStyle={chartTooltipStyle}
            formatter={(value) => `${Array.isArray(value) ? value[0] : value}%`}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={95}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="var(--muted)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-semibold text-foreground">{rate}%</span>
      </div>
    </div>
  );
}
