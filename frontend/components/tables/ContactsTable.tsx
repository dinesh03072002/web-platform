"use client";

import { useEffect, useMemo, useState } from "react";
import type { Contact } from "@/types/contact";

import {
  ArrowUpDown,
  Search,
  Eye,
  Mail,
  CalendarDays,
  MessageSquareText,
} from "lucide-react";

type Props = {
  data: Contact[];
  onView: (row: Contact) => void;
};

/* -------------------------------- Helpers -------------------------------- */

function normalizeDate(d: string) {
  return String(d || "").slice(0, 10);
}

function formatDateTime(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return normalizeDate(d);
  return dt.toLocaleString();
}

function getInitials(name: string) {
  const parts = (name || "U").trim().split(" ");
  const a = parts[0]?.[0] || "U";
  const b = parts.length > 1 ? parts[1]?.[0] : "";
  return (a + b).toUpperCase();
}

function getSource(contact: Contact) {
  return (contact as any)?.source_page || (contact as any)?.source || "UNKNOWN";
}

function SourceBadge({ source }: { source?: string }) {
  const s = String(source || "UNKNOWN").toUpperCase();

  const isA = s.includes("A");
  const isB = s.includes("B");
  const isC = s.includes("C");

  const cls = isA
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : isB
    ? "bg-blue-50 text-blue-700 border-blue-100"
    : isC
    ? "bg-purple-50 text-purple-700 border-purple-100"
    : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}
      title={s}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-60"></span>
      {s}
    </span>
  );
}

function AvatarSeed({ name }: { name: string }) {
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-200 via-purple-200 to-cyan-200 border border-slate-200 flex items-center justify-center shadow-sm">
      <span className="text-sm font-bold text-slate-900">{initials}</span>
    </div>
  );
}

/* -------------------------------- Component -------------------------------- */

type SourceFilter = "ALL" | "A" | "B" | "C";
type SortMode = "LATEST" | "OLDEST" | "NAME_AZ" | "NAME_ZA";

export default function ContactsTable({ data, onView }: Props) {
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("LATEST");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    setPage(1);
  }, [query, sourceFilter, sortMode]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = data || [];

    if (sourceFilter !== "ALL") {
      list = list.filter((c) =>
        String(getSource(c)).toUpperCase().includes(sourceFilter)
      );
    }

    if (q) {
      list = list.filter((c) => {
        const src = String(getSource(c)).toLowerCase();
        return (
          String(c.name || "").toLowerCase().includes(q) ||
          String(c.email || "").toLowerCase().includes(q) ||
          String((c as any).phone || "").toLowerCase().includes(q) ||
          String(c.message || "").toLowerCase().includes(q) ||
          src.includes(q)
        );
      });
    }

    list = [...list].sort((a, b) => {
      if (sortMode === "LATEST" || sortMode === "OLDEST") {
        const at = new Date(a.createdAt).getTime();
        const bt = new Date(b.createdAt).getTime();
        return sortMode === "LATEST" ? bt - at : at - bt;
      }

      const an = String(a.name || "").toLowerCase();
      const bn = String(b.name || "").toLowerCase();

      return sortMode === "NAME_AZ"
        ? an.localeCompare(bn)
        : bn.localeCompare(an);
    });

    return list;
  }, [data, query, sourceFilter, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const Pill = ({
    active,
    onClick,
    label,
  }: {
    active: boolean;
    onClick: () => void;
    label: string;
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={[
          "px-3 py-1.5 rounded-2xl text-sm font-semibold transition",
          active
            ? "bg-slate-900 text-white shadow-sm"
            : "bg-white text-slate-700 hover:bg-slate-50",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="px-4 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filtered.length}
              </span>{" "}
              contacts
            </p>
            <p className="text-[11px] text-slate-400">
              Page {page}/{totalPages}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative w-full md:w-[320px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, message, source..."
                className="w-full pl-10 pr-3 py-2 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm text-sm"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Pill active={sourceFilter === "ALL"} onClick={() => setSourceFilter("ALL")} label="All" />
              <Pill active={sourceFilter === "A"} onClick={() => setSourceFilter("A")} label="A" />
              <Pill active={sourceFilter === "B"} onClick={() => setSourceFilter("B")} label="B" />
              <Pill active={sourceFilter === "C"} onClick={() => setSourceFilter("C")} label="C" />
            </div>

            <div className="relative">
              <ArrowUpDown
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="w-full md:w-auto pl-9 pr-3 py-2 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
              >
                <option value="LATEST">Sort: Latest</option>
                <option value="OLDEST">Sort: Oldest</option>
                <option value="NAME_AZ">Sort: Name A-Z</option>
                <option value="NAME_ZA">Sort: Name Z-A</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto max-w-md">
                <div className="text-3xl">📭</div>
                <h3 className="mt-2 text-base font-semibold text-slate-900">
                  No contacts found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="p-3 text-xs font-semibold">User</th>
                      <th className="p-3 text-xs font-semibold">Email</th>
                      <th className="p-3 text-xs font-semibold">
                        Message (click)
                      </th>
                      <th className="p-3 text-xs font-semibold">Source</th>
                      <th className="p-3 text-xs font-semibold">Date / Time</th>
                      <th className="p-3 text-xs font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((c, idx) => (
                      <tr
                        key={(c as any).id ?? idx}
                        className="border-t hover:bg-slate-50/60 transition cursor-pointer"
                        onClick={() => onView(c)}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <AvatarSeed name={c.name} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {c.name || "Unknown"}
                              </p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <CalendarDays size={12} />{" "}
                                {normalizeDate(c.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <p className="text-sm text-slate-700 truncate max-w-[240px] flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" />
                            {c.email}
                          </p>
                        </td>

                        <td className="p-3 max-w-[520px]">
                          <p className="text-sm text-slate-800 line-clamp-2 flex items-start gap-2">
                            <MessageSquareText
                              size={16}
                              className="text-slate-400 mt-0.5"
                            />
                            {c.message || "-"}
                          </p>
                        </td>

                        <td className="p-3">
                          <SourceBadge source={getSource(c)} />
                        </td>

                        <td className="p-3">
                          <p className="text-sm text-slate-700">
                            {formatDateTime(c.createdAt)}
                          </p>
                        </td>

                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(c);
                              }}
                              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold
                              bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm hover:opacity-95 active:scale-[0.99] transition"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Prev
                </button>

                <p className="text-xs text-slate-500">
                  Page <span className="font-semibold">{page}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span>
                </p>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
