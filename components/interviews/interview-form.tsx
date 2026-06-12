"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { INTERVIEW_TYPES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { Interview } from "@/lib/types";
import { toNullable } from "@/lib/utils";
import { interviewSchema, type InterviewFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface InterviewFormProps {
  applicationId: string;
  interview?: Interview;
  nextInterviewNumber: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function toDefaultValues(interview?: Interview, nextInterviewNumber?: number): InterviewFormValues {
  return {
    interview_number: String(interview?.interview_number ?? nextInterviewNumber ?? 1),
    date: interview?.date ?? "",
    time: interview?.time ?? "",
    type: interview?.type ?? "",
    location: interview?.location ?? "",
    contact_name: interview?.contact_name ?? "",
    contact_info: interview?.contact_info ?? "",
    interview_scheduled: interview?.interview_scheduled ?? false,
    interview_done: interview?.interview_done ?? false,
    follow_up_sent: interview?.follow_up_sent ?? false,
    notes: interview?.notes ?? "",
  };
}

export function InterviewForm({
  applicationId,
  interview,
  nextInterviewNumber,
  onSuccess,
  onCancel,
}: InterviewFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: toDefaultValues(interview, nextInterviewNumber),
  });

  const onSubmit = async (values: InterviewFormValues) => {
    setLoading(true);

    const payload = {
      interview_number: Number(values.interview_number),
      date: toNullable(values.date),
      time: toNullable(values.time),
      type: toNullable(values.type),
      location: toNullable(values.location),
      contact_name: toNullable(values.contact_name),
      contact_info: toNullable(values.contact_info),
      interview_scheduled: values.interview_scheduled,
      interview_done: values.interview_done,
      follow_up_sent: values.follow_up_sent,
      notes: toNullable(values.notes),
    };

    if (interview) {
      const { error } = await supabase.from("interviews").update(payload).eq("id", interview.id);
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Interview updated");
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        toast.error("You must be signed in.");
        return;
      }
      const { error } = await supabase
        .from("interviews")
        .insert({ ...payload, application_id: applicationId, user_id: userData.user.id });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Interview added");
    }

    router.refresh();
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Interview Number"
          htmlFor="interview_number"
          error={errors.interview_number?.message}
          required
        >
          <Input id="interview_number" type="number" min={1} {...register("interview_number")} />
        </Field>
        <Field label="Type" htmlFor="type">
          <Select id="type" {...register("type")}>
            <option value="">Select type</option>
            {INTERVIEW_TYPES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date" htmlFor="date">
          <Input id="date" type="date" {...register("date")} />
        </Field>
        <Field label="Time" htmlFor="time">
          <Input id="time" type="time" {...register("time")} />
        </Field>
        <Field label="Location" htmlFor="location" className="sm:col-span-2">
          <Input id="location" placeholder="Office address or video link" {...register("location")} />
        </Field>
        <Field label="Contact Name" htmlFor="contact_name">
          <Input id="contact_name" placeholder="Interviewer name" {...register("contact_name")} />
        </Field>
        <Field label="Contact Info" htmlFor="contact_info">
          <Input id="contact_info" placeholder="Email or phone" {...register("contact_info")} />
        </Field>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
        <Checkbox
          id="interview_scheduled"
          label="Interview Scheduled"
          {...register("interview_scheduled")}
        />
        <Checkbox id="interview_done" label="Interview Done" {...register("interview_done")} />
        <Checkbox id="follow_up_sent" label="Follow-Up Sent" {...register("follow_up_sent")} />
      </div>

      <Field label="Notes" htmlFor="interview_notes">
        <Textarea id="interview_notes" rows={3} placeholder="Interview notes…" {...register("notes")} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {interview ? "Save Changes" : "Add Interview"}
        </Button>
      </div>
    </form>
  );
}
