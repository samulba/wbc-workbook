"use client";

import { useState } from "react";
import {
  Download,
  Upload,
  DatabaseBackup,
  Info,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ── Main Component ────────────────────────────────────────────────────────────

export function BackupsPage() {
  const [exporting, setExporting] = useState(false);
  const [exported,  setExported]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setExported(false);
    setError(null);

    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Export fehlgeschlagen");
      }

      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const filename = `wbc-export-${new Date().toISOString().slice(0, 10)}.json`;

      const a   = document.createElement("a");
      a.href    = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5 flex gap-4">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p className="font-semibold">Supabase-Backups</p>
          <p>
            Supabase erstellt automatisch tägliche Backups Ihrer Datenbank (Point-in-Time Recovery auf Pro-Plan).
            Backups können im Supabase Dashboard unter <strong>Database → Backups</strong> eingesehen und wiederhergestellt werden.
          </p>
          <p className="mt-2 opacity-80">
            Der manuelle Export hier erzeugt einen JSON-Snapshot der wichtigsten Tabellen — kein Ersatz für echte DB-Backups, aber nützlich für schnelle Übersichten.
          </p>
        </div>
      </div>

      {/* Manual Export */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
            <DatabaseBackup className="w-5 h-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Manueller JSON-Export</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Exportiert einen JSON-Snapshot folgender Tabellen: Profile, Projekte, Räume, Modul-1, Produkte, FAQs, Farbpaletten, Inspirationsbilder.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exporting ? "Wird exportiert…" : "JSON exportieren"}
              </button>

              {exported && (
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Export erfolgreich
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Import (placeholder) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 opacity-60">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Import</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              JSON-Backup importieren — in Entwicklung.
            </p>
            <div className="mt-4">
              <button
                disabled
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                Import (bald verfügbar)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase link hint */}
      <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
        Für vollständige Datenbank-Backups und Wiederherstellung → Supabase Dashboard → Database → Backups
      </div>
    </div>
  );
}
