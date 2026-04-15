import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";
import { Shield } from "lucide-react";
import { AdminSidebarNav } from "./_components/AdminSidebarNav";

export const metadata = { title: "Admin – Wellbeing Workbook" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Double-check role in layout (middleware already guards, this is defence-in-depth)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 flex flex-col bg-[#1a2a1c] sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="px-4 py-5 border-b border-white/8">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-md bg-mint/20 border border-mint/30 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-mint" strokeWidth={1.5} />
            </div>
            <div className="leading-none">
              <p className="text-[11px] font-sans font-semibold text-white tracking-wide">
                Admin-Bereich
              </p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
                Wellbeing WB
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <AdminSidebarNav />

        {/* Footer: back to app */}
        <div className="px-3 py-4 border-t border-white/8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="text-xs">Zur App</span>
          </Link>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-10 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
            Admin-Bereich
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:block truncate max-w-[200px]">
              {user.email}
            </span>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <LogoutButton />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
