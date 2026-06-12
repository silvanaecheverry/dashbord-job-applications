"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { Recruiter } from "@/lib/types";
import { toNullable } from "@/lib/utils";
import { recruiterSchema, type RecruiterFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface RecruiterFormProps {
  recruiter?: Recruiter;
  onSuccess: () => void;
  onCancel: () => void;
}

function toDefaultValues(recruiter?: Recruiter): RecruiterFormValues {
  return {
    name: recruiter?.name ?? "",
    linkedin_url: recruiter?.linkedin_url ?? "",
    company: recruiter?.company ?? "",
    email: recruiter?.email ?? "",
    phone: recruiter?.phone ?? "",
    notes: recruiter?.notes ?? "",
  };
}

export function RecruiterForm({ recruiter, onSuccess, onCancel }: RecruiterFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruiterFormValues>({
    resolver: zodResolver(recruiterSchema),
    defaultValues: toDefaultValues(recruiter),
  });

  const onSubmit = async (values: RecruiterFormValues) => {
    setLoading(true);

    const payload = {
      name: values.name.trim(),
      linkedin_url: toNullable(values.linkedin_url),
      company: toNullable(values.company),
      email: toNullable(values.email),
      phone: toNullable(values.phone),
      notes: toNullable(values.notes),
    };

    if (recruiter) {
      const { error } = await supabase.from("recruiters").update(payload).eq("id", recruiter.id);
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Recruiter updated");
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        toast.error("You must be signed in.");
        return;
      }
      const { error } = await supabase.from("recruiters").insert({ ...payload, user_id: userData.user.id });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Recruiter added");
    }

    router.refresh();
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="recruiter_name" error={errors.name?.message} required>
          <Input id="recruiter_name" placeholder="Jane Doe" {...register("name")} />
        </Field>
        <Field label="Company" htmlFor="recruiter_company">
          <Input id="recruiter_company" placeholder="Acme Corp" {...register("company")} />
        </Field>
        <Field label="Email" htmlFor="recruiter_email" error={errors.email?.message}>
          <Input id="recruiter_email" type="email" placeholder="jane@acme.com" {...register("email")} />
        </Field>
        <Field label="Phone" htmlFor="recruiter_phone">
          <Input id="recruiter_phone" placeholder="+1 555 123 4567" {...register("phone")} />
        </Field>
        <Field label="LinkedIn Profile" htmlFor="recruiter_linkedin_url" className="sm:col-span-2">
          <Input
            id="recruiter_linkedin_url"
            placeholder="https://linkedin.com/in/..."
            {...register("linkedin_url")}
          />
        </Field>
      </div>

      <Field label="Notes" htmlFor="recruiter_notes">
        <Textarea id="recruiter_notes" rows={4} placeholder="How you connected, follow-ups, etc…" {...register("notes")} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {recruiter ? "Save Changes" : "Add Recruiter"}
        </Button>
      </div>
    </form>
  );
}
