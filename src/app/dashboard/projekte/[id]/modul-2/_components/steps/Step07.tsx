"use client";

import { useState } from "react";
import { LayoutGrid, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Module2Data, LayoutPlacement } from "@/lib/types/module2";

const COLS = 6;
const ROWS = 4;

interface Props {
  data:     Module2Data;
  onChange: (patch: Partial<Module2Data>) => void;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function Step07({ data, onChange }: Props) {
  const placements = data.layout_canvas ?? [];
  const [draft, setDraft] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function addPiece() {
    const label = draft.trim();
    if (!label) return;
    const newItem: LayoutPlacement = { id: uid(), label, gridX: 0, gridY: 0 };
    onChange({ layout_canvas: [...placements, newItem] });
    setDraft("");
    setSelectedId(newItem.id);
  }

  function moveSelected(x: number, y: number) {
    if (!selectedId) return;
    onChange({
      layout_canvas: placements.map((p) =>
        p.id === selectedId ? { ...p, gridX: x, gridY: y } : p,
      ),
    });
  }

  function removeSelected(id: string) {
    onChange({ layout_canvas: placements.filter((p) => p.id !== id) });
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Layout skizzieren</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Füge Möbel als kleine Blöcke hinzu und klicke dann auf das gewünschte Feld, um sie zu platzieren.
          Keine exakten Maße — es geht um eine schnelle Anordnungs-Skizze.
        </p>
      </div>

      {/* Add-row */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Möbelstück, z. B. Sofa, Esstisch, Bett …"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPiece(); } }}
        />
        <button
          type="button"
          onClick={addPiece}
          disabled={!draft.trim()}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-forest text-cream text-sm font-sans font-medium hover:bg-forest/90 transition-colors disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          Hinzufügen
        </button>
      </div>

      {/* Pieces */}
      {placements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {placements.map((p) => {
            const active = selectedId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(active ? null : p.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-sans transition",
                  active
                    ? "bg-forest text-cream border-forest"
                    : "bg-white border-sand/40 text-forest/70 hover:border-forest/30",
                )}
              >
                {p.label}
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); removeSelected(p.id); }}
                  className="hover:text-red-400 transition-colors"
                  aria-label="Entfernen"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-sand mb-2 font-sans">
          Grundriss (Skizze) — {selectedId ? "Klicke auf ein Feld, um zu platzieren" : "Wähle zuerst ein Möbel oben aus"}
        </p>
        <div
          className="rounded-xl border border-sand/40 bg-cream p-2 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, aspectRatio: `${COLS}/${ROWS}` }}
        >
          {Array.from({ length: COLS * ROWS }).map((_, idx) => {
            const x = idx % COLS;
            const y = Math.floor(idx / COLS);
            const here = placements.filter((p) => p.gridX === x && p.gridY === y);
            const canPlace = !!selectedId;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => canPlace && moveSelected(x, y)}
                disabled={!canPlace}
                className={cn(
                  "relative rounded-md border text-[10px] font-sans flex items-center justify-center text-center p-1 overflow-hidden",
                  here.length > 0
                    ? "bg-forest/10 border-forest/40 text-forest"
                    : canPlace
                      ? "bg-white border-sand/30 hover:bg-mint/10 hover:border-forest/40 cursor-pointer"
                      : "bg-white border-sand/30 cursor-not-allowed opacity-70",
                )}
              >
                {here.length > 0 && (
                  <span className="truncate leading-tight">
                    {here.map((p) => p.label).join(", ")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-gray/40 font-sans mt-2 italic">
          Tipp: Mehrere Möbel auf dem gleichen Feld sind ok — das ist eine Skizze, kein CAD.
        </p>
      </div>
    </div>
  );
}
