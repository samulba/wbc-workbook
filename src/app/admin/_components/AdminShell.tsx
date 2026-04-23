"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Menu, X, ArrowLeft, Sun, Moon } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  email:    string;
  children: React.ReactNode;
}

function SidebarBrand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-mint/20 border border-mint/30 flex items-center justify-center shrink-0">
        <Shield className="w-3.5 h-3.5 text-mint" strokeWidth={1.5} />
      </div>
      <span className="text-sm font-semibold text-white tracking-tight">
        Admin
      </span>
    </Link>
  );
}

function SidebarFooter() {
  return (
    <div className="px-3 py-3 border-t border-white/10">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-3 h-9 rounded-md text-white/60 hover:bg-white/5 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
        <span className="text-xs font-medium">Zur App</span>
      </Link>
    </div>
  );
}

export function AdminShell({ email, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    // Full-viewport shell: outer is exactly h-screen so the sidebar never
    // scrolls out of view. Inner main-column handles its own vertical overflow.
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-forest h-full">
        <div className="h-14 px-4 flex items-center border-b border-white/10 shrink-0">
          <SidebarBrand />
        </div>
        <AdminSidebarNav />
        <SidebarFooter />
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-60 flex flex-col bg-forest">
            <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <SidebarBrand />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/70" strokeWidth={1.5} />
              </button>
            </div>
            <AdminSidebarNav />
            <SidebarFooter />
          </aside>
        </div>
      )}

      {/* ── Main area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="sticky top-0 z-10 h-14 bg-white dark:bg-gray-900 border-b-2 border-forest/80 dark:border-mint/30 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Navigation öffnen"
            >
              <Menu className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </button>
            <h1 className="text-sm font-semibold text-forest dark:text-mint tracking-tight">
              Admin-Bereich
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block truncate max-w-[220px] mr-2">
              {email}
            </span>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "Heller Modus" : "Dunkler Modus"}
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {theme === "dark"
                ? <Sun  className="w-4 h-4" strokeWidth={1.5} />
                : <Moon className="w-4 h-4" strokeWidth={1.5} />
              }
            </button>

            <LogoutButton />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
