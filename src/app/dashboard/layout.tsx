import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-cream/90 backdrop-blur-md border-b border-sand/40">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex flex-col leading-none group">
            <span className="font-headline text-lg text-forest tracking-wide group-hover:text-forest/80 transition-colors">
              Wellbeing Workbook
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-sand font-sans">
              Raumgestaltung
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-none">
              <span className="text-xs text-gray/60 font-sans uppercase tracking-wider">
                Angemeldet als
              </span>
              <span className="text-sm text-forest font-sans truncate max-w-[180px]">
                {user.email}
              </span>
            </div>
            <div className="h-6 w-px bg-sand/40 hidden sm:block" />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
