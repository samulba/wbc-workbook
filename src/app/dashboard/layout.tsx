import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "./_components/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Favorite count for nav badge
  const { count: favoriteCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <DashboardHeader
        email={user.email!}
        favoriteCount={favoriteCount ?? 0}
      />
      <main>{children}</main>
    </div>
  );
}
