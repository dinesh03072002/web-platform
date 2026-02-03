"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Mail,
  Calendar,
  TrendingUp,
  Clock,
  type LucideIcon,
  X,
} from "lucide-react";

import NewslettersTable from "@/components/tables/NewslettersTable";
import type { Newsletter } from "@/types/newsletter";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

type StatWidgetProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
};

function StatWidget({ title, value, icon: Icon, gradient }: StatWidgetProps) {
  const isText = typeof value === "string";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${gradient}`}
      />
      <div
        className={`inline-flex p-2 rounded-xl mb-3 ${gradient} bg-opacity-10`}
      >
        <Icon className="w-5 h-5 text-gray-700" />
      </div>

      <div className="relative">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p
          className={`font-bold text-gray-900 mt-1 ${
            isText ? "text-lg truncate" : "text-2xl"
          }`}
          title={String(value)}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function normalizeDate(d: string) {
  return String(d).slice(0, 10);
}

function getThisMonthCount(list: Newsletter[]) {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  return list.filter((n) => {
    const [yy, mm] = normalizeDate(n.createdAt).split("-").map(Number);
    return yy === y && mm === m;
  }).length;
}

function getThisYearCount(list: Newsletter[]) {
  const y = new Date().getFullYear();
  return list.filter(
    (n) => Number(normalizeDate(n.createdAt).slice(0, 4)) === y
  ).length;
}

function getTodayCount(list: Newsletter[]) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  return list.filter((n) => normalizeDate(n.createdAt) === todayStr).length;
}

function Detail({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 break-words">
        {value}
      </p>
    </div>
  );
}

export default function NewslettersPage() {
  const router = useRouter();

  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  const [openView, setOpenView] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] =
    useState<Newsletter | null>(null);

  // ✅ stop background scroll when modal open
  useEffect(() => {
    if (openView) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openView]);

  useEffect(() => {
    async function loadSubscribers() {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await api.get("/api/admin/subscribers");
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setNewsletters(list);
      } catch (err: any) {
        console.error("Subscribers API error:", err);

        if (err?.response?.status === 401) {
          clearToken();
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadSubscribers();
  }, [router]);

  const monthCount = useMemo(() => getThisMonthCount(newsletters), [newsletters]);
  const yearCount = useMemo(() => getThisYearCount(newsletters), [newsletters]);
  const todayCount = useMemo(() => getTodayCount(newsletters), [newsletters]);

  const handleView = (row: Newsletter) => {
    setSelectedNewsletter(row);
    setOpenView(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Newsletter List
        </h2>
        <p className="text-gray-600 mt-2">
          Manage and track your newsletters efficiently
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatWidget
          title="Subscribers"
          value={newsletters.length}
          icon={Mail}
          gradient="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatWidget
          title="This Month"
          value={monthCount}
          icon={Calendar}
          gradient="bg-gradient-to-br from-purple-400 to-purple-600"
        />
        <StatWidget
          title="This Year"
          value={yearCount}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-pink-400 to-pink-600"
        />
        <StatWidget
          title="Today"
        
          value={todayCount}
          icon={Clock}
          gradient="bg-gradient-to-br from-cyan-400 to-cyan-600"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading subscribers...</p>
      ) : (
        <NewslettersTable data={newsletters} onView={handleView} />
      )}

      {/* ✅ Modal with blur */}
      {openView && selectedNewsletter && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* ✅ Blur overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            onClick={() => setOpenView(false)}
          />

          {/* ✅ Modal box */}
          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-xl border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                Subscriber Details
              </h3>
              <button
                onClick={() => setOpenView(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Detail
                  label="Subscriber ID"
                  value={String((selectedNewsletter as any).id ?? "-")}
                />
                <Detail
                  label="Created Date"
                  value={normalizeDate(selectedNewsletter.createdAt)}
                />
                <Detail
                  label="Email"
                  value={selectedNewsletter.email || "-"}
                  full
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setOpenView(false)}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow hover:opacity-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
