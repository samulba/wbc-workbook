"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Upload, Palette, StickyNote, Trash2, RotateCcw, ImagePlus,
} from "lucide-react";
import type { CanvasItem, CanvasItemType } from "@/lib/types/module1";

interface Props {
  items:     CanvasItem[];
  onChange:  (items: CanvasItem[]) => void;
  onUpload:  (file: File) => Promise<string | null>;
  inspirationImages?: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const CANVAS_W = 960;
const CANVAS_H = 600;
const MIN_ITEM_SIZE = 60;
const MAX_ITEM_SIZE = 600;

// Default item sizes per type
const DEFAULT_SIZES: Record<CanvasItemType, { w: number; h: number }> = {
  image: { w: 220, h: 220 },
  color: { w: 140, h: 140 },
  note:  { w: 200, h: 140 },
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// ── Main Component ───────────────────────────────────────────────────────────

export function MoodboardCanvas({
  items,
  onChange,
  onUpload,
  inspirationImages,
}: Props) {
  const [selected, setSelected]   = useState<string | null>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);
  const fileInput  = useRef<HTMLInputElement>(null);

  const [showColorAdd, setShowColorAdd]   = useState(false);
  const [newColor, setNewColor]           = useState("#cba178");
  const [showNoteAdd, setShowNoteAdd]     = useState(false);
  const [newNote, setNewNote]             = useState("");
  const [showInspiration, setShowInspiration] = useState(false);

  // ── Item mutations ─────────────────────────────────────────

  const update = useCallback((id: string, patch: Partial<CanvasItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, [items, onChange]);

  const remove = useCallback((id: string) => {
    onChange(items.filter((i) => i.id !== id));
    if (selected === id) setSelected(null);
  }, [items, onChange, selected]);

  const add = useCallback((item: Omit<CanvasItem, "id" | "x" | "y" | "z" | "w" | "h">) => {
    const id   = uid();
    const base = DEFAULT_SIZES[item.type];
    const x    = Math.round(CANVAS_W / 2 - base.w / 2 + (Math.random() - 0.5) * 60);
    const y    = Math.round(CANVAS_H / 2 - base.h / 2 + (Math.random() - 0.5) * 60);
    const z    = items.length > 0 ? Math.max(...items.map((i) => i.z)) + 1 : 1;
    const next: CanvasItem = {
      id, ...item, x, y, w: base.w, h: base.h, z,
    };
    onChange([...items, next]);
    setSelected(id);
  }, [items, onChange]);

  // Keyboard delete
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
        e.preventDefault();
        remove(selected);
      }
      if (e.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, remove]);

  function clearBoard() {
    if (items.length === 0) return;
    if (!confirm("Canvas leeren?")) return;
    onChange([]);
    setSelected(null);
  }

  // ── File upload ────────────────────────────────────────────

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const url = await onUpload(file);
    if (url) add({ type: "image", src: url });
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function onCanvasDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files ?? []);
    for (const f of files) await handleFile(f);
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest/90"
        >
          <Upload className="w-3.5 h-3.5" />
          Bild hochladen
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          className="hidden"
        />

        {inspirationImages && inspirationImages.length > 0 && (
          <button
            type="button"
            onClick={() => setShowInspiration(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-forest/25 text-forest text-sm font-medium hover:bg-forest/5"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            Aus Favoriten
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowColorAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sand/40 text-forest/75 text-sm font-medium hover:bg-sand/15"
        >
          <Palette className="w-3.5 h-3.5" />
          Farbfeld
        </button>

        <button
          type="button"
          onClick={() => setShowNoteAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sand/40 text-forest/75 text-sm font-medium hover:bg-sand/15"
        >
          <StickyNote className="w-3.5 h-3.5" />
          Notiz
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={clearBoard}
          disabled={items.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-terracotta/70 text-xs hover:bg-terracotta/5 disabled:opacity-30"
        >
          <RotateCcw className="w-3 h-3" />
          Leeren
        </button>
      </div>

      {/* Color add popover */}
      {showColorAdd && (
        <div className="flex items-center gap-2 rounded-lg border border-sand/40 bg-cream/60 p-2">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-9 h-9 rounded cursor-pointer border border-forest/20"
          />
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="flex-1 h-9 px-3 rounded border border-sand/40 text-sm font-mono"
          />
          <button
            type="button"
            onClick={() => { add({ type: "color", color: newColor }); setShowColorAdd(false); }}
            className="h-9 px-4 rounded bg-forest text-white text-xs font-medium hover:bg-forest/90"
          >
            Hinzufügen
          </button>
        </div>
      )}

      {/* Note add popover */}
      {showNoteAdd && (
        <div className="flex items-center gap-2 rounded-lg border border-sand/40 bg-cream/60 p-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Kurze Notiz …"
            className="flex-1 h-9 px-3 rounded border border-sand/40 text-sm"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              if (!newNote.trim()) return;
              add({ type: "note", text: newNote.trim() });
              setNewNote("");
              setShowNoteAdd(false);
            }}
            className="h-9 px-4 rounded bg-forest text-white text-xs font-medium hover:bg-forest/90"
          >
            Hinzufügen
          </button>
        </div>
      )}

      {/* Canvas stage */}
      <div
        ref={canvasRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onCanvasDrop}
        onPointerDown={(e) => {
          if (e.target === canvasRef.current) setSelected(null);
        }}
        className="relative rounded-2xl border border-forest/15 shadow-inner overflow-hidden bg-cream"
        style={{
          aspectRatio:   `${CANVAS_W} / ${CANVAS_H}`,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(68,92,73,0.12) 1px, transparent 0)",
          backgroundSize: "20px 20px",
          touchAction:   "none",
        }}
      >
        {items.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-forest/40 gap-2 pointer-events-none">
            <Upload className="w-8 h-8" strokeWidth={1.5} />
            <p className="text-sm font-sans">Bilder hierher ziehen oder oben einfügen</p>
          </div>
        )}

        {items
          .slice()
          .sort((a, b) => a.z - b.z)
          .map((item) => (
            <CanvasItemView
              key={item.id}
              item={item}
              canvasWidth={CANVAS_W}
              canvasHeight={CANVAS_H}
              isSelected={selected === item.id}
              onSelect={() => setSelected(item.id)}
              onUpdate={(p) => update(item.id, p)}
              onRemove={() => remove(item.id)}
            />
          ))}
      </div>

      <p className="text-[11px] text-gray/40 font-sans">
        Tipp: Klick zum Auswählen · Drag zum Verschieben · Griff rechts-unten zum Skalieren · Backspace löscht
      </p>

      {/* Inspiration picker modal */}
      {showInspiration && inspirationImages && (
        <InspirationPickerModal
          images={inspirationImages}
          onPick={(src) => { add({ type: "image", src }); setShowInspiration(false); }}
          onClose={() => setShowInspiration(false)}
        />
      )}
    </div>
  );
}

// ── Single item view ─────────────────────────────────────────────────────────

function CanvasItemView({
  item, canvasWidth, canvasHeight, isSelected, onSelect, onUpdate, onRemove,
}: {
  item:          CanvasItem;
  canvasWidth:   number;
  canvasHeight:  number;
  isSelected:    boolean;
  onSelect:      () => void;
  onUpdate:      (patch: Partial<CanvasItem>) => void;
  onRemove:      () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scale canvas coords to container (responsive). We compute factor from
  // container width on each drag using ResizeObserver-free method: closest
  // parent with aspect-ratio is the stage itself, same width as our content.
  const parentRef = useRef<HTMLElement | null>(null);

  const dragMode = useRef<"none" | "move" | "resize">("none");
  const startPtr = useRef<{ x: number; y: number } | null>(null);
  const startItem = useRef<Pick<CanvasItem, "x"|"y"|"w"|"h"> | null>(null);

  function scale(): number {
    const parent = containerRef.current?.offsetParent as HTMLElement | null;
    if (!parent) return 1;
    parentRef.current = parent;
    return parent.clientWidth / canvasWidth;
  }

  function onPtrDown(e: React.PointerEvent, mode: "move" | "resize") {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragMode.current = mode;
    startPtr.current = { x: e.clientX, y: e.clientY };
    startItem.current = { x: item.x, y: item.y, w: item.w, h: item.h };
    onSelect();
  }

  function onPtrMove(e: React.PointerEvent) {
    if (dragMode.current === "none" || !startPtr.current || !startItem.current) return;
    const s = scale();
    const dx = (e.clientX - startPtr.current.x) / s;
    const dy = (e.clientY - startPtr.current.y) / s;

    if (dragMode.current === "move") {
      onUpdate({
        x: clamp(startItem.current.x + dx, 0, canvasWidth  - item.w),
        y: clamp(startItem.current.y + dy, 0, canvasHeight - item.h),
      });
    } else {
      const newW = clamp(startItem.current.w + dx, MIN_ITEM_SIZE, Math.min(MAX_ITEM_SIZE, canvasWidth  - item.x));
      const newH = clamp(startItem.current.h + dy, MIN_ITEM_SIZE, Math.min(MAX_ITEM_SIZE, canvasHeight - item.y));
      onUpdate({ w: newW, h: newH });
    }
  }

  function onPtrUp() {
    dragMode.current = "none";
    startPtr.current = null;
    startItem.current = null;
  }

  // Compute relative positioning inside the stage
  const pct = useMemo(() => ({
    left:   `${(item.x / canvasWidth) * 100}%`,
    top:    `${(item.y / canvasHeight) * 100}%`,
    width:  `${(item.w / canvasWidth) * 100}%`,
    height: `${(item.h / canvasHeight) * 100}%`,
  }), [item.x, item.y, item.w, item.h, canvasWidth, canvasHeight]);

  return (
    <div
      ref={containerRef}
      onPointerMove={onPtrMove}
      onPointerUp={onPtrUp}
      onPointerDown={(e) => onPtrDown(e, "move")}
      style={{
        position: "absolute",
        left:     pct.left,
        top:      pct.top,
        width:    pct.width,
        height:   pct.height,
        zIndex:   item.z,
        touchAction: "none",
        cursor:   "grab",
      }}
      className={`${isSelected ? "ring-2 ring-mint ring-offset-2 ring-offset-cream" : ""}`}
    >
      {/* Content */}
      <div className="w-full h-full rounded-lg overflow-hidden shadow-md bg-white">
        {item.type === "image" && item.src && (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt=""
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
          </div>
        )}
        {item.type === "color" && item.color && (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1" style={{ background: item.color }} />
            <div className="px-2 py-1 text-[10px] font-mono text-forest/70 bg-white border-t border-sand/30 text-center">
              {item.color}
            </div>
          </div>
        )}
        {item.type === "note" && (
          <div className="w-full h-full flex items-center justify-center p-3 text-forest bg-gradient-to-br from-[#fff8d8] to-[#fdecb0]">
            <p className="text-sm font-sans leading-snug text-center">{item.text}</p>
          </div>
        )}
      </div>

      {/* Delete + resize handles (only when selected) */}
      {isSelected && (
        <>
          <button
            type="button"
            onPointerDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center shadow hover:bg-terracotta/90"
            aria-label="Entfernen"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <div
            onPointerDown={(e) => onPtrDown(e, "resize")}
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center shadow cursor-nwse-resize"
          >
            <span className="w-2 h-2 border-r-2 border-b-2 border-white" style={{ transform: "translate(-1px,-1px)" }} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Inspiration picker ───────────────────────────────────────────────────────

function InspirationPickerModal({
  images, onPick, onClose,
}: {
  images: string[];
  onPick: (src: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-forest/10">
          <h3 className="font-headline text-lg text-forest">Aus Favoriten & Inspiration</h3>
          <button onClick={onClose} className="text-forest/40 hover:text-forest">✕</button>
        </div>
        <div className="p-5">
          {images.length === 0 ? (
            <p className="text-sm text-gray/50 py-8 text-center">
              Noch keine Inspirationsbilder zum Aussuchen.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
              {images.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => onPick(src)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-forest/10 hover:ring-2 hover:ring-mint active:scale-95 transition-all"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
