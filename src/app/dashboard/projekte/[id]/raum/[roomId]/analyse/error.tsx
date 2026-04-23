"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";

export default function AnalyseError({
  error,
  reset,
}: {
  error:  Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-sans mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-headline text-xl text-red-700 mb-1">
            Analyse konnte nicht geladen werden
          </h1>
          <p className="text-sm text-red-700/75 font-sans leading-relaxed mb-3">
            {error.message || "Ein unerwarteter Fehler ist aufgetreten."}
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-red-700/50 mb-4">
              Error-ID: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-red-300 bg-white hover:bg-red-50 text-sm font-sans font-medium text-red-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
            Erneut versuchen
          </button>
        </div>
      </div>
    </div>
  );
}
