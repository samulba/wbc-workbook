"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Menu, X, ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AdminSidebarNav } from "./AdminSidebarNav";

interface Props {
  email:    string;
  children: React.ReactNode;
}

function SidebarBrand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 group">
      <div className="w-7 h-7 rounded-md bg-mint/20 border border-mint/30 flex items-center justify-center shrink-0">
        <Shield className="w-3.5 h-3.5 text-mint" strokeWidth={1.5} />
      </div>
      <div className="leading-none">
        <p className="text-[11px] font-sans font-semibold text-white tracking-wide">Admin-Bereich</p>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Wellbeing WB</p>
      </div>
    </Link>
  );
}

function SidebarFooter() {
  return (
    <div className="px-3 py-4 border-t border-white/8">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
        <span className="text-xs font-sans">Zur App</span>
      </Link>
    </div>
  );
}

export function AdminShell({ email, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-[#111a12] dark:bg-[#0d1410] sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 py-5 border-b border-white/8">
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
          <aside className="absolute left-0 top-0 bottom-0 w-60 flex flex-col bg-[#111a12] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
              <SidebarBrand />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
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
        <header className="sticky top-0 z-10 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Navigation öffnen"
            >
              <Menu className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </button>
            <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide uppercase">
              Admin-Bereich
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block truncate max-w-[200px]">
              {email}
            </span>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <LogoutButton />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
