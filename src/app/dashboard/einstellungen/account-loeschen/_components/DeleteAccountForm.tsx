"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

const CONFIRM_PHRASE = "ACCOUNT LÖSCHEN";

export function DeleteAccountForm() {
  const router = useRouter();
  const [phrase, setPhrase]   = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phrase !== CONFIRM_PHRASE) return;
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/user/delete", { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Löschen fehlgeschlagen");
      }
      router.push("/login?deleted=true");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setPending(false);
    }
  }

  const canDelete = phrase === CONFIRM_PHRASE && !pending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tippe zur Bestätigung <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[13px] font-mono">{CONFIRM_PHRASE}</code>
        </label>
        <input
          type="text"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder={CONFIRM_PHRASE}
          disabled={pending}
          className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm disabled:opacity-60"
          autoComplete="off"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canDelete}
        className="w-full h-11 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Lösche Account …
          </>
        ) : (
          "Account unwiderruflich löschen"
        )}
      </button>
    </form>
  );
}
