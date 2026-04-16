import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { RaumideePDF } from "@/lib/pdf/RaumideePDF";
import type { RaumideePDFProps } from "@/lib/pdf/RaumideePDF";

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

const EFFECT_META: Record<string, { label: string; description: string }> = {
  ruhe_erholung: {
    label: "Ruhe & Erholung",
    description: "Ein Raum, der dir Erholung schenkt – er lädt ein, loszulassen, durchzuatmen und neue Kraft zu schöpfen.",
  },
  fokus_konzentration: {
    label: "Fokus & Konzentration",
    description: "Ein Raum, der deinen Geist schärft – klar strukturiert, ohne Ablenkung, perfekt für konzentriertes Arbeiten.",
  },
  energie_aktivitaet: {
    label: "Energie & Aktivität",
    description: "Ein Raum, der dich in Schwung bringt – belebend, motivierend und voller Energie für alles, was du anpackst.",
  },
  kreativitaet_inspiration: {
    label: "Kreativität & Inspiration",
    description: "Ein Raum, der deine Kreativität entfacht – voller Impulse, der dein Denken beflügelt und neue Ideen wachsen lässt.",
  },
  begegnung_austausch: {
    label: "Begegnung & Austausch",
    description: "Ein Raum, der Menschen zusammenbringt – einladend, warm und offen für echte Begegnungen und Gespräche.",
  },
};

const LIGHT_LABELS: Record<string, string> = {
  warm_indirekt:    "Warm & indirekt",
  hell_klar:        "Hell & klar",
  beides_steuerbar: "Beides – steuerbar",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string; roomId: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify project ownership and fetch specific room
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, created_at")
    .eq("id", params.projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: room } = await supabase
    .from("rooms")
    .select(`
      id, name, room_type,
      module1_analysis (
        main_effect,
        primary_colors, secondary_colors, accent_color,
        materials, light_mood, special_elements,
        moodboard_urls, step_notes
      )
    `)
    .eq("id", params.roomId)
    .eq("project_id", params.projectId)
    .single();

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  type M1Row = {
    main_effect: string | null;
    primary_colors: string[] | null;
    secondary_colors: string[] | null;
    accent_color: string | null;
    materials: string[] | null;
    light_mood: string | null;
    special_elements: string | null;
    moodboard_urls: string[] | null;
    step_notes: Record<string, string> | null;
  };

  const m1 = (room.module1_analysis as M1Row[] | null)?.[0];

  const roomLabel  = ROOM_LABELS[room.room_type] ?? room.room_type ?? "";
  const effectMeta = EFFECT_META[m1?.main_effect ?? ""];
  const lightLabel = LIGHT_LABELS[m1?.light_mood ?? ""] ?? (m1?.light_mood ?? "");

  const now       = new Date();
  const createdAt = new Date(project.created_at).toLocaleDateString("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const exportDate = now.toLocaleDateString("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const rawMoodboardUrl = (m1?.moodboard_urls ?? [])[0] ?? "";
  const isValidUrl      = /^https?:\/\//i.test(rawMoodboardUrl);

  // Build step notes for PDF: filter to non-empty entries
  const STEP_LABELS: Record<number, string> = {
    1: "Projekt-Steckbrief", 2: "Warum verändern?", 3: "Raumwirkungen",
    4: "Hauptwirkung", 5: "Exkurs Farbwelten", 6: "Deine Farbwelt",
    7: "Inspiration", 8: "Raum-Briefing", 9: "Moodboard erstellen",
    10: "Moodboard-Prompt", 11: "Abschluss",
  };
  const stepNotesForPDF = Object.entries(m1?.step_notes ?? {})
    .filter(([, v]) => v?.trim())
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([k, v]) => ({ stepNumber: Number(k), stepTitle: STEP_LABELS[Number(k)] ?? `Schritt ${k}`, text: v }));

  const pdfProps: RaumideePDFProps = {
    projectName:     project.name,
    createdAt,
    exportDate,
    roomName:        room.name ?? roomLabel,
    roomLabel,
    effectLabel:     effectMeta?.label,
    effectDesc:      effectMeta?.description,
    primaryColors:   (m1?.primary_colors  ?? []).filter(Boolean),
    secondaryColors: (m1?.secondary_colors ?? []).filter(Boolean),
    accentColor:     m1?.accent_color ?? "",
    materials:       (m1?.materials ?? []).filter(Boolean),
    lightMoodLabel:  lightLabel,
    specialElements: m1?.special_elements ?? "",
    moodboardUrl:    isValidUrl ? rawMoodboardUrl : undefined,
    stepNotes:       stepNotesForPDF.length > 0 ? stepNotesForPDF : undefined,
  };

  let buffer: Buffer;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buffer = await renderToBuffer(<RaumideePDF {...pdfProps} /> as any);
  } catch (err) {
    console.error("PDF render error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }

  const roomSafe = (room.name ?? roomLabel)
    .replace(/[^\w\s\-äöüÄÖÜß]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const safeName = project.name
    .replace(/[^\w\s\-äöüÄÖÜß]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const dateSlug  = now.toLocaleDateString("de-DE").replace(/\./g, "-");
  const filename  = `Raumidee-${safeName}-${roomSafe}-${dateSlug}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename.replace(/[^\x20-\x7E]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
