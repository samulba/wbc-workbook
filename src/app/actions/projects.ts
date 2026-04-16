"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type CreateProjectResult    = { error: string } | { projectId: string };
export type DeleteProjectResult    = { ok: true } | { ok: false; error: string };
export type AddRoomResult          = { error: string } | { roomId: string };
export type DeleteRoomResult       = { ok: true } | { ok: false; error: string };
export type UpdateRoomPhotoResult  = { ok: true } | { ok: false; error: string };

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
  const name      = (formData.get("name") as string)?.trim();
  const roomType  = formData.get("roomType") as string;
  const roomLabel = formData.get("roomLabel") as string;
  const budgetRaw = formData.get("budget") as string;
  const deadline  = (formData.get("deadline") as string) || null;
  const budget    = budgetRaw ? parseFloat(budgetRaw) : null;

  // ── Validation ─────────────────────────────────────────────
  if (!name)     return { error: "Bitte gib einen Projektnamen ein." };
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
    console.error("Project creation error:", JSON.stringify(projectError, null, 2));
    if (projectError?.code === "42501") {
      return { error: "Keine Berechtigung. Bitte melde dich ab und wieder an." };
    }
    if (projectError?.code === "23505") {
      return { error: "Ein Projekt mit diesem Namen existiert bereits." };
    }
    const detail = projectError?.message ? ` (${projectError.message})` : "";
    return { error: `Projekt konnte nicht gespeichert werden.${detail} Bitte erneut versuchen.` };
  }

  // ── Create room (trigger auto-creates module1_analysis) ────
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      project_id: project.id,
      name: roomLabel || roomType,
      room_type: roomType,
    })
    .select("id")
    .single();

  if (roomError || !room) {
    await supabase.from("projects").delete().eq("id", project.id);
    console.error("Room creation error:", JSON.stringify(roomError, null, 2));
    const detail = roomError?.message ? ` (${roomError.message})` : "";
    return { error: `Raum konnte nicht erstellt werden.${detail} Bitte erneut versuchen.` };
  }

  redirect(`/dashboard/projekte/${project.id}/raum/${room.id}/modul-1`);
}

export async function deleteProject(projectId: string): Promise<DeleteProjectResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Nicht angemeldet" };

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

export async function addRoom(
  _prev: AddRoomResult | null,
  formData: FormData
): Promise<AddRoomResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const projectId = (formData.get("projectId") as string)?.trim();
  const roomName  = (formData.get("roomName")  as string)?.trim();
  const roomType  = (formData.get("roomType")  as string)?.trim();

  if (!roomName) return { error: "Bitte gib einen Raumnamen ein." };
  if (!roomType) return { error: "Bitte wähle einen Raumtyp aus." };

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return { error: "Projekt nicht gefunden." };

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({ project_id: projectId, name: roomName, room_type: roomType })
    .select("id")
    .single();

  if (roomError || !room) {
    console.error("Add room error:", roomError);
    return { error: "Raum konnte nicht erstellt werden. Bitte erneut versuchen." };
  }

  revalidatePath(`/dashboard/projekte/${projectId}`);
  redirect(`/dashboard/projekte/${projectId}/raum/${room.id}/modul-1`);
}

export async function updateRoomPhoto(
  roomId: string,
  type: "before" | "after",
  url: string | null
): Promise<UpdateRoomPhotoResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  // Verify ownership via project chain
  const { data: roomRow } = await supabase
    .from("rooms")
    .select("project_id")
    .eq("id", roomId)
    .single();

  if (!roomRow) return { ok: false, error: "Raum nicht gefunden." };

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", roomRow.project_id)
    .eq("user_id", user.id)
    .single();

  if (!project) return { ok: false, error: "Keine Berechtigung." };

  const column = type === "before" ? "before_image_url" : "after_image_url";
  const { error } = await supabase
    .from("rooms")
    .update({ [column]: url })
    .eq("id", roomId);

  if (error) {
    console.error("Update room photo error:", error);
    return { ok: false, error: "Speichern fehlgeschlagen." };
  }

  revalidatePath(`/dashboard/projekte/${roomRow.project_id}`);
  return { ok: true };
}

export async function deleteRoom(roomId: string): Promise<DeleteRoomResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Nicht angemeldet" };

  // Verify ownership via project chain
  const { data: roomRow } = await supabase
    .from("rooms")
    .select("project_id")
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

  const { error } = await supabase.from("rooms").delete().eq("id", roomId);

  if (error) {
    console.error("Room deletion error:", error);
    return { ok: false, error: "Löschen fehlgeschlagen. Bitte erneut versuchen." };
  }

  revalidatePath(`/dashboard/projekte/${roomRow.project_id}`);
  return { ok: true };
}
