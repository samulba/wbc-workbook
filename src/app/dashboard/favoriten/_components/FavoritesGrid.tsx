"use client";

import { useState, useTransition, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { Heart, ExternalLink, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { removeFavorite } from "@/app/actions/favorites";
import type { FavoriteItem } from "@/app/actions/favorites";

// ── Effect detection ──────────────────────────────────────────────────────────

const EFFECT_MAP: Record<string, { label: string; color: string; bg: string }> = {
  "ruhe erholung":          { label: "Ruhe & Erholung",          color: "text-forest",          bg: "bg-mint/20 border-mint/40"         },
  "fokus konzentration":    { label: "Fokus & Konzentration",    color: "text-[#3d5a68]",        bg: "bg-[#e9eff2] border-[#c0d0d8]/60"  },
  "energie aktivität":      { label: "Energie & Aktivität",      color: "text-terracotta",       bg: "bg-terracotta/10 border-terracotta/25" },
  "kreativität inspiration":{ label: "Kreativität & Inspiration",color: "text-[#8a6030]",        bg: "bg-sand/25 border-sand/50"         },
  "begegnung austausch":    { label: "Begegnung & Austausch",    color: "text-forest",           bg: "bg-forest/8 border-forest/20"      },
};

function detectEffect(tags: string[]) {
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    for (const [key, meta] of Object.entries(EFFECT_MAP)) {
      if (lower === key || lower.includes(key)) return { key, ...meta };
    }
  }
  return null;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 px-5 py-3 rounded-xl",
        "bg-forest text-white text-sm font-sans shadow-xl",
        "animate-in fade-in slide-in-from-bottom-2 duration-200"
      )}
    >
      <Heart className="w-4 h-4 text-mint shrink-0" strokeWidth={1.5} />
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

function FavoriteCard({
  item,
  removing,
  onRemove,
}: {
  item:     FavoriteItem;
  removing: boolean;
  onRemove: () => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { product } = item;
  const effect = detectEffect(product.tags ?? []);

  const price = product.price
    ? product.price.toLocaleString("de-DE", {
        style:                 "currency",
        currency:              "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : null;

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-sand/25 bg-white overflow-hidden",
        "shadow-[0_2px_12px_rgba(68,92,73,0.06)] hover:shadow-[0_4px_24px_rgba(68,92,73,0.12)]",
        "transition-all duration-300",
        removing && "opacity-0 scale-95 pointer-events-none"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-sand/8 overflow-hidden group">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-sand/10 to-mint/5">
            <ShoppingBag className="w-10 h-10 text-sand/40" strokeWidth={1} />
            <span className="text-xs text-sand/50 font-sans">Kein Bild</span>
          </div>
        )}

        {/* Category badge */}
        {product.category && (
          <span className="absolute top-3 left-3 text-[10px] font-sans font-semibold uppercase tracking-wider bg-white/85 backdrop-blur-sm text-forest/70 px-2.5 py-1 rounded-full border border-white/60 shadow-sm">
            {product.category}
          </span>
        )}

        {/* Remove button */}
        {confirmRemove ? (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-md px-2 py-1 border border-red-100">
            <span className="text-[10px] text-red-500 font-medium pl-0.5">Entfernen?</span>
            <button
              type="button"
              onClick={onRemove}
              className="text-[10px] font-semibold text-white bg-red-500 rounded-full px-2 py-0.5 hover:bg-red-600 transition-colors"
            >
              Ja
            </button>
            <button
              type="button"
              onClick={() => setConfirmRemove(false)}
              className="text-[10px] font-semibold text-gray/60 rounded-full px-1.5 py-0.5 hover:text-forest transition-colors"
            >
              Nein
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm border border-white/60 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            title="Aus Favoriten entfernen"
          >
            <Heart className="w-4 h-4 fill-terracotta text-terracotta" strokeWidth={0} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Effect badge */}
        {effect && (
          <span className={cn(
            "self-start text-[10px] font-sans font-semibold uppercase tracking-wider",
            "px-2.5 py-1 rounded-full border",
            effect.bg, effect.color
          )}>
            Passt zu: {effect.label}
          </span>
        )}

        {/* Name + partner */}
        <div>
          {product.partner && (
            <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-sand mb-1">
              {product.partner}
            </p>
          )}
          <h3 className="font-sans font-semibold text-forest leading-snug text-[15px]">
            {product.name}
          </h3>
          {product.why_fits && (
            <p className="text-xs text-gray/55 font-sans leading-relaxed mt-1.5 line-clamp-2">
              {product.why_fits}
            </p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex flex-col gap-2.5">
          {price && (
            <p className="text-lg font-sans font-bold text-forest/80 tabular-nums">
              {price}
            </p>
          )}

          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-2",
              "w-full px-4 py-2.5 rounded-xl text-sm font-sans font-medium",
              "border-2 border-forest/25 text-forest",
              "hover:bg-forest hover:text-white hover:border-forest",
              "transition-all duration-200 group/btn"
            )}
          >
            <span>Zum Shop</span>
            <ExternalLink
              className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 transition-opacity"
              strokeWidth={1.5}
            />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main grid component ───────────────────────────────────────────────────────

interface Props {
  initialItems: FavoriteItem[];
}

export function FavoritesGrid({ initialItems }: Props) {
  const [items,       setItems]       = useState(initialItems);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [toast,       setToast]       = useState<string | null>(null);
  const [filterEffect, setFilterEffect] = useState<string>("all");
  const [filterCat,    setFilterCat]    = useState<string>("all");
  const [, startTransition] = useTransition();

  const dismissToast = useCallback(() => setToast(null), []);

  // ── Derived filter options ────────────────────────────────────
  const presentEffects = useMemo(() => {
    const seen = new Set<string>();
    items.forEach((item) => {
      const e = detectEffect(item.product.tags ?? []);
      if (e) seen.add(e.key);
    });
    return Array.from(seen);
  }, [items]);

  const presentCategories = useMemo(() =>
    Array.from(new Set(items.map((i) => i.product.category).filter(Boolean) as string[])).sort(),
  [items]);

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filterEffect !== "all") {
        const e = detectEffect(item.product.tags ?? []);
        if (!e || e.key !== filterEffect) return false;
      }
      if (filterCat !== "all" && item.product.category !== filterCat) return false;
      return true;
    });
  }, [items, filterEffect, filterCat]);

  // ── Remove handler ────────────────────────────────────────────
  function handleRemove(item: FavoriteItem) {
    const { id: favId, product } = item;

    // Start fade-out
    setRemovingIds((prev) => new Set(Array.from(prev).concat(favId)));

    // Remove from local state after animation
    setTimeout(() => {
      setItems((prev) => prev.filter((f) => f.id !== favId));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(favId);
        return next;
      });
      setToast("Produkt aus Favoriten entfernt");
    }, 300);

    // Server action (fire-and-forget; user can refresh on error)
    startTransition(async () => {
      await removeFavorite(product.id);
    });
  }

  // ── Empty state ───────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
        <div className="w-20 h-20 rounded-full bg-sand/15 border-2 border-dashed border-sand/40 flex items-center justify-center">
          <Heart className="w-9 h-9 text-sand/50" strokeWidth={1} />
        </div>
        <div>
          <h3 className="font-headline text-2xl text-forest mb-2">Noch keine Favoriten</h3>
          <p className="text-sm text-gray/55 font-sans max-w-xs leading-relaxed">
            Entdecke passende Produkte in deinem Raumkonzept – das Herz-Icon speichert sie hier.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="mt-2 px-5 py-2.5 rounded-xl bg-forest text-white text-sm font-sans font-medium hover:bg-forest/90 transition-colors"
        >
          Zum Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      {(presentEffects.length > 1 || presentCategories.length > 1) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Effect filter */}
          {presentEffects.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilterEffect("all")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-sans font-medium border transition-colors",
                  filterEffect === "all"
                    ? "bg-forest text-white border-forest"
                    : "bg-white text-gray/60 border-sand/30 hover:border-forest/40 hover:text-forest"
                )}
              >
                Alle
              </button>
              {presentEffects.map((key) => {
                const meta = EFFECT_MAP[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilterEffect(key)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-sans font-medium border transition-colors",
                      filterEffect === key
                        ? "bg-forest text-white border-forest"
                        : "bg-white text-gray/60 border-sand/30 hover:border-forest/40 hover:text-forest"
                    )}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Category filter */}
          {presentCategories.length > 1 && (
            <div className="flex flex-wrap gap-1.5 ml-auto">
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="px-3 py-1.5 rounded-full text-xs font-sans bg-white border border-sand/30 text-gray/60 outline-none focus:border-forest/40 cursor-pointer"
              >
                <option value="all">Alle Kategorien</option>
                {presentCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Result count */}
      {filtered.length !== items.length && (
        <p className="text-xs text-gray/40 font-sans mb-4">
          {filtered.length} von {items.length} Favoriten
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray/45 font-sans">Keine Favoriten für diesen Filter.</p>
          <button
            type="button"
            onClick={() => { setFilterEffect("all"); setFilterCat("all"); }}
            className="mt-3 text-xs text-forest/60 underline underline-offset-2 hover:text-forest transition-colors"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <FavoriteCard
              key={item.id}
              item={item}
              removing={removingIds.has(item.id)}
              onRemove={() => handleRemove(item)}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast} onClose={dismissToast} />
      )}
    </>
  );
}
