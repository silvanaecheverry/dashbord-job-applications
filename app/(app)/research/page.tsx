import { PageHeader } from "@/components/layout/page-header";
import { ResearchTable } from "@/components/research/research-table";
import { safeList } from "@/lib/supabase/safe-query";
import { createClient } from "@/lib/supabase/server";
import type { CompanyResearch } from "@/lib/types";

export default async function ResearchPage() {
  const supabase = createClient();
  const research = await safeList<CompanyResearch>(
    "company research",
    supabase.from("company_research").select("*").order("company", { ascending: true }),
  );

  return (
    <div>
      <PageHeader
        title="Company Research"
        description="Keep notes on companies you're targeting — culture, size, recruiters, and more."
      />
      <ResearchTable research={research} />
    </div>
  );
}
