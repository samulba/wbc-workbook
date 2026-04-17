"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAndUnlockAchievements } from "@/lib/achievements/service";

export type RenderingResult = { ok: true } | { ok: false; error: string };

const MAX_RENDERS = 5;
const BUCKET = "moodboards";

/** Append a rendered image URL to rooms.rendered_images (max MAX_RENDERS). */
export async function saveRendering(roomId: string, imageUrl: string): Promise<RenderingResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  // Load existing array + verify ownership
  const { data: roomRow } = await supabase
    .from("rooms")
    .select("rendered_images, project_id")
    .eq("id", roomId)
    .single();

  if (!roomRow) return { ok: false, error: "Raum nicht gefunden." };

  const { data: projectCheck } = await supabase
    .from("projects")
    .select("id")
    .eq("id", roomRow.project_id)
    .eq("user_id", user.id)
    .single();

  if (!projectCheck) return { ok: false, error: "Keine Berechtigung." };

  const existing: string[] = roomRow.rendered_images ?? [];

  // Rotate out the oldest if at limit
  const updated = [...existing, imageUrl];
  const trimmed = updated.length > MAX_RENDERS ? updated.slice(updated.length - MAX_RENDERS) : updated;

  const { error } = await supabase
    .from("rooms")
    .update({ rendered_images: trimmed })
    .eq("id", roomId);

  if (error) {
    console.error("saveRendering error:", error);
    return { ok: false, error: "Speichern fehlgeschlagen." };
  }

  await checkAndUnlockAchievements(user.id, "render_created").catch(() => {});

  return { ok: true };
}

/** Remove a rendered image URL from rooms.rendered_images and delete from storage. */
export async function deleteRendering(roomId: string, imageUrl: string): Promise<RenderingResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  const { data: roomRow } = await supabase
    .from("rooms")
    .select("rendered_images, project_id")
    .eq("id", roomId)
    .single();

  if (!roomRow) return { ok: false, error: "Raum nicht gefunden." };

  const { data: projectCheck } = await supabase
    .from("projects")
    .select("id")
    .eq("id", roomRow.project_id)
    .eq("user_id", user.id)
    .single();

  if (!projectCheck) return { ok: false, error: "Keine Berechtigung." };

  const updated = (roomRow.rendered_images ?? []).filter((u: string) => u !== imageUrl);

  const { error } = await supabase
    .from("rooms")
    .update({ rendered_images: updated })
    .eq("id", roomId);

  if (error) return { ok: false, error: "Löschen fehlgeschlagen." };

  // Background storage cleanup
  const MARKER = `/object/public/${BUCKET}/`;
  const idx = imageUrl.indexOf(MARKER);
  if (idx !== -1) {
    const storagePath = imageUrl.slice(idx + MARKER.length);
    if (storagePath.startsWith(`${user.id}/`)) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
    }
  }

  return { ok: true };
}

/** Add a rendered image URL to module1_analysis.moodboard_urls. */
export async function addRenderingToMoodboard(moduleId: string, imageUrl: string): Promise<RenderingResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  // Load current moodboard_urls
  const { data: m1Row } = await supabase
    .from("module1_analysis")
    .select("moodboard_urls, room_id")
    .eq("id", moduleId)
    .single();

  if (!m1Row) return { ok: false, error: "Modul nicht gefunden." };

  // Verify ownership via room → project
  const { data: roomRow } = await supabase
    .from("rooms")
    .select("project_id")
    .eq("id", m1Row.room_id)
    .single();

  if (!roomRow) return { ok: false, error: "Raum nicht gefunden." };

  const { data: projectCheck } = await supabase
    .from("projects")
    .select("id")
    .eq("id", roomRow.project_id)
    .eq("user_id", user.id)
    .single();

  if (!projectCheck) return { ok: false, error: "Keine Berechtigung." };

  const existing: string[] = m1Row.moodboard_urls ?? [];
  if (existing.includes(imageUrl)) return { ok: true }; // already there

  const { error } = await supabase
    .from("module1_analysis")
    .update({ moodboard_urls: [...existing, imageUrl] })
    .eq("id", moduleId);

  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };

  return { ok: true };
}
