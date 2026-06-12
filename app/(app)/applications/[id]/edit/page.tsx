import { ApplicationForm } from "@/components/applications/application-form";
import { InterviewsManager } from "@/components/interviews/interviews-manager";
import { PageHeader } from "@/components/layout/page-header";
import { safeData, safeList } from "@/lib/supabase/safe-query";
import { createClient } from "@/lib/supabase/server";
import type { Interview, JobApplication } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();

  const application = await safeData<JobApplication>(
    "job application",
    supabase.from("job_applications").select("*").eq("id", id).single(),
  );

  if (!application) {
    notFound();
  }

  const interviews = await safeList<Interview>(
    "application interviews",
    supabase.from("interviews").select("*").eq("application_id", id).order("interview_number", {
      ascending: true,
    }),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Application"
        description={`${application.role} at ${application.company}`}
      />
      <ApplicationForm application={application} />
      <InterviewsManager applicationId={id} interviews={interviews} />
    </div>
  );
}
