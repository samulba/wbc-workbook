"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ProfileResult   = { ok: true; message?: string } | { ok: false; error: string };
export type PasswordResult  = { ok: true } | { ok: false; error: string };

export async function updateDisplayName(
  _prev: ProfileResult | null,
  formData: FormData
): Promise<ProfileResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = (formData.get("fullName") as string)?.trim();
  if (!fullName) return { ok: false, error: "Bitte gib einen Namen ein." };

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/profil");
  return { ok: true, message: "Name gespeichert." };
}

export async function updatePassword(
  _prev: PasswordResult | null,
  formData: FormData
): Promise<PasswordResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const newPassword     = (formData.get("newPassword") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  if (!newPassword) return { ok: false, error: "Bitte gib ein neues Passwort ein." };
  if (newPassword.length < 8) return { ok: false, error: "Passwort muss mindestens 8 Zeichen haben." };
  if (newPassword !== confirmPassword) return { ok: false, error: "Passwörter stimmen nicht überein." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteAccount(_prev: ProfileResult | null, _formData: FormData): Promise<ProfileResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Sign out first
  await supabase.auth.signOut();

  // Note: full account deletion requires admin/service-role key
  // This placeholder signs the user out with a clear message
  redirect("/login?deleted=true");
}
