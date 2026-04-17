"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EFFECTS } from "../effectsConfig";
import type { Module1Data } from "@/lib/types/module1";
import type { RoomEffect } from "../effectsConfig";
import { STEP_CONFIG } from "@/lib/types/module1";
import {
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Lock,
  Lightbulb,
  Palette,
  Layers,
  Ruler,
  Leaf,
  Camera,
  ArrowRight,
  Share2,
  PhoneCall,
  PenLine,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { ShareModal } from "@/app/dashboard/_components/ShareModal";
import { AskFriendButton } from "@/components/feedback-share/AskFriendButton";
import { ProductRecommendations } from "../ProductRecommendations";
import { MoodboardExportCanvas } from "../MoodboardExportCanvas";

interface Props {
  data: Module1Data;
  projectId: string;
  projectName: string;
  roomId: string;
  roomType: string;
  roomName: string;
  editMode?: boolean;
  shareToken?: string | null;
  isShared?: boolean;
}

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

const LIGHT_LABELS: Record<string, string> = {
  warm_indirekt:    "Warm & indirekt",
  hell_klar:        "Hell & klar",
  beides_steuerbar: "Beides – steuerbar",
};

const TIPS = [
  {
    Icon: Palette,
    title: "Farbprobe zuerst",
    text: "Teste Wandfarben auf einem A3-Karton – bei Tageslicht und abends im Kunstlicht. Farben wirken in groß anders als auf der Karte.",
  },
  {
    Icon: Layers,
    title: "Starte mit dem Boden",
    text: "Der Boden prägt den ganzen Raum. Entscheide dich zuerst für Bodenbelag oder Teppich, dann wähle Möbel und Farben dazu.",
  },
  {
    Icon: Ruler,
    title: "Maße vor dem Kauf",
    text: "Kaufe zuerst das wichtigste Möbelstück. Miss den Raum aus und klebe die Grundfläche mit Malerkrepp ab – so erkennst du das richtige Verhältnis.",
  },
  {
    Icon: Leaf,
    title: "Weniger, aber bewusst",
    text: "Lieber ein starkes Statement-Möbel als viele kleine Objekte. Lass mindestens 30 % der Flächen frei – das schafft Ruhe und Eleganz.",
  },
];

// Confetti pieces (celebration header only)
const CONFETTI = [
  { left: "6%",  top: "18%", size: "w-3 h-3",     color: "bg-mint/60",       delay: "0s",    shape: "rounded-full"    },
  { left: "88%", top: "12%", size: "w-2 h-2",     color: "bg-terracotta/60", delay: "0.6s",  shape: "rounded-sm"      },
  { left: "18%", top: "8%",  size: "w-2.5 h-2.5", color: "bg-sand/80",       delay: "1.2s",  shape: "rounded-full"    },
  { left: "78%", top: "28%", size: "w-2 h-2",     color: "bg-white/40",      delay: "0.9s",  shape: "rounded-sm"      },
  { left: "92%", top: "55%", size: "w-3 h-3",     color: "bg-mint/50",       delay: "0.3s",  shape: "rounded-full"    },
  { left: "4%",  top: "65%", size: "w-2 h-2",     color: "bg-sand/60",       delay: "1.5s",  shape: "rounded-full"    },
  { left: "50%", top: "6%",  size: "w-2 h-2",     color: "bg-white/50",      delay: "0.7s",  shape: "rounded-sm"      },
  { left: "65%", top: "72%", size: "w-1.5 h-1.5", color: "bg-terracotta/40", delay: "1.0s",  shape: "rounded-full"    },
  { left: "30%", top: "75%", size: "w-2 h-2",     color: "bg-mint/40",       delay: "0.4s",  shape: "rounded-sm"      },
  { left: "75%", top: "5%",  size: "w-1.5 h-1.5", color: "bg-white/60",      delay: "1.3s",  shape: "rounded-full"    },
];

export function Step11({ data, projectId, projectName, roomId, roomType, roomName, editMode, shareToken, isShared = false }: Props) {
  const [mounted, setMounted]               = useState(false);
  const [pdfLoading, setPdfLoading]         = useState(false);
  const [pdfError, setPdfError]             = useState<string | null>(null);
  const [showShare, setShowShare]           = useState(false);
  const [imgExporting, setImgExporting]     = useState(false);
  const [imgError, setImgError]             = useState<string | null>(null);
  const [showExportCanvas, setShowExportCanvas] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  async function handlePdfExport() {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch(`/api/export/raumidee/${projectId}/${roomId}`);
      if (!res.ok) throw new Error("Export fehlgeschlagen");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      const today = new Date().toLocaleDateString("de-DE").replace(/\./g, "-");
      a.download = `Raumidee-${projectName}-${today}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setPdfError("PDF konnte nicht erstellt werden. Bitte erneut versuchen.");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleImageExport() {
    setImgExporting(true);
    setImgError(null);
    setShowExportCanvas(true);
    try {
      // Wait for the canvas to render
      await new Promise((r) => setTimeout(r, 150));
      if (!exportRef.current) throw new Error("Canvas nicht gefunden");
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      const today = new Date().toLocaleDateString("de-DE").replace(/\./g, "-");
      const safeName = projectName.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "").trim().replace(/\s+/g, "-");
      a.download = `Raumkonzept-${safeName}-${today}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setImgError("Bild konnte nicht erstellt werden. Bitte erneut versuchen.");
    } finally {
      setImgExporting(false);
      setShowExportCanvas(false);
    }
  }

  const effect     = data.main_effect as RoomEffect | null;
  const effectMeta = effect ? EFFECTS.find((e) => e.value === effect) : null;
  const primary    = (data.primary_colors   ?? []).filter(Boolean) as string[];
  const secondary  = (data.secondary_colors ?? []).filter(Boolean) as string[];
  const accent     = data.accent_color?.trim() ?? "";
  const allColors  = [...primary, ...secondary, accent].filter(Boolean);
  const materials  = data.materials ?? [];
  const lightMood  = LIGHT_LABELS[data.light_mood ?? ""] ?? "";
  const moodboardUrls = (data.moodboard_urls ?? []).filter(
    (u) => /^https?:\/\//i.test(u)
  );

  return (
    <div className="flex flex-col gap-10">

      {/* ── Hero: celebration (normal) or compact overview (edit mode) ── */}
      {editMode ? (
        /* Edit mode: compact header instead of celebration */
        <div className="rounded-2xl border border-forest/20 bg-forest/5 px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-forest/10 border border-forest/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-forest/60" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-forest/40 mb-0.5">
              Modul 1 abgeschlossen
            </p>
            <h2 className="font-headline text-lg text-forest leading-snug">
              {projectName}
            </h2>
            <p className="text-xs text-gray/50 font-sans">
              {roomName} · {ROOM_LABELS[roomType] ?? roomType}
            </p>
          </div>
        </div>
      ) : (
        /* Normal mode: full celebration */
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-forest to-forest/80 px-6 py-10 text-center">
          {/* Confetti */}
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              aria-hidden
              className={cn(
                "absolute animate-pulse pointer-events-none",
                c.size, c.color, c.shape
              )}
              style={{
                left: c.left,
                top: c.top,
                animationDelay: c.delay,
                animationDuration: "2s",
              }}
            />
          ))}

          {/* Checkmark */}
          <div className="flex justify-center mb-5">
            <div
              className={cn(
                "w-20 h-20 rounded-full bg-white/15 border-2 border-white/30",
                "flex items-center justify-center transition-all duration-500",
                mounted ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-10 h-10"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12l5 5 9-9" />
              </svg>
            </div>
          </div>

          <h2
            className={cn(
              "font-headline text-3xl text-white mb-2 transition-all duration-500 delay-150",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
          >
            {projectName}
          </h2>
          <p
            className={cn(
              "font-sans text-sm text-white/65 transition-all duration-500 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
          >
            {roomName} · {ROOM_LABELS[roomType] ?? roomType}
          </p>

          {/* 100% badge */}
          <div
            className={cn(
              "inline-flex items-center gap-2 mt-5",
              "transition-all duration-500 delay-300",
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}
          >
            <div className="flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3.5 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-mint" strokeWidth={2} />
              <span className="text-xs font-sans font-semibold text-white uppercase tracking-widest">
                Modul 1 abgeschlossen
              </span>
            </div>
            <div className="bg-mint/25 border border-mint/40 rounded-full px-2.5 py-1.5">
              <span className="text-xs font-sans font-bold text-white tabular-nums">100%</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Summary card ──────────────────────────────────── */}
      <div className="rounded-2xl border border-sand/30 bg-white/50 overflow-hidden">
        <div className="bg-forest/5 border-b border-sand/20 px-5 py-3">
          <span className="font-headline text-sm text-forest">Dein Raumkonzept im Überblick</span>
        </div>

        <div className="divide-y divide-sand/15">

          {/* Hauptwirkung */}
          {effectMeta && (
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-forest/8 border border-forest/12 flex items-center justify-center shrink-0">
                <effectMeta.Icon className="w-4.5 h-4.5 text-forest/60" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-0.5">
                  Hauptwirkung
                </p>
                <p className="text-sm font-sans font-semibold text-forest">{effectMeta.label}</p>
              </div>
            </div>
          )}

          {/* Farbwelt */}
          {allColors.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-2.5">
                Farbwelt
              </p>
              <div className="flex gap-2 flex-wrap">
                {allColors.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span
                      className="w-8 h-8 rounded-full border border-sand/30 shadow-sm"
                      style={{
                        backgroundColor: /^#[0-9a-fA-F]{3,6}$/.test(c) ? c : undefined,
                        background: /^#[0-9a-fA-F]{3,6}$/.test(c) ? undefined : "#cba17840",
                      }}
                      title={c}
                    />
                    <span className="text-[9px] font-mono text-gray/35 max-w-[40px] truncate">
                      {c}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materialien */}
          {materials.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-2.5">
                Materialien
              </p>
              <div className="flex flex-wrap gap-1.5">
                {materials.map((m) => (
                  <span
                    key={m}
                    className="text-xs font-sans font-medium text-forest/70 bg-forest/5 border border-forest/10 px-2.5 py-1 rounded-full"
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lichtstimmung */}
          {lightMood && (
            <div className="px-5 py-4 flex items-center gap-3">
              <Lightbulb className="w-4 h-4 text-sand shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-0.5">
                  Lichtstimmung
                </p>
                <p className="text-sm font-sans font-medium text-forest">{lightMood}</p>
              </div>
            </div>
          )}

          {/* Moodboard preview */}
          {moodboardUrls.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10px] text-gray/40 font-sans uppercase tracking-wider mb-2.5">
                Moodboard{moodboardUrls.length > 1 ? ` (${moodboardUrls.length} Bilder)` : ""}
              </p>
              <div
                className={`grid gap-2 ${
                  moodboardUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {moodboardUrls.map((url, i) => (
                  <div
                    key={url}
                    className="rounded-xl overflow-hidden border border-sand/30 bg-sand/5"
                    style={{ aspectRatio: moodboardUrls.length === 1 ? "16/9" : "4/3" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Moodboard ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tips box ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-sand/30 bg-sand/8 overflow-hidden">
        <div className="border-b border-sand/20 px-5 py-3 flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-sand" strokeWidth={1.5} />
          <span className="font-headline text-sm text-forest/80">4 Tipps für die Umsetzung</span>
        </div>
        <div className="divide-y divide-sand/15">
          {TIPS.map(({ Icon, title, text }) => (
            <div key={title} className="px-5 py-4 flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/70 border border-sand/25 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-forest/50" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-sans font-semibold text-forest mb-1">{title}</p>
                <p className="text-xs text-gray/55 font-sans leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Step notes summary ───────────────────────────── */}
      {(() => {
        const notes = data.step_notes ?? {};
        const entries = STEP_CONFIG.filter(({ step }) => notes[String(step)]?.trim());
        if (entries.length === 0) return null;
        return (
          <div className="rounded-2xl border border-sand/30 bg-sand/8 overflow-hidden">
            <div className="border-b border-sand/20 px-5 py-3 flex items-center gap-2">
              <PenLine className="w-3.5 h-3.5 text-sand" strokeWidth={1.5} />
              <span className="font-headline text-sm text-forest/80">Deine Notizen</span>
              <span className="ml-auto text-[10px] font-sans text-sand/70 bg-sand/20 px-2 py-0.5 rounded-full">
                {entries.length} {entries.length === 1 ? "Notiz" : "Notizen"}
              </span>
            </div>
            <div className="divide-y divide-sand/15">
              {entries.map(({ step, title }) => (
                <div key={step} className="px-5 py-4">
                  <p className="text-[10px] font-sans uppercase tracking-wider text-gray/40 mb-1.5">
                    Schritt {step} – {title}
                  </p>
                  <p className="text-sm font-sans text-forest/70 leading-relaxed whitespace-pre-wrap">
                    {notes[String(step)]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Product recommendations ──────────────────────── */}
      <ProductRecommendations
        roomType={roomType}
        mainEffect={data.main_effect}
        roomId={data.room_id ?? null}
        heading="Starte dein Konzept mit diesen Produkten"
      />

      {/* ── Before-photo hint ─────────────────────────────── */}
      <div className="rounded-xl border border-sand/30 bg-sand/8 px-4 py-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-sand/20 border border-sand/25 flex items-center justify-center shrink-0 mt-0.5">
          <Camera className="w-4 h-4 text-sand" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-sans font-semibold text-forest/80 mb-0.5">
            Tipp: Lade ein Vorher-Foto hoch
          </p>
          <p className="text-xs text-gray/50 font-sans leading-relaxed">
            Halte den aktuellen Zustand fest – damit kannst du später den Unterschied sehen.
          </p>
        </div>
        <Link
          href={`/dashboard/projekte/${projectId}`}
          className="flex items-center gap-1 text-[11px] font-sans font-medium text-forest/60 hover:text-forest transition-colors shrink-0 mt-0.5"
        >
          Jetzt
          <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
        </Link>
      </div>

      {/* ── Action buttons ────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* PDF export */}
        {pdfError && (
          <p className="text-xs text-terracotta font-sans bg-terracotta/5 rounded-lg px-3 py-2 text-center">
            {pdfError}
          </p>
        )}
        <button
          type="button"
          onClick={handlePdfExport}
          disabled={pdfLoading}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5",
            "text-sm font-sans font-medium transition-all",
            pdfLoading
              ? "border-sand/40 bg-sand/10 text-gray/50 cursor-not-allowed"
              : "border-forest/30 bg-forest/5 text-forest hover:bg-forest/10 hover:border-forest/50"
          )}
        >
          {pdfLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-forest/30 border-t-forest animate-spin shrink-0" />
              PDF wird erstellt …
            </>
          ) : (
            <>
              <Download className="w-4 h-4" strokeWidth={1.5} />
              Raumidee als PDF exportieren
            </>
          )}
        </button>

        {/* PNG image export */}
        {imgError && (
          <p className="text-xs text-terracotta font-sans bg-terracotta/5 rounded-lg px-3 py-2 text-center">
            {imgError}
          </p>
        )}
        <button
          type="button"
          onClick={handleImageExport}
          disabled={imgExporting}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5",
            "text-sm font-sans font-medium transition-all",
            imgExporting
              ? "border-sand/40 bg-sand/10 text-gray/50 cursor-not-allowed"
              : "border-forest/30 bg-forest/5 text-forest hover:bg-forest/10 hover:border-forest/50"
          )}
        >
          {imgExporting ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-forest/30 border-t-forest animate-spin shrink-0" />
              Bild wird erstellt …
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
              Als Bild speichern
            </>
          )}
        </button>

        {/* Visualisierung CTA */}
        <Link
          href={`/dashboard/projekte/${projectId}/raum/${roomId}/visualisierung`}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5",
            "text-sm font-sans font-medium transition-all",
            "border-forest bg-forest text-white hover:bg-forest/90"
          )}
        >
          <Wand2 className="w-4 h-4" strokeWidth={1.5} />
          Sieh dein Konzept in Aktion
        </Link>

        {/* Share button */}
        <button
          type="button"
          onClick={() => setShowShare(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5",
            "text-sm font-sans font-medium transition-all",
            isShared
              ? "border-forest bg-forest text-white hover:bg-forest/90"
              : "border-forest/30 bg-forest/5 text-forest hover:bg-forest/10 hover:border-forest/50"
          )}
        >
          <Share2 className="w-4 h-4" strokeWidth={1.5} />
          {isShared ? "Konzept wird geteilt" : "Konzept teilen"}
        </button>
        {showShare && (
          <ShareModal
            roomId={roomId}
            initialIsShared={isShared}
            initialToken={shareToken ?? null}
            onClose={() => setShowShare(false)}
          />
        )}

        {/* Ask a friend for feedback */}
        <div className="flex justify-center">
          <AskFriendButton roomId={roomId} variant="outline" />
        </div>

        {/* Coaching CTA */}
        <Link
          href={`/coaching/buchen?room=${roomId}`}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5",
            "text-sm font-sans font-medium transition-all",
            "border-sand/40 bg-sand/8 text-forest/70 hover:bg-sand/15 hover:border-sand/60"
          )}
        >
          <PhoneCall className="w-4 h-4" strokeWidth={1.5} />
          Persönliche Beratung buchen
        </Link>

        {/* Modul 2 – disabled */}
        <div className="relative">
          <button
            type="button"
            disabled
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl",
              "bg-forest/20 border border-forest/15 px-5 py-3.5",
              "text-sm font-sans font-semibold text-forest/40 cursor-not-allowed"
            )}
          >
            <Lock className="w-4 h-4" strokeWidth={1.5} />
            Weiter zu Modul 2
            <span className="ml-auto text-xs font-normal text-forest/30">Demnächst verfügbar</span>
          </button>
        </div>

        <p className="text-xs text-gray/35 font-sans text-center">
          {editMode
            ? "Klicke auf \u201eSpeichern\u00a0&\u00a0Zur\u00fcck\u201c unten, um deine \u00c4nderungen zu speichern."
            : "Klicke auf \u201eAbschlie\u00dfen\u201c unten, um Modul\u00a01 zu speichern und zum Projekt zur\u00fcckzukehren. \uD83C\uDF89"}
        </p>
      </div>

      {/* Off-screen export canvas */}
      {showExportCanvas && (
        <MoodboardExportCanvas
          ref={exportRef}
          projectName={projectName}
          roomName={roomName}
          roomType={roomType}
          data={data}
        />
      )}
    </div>
  );
}
