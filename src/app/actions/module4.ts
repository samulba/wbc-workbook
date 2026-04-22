"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Module4Partial } from "@/lib/types/module4";
import { checkAndUnlockAchievements } from "@/lib/achievements/service";

export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string };

export async function saveModule4Step(
  moduleId: string,
  data: Module4Partial,
): Promise<SaveResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("module4_analysis")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", moduleId);

  if (error) {
    console.error("module4 save error:", error);
    return { ok: false, error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }

  if (data.status === "completed") {
    const { data: m4 } = await supabase
      .from("module4_analysis")
      .select("room_id")
      .eq("id", moduleId)
      .single();
    if (m4?.room_id) {
      await supabase
        .from("room_progress")
        .update({ m4_completed_at: new Date().toISOString() })
        .eq("room_id", m4.room_id);
    }
  }

  await checkAndUnlockAchievements(user.id, "module4_updated").catch(() => {});

  return { ok: true, savedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) };
}

export async function saveModule4Note(
  moduleId: string,
  stepNotes: Record<string, string>,
): Promise<SaveResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("module4_analysis")
    .update({ step_notes: stepNotes, updated_at: new Date().toISOString() })
    .eq("id", moduleId);

  if (error) {
    console.error("module4 note save error:", error);
    return { ok: false, error: "Notiz konnte nicht gespeichert werden." };
  }

  return { ok: true, savedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) };
}
