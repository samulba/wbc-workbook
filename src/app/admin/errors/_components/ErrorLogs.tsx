"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Code2,
  ExternalLink,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ErrorLog {
  id:          string;
  error_type:  string;
  message:     string;
  stack_trace: string | null;
  url:         string | null;
  user_id:     string | null;
  user_email:  string | null;
  created_at:  string;
}

interface LogsData {
  items: ErrorLog[];
  total: number;
  stats: {
    total: number;
    types: Record<string, number>;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `vor ${diff}s`;
  if (diff < 3600) return `vor ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)}h`;
  return new Date(iso).toLocaleDateString("de-DE");
}

function badgeClass(type: string) {
  switch (type) {
    case "react_boundary": return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
    case "client":         return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    case "api":            return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
    default:               return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  }
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({ log, onClose, onDelete }: {
  log:      ErrorLog;
  onClose:  () => void;
  onDelete: (id: string) => void;
}) {
  const [deleting,   setDeleting]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    const res = await fetch(`/api/admin/error-logs/${log.id}`, { method: "DELETE" });
    if (res.ok) onDelete(log.id);
    setDeleting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Fehler-Detail</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Typ</p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium ${badgeClass(log.error_type)}`}>
                {log.error_type}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Zeitpunkt</p>
              <p className="text-gray-700 dark:text-gray-300 font-mono text-xs">
                {new Date(log.created_at).toLocaleString("de-DE")}
              </p>
            </div>
            {log.user_email && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Benutzer</p>
                <p className="text-gray-700 dark:text-gray-300 text-xs">{log.user_email}</p>
              </div>
            )}
            {log.url && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">URL</p>
                <a
                  href={log.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1 break-all"
                >
                  {log.url} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <p className="text-xs text-gray-400 mb-1 font-medium">Fehlermeldung</p>
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300 font-mono break-all">{log.message}</p>
            </div>
          </div>

          {/* Stack Trace */}
          {log.stack_trace && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Code2 className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs text-gray-400 font-medium">Stack Trace</p>
              </div>
              <pre className="bg-gray-900 dark:bg-black text-gray-100 text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {log.stack_trace}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              confirmDel
                ? "bg-red-600 text-white hover:bg-red-700"
                : "text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {confirmDel ? "Wirklich löschen?" : "Löschen"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const PERIODS = [
  { value: "today", label: "Heute"    },
  { value: "7d",    label: "7 Tage"   },
  { value: "30d",   label: "30 Tage"  },
  { value: "all",   label: "Alle"     },
];

const PAGE_SIZE = 25;

export function ErrorLogs() {
  const [data,       setData]       = useState<LogsData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [period,     setPeriod]     = useState("7d");
  const [typeFilter, setTypeFilter] = useState("");
  const [page,       setPage]       = useState(1);
  const [selected,   setSelected]   = useState<ErrorLog | null>(null);
  const [cleaning,   setCleaning]   = useState(false);
  const [cleanMsg,   setCleanMsg]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ period, page: String(page), limit: String(PAGE_SIZE) });
    if (typeFilter) params.set("type", typeFilter);
    const res = await fetch(`/api/admin/error-logs?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [period, typeFilter, page]);

  useEffect(() => { load(); }, [load]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [period, typeFilter]);

  async function handleCleanup() {
    setCleaning(true);
    setCleanMsg(null);
    const res  = await fetch("/api/admin/error-logs/cleanup", { method: "DELETE" });
    const json = await res.json();
    setCleanMsg(`${json.deleted ?? 0} alte Einträge gelöscht`);
    setCleaning(false);
    load();
  }

  function handleDelete(id: string) {
    setSelected(null);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((i) => i.id !== id),
        total: prev.total - 1,
        stats: { ...prev.stats, total: prev.stats.total - 1 },
      };
    });
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{data.stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Gesamt (Zeitraum)</p>
          </div>
          {Object.entries(data.stats.types).slice(0, 3).map(([type, count]) => (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono truncate">{type}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
          {data && Object.keys(data.stats.types).length > 0 && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="">Alle Typen</option>
              {Object.keys(data.stats.types).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cleanMsg && (
            <span className="text-xs text-green-600 dark:text-green-400">{cleanMsg}</span>
          )}
          <button
            onClick={handleCleanup}
            disabled={cleaning}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Älter als 30 Tage löschen
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Laden
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Keine Fehler-Logs gefunden</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Typ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Meldung</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:table-cell">Benutzer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Zeit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {data.items.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelected(log)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium ${badgeClass(log.error_type)}`}>
                        {log.error_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-gray-800 dark:text-gray-200 truncate text-xs font-mono">{log.message}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                        {log.user_email ?? <span className="italic opacity-50">anonym</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {relativeTime(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {data.total} Einträge · Seite {page} / {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          log={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
