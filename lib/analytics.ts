import {
  APPLICATION_STAGES,
  APPLIED_WHERE_OPTIONS,
  INTEREST_LEVELS,
  JOB_TYPES,
  LOCATION_TYPES,
} from "@/lib/constants";
import type { Interview, JobApplication } from "@/lib/types";
import { monthLabel } from "@/lib/utils";

export interface DashboardKpis {
  totalApplications: number;
  applicationsThisMonth: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  activeApplications: number;
  offersReceived: number;
  acceptedOffers: number;
  rejectedApplications: number;
  highInterestRoles: number;
  companiesResearched: number;
}

const ACTIVE_STAGES = ["Applied", "Interview", "Offer Received"];

export function computeKpis(
  applications: JobApplication[],
  interviews: Interview[],
  companiesResearched: number,
  currentMonth: string,
): DashboardKpis {
  return {
    totalApplications: applications.length,
    applicationsThisMonth: applications.filter((a) => a.date_applied?.startsWith(currentMonth)).length,
    interviewsScheduled: interviews.filter((i) => i.interview_scheduled).length,
    interviewsCompleted: interviews.filter((i) => i.interview_done).length,
    activeApplications: applications.filter((a) => ACTIVE_STAGES.includes(a.application_stage)).length,
    offersReceived: applications.filter((a) => a.application_stage === "Offer Received" || a.application_stage === "Accepted")
      .length,
    acceptedOffers: applications.filter((a) => a.application_stage === "Accepted").length,
    rejectedApplications: applications.filter((a) => a.application_stage === "Rejected").length,
    highInterestRoles: applications.filter((a) => a.interest_level === "High").length,
    companiesResearched,
  };
}

export interface CountDatum {
  name: string;
  value: number;
}

function countBy<T>(items: T[], categories: readonly string[], getValue: (item: T) => string | null): CountDatum[] {
  return categories.map((category) => ({
    name: category,
    value: items.filter((item) => getValue(item) === category).length,
  }));
}

export function pipelineFunnelData(applications: JobApplication[]): CountDatum[] {
  return countBy(applications, APPLICATION_STAGES, (a) => a.application_stage).filter((d) => d.value > 0);
}

export function jobTypeData(applications: JobApplication[]): CountDatum[] {
  return countBy(applications, JOB_TYPES, (a) => a.job_type).filter((d) => d.value > 0);
}

export function locationData(applications: JobApplication[]): CountDatum[] {
  return countBy(applications, LOCATION_TYPES, (a) => a.location_type).filter((d) => d.value > 0);
}

export function interestData(applications: JobApplication[]): CountDatum[] {
  return countBy(applications, INTEREST_LEVELS, (a) => a.interest_level).filter((d) => d.value > 0);
}

export function sourceData(applications: JobApplication[]): CountDatum[] {
  return countBy(applications, APPLIED_WHERE_OPTIONS, (a) => a.applied_where).filter((d) => d.value > 0);
}

export interface MonthlyDatum {
  month: string;
  label: string;
  applications: number;
}

export function monthlyTrendData(applications: JobApplication[], monthKeys: string[]): MonthlyDatum[] {
  return monthKeys.map((month) => ({
    month,
    label: monthLabel(month),
    applications: applications.filter((a) => a.date_applied?.startsWith(month)).length,
  }));
}

export function lastNMonthKeys(n: number, referenceMonth: string): string[] {
  const [year, month] = referenceMonth.split("-").map(Number);
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(year, month - 1 - i, 1);
    keys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export interface RateDatum {
  name: string;
  value: number;
}

export function interviewCompletionRate(interviews: Interview[]): RateDatum[] {
  const scheduled = interviews.filter((i) => i.interview_scheduled).length;
  const completed = interviews.filter((i) => i.interview_scheduled && i.interview_done).length;
  const rate = scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
  return [
    { name: "Completed", value: rate },
    { name: "Remaining", value: 100 - rate },
  ];
}

export function offerConversionRate(applications: JobApplication[]): RateDatum[] {
  const total = applications.length;
  const offers = applications.filter(
    (a) => a.application_stage === "Offer Received" || a.application_stage === "Accepted",
  ).length;
  const rate = total === 0 ? 0 : Math.round((offers / total) * 100);
  return [
    { name: "Offers", value: rate },
    { name: "No Offer Yet", value: 100 - rate },
  ];
}
