"use client";

import { forwardRef } from "react";
import type { Module1Data } from "@/lib/types/module1";

// ── Inline config (no icon dependencies — reliable in off-screen capture) ────

const EFFECTS_MAP: Record<string, { label: string; description: string; accent: string; bg: string }> = {
  ruhe_erholung:            { label: "Ruhe & Erholung",            description: "Ein Raum, der dir Erholung schenkt – er lädt ein, loszulassen, durchzuatmen und neue Kraft zu schöpfen.", accent: "#445c49", bg: "#eaf3ee" },
  fokus_konzentration:      { label: "Fokus & Konzentration",      description: "Ein Raum, der deinen Geist schärft – klar strukturiert, ohne Ablenkung, perfekt für konzentriertes Arbeiten.", accent: "#3d5a68", bg: "#e9eff2" },
  energie_aktivitaet:       { label: "Energie & Aktivität",        description: "Ein Raum, der dich in Schwung bringt – belebend, motivierend und voller Energie für alles, was du anpackst.", accent: "#823509", bg: "#faf0eb" },
  kreativitaet_inspiration: { label: "Kreativität & Inspiration",  description: "Ein Raum, der deine Kreativität entfacht – voller Impulse, der dein Denken beflügelt und neue Ideen wachsen lässt.", accent: "#8a6030", bg: "#faf5ee" },
  begegnung_austausch:      { label: "Begegnung & Austausch",      description: "Ein Raum, der Menschen zusammenbringt – einladend, warm und offen für echte Begegnungen und Gespräche.", accent: "#445c49", bg: "#eaf3ee" },
};

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

interface Props {
  projectName: string;
  roomName:    string;
  roomType:    string;
  data:        Module1Data;
}

// ── Utility: is valid hex color ───────────────────────────────────────────────
function isHex(c: string) { return /^#[0-9a-fA-F]{3,6}$/.test(c); }

// ── Component ─────────────────────────────────────────────────────────────────

export const MoodboardExportCanvas = forwardRef<HTMLDivElement, Props>(
  ({ projectName, roomName, roomType, data }, ref) => {
    const effect      = data.main_effect ? EFFECTS_MAP[data.main_effect] : null;
    const primary     = (data.primary_colors   ?? []).filter(Boolean);
    const secondary   = (data.secondary_colors ?? []).filter(Boolean);
    const accent      = data.accent_color?.trim() ?? "";
    const allColors   = [...primary, ...secondary, accent].filter(Boolean);
    const materials   = (data.materials ?? []).filter(Boolean);
    const lightLabel  = LIGHT_LABELS[data.light_mood ?? ""] ?? "";
    const moodboard   = (data.moodboard_urls ?? []).filter(u => /^https?:\/\//i.test(u));
    const roomLabel   = ROOM_LABELS[roomType] ?? roomType;
    const today       = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

    // Grid layout for moodboard
    const imgCount    = moodboard.length;
    const gridCols    = imgCount === 1 ? 1 : imgCount === 3 ? 3 : 2;
    const imgAspect   = imgCount === 1 ? "56.25%" /* 16:9 */ : "75%" /* 4:3 */;

    return (
      <div
        ref={ref}
        style={{
          position:        "fixed",
          left:            "-9999px",
          top:             "0",
          width:           "800px",
          backgroundColor: "#ffffff",
          fontFamily:      "'Helvetica Neue', Helvetica, Arial, sans-serif",
          color:           "#1a1a1a",
          overflow:        "hidden",
        }}
      >
        {/* ── Header bar ─────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#445c49", padding: "24px 40px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
              Wellbeing Workbook
            </span>
            <span style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)" }}>
              {today}
            </span>
          </div>

          <p style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(148,193,164,0.8)", marginBottom: "6px", margin: "0 0 6px" }}>
            Mein Raumkonzept
          </p>
          <h1 style={{ fontSize: "38px", fontWeight: "700", color: "#ffffff", margin: "0 0 4px", lineHeight: "1.1", letterSpacing: "-0.5px" }}>
            {projectName}
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", margin: "0", letterSpacing: "0.02em" }}>
            {roomName}
            {roomLabel !== roomName && (
              <span style={{ opacity: 0.7 }}> · {roomLabel}</span>
            )}
          </p>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────────── */}
        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Hauptwirkung */}
          {effect && (
            <div>
              <SectionLabel>Hauptwirkung</SectionLabel>
              <div style={{
                backgroundColor: effect.bg,
                borderRadius:    "12px",
                padding:         "16px 20px",
                display:         "flex",
                flexDirection:   "column",
                gap:             "6px",
              }}>
                <div style={{
                  display:         "inline-flex",
                  alignItems:      "center",
                  gap:             "8px",
                  backgroundColor: effect.accent,
                  color:           "#fff",
                  fontSize:        "12px",
                  fontWeight:      "600",
                  letterSpacing:   "0.03em",
                  padding:         "4px 12px",
                  borderRadius:    "100px",
                  width:           "fit-content",
                }}>
                  {effect.label}
                </div>
                <p style={{ fontSize: "13px", color: "#555", margin: "0", lineHeight: "1.6" }}>
                  {effect.description}
                </p>
              </div>
            </div>
          )}

          {/* Farbwelt */}
          {allColors.length > 0 && (
            <div>
              <SectionLabel>Farbwelt</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {allColors.map((c, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{
                      width:           "44px",
                      height:          "44px",
                      borderRadius:    "50%",
                      backgroundColor: isHex(c) ? c : "#cba17840",
                      border:          "2px solid rgba(0,0,0,0.08)",
                      boxShadow:       "0 1px 4px rgba(0,0,0,0.12)",
                    }} />
                    <span style={{ fontSize: "9px", fontFamily: "'Courier New', monospace", color: "#999", maxWidth: "48px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materialien */}
          {materials.length > 0 && (
            <div>
              <SectionLabel>Materialien</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {materials.map((m) => (
                  <span key={m} style={{
                    fontSize:        "12px",
                    fontWeight:      "500",
                    color:           "#445c49",
                    backgroundColor: "#eaf3ee",
                    border:          "1px solid rgba(68,92,73,0.15)",
                    padding:         "5px 14px",
                    borderRadius:    "100px",
                  }}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lichtstimmung */}
          {lightLabel && (
            <div>
              <SectionLabel>Lichtstimmung</SectionLabel>
              <p style={{ fontSize: "14px", color: "#333", margin: "0", fontWeight: "500" }}>
                {lightLabel}
              </p>
            </div>
          )}

          {/* Divider before moodboard */}
          {moodboard.length > 0 && (
            <div style={{ borderTop: "1px solid #eee", paddingTop: "4px" }}>
              <SectionLabel>Moodboard</SectionLabel>
            </div>
          )}

          {/* Moodboard grid */}
          {moodboard.length > 0 && (
            <div style={{
              display:             "grid",
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gap:                 "10px",
              marginTop:           "-16px",
            }}>
              {moodboard.map((url, i) => (
                <div key={i} style={{ position: "relative", paddingBottom: imgAspect, borderRadius: "10px", overflow: "hidden", backgroundColor: "#f5f5f5" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Moodboard ${i + 1}`}
                    crossOrigin="anonymous"
                    style={{
                      position:   "absolute",
                      inset:      "0",
                      width:      "100%",
                      height:     "100%",
                      objectFit:  "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty moodboard placeholder */}
          {moodboard.length === 0 && (
            <div style={{
              height:          "180px",
              borderRadius:    "12px",
              backgroundColor: "#f9f9f7",
              border:          "1px solid #eee",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
            }}>
              <span style={{ fontSize: "13px", color: "#bbb" }}>Kein Moodboard hinzugefügt</span>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────────── */}
        <div style={{
          padding:         "16px 40px",
          borderTop:       "1px solid #f0ece6",
          backgroundColor: "#fafaf8",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#94c1a4" }} />
            <span style={{ fontSize: "11px", color: "#aaa", letterSpacing: "0.05em" }}>
              Erstellt mit Wellbeing Workbook
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "#ccc", letterSpacing: "0.05em" }}>
            workbooks.wellbeing-concepts.de
          </span>
        </div>
      </div>
    );
  }
);

MoodboardExportCanvas.displayName = "MoodboardExportCanvas";

// ── Helper ────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize:      "9px",
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color:         "#aaa",
      margin:        "0 0 10px",
      fontWeight:    "600",
    }}>
      {children}
    </p>
  );
}
