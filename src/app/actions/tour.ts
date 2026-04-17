"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TourResult = { ok: true } | { ok: false; error: string };

export async function markTourSeen(): Promise<TourResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  const { error } = await supabase
    .from("profiles")
    .update({ has_seen_tour: true })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function resetTour(): Promise<TourResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  const { error } = await supabase
    .from("profiles")
    .update({ has_seen_tour: false })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}
