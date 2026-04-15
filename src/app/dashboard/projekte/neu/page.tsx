import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewProjectForm } from "./_components/NewProjectForm";

export const metadata: Metadata = { title: "Neues Projekt" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray/60 hover:text-forest transition-colors font-sans mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück zum Dashboard
      </Link>

      <div className="max-w-[600px]">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-xs font-sans uppercase tracking-[0.2em] text-sand mb-3">
            Schritt 1 von 1
          </p>
          <h1 className="font-headline text-4xl md:text-5xl text-forest leading-none mb-4">
            Neues Projekt
          </h1>
          <p className="text-gray/70 font-sans text-base leading-relaxed">
            Beschreibe deinen Raum und starte deine persönliche Raumanalyse.
            Du kannst alle Angaben später noch anpassen.
          </p>
        </div>

        {/* Decorative line */}
        <div className="flex gap-1.5 mb-10">
          <div className="h-0.5 w-12 bg-forest rounded-full" />
          <div className="h-0.5 w-4 bg-mint rounded-full" />
          <div className="h-0.5 w-2 bg-sand rounded-full" />
        </div>

        {/* Form */}
        <NewProjectForm />
      </div>
    </div>
  );
}
