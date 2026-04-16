"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveAiAnalysis(roomId: string, analysis: string): Promise<SaveResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify room belongs to this user
  const { data: room } = await supabase
    .from("rooms")
    .select("id, project_id")
    .eq("id", roomId)
    .single();

  if (!room) return { ok: false, error: "Raum nicht gefunden." };

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", room.project_id)
    .eq("user_id", user.id)
    .single();

  if (!project) return { ok: false, error: "Keine Berechtigung." };

  const { error } = await supabase
    .from("rooms")
    .update({ ai_analysis: analysis, ai_analysis_at: new Date().toISOString() })
    .eq("id", roomId);

  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };
  return { ok: true };
}
