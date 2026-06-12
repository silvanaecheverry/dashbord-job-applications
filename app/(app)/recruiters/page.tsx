import { PageHeader } from "@/components/layout/page-header";
import { RecruitersTable } from "@/components/recruiters/recruiters-table";
import { safeList } from "@/lib/supabase/safe-query";
import { createClient } from "@/lib/supabase/server";
import type { Recruiter } from "@/lib/types";

export default async function RecruitersPage() {
  const supabase = createClient();
  const recruiters = await safeList<Recruiter>(
    "recruiters",
    supabase.from("recruiters").select("*").order("name", { ascending: true }),
  );

  return (
    <div>
      <PageHeader
        title="Recruiters"
        description="Your network of recruiter contacts across companies."
      />
      <RecruitersTable recruiters={recruiters} />
    </div>
  );
}
