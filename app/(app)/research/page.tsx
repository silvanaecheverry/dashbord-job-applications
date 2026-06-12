import { PageHeader } from "@/components/layout/page-header";
import { ResearchTable } from "@/components/research/research-table";
import { createClient } from "@/lib/supabase/server";
import type { CompanyResearch } from "@/lib/types";

export default async function ResearchPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_research")
    .select("*")
    .order("company", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Company Research"
        description="Keep notes on companies you're targeting — culture, size, recruiters, and more."
      />
      <ResearchTable research={(data as CompanyResearch[]) ?? []} />
    </div>
  );
}
