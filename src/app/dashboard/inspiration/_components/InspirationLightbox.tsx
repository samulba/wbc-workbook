"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X, ChevronLeft, ChevronRight, ExternalLink,
  BookmarkPlus, FolderPlus, Check, Loader2, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { InspirationImage } from "./InspirationFeed";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Room       { id: string; name: string; room_type: string; }
interface Project    { id: string; name: string; rooms: Room[]; }
interface Collection { id: string; name: string; item_count: number; }

export const EFFECT_LABELS: Record<string, string> = {
  ruhe_erholung:            "Ruhe & Erholung",
  fokus_konzentration:      "Fokus & Konzentration",
  energie_aktivitaet:       "Energie & Aktivität",
  kreativitaet_inspiration: "Kreativität & Inspiration",
  begegnung_austausch:      "Begegnung & Austausch",
};

export const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kueche: "Küche",
  badezimmer: "Bad", esszimmer: "Esszimmer",
  yogaraum: "Yogaraum", sonstiges: "Sonstiges",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  item:       InspirationImage;
  items:      InspirationImage[];
  onClose:    () => void;
  onNavigate: (item: InspirationImage) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function InspirationLightbox({ item, items, onClose, onNavigate }: Props) {
  const idx     = items.findIndex((i) => i.id === item.id);
  const hasPrev = idx > 0;
  const hasNext = idx < items.length - 1;

  const [panel, setPanel] = useState<"none" | "moodboard" | "collection">("none");

  // Moodboard panel state
  const [projects,        setProjects]        = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedRoom,    setSelectedRoom]    = useState("");
  const [moodStatus,      setMoodStatus]      = useState<"idle" | "loading" | "success" | "error">("idle");

  // Collections panel state
  const [collections,    setCollections]    = useState<Collection[]>([]);
  const [collStatus,     setCollStatus]     = useState<Record<string, "idle" | "loading" | "done">>({});
  const [collLoaded,     setCollLoaded]     = useState(false);

  // Touch swipe
  const touchX = useRef(0);

  // Navigation callbacks
  const prev = useCallback(() => { if (hasPrev) onNavigate(items[idx - 1]); }, [hasPrev, idx, items, onNavigate]);
  const next = useCallback(() => { if (hasNext) onNavigate(items[idx + 1]); }, [hasNext, idx, items, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape")      { onClose(); }
      if (e.key === "ArrowLeft")   { prev(); }
      if (e.key === "ArrowRight")  { next(); }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  // Reset panel state when item changes
  useEffect(() => {
    setPanel("none");
    setMoodStatus("idle");
    setSelectedProject("");
    setSelectedRoom("");
  }, [item.id]);

  // Fetch projects when moodboard panel opens
  useEffect(() => {
    if (panel !== "moodboard" || projects.length > 0) return;
    fetch("/api/user/rooms").then(r => r.ok ? r.json() : []).then(setProjects).catch(() => {});
  }, [panel, projects.length]);

  // Fetch collections when collection panel opens
  useEffect(() => {
    if (panel !== "collection" || collLoaded) return;
    fetch("/api/collections").then(r => r.ok ? r.json() : []).then((d) => {
      setCollections(d);
      setCollLoaded(true);
    }).catch(() => {});
  }, [panel, collLoaded]);

  // Touch swipe handlers
  function onTouchStart(e: React.TouchEvent) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = e.changedTouches[0].clientX - touchX.current;
    if (diff >  50) prev();
    if (diff < -50) next();
  }

  // Add to moodboard
  async function saveToMoodboard() {
    if (!selectedRoom) return;
    setMoodStatus("loading");
    try {
      const res = await fetch("/api/inspiration/moodboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: selectedRoom, imageUrl: item.image_url }),
      });
      setMoodStatus(res.ok ? "success" : "error");
    } catch { setMoodStatus("error"); }
  }

  // Add to collection
  async function addToCollection(collectionId: string) {
    setCollStatus(p => ({ ...p, [collectionId]: "loading" }));
    try {
      const res = await fetch(`/api/collections/${collectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspirationId: item.id }),
      });
      setCollStatus(p => ({ ...p, [collectionId]: res.ok ? "done" : "idle" }));
      if (res.ok) setCollections(p => p.map(c => c.id === collectionId ? { ...c, item_count: c.item_count + 1 } : c));
    } catch { setCollStatus(p => ({ ...p, [collectionId]: "idle" })); }
  }

  const effectLabel = item.room_effect ? EFFECT_LABELS[item.room_effect] : null;
  const roomLabel   = item.room_type   ? (ROOM_LABELS[item.room_type] ?? item.room_type) : null;
  const rooms       = projects.find(p => p.id === selectedProject)?.rooms ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="relative bg-white dark:bg-[#1a1a1a] rounded-t-2xl sm:rounded-2xl overflow-hidden w-full sm:max-w-2xl shadow-2xl max-h-[95dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Image area ──────────────────────────────────────── */}
        <div className="relative w-full bg-gray-100 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt={item.title ?? "Inspiration"}
            className="w-full max-h-[55dvh] object-cover block"
          />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" strokeWidth={2} />
          </button>

          {/* Prev arrow */}
          {hasPrev && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2} />
            </button>
          )}

          {/* Next arrow */}
          {hasNext && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" strokeWidth={2} />
            </button>
          )}

          {/* Position indicator */}
          {items.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {items.slice(Math.max(0, idx - 2), idx + 3).map((it, i) => (
                <span
                  key={it.id}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    it.id === item.id ? "bg-white scale-125" : "bg-white/50"
                  )}
                  style={{ order: i }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Scrollable content ───────────────────────────────── */}
        <div className="overflow-y-auto">

          {/* Action buttons */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-1">
            <button
              type="button"
              onClick={() => setPanel(p => p === "moodboard" ? "none" : "moodboard")}
              className={cn(
                "flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-sans font-medium transition-colors",
                panel === "moodboard"
                  ? "bg-forest text-white border-forest"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
              )}
            >
              <BookmarkPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
              Zu Moodboard
            </button>
            <button
              type="button"
              onClick={() => setPanel(p => p === "collection" ? "none" : "collection")}
              className={cn(
                "flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-sans font-medium transition-colors",
                panel === "collection"
                  ? "bg-forest text-white border-forest"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
              )}
            >
              <FolderPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
              Sammlung
            </button>
          </div>

          {/* ── Moodboard panel ─────────────────────────────────── */}
          {panel === "moodboard" && (
            <div className="mx-5 mt-3 p-4 rounded-xl bg-forest/5 border border-forest/15">
              {moodStatus === "success" ? (
                <p className="flex items-center gap-2 text-sm font-sans text-forest">
                  <Check className="w-4 h-4" strokeWidth={2} />
                  Zum Moodboard hinzugefügt!
                </p>
              ) : (
                <>
                  <p className="text-xs font-sans text-gray-500 mb-3 font-medium">In welchen Raum speichern?</p>
                  <div className="flex flex-col gap-2">
                    <select
                      value={selectedProject}
                      onChange={e => { setSelectedProject(e.target.value); setSelectedRoom(""); }}
                      className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-sans text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-forest/20"
                    >
                      <option value="">Projekt wählen …</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {selectedProject && rooms.length > 0 && (
                      <select
                        value={selectedRoom}
                        onChange={e => setSelectedRoom(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-sans text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-forest/20"
                      >
                        <option value="">Raum wählen …</option>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    )}
                    {selectedProject && rooms.length === 0 && (
                      <p className="text-xs text-gray-400 font-sans">Dieses Projekt hat noch keine Räume.</p>
                    )}
                    <button
                      type="button"
                      disabled={!selectedRoom || moodStatus === "loading"}
                      onClick={saveToMoodboard}
                      className="h-9 px-4 rounded-lg bg-forest text-white text-sm font-sans font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
                    >
                      {moodStatus === "loading"
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                        : "Speichern"
                      }
                    </button>
                  </div>
                  {moodStatus === "error" && (
                    <p className="text-xs text-red-500 mt-2">Fehler beim Speichern.</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Collections panel ───────────────────────────────── */}
          {panel === "collection" && (
            <div className="mx-5 mt-3 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700">
              {!collLoaded ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-4 h-4 text-forest/50 animate-spin" strokeWidth={1.5} />
                </div>
              ) : collections.length === 0 ? (
                <p className="text-xs font-sans text-gray-500 text-center py-2">
                  Noch keine Sammlungen. Erstelle eine im Tab &ldquo;Meine Sammlungen&rdquo;.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-sans text-gray-500 mb-1 font-medium">Zu Sammlung hinzufügen:</p>
                  {collections.map(c => {
                    const st = collStatus[c.id] ?? "idle";
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => st === "idle" && addToCollection(c.id)}
                        disabled={st !== "idle"}
                        className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-white dark:bg-white/5 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 text-sm font-sans text-gray-700 dark:text-gray-300 transition-colors disabled:cursor-default"
                      >
                        <span className="truncate">{c.name}</span>
                        {st === "done"    && <Check   className="w-4 h-4 text-forest shrink-0"    strokeWidth={2} />}
                        {st === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 shrink-0" strokeWidth={1.5} />}
                        {st === "idle"    && <Plus    className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Metadata ─────────────────────────────────────────── */}
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
                  <span className="text-[11px] font-sans font-medium text-gray-600 bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-full">
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

            {/* Color palette */}
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
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 8).map(tag => (
                  <span key={tag} className="text-[11px] font-sans text-gray-500 bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Source */}
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
    </div>
  );
}
