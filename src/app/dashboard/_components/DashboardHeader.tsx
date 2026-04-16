"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { DashboardNav } from "./DashboardNav";

interface Props {
  email: string;
  favoriteCount: number;
}

export function DashboardHeader({ email, favoriteCount }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-md border-b border-sand/30">
        {/* Top row: logo + user */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex flex-col leading-none group">
            <span className="font-headline text-lg text-forest tracking-wide group-hover:text-forest/80 transition-colors">
              Wellbeing Workbook
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-sand font-sans hidden sm:block">
              Raumgestaltung
            </span>
          </Link>

          {/* Desktop: email + logout */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex flex-col items-end leading-none">
              <span className="text-xs text-gray/60 font-sans uppercase tracking-wider">
                Angemeldet als
              </span>
              <span className="text-sm text-forest font-sans truncate max-w-[180px]">
                {email}
              </span>
            </div>
            <div className="h-6 w-px bg-sand/40" />
            <LogoutButton />
          </div>

          {/* Mobile: hamburger — 44px touch target */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="sm:hidden w-11 h-11 flex items-center justify-center rounded-xl -mr-1 hover:bg-sand/15 active:bg-sand/25 transition-colors"
            aria-label="Menü öffnen"
          >
            <Menu className="w-5 h-5 text-forest" strokeWidth={1.5} />
          </button>
        </div>

        {/* Sub-nav row — scrollable on mobile */}
        <div className="border-t border-sand/20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-10 flex items-stretch overflow-x-auto no-scrollbar">
            <DashboardNav favoriteCount={favoriteCount} />
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-cream border-l border-sand/30 flex flex-col shadow-warm-lg">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-sand/20 shrink-0">
              <span className="font-headline text-base text-ink">Konto</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-11 h-11 flex items-center justify-center rounded-xl -mr-1 hover:bg-sand/15 transition-colors"
                aria-label="Menü schließen"
              >
                <X className="w-4 h-4 text-forest" strokeWidth={1.5} />
              </button>
            </div>

            {/* Email */}
            <div className="px-5 py-5 border-b border-sand/20">
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-sand mb-1.5">
                Angemeldet als
              </p>
              <p className="text-sm text-forest font-sans break-all leading-relaxed">
                {email}
              </p>
            </div>

            <div className="flex-1" />

            {/* Logout */}
            <div className="px-4 py-5 border-t border-sand/20">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
