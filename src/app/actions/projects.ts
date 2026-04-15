"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type CreateProjectResult = { error: string } | { projectId: string };
export type DeleteProjectResult = { ok: true } | { ok: false; error: string };

export async function createProject(
  _prev: CreateProjectResult | null,
  formData: FormData
): Promise<CreateProjectResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ── Parse fields ───────────────────────────────────────────
  const name = (formData.get("name") as string)?.trim();
  const roomType = formData.get("roomType") as string;
  const roomLabel = formData.get("roomLabel") as string;
  const budgetRaw = formData.get("budget") as string;
  const deadline = (formData.get("deadline") as string) || null;

  const budget = budgetRaw ? parseFloat(budgetRaw) : null;

  // ── Validation ─────────────────────────────────────────────
  if (!name) return { error: "Bitte gib einen Projektnamen ein." };
  if (!roomType) return { error: "Bitte wähle einen Raumtyp aus." };

  // ── Create project ─────────────────────────────────────────
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      status: "entwurf",
      budget: budget && !isNaN(budget) ? budget : null,
      deadline,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    console.error("Project creation error:", projectError);
    return { error: "Projekt konnte nicht gespeichert werden. Bitte erneut versuchen." };
  }

  // ── Create room ────────────────────────────────────────────
  // room_type enum: wohnzimmer | schlafzimmer | arbeitszimmer |
  //   kinderzimmer | badezimmer | kueche | esszimmer | flur |
  //   keller | buero | yogaraum | wellness | studio | sonstiges
  const { error: roomError } = await supabase.from("rooms").insert({
    project_id: project.id,
    name: roomLabel || roomType,
    room_type: roomType,
  });

  if (roomError) {
    // Clean up orphaned project
    await supabase.from("projects").delete().eq("id", project.id);
    console.error("Room creation error:", roomError);
    return { error: "Raum konnte nicht erstellt werden. Bitte erneut versuchen." };
  }

  // ── Redirect to Modul 1 ────────────────────────────────────
  redirect(`/dashboard/projekte/${project.id}/modul-1`);
}

export async function deleteProject(projectId: string): Promise<DeleteProjectResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Nicht angemeldet" };

  // RLS ensures only the owner can delete, but we add user_id check for safety
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Project deletion error:", error);
    return { ok: false, error: "Löschen fehlgeschlagen. Bitte erneut versuchen." };
  }

  return { ok: true };
}
