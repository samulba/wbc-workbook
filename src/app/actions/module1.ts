"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Module1Partial } from "@/lib/types/module1";

export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string };

export async function saveModule1Step(
  moduleId: string,
  data: Module1Partial
): Promise<SaveResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("module1_analysis")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", moduleId);

  if (error) {
    console.error("module1 save error:", error);
    return { ok: false, error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }

  return { ok: true, savedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) };
}
