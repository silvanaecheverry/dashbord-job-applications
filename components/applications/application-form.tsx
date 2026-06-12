"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  APPLICATION_STAGES,
  APPLIED_WHERE_OPTIONS,
  INTEREST_LEVELS,
  JOB_TYPES,
  LOCATION_TYPES,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { JobApplication } from "@/lib/types";
import { toNullable } from "@/lib/utils";
import { applicationSchema, type ApplicationFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ApplicationFormProps {
  application?: JobApplication;
}

function toDefaultValues(application?: JobApplication): ApplicationFormValues {
  return {
    company: application?.company ?? "",
    role: application?.role ?? "",
    opening_date: application?.opening_date ?? "",
    closing_date: application?.closing_date ?? "",
    date_applied: application?.date_applied ?? "",
    application_stage: application?.application_stage ?? "Not Applied",
    job_type: application?.job_type ?? "",
    location_type: application?.location_type ?? "",
    interest_level: application?.interest_level ?? "",
    notes: application?.notes ?? "",
    salary: application?.salary ?? "",
    recruiter_name: application?.recruiter_name ?? "",
    recruiter_linkedin: application?.recruiter_linkedin ?? "",
    job_link: application?.job_link ?? "",
    applied_where: application?.applied_where ?? "",
    resume_submitted: application?.resume_submitted ?? false,
    recommendation_letter: application?.recommendation_letter ?? false,
    wrote_to_recruiter: application?.wrote_to_recruiter ?? false,
  };
}

export function ApplicationForm({ application }: ApplicationFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: toDefaultValues(application),
  });

  const onSubmit = async (values: ApplicationFormValues) => {
    setLoading(true);

    const payload = {
      company: values.company.trim(),
      role: values.role.trim(),
      opening_date: toNullable(values.opening_date),
      closing_date: toNullable(values.closing_date),
      date_applied: toNullable(values.date_applied),
      application_stage: values.application_stage,
      job_type: toNullable(values.job_type),
      location_type: toNullable(values.location_type),
      interest_level: toNullable(values.interest_level),
      notes: toNullable(values.notes),
      salary: toNullable(values.salary),
      recruiter_name: toNullable(values.recruiter_name),
      recruiter_linkedin: toNullable(values.recruiter_linkedin),
      job_link: toNullable(values.job_link),
      applied_where: toNullable(values.applied_where),
      resume_submitted: values.resume_submitted,
      recommendation_letter: values.recommendation_letter,
      wrote_to_recruiter: values.wrote_to_recruiter,
    };

    if (application) {
      const { error } = await supabase
        .from("job_applications")
        .update(payload)
        .eq("id", application.id);

      setLoading(false);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Application updated");
      router.push("/applications");
      router.refresh();
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        toast.error("You must be signed in.");
        return;
      }

      const { error } = await supabase
        .from("job_applications")
        .insert({ ...payload, user_id: userData.user.id });

      setLoading(false);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Application created");
      router.push("/applications");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="company" error={errors.company?.message} required>
            <Input id="company" placeholder="Acme Corp" {...register("company")} />
          </Field>
          <Field label="Role" htmlFor="role" error={errors.role?.message} required>
            <Input id="role" placeholder="Senior Product Manager" {...register("role")} />
          </Field>
          <Field label="Job Type" htmlFor="job_type">
            <Select id="job_type" {...register("job_type")}>
              <option value="">Select job type</option>
              {JOB_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Location" htmlFor="location_type">
            <Select id="location_type" {...register("location_type")}>
              <option value="">Select location</option>
              {LOCATION_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Interest in Role" htmlFor="interest_level">
            <Select id="interest_level" {...register("interest_level")}>
              <option value="">Select interest level</option>
              {INTEREST_LEVELS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Salary" htmlFor="salary">
            <Input id="salary" placeholder="$120,000 - $140,000" {...register("salary")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline & status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Opening Date" htmlFor="opening_date">
            <Input id="opening_date" type="date" {...register("opening_date")} />
          </Field>
          <Field label="Closing Date" htmlFor="closing_date">
            <Input id="closing_date" type="date" {...register("closing_date")} />
          </Field>
          <Field label="Date Applied" htmlFor="date_applied">
            <Input id="date_applied" type="date" {...register("date_applied")} />
          </Field>
          <Field
            label="Application Stage"
            htmlFor="application_stage"
            error={errors.application_stage?.message}
            required
          >
            <Select id="application_stage" {...register("application_stage")}>
              {APPLICATION_STAGES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recruiter & application source</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Recruiter Name" htmlFor="recruiter_name">
            <Input id="recruiter_name" placeholder="Jane Doe" {...register("recruiter_name")} />
          </Field>
          <Field label="Recruiter LinkedIn Profile" htmlFor="recruiter_linkedin">
            <Input
              id="recruiter_linkedin"
              placeholder="https://linkedin.com/in/..."
              {...register("recruiter_linkedin")}
            />
          </Field>
          <Field label="Applied Where" htmlFor="applied_where">
            <Select id="applied_where" {...register("applied_where")}>
              <option value="">Select source</option>
              {APPLIED_WHERE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Job Link" htmlFor="job_link">
            <Input id="job_link" placeholder="https://company.com/careers/..." {...register("job_link")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
          <Checkbox
            id="resume_submitted"
            label="Resume Submitted"
            {...register("resume_submitted")}
          />
          <Checkbox
            id="recommendation_letter"
            label="Recommendation Letter"
            {...register("recommendation_letter")}
          />
          <Checkbox
            id="wrote_to_recruiter"
            label="Wrote to Recruiter"
            {...register("wrote_to_recruiter")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any notes about this application…"
            rows={4}
            {...register("notes")}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/applications")}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {application ? "Save Changes" : "Create Application"}
        </Button>
      </div>
    </form>
  );
}
