import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// GET /api/achievements/summary
// Returns totals + progress + the 3 most recently unlocked achievements.
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const [{ data: all }, { data: unlocked }] = await Promise.all([
    admin.from("achievements").select("id, points"),
    admin
      .from("user_achievements")
      .select(`unlocked_at, achievement:achievements ( key, name, icon, points )`)
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false }),
  ]);

  const total      = all?.length ?? 0;
  const unlockedN  = unlocked?.length ?? 0;
  const totalPts   = (all ?? []).reduce((s, a) => s + (a.points ?? 0), 0);
  const userPts    = (unlocked ?? []).reduce((s, r) => {
    const a = r.achievement as unknown as { points?: number } | null;
    return s + (a?.points ?? 0);
  }, 0);
  const last3 = (unlocked ?? []).slice(0, 3);

  return NextResponse.json({
    unlocked:   unlockedN,
    total,
    points:     userPts,
    pointsMax:  totalPts,
    recent:     last3,
  });
}
