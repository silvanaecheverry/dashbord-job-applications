"use client";

import { ResearchForm } from "@/components/research/research-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { exportToCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/client";
import type { CompanyResearch } from "@/lib/types";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Building2, Download, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ResearchTableProps {
  research: CompanyResearch[];
}

export function ResearchTable({ research }: ResearchTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "company", desc: false }]);
  const [modalState, setModalState] = useState<"closed" | "create" | CompanyResearch>("closed");
  const [deleteTarget, setDeleteTarget] = useState<CompanyResearch | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return research;
    const term = search.toLowerCase();
    return research.filter((r) =>
      `${r.company} ${r.industry ?? ""} ${r.location ?? ""}`.toLowerCase().includes(term),
    );
  }, [research, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("company_research").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Company research deleted");
    setDeleteTarget(null);
    router.refresh();
  };

  const handleExport = () => {
    exportToCsv("company-research.csv", filtered, [
      { key: "company", label: "Company" },
      { key: "website", label: "Website" },
      { key: "location", label: "Location" },
      { key: "industry", label: "Industry" },
      { key: "company_size", label: "Company Size" },
      { key: "recruiter_name", label: "Recruiter Name" },
      { key: "recruiter_linkedin", label: "Recruiter LinkedIn" },
      { key: "notes", label: "Notes" },
    ]);
  };

  const columns = useMemo<ColumnDef<CompanyResearch>[]>(
    () => [
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.company}</div>
            {row.original.website && (
              <a
                href={row.original.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline dark:text-brand-300"
              >
                {row.original.website}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ),
      },
      {
        accessorKey: "industry",
        header: "Industry",
        cell: ({ row }) => row.original.industry ?? "—",
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => row.original.location ?? "—",
      },
      {
        accessorKey: "company_size",
        header: "Size",
        cell: ({ row }) => row.original.company_size ?? "—",
      },
      {
        accessorKey: "recruiter_name",
        header: "Recruiter",
        cell: ({ row }) => row.original.recruiter_name ?? "—",
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
              aria-label="Edit company research"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
              aria-label="Delete company research"
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
          placeholder="Search by company, industry, or location…"
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
            Add Company
          </Button>
        </div>
      </Card>

      {research.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies researched yet"
          description="Add notes on companies you're interested in: culture, size, recruiters, and more."
          action={
            <Button className="gap-1" onClick={() => setModalState("create")}>
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No companies match your search" />
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
        title={modalState === "create" ? "Add Company Research" : "Edit Company Research"}
      >
        {modalState !== "closed" && (
          <ResearchForm
            research={modalState === "create" ? undefined : modalState}
            onSuccess={() => setModalState("closed")}
            onCancel={() => setModalState("closed")}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete company research?"
        description={deleteTarget ? `This will permanently delete research for ${deleteTarget.company}.` : undefined}
        loading={deleting}
      />
    </div>
  );
}
