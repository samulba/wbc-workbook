"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

export type CreateResult   = { ok: true; token: string; id: string } | { ok: false; error: string };
export type BasicResult    = { ok: true } | { ok: false; error: string };

// ── Create ───────────────────────────────────────────────────────────────────

export async function createFeedbackLink(input: {
  roomId:        string;
  question:      string;
  durationDays:  number;
}): Promise<CreateResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  const question = input.question.trim();
  if (!question) return { ok: false, error: "Bitte gib eine Frage ein." };
  if (question.length > 500) {
    return { ok: false, error: "Frage darf höchstens 500 Zeichen haben." };
  }

  const days = [1, 7, 30].includes(input.durationDays) ? input.durationDays : 7;

  // Verify the room belongs to the user (defense-in-depth alongside RLS)
  const { data: roomCheck } = await supabase
    .from("rooms")
    .select("id, projects!inner(user_id)")
    .eq("id", input.roomId)
    .eq("projects.user_id", user.id)
    .maybeSingle();
  if (!roomCheck) return { ok: false, error: "Raum nicht gefunden." };

  const token      = randomBytes(18).toString("base64url");
  const expiresAt  = new Date(Date.now() + days * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from("share_feedback_links")
    .insert({
      user_id:    user.id,
      room_id:    input.roomId,
      token,
      question,
      expires_at: expiresAt,
    })
    .select("id, token")
    .single();

  if (error || !data) {
    console.error("createFeedbackLink:", error);
    return { ok: false, error: "Link konnte nicht erstellt werden." };
  }

  revalidatePath(`/dashboard/projekte`);
  return { ok: true, id: data.id, token: data.token };
}

// ── List ─────────────────────────────────────────────────────────────────────

export async function listFeedbackLinks(roomId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { links: [], responses: [] as { link_id: string; id: string; name: string | null; message: string; rating: number | null; created_at: string }[] };

  const { data: links } = await supabase
    .from("share_feedback_links")
    .select("id, room_id, token, question, expires_at, is_active, created_at")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const linkIds = (links ?? []).map((l) => l.id);
  let responses: { link_id: string; id: string; name: string | null; message: string; rating: number | null; created_at: string }[] = [];
  if (linkIds.length > 0) {
    const { data } = await supabase
      .from("share_feedback_responses")
      .select("id, link_id, name, message, rating, created_at")
      .in("link_id", linkIds)
      .order("created_at", { ascending: false });
    responses = data ?? [];
  }

  return { links: links ?? [], responses };
}

// ── Deactivate / delete ──────────────────────────────────────────────────────

export async function toggleFeedbackLinkActive(linkId: string, active: boolean): Promise<BasicResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  const { error } = await supabase
    .from("share_feedback_links")
    .update({ is_active: active })
    .eq("id", linkId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };
  return { ok: true };
}

export async function deleteFeedbackLink(linkId: string): Promise<BasicResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  const { error } = await supabase
    .from("share_feedback_links")
    .delete()
    .eq("id", linkId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Löschen fehlgeschlagen." };
  return { ok: true };
}

export async function deleteFeedbackResponse(responseId: string): Promise<BasicResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };
  void user;

  // RLS policy ensures only responses whose parent link belongs to the user
  // can be deleted — still run through the user-scoped client.
  const { error } = await supabase
    .from("share_feedback_responses")
    .delete()
    .eq("id", responseId);

  if (error) return { ok: false, error: "Löschen fehlgeschlagen." };
  return { ok: true };
}
