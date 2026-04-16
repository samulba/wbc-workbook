"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, Search, X, Star, Circle, Clock, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedbackDetailModal, type FeedbackRow } from "./FeedbackDetailModal";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPES   = ["Bug", "Vorschlag", "Lob", "Frage"];
const STATUSES = [
  { value: "neu",      label: "Neu",      icon: Circle,       color: "text-blue-500"  },
  { value: "gelesen",  label: "Gelesen",  icon: Clock,        color: "text-amber-500" },
  { value: "erledigt", label: "Erledigt", icon: CheckCircle2, color: "text-green-500" },
];

const TYPE_COLORS: Record<string, string> = {
  Bug:       "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  Vorschlag: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  Lob:       "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  Frage:     "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
};

const STATUS_STYLES: Record<string, string> = {
  neu:      "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  gelesen:  "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  erledigt: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn(
      "rounded-xl border p-4 shadow-sm",
      highlight
        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    )}>
      <p className={cn("text-2xl font-bold tabular-nums", highlight ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100")}>
        {value}
      </p>
      <p className={cn("text-xs mt-0.5", highlight ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400")}>
        {label}
      </p>
    </div>
  );
}

// ── Star Display ──────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-gray-300 dark:text-gray-600">—</span>;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("w-3 h-3", i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-600")} />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function FeedbackAdmin() {
  const [items,        setItems]        = useState<FeedbackRow[]>([]);
  const [stats,        setStats]        = useState({ total: 0, neu: 0, gelesen: 0, erledigt: 0 });
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);

  const [searchInput,  setSearchInput]  = useState("");
  const [search,       setSearch]       = useState("");
  const [filterType,   setFilterType]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page,         setPage]         = useState(1);

  const [selected,     setSelected]     = useState<FeedbackRow | null>(null);

  const LIMIT = 25;

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        search, type: filterType, status: filterStatus, page: String(page), limit: String(LIMIT),
      });
      const res  = await fetch(`/api/admin/feedback?${q}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setStats(data.stats ?? { total: 0, neu: 0, gelesen: 0, erledigt: 0 });
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterStatus, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filterType, filterStatus]);

  function clearFilters() {
    setSearchInput(""); setSearch(""); setFilterType(""); setFilterStatus("");
  }

  const hasFilters = search || filterType || filterStatus;

  function handleUpdated(updated: FeedbackRow) {
    setItems((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setSelected(updated);
    // Refresh stats
    load();
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((f) => f.id !== id));
    setSelected(null);
    load();
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feedback</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Nutzerfeedback verwalten und beantworten</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Gesamt"   value={stats.total}    />
        <StatCard label="Neu"      value={stats.neu}      highlight={stats.neu > 0} />
        <StatCard label="Gelesen"  value={stats.gelesen}  />
        <StatCard label="Erledigt" value={stats.erledigt} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nachricht suchen…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30"
        >
          <option value="">Alle Typen</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30"
        >
          <option value="">Alle Status</option>
          {STATUSES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <X className="w-3.5 h-3.5" /> Filter
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="h-5 w-16 bg-gray-100 dark:bg-gray-700 rounded" />
                  <div className="h-5 w-12 bg-gray-100 dark:bg-gray-700 rounded" />
                  <div className="h-5 flex-1 bg-gray-100 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-3" />
            <p className="text-gray-400 dark:text-gray-500 font-medium">Kein Feedback gefunden</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-2 text-sm text-green-700 hover:underline">
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="w-full text-left px-4 py-4 hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Type badge */}
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 mt-0.5", TYPE_COLORS[item.type] ?? "bg-gray-100 text-gray-600")}>
                    {item.type}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {item.user_name ?? item.user_email ?? "Anonym"}
                      </span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{fmtDate(item.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug">
                      {item.message}
                    </p>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", STATUS_STYLES[item.status] ?? "")}>
                      {STATUSES.find((s) => s.value === item.status)?.label ?? item.status}
                    </span>
                    <Stars rating={item.rating} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer pagination */}
        {!loading && total > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{total} Einträge</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">‹</button>
                <span>{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">›</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <FeedbackDetailModal
          feedback={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdated}
          onDelete={() => handleDeleted(selected.id)}
        />
      )}
    </div>
  );
}
