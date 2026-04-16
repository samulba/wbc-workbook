"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AdminSidebarNav } from "./AdminSidebarNav";

interface Props {
  email: string;
  children: React.ReactNode;
}

export function AdminShell({ email, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-[#1a2a1c] sticky top-0 h-screen overflow-y-auto">
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

        {/* Footer */}
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

      {/* ── Mobile sidebar overlay ───────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-56 flex flex-col bg-[#1a2a1c] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-mint/20 border border-mint/30 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-mint" strokeWidth={1.5} />
                </div>
                <p className="text-[11px] font-sans font-semibold text-white tracking-wide">Admin-Bereich</p>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
              </button>
            </div>
            <AdminSidebarNav />
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
        </div>
      )}

      {/* ── Main area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-10 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          {/* Mobile: hamburger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Navigation öffnen"
            >
              <Menu className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
            </button>
            <h1 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
              Admin-Bereich
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:block truncate max-w-[200px]">
              {email}
            </span>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
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
