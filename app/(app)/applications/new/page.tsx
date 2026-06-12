import { ApplicationForm } from "@/components/applications/application-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewApplicationPage() {
  return (
    <div>
      <PageHeader
        title="Add New Application"
        description="Track a new job application and keep all the details in one place."
      />
      <ApplicationForm />
    </div>
  );
}
