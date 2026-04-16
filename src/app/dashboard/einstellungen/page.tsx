import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { PasswordForm } from "./_components/PasswordForm";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function EinstellungenPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-sans mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <div className="max-w-md flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl text-gray-900 mb-1">
            Einstellungen
          </h1>
          <p className="text-sm text-gray-500 font-sans">
            Sicherheit und Konto verwalten.
          </p>
        </div>

        {/* Password section */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-headline text-base text-gray-900">Passwort ändern</h2>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Mindestens 8 Zeichen.
            </p>
          </div>
          <div className="p-5">
            <PasswordForm />
          </div>
        </div>

        {/* Notifications placeholder */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-headline text-base text-gray-900">E-Mail-Benachrichtigungen</h2>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Steuere, welche E-Mails du erhältst.
            </p>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-sans text-gray-700">Produkt-Updates & Tipps</p>
              <p className="text-xs text-gray-400 font-sans">Gelegentliche Neuigkeiten zum Workbook</p>
            </div>
            {/* Toggle placeholder */}
            <div className="w-9 h-5 rounded-full bg-forest/20 border border-forest/15 flex items-center px-0.5 cursor-not-allowed" title="Demnächst verfügbar">
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-red-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" strokeWidth={1.5} />
            <h2 className="font-headline text-base text-red-700">Gefahrenzone</h2>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-sans font-medium text-gray-700 mb-0.5">
                  Account löschen
                </p>
                <p className="text-xs text-gray-500 font-sans leading-relaxed">
                  Löscht deinen Account und alle Projektdaten dauerhaft.
                  Diese Aktion ist nicht rückgängig zu machen.
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
      </div>
    </div>
  );
}
