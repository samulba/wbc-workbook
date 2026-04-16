"use client";

import { useState, useTransition, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  X, ExternalLink, ChevronDown, Loader2,
  Waves, Target, Zap, Sparkles, Users,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InspirationImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  room_effect: string | null;
  room_type: string | null;
  colors: string[];
  tags: string[];
  source_url: string | null;
  created_at: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const EFFECTS = [
  { value: "ruhe_erholung",            label: "Ruhe & Erholung",          Icon: Waves,    active: "bg-mint/20 border-mint/50 text-forest",           idle: "bg-white border-gray-200 text-gray-600 hover:border-mint/40" },
  { value: "fokus_konzentration",      label: "Fokus & Konzentration",    Icon: Target,   active: "bg-[#e9eff2] border-[#c0d0d8] text-[#3d5a68]",    idle: "bg-white border-gray-200 text-gray-600 hover:border-[#c0d0d8]" },
  { value: "energie_aktivitaet",       label: "Energie & Aktivität",      Icon: Zap,      active: "bg-terracotta/10 border-terracotta/40 text-terracotta", idle: "bg-white border-gray-200 text-gray-600 hover:border-terracotta/30" },
  { value: "kreativitaet_inspiration", label: "Kreativität",              Icon: Sparkles, active: "bg-sand/25 border-sand/60 text-[#8a6030]",         idle: "bg-white border-gray-200 text-gray-600 hover:border-sand/50" },
  { value: "begegnung_austausch",      label: "Begegnung",                Icon: Users,    active: "bg-forest/8 border-forest/25 text-forest",         idle: "bg-white border-gray-200 text-gray-600 hover:border-forest/25" },
] as const;

const ROOM_TYPES = [
  { value: "",               label: "Alle Räume" },
  { value: "wohnzimmer",     label: "Wohnzimmer" },
  { value: "schlafzimmer",   label: "Schlafzimmer" },
  { value: "arbeitszimmer",  label: "Arbeitszimmer" },
  { value: "kueche",         label: "Küche" },
  { value: "badezimmer",     label: "Bad" },
  { value: "esszimmer",      label: "Esszimmer" },
  { value: "yogaraum",       label: "Yogaraum" },
  { value: "sonstiges",      label: "Sonstiges" },
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

const EFFECT_LABELS: Record<string, string> = {
  ruhe_erholung:            "Ruhe & Erholung",
  fokus_konzentration:      "Fokus & Konzentration",
  energie_aktivitaet:       "Energie & Aktivität",
  kreativitaet_inspiration: "Kreativität & Inspiration",
  begegnung_austausch:      "Begegnung & Austausch",
};

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kueche: "Küche",
  badezimmer: "Bad", esszimmer: "Esszimmer",
  yogaraum: "Yogaraum", sonstiges: "Sonstiges",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  initialItems: InspirationImage[];
  pageSize: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function InspirationFeed({ initialItems, pageSize }: Props) {
  const [, startTransition] = useTransition();

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

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchItems = useCallback(async (
    effect: string, roomType: string, color: string, pg: number
  ): Promise<InspirationImage[]> => {
    const params = new URLSearchParams({ page: String(pg) });
    if (effect)   params.set("effect",   effect);
    if (roomType) params.set("roomType", roomType);
    if (color)    params.set("color",    color);
    const res = await fetch(`/api/inspiration?${params}`);
    if (!res.ok) return [];
    return res.json();
  }, []);

  // ── Filter change ──────────────────────────────────────────────────────────

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

  // ── Load more ──────────────────────────────────────────────────────────────

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    const data = await fetchItems(activeEffect, activeRoomType, activeColor, nextPage);
    setItems((prev) => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length === pageSize);
    setLoading(false);
  }

  // ── Active filter count ────────────────────────────────────────────────────

  const filterCount = [activeEffect, activeRoomType, activeColor].filter(Boolean).length;

  function clearAll() {
    setActiveEffect("");
    setActiveRoomType("");
    setActiveColor("");
    startTransition(() => { applyFilter("", "", ""); });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* ── Filter bar ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4">

        {/* Effect pills */}
        <div className="flex flex-wrap gap-2">
          {EFFECTS.map(({ value, label, Icon, active, idle }) => {
            const isActive = activeEffect === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleEffect(value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-sans font-medium transition-all",
                  isActive ? active : idle
                )}
              >
                <Icon className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Room type + Color row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Room type dropdown */}
          <div className="relative">
            <select
              value={activeRoomType}
              onChange={(e) => changeRoomType(e.target.value)}
              className={cn(
                "h-9 pl-3 pr-8 rounded-full border text-xs font-sans font-medium appearance-none cursor-pointer transition-all",
                "focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent",
                activeRoomType
                  ? "bg-forest/8 border-forest/30 text-forest"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {ROOM_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value} className="text-gray-900">
                  {rt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          </div>

          {/* Color swatches */}
          <div className="flex items-center gap-1.5">
            {COLOR_FILTERS.map(({ hex, label }) => (
              <button
                key={hex}
                type="button"
                title={label}
                onClick={() => toggleColor(hex)}
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

          {/* Clear all */}
          {filterCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-sans text-gray-400 hover:text-gray-700 transition-colors ml-1"
            >
              <X className="w-3 h-3" strokeWidth={2} />
              Alle Filter löschen
            </button>
          )}
        </div>
      </div>

      {/* ── Loading overlay / empty state ──────────────────── */}
      {loading && items.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-forest/50 animate-spin" strokeWidth={1.5} />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-20">
          <p className="font-headline text-xl text-gray-400 mb-2">Keine Bilder gefunden</p>
          <p className="text-sm font-sans text-gray-400">
            Versuche andere Filter oder{" "}
            <button type="button" onClick={clearAll} className="text-forest underline underline-offset-2">
              setze alle Filter zurück
            </button>
          </p>
        </div>
      )}

      {/* ── Masonry grid ────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
          {items.map((item) => (
            <InspirationCard
              key={item.id}
              item={item}
              onClick={() => setSelected(item)}
            />
          ))}
        </div>
      )}

      {/* Loading more spinner */}
      {loading && items.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-forest/50 animate-spin" strokeWidth={1.5} />
        </div>
      )}

      {/* ── Load more ───────────────────────────────────────── */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-sans font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Mehr laden
          </button>
        </div>
      )}

      {/* ── Lightbox ────────────────────────────────────────── */}
      {selected && (
        <Lightbox item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ── InspirationCard ───────────────────────────────────────────────────────────

function InspirationCard({
  item,
  onClick,
}: {
  item: InspirationImage;
  onClick: () => void;
}) {
  const effectLabel = item.room_effect ? EFFECT_LABELS[item.room_effect] : null;

  return (
    <div
      className="break-inside-avoid mb-3 group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative rounded-xl overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_url}
          alt={item.title ?? "Inspiration"}
          className="w-full block object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Bottom caption on hover */}
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
      </div>

      {/* Below-card: minimal metadata */}
      {(item.colors.length > 0 || item.room_type) && (
        <div className="flex items-center justify-between px-0.5 pt-1.5 pb-0.5">
          {/* Color dots */}
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

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  item,
  onClose,
}: {
  item: InspirationImage;
  onClose: () => void;
}) {
  const effectLabel  = item.room_effect ? EFFECT_LABELS[item.room_effect] : null;
  const roomLabel    = item.room_type   ? (ROOM_LABELS[item.room_type] ?? item.room_type) : null;
  const displayTags  = item.tags.slice(0, 8);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#1a1a1a] rounded-t-2xl sm:rounded-2xl overflow-hidden w-full sm:max-w-2xl shadow-2xl max-h-[95dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" strokeWidth={2} />
        </button>

        {/* Image */}
        <div className="w-full bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt={item.title ?? "Inspiration"}
            className="w-full max-h-[60dvh] object-cover block"
          />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {/* Title + badges */}
          <div>
            {item.title && (
              <h2 className="font-headline text-xl text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                {item.title}
              </h2>
            )}
            <div className="flex flex-wrap gap-2">
              {effectLabel && (
                <span className="text-[11px] font-sans font-medium text-forest bg-forest/8 border border-forest/15 px-2.5 py-1 rounded-full">
                  {effectLabel}
                </span>
              )}
              {roomLabel && (
                <span className="text-[11px] font-sans font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                  {roomLabel}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm font-sans text-gray-600 dark:text-gray-400 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Colors */}
          {item.colors.length > 0 && (
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-gray-400 mb-2">
                Farbpalette
              </p>
              <div className="flex gap-2 flex-wrap">
                {item.colors.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span
                      className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: /^#[0-9a-fA-F]{3,6}$/.test(c) ? c : "#cba178" }}
                    />
                    <span className="text-[9px] font-mono text-gray-400">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-sans text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Source link */}
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-sans text-gray-400 hover:text-forest transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              Quelle ansehen
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
