import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: string;
}

export function KpiCard({ label, value, icon: Icon, accent = "bg-brand-600" }: KpiCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4 sm:p-5">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white", accent)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
      </div>
    </Card>
  );
}
