import { z } from "zod";
import {
  APPLICATION_STAGES,
  APPLIED_WHERE_OPTIONS,
  INTEREST_LEVELS,
  INTERVIEW_TYPES,
  JOB_TYPES,
  LOCATION_TYPES,
} from "@/lib/constants";

const optional = z.string().optional();
const emptyOrEnum = (values: readonly string[]) => z.union([z.enum(values as [string, ...string[]]), z.literal("")]);

export const applicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  opening_date: optional,
  closing_date: optional,
  date_applied: optional,
  application_stage: z.enum(APPLICATION_STAGES as [string, ...string[]]),
  job_type: emptyOrEnum(JOB_TYPES),
  location_type: emptyOrEnum(LOCATION_TYPES),
  interest_level: emptyOrEnum(INTEREST_LEVELS),
  notes: optional,
  salary: optional,
  recruiter_name: optional,
  recruiter_linkedin: optional,
  job_link: optional,
  applied_where: emptyOrEnum(APPLIED_WHERE_OPTIONS),
  resume_submitted: z.boolean(),
  recommendation_letter: z.boolean(),
  wrote_to_recruiter: z.boolean(),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

export const interviewSchema = z.object({
  interview_number: z
    .string()
    .min(1, "Required")
    .refine((val) => Number.isInteger(Number(val)) && Number(val) >= 1, "Must be at least 1"),
  date: optional,
  time: optional,
  type: emptyOrEnum(INTERVIEW_TYPES),
  location: optional,
  contact_name: optional,
  contact_info: optional,
  interview_scheduled: z.boolean(),
  interview_done: z.boolean(),
  follow_up_sent: z.boolean(),
  notes: optional,
});

export type InterviewFormValues = z.infer<typeof interviewSchema>;

export const companyResearchSchema = z.object({
  company: z.string().min(1, "Company is required"),
  website: optional,
  location: optional,
  industry: optional,
  company_size: optional,
  recruiter_name: optional,
  recruiter_linkedin: optional,
  notes: optional,
});

export type CompanyResearchFormValues = z.infer<typeof companyResearchSchema>;

export const recruiterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  linkedin_url: optional,
  company: optional,
  email: z.union([z.string().email("Enter a valid email"), z.literal("")]),
  phone: optional,
  notes: optional,
});

export type RecruiterFormValues = z.infer<typeof recruiterSchema>;
