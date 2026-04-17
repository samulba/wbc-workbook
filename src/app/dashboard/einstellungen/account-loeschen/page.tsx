import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DeleteAccountForm } from "./_components/DeleteAccountForm";

export const metadata: Metadata = { title: "Account löschen" };

export default function DeleteAccountPage() {
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/dashboard/einstellungen"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-forest transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Zurück zu Einstellungen
      </Link>

      <h1 className="font-headline text-3xl sm:text-4xl text-forest leading-none mb-4">
        Account löschen
      </h1>
      <p className="text-gray-600 text-sm mb-8 leading-relaxed">
        Beim Löschen deines Accounts werden <strong>alle</strong> deine Projekte, Räume, Modul-1-Analysen,
        Favoriten, Shopping-Listen, Collections und hochgeladenen Bilder unwiderruflich entfernt.
        Diese Aktion kann nicht rückgängig gemacht werden.
      </p>

      <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 mb-6 text-sm text-red-900">
        <p className="font-semibold mb-1">Vor dem Löschen:</p>
        <p className="leading-relaxed">
          Möchtest du deine Daten sichern? Du kannst sie als JSON-Datei exportieren —
          nutze dazu vor dem Löschen den <em>Export</em>-Button auf der Einstellungen-Seite.
        </p>
      </div>

      <DeleteAccountForm />
    </div>
  );
}
