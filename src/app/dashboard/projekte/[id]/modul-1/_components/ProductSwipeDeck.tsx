"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Star, Heart, Undo2, Check, ExternalLink, Sofa, PartyPopper } from "lucide-react";
import type { Product } from "@/lib/types/product";

// ── Types ────────────────────────────────────────────────────────────────────

export type SwipeAction = "skip" | "list" | "favorite";

interface Decision {
  productId: string;
  action:    SwipeAction;
}

interface Props {
  products:     Product[];
  favoriteIds:  Set<string>;
  lists:        { id: string; name: string }[];
  activeListId: string | null;
  onListChange: (id: string | null) => void;
  onDecision:   (product: Product, action: SwipeAction) => void;
  onUndo:       (decision: Decision) => void;
  matchReason?: (p: Product) => string;
}

// ── Utility ──────────────────────────────────────────────────────────────────

const SWIPE_THRESHOLD_X = 110;
const SWIPE_THRESHOLD_Y = 110;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

// ── Main ────────────────────────────────────────────────────────────────────

export function ProductSwipeDeck({
  products, favoriteIds, lists, activeListId, onListChange,
  onDecision, onUndo, matchReason,
}: Props) {
  const [cursor, setCursor] = useState(0);
  const [history, setHistory] = useState<Decision[]>([]);
  const [flyingOut, setFlyingOut] = useState<{
    productId: string;
    dir: "left" | "right" | "up";
  } | null>(null);

  const deckRef     = useRef<HTMLDivElement>(null);
  const dragStart   = useRef<{ x: number; y: number; id: string } | null>(null);
  const [dragPos, setDragPos] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const current  = products[cursor] ?? null;
  const upcoming = products.slice(cursor + 1, cursor + 3);   // 2 cards behind

  // ── Commit a decision ───────────────────────────────────────
  const commit = useCallback((action: SwipeAction) => {
    if (!current) return;
    const dir = action === "skip" ? "left" : action === "list" ? "right" : "up";
    setFlyingOut({ productId: current.id, dir });
    setHistory((h) => [...h, { productId: current.id, action }]);
    onDecision(current, action);

    // After animation, advance
    setTimeout(() => {
      setFlyingOut(null);
      setCursor((c) => c + 1);
      setDragPos({ dx: 0, dy: 0 });
    }, 320);
  }, [current, onDecision]);

  const undo = useCallback(() => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setCursor((c) => Math.max(0, c - 1));
    setDragPos({ dx: 0, dy: 0 });
    onUndo(last);
  }, [history, onUndo]);

  // ── Pointer drag on top card ────────────────────────────────
  function onPtrDown(e: React.PointerEvent) {
    if (!current || flyingOut) return;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, id: current.id };
  }
  function onPtrMove(e: React.PointerEvent) {
    if (!dragStart.current) return;
    setDragPos({
      dx: e.clientX - dragStart.current.x,
      dy: e.clientY - dragStart.current.y,
    });
  }
  function onPtrUp() {
    if (!dragStart.current) return;
    const { dx, dy } = dragPos;
    dragStart.current = null;

    if (dy < -SWIPE_THRESHOLD_Y && Math.abs(dy) > Math.abs(dx)) {
      commit("favorite");
    } else if (dx > SWIPE_THRESHOLD_X) {
      commit("list");
    } else if (dx < -SWIPE_THRESHOLD_X) {
      commit("skip");
    } else {
      setDragPos({ dx: 0, dy: 0 });
    }
  }

  // ── Keyboard ──────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (e.key === "ArrowLeft")  { e.preventDefault(); commit("skip"); }
      if (e.key === "ArrowRight") { e.preventDefault(); commit("list"); }
      if (e.key === "ArrowUp")    { e.preventDefault(); commit("favorite"); }
      if (e.key === "z" || e.key === "Z") { e.preventDefault(); undo(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [commit, undo]);

  // ── Empty state ───────────────────────────────────────────
  const addedCount = history.filter((h) => h.action === "list").length;
  const favCount   = history.filter((h) => h.action === "favorite").length;
  const isDone     = cursor >= products.length;

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Top bar: list picker + progress */}
      <div className="w-full max-w-md flex items-center justify-between gap-3 text-xs font-sans">
        <div className="flex items-center gap-1.5 text-forest/70 min-w-0">
          <span className="hidden sm:inline">Zur Liste:</span>
          {lists.length > 0 ? (
            <select
              value={activeListId ?? ""}
              onChange={(e) => onListChange(e.target.value || null)}
              className="h-7 px-2 rounded border border-sand/40 bg-white text-xs max-w-[160px] truncate"
            >
              {lists.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          ) : (
            <span className="text-gray/40 italic">Keine Liste vorhanden</span>
          )}
        </div>
        <span className="text-gray/50 tabular-nums whitespace-nowrap">
          {Math.min(cursor, products.length)} / {products.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md h-1 rounded-full bg-sand/20 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-mint to-forest transition-all duration-300"
          style={{ width: `${products.length > 0 ? (cursor / products.length) * 100 : 0}%` }}
        />
      </div>

      {/* Deck */}
      <div
        ref={deckRef}
        className="relative w-full max-w-[300px] sm:max-w-[320px]"
        style={{ aspectRatio: "3 / 4" }}
      >
        {isDone ? (
          <DeckDone count={addedCount} favs={favCount} onReset={() => { setCursor(0); setHistory([]); }} />
        ) : (
          <>
            {/* Background cards */}
            {upcoming.slice().reverse().map((p, idx) => {
              const depth = upcoming.length - idx;   // 1 or 2
              return (
                <DeckCard
                  key={`bg-${p.id}`}
                  product={p}
                  isTop={false}
                  depth={depth}
                  favoriteIds={favoriteIds}
                  matchReason={matchReason}
                />
              );
            })}

            {/* Top card */}
            {current && (
              <div
                onPointerDown={onPtrDown}
                onPointerMove={onPtrMove}
                onPointerUp={onPtrUp}
                className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
                style={{
                  transform: flyingOut
                    ? flyOutTransform(flyingOut.dir)
                    : `translate(${dragPos.dx}px, ${dragPos.dy}px) rotate(${clamp(dragPos.dx / 18, -18, 18)}deg)`,
                  transition: dragStart.current ? "none" : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
                  willChange: "transform",
                }}
              >
                <DeckCard
                  product={current}
                  isTop
                  depth={0}
                  favoriteIds={favoriteIds}
                  matchReason={matchReason}
                  dragDx={dragPos.dx}
                  dragDy={dragPos.dy}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      {!isDone && (
        <div className="flex items-center justify-center gap-3 mt-1">
          <ActionButton
            tint="gray"    Icon={Undo2} onClick={undo} disabled={history.length === 0}
            label="Rückgängig (Z)"
          />
          <ActionButton
            tint="red"     Icon={X}    onClick={() => commit("skip")}
            label="Skip (←)" size="lg"
          />
          <ActionButton
            tint="gold"    Icon={Star} onClick={() => commit("favorite")}
            label="Favorit (↑)"
          />
          <ActionButton
            tint="green"   Icon={Heart} onClick={() => commit("list")}
            label="Zur Liste (→)" size="lg"
          />
        </div>
      )}

      {/* Keyboard hint */}
      {!isDone && products.length > 1 && (
        <p className="text-[10px] text-gray/40 text-center font-sans">
          ← Skip &nbsp;·&nbsp; → Liste &nbsp;·&nbsp; ↑ Favorit &nbsp;·&nbsp; Z Rückgängig
        </p>
      )}
    </div>
  );
}

// ── Deck Card ───────────────────────────────────────────────────────────────

function DeckCard({
  product, isTop, depth, favoriteIds, matchReason, dragDx = 0, dragDy = 0,
}: {
  product:     Product;
  isTop:       boolean;
  depth:       number;
  favoriteIds: Set<string>;
  matchReason?:(p: Product) => string;
  dragDx?:     number;
  dragDy?:     number;
}) {
  const reason  = matchReason ? matchReason(product) : null;
  const isFav   = favoriteIds.has(product.id);

  // Drag direction overlays
  const showLeft   = isTop && dragDx < -30;
  const showRight  = isTop && dragDx > 30 && Math.abs(dragDy) < Math.abs(dragDx);
  const showUp     = isTop && dragDy < -30 && Math.abs(dragDy) > Math.abs(dragDx);

  const bgScale = 1 - depth * 0.04;
  const bgOffset = depth * 8;

  return (
    <div
      className="absolute inset-0 rounded-3xl overflow-hidden bg-white border border-forest/10 shadow-xl"
      style={isTop ? undefined : {
        transform: `scale(${bgScale}) translateY(${bgOffset}px)`,
        filter: `brightness(${1 - depth * 0.08})`,
        pointerEvents: "none",
      }}
    >
      {/* Image */}
      <div className="relative w-full h-[70%] bg-sand/10 overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            draggable={false}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-forest/25">
            <Sofa className="w-16 h-16" strokeWidth={1.25} />
          </div>
        )}

        {/* Direction overlays */}
        <Overlay show={showLeft}  color="terracotta" label="NOPE"    rotation="-20deg" corner="tl" />
        <Overlay show={showRight} color="mint"       label="LISTE"   rotation="20deg"  corner="tr" />
        <Overlay show={showUp}    color="amber"      label="FAVORIT" rotation="0deg"   corner="top" />

        {/* Fav indicator */}
        {isFav && (
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" strokeWidth={0} />
          </div>
        )}

        {/* Match reason badge */}
        {reason && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest/80 backdrop-blur text-white text-[10px] font-semibold uppercase tracking-wider">
            <Check className="w-3 h-3" strokeWidth={2.5} />
            {reason}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1">
        {product.partner && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-sand font-semibold">
            {product.partner}
          </p>
        )}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-forest leading-tight line-clamp-2 flex-1">
            {product.name}
          </p>
          {product.price != null && (
            <p className="text-sm font-mono font-bold text-forest shrink-0">
              {product.price.toLocaleString("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0 })}
            </p>
          )}
        </div>
        {product.affiliate_url && (
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-forest/50 hover:text-forest"
          >
            Zum Produkt <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Overlay label ──────────────────────────────────────────────────────────

function Overlay({
  show, color, label, rotation, corner,
}: {
  show: boolean;
  color: "mint" | "terracotta" | "amber";
  label: string;
  rotation: string;
  corner: "tl" | "tr" | "top";
}) {
  const colorMap = {
    mint:       { border: "border-mint",       text: "text-forest",     bg: "bg-mint/15"     },
    terracotta: { border: "border-terracotta", text: "text-terracotta", bg: "bg-terracotta/15"},
    amber:      { border: "border-amber-500",  text: "text-amber-600",  bg: "bg-amber-400/15"},
  } as const;

  const positionClass =
    corner === "tl"  ? "top-4 left-4" :
    corner === "tr"  ? "top-4 right-4" :
                       "top-4 left-1/2 -translate-x-1/2";

  return (
    <div
      className={`absolute ${positionClass} px-4 py-1.5 rounded-lg border-4 bg-white/60 backdrop-blur ${colorMap[color].border} ${colorMap[color].text} ${colorMap[color].bg} font-headline text-2xl tracking-widest uppercase transition-opacity duration-100`}
      style={{
        opacity:   show ? 1 : 0,
        transform: `rotate(${rotation})`,
      }}
    >
      {label}
    </div>
  );
}

// ── Action button ──────────────────────────────────────────────────────────

function ActionButton({
  Icon, tint, onClick, label, disabled, size = "md",
}: {
  Icon:     React.ElementType;
  tint:     "red" | "gold" | "green" | "gray";
  onClick:  () => void;
  label:    string;
  disabled?:boolean;
  size?:    "md" | "lg";
}) {
  const tintStyle: Record<typeof tint, string> = {
    red:   "border-terracotta/40 text-terracotta hover:bg-terracotta/10 hover:border-terracotta",
    gold:  "border-amber-400/50 text-amber-600 hover:bg-amber-50 hover:border-amber-500",
    green: "border-mint/60 text-forest hover:bg-mint/20 hover:border-forest",
    gray:  "border-sand/30 text-gray/50 hover:bg-sand/10 hover:text-forest",
  };
  const sizeClass = size === "lg" ? "w-14 h-14" : "w-12 h-12";
  const iconSize  = size === "lg" ? "w-6 h-6"   : "w-5 h-5";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${sizeClass} rounded-full border-2 bg-white shadow-md flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none active:scale-90 hover:scale-105 ${tintStyle[tint]}`}
    >
      <Icon className={iconSize} strokeWidth={2} />
    </button>
  );
}

// ── Deck done ──────────────────────────────────────────────────────────────

function DeckDone({ count, favs, onReset }: { count: number; favs: number; onReset: () => void }) {
  return (
    <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-forest/20 bg-gradient-to-br from-cream to-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-mint/20 flex items-center justify-center mb-3 wbc-swipe-pop">
        <PartyPopper className="w-7 h-7 text-forest" strokeWidth={1.5} />
      </div>
      <h3 className="font-headline text-xl text-forest mb-1">Alle Empfehlungen durch!</h3>
      <p className="text-xs text-gray/60 mb-4">
        {count} zur Liste &nbsp;·&nbsp; {favs} als Favorit
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-forest/25 text-xs text-forest hover:bg-forest/5"
      >
        <Undo2 className="w-3 h-3" /> Nochmal ansehen
      </button>
      <style jsx>{`
        @keyframes wbc-swipe-pop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .wbc-swipe-pop { animation: wbc-swipe-pop 500ms cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </div>
  );
}

// ── Utils ──────────────────────────────────────────────────────────────────

function flyOutTransform(dir: "left" | "right" | "up"): string {
  switch (dir) {
    case "left":  return "translate(-150%, 30%) rotate(-28deg)";
    case "right": return "translate( 150%, 30%) rotate( 28deg)";
    case "up":    return "translate(0, -140%) scale(0.9)";
  }
}

