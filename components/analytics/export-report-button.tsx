"use client";

import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/csv";
import type { JobApplication } from "@/lib/types";
import { Download } from "lucide-react";

interface ExportReportButtonProps {
  applications: JobApplication[];
}

export function ExportReportButton({ applications }: ExportReportButtonProps) {
  const handleExport = () => {
    exportToCsv("job-applications-report.csv", applications, [
      { key: "company", label: "Company" },
      { key: "role", label: "Role" },
      { key: "application_stage", label: "Application Stage" },
      { key: "job_type", label: "Job Type" },
      { key: "location_type", label: "Location" },
      { key: "interest_level", label: "Interest in Role" },
      { key: "opening_date", label: "Opening Date" },
      { key: "closing_date", label: "Closing Date" },
      { key: "date_applied", label: "Date Applied" },
      { key: "salary", label: "Salary" },
      { key: "recruiter_name", label: "Recruiter Name" },
      { key: "recruiter_linkedin", label: "Recruiter LinkedIn" },
      { key: "job_link", label: "Job Link" },
      { key: "applied_where", label: "Applied Where" },
      { key: "resume_submitted", label: "Resume Submitted" },
      { key: "recommendation_letter", label: "Recommendation Letter" },
      { key: "wrote_to_recruiter", label: "Wrote to Recruiter" },
      { key: "notes", label: "Notes" },
    ]);
  };

  return (
    <Button variant="outline" size="sm" className="gap-1" onClick={handleExport}>
      <Download className="h-3.5 w-3.5" />
      Export Report (CSV)
    </Button>
  );
}
