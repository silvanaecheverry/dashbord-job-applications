import { ApplicationForm } from "@/components/applications/application-form";
import { InterviewsManager } from "@/components/interviews/interviews-manager";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Interview, JobApplication } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("job_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!application) {
    notFound();
  }

  const { data: interviews } = await supabase
    .from("interviews")
    .select("*")
    .eq("application_id", id)
    .order("interview_number", { ascending: true });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Application"
        description={`${(application as JobApplication).role} at ${(application as JobApplication).company}`}
      />
      <ApplicationForm application={application as JobApplication} />
      <InterviewsManager applicationId={id} interviews={(interviews as Interview[]) ?? []} />
    </div>
  );
}
