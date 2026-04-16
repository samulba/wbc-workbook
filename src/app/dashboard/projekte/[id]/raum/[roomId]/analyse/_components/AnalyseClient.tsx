"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud, Sparkles, CheckCircle2, ThumbsUp, TrendingUp,
  Lightbulb, Palette, Layers, RefreshCw, X, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { saveAiAnalysis } from "@/app/actions/aiAnalysis";

// ── Section config ────────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ElementType> = {
  "Stärken":           ThumbsUp,
  "Verbesserung":      TrendingUp,
  "Empfehlungen":      Lightbulb,
  "Farbempfehlung":    Palette,
  "Material":          Layers,
};

const SECTION_COLORS: Record<string, { icon: string; bg: string; border: string }> = {
  "Stärken":        { icon: "text-forest",     bg: "bg-forest/5",     border: "border-forest/15"     },
  "Verbesserung":   { icon: "text-amber-600",  bg: "bg-amber-50",     border: "border-amber-200"     },
  "Empfehlungen":   { icon: "text-forest",     bg: "bg-mint/10",      border: "border-mint/30"       },
  "Farbempfehlung": { icon: "text-[#8a6030]",  bg: "bg-sand/15",      border: "border-sand/40"       },
  "Material":       { icon: "text-gray-600",   bg: "bg-gray-50",      border: "border-gray-200"      },
};

function getSectionStyle(title: string) {
  const key = Object.keys(SECTION_COLORS).find((k) => title.includes(k));
  return key ? SECTION_COLORS[key] : { icon: "text-forest", bg: "bg-forest/5", border: "border-forest/15" };
}

function getSectionIcon(title: string): React.ElementType {
  const key = Object.keys(SECTION_ICONS).find((k) => title.includes(k));
  return key ? SECTION_ICONS[key] : Lightbulb;
}

// ── Parser ────────────────────────────────────────────────────────────────────

function parseSections(text: string) {
  const parts = text.split(/^## /m).filter(Boolean);
  return parts.map((part) => {
    const nl = part.indexOf("\n");
    const title   = nl === -1 ? part.trim() : part.slice(0, nl).trim();
    const content = nl === -1 ? "" : part.slice(nl + 1).trim();
    return { title, content };
  });
}

function renderLines(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    const isBullet = /^[-*•]/.test(trimmed);
    const body = isBullet ? trimmed.replace(/^[-*•]\s*/, "") : trimmed;
    return (
      <div key={i} className={cn("flex gap-2", isBullet ? "items-start" : "")}>
        {isBullet && (
          <span className="w-1.5 h-1.5 rounded-full bg-current mt-[6px] shrink-0 opacity-60" />
        )}
        <p className="text-sm font-sans text-gray-700 leading-relaxed">{body}</p>
      </div>
    );
  });
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  roomId:         string;
  projectId:      string;
  roomType:       string;
  mainEffect:     string | null;
  savedAnalysis:  string | null;
  savedAt:        string | null;
  remaining:      number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AnalyseClient({
  roomId, roomType, mainEffect, savedAnalysis, savedAt, remaining,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Phase: "upload" | "preview" | "loading" | "result" | "saved"
  const [phase, setPhase]         = useState<"upload" | "preview" | "loading" | "result" | "saved">(
    savedAnalysis ? "saved" : "upload"
  );
  const [dragOver, setDragOver]   = useState(false);
  const [file, setFile]           = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis]   = useState<string | null>(savedAnalysis);
  const [savedAtDisplay, setSavedAtDisplay] = useState<string | null>(
    savedAt ? new Date(savedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }) : null
  );
  const [error, setError]         = useState<string | null>(null);
  const [remainingCount, setRemainingCount] = useState(remaining);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const dragCounterRef            = useRef(0);

  const handleFile = useCallback((f: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Nur JPG, PNG und WebP sind erlaubt.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Bild darf maximal 5 MB groß sein.");
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

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current++;
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setDragOver(false);
  }

  async function handleAnalyse() {
    if (!file) return;
    setPhase("loading");
    setError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip the data URL prefix
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/analyse-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
          roomType,
          mainEffect: mainEffect ?? undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Analyse fehlgeschlagen.");
        setPhase("preview");
        return;
      }

      setAnalysis(data.analysis);
      setRemainingCount(data.remaining ?? 0);
      setPhase("result");
    } catch {
      setError("Analyse fehlgeschlagen. Bitte erneut versuchen.");
      setPhase("preview");
    }
  }

  function handleSave() {
    if (!analysis) return;
    setSaveError(null);
    startTransition(async () => {
      const result = await saveAiAnalysis(roomId, analysis);
      if (result.ok) {
        setSavedAtDisplay(new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }));
        setPhase("saved");
        router.refresh();
      } else {
        setSaveError(result.error);
      }
    });
  }

  function handleNewAnalysis() {
    setFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setSaveError(null);
    setPhase("upload");
  }

  const sections = analysis ? parseSections(analysis) : [];

  // ── Upload phase ────────────────────────────────────────────────────────────
  if (phase === "upload") {
    return (
      <div className="flex flex-col gap-6">
        {/* Rate limit info */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest/5 border border-forest/15">
          <Sparkles className="w-3.5 h-3.5 text-forest/60 shrink-0" strokeWidth={1.5} />
          <p className="text-xs font-sans text-forest/70">
            {remainingCount > 0
              ? `Du hast heute noch <strong>${remainingCount}</strong> ${remainingCount === 1 ? "Analyse" : "Analysen"} übrig.`
              : "Du hast dein Tageslimit erreicht. Morgen stehen wieder 3 Analysen zur Verfügung."}
          </p>
        </div>

        {/* Upload zone */}
        <div
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => remainingCount > 0 && fileInputRef.current?.click()}
          className={cn(
            "relative rounded-2xl border-2 border-dashed transition-all duration-150",
            "flex flex-col items-center justify-center gap-4 px-8 py-16",
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
              Raumfoto hochladen
            </p>
            <p className="text-xs font-sans text-gray-400">
              JPG, PNG oder WebP · max. 5 MB
            </p>
            <p className="text-xs font-sans text-gray-400 mt-0.5">
              Klicken oder Bild hierher ziehen
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

        {error && (
          <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Existing analysis hint */}
        {savedAnalysis && (
          <button
            type="button"
            onClick={() => { setAnalysis(savedAnalysis); setPhase("saved"); }}
            className="text-xs font-sans text-forest/60 hover:text-forest underline underline-offset-2 text-center transition-colors"
          >
            Gespeicherte Analyse anzeigen
          </button>
        )}
      </div>
    );
  }

  // ── Preview phase ────────────────────────────────────────────────────────────
  if (phase === "preview") {
    return (
      <div className="flex flex-col gap-6">
        {/* Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl!} alt="Raumfoto" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleNewAnalysis}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
            title="Anderes Foto wählen"
          >
            <X className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest/5 border border-forest/15">
          <Sparkles className="w-3.5 h-3.5 text-forest/60 shrink-0" strokeWidth={1.5} />
          <p className="text-xs font-sans text-forest/70">
            Heute noch <span className="font-semibold">{remainingCount}</span> {remainingCount === 1 ? "Analyse" : "Analysen"} übrig
          </p>
        </div>

        <button
          type="button"
          onClick={handleAnalyse}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest text-white px-5 py-3.5 text-sm font-sans font-semibold hover:bg-forest/90 transition-colors"
        >
          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
          Raum analysieren
        </button>
      </div>
    );
  }

  // ── Loading phase ────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-16">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-forest/8 border border-forest/15 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-forest/60 animate-pulse" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-forest/20 border-t-forest animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-headline text-xl text-gray-900 mb-2">Claude analysiert deinen Raum …</p>
          <p className="text-sm font-sans text-gray-400">Das dauert meist 10–20 Sekunden</p>
        </div>
        <div className="flex gap-1.5">
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

  // ── Result phase ─────────────────────────────────────────────────────────────
  if (phase === "result") {
    return (
      <div className="flex flex-col gap-5">
        {/* Image thumbnail */}
        {previewUrl && (
          <div className="rounded-xl overflow-hidden border border-gray-200 h-32 sm:h-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Raumfoto" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Analysis sections */}
        {sections.map(({ title, content }) => {
          const style = getSectionStyle(title);
          const Icon  = getSectionIcon(title);
          return (
            <div
              key={title}
              className={cn("rounded-xl border p-5", style.bg, style.border)}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("w-4 h-4 shrink-0", style.icon)} strokeWidth={1.5} />
                <h3 className="text-sm font-sans font-semibold text-gray-900">{title}</h3>
              </div>
              <div className="flex flex-col gap-1.5">
                {renderLines(content)}
              </div>
            </div>
          );
        })}

        {saveError && (
          <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest text-white px-5 py-3.5 text-sm font-sans font-semibold hover:bg-forest/90 transition-colors disabled:opacity-60"
          >
            {isPending
              ? <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              : <Save className="w-4 h-4" strokeWidth={1.5} />
            }
            {isPending ? "Wird gespeichert …" : "Analyse speichern"}
          </button>
          <button
            type="button"
            onClick={handleNewAnalysis}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-sans font-medium text-gray-600 hover:bg-gray-50 px-5 py-3 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
            Neue Analyse starten
          </button>
        </div>
      </div>
    );
  }

  // ── Saved phase ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {/* Saved indicator */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-forest/5 border border-forest/15">
        <CheckCircle2 className="w-4 h-4 text-forest shrink-0" strokeWidth={2} />
        <div>
          <p className="text-xs font-sans font-semibold text-forest">Analyse gespeichert</p>
          {savedAtDisplay && (
            <p className="text-[11px] font-sans text-forest/60">{savedAtDisplay}</p>
          )}
        </div>
      </div>

      {/* Analysis sections */}
      {sections.map(({ title, content }) => {
        const style = getSectionStyle(title);
        const Icon  = getSectionIcon(title);
        return (
          <div
            key={title}
            className={cn("rounded-xl border p-5", style.bg, style.border)}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className={cn("w-4 h-4 shrink-0", style.icon)} strokeWidth={1.5} />
              <h3 className="text-sm font-sans font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="flex flex-col gap-1.5">
              {renderLines(content)}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
        <Sparkles className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
        <p className="text-xs font-sans text-gray-500">
          Heute noch <span className="font-semibold">{remainingCount}</span> {remainingCount === 1 ? "Analyse" : "Analysen"} übrig
        </p>
      </div>

      <button
        type="button"
        onClick={handleNewAnalysis}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-sans font-medium text-gray-600 hover:bg-gray-50 px-5 py-3 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
        Neue Analyse starten
      </button>
    </div>
  );
}
