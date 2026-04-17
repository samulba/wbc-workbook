import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// GET /api/achievements/unseen — returns unseen unlocks for the current user
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [] });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_achievements")
    .select(`
      id, unlocked_at,
      achievement:achievements ( key, name, description, icon, points, category )
    `)
    .eq("user_id", user.id)
    .eq("seen", false)
    .order("unlocked_at", { ascending: true });

  if (error) return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

// POST /api/achievements/unseen — marks a list of user_achievement ids as seen
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { ids } = await req.json().catch(() => ({ ids: [] }));
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  await admin
    .from("user_achievements")
    .update({ seen: true })
    .eq("user_id", user.id)
    .in("id", ids);

  return NextResponse.json({ ok: true });
}
