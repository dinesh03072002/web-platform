"use client";

import { useMemo, useState } from "react";
import type { Newsletter } from "@/types/newsletter";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { ArrowDown, ArrowUp, ArrowUpDown, Search, Eye } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type Props = {
  data: Newsletter[];
  onView: (row: Newsletter) => void;
};

function normalizeDate(d: string) {
  return String(d).slice(0, 10);
}

export default function NewslettersTable({ data, onView }: Props) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Newsletter>[]>(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <p className="text-sm font-semibold text-slate-900 truncate max-w-[520px]">
            {String(getValue())}
          </p>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ getValue }) => (
          <p className="text-sm text-slate-700 whitespace-nowrap">
            {normalizeDate(String(getValue()))}
          </p>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const subscriber = row.original;
          return (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onView(subscriber)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm hover:opacity-95 transition"
              >
                <Eye size={14} />
                View
              </button>
            </div>
          );
        },
      },
    ],
    [onView]
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full md:max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search email..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-3 h-10 rounded-xl border border-slate-200 bg-white shadow-sm
            focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>

        <p className="text-xs font-medium text-slate-600 whitespace-nowrap">
          Total:{" "}
          <span className="font-bold text-slate-900">
            {table.getRowModel().rows.length}
          </span>
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: "70%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>

            <TableHeader className="bg-slate-50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-b border-slate-200">
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <TableHead
                        key={header.id}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={[
                          "px-4 py-3 text-xs font-bold text-slate-700 whitespace-nowrap",
                          canSort ? "cursor-pointer select-none" : "",
                          header.id === "actions" ? "text-right" : "",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "flex items-center gap-1",
                            header.id === "actions"
                              ? "justify-end"
                              : "justify-start",
                          ].join(" ")}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {canSort && header.id !== "actions" && (
                            <span className="opacity-60">
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp
                                  size={14}
                                  className="text-blue-600"
                                />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown
                                  size={14}
                                  className="text-purple-600"
                                />
                              ) : (
                                <ArrowUpDown
                                  size={14}
                                  className="text-slate-400"
                                />
                              )}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-slate-100 hover:bg-blue-50/30 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={[
                        "px-4 py-3 text-sm",
                        cell.column.id === "actions" ? "text-right" : "",
                      ].join(" ")}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {table.getRowModel().rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-16 text-center"
                  >
                    <p className="text-slate-500 font-medium">
                      No subscribers found
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
