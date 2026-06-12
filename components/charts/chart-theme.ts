import type { CSSProperties } from "react";

export const chartTooltipStyle: CSSProperties = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--card-foreground)",
  fontSize: 12,
  padding: "8px 12px",
};

export const chartAxisStyle = { fontSize: 12, fill: "var(--muted-foreground)" };

export const chartGridStroke = "var(--border)";
