"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Wand2, Camera, AlertCircle, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module3Data } from "@/lib/types/module3";
import { approxKelvin, brightnessLabel, lightPreviewCss, warmthLabel } from "../lightPreview";

// How long to wait after the user stops adjusting before firing a live render.
const LIVE_DEBOUNCE_MS   = 800;
// Only auto-render when at least one slider moved this many points since the
// last rendered state — avoids tiny wiggles eating the daily budget.
const LIVE_DELTA_TRIGGER = 10;

interface Props {
  data:      Module3Data;
  moduleId:  string;
  projectId: string;
  roomId:    string;
  roomType:  string;
  baseImage: string | null;
  onChange:  (patch: Partial<Module3Data>) => void;
}

export function Step05({ data, moduleId, projectId, roomId, roomType, baseImage, onChange }: Props) {
  const warmth     = data.light_warmth     ?? 60;
  const brightness = data.light_brightness ?? 60;

  const renders = data.studio_render_urls ?? [];
  const latestRender = renders[renders.length - 1] ?? null;
  const displayImage = latestRender ?? baseImage;

  const preview = useMemo(() => lightPreviewCss(warmth, brightness), [warmth, brightness]);

  const [rendering, setRendering] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const [liveMode, setLiveMode] = useState(false);
  const [lastRendered, setLastRendered] = useState<{ w: number; b: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rerender = useCallback(async () => {
    if (!baseImage) return;
    setError(null);
    setRendering(true);

    try {
      const res = await fetch("/api/module3/light-rerender", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId, projectId, roomId, roomType,
          baseImageUrl: displayImage,
          warmth, brightness,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "KI-Rendering fehlgeschlagen.");
        if (json.rateLimited) setRemaining(0);
        return;
      }

      onChange({ studio_render_urls: [...renders, json.imageUrl] });
      setRemaining(json.remaining ?? null);
      setLastRendered({ w: warmth, b: brightness });
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setRendering(false);
    }
  }, [baseImage, moduleId, projectId, roomId, roomType, displayImage, warmth, brightness, renders, onChange]);

  // Snapshot current slider values when Live-Mode turns on, so the first render
  // fires on the *next* user change rather than on toggle.
  useEffect(() => {
    if (liveMode && !lastRendered) {
      setLastRendered({ w: warmth, b: brightness });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMode]);

  // Debounced auto-render when sliders move in Live-Mode.
  useEffect(() => {
    if (!liveMode || rendering || !baseImage || !lastRendered) return;
    if (remaining === 0) return;

    const deltaW = Math.abs(warmth     - lastRendered.w);
    const deltaB = Math.abs(brightness - lastRendered.b);
    if (deltaW < LIVE_DELTA_TRIGGER && deltaB < LIVE_DELTA_TRIGGER) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { rerender(); }, LIVE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [warmth, brightness, liveMode, baseImage, rendering, lastRendered, remaining, rerender]);

  // Compute whether a live render is pending (delta crossed but still waiting for debounce)
  const livePending =
    liveMode &&
    !rendering &&
    lastRendered &&
    (Math.abs(warmth - lastRendered.w) >= LIVE_DELTA_TRIGGER ||
     Math.abs(brightness - lastRendered.b) >= LIVE_DELTA_TRIGGER);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">Light Temperature Studio</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Stelle Wärme und Helligkeit exakt so ein, wie du es dir für deinen Raum
          vorstellst. Im Live-Modus rendert die KI automatisch jede Slider-Bewegung,
          sobald du kurz pausierst.
        </p>
      </div>

      {/* Preview */}
      {displayImage ? (
        <div className="relative rounded-2xl overflow-hidden ring-1 ring-forest/10 shadow-lg aspect-[16/10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt="Raum-Vorschau"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 transition-all duration-300 mix-blend-soft-light"
            style={{ background: preview.background, opacity: 0.85 }}
          />
          <div
            className="absolute inset-0 transition-all duration-300"
            style={{ background: preview.overlay }}
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white/90 text-xs font-sans bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
            <span>{warmthLabel(warmth)} · {brightnessLabel(brightness)}</span>
            <span className="opacity-60">·</span>
            <span className="tabular-nums">~{approxKelvin(warmth)} K</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-sand/50 bg-cream/50 aspect-[16/10] flex flex-col items-center justify-center gap-2 text-center px-6">
          <Camera className="w-6 h-6 text-sand" strokeWidth={1.5} />
          <p className="text-sm font-sans text-gray/60 max-w-sm">
            Für das Light Studio brauchst du zuerst ein Foto oder KI-Rendering deines Raums.
            Starte dazu in Modul 1 die Raumanalyse und Visualisierung.
          </p>
        </div>
      )}

      {/* Sliders */}
      <div className="flex flex-col gap-4">
        <LabeledSlider
          label="Kalt ←→ Warm"
          value={warmth}
          onChange={(v) => onChange({ light_warmth: v })}
          trackGradient="linear-gradient(90deg, #a6cade 0%, #f5f0e1 50%, #ffc88c 100%)"
        />
        <LabeledSlider
          label="Gedimmt ←→ Hell"
          value={brightness}
          onChange={(v) => onChange({ light_brightness: v })}
          trackGradient="linear-gradient(90deg, #2a2a2a 0%, #a89e86 50%, #fdf6e3 100%)"
        />
      </div>

      {/* Rerender CTA + Live toggle */}
      <div className="rounded-xl border border-forest/20 bg-gradient-to-br from-forest/5 to-mint/10 p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-forest text-cream flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-sans font-semibold text-forest mb-0.5">
              Mit KI rendern
            </p>
            <p className="text-xs text-forest/60 font-sans leading-relaxed">
              Bis zu 10 Renderings pro Tag. Im Live-Modus wird automatisch
              nach {LIVE_DEBOUNCE_MS / 1000}s Pause neu gerendert, sobald
              ein Slider um mindestens {LIVE_DELTA_TRIGGER} Punkte abweicht.
            </p>
            {remaining !== null && (
              <p className="text-[11px] text-forest/50 font-sans mt-1">
                Noch {remaining} {remaining === 1 ? "Rendering" : "Renderings"} heute verfügbar.
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
            onClick={rerender}
            disabled={rendering || !baseImage}
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-forest text-cream text-sm font-sans font-medium hover:bg-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {rendering ? "Rendert …" : "Rendern"}
          </button>
        </div>

        {/* Live-Mode toggle */}
        <div className="flex items-center gap-3 pt-3 border-t border-forest/10">
          <button
            type="button"
            role="switch"
            aria-checked={liveMode}
            onClick={() => setLiveMode((v) => !v)}
            disabled={!baseImage || remaining === 0}
            className={cn(
              "relative w-9 h-5 rounded-full border transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed",
              liveMode ? "bg-forest border-forest" : "bg-cream border-sand/50",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all",
                liveMode ? "left-[18px]" : "left-0.5",
              )}
            />
          </button>

          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            <Zap className={cn("w-3.5 h-3.5 shrink-0", liveMode ? "text-forest" : "text-gray-400")} strokeWidth={1.75} />
            <span className={cn("text-xs font-sans font-medium", liveMode ? "text-forest" : "text-gray-500")}>
              Live-Modus
            </span>
            {livePending && (
              <span className="inline-flex items-center gap-1 ml-auto text-[11px] font-sans text-forest/60">
                <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                Rendert gleich …
              </span>
            )}
            {liveMode && !livePending && !rendering && (
              <span className="text-[11px] font-sans text-forest/45 ml-auto italic">
                Slider bewegen für Auto-Render
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Render history */}
      {renders.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-sand mb-2 font-sans">
            Deine Renderings
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

function LabeledSlider({
  label, value, onChange, trackGradient,
}: {
  label: string; value: number; onChange: (v: number) => void; trackGradient: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-sans text-forest/70">{label}</label>
        <span className="text-xs font-mono text-forest/50 tabular-nums">{value}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute left-0 right-0 h-3 rounded-full border border-forest/10" style={{ background: trackGradient }} />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-6 bg-transparent appearance-none cursor-pointer wbc-slider"
        />
      </div>
      <style jsx>{`
        .wbc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #445c49;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          cursor: grab;
        }
        .wbc-slider:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.08); }
        .wbc-slider::-moz-range-thumb {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #445c49;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          cursor: grab;
        }
      `}</style>
    </div>
  );
}
