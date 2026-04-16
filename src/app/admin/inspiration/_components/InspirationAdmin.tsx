"use client";

import { useEffect, useRef, useState } from "react";
import {
  Images, Eye, EyeOff, Upload, Search, X, Plus,
  Pencil, Trash2, Loader2, ChevronLeft, ChevronRight,
  FileUp, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageModal, type InspImage } from "./ImageModal";

// ── Constants ─────────────────────────────────────────────────────────────────

const EFFECTS = [
  { value: "ruhe_erholung",            label: "Ruhe & Erholung" },
  { value: "fokus_konzentration",      label: "Fokus & Konzentration" },
  { value: "energie_aktivitaet",       label: "Energie & Aktivität" },
  { value: "kreativitaet_inspiration", label: "Kreativität & Inspiration" },
  { value: "begegnung_austausch",      label: "Begegnung & Austausch" },
];

const EFFECT_SHORT: Record<string, string> = {
  ruhe_erholung:            "Ruhe",
  fokus_konzentration:      "Fokus",
  energie_aktivitaet:       "Energie",
  kreativitaet_inspiration: "Kreativität",
  begegnung_austausch:      "Begegnung",
};

const EFFECT_COLOR: Record<string, string> = {
  ruhe_erholung:            "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  fokus_konzentration:      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  energie_aktivitaet:       "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  kreativitaet_inspiration: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  begegnung_austausch:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const ROOM_TYPES = [
  { value: "wohnzimmer",    label: "Wohnzimmer"   },
  { value: "schlafzimmer",  label: "Schlafzimmer" },
  { value: "arbeitszimmer", label: "Arbeitszimmer"},
  { value: "kueche",        label: "Küche"        },
  { value: "badezimmer",    label: "Bad"          },
  { value: "esszimmer",     label: "Esszimmer"    },
  { value: "yogaraum",      label: "Yogaraum"     },
  { value: "kinderzimmer",  label: "Kinderzimmer" },
  { value: "flur",          label: "Flur"         },
  { value: "keller",        label: "Keller"       },
  { value: "buero",         label: "Büro"         },
  { value: "wellness",      label: "Wellness"     },
  { value: "studio",        label: "Studio"       },
  { value: "sonstiges",     label: "Sonstiges"    },
];

const ROOM_LABEL: Record<string, string> = Object.fromEntries(ROOM_TYPES.map(r => [r.value, r.label]));
const LIMIT = 24;

// ── CSV Modal ─────────────────────────────────────────────────────────────────

function CsvModal({ onClose, onImported }: { onClose: () => void; onImported: (n: number) => void }) {
  const [csv,      setCsv]      = useState("");
  const [preview,  setPreview]  = useState<Record<string, string>[]>([]);
  const [importing,setImporting]= useState(false);
  const [done,     setDone]     = useState(false);
  const [err,      setErr]      = useState("");

  function parseRows(raw: string) {
    const lines = raw.trim().split(/\r?\n/);
    if (!lines.length) return [];
    // Detect header
    const first = lines[0].toLowerCase();
    const start = first.includes("image_url") ? 1 : 0;
    return lines.slice(start).map(line => {
      const [image_url, title, room_effect, room_type, colors_raw, tags_raw] = line.split(",");
      return {
        image_url:   image_url?.trim() ?? "",
        title:       title?.trim()     ?? "",
        room_effect: room_effect?.trim() ?? "",
        room_type:   room_type?.trim()   ?? "",
        colors:      colors_raw ? colors_raw.trim().split(";").filter(Boolean) : [],
        tags:        tags_raw   ? tags_raw.trim().split(";").filter(Boolean)   : [],
      };
    }).filter(r => r.image_url);
  }

  function onCsvChange(v: string) {
    setCsv(v);
    setPreview(parseRows(v).slice(0, 5) as any);
  }

  async function doImport() {
    const rows = parseRows(csv);
    if (!rows.length) { setErr("Keine gültigen Zeilen gefunden."); return; }
    setImporting(true); setErr("");
    const res = await fetch("/api/admin/inspiration/bulk-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(d.error ?? "Fehler"); setImporting(false); return; }
    setDone(true);
    setTimeout(() => { onImported(d.inserted); onClose(); }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl shadow-2xl max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">CSV Bulk-Import</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4" strokeWidth={2} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 font-mono">
            image_url, title, room_effect, room_type, colors (;-getrennt), tags (;-getrennt)
          </div>
          <textarea
            value={csv} onChange={e => onCsvChange(e.target.value)}
            rows={6}
            placeholder={"https://example.com/img.jpg,Nordische Stille,ruhe_erholung,wohnzimmer,#C8D5B9;#F0E6D3,skandinavisch;hell"}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-forest/20 resize-none"
          />
          {preview.length > 0 && (
            <div className="overflow-x-auto">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Vorschau ({preview.length} Zeilen)</p>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {["URL","Titel","Wirkung","Raumtyp"].map(h => <th key={h} className="pb-1 pr-3 font-semibold text-gray-500 dark:text-gray-400">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-1 pr-3 max-w-[120px] truncate text-gray-400">{r.image_url}</td>
                      <td className="py-1 pr-3 text-gray-700 dark:text-gray-300">{r.title}</td>
                      <td className="py-1 pr-3 text-gray-500 dark:text-gray-400">{r.room_effect}</td>
                      <td className="py-1 text-gray-500 dark:text-gray-400">{r.room_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {err && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{err}</p>}
          <button onClick={doImport} disabled={!csv.trim() || importing || done}
            className="w-full h-11 rounded-xl bg-forest text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity">
            {importing && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />}
            {done      && <Check   className="w-4 h-4"              strokeWidth={2}   />}
            {importing ? "Wird importiert …" : done ? "Importiert!" : `${parseRows(csv).length || ""} Zeilen importieren`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stats card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", color + "/15")}>
        <Icon className={cn("w-4 h-4", color)} strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function InspirationAdmin() {
  const [images,       setImages]       = useState<InspImage[]>([]);
  const [stats,        setStats]        = useState<{ total: number; active: number; inactive: number; user_uploads: number } | null>(null);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [tick,         setTick]         = useState(0);

  // Filters
  const [searchInput,  setSearchInput]  = useState("");
  const [search,       setSearch]       = useState("");
  const [effectFilter, setEffectFilter] = useState("");
  const [roomFilter,   setRoomFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);

  // Modals
  const [modalMode,    setModalMode]    = useState<"create" | "edit" | null>(null);
  const [editTarget,   setEditTarget]   = useState<InspImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InspImage | null>(null);
  const [deleting,     setDeleting]     = useState(false);
  const [showCsv,      setShowCsv]      = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch
  useEffect(() => {
    const params = new URLSearchParams({ search, effect: effectFilter, room_type: roomFilter, status: statusFilter, page: String(page), limit: String(LIMIT) });
    setLoading(true);
    fetch(`/api/admin/inspiration?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setImages(d.images); setTotal(d.total); setStats(d.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, effectFilter, roomFilter, statusFilter, page, tick]);

  const totalPages   = Math.ceil(total / LIMIT);
  const hasFilters   = !!(search || effectFilter || roomFilter || statusFilter);

  function clearFilters() { setSearchInput(""); setSearch(""); setEffectFilter(""); setRoomFilter(""); setStatusFilter(""); setPage(1); }

  function openCreate() { setModalMode("create"); setEditTarget(null); }
  function openEdit(img: InspImage) { setEditTarget(img); setModalMode("edit"); }

  function handleSaved(img: InspImage) {
    if (modalMode === "create") {
      setImages(prev => [img, ...prev]);
      setTotal(t => t + 1);
    } else {
      setImages(prev => prev.map(i => i.id === img.id ? img : i));
    }
    setTick(t => t + 1); // refresh stats
    setModalMode(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/inspiration/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setImages(prev => prev.filter(i => i.id !== deleteTarget.id));
      setTotal(t => t - 1);
      setTick(t => t + 1);
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <div className="max-w-7xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Inspiration</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stats?.total ?? "…"} Bilder gesamt</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Images}  label="Bilder gesamt"  value={stats.total}        color="text-forest"       />
          <StatCard icon={Eye}     label="Aktiv"          value={stats.active}       color="text-emerald-600"  />
          <StatCard icon={EyeOff}  label="Inaktiv"        value={stats.inactive}     color="text-gray-400"     />
          <StatCard icon={Upload}  label="User-Uploads"   value={stats.user_uploads} color="text-blue-500"     />
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Titel oder Tags …"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20" />
        </div>
        <select value={effectFilter} onChange={e => { setEffectFilter(e.target.value); setPage(1); }}
          className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20">
          <option value="">Alle Wirkungen</option>
          {EFFECTS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        <select value={roomFilter} onChange={e => { setRoomFilter(e.target.value); setPage(1); }}
          className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20">
          <option value="">Alle Raumtypen</option>
          {ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20">
          <option value="">Alle Status</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Inaktiv</option>
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1.5 transition-colors">
            <X className="w-3.5 h-3.5" strokeWidth={2} /> Zurücksetzen
          </button>
        )}
        <div className="flex-1" />
        {/* CSV import */}
        <button onClick={() => setShowCsv(true)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <FileUp className="w-3.5 h-3.5" strokeWidth={1.5} /> CSV
        </button>
        {/* New image */}
        <button onClick={openCreate}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest/90 transition-colors">
          <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Neues Bild
        </button>
      </div>

      {/* Grid */}
      {loading && !images.length ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-forest/40 animate-spin" strokeWidth={1.5} />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Images className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-3" strokeWidth={1} />
          <p className="text-gray-400 dark:text-gray-500 text-sm">Keine Bilder gefunden.</p>
          {hasFilters && <button onClick={clearFilters} className="text-forest dark:text-mint text-xs mt-2 underline-offset-2 hover:underline">Filter zurücksetzen</button>}
        </div>
      ) : (
        <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 transition-opacity", loading && "opacity-60")}>
          {images.map(img => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">

              {/* Thumbnail */}
              <div className={cn("aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700", !img.is_active && "opacity-50 grayscale")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url} alt={img.title ?? ""}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e5e7eb' width='80' height='80'/%3E%3C/svg%3E"; }}
                />
              </div>

              {/* Inaktiv badge */}
              {!img.is_active && (
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-900/70 text-white backdrop-blur-sm">Inaktiv</span>
                </div>
              )}

              {/* User-upload badge */}
              {img.user_id && (
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/80 text-white backdrop-blur-sm">User</span>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 pointer-events-none group-hover:pointer-events-auto">
                <button type="button" onClick={() => openEdit(img)}
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow">
                  <Pencil className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => setDeleteTarget(img)}
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-red-500 flex items-center justify-center transition-colors shadow group/del">
                  <Trash2 className="w-4 h-4 text-gray-700 group-hover/del:text-white" strokeWidth={1.5} />
                </button>
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate leading-snug">
                  {img.title ?? <span className="text-gray-400 italic">Kein Titel</span>}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {img.room_effect && (
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", EFFECT_COLOR[img.room_effect] ?? "bg-gray-100 text-gray-500")}>
                      {EFFECT_SHORT[img.room_effect] ?? img.room_effect}
                    </span>
                  )}
                  {img.room_type && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {ROOM_LABEL[img.room_type] ?? img.room_type}
                    </span>
                  )}
                </div>
                {/* Color dots */}
                {img.colors?.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {img.colors.slice(0, 4).map((c, i) => (
                      <span key={i} className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} von {total} Bildern
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" strokeWidth={1.5} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={cn("w-8 h-8 text-xs rounded-lg transition-colors", p === page ? "bg-forest text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700")}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {(modalMode === "create" || modalMode === "edit") && (
        <ImageModal
          mode={modalMode}
          initial={editTarget}
          onClose={() => setModalMode(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {deleteTarget.image_url && <img src={deleteTarget.image_url} alt="" className="w-full h-32 object-cover rounded-xl mb-4" onError={e => (e.target as HTMLImageElement).style.display = "none"} />}
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Bild löschen?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">{deleteTarget.title ?? deleteTarget.image_url}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mb-5">
              Das Bild wird aus der Datenbank{deleteTarget.user_id ? " und dem Storage" : ""} gelöscht.
            </p>
            <div className="flex gap-2">
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />}
                Löschen
              </button>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV modal */}
      {showCsv && (
        <CsvModal
          onClose={() => setShowCsv(false)}
          onImported={n => { setShowCsv(false); setTick(t => t + 1); }}
        />
      )}
    </div>
  );
}
