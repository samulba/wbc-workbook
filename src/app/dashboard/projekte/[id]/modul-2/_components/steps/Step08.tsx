"use client";

import { useState } from "react";
import { Wand2, Camera, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { STYLE_MAP } from "../stylesConfig";
import type { Module2Data } from "@/lib/types/module2";
import type { Module2Carry } from "../ModuleWizard";

interface Props {
  data:      Module2Data;
  moduleId:  string;
  projectId: string;
  roomId:    string;
  roomName:  string;
  roomType:  string;
  baseImage: string | null;
  carry:     Module2Carry;
  onChange:  (patch: Partial<Module2Data>) => void;
}

export function Step08({
  data, projectId, roomId, roomType, baseImage, carry, onChange,
}: Props) {
  const [rendering, setRendering] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const style = data.primary_style ? STYLE_MAP[data.primary_style] : null;

  const renders = data.render_urls ?? [];
  const latest  = renders[renders.length - 1] ?? null;
  const display = latest ?? baseImage;

  async function handleGenerate() {
    if (!baseImage) return;
    setError(null);
    setRendering(true);

    try {
      // Fetch the base image bytes and convert to base64
      const imgRes = await fetch(baseImage);
      const blob   = await imgRes.blob();
      const mimeType = blob.type || "image/jpeg";
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const styleLabel = style?.label ?? null;
      const specialElements = [
        carry.specialElements,
        styleLabel ? `Overall style: ${styleLabel}` : null,
      ].filter(Boolean).join(". ");

      const res = await fetch("/api/render-room", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          roomId,
          projectId,
          roomType,
          mainEffect:      carry.mainEffect ?? undefined,
          primaryColors:   data.palette_primary.filter(Boolean),
          secondaryColors: data.palette_secondary.filter(Boolean),
          accentColor:     data.palette_accent || undefined,
          materials:       carry.materials.filter(Boolean),
          specialElements: specialElements || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Visualisierung fehlgeschlagen.");
        return;
      }

      onChange({
        render_urls: [...renders, json.imageUrl],
        render_prompt: specialElements,
      });
      setRemaining(json.remaining ?? null);
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Vorher / Nachher mit KI</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Die Wellbeing KI rendert deinen Raum neu — basierend auf Leit-Stil, Palette und
          allen Daten aus Modul 1. So siehst du dein Konzept noch vor dem ersten Möbelkauf.
        </p>
      </div>

      {/* Preview */}
      {display ? (
        <div className="relative rounded-2xl overflow-hidden ring-1 ring-forest/10 shadow-lg aspect-[16/10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={display} alt="Raum-Vorschau" className="absolute inset-0 w-full h-full object-cover" />
          {latest && (
            <div className="absolute top-3 left-3 bg-forest text-cream text-[11px] font-sans px-2.5 py-1 rounded-full shadow-md">
              KI-Render
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-sand/50 bg-cream/50 aspect-[16/10] flex flex-col items-center justify-center gap-2 text-center px-6">
          <Camera className="w-6 h-6 text-sand" strokeWidth={1.5} />
          <p className="text-sm font-sans text-gray/60 max-w-sm">
            Für die KI-Visualisierung brauchst du ein Foto deines Raums. Lade es in Modul 1
            unter &bdquo;KI-Analyse&ldquo; hoch.
          </p>
        </div>
      )}

      {/* Context summary */}
      <div className="rounded-xl border border-sand/30 bg-white p-4 flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-sand font-sans">
          Was die KI verwendet
        </p>
        <div className="flex flex-wrap gap-1.5">
          {style && (
            <span className="text-[11px] font-sans text-forest bg-forest/10 border border-forest/25 px-2.5 py-1 rounded-full">
              Stil: {style.label}
            </span>
          )}
          {data.palette_primary.filter(Boolean).length > 0 && (
            <span className="text-[11px] font-sans text-forest bg-mint/15 border border-mint/30 px-2.5 py-1 rounded-full">
              Palette: {data.palette_primary.filter(Boolean).length + data.palette_secondary.filter(Boolean).length + (data.palette_accent ? 1 : 0)} Farben
            </span>
          )}
          {carry.materials.length > 0 && (
            <span className="text-[11px] font-sans text-forest bg-sand/15 border border-sand/30 px-2.5 py-1 rounded-full">
              Materialien: {carry.materials.length}
            </span>
          )}
          {carry.mainEffect && (
            <span className="text-[11px] font-sans text-forest bg-cream border border-sand/30 px-2.5 py-1 rounded-full">
              Wirkung: {carry.mainEffect.replaceAll("_", " ")}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-forest/20 bg-gradient-to-br from-forest/5 to-mint/10 p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-forest text-cream flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-sans font-semibold text-forest mb-0.5">
            Mit KI rendern
          </p>
          <p className="text-xs text-forest/60 font-sans leading-relaxed">
            Generiert eine fotorealistische Version deines Raums im gewählten Stil.
          </p>
          {remaining !== null && (
            <p className="text-[11px] text-forest/50 font-sans mt-1">
              Noch {remaining} Renderings heute verfügbar.
            </p>
          )}
          {error && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600 font-sans">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={rendering || !baseImage}
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-forest text-cream text-sm font-sans font-medium hover:bg-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {rendering ? "Rendert …" : "Rendern"}
        </button>
      </div>

      {/* History */}
      {renders.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-sand mb-2 font-sans">
            Bisherige Renderings
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {renders.map((url, i) => (
              <div key={url} className={cn(
                "relative rounded-lg overflow-hidden border aspect-square",
                i === renders.length - 1 ? "border-forest ring-2 ring-mint/30" : "border-sand/30",
              )}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Rendering ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
