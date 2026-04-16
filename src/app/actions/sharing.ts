"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SetSharingResult =
  | { ok: true; token: string; isShared: boolean }
  | { ok: false; error: string };

/**
 * Toggle sharing for a room.
 * – Enabling: generates a share_token (if none yet) and sets is_shared = true.
 * – Disabling: sets is_shared = false, but keeps the token for potential re-enable.
 */
export async function setRoomSharing(
  roomId: string,
  enable: boolean
): Promise<SetSharingResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  // Verify ownership via project chain + get current token
  const { data: room } = await supabase
    .from("rooms")
    .select("project_id, share_token")
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

  // Generate token server-side when enabling and none exists yet
  const token: string =
    room.share_token ??
    // Node.js crypto.randomUUID is globally available in Next.js server
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    (typeof crypto !== "undefined"
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2) + Date.now().toString(36));

  const { error } = await supabase
    .from("rooms")
    .update({ is_shared: enable, share_token: token })
    .eq("id", roomId);

  if (error) {
    console.error("setRoomSharing error:", error);
    return { ok: false, error: "Speichern fehlgeschlagen." };
  }

  revalidatePath(`/dashboard/projekte/${room.project_id}`);
  return { ok: true, token, isShared: enable };
}
