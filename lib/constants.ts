import type {
  AppliedWhere,
  ApplicationStage,
  InterestLevel,
  InterviewType,
  JobType,
  LocationType,
} from "@/lib/types";

export const APPLICATION_STAGES: ApplicationStage[] = [
  "Not Applied",
  "Applied",
  "Interview",
  "Offer Received",
  "Accepted",
  "Rejected",
];

export const JOB_TYPES: JobType[] = [
  "Full-Time",
  "Part-Time",
  "Freelance",
  "Internship",
  "Contract",
];

export const LOCATION_TYPES: LocationType[] = ["Office", "Remote", "Hybrid"];

export const INTEREST_LEVELS: InterestLevel[] = ["High", "Medium", "Low"];

export const APPLIED_WHERE_OPTIONS: AppliedWhere[] = [
  "LinkedIn",
  "Company Website",
  "Direct Referral",
  "Other Platform",
];

export const INTERVIEW_TYPES: InterviewType[] = ["In Person", "Remote"];

export const STAGE_BADGE_STYLES: Record<ApplicationStage, string> = {
  "Not Applied": "bg-muted text-muted-foreground",
  Applied: "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200",
  Interview: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "Offer Received": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export const INTEREST_BADGE_STYLES: Record<InterestLevel, string> = {
  High: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Low: "bg-muted text-muted-foreground",
};

export const CHART_COLORS = [
  "#3A1DE1",
  "#653FE9",
  "#9061F0",
  "#BB84F8",
  "#E6A6FF",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
];
