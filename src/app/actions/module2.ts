"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Module2Partial } from "@/lib/types/module2";
import { checkAndUnlockAchievements } from "@/lib/achievements/service";

export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string };

export async function saveModule2Step(
  moduleId: string,
  data: Module2Partial,
): Promise<SaveResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("module2_analysis")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", moduleId);

  if (error) {
    console.error("module2 save error:", error);
    return { ok: false, error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }

  if (data.status === "completed") {
    const { data: m2 } = await supabase
      .from("module2_analysis")
      .select("room_id")
      .eq("id", moduleId)
      .single();
    if (m2?.room_id) {
      await supabase
        .from("room_progress")
        .update({ m2_completed_at: new Date().toISOString() })
        .eq("room_id", m2.room_id);
    }
  }

  await checkAndUnlockAchievements(user.id, "module2_updated").catch(() => {});
  revalidatePath("/dashboard", "layout");

  return { ok: true, savedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) };
}

export async function saveModule2Note(
  moduleId: string,
  stepNotes: Record<string, string>,
): Promise<SaveResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("module2_analysis")
    .update({ step_notes: stepNotes, updated_at: new Date().toISOString() })
    .eq("id", moduleId);

  if (error) {
    console.error("module2 note save error:", error);
    return { ok: false, error: "Notiz konnte nicht gespeichert werden." };
  }

  return { ok: true, savedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) };
}
