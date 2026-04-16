"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, X, Pencil, Trash2, Palette, CheckCircle2, XCircle } from "lucide-react";
import { PaletteModal, type PaletteRow } from "./PaletteModal";

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeHex(val: unknown, fallback: string): string {
  if (typeof val === "string" && /^#[0-9a-fA-F]{6}$/.test(val)) return val;
  return fallback;
}

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

// ── Palette Card ──────────────────────────────────────────────────────────────

function PaletteCard({
  palette,
  onEdit,
  onDelete,
}: {
  palette: PaletteRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const allColors = [
    ...palette.primary_colors,
    ...palette.secondary_colors,
    ...(palette.accent_color ? [palette.accent_color] : []),
  ];

  return (
    <div className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-md ${!palette.is_active ? "opacity-50 grayscale" : ""}`}>
      {/* Color strip */}
      <div className="flex h-20">
        {allColors.slice(0, 5).map((c, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ backgroundColor: safeHex(c, "#cccccc") }}
          />
        ))}
        {allColors.length === 0 && <div className="flex-1 bg-gray-100" />}
      </div>

      {/* Color circles */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex gap-1.5 flex-wrap mb-2">
          {allColors.slice(0, 6).map((c, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: safeHex(c, "#cccccc") }}
              title={c}
            />
          ))}
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{palette.name}</p>
        {palette.room_effect && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{palette.room_effect}</p>
        )}
      </div>

      {/* Inactive badge */}
      {!palette.is_active && (
        <span className="absolute top-2 left-2 bg-gray-800/70 text-white text-[10px] px-1.5 py-0.5 rounded">
          Inaktiv
        </span>
      )}

      {/* Hover actions */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          title="Bearbeiten"
        >
          <Pencil className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
          title="Löschen"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PaletteAdmin() {
  const [items,        setItems]        = useState<PaletteRow[]>([]);
  const [total,        setTotal]        = useState(0);
  const [stats,        setStats]        = useState({ total: 0, active: 0, inactive: 0, effects: 0 });
  const [roomEffects,  setRoomEffects]  = useState<string[]>([]);
  const [loading,      setLoading]      = useState(true);

  const [searchInput,  setSearchInput]  = useState("");
  const [search,       setSearch]       = useState("");
  const [filterEffect, setFilterEffect] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page,         setPage]         = useState(1);

  const [modal,        setModal]        = useState<"create" | PaletteRow | null>(null);
  const [toDelete,     setToDelete]     = useState<PaletteRow | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const LIMIT = 24;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        search:      search,
        room_effect: filterEffect,
        status:      filterStatus,
        page:        String(page),
        limit:       String(LIMIT),
      });
      const res  = await fetch(`/api/admin/palettes?${q}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setStats(data.stats ?? { total: 0, active: 0, inactive: 0, effects: 0 });
      setRoomEffects(data.roomEffects ?? []);
    } finally {
      setLoading(false);
    }
  }, [search, filterEffect, filterStatus, page]);

  useEffect(() => { load(); }, [load]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, filterEffect, filterStatus]);

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setFilterEffect("");
    setFilterStatus("all");
    setPage(1);
  }

  const hasFilters = search || filterEffect || filterStatus !== "all";

  function handleSaved(saved: PaletteRow) {
    if (modal === "create") {
      setItems((prev) => [saved, ...prev]);
      setStats((s) => ({ ...s, total: s.total + 1, active: saved.is_active ? s.active + 1 : s.active, inactive: !saved.is_active ? s.inactive + 1 : s.inactive }));
    } else {
      setItems((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    }
    setModal(null);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/palettes/${toDelete.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((p) => p.id !== toDelete.id));
      setStats((s) => ({
        ...s,
        total:    s.total    - 1,
        active:   toDelete.is_active  ? s.active   - 1 : s.active,
        inactive: !toDelete.is_active ? s.inactive - 1 : s.inactive,
      }));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Farbpaletten</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Farbpaletten und -schemas verwalten</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white text-sm font-medium rounded-xl hover:bg-green-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Neue Palette
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Gesamt"     value={stats.total}    />
        <StatCard label="Aktiv"      value={stats.active}   />
        <StatCard label="Inaktiv"    value={stats.inactive} />
        <StatCard label="Wirkungen"  value={stats.effects}  sub="verschiedene" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Suche…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>
        <select
          value={filterEffect}
          onChange={(e) => setFilterEffect(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
        >
          <option value="">Alle Wirkungen</option>
          {roomEffects.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
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
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Filter
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Palette className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Keine Paletten gefunden</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-2 text-sm text-green-700 hover:underline">
              Filter zurücksetzen
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((p) => (
            <PaletteCard
              key={p.id}
              palette={p}
              onEdit={() => setModal(p)}
              onDelete={() => setToDelete(p)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            Zurück
          </button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-sm rounded-lg transition-colors ${page === p ? "bg-green-700 text-white" : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            Weiter
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal !== null && (
        <PaletteModal
          palette={modal === "create" ? null : modal}
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
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Palette löschen?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{toDelete.name}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
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
