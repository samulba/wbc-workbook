import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "./_components/DashboardHeader";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { AchievementWatcher } from "@/components/achievements/AchievementWatcher";
import { WelcomeTour } from "@/components/tour/WelcomeTour";
import { touchStreak, checkAndUnlockAchievements } from "@/lib/achievements/service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Streak + passive achievement check (non-blocking for UX)
  await touchStreak(user.id).catch(() => {});
  await checkAndUnlockAchievements(user.id, "activity").catch(() => {});

  // Parallel: favorite count + profile role + tour flag
  const [{ count: favoriteCount }, { data: profile }] = await Promise.all([
    supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("profiles")
      .select("role, has_seen_tour")
      .eq("id", user.id)
      .single(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <DashboardHeader
        email={user.email!}
        favoriteCount={favoriteCount ?? 0}
        isAdmin={profile?.role === "admin"}
      />
      <main>{children}</main>
      <FeedbackWidget />
      <AchievementWatcher />
      <WelcomeTour autoStart={profile?.has_seen_tour === false} />
    </div>
  );
}
