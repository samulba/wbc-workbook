"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, Star, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

const TYPES = ["Bug", "Vorschlag", "Lob", "Frage"] as const;
type FeedbackType = typeof TYPES[number];

const TYPE_EMOJIS: Record<FeedbackType, string> = {
  Bug:       "🐛",
  Vorschlag: "💡",
  Lob:       "🌟",
  Frage:     "❓",
};

// ── Star Picker ───────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1;
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? 0 : n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn("w-5 h-5 transition-colors", filled ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600")}
            />
          </button>
        );
      })}
    </div>
  );
}

// ── Widget ────────────────────────────────────────────────────────────────────

export function FeedbackWidget() {
  const [open,     setOpen]     = useState(false);
  const [type,     setType]     = useState<FeedbackType>("Vorschlag");
  const [message,  setMessage]  = useState("");
  const [rating,   setRating]   = useState(0);
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState("");
  const [pageUrl,  setPageUrl]  = useState("");

  // Capture page URL when modal opens
  useEffect(() => {
    if (open) setPageUrl(window.location.href);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handleClose() {
    setOpen(false);
    // Reset after animation
    setTimeout(() => {
      if (!sent) return;
      setSent(false);
      setMessage("");
      setRating(0);
      setType("Vorschlag");
      setError("");
    }, 300);
  }

  function reset() {
    setSent(false);
    setMessage("");
    setRating(0);
    setType("Vorschlag");
    setError("");
  }

  async function submit() {
    setError("");
    if (!message.trim()) { setError("Bitte eine Nachricht eingeben."); return; }

    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          type,
          message: message.trim(),
          page_url: pageUrl || null,
          rating:   rating || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Senden");
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Feedback geben"
        className={cn(
          "fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center",
          "bg-forest hover:bg-forest/90 text-white transition-all duration-200",
          "hover:scale-110 active:scale-95",
          open && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 sm:bg-transparent"
            onClick={handleClose}
          />

          {/* Panel */}
          <div className="relative bg-white dark:bg-gray-800 w-full sm:w-[360px] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-forest text-white">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-semibold">Feedback geben</span>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sent ? (
              /* Success state */
              <div className="px-5 py-10 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Danke für dein Feedback!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Wir haben es erhalten und werden es prüfen.</p>
                <button
                  onClick={reset}
                  className="mt-2 text-sm text-green-700 dark:text-mint hover:underline"
                >
                  Weiteres Feedback senden
                </button>
              </div>
            ) : (
              /* Form */
              <div className="px-5 py-4 space-y-4">
                {/* Type selector */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Art des Feedbacks</p>
                  <div className="grid grid-cols-4 gap-1">
                    {TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={cn(
                          "flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-xs font-medium border transition-all",
                          type === t
                            ? "border-forest bg-forest/5 dark:bg-forest/10 text-forest dark:text-mint"
                            : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                        )}
                      >
                        <span className="text-base leading-none">{TYPE_EMOJIS[t]}</span>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Nachricht *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder={
                      type === "Bug"       ? "Was ist passiert? Wie kann man es reproduzieren?" :
                      type === "Vorschlag" ? "Was könnte verbessert werden?" :
                      type === "Lob"       ? "Was hat dir gut gefallen?" :
                                            "Was möchtest du wissen?"
                    }
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest resize-none"
                  />
                </div>

                {/* Star rating */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Bewertung <span className="font-normal">(optional)</span>
                  </p>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  onClick={submit}
                  disabled={sending || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-forest text-white text-sm font-medium rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-60"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                  {sending ? "Senden…" : "Absenden"}
                </button>

                <p className="text-[11px] text-center text-gray-400 dark:text-gray-500">
                  Aktuell auf: {pageUrl ? new URL(pageUrl).pathname : "—"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
