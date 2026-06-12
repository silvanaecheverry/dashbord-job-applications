"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { CompanyResearch } from "@/lib/types";
import { toNullable } from "@/lib/utils";
import { companyResearchSchema, type CompanyResearchFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ResearchFormProps {
  research?: CompanyResearch;
  onSuccess: () => void;
  onCancel: () => void;
}

function toDefaultValues(research?: CompanyResearch): CompanyResearchFormValues {
  return {
    company: research?.company ?? "",
    website: research?.website ?? "",
    location: research?.location ?? "",
    industry: research?.industry ?? "",
    company_size: research?.company_size ?? "",
    recruiter_name: research?.recruiter_name ?? "",
    recruiter_linkedin: research?.recruiter_linkedin ?? "",
    notes: research?.notes ?? "",
  };
}

export function ResearchForm({ research, onSuccess, onCancel }: ResearchFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyResearchFormValues>({
    resolver: zodResolver(companyResearchSchema),
    defaultValues: toDefaultValues(research),
  });

  const onSubmit = async (values: CompanyResearchFormValues) => {
    setLoading(true);

    const payload = {
      company: values.company.trim(),
      website: toNullable(values.website),
      location: toNullable(values.location),
      industry: toNullable(values.industry),
      company_size: toNullable(values.company_size),
      recruiter_name: toNullable(values.recruiter_name),
      recruiter_linkedin: toNullable(values.recruiter_linkedin),
      notes: toNullable(values.notes),
    };

    if (research) {
      const { error } = await supabase.from("company_research").update(payload).eq("id", research.id);
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Company research updated");
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        toast.error("You must be signed in.");
        return;
      }
      const { error } = await supabase
        .from("company_research")
        .insert({ ...payload, user_id: userData.user.id });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Company research added");
    }

    router.refresh();
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" htmlFor="research_company" error={errors.company?.message} required>
          <Input id="research_company" placeholder="Acme Corp" {...register("company")} />
        </Field>
        <Field label="Website" htmlFor="website">
          <Input id="website" placeholder="https://acme.com" {...register("website")} />
        </Field>
        <Field label="Location" htmlFor="research_location">
          <Input id="research_location" placeholder="New York, NY" {...register("location")} />
        </Field>
        <Field label="Industry" htmlFor="industry">
          <Input id="industry" placeholder="Software / SaaS" {...register("industry")} />
        </Field>
        <Field label="Company Size" htmlFor="company_size">
          <Input id="company_size" placeholder="1,000-5,000 employees" {...register("company_size")} />
        </Field>
        <Field label="Recruiter Name" htmlFor="research_recruiter_name">
          <Input id="research_recruiter_name" placeholder="Jane Doe" {...register("recruiter_name")} />
        </Field>
        <Field label="Recruiter LinkedIn Link" htmlFor="research_recruiter_linkedin" className="sm:col-span-2">
          <Input
            id="research_recruiter_linkedin"
            placeholder="https://linkedin.com/in/..."
            {...register("recruiter_linkedin")}
          />
        </Field>
      </div>

      <Field label="Notes" htmlFor="research_notes">
        <Textarea id="research_notes" rows={4} placeholder="Culture, interview process, salary bands…" {...register("notes")} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {research ? "Save Changes" : "Add Company"}
        </Button>
      </div>
    </form>
  );
}
