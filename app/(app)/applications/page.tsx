import { ApplicationsTable } from "@/components/applications/applications-table";
import { PageHeader } from "@/components/layout/page-header";
import { safeList } from "@/lib/supabase/safe-query";
import { createClient } from "@/lib/supabase/server";
import type { JobApplication } from "@/lib/types";

export default async function ApplicationsPage() {
  const supabase = createClient();
  const applications = await safeList<JobApplication>(
    "job applications",
    supabase
      .from("job_applications")
      .select("*")
      .order("date_applied", { ascending: false, nullsFirst: false }),
  );

  return (
    <div>
      <PageHeader
        title="Job Applications"
        description="Track, filter, and manage every application in your pipeline."
      />
      <ApplicationsTable applications={applications} />
    </div>
  );
}
