"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, UserPlus, FolderOpen, CheckCircle2,
  TrendingUp, CalendarDays, Loader2,
  ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Period = "today" | "7d" | "30d" | "all";

interface KPI {
  total_users:        number;
  new_users:          number;
  new_users_change:   number | null;
  total_projects:     number;
  new_projects:       number;
  completed_projects: number;
  completion_rate:    number;
  coaching_bookings:  number;
  coaching_change:    number | null;
}

interface AnalyticsData {
  kpi:              KPI;
  registrations:    { date: string; count: number }[];
  projects_created: { date: string; count: number }[];
  room_effects:     { name: string; value: number }[];
  room_types:       { name: string; value: number }[];
  top_users:        { id: string; full_name: string | null; email: string; project_count: number }[];
  top_materials:    { name: string; count: number }[];
  top_colors:       { hex: string; count: number }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Heute"   },
  { id: "7d",    label: "7 Tage"  },
  { id: "30d",   label: "30 Tage" },
  { id: "all",   label: "Gesamt"  },
];

// CI colour palette
const CI = {
  forest:     "#2D5A4F",
  mint:       "#8BC5B4",
  terra:      "#C96A50",
  sand:       "#C4956A",
  sage:       "#8B9E7A",
  forest2:    "#6B8E7C",
  amber:      "#E8A838",
  blue:       "#4A90C4",
};

const CHART_COLORS = [CI.forest, CI.mint, CI.terra, CI.sand, CI.sage, CI.forest2, CI.amber, CI.blue];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAxisDate(d: string, period: Period) {
  if (period === "today") return d; // "08:00"
  if (period === "all") {
    // "2026-04" → "Apr '26"
    const [y, m] = d.split("-");
    const months = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
    return `${months[parseInt(m) - 1]} '${y.slice(2)}`;
  }
  // "2026-04-10" → "10. Apr"
  const dt = new Date(d + "T00:00:00Z");
  return dt.toLocaleDateString("de-DE", { day: "numeric", month: "short", timeZone: "UTC" });
}

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ChangeChip({ value }: { value: number | null }) {
  if (value === null) return null;
  if (value === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400">
      <Minus className="w-3 h-3" strokeWidth={2} /> —
    </span>
  );
  const positive = value > 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-[11px] font-medium",
      positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
    )}>
      {positive
        ? <ArrowUpRight   className="w-3 h-3" strokeWidth={2.5} />
        : <ArrowDownRight className="w-3 h-3" strokeWidth={2.5} />
      }
      {Math.abs(value)}%
    </span>
  );
}

function KpiCard({
  icon: Icon, label, value, sub, subChange, iconBg, iconColor, valueClass,
}: {
  icon:        React.ElementType;
  label:       string;
  value:       string | number;
  sub?:        string;
  subChange?:  number | null;
  iconBg:      string;
  iconColor:   string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", iconBg)}>
        <Icon className={cn("w-4 h-4", iconColor)} strokeWidth={1.5} />
      </div>
      <p className={cn("text-2xl font-bold tabular-nums leading-none text-gray-900 dark:text-gray-100", valueClass)}>
        {value}
      </p>
      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1.5">{label}</p>
      {(sub || subChange !== undefined) && (
        <div className="flex items-center gap-1.5 mt-1">
          {sub && <span className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</span>}
          {subChange !== undefined && <ChangeChip value={subChange ?? null} />}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children, empty }: {
  title:    string;
  children: React.ReactNode;
  empty?:   boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</p>
      {empty
        ? <div className="flex items-center justify-center h-40 text-sm text-gray-400 dark:text-gray-500 italic">Keine Daten</div>
        : children
      }
    </div>
  );
}

interface TooltipPayloadItem { color?: string; name?: string; value?: number | string; }
interface TooltipProps { active?: boolean; payload?: TooltipPayloadItem[]; label?: string; }

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color ?? CI.forest }}>
          {p.name ? `${p.name}: ` : ""}{p.value}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{payload[0].name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{payload[0].value} Räume</p>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const [period,  setPeriod]  = useState<Period>("7d");
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/admin/analytics?period=${period}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError("Fehler beim Laden der Analytics-Daten."))
      .finally(() => setLoading(false));
  }, [period]);

  const kpi = data?.kpi;

  return (
    <div className="max-w-7xl space-y-6">

      {/* Header + period selector */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Übersicht aller Aktivitäten</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all",
                period === p.id
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading overlay */}
      {loading && !data && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 text-forest/40 animate-spin" strokeWidth={1.5} />
        </div>
      )}

      {kpi && (
        <>
          {/* KPI Cards */}
          <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-3 transition-opacity", loading && "opacity-60")}>
            <KpiCard
              icon={Users}       label="User gesamt"
              value={kpi.total_users}
              iconBg="bg-forest/10 dark:bg-forest/20" iconColor="text-forest dark:text-mint"
            />
            <KpiCard
              icon={UserPlus}    label="Neue User"
              value={kpi.new_users}
              sub="im Zeitraum"   subChange={kpi.new_users_change}
              iconBg="bg-blue-50 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400"
            />
            <KpiCard
              icon={FolderOpen}  label="Projekte gesamt"
              value={kpi.total_projects}
              sub={`+${kpi.new_projects} neu`}
              iconBg="bg-amber-50 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400"
            />
            <KpiCard
              icon={CheckCircle2} label="Abgeschlossen"
              value={kpi.completed_projects}
              iconBg="bg-emerald-50 dark:bg-emerald-900/30" iconColor="text-emerald-600 dark:text-emerald-400"
            />
            <KpiCard
              icon={TrendingUp}  label="Completion Rate"
              value={`${kpi.completion_rate}%`}
              sub="aller Projekte"
              iconBg="bg-purple-50 dark:bg-purple-900/30" iconColor="text-purple-600 dark:text-purple-400"
            />
            <KpiCard
              icon={CalendarDays} label="Coaching-Buchungen"
              value={kpi.coaching_bookings}
              sub="im Zeitraum"   subChange={kpi.coaching_change}
              iconBg="bg-rose-50 dark:bg-rose-900/30" iconColor="text-rose-600 dark:text-rose-400"
            />
          </div>

          {/* Charts row 1: Line + Bar */}
          <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4 transition-opacity", loading && "opacity-60")}>

            <ChartCard title="Registrierungen" empty={!data?.registrations.some(r => r.count > 0)}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.registrations} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={d => fmtAxisDate(d, period)}
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    tickLine={false} axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="count" name="Registrierungen"
                    stroke={CI.forest} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: CI.forest }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Neue Projekte" empty={!data?.projects_created.some(r => r.count > 0)}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.projects_created} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={d => fmtAxisDate(d, period)}
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    tickLine={false} axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Projekte" fill={CI.mint} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>

          {/* Charts row 2: Pie × 2 */}
          <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4 transition-opacity", loading && "opacity-60")}>

            <ChartCard title="Beliebteste Raumwirkungen" empty={!data?.room_effects.length}>
              <div className="flex gap-4 items-center">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={data?.room_effects} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={2}>
                      {data?.room_effects.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {data?.room_effects.map((e, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">{e.name}</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Beliebteste Raumtypen" empty={!data?.room_types.length}>
              <div className="flex gap-4 items-center">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={data?.room_types} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={2}>
                      {data?.room_types.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {data?.room_types.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">{r.name}</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

          </div>

          {/* Top lists */}
          <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity", loading && "opacity-60")}>

            {/* Top users */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top 5 aktivste User</p>
              {data?.top_users.length === 0
                ? <p className="text-sm text-gray-400 dark:text-gray-500 italic">Keine Daten</p>
                : <div className="space-y-2.5">
                    {data?.top_users.map((u, i) => (
                      <div key={u.id} className="flex items-center gap-2.5">
                        <span className="w-5 text-xs font-bold text-gray-400 dark:text-gray-500 shrink-0">{i + 1}.</span>
                        <div className="w-7 h-7 rounded-full bg-forest/10 dark:bg-forest/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-forest dark:text-mint">
                            {getInitials(u.full_name, u.email)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                            {u.full_name ?? u.email}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <FolderOpen className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{u.project_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            {/* Top materials */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Meistgenutzte Materialien</p>
              {!data?.top_materials.length
                ? <p className="text-sm text-gray-400 dark:text-gray-500 italic">Keine Daten</p>
                : <div className="space-y-2">
                    {data.top_materials.map((m, i) => {
                      const maxCount = data.top_materials[0]?.count ?? 1;
                      return (
                        <div key={i}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-xs text-gray-700 dark:text-gray-300 capitalize truncate max-w-[75%]">{m.name}</span>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums">{m.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(m.count / maxCount) * 100}%`,
                                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>

            {/* Top colors */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Häufigste Farben</p>
              {!data?.top_colors.length
                ? <p className="text-sm text-gray-400 dark:text-gray-500 italic">Keine Daten</p>
                : <div className="space-y-2">
                    {data.top_colors.map((c, i) => {
                      const maxCount = data.top_colors[0]?.count ?? 1;
                      return (
                        <div key={i} className="flex items-center gap-2.5">
                          <span
                            className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 shrink-0 shadow-sm"
                            style={{ backgroundColor: c.hex }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-0.5">
                              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">{c.hex}</span>
                              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 tabular-nums">{c.count}×</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${(c.count / maxCount) * 100}%`, backgroundColor: c.hex }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>

          </div>
        </>
      )}
    </div>
  );
}
