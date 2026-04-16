import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the incoming request comes from a logged-in admin.
 * Returns the user object on success, null on failure.
 */
export async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return user;
}
