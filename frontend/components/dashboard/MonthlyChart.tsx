"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

type HasCreatedAt = { createdAt: string };

type ChartRow = {
  day: string;
  contacts: number;
  subscribers: number;
};

function onlyDate(d: string) {
  return String(d).slice(0, 10);
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
  });
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

export default function MonthlyChart({
  contacts,
  subscribers,
}: {
  contacts: HasCreatedAt[];
  subscribers: HasCreatedAt[];
}) {
  const [showContacts, setShowContacts] = useState(true);
  const [showSubscribers, setShowSubscribers] = useState(true);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const data: ChartRow[] = useMemo(() => {
    const today = new Date();

    const last5: Date[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last5.push(d);
    }

    const contactMap: Record<string, number> = {};
    const subsMap: Record<string, number> = {};

    contacts.forEach((c) => {
      const k = onlyDate(c.createdAt);
      contactMap[k] = (contactMap[k] || 0) + 1;
    });

    subscribers.forEach((s) => {
      const k = onlyDate(s.createdAt);
      subsMap[k] = (subsMap[k] || 0) + 1;
    });

    return last5.map((d) => {
      const key = onlyDate(d.toISOString());
      return {
        day: formatDayLabel(d),
        contacts: contactMap[key] || 0,
        subscribers: subsMap[key] || 0,
      };
    });
  }, [contacts, subscribers]);

  const totals = useMemo(() => {
    return {
      contacts: data.reduce((s, x) => s + x.contacts, 0),
      subscribers: data.reduce((s, x) => s + x.subscribers, 0),
    };
  }, [data]);

  const maxY = useMemo(() => {
    const max = Math.max(
      ...data.map((x) => Math.max(x.contacts || 0, x.subscribers || 0)),
      0
    );
    return max === 0 ? 10 : max;
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const c = payload.find((p: any) => p.dataKey === "contacts")?.value ?? 0;
    const s =
      payload.find((p: any) => p.dataKey === "subscribers")?.value ?? 0;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl px-3 py-2">
        <p className="text-[11px] font-semibold text-slate-500">{label}</p>

        <div className="mt-1 space-y-1">
          {showContacts && (
            <div className="flex items-center justify-between gap-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <p className="text-[11px] font-semibold text-slate-700">
                  Contacts
                </p>
              </div>
              <p className="text-[11px] font-bold text-slate-900">
                {formatCompact(c)}
              </p>
            </div>
          )}

          {showSubscribers && (
            <div className="flex items-center justify-between gap-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <p className="text-[11px] font-semibold text-slate-700">
                  Subscribers
                </p>
              </div>
              <p className="text-[11px] font-bold text-slate-900">
                {formatCompact(s)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 overflow-hidden relative">
      {/* compact header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base md:text-lg font-extrabold text-slate-900">
            Growth Analytics
          </h3>
          <p className="text-xs text-slate-500">Last 5 days</p>
        </div>

        {/* compact totals */}
        <div className="hidden md:flex items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
            <p className="text-[10px] font-semibold text-slate-500">Contacts</p>
            <p className="text-xs font-bold text-slate-900">
              {formatCompact(totals.contacts)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
            <p className="text-[10px] font-semibold text-slate-500">
              Subscribers
            </p>
            <p className="text-xs font-bold text-slate-900">
              {formatCompact(totals.subscribers)}
            </p>
          </div>
        </div>
      </div>

      {/* compact toggles */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setShowContacts((p) => !p)}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
            showContacts
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Contacts
        </button>

        <button
          onClick={() => setShowSubscribers((p) => !p)}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
            showSubscribers
              ? "bg-sky-500 text-white border-sky-500"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Subscribers
        </button>
      </div>

      {/* ✅ FIX: small height so no scrolling */}
      <div className="relative w-full h-[180px] md:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            onMouseMove={(state: any) => {
              if (state?.activeLabel) setActiveLabel(state.activeLabel);
            }}
            onMouseLeave={() => setActiveLabel(null)}
          >
            <defs>
              <linearGradient id="contactsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="subsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#e8eef7" strokeDasharray="4 10" vertical={false} />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 600 }}
              dy={8}
            />

            <YAxis
              domain={[0, Math.ceil(maxY * 1.3)]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 600 }}
              allowDecimals={false}
            />

            {activeLabel ? (
              <ReferenceLine x={activeLabel} stroke="#cbd5e1" strokeDasharray="4 8" />
            ) : null}

            <Tooltip content={<CustomTooltip />} cursor={false} />

            {showSubscribers && (
              <Area
                type="natural"
                dataKey="subscribers"
                stroke="#38bdf8"
                strokeWidth={3}
                fill="url(#subsFill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}

            {showContacts && (
              <Area
                type="natural"
                dataKey="contacts"
                stroke="#4f46e5"
                strokeWidth={4}
                fill="url(#contactsFill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
