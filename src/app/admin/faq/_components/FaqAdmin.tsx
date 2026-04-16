"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, X, Pencil, Trash2, HelpCircle,
  ChevronUp, ChevronDown, CheckCircle2, XCircle,
} from "lucide-react";
import { FaqModal, type FaqRow, FAQ_CATEGORIES } from "./FaqModal";

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Category Badge ────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Allgemein:  "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  Module:     "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  Produkte:   "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  Coaching:   "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  Technisch:  "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
};

// ── FAQ Row Component ─────────────────────────────────────────────────────────

function FaqItem({
  faq,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
}: {
  faq:            FaqRow;
  isFirst:        boolean;
  isLast:         boolean;
  onEdit:         () => void;
  onDelete:       () => void;
  onToggleActive: () => void;
  onMoveUp:       () => void;
  onMoveDown:     () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-all ${!faq.is_active ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3 p-4">
        {/* Reorder arrows */}
        <div className="flex flex-col gap-0.5 pt-0.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${CATEGORY_COLORS[faq.category] ?? "bg-gray-100 text-gray-600"}`}>
              {faq.category}
            </span>
            {!faq.is_active && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                Inaktiv
              </span>
            )}
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-left w-full"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">{faq.question}</p>
          </button>
          {expanded && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs text-green-700 hover:underline"
          >
            {expanded ? "Einklappen" : "Antwort anzeigen"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleActive}
            title={faq.is_active ? "Deaktivieren" : "Aktivieren"}
            className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {faq.is_active
              ? <CheckCircle2 className="w-4 h-4 text-green-500" />
              : <XCircle      className="w-4 h-4 text-gray-300"  />}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            title="Bearbeiten"
          >
            <Pencil className="w-4 h-4 text-gray-400 hover:text-gray-700" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Löschen"
          >
            <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function FaqAdmin() {
  const [items,         setItems]         = useState<FaqRow[]>([]);
  const [stats,         setStats]         = useState({ total: 0, active: 0, inactive: 0, categories: 0 });
  const [loading,       setLoading]       = useState(true);

  const [searchInput,   setSearchInput]   = useState("");
  const [search,        setSearch]        = useState("");
  const [filterCat,     setFilterCat]     = useState("");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [activeTab,     setActiveTab]     = useState("alle");

  const [modal,         setModal]         = useState<"create" | FaqRow | null>(null);
  const [toDelete,      setToDelete]      = useState<FaqRow | null>(null);
  const [deleting,      setDeleting]      = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, category: filterCat, status: filterStatus });
      const res  = await fetch(`/api/admin/faqs?${q}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setStats(data.stats ?? { total: 0, active: 0, inactive: 0, categories: 0 });
    } finally {
      setLoading(false);
    }
  }, [search, filterCat, filterStatus]);

  useEffect(() => { load(); }, [load]);

  function clearFilters() {
    setSearchInput(""); setSearch(""); setFilterCat(""); setFilterStatus("all"); setActiveTab("alle");
  }

  const hasFilters = search || filterCat || filterStatus !== "all";

  // Group by category for tab view
  const displayedItems = activeTab === "alle"
    ? items
    : items.filter((f) => f.category === activeTab);

  function handleSaved(saved: FaqRow) {
    if (modal === "create") {
      setItems((prev) => [...prev, saved].sort((a, b) => a.sort_order - b.sort_order));
    } else {
      setItems((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
    }
    setModal(null);
  }

  async function toggleActive(faq: FaqRow) {
    const updated = { ...faq, is_active: !faq.is_active };
    setItems((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
    await fetch(`/api/admin/faqs/${faq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: updated.is_active }),
    });
  }

  async function moveItem(faq: FaqRow, direction: "up" | "down") {
    const group = items.filter((f) => f.category === faq.category);
    const idx   = group.findIndex((f) => f.id === faq.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= group.length) return;

    const other      = group[swapIdx];
    const newOrder   = other.sort_order;
    const otherOrder = faq.sort_order;

    // Optimistic update
    setItems((prev) =>
      prev.map((f) => {
        if (f.id === faq.id)   return { ...f, sort_order: newOrder   };
        if (f.id === other.id) return { ...f, sort_order: otherOrder };
        return f;
      }).sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.sort_order - b.sort_order;
      })
    );

    // Persist both
    await Promise.all([
      fetch(`/api/admin/faqs/${faq.id}`,   { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: newOrder   }) }),
      fetch(`/api/admin/faqs/${other.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: otherOrder }) }),
    ]);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/faqs/${toDelete.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((f) => f.id !== toDelete.id));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const TABS = ["alle", ...FAQ_CATEGORIES];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FAQ</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Häufig gestellte Fragen verwalten</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white text-sm font-medium rounded-xl hover:bg-green-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Neue FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Gesamt"     value={stats.total}      />
        <StatCard label="Aktiv"      value={stats.active}     />
        <StatCard label="Inaktiv"    value={stats.inactive}   />
        <StatCard label="Kategorien" value={stats.categories} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Fragen durchsuchen…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
        >
          <option value="all">Alle Status</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Inaktiv</option>
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <X className="w-3.5 h-3.5" /> Filter
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = tab === "alle" ? items.length : items.filter((f) => f.category === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-green-700 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tab === "alle" ? "Alle" : tab}
              <span className={`ml-1.5 text-xs ${activeTab === tab ? "text-green-200" : "text-gray-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Keine FAQs gefunden</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-2 text-sm text-green-700 hover:underline">
              Filter zurücksetzen
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {displayedItems.map((faq, idx) => {
            const groupItems = displayedItems.filter((f) => f.category === faq.category);
            const groupIdx   = groupItems.findIndex((f) => f.id === faq.id);
            return (
              <FaqItem
                key={faq.id}
                faq={faq}
                isFirst={groupIdx === 0}
                isLast={groupIdx === groupItems.length - 1}
                onEdit={() => setModal(faq)}
                onDelete={() => setToDelete(faq)}
                onToggleActive={() => toggleActive(faq)}
                onMoveUp={() => moveItem(faq, "up")}
                onMoveDown={() => moveItem(faq, "down")}
              />
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal !== null && (
        <FaqModal
          faq={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirmation */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">FAQ löschen?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{toDelete.question}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setToDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Löschen…" : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
