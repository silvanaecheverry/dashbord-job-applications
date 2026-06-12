"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  APPLICATION_STAGES,
  APPLIED_WHERE_OPTIONS,
  INTEREST_BADGE_STYLES,
  INTEREST_LEVELS,
  JOB_TYPES,
  LOCATION_TYPES,
  STAGE_BADGE_STYLES,
} from "@/lib/constants";
import { exportToCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/client";
import type { JobApplication } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Briefcase,
  Download,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface ApplicationsTableProps {
  applications: JobApplication[];
}

const EMPTY = "__all__";

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [company, setCompany] = useState(EMPTY);
  const [stage, setStage] = useState(EMPTY);
  const [jobType, setJobType] = useState(EMPTY);
  const [location, setLocation] = useState(EMPTY);
  const [interest, setInterest] = useState(EMPTY);
  const [appliedWhere, setAppliedWhere] = useState(EMPTY);
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [closingFrom, setClosingFrom] = useState("");
  const [closingTo, setClosingTo] = useState("");

  const [sorting, setSorting] = useState<SortingState>([{ id: "date_applied", desc: true }]);
  const [deleteTarget, setDeleteTarget] = useState<JobApplication | null>(null);
  const [deleting, setDeleting] = useState(false);

  const companies = useMemo(
    () => Array.from(new Set(applications.map((a) => a.company))).sort(),
    [applications],
  );

  const filtersActive =
    search !== "" ||
    company !== EMPTY ||
    stage !== EMPTY ||
    jobType !== EMPTY ||
    location !== EMPTY ||
    interest !== EMPTY ||
    appliedWhere !== EMPTY ||
    appliedFrom !== "" ||
    appliedTo !== "" ||
    closingFrom !== "" ||
    closingTo !== "";

  const clearFilters = () => {
    setSearch("");
    setCompany(EMPTY);
    setStage(EMPTY);
    setJobType(EMPTY);
    setLocation(EMPTY);
    setInterest(EMPTY);
    setAppliedWhere(EMPTY);
    setAppliedFrom("");
    setAppliedTo("");
    setClosingFrom("");
    setClosingTo("");
  };

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (search) {
        const haystack = `${app.company} ${app.role}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      if (company !== EMPTY && app.company !== company) return false;
      if (stage !== EMPTY && app.application_stage !== stage) return false;
      if (jobType !== EMPTY && app.job_type !== jobType) return false;
      if (location !== EMPTY && app.location_type !== location) return false;
      if (interest !== EMPTY && app.interest_level !== interest) return false;
      if (appliedWhere !== EMPTY && app.applied_where !== appliedWhere) return false;
      if (appliedFrom && (!app.date_applied || app.date_applied < appliedFrom)) return false;
      if (appliedTo && (!app.date_applied || app.date_applied > appliedTo)) return false;
      if (closingFrom && (!app.closing_date || app.closing_date < closingFrom)) return false;
      if (closingTo && (!app.closing_date || app.closing_date > closingTo)) return false;
      return true;
    });
  }, [
    applications,
    search,
    company,
    stage,
    jobType,
    location,
    interest,
    appliedWhere,
    appliedFrom,
    appliedTo,
    closingFrom,
    closingTo,
  ]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("job_applications").delete().eq("id", deleteTarget.id);
    setDeleting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Application deleted");
    setDeleteTarget(null);
    router.refresh();
  };

  const handleExport = () => {
    exportToCsv(
      "job-applications.csv",
      filtered,
      [
        { key: "company", label: "Company" },
        { key: "role", label: "Role" },
        { key: "application_stage", label: "Application Stage" },
        { key: "job_type", label: "Job Type" },
        { key: "location_type", label: "Location" },
        { key: "interest_level", label: "Interest in Role" },
        { key: "opening_date", label: "Opening Date" },
        { key: "closing_date", label: "Closing Date" },
        { key: "date_applied", label: "Date Applied" },
        { key: "salary", label: "Salary" },
        { key: "recruiter_name", label: "Recruiter Name" },
        { key: "recruiter_linkedin", label: "Recruiter LinkedIn" },
        { key: "job_link", label: "Job Link" },
        { key: "applied_where", label: "Applied Where" },
        { key: "resume_submitted", label: "Resume Submitted" },
        { key: "recommendation_letter", label: "Recommendation Letter" },
        { key: "wrote_to_recruiter", label: "Wrote to Recruiter" },
        { key: "notes", label: "Notes" },
      ],
    );
  };

  const columns = useMemo<ColumnDef<JobApplication>[]>(
    () => [
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.company}</div>
            <div className="text-xs text-muted-foreground">{row.original.role}</div>
          </div>
        ),
      },
      {
        accessorKey: "application_stage",
        header: "Stage",
        cell: ({ row }) => (
          <Badge className={STAGE_BADGE_STYLES[row.original.application_stage]}>
            {row.original.application_stage}
          </Badge>
        ),
      },
      {
        accessorKey: "job_type",
        header: "Job Type",
        cell: ({ row }) => row.original.job_type ?? "—",
      },
      {
        accessorKey: "location_type",
        header: "Location",
        cell: ({ row }) => row.original.location_type ?? "—",
      },
      {
        accessorKey: "interest_level",
        header: "Interest",
        cell: ({ row }) =>
          row.original.interest_level ? (
            <Badge className={INTEREST_BADGE_STYLES[row.original.interest_level]}>
              {row.original.interest_level}
            </Badge>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "date_applied",
        header: "Date Applied",
        cell: ({ row }) => formatDate(row.original.date_applied),
      },
      {
        accessorKey: "closing_date",
        header: "Closing Date",
        cell: ({ row }) => formatDate(row.original.closing_date),
      },
      {
        accessorKey: "salary",
        header: "Salary",
        cell: ({ row }) => row.original.salary || "—",
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Link
              href={`/applications/${row.original.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Edit application"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
              aria-label="Delete application"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search by company or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">
              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              <Link href="/applications/new">
                <Button size="sm" className="gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Add Application
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Select value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value={EMPTY}>All Companies</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value={EMPTY}>All Stages</option>
              {APPLICATION_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select value={jobType} onChange={(e) => setJobType(e.target.value)}>
              <option value={EMPTY}>All Job Types</option>
              {JOB_TYPES.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </Select>
            <Select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value={EMPTY}>All Locations</option>
              {LOCATION_TYPES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
            <Select value={interest} onChange={(e) => setInterest(e.target.value)}>
              <option value={EMPTY}>All Interest Levels</option>
              {INTEREST_LEVELS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
            <Select value={appliedWhere} onChange={(e) => setAppliedWhere(e.target.value)}>
              <option value={EMPTY}>All Sources</option>
              {APPLIED_WHERE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Applied from
              <Input type="date" value={appliedFrom} onChange={(e) => setAppliedFrom(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Applied to
              <Input type="date" value={appliedTo} onChange={(e) => setAppliedTo(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Closing from
              <Input type="date" value={closingFrom} onChange={(e) => setClosingFrom(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Closing to
              <Input type="date" value={closingTo} onChange={(e) => setClosingTo(e.target.value)} />
            </label>
          </div>
        </div>
      </Card>

      {applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Start tracking your job search by adding your first application."
          action={
            <Link href="/applications/new">
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Add Application
              </Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications match your filters"
          description="Try adjusting or clearing your filters."
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
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const sortable = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {sortable ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {sorted === "asc" && <ArrowUp className="h-3 w-3" />}
                              {sorted === "desc" && <ArrowDown className="h-3 w-3" />}
                              {!sorted && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0 hover:bg-muted/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Showing {table.getRowModel().rows.length} of {filtered.length} applications
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete application?"
        description={
          deleteTarget
            ? `This will permanently delete the application for ${deleteTarget.role} at ${deleteTarget.company}, along with any associated interviews.`
            : undefined
        }
        loading={deleting}
      />
    </div>
  );
}
