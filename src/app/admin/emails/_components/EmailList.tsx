"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Search, X, Download, Users, UserCheck, UserX,
  ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EmailRow {
  id:              string;
  email:           string;
  full_name:       string | null;
  is_active:       boolean;
  created_at:      string;
  last_sign_in_at: string | null;
  project_count:   number;
  recently_active: boolean;
}

interface Stats {
  total:    number;
  active:   number;
  inactive: number;
}

type SortKey = "email" | "full_name" | "created_at" | "last_sign_in_at" | "project_count";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "2-digit",
  });
}

function fmtRelative(d: string | null) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 30)  return `vor ${days} T.`;
  if (days < 365) return `vor ${Math.floor(days / 30)} Mon.`;
  return `vor ${Math.floor(days / 365)} J.`;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", color + "/15 dark:" + color + "/20")}>
        <Icon className={cn("w-4 h-4", color)} strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

// ── Sort Button ───────────────────────────────────────────────────────────────

function SortBtn({
  col, current, dir, onClick,
}: { col: SortKey; current: SortKey; dir: "asc" | "desc"; onClick: () => void }) {
  const active = current === col;
  return (
    <button onClick={onClick} className="inline-flex items-center gap-0.5 hover:text-gray-900 dark:hover:text-gray-100">
      {active
        ? dir === "asc"
          ? <ChevronUp   className="w-3 h-3 text-green-600" />
          : <ChevronDown className="w-3 h-3 text-green-600" />
        : <ChevronsUpDown className="w-3 h-3 text-gray-400" />
      }
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function EmailList() {
  const [rows,         setRows]         = useState<EmailRow[]>([]);
  const [stats,        setStats]        = useState<Stats>({ total: 0, active: 0, inactive: 0 });
  const [loading,      setLoading]      = useState(true);

  const [searchInput,  setSearchInput]  = useState("");
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("all");
  const [sortBy,       setSortBy]       = useState<SortKey>("created_at");
  const [sortDir,      setSortDir]      = useState<"asc" | "desc">("desc");

  const [page,         setPage]         = useState(1);
  const [exporting,    setExporting]    = useState(false);

  const LIMIT = 25;

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        search, filter, sortBy, sortDir, page: String(page), limit: String(LIMIT),
      });
      const res  = await fetch(`/api/admin/emails?${q}`);
      const data = await res.json();
      setRows(data.rows ?? []);
      // total is derived from rows.length below
      setStats(data.stats ?? { total: 0, active: 0, inactive: 0 });
    } finally {
      setLoading(false);
    }
  }, [search, filter, sortBy, sortDir, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filter, sortBy, sortDir]);

  function handleSort(col: SortKey) {
    if (sortBy === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  }

  function clearFilters() {
    setSearchInput(""); setSearch(""); setFilter("all");
    setSortBy("created_at"); setSortDir("desc");
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const q = new URLSearchParams({ search, filter, sortBy, sortDir, format: "csv" });
      const res  = await fetch(`/api/admin/emails?${q}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `email-liste-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const hasFilters = search || filter !== "all";

  // Client-side pagination from the returned (already filtered+sorted) rows
  const pagedRows   = rows.slice((page - 1) * LIMIT, page * LIMIT);
  const totalPages  = Math.ceil(rows.length / LIMIT);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email-Liste</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Alle registrierten Nutzer und deren Aktivität
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-60 shrink-0"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Export…" : "CSV Export"}
        </button>
      </div>

      {/* DSGVO Notice */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-xs text-amber-700 dark:text-amber-300">
          <strong>DSGVO-Hinweis:</strong> Email-Adressen und personenbezogene Daten nur für legitime Geschäftszwecke verwenden. Export und Verarbeitung unterliegen den geltenden Datenschutzbestimmungen.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Users}     label="Nutzer gesamt"              value={stats.total}    color="text-gray-600" />
        <StatCard icon={UserCheck} label="Aktiv (letzte 30 Tage)"     value={stats.active}   color="text-green-600" />
        <StatCard icon={UserX}     label="Inaktiv (>30 Tage)"         value={stats.inactive} color="text-gray-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Email oder Name suchen…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                filter === f
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {f === "all" ? "Alle" : f === "active" ? "Aktiv" : "Inaktiv"}
            </button>
          ))}
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <X className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                {(
                  [
                    { key: "email",           label: "Email"            },
                    { key: "full_name",       label: "Name"             },
                    { key: "created_at",      label: "Registriert"      },
                    { key: "last_sign_in_at", label: "Letzte Aktivität" },
                    { key: "project_count",   label: "Projekte"         },
                  ] as { key: SortKey; label: string }[]
                ).map(({ key, label }) => (
                  <th
                    key={key}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <SortBtn col={key} current={sortBy} dir={sortDir} onClick={() => handleSort(key)} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-400 dark:text-gray-500">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Keine Einträge gefunden
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-forest/10 dark:bg-forest/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-forest dark:text-mint">
                            {row.email.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                          {row.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {row.full_name ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-500 tabular-nums">
                      {fmtDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs",
                        row.recently_active
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-400 dark:text-gray-500"
                      )}>
                        {fmtRelative(row.last_sign_in_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        row.project_count > 0
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                      )}>
                        {row.project_count}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!loading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{rows.length} Einträge{hasFilters ? " (gefiltert)" : ""}</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  ‹
                </button>
                <span>Seite {page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
