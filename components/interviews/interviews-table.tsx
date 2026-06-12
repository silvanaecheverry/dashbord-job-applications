"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { INTERVIEW_TYPES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { InterviewWithApplication } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { CalendarClock, ExternalLink, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const EMPTY = "__all__";
const STATUS_OPTIONS = ["Scheduled", "Done", "Follow-Up Sent", "Pending"] as const;

interface InterviewsTableProps {
  interviews: InterviewWithApplication[];
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

export function InterviewsTable({ interviews }: InterviewsTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [type, setType] = useState(EMPTY);
  const [status, setStatus] = useState(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<InterviewWithApplication | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtersActive = search !== "" || type !== EMPTY || status !== EMPTY;

  const clearFilters = () => {
    setSearch("");
    setType(EMPTY);
    setStatus(EMPTY);
  };

  const filtered = useMemo(() => {
    return interviews.filter((interview) => {
      if (search) {
        const haystack = `${interview.job_applications?.company ?? ""} ${
          interview.job_applications?.role ?? ""
        } ${interview.contact_name ?? ""}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      if (type !== EMPTY && interview.type !== type) return false;
      if (status === "Scheduled" && !interview.interview_scheduled) return false;
      if (status === "Done" && !interview.interview_done) return false;
      if (status === "Follow-Up Sent" && !interview.follow_up_sent) return false;
      if (status === "Pending" && interview.interview_done) return false;
      return true;
    });
  }, [interviews, search, type, status]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const dateA = a.date ?? "";
        const dateB = b.date ?? "";
        return dateB.localeCompare(dateA);
      }),
    [filtered],
  );

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
    <div className="space-y-4">
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by company, role, or contact…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-1 flex-wrap gap-2">
          <Select value={type} onChange={(e) => setType(e.target.value)} className="sm:max-w-[160px]">
            <option value={EMPTY}>All Types</option>
            {INTERVIEW_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:max-w-[180px]">
            <option value={EMPTY}>All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      </Card>

      {interviews.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No interviews yet"
          description="Interviews you log against your applications will show up here."
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No interviews match your filters"
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Company / Role
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    #
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Date / Time
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Type
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Location
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Contact
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((interview) => (
                  <tr key={interview.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {interview.job_applications?.company ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {interview.job_applications?.role ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">{interview.interview_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(interview.date)}
                      {interview.time ? ` · ${interview.time}` : ""}
                    </td>
                    <td className="px-4 py-3">{interview.type ?? "—"}</td>
                    <td className="px-4 py-3">{interview.location ?? "—"}</td>
                    <td className="px-4 py-3">{interview.contact_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <StatusBadge label="Scheduled" active={interview.interview_scheduled} />
                        <StatusBadge label="Done" active={interview.interview_done} />
                        <StatusBadge label="Follow-Up" active={interview.follow_up_sent} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {interview.job_applications && (
                          <Link
                            href={`/applications/${interview.job_applications.id}/edit`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Open application"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(interview)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                          aria-label="Delete interview"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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
    </div>
  );
}
