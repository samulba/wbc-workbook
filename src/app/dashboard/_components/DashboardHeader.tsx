"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart, FolderOpen, ChevronDown, Menu, X,
  User, Settings, LogOut, Sun, Moon, Sparkles, ShieldCheck, ShoppingBag,
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
  { href: "/dashboard",             label: "Projekte",    Icon: FolderOpen,  exact: true,  key: "nav-projekte"    },
  { href: "/dashboard/favoriten",   label: "Favoriten",   Icon: Heart,       exact: false, key: "nav-favoriten"   },
  { href: "/dashboard/shopping",    label: "Shopping",    Icon: ShoppingBag, exact: false, key: "nav-shopping"    },
  { href: "/dashboard/inspiration", label: "Inspiration", Icon: Sparkles,    exact: false, key: "nav-inspiration" },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  email:         string;
  favoriteCount: number;
  isAdmin?:      boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardHeader({ email, favoriteCount, isAdmin = false }: Props) {
  const pathname          = usePathname();
  const router            = useRouter();
  const { theme, toggle } = useTheme();
  const [dropOpen, setDropOpen] = useState(false);   // desktop avatar dropdown
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile full-screen drawer
  const dropRef   = useRef<HTMLDivElement>(null);
  const initials  = getInitials(email);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [dropOpen]);

  // Close menus on ESC + on route change
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setDropOpen(false); setDrawerOpen(false); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setDropOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  // Admin shortcut: Cmd/Ctrl + Shift + A
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
    setDropOpen(false);
    setDrawerOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-[var(--bg-page)] border-b border-[var(--border-page)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3 sm:gap-4">

          {/* ── Logo ──────────────────────────────────────────── */}
          <Link
            href="/dashboard"
            className="font-headline text-forest hover:text-forest/75 transition-colors whitespace-nowrap leading-none shrink-0"
            aria-label="Wellbeing Workbook"
          >
            {/* Full name on sm+, initials on mobile */}
            <span className="hidden sm:inline text-[1.1rem]">Wellbeing Workbook</span>
            <span className="sm:hidden inline-flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-md bg-forest text-cream flex items-center justify-center text-[12px] font-bold">
                WB
              </span>
            </span>
          </Link>

          {/* ── Desktop nav (hidden on mobile) ────────────────── */}
          <nav className="hidden sm:flex items-center justify-center gap-0.5 flex-1">
            {NAV_ITEMS.map(({ href, label, Icon, exact, key }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              const isFav    = href === "/dashboard/favoriten";
              return (
                <Link
                  key={href}
                  href={href}
                  data-tour={key}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-sans font-medium transition-all duration-150",
                    isActive
                      ? "bg-forest text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/8",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 shrink-0",
                      isFav && isActive ? "fill-white text-white" : "",
                    )}
                    strokeWidth={isFav && isActive ? 0 : 1.5}
                  />
                  <span>{label}</span>
                  {isFav && favoriteCount > 0 && (
                    <span className={cn(
                      "min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold leading-none flex items-center justify-center",
                      isActive ? "bg-white/30 text-white" : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400",
                    )}>
                      {favoriteCount > 99 ? "99+" : favoriteCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Spacer on mobile pushes actions to the right */}
          <div className="flex-1 sm:hidden" />

          {/* ── Right side ────────────────────────────────────── */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Achievement badge (desktop only) */}
            <div className="hidden sm:block">
              <HeaderBadge />
            </div>

            {/* Theme toggle (desktop only) */}
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "Zum hellen Modus wechseln" : "Zum dunklen Modus wechseln"}
              className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {theme === "dark"
                ? <Sun  className="w-4 h-4" strokeWidth={1.5} />
                : <Moon className="w-4 h-4" strokeWidth={1.5} />
              }
            </button>

            {/* Avatar + dropdown (desktop) */}
            <div ref={dropRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setDropOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={dropOpen}
                className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-forest/12 border border-forest/20 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-sans font-semibold text-forest leading-none">{initials}</span>
                </div>
                <ChevronDown
                  className={cn("w-3.5 h-3.5 text-gray-400 transition-transform duration-150", dropOpen && "rotate-180")}
                />
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#404040] rounded-xl shadow-lg shadow-black/5 dark:shadow-black/40 overflow-hidden z-50">
                  <div className="px-3.5 py-3 border-b border-gray-100 dark:border-[#383838] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-forest/12 border border-forest/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-sans font-semibold text-forest">{initials}</span>
                    </div>
                    <p className="text-xs font-sans text-gray-600 dark:text-gray-400 truncate leading-tight">{email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard/profil"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-sans text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[40px]"
                    >
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                      Profil bearbeiten
                    </Link>
                    <Link
                      href="/dashboard/einstellungen"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-sans text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[40px]"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                      Einstellungen
                    </Link>

                    <button
                      type="button"
                      onClick={() => { toggle(); setDropOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-sans text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[40px]"
                    >
                      {theme === "dark"
                        ? <Sun  className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                        : <Moon className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                      }
                      {theme === "dark" ? "Heller Modus" : "Dunkler Modus"}
                    </button>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-sans text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-h-[40px]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                        Admin
                      </Link>
                    )}
                  </div>

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

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Menü öffnen"
              className="sm:hidden w-11 h-11 rounded-lg flex items-center justify-center text-forest hover:bg-forest/5 transition-colors"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      {drawerOpen && (
        <MobileDrawer
          email={email}
          initials={initials}
          isAdmin={isAdmin}
          theme={theme}
          toggleTheme={toggle}
          favoriteCount={favoriteCount}
          pathname={pathname}
          onClose={() => setDrawerOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

// ── Mobile drawer ─────────────────────────────────────────────────────────────

function MobileDrawer({
  email, initials, isAdmin, theme, toggleTheme, favoriteCount, pathname,
  onClose, onLogout,
}: {
  email:         string;
  initials:      string;
  isAdmin:       boolean;
  theme:         "light" | "dark";
  toggleTheme:   () => void;
  favoriteCount: number;
  pathname:      string;
  onClose:       () => void;
  onLogout:      () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm wbc-drawer-fade"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-[88vw] max-w-[360px] bg-[var(--bg-page)] shadow-2xl flex flex-col wbc-drawer-slide">

        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border-page)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-forest/12 border border-forest/20 flex items-center justify-center">
              <span className="text-xs font-sans font-bold text-forest">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-sans text-gray-500 truncate">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menü schließen"
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 text-gray-500"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            const isFav    = href === "/dashboard/favoriten";
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 h-12 px-4 rounded-xl text-base font-sans font-medium transition-colors",
                  isActive
                    ? "bg-forest text-white"
                    : "text-forest/80 hover:bg-forest/5",
                )}
              >
                <Icon
                  className={cn("w-5 h-5 shrink-0", isFav && isActive ? "fill-white text-white" : "")}
                  strokeWidth={isFav && isActive ? 0 : 1.5}
                />
                <span className="flex-1">{label}</span>
                {isFav && favoriteCount > 0 && (
                  <span className={cn(
                    "min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold leading-none flex items-center justify-center",
                    isActive ? "bg-white/30 text-white" : "bg-forest/15 text-forest",
                  )}>
                    {favoriteCount > 99 ? "99+" : favoriteCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="h-px bg-[var(--border-page)] my-3" />

          <Link
            href="/dashboard/profil"
            onClick={onClose}
            className="flex items-center gap-3 h-12 px-4 rounded-xl text-base font-sans text-forest/80 hover:bg-forest/5 transition-colors"
          >
            <User className="w-5 h-5 text-forest/50" strokeWidth={1.5} />
            <span>Profil</span>
          </Link>

          <Link
            href="/dashboard/einstellungen"
            onClick={onClose}
            className="flex items-center gap-3 h-12 px-4 rounded-xl text-base font-sans text-forest/80 hover:bg-forest/5 transition-colors"
          >
            <Settings className="w-5 h-5 text-forest/50" strokeWidth={1.5} />
            <span>Einstellungen</span>
          </Link>

          <button
            type="button"
            onClick={() => { toggleTheme(); }}
            className="w-full flex items-center gap-3 h-12 px-4 rounded-xl text-base font-sans text-forest/80 hover:bg-forest/5 transition-colors text-left"
          >
            {theme === "dark"
              ? <Sun  className="w-5 h-5 text-forest/50" strokeWidth={1.5} />
              : <Moon className="w-5 h-5 text-forest/50" strokeWidth={1.5} />
            }
            <span>{theme === "dark" ? "Heller Modus" : "Dunkler Modus"}</span>
          </button>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 h-12 px-4 rounded-xl text-base font-sans text-forest/80 hover:bg-forest/5 transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-forest/50" strokeWidth={1.5} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Footer — logout */}
        <div className="p-3 border-t border-[var(--border-page)] shrink-0 pb-safe">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 h-12 px-4 rounded-xl text-base font-sans text-terracotta hover:bg-terracotta/5 transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span>Abmelden</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes wbc-drawer-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes wbc-drawer-slide {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        :global(.wbc-drawer-fade)  { animation: wbc-drawer-fade  180ms ease-out; }
        :global(.wbc-drawer-slide) { animation: wbc-drawer-slide 260ms cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </div>
  );
}
