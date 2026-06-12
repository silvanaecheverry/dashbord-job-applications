"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { InterviewForm } from "@/components/interviews/interview-form";
import { createClient } from "@/lib/supabase/client";
import type { Interview } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface InterviewsManagerProps {
  applicationId: string;
  interviews: Interview[];
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <Badge
      className={cn(
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </Badge>
  );
}

export function InterviewsManager({ applicationId, interviews }: InterviewsManagerProps) {
  const router = useRouter();
  const supabase = createClient();
  const [modalState, setModalState] = useState<"closed" | "create" | Interview>("closed");
  const [deleteTarget, setDeleteTarget] = useState<Interview | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = [...interviews].sort((a, b) => a.interview_number - b.interview_number);
  const nextInterviewNumber = sorted.length
    ? Math.max(...sorted.map((i) => i.interview_number)) + 1
    : 1;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("interviews").delete().eq("id", deleteTarget.id);
    setDeleting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Interview deleted");
    setDeleteTarget(null);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Interviews</CardTitle>
        <Button size="sm" className="gap-1" onClick={() => setModalState("create")}>
          <Plus className="h-3.5 w-3.5" />
          Add Interview
        </Button>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No interviews logged yet"
            description="Add an interview to start tracking the process for this application."
          />
        ) : (
          <div className="space-y-3">
            {sorted.map((interview) => (
              <div
                key={interview.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      Interview #{interview.interview_number}
                      {interview.type && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          {interview.type}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatDate(interview.date)}
                      {interview.time ? ` at ${interview.time}` : ""}
                      {interview.location ? ` · ${interview.location}` : ""}
                    </p>
                    {(interview.contact_name || interview.contact_info) && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {[interview.contact_name, interview.contact_info].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setModalState(interview)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Edit interview"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(interview)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                      aria-label="Delete interview"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge label="Scheduled" active={interview.interview_scheduled} />
                  <StatusBadge label="Done" active={interview.interview_done} />
                  <StatusBadge label="Follow-Up Sent" active={interview.follow_up_sent} />
                </div>

                {interview.notes && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {interview.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Modal
        open={modalState !== "closed"}
        onClose={() => setModalState("closed")}
        title={modalState === "create" ? "Add Interview" : "Edit Interview"}
      >
        {modalState !== "closed" && (
          <InterviewForm
            applicationId={applicationId}
            interview={modalState === "create" ? undefined : modalState}
            nextInterviewNumber={nextInterviewNumber}
            onSuccess={() => setModalState("closed")}
            onCancel={() => setModalState("closed")}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete interview?"
        description={
          deleteTarget ? `This will permanently delete Interview #${deleteTarget.interview_number}.` : undefined
        }
        loading={deleting}
      />
    </Card>
  );
}
