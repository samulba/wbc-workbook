"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Shield, Bell, Scale, ShieldAlert,
  ExternalLink, Download, ChevronRight, Compass,
} from "lucide-react";
import { ProfileForm } from "@/app/dashboard/profil/_components/ProfileForm";
import { PasswordForm } from "./PasswordForm";
import { resetTour } from "@/app/actions/tour";
import { cn } from "@/lib/utils";

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  { id: "profil",              label: "Profil",              Icon: User   },
  { id: "sicherheit",          label: "Sicherheit",          Icon: Shield },
  { id: "benachrichtigungen",  label: "Benachrichtigungen",  Icon: Bell   },
  { id: "rechtliches",         label: "Rechtliches",         Icon: Scale  },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  email:       string;
  displayName: string;
  initials:    string;
  isAdmin:     boolean;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function EinstellungenTabs({ email, displayName, initials, isAdmin }: Props) {
  const [active, setActive] = useState<TabId>("profil");
  const router = useRouter();
  const [resetting, startReset] = useTransition();

  function handleReplayTour() {
    startReset(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const startFn = (window as any).__startWelcomeTour;
      if (typeof startFn === "function") {
        // Client-only: dashboard layout already mounted, just replay
        router.push("/dashboard");
        setTimeout(() => startFn(), 400);
      } else {
        // Fallback: flip the flag server-side and navigate
        await resetTour();
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <div>
      {/* ── Tab bar (mobile: native select) ──────────────────── */}
      <div className="sm:hidden mb-6">
        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1.5">Bereich</label>
        <select
          value={active}
          onChange={(e) => setActive(e.target.value as TabId)}
          className="w-full h-12 px-3 rounded-lg border border-gray-200 bg-white text-base font-medium text-forest"
        >
          {TABS.map(({ id, label }) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </div>

      {/* ── Tab bar (desktop: horizontal tabs) ───────────────── */}
      <div className="hidden sm:flex flex-wrap gap-0.5 mb-8 border-b border-gray-200 -mx-6 px-6">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-sans font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
              active === id
                ? "border-forest text-forest"
                : "border-transparent text-gray-500 hover:text-gray-900",
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Panels ───────────────────────────────────────────── */}
      <div className="max-w-md">

        {/* ── PROFIL ── */}
        {active === "profil" && (
          <div className="flex flex-col gap-6">
            {/* Avatar card */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white">
              <div className="w-14 h-14 rounded-full bg-forest/12 border-2 border-forest/20 flex items-center justify-center shrink-0">
                <span className="text-lg font-sans font-bold text-forest">{initials}</span>
              </div>
              <div>
                <p className="text-sm font-sans font-semibold text-gray-900">
                  {displayName || email.split("@")[0]}
                </p>
                <p className="text-xs text-gray-500 font-sans">{email}</p>
              </div>
            </div>
            {/* Form */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <ProfileForm initialName={displayName} email={email} />
            </div>

            {/* Replay tour */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-forest" strokeWidth={1.5} />
                <h2 className="font-headline text-base text-gray-900">Willkommens-Tour</h2>
              </div>
              <div className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-sans font-medium text-gray-700 mb-0.5">
                    Tour erneut ansehen
                  </p>
                  <p className="text-xs text-gray-500 font-sans leading-relaxed">
                    Die interaktive Einführung noch einmal starten — praktisch, wenn neue Features dazukommen.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReplayTour}
                  disabled={resetting}
                  className="shrink-0 h-9 px-4 rounded-lg border border-forest/30 bg-white text-sm font-sans font-medium text-forest hover:bg-forest/5 transition-colors disabled:opacity-50"
                >
                  {resetting ? "Starte …" : "Tour starten"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SICHERHEIT ── */}
        {active === "sicherheit" && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-headline text-base text-gray-900">Passwort ändern</h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">Mindestens 8 Zeichen.</p>
            </div>
            <div className="p-5">
              <PasswordForm />
            </div>
          </div>
        )}

        {/* ── BENACHRICHTIGUNGEN ── */}
        {active === "benachrichtigungen" && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-headline text-base text-gray-900">E-Mail-Benachrichtigungen</h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Steuere, welche E-Mails du erhältst.
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: "Produkt-Updates & Tipps",       desc: "Gelegentliche Neuigkeiten zum Workbook" },
                { label: "Coaching-Erinnerungen",          desc: "Terminerinnerungen für gebuchte Coachings" },
                { label: "Wöchentliche Zusammenfassung",  desc: "Fortschritts-Übersicht deiner Projekte" },
              ].map(({ label, desc }) => (
                <div key={label} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-sans text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400 font-sans">{desc}</p>
                  </div>
                  <div
                    className="w-9 h-5 rounded-full bg-forest/20 border border-forest/15 flex items-center px-0.5 cursor-not-allowed shrink-0"
                    title="Demnächst verfügbar"
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 font-sans">
                E-Mail-Einstellungen werden in Kürze aktiviert.
              </p>
            </div>
          </div>
        )}

        {/* ── RECHTLICHES ── */}
        {active === "rechtliches" && (
          <div className="flex flex-col gap-6">

            {/* Legal links */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
              {[
                { label: "Impressum",             href: "/legal/impressum"    },
                { label: "Datenschutzerklärung", href: "/legal/datenschutz" },
                { label: "Nutzungsbedingungen",  href: "/legal/agb"         },
                { label: "Kontakt",               href: "/kontakt"     },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between px-5 py-3.5 text-sm font-sans text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  {label}
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
                </Link>
              ))}
            </div>

            {/* Account & Daten (danger zone) */}
            <div className="rounded-xl border border-red-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-red-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                <h2 className="font-headline text-base text-red-700">Account & Daten</h2>
              </div>
              <div className="divide-y divide-red-50">
                {/* Data export */}
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-sans font-medium text-gray-700 mb-0.5">
                      Meine Daten exportieren
                    </p>
                    <p className="text-xs text-gray-500 font-sans">
                      Alle deine Daten als JSON-Datei herunterladen (DSGVO Art. 20).
                    </p>
                  </div>
                  <a
                    href="/api/user/export"
                    className="shrink-0 h-9 px-4 rounded-lg border border-forest/30 bg-white text-sm font-sans font-medium text-forest hover:bg-forest/5 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Export
                  </a>
                </div>
                {/* Delete account */}
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-sans font-medium text-gray-700 mb-0.5">
                      Account löschen
                    </p>
                    <p className="text-xs text-gray-500 font-sans leading-relaxed">
                      Löscht deinen Account und alle Projektdaten dauerhaft.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/einstellungen/account-loeschen"
                    className="shrink-0 h-9 px-4 rounded-lg border border-red-200 bg-white text-sm font-sans font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors flex items-center"
                  >
                    Löschen
                  </Link>
                </div>
              </div>
            </div>

            {/* Admin section – only visible to admins */}
            {isAdmin && (
              <div className="pt-1 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-sans select-none">Du bist Admin</p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600 transition-colors font-sans mt-0.5"
                >
                  Admin-Bereich
                  <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
