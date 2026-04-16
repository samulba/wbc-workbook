import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// ── CI Colours ─────────────────────────────────────────────────────────────────
const C = {
  forest:      "#445c49",
  mint:        "#94c1a4",
  mintLight:   "#c4dccb",
  sand:        "#cba178",
  sandLight:   "#e8d8c4",
  cream:       "#f6ede2",
  terracotta:  "#823509",
  white:       "#ffffff",
  gray:        "#9ca3af",
  grayLight:   "#e5e7eb",
  forestLight: "#e8eeea",
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: C.cream,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.forest,
  },

  // ── Header ──
  header: {
    backgroundColor: C.forest,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 48,
  },
  headerBrand: {
    fontSize: 7.5,
    color: C.mintLight,
    letterSpacing: 2,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: C.cream,
    letterSpacing: -0.3,
    lineHeight: 1.15,
    marginBottom: 10,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerMetaText: {
    fontSize: 10,
    color: C.mint,
    letterSpacing: 0.3,
  },
  headerMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.mintLight,
    marginHorizontal: 8,
    marginTop: 1,
  },

  // ── Accent bar below header ──
  accentBar: {
    flexDirection: "row",
    height: 4,
  },
  accentBarMint:      { flex: 3, backgroundColor: C.mint },
  accentBarSand:      { flex: 2, backgroundColor: C.sand },
  accentBarTerracotta:{ flex: 1, backgroundColor: C.terracotta },

  // ── Content ──
  content: {
    paddingHorizontal: 48,
    paddingTop: 28,
    paddingBottom: 60, // space for footer
  },

  // ── Section ──
  sectionWrap: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  sectionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.mint,
    marginRight: 6,
  },
  sectionLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.mint,
    letterSpacing: 1.8,
  },
  sectionValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.forest,
    marginBottom: 3,
  },
  sectionBody: {
    fontSize: 9.5,
    color: C.forest,
    lineHeight: 1.55,
    opacity: 0.75,
  },
  divider: {
    height: 1,
    backgroundColor: C.sandLight,
    marginBottom: 22,
  },

  // ── Colour section ──
  colorGroup: {
    marginBottom: 8,
  },
  colorGroupLabel: {
    fontSize: 8,
    color: C.gray,
    letterSpacing: 0.5,
    marginBottom: 5,
    width: 64,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  colorItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginBottom: 4,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
    borderWidth: 1,
    borderColor: C.sandLight,
  },
  colorCode: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: C.gray,
  },
  colorEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: C.sandLight,
    marginRight: 5,
  },

  // ── Material chips ──
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    borderWidth: 1,
    borderColor: C.sandLight,
    backgroundColor: C.forestLight,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 5,
  },
  chipText: {
    fontSize: 9.5,
    color: C.forest,
  },

  // ── Moodboard image ──
  moodboardImage: {
    width: "100%",
    borderRadius: 6,
    marginTop: 4,
    objectFit: "contain",
    maxHeight: 220,
  },

  // ── Notes section ──
  noteEntry: {
    marginBottom: 12,
  },
  noteStepLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.sand,
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  noteText: {
    fontSize: 9.5,
    color: C.forest,
    lineHeight: 1.55,
    opacity: 0.8,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: C.forest,
    paddingHorizontal: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7.5,
    color: C.mintLight,
    letterSpacing: 0.8,
  },
  footerRight: {
    fontSize: 7.5,
    color: C.mint,
    letterSpacing: 0.5,
  },
});

// ── Props ──────────────────────────────────────────────────────────────────────
export type StepNoteEntry = { stepNumber: number; stepTitle: string; text: string };

export interface RaumideePDFProps {
  projectName:    string;
  createdAt:      string;
  roomName:       string;
  roomLabel:      string;
  effectLabel?:   string;
  effectDesc?:    string;
  primaryColors:  string[];
  secondaryColors:string[];
  accentColor:    string;
  materials:      string[];
  lightMoodLabel: string;
  specialElements:string;
  moodboardUrl?:  string;
  exportDate:     string;
  stepNotes?:     StepNoteEntry[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isHex(v: string) {
  return /^#[0-9a-fA-F]{3,8}$/.test(v.trim());
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Section label row (mint dot + uppercase label)
function SectionLabel({ label }: { label: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionDot} />
      <Text style={s.sectionLabel}>{label.toUpperCase()}</Text>
    </View>
  );
}

// A single named colour row (e.g. "Primär  ● ● #hex")
function ColorGroup({
  label,
  colors,
}: {
  label: string;
  colors: string[];
}) {
  const present = colors.filter(Boolean);
  if (present.length === 0) return null;
  return (
    <View style={s.colorGroup}>
      <Text style={s.colorGroupLabel}>{label}</Text>
      <View style={s.colorRow}>
        {present.map((c, i) => (
          <View key={i} style={s.colorItem}>
            {isHex(c) ? (
              <View style={[s.colorDot, { backgroundColor: c }]} />
            ) : (
              <View style={s.colorEmpty} />
            )}
            <Text style={s.colorCode}>{c}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Document ──────────────────────────────────────────────────────────────────
export function RaumideePDF({
  projectName,
  createdAt,
  roomName,
  roomLabel,
  effectLabel,
  effectDesc,
  primaryColors,
  secondaryColors,
  accentColor,
  materials,
  lightMoodLabel,
  specialElements,
  moodboardUrl,
  exportDate,
  stepNotes,
}: RaumideePDFProps) {
  const hasColors =
    primaryColors.some(Boolean) ||
    secondaryColors.some(Boolean) ||
    !!accentColor;

  return (
    <Document
      title={`Raumidee – ${projectName}`}
      author="Wellbeing Workbook"
      subject="Raumidee Zusammenfassung"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ──────────────────────────────────────── */}
        <View style={s.header} fixed>
          <Text style={s.headerBrand}>
            WELLBEING CONCEPTS · RAUMGESTALTUNG
          </Text>
          <Text style={s.headerTitle}>Deine Raumidee</Text>
          <View style={s.headerMeta}>
            <Text style={s.headerMetaText}>{projectName}</Text>
            <View style={s.headerMetaDot} />
            <Text style={s.headerMetaText}>{createdAt}</Text>
          </View>
        </View>

        {/* Accent colour bar */}
        <View style={s.accentBar} fixed>
          <View style={s.accentBarMint} />
          <View style={s.accentBarSand} />
          <View style={s.accentBarTerracotta} />
        </View>

        {/* ── Content ─────────────────────────────────────── */}
        <View style={s.content}>

          {/* Raumtyp */}
          <View style={s.sectionWrap}>
            <SectionLabel label="Raumtyp" />
            <Text style={s.sectionValue}>
              {roomName !== roomLabel ? `${roomName} · ${roomLabel}` : roomLabel}
            </Text>
          </View>

          <View style={s.divider} />

          {/* Hauptwirkung */}
          {effectLabel && (
            <>
              <View style={s.sectionWrap}>
                <SectionLabel label="Hauptwirkung" />
                <Text style={s.sectionValue}>{effectLabel}</Text>
                {effectDesc && (
                  <Text style={s.sectionBody}>{effectDesc}</Text>
                )}
              </View>
              <View style={s.divider} />
            </>
          )}

          {/* Farbwelt */}
          {hasColors && (
            <>
              <View style={s.sectionWrap}>
                <SectionLabel label="Farbwelt" />
                <ColorGroup label="Primär"    colors={primaryColors} />
                <ColorGroup label="Sekundär"  colors={secondaryColors} />
                <ColorGroup label="Akzent"    colors={accentColor ? [accentColor] : []} />
              </View>
              <View style={s.divider} />
            </>
          )}

          {/* Materialien */}
          {materials.length > 0 && (
            <>
              <View style={s.sectionWrap}>
                <SectionLabel label="Materialien" />
                <View style={s.chipRow}>
                  {materials.map((m) => (
                    <View key={m} style={s.chip}>
                      <Text style={s.chipText}>{cap(m)}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={s.divider} />
            </>
          )}

          {/* Lichtstimmung */}
          {lightMoodLabel && (
            <>
              <View style={s.sectionWrap}>
                <SectionLabel label="Lichtstimmung" />
                <Text style={s.sectionValue}>{lightMoodLabel}</Text>
              </View>
              <View style={s.divider} />
            </>
          )}

          {/* Besondere Elemente */}
          {specialElements && (
            <>
              <View style={s.sectionWrap}>
                <SectionLabel label="Was darf nicht fehlen" />
                <Text style={s.sectionBody}>{specialElements}</Text>
              </View>
              {moodboardUrl && <View style={s.divider} />}
            </>
          )}

          {/* Moodboard image */}
          {moodboardUrl && (
            <View style={s.sectionWrap} wrap={false}>
              <SectionLabel label="Moodboard" />
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={moodboardUrl} style={s.moodboardImage} />
            </View>
          )}

          {/* Step notes */}
          {stepNotes && stepNotes.length > 0 && (
            <>
              <View style={s.divider} />
              <View style={s.sectionWrap}>
                <SectionLabel label="Persönliche Notizen" />
                {stepNotes.map((n) => (
                  <View key={n.stepNumber} style={s.noteEntry}>
                    <Text style={s.noteStepLabel}>
                      SCHRITT {n.stepNumber} – {n.stepTitle.toUpperCase()}
                    </Text>
                    <Text style={s.noteText}>{n.text}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

        </View>

        {/* ── Footer ──────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Erstellt mit Wellbeing Workbook · wellbeing-concepts.de
          </Text>
          <Text style={s.footerRight}>{exportDate}</Text>
        </View>

      </Page>
    </Document>
  );
}
