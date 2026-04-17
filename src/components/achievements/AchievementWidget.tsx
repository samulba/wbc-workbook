import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

export async function AchievementWidget() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const [{ data: all }, { data: unlocked }] = await Promise.all([
    admin.from("achievements").select("id, points"),
    admin
      .from("user_achievements")
      .select(`
        unlocked_at,
        achievement:achievements ( key, name, icon, points )
      `)
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false }),
  ]);

  const total      = all?.length ?? 0;
  const unlockedN  = unlocked?.length ?? 0;
  const percent    = total > 0 ? Math.round((unlockedN / total) * 100) : 0;
  const points     = (unlocked ?? []).reduce((s, r) => {
    const a = r.achievement as unknown as { points?: number } | null;
    return s + (a?.points ?? 0);
  }, 0);

  // SVG progress ring
  const size        = 72;
  const strokeWidth = 6;
  const radius      = (size - strokeWidth) / 2;
  const circ        = 2 * Math.PI * radius;
  const dashOffset  = circ * (1 - percent / 100);

  return (
    <Link
      href="/dashboard/achievements"
      className="group flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-md transition-all"
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            stroke="url(#gradient)"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-sans uppercase tracking-[0.15em] text-gray-400 mb-0.5">
          Deine Achievements
        </p>
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight">
          {unlockedN} / {total} freigeschaltet
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-1">
          {points} Punkte
        </p>
      </div>

      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
