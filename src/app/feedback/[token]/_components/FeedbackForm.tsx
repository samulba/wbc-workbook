"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star, Loader2, CheckCircle2 } from "lucide-react";

export function FeedbackForm({ token }: { token: string }) {
  const [name, setName]       = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating]   = useState<number | null>(null);
  const [hover, setHover]     = useState<number | null>(null);
  const [state, setState]     = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError]     = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    try {
      const res = await fetch("/api/feedback-share/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, name, message, rating }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Senden fehlgeschlagen.");
      }
      setState("sent");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    }
  }

  if (state === "sent") {
    return (
      <div className="bg-white rounded-2xl border border-mint/30 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-mint/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-forest" strokeWidth={1.5} />
        </div>
        <h2 className="font-headline text-2xl text-forest mb-2">
          Danke, dein Feedback ist angekommen!
        </h2>
        <p className="text-sm text-forest/70 mb-6 max-w-md mx-auto">
          Wir geben deine Meinung weiter. Lust, selbst dein Raumkonzept zu gestalten?
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest/90 transition-colors"
        >
          <Heart className="w-4 h-4" strokeWidth={1.5} />
          Auch ein Raumkonzept erstellen
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-forest/10 p-6 space-y-5">
      <header>
        <h2 className="font-headline text-xl text-forest mb-1">Deine Meinung zählt</h2>
        <p className="text-sm text-forest/60">
          Sag kurz, was du denkst — schon ein paar Sätze helfen.
        </p>
      </header>

      <div>
        <label className="block text-xs font-medium text-forest/70 mb-1">
          Dein Name <span className="text-forest/40 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anonym"
          maxLength={60}
          className="w-full h-11 px-3 rounded-lg border border-forest/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-forest/70 mb-1">
          Deine Meinung *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Was würdest du anders machen? Was gefällt dir?"
          required
          rows={5}
          maxLength={2000}
          className="w-full px-3 py-2.5 rounded-lg border border-forest/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint resize-none"
        />
        <p className="text-[11px] text-forest/40 mt-1 text-right">{message.length} / 2000</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-forest/70 mb-2">
          Bewertung <span className="text-forest/40 font-normal">(optional)</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (hover ?? rating ?? 0) >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(rating === n ? null : n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`${n} von 5 Sternen`}
              >
                <Star
                  className={`w-7 h-7 ${filled ? "text-mint fill-mint" : "text-forest/20"}`}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
          {rating !== null && (
            <button
              type="button"
              onClick={() => setRating(null)}
              className="text-[11px] text-forest/50 hover:text-forest ml-2"
            >
              zurücksetzen
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={state === "sending" || !message.trim()}
        className="w-full h-11 rounded-lg bg-forest text-white font-medium hover:bg-forest/90 disabled:bg-forest/30 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
      >
        {state === "sending" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sende …
          </>
        ) : (
          "Feedback senden"
        )}
      </button>
    </form>
  );
}
