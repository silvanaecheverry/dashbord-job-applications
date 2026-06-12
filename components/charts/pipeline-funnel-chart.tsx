"use client";

import { chartTooltipStyle } from "@/components/charts/chart-theme";
import { EmptyState } from "@/components/ui/empty-state";
import { CHART_COLORS } from "@/lib/constants";
import type { CountDatum } from "@/lib/analytics";
import { GitBranch } from "lucide-react";
import { Cell, Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";

interface PipelineFunnelChartProps {
  data: CountDatum[];
}

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
  if (data.length === 0) {
    return <EmptyState icon={GitBranch} title="No applications yet" description="Add applications to see your pipeline." />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <FunnelChart>
        <Tooltip contentStyle={chartTooltipStyle} />
        <Funnel dataKey="value" data={data} isAnimationActive>
          <LabelList position="right" dataKey="name" fill="var(--foreground)" stroke="none" fontSize={12} />
          <LabelList position="center" dataKey="value" fill="#fff" stroke="none" fontSize={12} fontWeight={600} />
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
