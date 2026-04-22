"use client";

import { Heart, ExternalLink, Sparkles, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { Module2Data, FurnitureFavorite } from "@/lib/types/module2";

interface Props {
  data:     Module2Data;
  onChange: (patch: Partial<Module2Data>) => void;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function Step06({ data, onChange }: Props) {
  const favorites = data.furniture_favorites ?? [];

  function add() {
    onChange({
      furniture_favorites: [
        ...favorites,
        { id: uid(), title: "", affiliateUrl: "" },
      ],
    });
  }
  function update(id: string, patch: Partial<FurnitureFavorite>) {
    onChange({
      furniture_favorites: favorites.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  }
  function remove(id: string) {
    onChange({ furniture_favorites: favorites.filter((f) => f.id !== id) });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-forest" strokeWidth={1.5} fill="currentColor" fillOpacity={0.15} />
          <h3 className="font-headline text-lg text-forest">Deine Möbel-Wunschliste</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Sammle hier konkrete Produkte, die dir gefallen — mit Link, Titel und optional einem Bild.
          Das wird später die Basis für dein Budget und deinen Einkauf.
        </p>
        <p className="text-[11px] text-gray/45 font-sans mt-2 italic">
          Volle Produkt-Datenbank mit Swipe-Deck folgt in einem späteren Update.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {favorites.length === 0 && (
          <div className="rounded-xl border border-dashed border-sand/50 px-5 py-6 text-center">
            <Sparkles className="w-5 h-5 text-sand mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm text-gray/55 font-sans">
              Noch leer — füge dein erstes Wunschstück hinzu.
            </p>
          </div>
        )}

        {favorites.map((f) => (
          <div key={f.id} className="rounded-xl border border-sand/40 bg-white p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Input
                placeholder="Titel, z. B. Muuto Oslo Sofa"
                value={f.title}
                onChange={(e) => update(f.id, { title: e.target.value })}
              />
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                aria-label="Entfernen"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <Input
              placeholder="Link zum Produkt (https://…)"
              value={f.affiliateUrl}
              onChange={(e) => update(f.id, { affiliateUrl: e.target.value })}
            />
            <Input
              placeholder="Bild-URL (optional)"
              value={f.imageUrl ?? ""}
              onChange={(e) => update(f.id, { imageUrl: e.target.value })}
            />
            {f.affiliateUrl && (
              <a
                href={f.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 self-start text-[11px] font-sans text-forest/60 hover:text-forest transition-colors"
              >
                Link öffnen
                <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
              </a>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="self-start inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-dashed border-forest/30 bg-white hover:border-forest/50 text-sm font-sans text-forest/70 transition"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          Wunschstück hinzufügen
        </button>
      </div>
    </div>
  );
}
