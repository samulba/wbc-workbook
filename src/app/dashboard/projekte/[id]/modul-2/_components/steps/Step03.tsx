"use client";

import { Ruler } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { Module2Data } from "@/lib/types/module2";

interface Props {
  data:     Module2Data;
  onChange: (patch: Partial<Module2Data>) => void;
}

export function Step03({ data, onChange }: Props) {
  const width  = data.width_cm  ?? null;
  const length = data.length_cm ?? null;
  const height = data.height_cm ?? null;

  const areaM2 = width && length ? ((width * length) / 10_000).toFixed(1) : null;
  const volM3  = width && length && height ? ((width * length * height) / 1_000_000).toFixed(1) : null;

  function toNum(v: string): number | null {
    const n = Number(v.replace(/[^\d]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Ruler className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Wie groß ist dein Raum?</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Grobe Maße reichen – du musst nichts auf den Zentimeter genau messen. Die Werte helfen uns,
          Möbelgrößen realistisch einzuschätzen.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <NumField label="Breite (cm)"  value={width}  onChange={(v) => onChange({ width_cm:  toNum(v) })} />
        <NumField label="Länge (cm)"   value={length} onChange={(v) => onChange({ length_cm: toNum(v) })} />
        <NumField label="Höhe (cm)"    value={height} onChange={(v) => onChange({ height_cm: toNum(v) })} />
      </div>

      {(areaM2 || volM3) && (
        <div className="rounded-xl border border-sand/30 bg-white p-4 grid grid-cols-2 gap-3">
          {areaM2 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-sand font-sans">Fläche</p>
              <p className="font-headline text-xl text-forest">{areaM2} m²</p>
            </div>
          )}
          {volM3 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-sand font-sans">Volumen</p>
              <p className="font-headline text-xl text-forest">{volM3} m³</p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray/45 font-sans italic">
        Tipp: Zeichnen eines Grundrisses kommt in einem späteren Update – die SVG-Skizze bleibt bewusst optional.
      </p>
    </div>
  );
}

function NumField({
  label, value, onChange,
}: {
  label:    string;
  value:    number | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-widest text-sand font-sans">{label}</label>
      <Input
        inputMode="numeric"
        placeholder="0"
        value={value === null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
