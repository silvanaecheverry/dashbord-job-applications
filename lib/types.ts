export type ApplicationStage =
  | "Not Applied"
  | "Applied"
  | "Interview"
  | "Offer Received"
  | "Accepted"
  | "Rejected";

export type JobType = "Full-Time" | "Part-Time" | "Freelance" | "Internship" | "Contract";

export type LocationType = "Office" | "Remote" | "Hybrid";

export type InterestLevel = "High" | "Medium" | "Low";

export type AppliedWhere = "LinkedIn" | "Company Website" | "Direct Referral" | "Other Platform";

export type InterviewType = "In Person" | "Remote";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  opening_date: string | null;
  closing_date: string | null;
  date_applied: string | null;
  application_stage: ApplicationStage;
  job_type: JobType | null;
  location_type: LocationType | null;
  interest_level: InterestLevel | null;
  notes: string | null;
  salary: string | null;
  recruiter_name: string | null;
  recruiter_linkedin: string | null;
  job_link: string | null;
  applied_where: AppliedWhere | null;
  resume_submitted: boolean;
  recommendation_letter: boolean;
  wrote_to_recruiter: boolean;
  created_at: string;
  updated_at: string;
}

export type JobApplicationInput = Omit<
  JobApplication,
  "id" | "created_at" | "updated_at"
>;

export interface Interview {
  id: string;
  application_id: string;
  interview_number: number;
  date: string | null;
  time: string | null;
  type: InterviewType | null;
  location: string | null;
  contact_name: string | null;
  contact_info: string | null;
  interview_scheduled: boolean;
  interview_done: boolean;
  follow_up_sent: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InterviewInput = Omit<
  Interview,
  "id" | "application_id" | "created_at" | "updated_at"
>;

export interface CompanyResearch {
  id: string;
  company: string;
  website: string | null;
  location: string | null;
  industry: string | null;
  company_size: string | null;
  recruiter_name: string | null;
  recruiter_linkedin: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CompanyResearchInput = Omit<
  CompanyResearch,
  "id" | "created_at" | "updated_at"
>;

export interface Recruiter {
  id: string;
  name: string;
  linkedin_url: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type RecruiterInput = Omit<Recruiter, "id" | "created_at" | "updated_at">;

export interface InterviewWithApplication extends Interview {
  job_applications: {
    id: string;
    company: string;
    role: string;
  } | null;
}
