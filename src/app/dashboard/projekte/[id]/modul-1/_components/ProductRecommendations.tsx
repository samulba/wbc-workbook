"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getProductRecommendations,
  toggleFavorite,
} from "@/app/actions/recommendations";
import type { Product } from "@/lib/types/product";

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

  function handleHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setHeartPop(true);
    onToggle();
    setTimeout(() => setHeartPop(false), 300);
  }

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
          <div className="w-full h-full flex items-center justify-center bg-sand/10">
            <span className="text-3xl opacity-40">🛋️</span>
          </div>
        )}

        {/* Heart button */}
        <button
          type="button"
          onClick={handleHeart}
          className={cn(
            "absolute top-2 right-2",
            "w-9 h-9 sm:w-7 sm:h-7 rounded-full flex items-center justify-center",
            "bg-white/85 backdrop-blur-sm border border-white/60",
            "shadow-sm transition-all duration-150",
            heartPop && "scale-125",
            // Always visible on mobile (no hover on touch), hover-reveal on desktop
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

  // Don't render until loaded, and only if there are products
  if (!state.loaded || state.products.length === 0) return null;

  return (
    <div className="pt-6 mt-2">
      {/* Section separator */}
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
      </div>

      {/* Horizontal scroll */}
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

      {/* Scroll hint (only if more than 2 cards) */}
      {state.products.length > 2 && (
        <p className="text-[10px] text-sand/50 font-sans text-right mt-1 pr-1">
          Zum Scrollen wischen →
        </p>
      )}
    </div>
  );
}
