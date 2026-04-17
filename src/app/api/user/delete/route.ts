import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// POST /api/user/delete — permanent account deletion (DSGVO Art. 17)
// Uses CASCADE deletes (profiles.id → auth.users.id on delete cascade,
// projects/favorites/etc. → profiles.id on delete cascade) to clean up
// all linked data in a single auth.admin.deleteUser() call.

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const admin = createAdminClient();

  // 1. Best-effort: clean up user-owned storage objects that are not covered
  //    by CASCADE (Supabase storage is separate from the DB).
  const BUCKETS = ["moodboards", "room-photos", "inspiration", "renders"];
  for (const bucket of BUCKETS) {
    try {
      const { data: files } = await admin.storage.from(bucket).list(user.id, {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      });
      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await admin.storage.from(bucket).remove(paths);
      }
    } catch {
      /* ignore missing buckets */
    }
  }

  // 2. Sign out the current session before the auth user is deleted.
  await supabase.auth.signOut();

  // 3. Hard-delete the auth user. CASCADE on profiles.id → auth.users.id
  //    and all downstream FKs (projects, favorites, shopping_lists, etc.)
  //    clean up the remaining rows automatically.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("deleteAccount failed:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
