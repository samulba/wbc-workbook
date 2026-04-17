import "server-only";
import { createAdminClient } from "@/lib/supabase/admin-client";

// ── Types ────────────────────────────────────────────────────────────────────

export type Trigger =
  | "account_created"
  | "project_created"
  | "room_created"
  | "module1_updated"
  | "before_after_updated"
  | "render_created"
  | "feedback_submitted"
  | "activity";                 // generic check (used for streak / night-work)

export interface UnlockedAchievement {
  key:    string;
  name:   string;
  icon:   string;
  points: number;
}

type Stats = Record<string, number>;

// ── Public API ───────────────────────────────────────────────────────────────

export async function checkAndUnlockAchievements(
  userId: string,
  trigger: Trigger = "activity",
): Promise<UnlockedAchievement[]> {
  if (!userId) return [];
  void trigger; // reserved for future trigger-scoped optimization

  const admin = createAdminClient();

  const [{ data: all }, { data: owned }] = await Promise.all([
    admin
      .from("achievements")
      .select("id, key, name, icon, points, requirement_type, requirement_value")
      .order("sort_order"),
    admin.from("user_achievements").select("achievement_id").eq("user_id", userId),
  ]);

  if (!all || all.length === 0) return [];

  const ownedIds = new Set((owned ?? []).map((r) => r.achievement_id));
  const pending  = all.filter((a) => !ownedIds.has(a.id));
  if (pending.length === 0) return [];

  const stats = await computeStats(userId);

  const toUnlock = pending.filter(
    (a) => (stats[a.requirement_type] ?? 0) >= a.requirement_value,
  );
  if (toUnlock.length === 0) return [];

  const { error } = await admin.from("user_achievements").insert(
    toUnlock.map((a) => ({
      user_id:        userId,
      achievement_id: a.id,
      seen:           false,
    })),
  );

  if (error) {
    console.error("[achievements] insert failed", error.message);
    return [];
  }

  return toUnlock.map((a) => ({
    key:    a.key,
    name:   a.name,
    icon:   a.icon,
    points: a.points,
  }));
}

// ── Stats ────────────────────────────────────────────────────────────────────

async function computeStats(userId: string): Promise<Stats> {
  const admin = createAdminClient();
  const hour  = new Date().getHours();

  const [
    { data: profile },
    { count: projectCount },
    { data: rooms },
    { count: feedbackCount },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, current_streak")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    admin
      .from("rooms")
      .select(`
        id, before_image_url, after_image_url, rendered_images,
        projects!inner(user_id),
        module1_analysis(
          current_step, moodboard_urls, color_preferences, material_preferences,
          color_notes, material_notes, current_situation, moodboard_notes, notes
        )
      `)
      .eq("projects.user_id", userId),
    admin
      .from("user_feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  type RoomRow = {
    before_image_url:  string | null;
    after_image_url:   string | null;
    rendered_images:   string[] | null;
    module1_analysis:  Array<{
      current_step:        number | null;
      moodboard_urls:      string[] | null;
      color_preferences:   string[] | null;
      material_preferences:string[] | null;
      color_notes:         string | null;
      material_notes:      string | null;
      current_situation:   string | null;
      moodboard_notes:     string | null;
      notes:               string | null;
    }> | null;
  };

  const roomsArr = (rooms ?? []) as unknown as RoomRow[];

  const m1 = (r: RoomRow) => r.module1_analysis?.[0] ?? null;

  const moodboardCount = roomsArr.reduce(
    (acc, r) => acc + (m1(r)?.moodboard_urls?.length ?? 0),
    0,
  );
  const beforeAfterCount = roomsArr.filter(
    (r) => r.before_image_url && r.after_image_url,
  ).length;
  const renderCount = roomsArr.reduce(
    (acc, r) => acc + (r.rendered_images?.length ?? 0),
    0,
  );
  const module1Complete = roomsArr.some((r) => (m1(r)?.current_step ?? 0) >= 11)
    ? 1
    : 0;
  const colorPicks = roomsArr.reduce(
    (acc, r) => acc + (m1(r)?.color_preferences?.length ?? 0),
    0,
  );
  const materialPicks = roomsArr.reduce(
    (acc, r) => acc + (m1(r)?.material_preferences?.length ?? 0),
    0,
  );
  const perfectionist = roomsArr.some((r) => {
    const rec = m1(r);
    return !!rec
      && !!rec.color_notes
      && !!rec.material_notes
      && !!rec.current_situation
      && !!rec.moodboard_notes
      && !!rec.notes;
  })
    ? 1
    : 0;

  return {
    account_created:     profile ? 1 : 0,
    project_count:       projectCount  ?? 0,
    room_count:          roomsArr.length,
    module1_complete:    module1Complete,
    moodboard_urls:      moodboardCount,
    before_after:        beforeAfterCount,
    render_count:        renderCount,
    feedback_count:      feedbackCount ?? 0,
    streak_days:         profile?.current_streak ?? 0,
    night_work:          hour >= 2 && hour < 4 ? 1 : 0,
    perfectionist:       perfectionist,
    color_palette_picks: colorPicks,
    material_picks:      materialPicks,
  };
}

// ── Streak ───────────────────────────────────────────────────────────────────

/**
 * Updates the user's streak counter based on today's activity.
 * Safe to call on every authenticated request — uses same-day short-circuit.
 */
export async function touchStreak(userId: string): Promise<void> {
  if (!userId) return;
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("last_active_date, current_streak, longest_streak")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return;

  const today     = new Date();
  const todayStr  = today.toISOString().slice(0, 10);
  const lastStr   = profile.last_active_date as string | null;

  if (lastStr === todayStr) return; // already counted today

  let nextStreak: number;
  if (lastStr) {
    const last = new Date(lastStr + "T00:00:00Z");
    const diff = Math.floor(
      (Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
        - last.getTime()) / 86_400_000,
    );
    nextStreak = diff === 1 ? (profile.current_streak ?? 0) + 1 : 1;
  } else {
    nextStreak = 1;
  }

  const longest = Math.max(profile.longest_streak ?? 0, nextStreak);

  await admin
    .from("profiles")
    .update({
      last_active_date: todayStr,
      current_streak:   nextStreak,
      longest_streak:   longest,
    })
    .eq("id", userId);
}
