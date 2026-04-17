"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart, FolderOpen, ChevronDown,
  User, Settings, LogOut, Sun, Moon, Sparkles, ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { HeaderBadge } from "@/components/achievements/HeaderBadge";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(email: string): string {
  const local = email.split("@")[0];
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard",             label: "Projekte",    Icon: FolderOpen, exact: true  },
  { href: "/dashboard/favoriten",   label: "Favoriten",   Icon: Heart,      exact: false },
  { href: "/dashboard/inspiration", label: "Inspiration", Icon: Sparkles,   exact: false },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  email:         string;
  favoriteCount: number;
  isAdmin?:      boolean;
}

export function DashboardHeader({ email, favoriteCount, isAdmin = false }: Props) {
  const pathname    = usePathname();
  const router      = useRouter();
  const { theme, toggle } = useTheme();
  const [open, setOpen]   = useState(false);
  const dropRef     = useRef<HTMLDivElement>(null);
  const initials    = getInitials(email);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Admin shortcut: Cmd/Ctrl + Shift + A → /admin (admins only)
  useEffect(() => {
    if (!isAdmin) return;
    function onAdminShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        router.push("/admin");
      }
    }
    document.addEventListener("keydown", onAdminShortcut);
    return () => document.removeEventListener("keydown", onAdminShortcut);
  }, [isAdmin, router]);

  async function handleLogout() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-[var(--bg-page)] border-b border-[var(--border-page)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 grid grid-cols-[auto_1fr_auto] items-center gap-4">

        {/* ── Logo ──────────────────────────────────────────── */}
        <Link
          href="/dashboard"
          className="font-headline text-[1.1rem] text-forest hover:text-forest/75 transition-colors whitespace-nowrap leading-none"
        >
          Wellbeing Workbook
        </Link>

        {/* ── Center nav ────────────────────────────────────── */}
        <nav className="flex items-center justify-center gap-0.5">
          {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname.startsWith(href);
            const isFav = href === "/dashboard/favoriten";

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-sans font-medium transition-all duration-150",
                  isActive
                    ? "bg-forest text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/8"
                )}
              >
                <Icon
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    isFav && isActive ? "fill-white text-white" : ""
                  )}
                  strokeWidth={isFav && isActive ? 0 : 1.5}
                />
                <span className="hidden xs:inline sm:inline">{label}</span>
                {isFav && favoriteCount > 0 && (
                  <span
                    className={cn(
                      "min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold leading-none flex items-center justify-center",
                      isActive
                        ? "bg-white/30 text-white"
                        : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {favoriteCount > 99 ? "99+" : favoriteCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right side: theme toggle + avatar ─────────────── */}
        <div className="flex items-center gap-1">

          {/* Achievement points badge */}
          <HeaderBadge />

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Zum hellen Modus wechseln" : "Zum dunklen Modus wechseln"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {theme === "dark"
              ? <Sun  className="w-4 h-4" strokeWidth={1.5} />
              : <Moon className="w-4 h-4" strokeWidth={1.5} />
            }
          </button>

          {/* Avatar + dropdown */}
          <div ref={dropRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={open}
              className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
            >
              {/* Initials circle */}
              <div className="w-7 h-7 rounded-full bg-forest/12 border border-forest/20 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-sans font-semibold text-forest leading-none">
                  {initials}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-gray-400 transition-transform duration-150 hidden sm:block",
                  open && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown panel */}
            {open && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#404040] rounded-xl shadow-lg shadow-black/5 dark:shadow-black/40 overflow-hidden z-50">

                {/* Email header */}
                <div className="px-3.5 py-3 border-b border-gray-100 dark:border-[#383838] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-forest/12 border border-forest/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-sans font-semibold text-forest">{initials}</span>
                  </div>
                  <p className="text-xs font-sans text-gray-600 dark:text-gray-400 truncate leading-tight">{email}</p>
                </div>

                {/* Links */}
                <div className="py-1">
                  <Link
                    href="/dashboard/profil"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-sans text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[40px]"
                  >
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                    Profil bearbeiten
                  </Link>
                  <Link
                    href="/dashboard/einstellungen"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-sans text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[40px]"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                    Einstellungen
                  </Link>

                  {/* Dark mode toggle */}
                  <button
                    type="button"
                    onClick={() => { toggle(); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-sans text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[40px]"
                  >
                    {theme === "dark"
                      ? <Sun  className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                      : <Moon className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                    }
                    {theme === "dark" ? "Heller Modus" : "Dunkler Modus"}
                  </button>

                  {/* Admin link – only visible to admins */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-sans text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[40px]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                      Admin
                    </Link>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 dark:border-[#383838] py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-sans text-terracotta hover:bg-terracotta/5 transition-colors min-h-[40px]"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                    Abmelden
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
