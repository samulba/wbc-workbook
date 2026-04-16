"use client";

import { useState, useTransition, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  X, ChevronDown, Loader2,
  Waves, Target, Zap, Sparkles, Users,
  Upload, FolderOpen,
} from "lucide-react";
import { InspirationLightbox, EFFECT_LABELS, ROOM_LABELS } from "./InspirationLightbox";
import { CollectionsTab } from "./CollectionsTab";
import { UploadModal } from "./UploadModal";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InspirationImage {
  id:          string;
  image_url:   string;
  title:       string | null;
  description: string | null;
  room_effect: string | null;
  room_type:   string | null;
  colors:      string[];
  tags:        string[];
  source_url:  string | null;
  created_at:  string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const EFFECTS = [
  { value: "ruhe_erholung",            label: "Ruhe & Erholung",       Icon: Waves,    active: "bg-mint/20 border-mint/50 text-forest",                     idle: "bg-white border-gray-200 text-gray-600 hover:border-mint/40" },
  { value: "fokus_konzentration",      label: "Fokus & Konzentration", Icon: Target,   active: "bg-[#e9eff2] border-[#c0d0d8] text-[#3d5a68]",              idle: "bg-white border-gray-200 text-gray-600 hover:border-[#c0d0d8]" },
  { value: "energie_aktivitaet",       label: "Energie & Aktivität",   Icon: Zap,      active: "bg-terracotta/10 border-terracotta/40 text-terracotta",      idle: "bg-white border-gray-200 text-gray-600 hover:border-terracotta/30" },
  { value: "kreativitaet_inspiration", label: "Kreativität",           Icon: Sparkles, active: "bg-sand/25 border-sand/60 text-[#8a6030]",                  idle: "bg-white border-gray-200 text-gray-600 hover:border-sand/50" },
  { value: "begegnung_austausch",      label: "Begegnung",             Icon: Users,    active: "bg-forest/8 border-forest/25 text-forest",                  idle: "bg-white border-gray-200 text-gray-600 hover:border-forest/25" },
] as const;

const ROOM_TYPES = [
  { value: "",              label: "Alle Räume" },
  { value: "wohnzimmer",   label: "Wohnzimmer" },
  { value: "schlafzimmer", label: "Schlafzimmer" },
  { value: "arbeitszimmer",label: "Arbeitszimmer" },
  { value: "kueche",       label: "Küche" },
  { value: "badezimmer",   label: "Bad" },
  { value: "esszimmer",    label: "Esszimmer" },
  { value: "yogaraum",     label: "Yogaraum" },
  { value: "sonstiges",    label: "Sonstiges" },
] as const;

const COLOR_FILTERS = [
  { hex: "#8B9E7A", label: "Salbei" },
  { hex: "#C4956A", label: "Sand" },
  { hex: "#C96A50", label: "Terrakotta" },
  { hex: "#4A5568", label: "Schiefer" },
  { hex: "#F0E6D3", label: "Creme" },
  { hex: "#2D5A4F", label: "Waldgrün" },
  { hex: "#FFFFFF", label: "Weiß" },
  { hex: "#2C3E50", label: "Dunkel" },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  initialItems: InspirationImage[];
  pageSize:     number;
}

// ── Main component ────────────────────────────────────────────────────────────

export function InspirationFeed({ initialItems, pageSize }: Props) {
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<"discover" | "collections">("discover");

  // Filter state
  const [activeEffect,   setActiveEffect]   = useState("");
  const [activeRoomType, setActiveRoomType] = useState("");
  const [activeColor,    setActiveColor]    = useState("");

  // Feed state
  const [items,   setItems]   = useState<InspirationImage[]>(initialItems);
  const [page,    setPage]    = useState(0);
  const [hasMore, setHasMore] = useState(initialItems.length === pageSize);
  const [loading, setLoading] = useState(false);

  // Lightbox
  const [selected, setSelected] = useState<InspirationImage | null>(null);

  // Upload modal
  const [showUpload, setShowUpload] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchItems = useCallback(async (
    effect: string, roomType: string, color: string, pg: number
  ): Promise<InspirationImage[]> => {
    const params = new URLSearchParams({ page: String(pg) });
    if (effect)   params.set("effect",   effect);
    if (roomType) params.set("roomType", roomType);
    if (color)    params.set("color",    color);
    const res = await fetch(`/api/inspiration?${params}`);
    return res.ok ? res.json() : [];
  }, []);

  async function applyFilter(effect: string, roomType: string, color: string) {
    setLoading(true);
    const data = await fetchItems(effect, roomType, color, 0);
    setItems(data);
    setPage(0);
    setHasMore(data.length === pageSize);
    setLoading(false);
  }

  function toggleEffect(value: string) {
    const next = activeEffect === value ? "" : value;
    setActiveEffect(next);
    startTransition(() => { applyFilter(next, activeRoomType, activeColor); });
  }

  function changeRoomType(value: string) {
    setActiveRoomType(value);
    startTransition(() => { applyFilter(activeEffect, value, activeColor); });
  }

  function toggleColor(hex: string) {
    const next = activeColor === hex ? "" : hex;
    setActiveColor(next);
    startTransition(() => { applyFilter(activeEffect, activeRoomType, next); });
  }

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    const data = await fetchItems(activeEffect, activeRoomType, activeColor, nextPage);
    setItems(prev => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length === pageSize);
    setLoading(false);
  }

  const filterCount = [activeEffect, activeRoomType, activeColor].filter(Boolean).length;

  function clearAll() {
    setActiveEffect(""); setActiveRoomType(""); setActiveColor("");
    startTransition(() => { applyFilter("", "", ""); });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top bar: tabs + upload button ──────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-0.5 border-b border-gray-200 flex-1 -mb-6 pb-0">
          {(["discover", "collections"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-sans font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                tab === t
                  ? "border-forest text-forest"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              )}
            >
              {t === "discover"     && <><Sparkles   className="w-3.5 h-3.5" strokeWidth={1.5} />Entdecken</>}
              {t === "collections"  && <><FolderOpen className="w-3.5 h-3.5" strokeWidth={1.5} />Meine Sammlungen</>}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full border border-gray-200 bg-white text-sm font-sans font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="hidden sm:inline">Hochladen</span>
        </button>
      </div>

      {/* ── COLLECTIONS TAB ────────────────────────────────────── */}
      {tab === "collections" && <CollectionsTab />}

      {/* ── DISCOVER TAB ───────────────────────────────────────── */}
      {tab === "discover" && (
        <>
          {/* Filter bar */}
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {EFFECTS.map(({ value, label, Icon, active, idle }) => {
                const isActive = activeEffect === value;
                return (
                  <button key={value} type="button" onClick={() => toggleEffect(value)}
                    className={cn("flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-sans font-medium transition-all", isActive ? active : idle)}
                  >
                    <Icon className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <select
                  value={activeRoomType}
                  onChange={e => changeRoomType(e.target.value)}
                  className={cn(
                    "h-9 pl-3 pr-8 rounded-full border text-xs font-sans font-medium appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent",
                    activeRoomType
                      ? "bg-forest/8 border-forest/30 text-forest"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {ROOM_TYPES.map(rt => (
                    <option key={rt.value} value={rt.value} className="text-gray-900">{rt.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              </div>

              <div className="flex items-center gap-1.5">
                {COLOR_FILTERS.map(({ hex, label }) => (
                  <button key={hex} type="button" title={label} onClick={() => toggleColor(hex)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all",
                      activeColor === hex
                        ? "border-forest scale-125 shadow-md"
                        : hex === "#FFFFFF"
                        ? "border-gray-300 hover:border-gray-400"
                        : "border-transparent hover:scale-110 hover:border-gray-300"
                    )}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>

              {filterCount > 0 && (
                <button type="button" onClick={clearAll}
                  className="flex items-center gap-1 text-xs font-sans text-gray-400 hover:text-gray-700 transition-colors ml-1"
                >
                  <X className="w-3 h-3" strokeWidth={2} />
                  Alle Filter löschen
                </button>
              )}
            </div>
          </div>

          {/* Loading (full replace) */}
          {loading && items.length === 0 && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 text-forest/50 animate-spin" strokeWidth={1.5} />
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="text-center py-20">
              <p className="font-headline text-xl text-gray-400 mb-2">Keine Bilder gefunden</p>
              <p className="text-sm font-sans text-gray-400">
                Versuche andere Filter oder{" "}
                <button type="button" onClick={clearAll} className="text-forest underline underline-offset-2">
                  setze alle zurück
                </button>
              </p>
            </div>
          )}

          {/* Masonry grid */}
          {items.length > 0 && (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {items.map((item, i) => (
                <InspirationCard
                  key={item.id}
                  item={item}
                  priority={i < 8}
                  onClick={() => setSelected(item)}
                />
              ))}
            </div>
          )}

          {/* Load more spinner */}
          {loading && items.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 text-forest/50 animate-spin" strokeWidth={1.5} />
            </div>
          )}

          {/* Load more button */}
          {hasMore && !loading && (
            <div className="flex justify-center pt-2">
              <button type="button" onClick={loadMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-sans font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Mehr laden
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Lightbox ────────────────────────────────────────────── */}
      {selected && (
        <InspirationLightbox
          item={selected}
          items={items}
          onClose={() => setSelected(null)}
          onNavigate={setSelected}
        />
      )}

      {/* ── Upload modal ─────────────────────────────────────────── */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={(img) => {
            setItems(prev => [img, ...prev]);
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}

// ── InspirationCard ───────────────────────────────────────────────────────────

function InspirationCard({
  item,
  priority,
  onClick,
}: {
  item:     InspirationImage;
  priority: boolean;
  onClick:  () => void;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const effectLabel = item.room_effect ? EFFECT_LABELS[item.room_effect] : null;

  // Hide broken images
  if (status === "error") return null;

  return (
    <div className="break-inside-avoid mb-3 group cursor-pointer" onClick={onClick}>
      <div className={cn(
        "relative rounded-xl overflow-hidden bg-gray-100",
        status === "loading" && "aspect-[3/4]"
      )}>
        {/* Skeleton */}
        {status === "loading" && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse" />
        )}

        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_url}
          alt={item.title ?? "Inspiration"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "w-full block object-cover transition-all duration-500",
            status === "loaded"
              ? "opacity-100 group-hover:scale-[1.02]"
              : "opacity-0 absolute inset-0 h-full"
          )}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />

        {/* Hover overlay + caption (only when loaded) */}
        {status === "loaded" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute bottom-0 left-0 right-0 px-3 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-1 group-hover:translate-y-0">
              {item.title && (
                <p className="text-xs font-sans font-semibold text-white leading-tight line-clamp-2">
                  {item.title}
                </p>
              )}
              {effectLabel && (
                <p className="text-[10px] font-sans text-white/70 mt-0.5">{effectLabel}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Color dots + room label (only when loaded) */}
      {status === "loaded" && (item.colors.length > 0 || item.room_type) && (
        <div className="flex items-center justify-between px-0.5 pt-1.5 pb-0.5">
          <div className="flex gap-1">
            {item.colors.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
                style={{ backgroundColor: /^#[0-9a-fA-F]{3,6}$/.test(c) ? c : "#cba178" }}
                title={c}
              />
            ))}
          </div>
          {item.room_type && (
            <span className="text-[10px] font-sans text-gray-400">
              {ROOM_LABELS[item.room_type] ?? item.room_type}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
