"use client";

import { RecruiterForm } from "@/components/recruiters/recruiter-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { exportToCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/client";
import type { Recruiter } from "@/lib/types";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, ExternalLink, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RecruitersTableProps {
  recruiters: Recruiter[];
}

export function RecruitersTable({ recruiters }: RecruitersTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [modalState, setModalState] = useState<"closed" | "create" | Recruiter>("closed");
  const [deleteTarget, setDeleteTarget] = useState<Recruiter | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return recruiters;
    const term = search.toLowerCase();
    return recruiters.filter((r) =>
      `${r.name} ${r.company ?? ""} ${r.email ?? ""}`.toLowerCase().includes(term),
    );
  }, [recruiters, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("recruiters").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Recruiter deleted");
    setDeleteTarget(null);
    router.refresh();
  };

  const handleExport = () => {
    exportToCsv("recruiters.csv", filtered, [
      { key: "name", label: "Name" },
      { key: "company", label: "Company" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "linkedin_url", label: "LinkedIn" },
      { key: "notes", label: "Notes" },
    ]);
  };

  const columns = useMemo<ColumnDef<Recruiter>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            {row.original.linkedin_url && (
              <a
                href={row.original.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline dark:text-brand-300"
              >
                LinkedIn
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => row.original.company ?? "—",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) =>
          row.original.email ? (
            <a href={`mailto:${row.original.email}`} className="text-brand-600 hover:underline dark:text-brand-300">
              {row.original.email}
            </a>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.original.phone ?? "—",
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => setModalState(row.original)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Edit recruiter"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
              aria-label="Delete recruiter"
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
  });

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name, company, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-1 flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button size="sm" className="gap-1" onClick={() => setModalState("create")}>
            <Plus className="h-3.5 w-3.5" />
            Add Recruiter
          </Button>
        </div>
      </Card>

      {recruiters.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No recruiters yet"
          description="Keep track of recruiter contacts: company, email, phone, and LinkedIn."
          action={
            <Button className="gap-1" onClick={() => setModalState("create")}>
              <Plus className="h-4 w-4" />
              Add Recruiter
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No recruiters match your search" />
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
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/40">
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
        </Card>
      )}

      <Modal
        open={modalState !== "closed"}
        onClose={() => setModalState("closed")}
        title={modalState === "create" ? "Add Recruiter" : "Edit Recruiter"}
      >
        {modalState !== "closed" && (
          <RecruiterForm
            recruiter={modalState === "create" ? undefined : modalState}
            onSuccess={() => setModalState("closed")}
            onCancel={() => setModalState("closed")}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete recruiter?"
        description={deleteTarget ? `This will permanently delete ${deleteTarget.name}.` : undefined}
        loading={deleting}
      />
    </div>
  );
}
