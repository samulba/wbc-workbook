"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoodboardExportCanvas } from "@/app/dashboard/projekte/[id]/modul-1/_components/MoodboardExportCanvas";
import type { Module1Data } from "@/lib/types/module1";

interface Props {
  projectName: string;
  roomName:    string;
  roomType:    string;
  // Only the fields MoodboardExportCanvas actually uses
  mainEffect:      string | null;
  primaryColors:   string[] | null;
  secondaryColors: string[] | null;
  accentColor:     string | null;
  materials:       string[] | null;
  lightMood:       string | null;
  moodboardUrls:   string[] | null;
}

export function SharedExportButton({
  projectName, roomName, roomType,
  mainEffect, primaryColors, secondaryColors, accentColor,
  materials, lightMood, moodboardUrls,
}: Props) {
  const [exporting, setExporting]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [showCanvas, setShowCanvas]         = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Build a minimal Module1Data-compatible object for the canvas
  const canvasData = {
    id: "", room_id: "",
    main_effect:      (mainEffect ?? null) as Module1Data["main_effect"],
    primary_colors:   primaryColors   ?? [],
    secondary_colors: secondaryColors ?? [],
    accent_color:     accentColor     ?? "",
    materials:        materials        ?? [],
    light_mood:       lightMood        ?? "",
    moodboard_urls:   moodboardUrls    ?? [],
    // unused fields
    wishes: ["", "", ""] as [string, string, string],
    support_friends: false, support_external: false, support_person: "",
    current_issues: "", more_of: "", less_of: "", change_reason: "",
    special_elements: "", moodboard_prompt: "",
    status: "completed", current_step: 6,
    desired_effects: [], current_situation: "",
    color_preferences: [], color_avoid: [], color_notes: "",
    material_preferences: [], material_avoid: [], material_notes: "",
    moodboard_notes: "", notes: "",
    step_notes: {},
    light_warmth: null, light_brightness: null,
    special_tags: [], moodboard_canvas: [],
  } satisfies Module1Data;

  async function handleExport() {
    setExporting(true);
    setError(null);
    setShowCanvas(true);
    try {
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
      setError("Bild konnte nicht erstellt werden. Bitte erneut versuchen.");
    } finally {
      setExporting(false);
      setShowCanvas(false);
    }
  }

  return (
    <>
      {error && (
        <p className="text-xs text-terracotta font-sans bg-terracotta/5 rounded-lg px-3 py-2 text-center mb-2">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5",
          "text-sm font-sans font-medium transition-all",
          exporting
            ? "border-sand/40 bg-sand/10 text-gray-400 cursor-not-allowed"
            : "border-forest/30 bg-forest/5 text-forest hover:bg-forest/10 hover:border-forest/50"
        )}
      >
        {exporting ? (
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

      {showCanvas && (
        <MoodboardExportCanvas
          ref={exportRef}
          projectName={projectName}
          roomName={roomName}
          roomType={roomType}
          data={canvasData}
        />
      )}
    </>
  );
}
