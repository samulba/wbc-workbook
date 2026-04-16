"use client";

import {
  useState, useRef, useCallback, useEffect, useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud, Sparkles, Wand2, CheckCircle2, RefreshCw,
  Download, Trash2, Heart, Plus, X, ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { saveRendering, deleteRendering, addRenderingToMoodboard } from "@/app/actions/rendering";

// ── Effect / light labels ─────────────────────────────────────────────────────

const EFFECT_DE: Record<string, string> = {
  ruhe_erholung: "Ruhe & Erholung",
  fokus_konzentration: "Fokus & Konzentration",
  energie_aktivitaet: "Energie & Aktivität",
  kreativitaet_inspiration: "Kreativität & Inspiration",
  begegnung_austausch: "Begegnung & Austausch",
};

const LIGHT_DE: Record<string, string> = {
  warm_indirekt: "Warm & indirekt",
  hell_klar: "Hell & klar",
  beides_steuerbar: "Beides – steuerbar",
};

// ── Loading steps ─────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Analysiere deinen Raum…",
  "Wende Farbkonzept an…",
  "Füge Materialien hinzu…",
  "Optimiere Lichtstimmung…",
  "Finalisiere Rendering…",
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  roomId: string;
  projectId: string;
  roomType: string;
  beforeImageUrl: string | null;
  savedRenderings: string[];
  remaining: number;
  m1Step: number;
  moduleId: string | null;
  mainEffect: string | null;
  primaryColors: string[];
  secondaryColors: string[];
  accentColor: string;
  materials: string[];
  lightMood: string;
  specialElements: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VisualisierungClient({
  roomId, projectId, roomType,
  beforeImageUrl, savedRenderings,
  remaining, m1Step, moduleId,
  mainEffect, primaryColors, secondaryColors, accentColor,
  materials, lightMood, specialElements,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Phase
  type Phase = "start" | "preview" | "loading" | "result" | "gallery";
  const [phase, setPhase] = useState<Phase>(savedRenderings.length > 0 ? "gallery" : "start");

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [dragOver, setDragOver] = useState(false);

  // Loading animation
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Result state
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [remainingCount, setRemainingCount] = useState(remaining);
  const [saved, setSaved] = useState(false);
  const [inMoodboard, setInMoodboard] = useState(false);

  // Gallery state
  const [renderings, setRenderings] = useState<string[]>(savedRenderings);
  const [selectedRender, setSelectedRender] = useState<string | null>(null);

  // Errors
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Cleanup blob URL on unmount / change
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Loading step animation
  function startLoadingAnimation() {
    setLoadingStep(0);
    let step = 0;
    loadingIntervalRef.current = setInterval(() => {
      step++;
      if (step < LOADING_STEPS.length) {
        setLoadingStep(step);
      } else {
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      }
    }, 4500);
  }

  function stopLoadingAnimation() {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  }

  useEffect(() => () => stopLoadingAnimation(), []);

  // ── File handling ──────────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Nur JPG, PNG und WebP sind erlaubt.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Bild darf maximal 10 MB groß sein.");
      return;
    }
    setError(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setPhase("preview");
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current = 0;
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function selectBeforePhoto() {
    if (!beforeImageUrl) return;
    setFile(null);
    setPreviewUrl(beforeImageUrl);
    setPhase("preview");
  }

  // ── Generate rendering ─────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!previewUrl) return;
    setError(null);
    setSaved(false);
    setInMoodboard(false);
    setPhase("loading");
    startLoadingAnimation();

    try {
      let imageBase64: string;
      let mimeType: string;

      if (file) {
        // File from upload
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        mimeType = file.type;
      } else {
        // External URL (before_image_url) - fetch and convert
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        mimeType = blob.type || "image/jpeg";
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch("/api/render-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          roomId,
          projectId,
          roomType,
          mainEffect: mainEffect ?? undefined,
          primaryColors: primaryColors.filter(Boolean),
          secondaryColors: secondaryColors.filter(Boolean),
          accentColor: accentColor || undefined,
          materials: materials.filter(Boolean),
          lightMood: lightMood || undefined,
          specialElements: specialElements || undefined,
        }),
      });

      stopLoadingAnimation();
      setLoadingStep(LOADING_STEPS.length - 1);

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Visualisierung fehlgeschlagen.");
        setPhase("preview");
        return;
      }

      setRenderedUrl(data.imageUrl);
      setRemainingCount(data.remaining ?? 0);
      setPhase("result");
    } catch {
      stopLoadingAnimation();
      setError("Verbindung fehlgeschlagen. Bitte erneut versuchen.");
      setPhase("preview");
    }
  }

  // ── Save to DB ─────────────────────────────────────────────────────────────

  function handleSave() {
    if (!renderedUrl) return;
    setActionError(null);
    startTransition(async () => {
      const result = await saveRendering(roomId, renderedUrl);
      if (result.ok) {
        setSaved(true);
        setRenderings((prev) => {
          const next = [...prev, renderedUrl];
          return next.length > 5 ? next.slice(next.length - 5) : next;
        });
        router.refresh();
      } else {
        setActionError(result.error);
      }
    });
  }

  function handleAddToMoodboard() {
    if (!renderedUrl || !moduleId) return;
    setActionError(null);
    startTransition(async () => {
      const result = await addRenderingToMoodboard(moduleId, renderedUrl);
      if (result.ok) {
        setInMoodboard(true);
      } else {
        setActionError(result.error);
      }
    });
  }

  function handleDownload() {
    if (!renderedUrl) return;
    const a = document.createElement("a");
    a.href = renderedUrl;
    a.download = `Visualisierung-${roomId}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleDeleteRendering(url: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await deleteRendering(roomId, url);
      if (result.ok) {
        setRenderings((prev) => prev.filter((u) => u !== url));
        if (selectedRender === url) setSelectedRender(null);
        router.refresh();
      } else {
        setActionError(result.error);
      }
    });
  }

  function handleNewRendering() {
    setFile(null);
    setPreviewUrl(null);
    setRenderedUrl(null);
    setError(null);
    setSaved(false);
    setInMoodboard(false);
    setPhase("start");
  }

  // ── Concept summary (for preview phase) ──────────────────────────────────

  const allColors = [...primaryColors, ...secondaryColors, accentColor].filter(Boolean);
  const effectLabel = mainEffect ? (EFFECT_DE[mainEffect] ?? mainEffect) : null;
  const lightLabel = lightMood ? (LIGHT_DE[lightMood] ?? lightMood) : null;

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: START
  // ─────────────────────────────────────────────────────────────────────────

  if (phase === "start") {
    return (
      <div className="flex flex-col gap-6">
        {/* Rate limit */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest/5 border border-forest/15">
          <Wand2 className="w-3.5 h-3.5 text-forest/60 shrink-0" strokeWidth={1.5} />
          <p className="text-xs font-sans text-forest/70">
            {remainingCount > 0
              ? <>Du hast heute noch <span className="font-semibold">{remainingCount}</span> {remainingCount === 1 ? "Visualisierung" : "Visualisierungen"} übrig.</>
              : "Du hast dein Tageslimit erreicht. Morgen stehen wieder 3 Visualisierungen zur Verfügung."}
          </p>
        </div>

        {/* Info hint if low step */}
        {m1Step < 6 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-xs font-sans text-amber-700">
              Für bessere Ergebnisse empfehlen wir, Modul 1 bis mindestens Schritt 6 auszufüllen (Farbwelt & Materialien).
            </p>
          </div>
        )}

        {/* Upload zone */}
        <div
          onDrop={handleDrop}
          onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current++; setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current === 0) setDragOver(false); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => remainingCount > 0 && fileInputRef.current?.click()}
          className={cn(
            "relative rounded-2xl border-2 border-dashed transition-all duration-150",
            "flex flex-col items-center justify-center gap-4 px-8 py-14",
            remainingCount > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-60",
            dragOver
              ? "border-forest bg-forest/5 scale-[1.01]"
              : "border-sand/40 bg-sand/5 hover:border-forest/40 hover:bg-forest/[0.02]"
          )}
        >
          <div className="w-14 h-14 rounded-2xl bg-forest/8 border border-forest/12 flex items-center justify-center">
            <UploadCloud className="w-6 h-6 text-forest/60" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-sm font-sans font-semibold text-gray-700 mb-1">
              Foto deines aktuellen Raums hochladen
            </p>
            <p className="text-xs font-sans text-gray-400">
              JPG, PNG oder WebP · max. 10 MB
            </p>
            <p className="text-xs font-sans text-gray-400 mt-0.5">
              Frontalaufnahme bei Tageslicht, ohne Personen
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </div>

        {/* Use before photo if available */}
        {beforeImageUrl && (
          <button
            type="button"
            onClick={() => remainingCount > 0 && selectBeforePhoto()}
            disabled={remainingCount === 0}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={beforeImageUrl} alt="Vorher-Foto" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-sans font-medium text-gray-900">Vorher-Foto verwenden</p>
              <p className="text-xs font-sans text-gray-400">Das vorhandene Foto aus deinem Raum nutzen</p>
            </div>
            <ImagePlus className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
          </button>
        )}

        {error && (
          <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Go to gallery if renderings exist */}
        {renderings.length > 0 && (
          <button
            type="button"
            onClick={() => setPhase("gallery")}
            className="text-xs font-sans text-forest/60 hover:text-forest underline underline-offset-2 text-center transition-colors"
          >
            {renderings.length} gespeicherte {renderings.length === 1 ? "Visualisierung" : "Visualisierungen"} anzeigen
          </button>
        )}

        {/* Shooting tips */}
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-4">
          <p className="text-xs font-sans font-semibold text-gray-700 mb-2">Tipps für beste Ergebnisse</p>
          <ul className="flex flex-col gap-1.5">
            {[
              "Fotografiere den Raum frontal und möglichst mittig",
              "Gutes Tageslicht sorgt für natürliche Farben",
              "Keine Personen oder Haustiere im Bild",
              "Aufnahme aus Augenhöhe für natürliche Perspektive",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs font-sans text-gray-500">
                <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: PREVIEW
  // ─────────────────────────────────────────────────────────────────────────

  if (phase === "preview") {
    return (
      <div className="flex flex-col gap-5">
        {/* Photo preview */}
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl!} alt="Raumfoto" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleNewRendering}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </button>
        </div>

        {/* Concept summary */}
        {(effectLabel || allColors.length > 0 || materials.length > 0 || lightLabel) && (
          <div className="rounded-xl border border-forest/15 bg-forest/[0.02] p-4 flex flex-col gap-3">
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-forest/50">
              Dein Konzept wird angewendet
            </p>

            {effectLabel && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-forest/50 shrink-0" strokeWidth={1.5} />
                <span className="text-xs font-sans text-gray-700">{effectLabel}</span>
              </div>
            )}

            {allColors.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1 shrink-0">
                  {allColors.slice(0, 6).map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-white/50 shadow-sm"
                      style={{ backgroundColor: /^#[0-9a-fA-F]{3,6}$/.test(c) ? c : "#cba178" }}
                      title={c}
                    />
                  ))}
                </div>
                <span className="text-xs font-sans text-gray-500">Farbpalette</span>
              </div>
            )}

            {materials.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {materials.filter(Boolean).slice(0, 4).map((m) => (
                  <span key={m} className="text-[10px] font-sans text-forest/60 bg-forest/5 border border-forest/10 px-2 py-0.5 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            )}

            {lightLabel && (
              <p className="text-xs font-sans text-gray-500">Lichtstimmung: {lightLabel}</p>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest/5 border border-forest/15">
          <Wand2 className="w-3.5 h-3.5 text-forest/60 shrink-0" strokeWidth={1.5} />
          <p className="text-xs font-sans text-forest/70">
            Noch <span className="font-semibold">{remainingCount}</span> {remainingCount === 1 ? "Visualisierung" : "Visualisierungen"} heute verfügbar
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={remainingCount === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest text-white px-5 py-3.5 text-sm font-sans font-semibold hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 className="w-4 h-4" strokeWidth={1.5} />
          Visualisierung generieren
        </button>

        <button
          type="button"
          onClick={handleNewRendering}
          className="text-center text-xs font-sans text-gray-400 hover:text-gray-600 transition-colors"
        >
          Anderes Foto wählen
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: LOADING
  // ─────────────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="flex flex-col gap-8 py-8">
        {/* Spinner */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-forest/8 border border-forest/15 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-forest/60" strokeWidth={1.5} />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-forest/20 border-t-forest animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-headline text-xl text-gray-900 mb-2">Dein Raum wird transformiert…</p>
            <p className="text-sm font-sans text-gray-400">Das dauert ca. 15–30 Sekunden</p>
          </div>
        </div>

        {/* Step list */}
        <div className="flex flex-col gap-2">
          {LOADING_STEPS.map((label, i) => {
            const done = i < loadingStep;
            const active = i === loadingStep;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-500",
                  done ? "border-forest/20 bg-forest/5" : active ? "border-forest/30 bg-forest/[0.08]" : "border-gray-100 bg-gray-50 opacity-40"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all",
                  done ? "bg-forest border-forest" : active ? "border-forest/60 bg-transparent" : "border-gray-300 bg-transparent"
                )}>
                  {done ? (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-white stroke-2">
                      <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : active ? (
                    <span className="w-2 h-2 rounded-full bg-forest/80 animate-pulse" />
                  ) : null}
                </div>
                <span className={cn(
                  "text-sm font-sans",
                  done ? "text-forest/70 line-through" : active ? "text-forest font-medium" : "text-gray-400"
                )}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-forest/40 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: RESULT
  // ─────────────────────────────────────────────────────────────────────────

  if (phase === "result" && renderedUrl) {
    return (
      <div className="flex flex-col gap-6">
        {/* Before/After slider */}
        {previewUrl ? (
          <BeforeAfterSlider
            beforeUrl={previewUrl}
            afterUrl={renderedUrl}
            className="aspect-video w-full"
          />
        ) : (
          <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={renderedUrl} alt="Visualisierung" className="w-full h-full object-cover" />
          </div>
        )}

        <p className="text-xs font-sans text-center text-gray-400">
          Ziehe den Regler zum Vergleich von Vorher und Nachher
        </p>

        {actionError && (
          <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">{actionError}</p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {/* Save */}
          {!saved ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest text-white px-5 py-3.5 text-sm font-sans font-semibold hover:bg-forest/90 transition-colors disabled:opacity-60"
            >
              {isPending ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <Heart className="w-4 h-4" strokeWidth={1.5} />
              )}
              {isPending ? "Wird gespeichert…" : "Gefällt mir! Speichern"}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-forest/5 border border-forest/15 px-5 py-3.5">
              <CheckCircle2 className="w-4 h-4 text-forest" strokeWidth={2} />
              <span className="text-sm font-sans font-medium text-forest">Gespeichert</span>
            </div>
          )}

          <div className="flex gap-2">
            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-sans font-medium text-gray-600 hover:bg-gray-50 px-4 py-3 transition-colors"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              Als Bild speichern
            </button>

            {/* Add to moodboard */}
            {moduleId && (
              <button
                type="button"
                onClick={handleAddToMoodboard}
                disabled={isPending || inMoodboard}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-xl border text-sm font-sans font-medium px-4 py-3 transition-colors",
                  inMoodboard
                    ? "border-forest/20 bg-forest/5 text-forest/60 cursor-default"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                )}
              >
                {inMoodboard ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} /> Im Moodboard</>
                ) : (
                  <><Plus className="w-3.5 h-3.5" strokeWidth={2} /> Zum Moodboard</>
                )}
              </button>
            )}
          </div>

          {/* Retry */}
          <button
            type="button"
            onClick={handleNewRendering}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-sans font-medium text-gray-600 hover:bg-gray-50 px-5 py-3 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
            Nochmal generieren
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
          <Wand2 className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
          <p className="text-xs font-sans text-gray-500">
            Noch <span className="font-semibold">{remainingCount}</span> {remainingCount === 1 ? "Visualisierung" : "Visualisierungen"} heute verfügbar
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: GALLERY
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Fullscreen selected */}
      {selectedRender && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedRender} alt="Visualisierung" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const a = document.createElement("a");
                a.href = selectedRender;
                a.download = `Visualisierung-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-sans font-medium text-gray-600 hover:bg-gray-50 px-4 py-3 transition-colors"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              Download
            </button>
            {moduleId && (
              <button
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    if (!selectedRender || !moduleId) return;
                    await addRenderingToMoodboard(moduleId, selectedRender);
                  });
                }}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-sans font-medium text-gray-600 hover:bg-gray-50 px-4 py-3 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                Zum Moodboard
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDeleteRendering(selectedRender)}
              disabled={isPending}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-sans font-medium text-red-500 hover:bg-red-50 px-4 py-3 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRender(null)}
            className="text-center text-xs font-sans text-gray-400 hover:text-gray-600 transition-colors"
          >
            Schließen
          </button>
        </div>
      )}

      {actionError && (
        <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">{actionError}</p>
      )}

      {/* Grid */}
      {renderings.length > 0 ? (
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-gray/40 mb-3">
            Gespeicherte Visualisierungen ({renderings.length}/5)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {renderings.map((url, i) => (
              <div
                key={url}
                className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video cursor-pointer"
                onClick={() => setSelectedRender(url)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Visualisierung ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-sans text-white font-medium">Vergrößern</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteRendering(url); }}
                  disabled={isPending}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3 text-white" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-sm font-sans text-gray-400">
          Noch keine Visualisierungen gespeichert.
        </div>
      )}

      {/* New rendering CTA */}
      <button
        type="button"
        onClick={handleNewRendering}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest text-white px-5 py-3.5 text-sm font-sans font-semibold hover:bg-forest/90 transition-colors"
      >
        <Wand2 className="w-4 h-4" strokeWidth={1.5} />
        Neue Visualisierung erstellen
      </button>

      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest/5 border border-forest/15">
        <Wand2 className="w-3.5 h-3.5 text-forest/60 shrink-0" strokeWidth={1.5} />
        <p className="text-xs font-sans text-forest/70">
          Noch <span className="font-semibold">{remainingCount}</span> {remainingCount === 1 ? "Visualisierung" : "Visualisierungen"} heute verfügbar
        </p>
      </div>
    </div>
  );
}
