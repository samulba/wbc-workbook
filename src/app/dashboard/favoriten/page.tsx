import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { getUserFavorites } from "@/app/actions/favorites";
import { FavoritesGrid } from "./_components/FavoritesGrid";

export const dynamic  = "force-dynamic";
export const metadata: Metadata = { title: "Favoriten – Wellbeing Workbook" };

export default async function FavoritenPage() {
  const items = await getUserFavorites();

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10 pb-20">

      {/* ── Page header ──────────────────────────────────────────── */}
      <section className="pb-10 border-b border-sand/30 mb-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-terracotta/10 border border-terracotta/20 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-terracotta text-terracotta" strokeWidth={0} />
              </div>
              <span className="text-xs font-sans uppercase tracking-[0.2em] text-sand">
                Merkliste
              </span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl text-forest leading-none">
              Deine gemerkten
              <br />
              <span className="text-terracotta/80">Produkte</span>
            </h1>
            <p className="mt-4 text-gray/60 font-sans text-base leading-relaxed max-w-md">
              Produkte, die zu deinem Raumkonzept passen – gespeichert für deinen nächsten Einkauf.
            </p>
          </div>

          {/* Decorative accent */}
          <div className="flex gap-1.5 shrink-0 self-center pt-4 pr-2 hidden md:flex">
            <div className="w-1.5 h-14 rounded-full bg-terracotta/40" />
            <div className="w-1.5 h-9  rounded-full bg-sand/60 self-end" />
            <div className="w-1.5 h-11 rounded-full bg-mint/60 self-center" />
          </div>
        </div>

        {/* Count strip */}
        {items.length > 0 && (
          <div className="flex items-center gap-3 mt-6">
            <span className="font-headline text-3xl text-forest/30 leading-none">
              {items.length}
            </span>
            <span className="text-sm text-gray/50 font-sans">
              {items.length === 1 ? "gemerktes Produkt" : "gemerkte Produkte"}
            </span>
            <div className="flex-1 h-px bg-sand/20 ml-2" />
          </div>
        )}
      </section>

      {/* ── Grid / Empty state ────────────────────────────────────── */}
      <FavoritesGrid initialItems={items} />

    </div>
  );
}
