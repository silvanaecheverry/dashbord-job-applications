"use client";

import { chartAxisStyle, chartGridStroke, chartTooltipStyle } from "@/components/charts/chart-theme";
import type { MonthlyDatum } from "@/lib/analytics";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MonthlyTrendChartProps {
  data: MonthlyDatum[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="monthlyTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#653fe9" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#653fe9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
        <XAxis dataKey="label" tick={chartAxisStyle} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={chartAxisStyle} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Area
          type="monotone"
          dataKey="applications"
          name="Applications"
          stroke="#653fe9"
          strokeWidth={2}
          fill="url(#monthlyTrendFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
