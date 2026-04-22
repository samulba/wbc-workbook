"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { Heart, ExternalLink, ShoppingBag, Check, LayoutGrid, Layers, Sofa } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getProductRecommendations,
  toggleFavorite,
} from "@/app/actions/recommendations";
import { addProductToList } from "@/app/actions/shopping";
import type { Product } from "@/lib/types/product";
import { ProductSwipeDeck, type SwipeAction } from "./ProductSwipeDeck";

interface Props {
  roomType:   string;
  mainEffect?: string | null;
  roomId:     string | null;
  heading?:   string;
  /** Only show once an effect is selected (for Step 4) */
  requireEffect?: boolean;
}

interface State {
  products:    Product[];
  favoriteIds: Set<string>;
  loaded:      boolean;
}

// ── Individual product card ───────────────────────────────────────────────────
function ProductCard({
  product,
  isFavorite,
  onToggle,
}: {
  product:   Product;
  isFavorite: boolean;
  onToggle:  () => void;
}) {
  const [heartPop, setHeartPop] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  function handleHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setHeartPop(true);
    onToggle();
    setTimeout(() => setHeartPop(false), 300);
  }

  function handleCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCartOpen((v) => !v);
  }

  useEffect(() => {
    if (!cartOpen) return;
    function onDown(e: PointerEvent) {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) setCartOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [cartOpen]);

  return (
    <a
      href={product.affiliate_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group shrink-0 w-40 sm:w-44 flex flex-col",
        "rounded-2xl border border-sand/25 bg-white",
        "shadow-sm hover:shadow-[0_4px_20px_rgba(68,92,73,0.12)]",
        "transition-all duration-200 hover:-translate-y-0.5",
        "overflow-hidden"
      )}
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-sand/8 overflow-hidden shrink-0">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sand/10 text-forest/30">
            <Sofa className="w-8 h-8" strokeWidth={1.25} />
          </div>
        )}

        {/* Top-right actions */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {/* Cart button */}
          <div ref={cartRef} className="relative">
            <button
              type="button"
              onClick={handleCart}
              className={cn(
                "w-9 h-9 sm:w-7 sm:h-7 rounded-full flex items-center justify-center",
                "bg-white/85 backdrop-blur-sm border border-white/60 shadow-sm",
                "transition-all duration-150",
                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              )}
              aria-label="Zur Shopping-Liste hinzufügen"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-forest/60" strokeWidth={1.5} />
            </button>
            {cartOpen && (
              <ShoppingListPicker productId={product.id} onClose={() => setCartOpen(false)} />
            )}
          </div>

          {/* Heart button */}
          <button
            type="button"
            onClick={handleHeart}
            className={cn(
              "w-9 h-9 sm:w-7 sm:h-7 rounded-full flex items-center justify-center",
              "bg-white/85 backdrop-blur-sm border border-white/60 shadow-sm",
              "transition-all duration-150",
              heartPop && "scale-125",
              isFavorite ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            )}
            aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                isFavorite ? "fill-terracotta text-terracotta" : "text-forest/50"
              )}
              strokeWidth={isFavorite ? 0 : 1.5}
            />
          </button>
        </div>

        {/* Fit badge */}
        <span className={cn(
          "absolute bottom-2 left-2",
          "text-[9px] font-sans font-semibold uppercase tracking-[0.12em]",
          "bg-forest/80 backdrop-blur-sm text-white/90",
          "px-2 py-0.5 rounded-full",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        )}>
          Passt zu dir
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {product.partner && (
          <p className="text-[9px] font-sans uppercase tracking-[0.15em] text-sand truncate">
            {product.partner}
          </p>
        )}
        <p className="text-[13px] font-sans font-medium text-forest leading-snug line-clamp-2">
          {product.name}
        </p>
        {product.price && (
          <p className="text-xs font-sans text-gray/50 mt-auto pt-1">
            ab {product.price.toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 0,
            })}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <ExternalLink className="w-2.5 h-2.5 text-sand/60 shrink-0" strokeWidth={1.5} />
          <span className="text-[9px] text-sand/60 font-sans">Zum Produkt</span>
        </div>
      </div>
    </a>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ProductRecommendations({
  roomType,
  mainEffect,
  roomId,
  heading = "Produktempfehlungen",
  requireEffect = false,
}: Props) {
  const [state, setState] = useState<State>({
    products: [], favoriteIds: new Set(), loaded: false,
  });
  const [, startTransition] = useTransition();

  const fetchProducts = useCallback(() => {
    getProductRecommendations({ roomType, mainEffect }).then(
      ({ products, favoriteIds }) => {
        setState({
          products,
          favoriteIds: new Set(favoriteIds),
          loaded: true,
        });
      }
    );
  }, [roomType, mainEffect]);

  useEffect(() => {
    if (requireEffect && !mainEffect) {
      setState((s) => ({ ...s, loaded: true, products: [] }));
      return;
    }
    fetchProducts();
  }, [fetchProducts, requireEffect, mainEffect]);

  function handleToggle(product: Product) {
    const wasFavorite = state.favoriteIds.has(product.id);

    // Optimistic update
    setState((prev) => {
      const next = new Set(prev.favoriteIds);
      if (wasFavorite) next.delete(product.id);
      else next.add(product.id);
      return { ...prev, favoriteIds: next };
    });

    startTransition(async () => {
      const result = await toggleFavorite(product.id, roomId);
      if (!result.ok) {
        // Revert on error
        setState((prev) => {
          const next = new Set(prev.favoriteIds);
          if (wasFavorite) next.add(product.id);
          else next.delete(product.id);
          return { ...prev, favoriteIds: next };
        });
      }
    });
  }

  // ── Toggle view: swipe vs grid ─────────────────────────────
  const [view, setView] = useState<"swipe" | "grid">("grid");
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Initialize view from viewport on mount (mobile → swipe)
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("wbc_reco_view") : null;
    if (saved === "swipe" || saved === "grid") {
      setView(saved);
    } else if (typeof window !== "undefined" && window.innerWidth < 640) {
      setView("swipe");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("wbc_reco_view", view);
  }, [view]);

  // Load shopping lists (for swipe-list target)
  useEffect(() => {
    fetch("/api/shopping/lists")
      .then((r) => r.json())
      .then((d) => {
        const ls = d.lists ?? [];
        setLists(ls);
        if (ls.length > 0 && !activeListId) setActiveListId(ls[0].id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flashToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  }

  const handleSwipeDecision = useCallback((product: Product, action: SwipeAction) => {
    if (action === "favorite") {
      // Toggle favorite if not already
      if (!state.favoriteIds.has(product.id)) {
        handleToggle(product);
      }
      flashToast("⭐ Zu Favoriten");
    } else if (action === "list") {
      if (!activeListId) {
        flashToast("Keine Shopping-Liste — erstelle zuerst eine.");
        return;
      }
      startTransition(async () => {
        await addProductToList({ listId: activeListId, productId: product.id }).catch(() => {});
      });
      flashToast("Zur Liste hinzugefügt");
    }
    // skip: no-op besides advancing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeListId, state.favoriteIds, handleToggle]);

  const handleSwipeUndo = useCallback((d: { productId: string; action: SwipeAction }) => {
    // Reverse favorite for undo; list/skip undo is soft (we don't remove from list
    // because that'd be surprising — user can remove in /dashboard/shopping)
    if (d.action === "favorite") {
      const p = state.products.find((x) => x.id === d.productId);
      if (p && state.favoriteIds.has(p.id)) handleToggle(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.products, state.favoriteIds, handleToggle]);

  // ── Don't render until loaded, and only if there are products ─
  if (!state.loaded || state.products.length === 0) return null;

  return (
    <div className="pt-6 mt-2 relative">
      {/* Section separator + view toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-sand/25" />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-mint/70" />
          <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-sand/80">
            {heading}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-mint/70" />
        </div>
        <div className="flex-1 h-px bg-sand/25" />
        {/* View toggle */}
        <div className="shrink-0 inline-flex rounded-full bg-sand/15 p-0.5 text-[10px]">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors",
              view === "grid" ? "bg-white text-forest shadow-sm" : "text-forest/50 hover:text-forest",
            )}
            aria-label="Grid-Ansicht"
          >
            <LayoutGrid className="w-3 h-3" strokeWidth={1.75} />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setView("swipe")}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors",
              view === "swipe" ? "bg-white text-forest shadow-sm" : "text-forest/50 hover:text-forest",
            )}
            aria-label="Swipe-Modus"
          >
            <Layers className="w-3 h-3" strokeWidth={1.75} />
            <span className="hidden sm:inline">Swipe</span>
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <>
          <div
            className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {state.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={state.favoriteIds.has(product.id)}
                onToggle={() => handleToggle(product)}
              />
            ))}
          </div>
          {state.products.length > 2 && (
            <p className="text-[10px] text-sand/50 font-sans text-right mt-1 pr-1">
              Zum Scrollen wischen →
            </p>
          )}
        </>
      ) : (
        <ProductSwipeDeck
          products={state.products}
          favoriteIds={state.favoriteIds}
          lists={lists}
          activeListId={activeListId}
          onListChange={setActiveListId}
          onDecision={handleSwipeDecision}
          onUndo={handleSwipeUndo}
          matchReason={mainEffect ? () => "Passt zu deiner Wirkung" : undefined}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-forest text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium wbc-reco-toast">
          {toast}
        </div>
      )}

      <style jsx>{`
        @keyframes wbc-reco-toast {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        :global(.wbc-reco-toast) { animation: wbc-reco-toast 220ms cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </div>
  );
}

// ── Shopping list picker popover ──────────────────────────────────────────────
function ShoppingListPicker({ productId, onClose }: { productId: string; onClose: () => void }) {
  const [lists, setLists]     = useState<{ id: string; name: string }[] | null>(null);
  const [status, setStatus]   = useState<"idle" | "adding" | "success">("idle");
  const [error, setError]     = useState<string | null>(null);
  const [, startTransition]   = useTransition();

  useEffect(() => {
    fetch("/api/shopping/lists")
      .then((r) => r.json())
      .then((d) => setLists(d.lists ?? []))
      .catch(() => setLists([]));
  }, []);

  function add(listId: string) {
    setStatus("adding");
    setError(null);
    startTransition(async () => {
      const res = await addProductToList({ listId, productId });
      if (!res.ok) { setError(res.error); setStatus("idle"); return; }
      setStatus("success");
      setTimeout(onClose, 1200);
    });
  }

  return (
    <div
      className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-sand/30 rounded-xl shadow-lg z-20 overflow-hidden"
      onClick={(e) => e.preventDefault()}
    >
      <div className="px-3 py-2 border-b border-sand/20 flex items-center gap-1.5">
        <ShoppingBag className="w-3 h-3 text-forest" strokeWidth={2} />
        <p className="text-[11px] font-sans font-semibold uppercase tracking-wider text-forest">
          Zur Liste
        </p>
      </div>

      {status === "success" ? (
        <div className="p-4 flex items-center justify-center gap-1.5 text-xs text-mint">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          Hinzugefügt!
        </div>
      ) : lists === null ? (
        <p className="px-3 py-4 text-xs text-sand/60 text-center">Lade …</p>
      ) : lists.length === 0 ? (
        <div className="p-3">
          <p className="text-xs text-sand/70 mb-2">Noch keine Liste angelegt.</p>
          <a
            href="/dashboard/shopping"
            className="block text-center text-xs text-white bg-forest px-3 py-1.5 rounded-lg font-medium hover:bg-forest/90"
          >
            Erste Liste erstellen
          </a>
        </div>
      ) : (
        <ul className="max-h-48 overflow-y-auto">
          {lists.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => add(l.id)}
                disabled={status === "adding"}
                className="w-full text-left px-3 py-2 text-xs text-forest hover:bg-mint/15 transition-colors disabled:opacity-50 truncate"
              >
                {l.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="px-3 py-2 text-[11px] text-terracotta">{error}</p>}
    </div>
  );
}
