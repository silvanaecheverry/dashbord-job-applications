import { DistributionPieChart } from "@/components/charts/distribution-pie-chart";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { PipelineFunnelChart } from "@/components/charts/pipeline-funnel-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/layout/page-header";
import {
  computeKpis,
  interestData,
  jobTypeData,
  lastNMonthKeys,
  monthlyTrendData,
  pipelineFunnelData,
} from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";
import { safeCount, safeList } from "@/lib/supabase/safe-query";
import type { Interview, JobApplication } from "@/lib/types";
import {
  Activity,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  Gift,
  Star,
  Trophy,
  XCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  const [apps, ivs, companiesResearched] = await Promise.all([
    safeList<JobApplication>("job applications", supabase.from("job_applications").select("*")),
    safeList<Interview>("interviews", supabase.from("interviews").select("*")),
    safeCount(
      "companies researched",
      supabase.from("company_research").select("*", { count: "exact", head: true }),
    ),
  ]);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const months = lastNMonthKeys(6, currentMonth);

  const kpis = computeKpis(apps, ivs, companiesResearched ?? 0, currentMonth);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your job search at a glance." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total Applications" value={kpis.totalApplications} icon={Briefcase} accent="bg-brand-600" />
        <KpiCard label="Applications This Month" value={kpis.applicationsThisMonth} icon={CalendarPlus} accent="bg-brand-500" />
        <KpiCard label="Interviews Scheduled" value={kpis.interviewsScheduled} icon={CalendarClock} accent="bg-brand-400" />
        <KpiCard label="Interviews Completed" value={kpis.interviewsCompleted} icon={CalendarCheck} accent="bg-emerald-500" />
        <KpiCard label="Active Applications" value={kpis.activeApplications} icon={Activity} accent="bg-amber-500" />
        <KpiCard label="Offers Received" value={kpis.offersReceived} icon={Gift} accent="bg-blue-500" />
        <KpiCard label="Accepted Offers" value={kpis.acceptedOffers} icon={Trophy} accent="bg-emerald-600" />
        <KpiCard label="Rejected Applications" value={kpis.rejectedApplications} icon={XCircle} accent="bg-rose-500" />
        <KpiCard label="High Interest Roles" value={kpis.highInterestRoles} icon={Star} accent="bg-brand-300" />
        <KpiCard label="Companies Researched" value={kpis.companiesResearched} icon={Building2} accent="bg-brand-700" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineFunnelChart data={pipelineFunnelData(apps)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Applications Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={monthlyTrendData(apps, months)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications by Job Type</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionPieChart data={jobTypeData(apps)} emptyTitle="No job type data yet" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications by Interest Level</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionPieChart data={interestData(apps)} emptyTitle="No interest level data yet" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
