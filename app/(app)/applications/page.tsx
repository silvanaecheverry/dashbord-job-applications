import { ApplicationsTable } from "@/components/applications/applications-table";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import type { JobApplication } from "@/lib/types";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_applications")
    .select("*")
    .order("date_applied", { ascending: false, nullsFirst: false });

  return (
    <div>
      <PageHeader
        title="Job Applications"
        description="Track, filter, and manage every application in your pipeline."
      />
      <ApplicationsTable applications={(data as JobApplication[]) ?? []} />
    </div>
  );
}
