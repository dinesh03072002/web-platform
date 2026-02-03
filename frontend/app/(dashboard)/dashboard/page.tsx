"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Users,
  Mail,
  Calendar,
  TrendingUp,
  Clock,
  type LucideIcon,
} from "lucide-react";

import MonthlyChart from "@/components/dashboard/MonthlyChart";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import type { Contact } from "@/types/contact";
import type { Newsletter } from "@/types/newsletter";

type StatWidgetProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
};

function StatWidget({ title, value, icon: Icon, gradient }: StatWidgetProps) {
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
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>

      <div
        className={`absolute -right-6 -bottom-6 w-16 h-16 rounded-full ${gradient} opacity-5`}
      />
    </div>
  );
}

type HasCreatedAt = { createdAt: string };

function normalizeDate(d: string) {
  return String(d).slice(0, 10);
}

function getThisMonthCount<T extends HasCreatedAt>(list: T[]) {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  return list.filter((item) => {
    const [yy, mm] = normalizeDate(item.createdAt).split("-").map(Number);
    return yy === y && mm === m;
  }).length;
}

function getTodayCount<T extends HasCreatedAt>(list: T[]) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  return list.filter((item) => normalizeDate(item.createdAt) === todayStr).length;
}

export default function DashboardPage() {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [subscribers, setSubscribers] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [cRes, sRes] = await Promise.all([
          api.get("/api/admin/contacts"),
          api.get("/api/admin/subscribers"),
        ]);

        setContacts(cRes.data);
        setSubscribers(sRes.data);
      } catch (err: any) {
        console.error("Dashboard API error:", err);

        if (err?.response?.status === 401) {
          clearToken();
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const contactsMonth = useMemo(() => getThisMonthCount(contacts), [contacts]);
  const subsMonth = useMemo(() => getThisMonthCount(subscribers), [subscribers]);

  const todayTotal = useMemo(() => {
    return getTodayCount(contacts) + getTodayCount(subscribers);
  }, [contacts, subscribers]);

  // ✅ recent 5
  const recentContacts = useMemo(() => {
    return [...contacts]
      .sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5);
  }, [contacts]);

  const recentSubscribers = useMemo(() => {
    return [...subscribers]
      .sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5);
  }, [subscribers]);

  // ✅ return MUST be inside function
  return (
    <div className="h-screen bg-slate-50">
      <div className="">
        <div className=" space-y-8 p-6">
          {/* Header */}
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h2>
            <p className="text-gray-600 mt-2">
              Welcome back! Here’s your overview
            </p>
          </div>

          {/* Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatWidget
              title="Contacts"
              value={contacts.length}
              icon={Users}
              gradient="bg-gradient-to-br from-blue-400 to-blue-600"
            />
            <StatWidget
              title="Subscribers"
              value={subscribers.length}
              icon={Mail}
              gradient="bg-gradient-to-br from-purple-400 to-purple-600"
            />
            <StatWidget
              title="Contacts (Month)"
              value={contactsMonth}
              icon={Calendar}
              gradient="bg-gradient-to-br from-pink-400 to-pink-600"
            />
            <StatWidget
              title="Subscribers (Month)"
              value={subsMonth}
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-cyan-400 to-cyan-600"
            />
            <StatWidget
              title="Today"
              value={todayTotal}
              icon={Clock}
              gradient="bg-gradient-to-br from-amber-400 to-orange-600"
            />
          </div>

          {/* Chart */}
          <div>
            {loading ? (
              <p className="text-gray-500">Loading chart...</p>
            ) : (
              <MonthlyChart contacts={contacts} subscribers={subscribers} />
            )}
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Contacts */}
            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-extrabold text-slate-900">
                Recent Contacts
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Latest 5 contact requests
              </p>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="py-3 font-semibold">Name</th>
                      <th className="py-3 font-semibold">Email</th>
                      <th className="py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentContacts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-5 text-slate-500">
                          No contacts yet.
                        </td>
                      </tr>
                    ) : (
                      recentContacts.map((c: any) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-100 last:border-none"
                        >
                          <td className="py-3  text-slate-900">
                            {c.name || "-"}
                          </td>
                          <td className="py-3 text-slate-600">
                            {c.email || "-"}
                          </td>
                          <td className="py-3 text-slate-500">
                            {String(c.createdAt).slice(0, 10)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Subscribers */}
            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-extrabold text-slate-900">
                Recent Subscribers
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Latest 5 newsletter subscribers
              </p>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="py-3 font-semibold">Email</th>
                      <th className="py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-5 text-slate-500">
                          No subscribers yet.
                        </td>
                      </tr>
                    ) : (
                      recentSubscribers.map((s: any) => (
                        <tr
                          key={s.id}
                          className="border-b border-slate-100 last:border-none"
                        >
                          <td className="py-3  text-slate-900">
                            {s.email || "-"}
                          </td>
                          <td className="py-3 text-slate-500">
                            {String(s.createdAt).slice(0, 10)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ✅ bottom spacing */}
        </div>
      </div>
    </div>
  );
}