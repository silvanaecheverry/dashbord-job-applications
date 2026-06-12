import { InterviewsTable } from "@/components/interviews/interviews-table";
import { PageHeader } from "@/components/layout/page-header";
import { safeList } from "@/lib/supabase/safe-query";
import { createClient } from "@/lib/supabase/server";
import type { InterviewWithApplication } from "@/lib/types";

export default async function InterviewsPage() {
  const supabase = createClient();
  const interviews = await safeList<InterviewWithApplication>(
    "interviews",
    supabase
      .from("interviews")
      .select("*, job_applications(id, company, role)")
      .order("date", { ascending: false, nullsFirst: false }),
  );

  return (
    <div>
      <PageHeader
        title="Interviews"
        description="All interviews across your applications, in one place."
      />
      <InterviewsTable interviews={interviews} />
    </div>
  );
}
