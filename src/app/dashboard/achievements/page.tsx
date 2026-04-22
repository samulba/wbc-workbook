import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, Lock, Trophy, Rocket, Palette, Camera, Star, Gem,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { redirect } from "next/navigation";
import { AchievementIcon } from "@/components/achievements/AchievementIcon";

export const metadata: Metadata = { title: "Achievements" };

const CATEGORY_LABELS: Record<string, { label: string; Icon: LucideIcon }> = {
  erste_schritte: { label: "Erste Schritte", Icon: Rocket  },
  design:         { label: "Design-Profi",   Icon: Palette },
  visuell:        { label: "Visuell",        Icon: Camera  },
  meisterklasse:  { label: "Meisterklasse",  Icon: Trophy  },
  engagement:     { label: "Engagement",     Icon: Star    },
  geheim:         { label: "Geheim",         Icon: Gem     },
};

const CATEGORY_ORDER = [
  "erste_schritte",
  "design",
  "visuell",
  "meisterklasse",
  "engagement",
  "geheim",
];

export default async function AchievementsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const [{ data: all }, { data: unlocked }] = await Promise.all([
    admin.from("achievements").select("*").order("sort_order"),
    admin
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", user.id),
  ]);

  type Ach = {
    id: string; key: string; name: string; description: string; icon: string;
    category: string; points: number; is_secret: boolean; sort_order: number;
  };
  const achievements = (all ?? []) as Ach[];
  const unlockedMap = new Map<string, string>(
    (unlocked ?? []).map((u) => [u.achievement_id, u.unlocked_at]),
  );

  const totalUnlocked = unlockedMap.size;
  const totalCount    = achievements.length;
  const totalPoints   = achievements
    .filter((a) => unlockedMap.has(a.id))
    .reduce((s, a) => s + a.points, 0);
  const maxPoints = achievements.reduce((s, a) => s + a.points, 0);

  const percent = totalCount > 0 ? Math.round((totalUnlocked / totalCount) * 100) : 0;

  // Group by category
  const byCategory = new Map<string, Ach[]>();
  for (const a of achievements) {
    if (!byCategory.has(a.category)) byCategory.set(a.category, []);
    byCategory.get(a.category)!.push(a);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück zum Dashboard
      </Link>

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-sans uppercase tracking-[0.2em] text-gray-400 mb-2">
          Fortschritt
        </p>
        <h1 className="font-headline text-4xl sm:text-5xl text-forest dark:text-mint leading-none mb-4">
          Deine Achievements
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl">
          Meilensteine auf deinem Weg zum perfekten Raumkonzept.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          icon={<Trophy className="w-5 h-5 text-amber-500" strokeWidth={1.5} />}
          value={`${totalUnlocked} / ${totalCount}`}
          label="Freigeschaltet"
        />
        <StatCard
          value={`${totalPoints}`}
          valueSuffix={<span className="text-sm text-gray-400"> / {maxPoints} Pkt.</span>}
          label="Punkte"
        />
        <StatCard
          value={`${percent}%`}
          label="Fortschritt"
          progress={percent}
        />
      </div>

      {/* Categories */}
      <div className="space-y-10">
        {CATEGORY_ORDER.map((cat) => {
          const items = byCategory.get(cat);
          if (!items || items.length === 0) return null;
          const meta = CATEGORY_LABELS[cat] ?? { label: cat, Icon: Trophy };
          const CatIcon = meta.Icon;

          return (
            <section key={cat}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-8 h-8 rounded-lg bg-forest/8 dark:bg-mint/10 border border-forest/10 dark:border-mint/15 flex items-center justify-center shrink-0">
                  <CatIcon className="w-4 h-4 text-forest dark:text-mint" strokeWidth={1.75} />
                </span>
                <h2 className="font-headline text-2xl text-forest dark:text-mint">
                  {meta.label}
                </h2>
                <span className="text-xs text-gray-400 ml-1">
                  {items.filter((a) => unlockedMap.has(a.id)).length} / {items.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((a) => {
                  const unlockedAt = unlockedMap.get(a.id);
                  const isUnlocked = !!unlockedAt;
                  const isHidden   = !isUnlocked && a.is_secret;

                  return (
                    <div
                      key={a.id}
                      className={`relative rounded-2xl border p-5 transition-all ${
                        isUnlocked
                          ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-500/30 shadow-sm"
                          : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isUnlocked
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}>
                          {isUnlocked ? (
                            <AchievementIcon
                              name={a.icon}
                              className="w-5 h-5 text-white"
                              strokeWidth={2}
                            />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-tight ${
                            isUnlocked
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}>
                            {isHidden ? "???" : a.name}
                          </p>
                          <p className={`text-xs mt-1 leading-snug ${
                            isUnlocked
                              ? "text-gray-600 dark:text-gray-300"
                              : "text-gray-400 dark:text-gray-500"
                          }`}>
                            {isHidden ? "Geheime Aufgabe — schalte sie durch Erkunden frei." : a.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[11px] font-mono font-medium ${
                              isUnlocked ? "text-amber-600 dark:text-amber-400" : "text-gray-400"
                            }`}>
                              {a.points} Pkt.
                            </span>
                            {unlockedAt && (
                              <span className="text-[10px] text-gray-400">
                                · {new Date(unlockedAt).toLocaleDateString("de-DE")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  valueSuffix,
  label,
  progress,
}: {
  icon?:        React.ReactNode;
  value:        string;
  valueSuffix?: React.ReactNode;
  label:        string;
  progress?:    number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        {value}
        {valueSuffix}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
