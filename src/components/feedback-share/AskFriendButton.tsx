"use client";

import { useState, useEffect, useTransition } from "react";
import { MessageCircle, X, Copy, Check, Share2, Trash2, Star, Loader2 } from "lucide-react";
import {
  createFeedbackLink,
  listFeedbackLinks,
  toggleFeedbackLinkActive,
  deleteFeedbackLink,
  deleteFeedbackResponse,
} from "@/app/actions/feedbackShare";
import { DURATION_OPTIONS } from "@/lib/types/feedback-share";

// ── Types ────────────────────────────────────────────────────────────────────

interface LinkRow {
  id:         string;
  room_id:    string;
  token:      string;
  question:   string;
  expires_at: string;
  is_active:  boolean;
  created_at: string;
}

interface ResponseRow {
  id:         string;
  link_id:    string;
  name:       string | null;
  message:    string;
  rating:     number | null;
  created_at: string;
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function AskFriendButton({
  roomId,
  label = "Freund fragen",
  variant = "soft",
}: {
  roomId: string;
  label?: string;
  variant?: "soft" | "outline";
}) {
  const [mode, setMode]       = useState<"create" | "list" | null>(null);
  const [links, setLinks]     = useState<LinkRow[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = responses.length;

  async function loadLinks() {
    setLoading(true);
    const { links, responses } = await listFeedbackLinks(roomId);
    setLinks(links);
    setResponses(responses);
    setLoading(false);
  }

  // On mount — quick load so the badge shows
  useEffect(() => {
    loadLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const baseBtn =
    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors";
  const btnClass =
    variant === "outline"
      ? `${baseBtn} border border-forest/30 text-forest bg-white hover:bg-forest/5`
      : `${baseBtn} bg-mint/20 text-forest border border-mint/30 hover:bg-mint/30`;

  return (
    <>
      <div className="inline-flex items-center gap-1.5">
        <button type="button" onClick={() => setMode("create")} className={btnClass}>
          <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
          {label}
        </button>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => setMode("list")}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-terracotta text-white text-[11px] font-semibold hover:bg-terracotta/90"
          >
            {unreadCount} {unreadCount === 1 ? "Feedback" : "Feedbacks"}
          </button>
        )}
      </div>

      {mode === "create" && (
        <CreateLinkModal
          roomId={roomId}
          onClose={() => setMode(null)}
          onCreated={() => { loadLinks(); }}
        />
      )}

      {mode === "list" && (
        <FeedbackListModal
          links={links}
          responses={responses}
          loading={loading}
          onClose={() => setMode(null)}
          onReload={loadLinks}
        />
      )}
    </>
  );
}

// ── Create link modal ───────────────────────────────────────────────────────

function CreateLinkModal({
  roomId, onClose, onCreated,
}: {
  roomId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [duration, setDuration] = useState<number>(7);
  const [created, setCreated]   = useState<{ url: string; question: string } | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [pending, start]        = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await createFeedbackLink({
        roomId,
        question,
        durationDays: duration,
      });
      if (!res.ok) { setError(res.error); return; }
      const url = `${window.location.origin}/feedback/${res.token}`;
      setCreated({ url, question: question.trim() });
      onCreated();
    });
  }

  async function copy() {
    if (!created) return;
    await navigator.clipboard.writeText(created.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function webShare() {
    if (!created) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Feedback zu meinem Raum",
          text:  `Was denkst du? "${created.question}"`,
          url:   created.url,
        });
      } catch { /* user cancelled */ }
    }
  }

  const waText = created
    ? `Hey! Ich gestalte gerade einen Raum und wollte fragen: ${created.question} ${created.url}`
    : "";
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  const hasShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <ModalShell title={created ? "Link erstellt" : "Feedback einholen"} onClose={onClose}>
      {!created ? (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-forest/70 mb-1">
              Was möchtest du fragen? *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="z. B. Welche Farbe passt besser zu diesem Stil?"
              required
              rows={3}
              maxLength={500}
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-forest/15 text-sm focus:outline-none focus:ring-2 focus:ring-mint resize-none"
            />
            <p className="text-[11px] text-forest/40 mt-1 text-right">{question.length} / 500</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-forest/70 mb-1">Link gültig für</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-sm"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-forest/50 leading-relaxed">
            Dein Freund sieht nur Design-Entscheidungen (Farben, Materialien, Moodboard) —
            keine persönlichen Infos. Du kannst den Link jederzeit deaktivieren.
          </p>

          {error && <p className="text-sm text-terracotta">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="text-sm px-4 py-2 rounded-lg text-forest/60 hover:bg-forest/5">
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={pending || !question.trim()}
              className="text-sm px-4 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest/90 disabled:opacity-50"
            >
              {pending ? "Erstelle …" : "Link erstellen"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-forest/70">
            Teile diesen Link. Der Freund sieht dein Konzept und kann antworten.
          </p>

          <div className="flex gap-2">
            <input
              readOnly
              value={created.url}
              className="flex-1 h-10 px-3 rounded-lg border border-forest/15 bg-cream/50 text-xs font-mono"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              onClick={copy}
              className="px-3 py-2 rounded-lg bg-forest text-white text-xs font-medium hover:bg-forest/90 inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 rounded-lg bg-[#25D366] text-white text-xs font-medium hover:bg-[#1ebe5b] inline-flex items-center justify-center gap-1.5"
            >
              WhatsApp
            </a>
            {hasShare && (
              <button
                onClick={webShare}
                className="h-10 rounded-lg border border-forest/20 text-forest text-xs font-medium hover:bg-forest/5 inline-flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Teilen
              </button>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest/90">
              Fertig
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ── Feedback list modal ──────────────────────────────────────────────────────

function FeedbackListModal({
  links, responses, loading, onClose, onReload,
}: {
  links:     LinkRow[];
  responses: ResponseRow[];
  loading:   boolean;
  onClose:   () => void;
  onReload:  () => void;
}) {
  const [, start] = useTransition();

  async function handleToggle(linkId: string, active: boolean) {
    start(async () => {
      await toggleFeedbackLinkActive(linkId, active);
      onReload();
    });
  }

  async function handleDeleteLink(linkId: string) {
    if (!confirm("Link und alle zugehörigen Antworten löschen?")) return;
    start(async () => {
      await deleteFeedbackLink(linkId);
      onReload();
    });
  }

  async function handleDeleteResponse(responseId: string) {
    start(async () => {
      await deleteFeedbackResponse(responseId);
      onReload();
    });
  }

  const grouped = links.map((link) => ({
    link,
    items: responses.filter((r) => r.link_id === link.id),
  }));

  return (
    <ModalShell title="Feedback aus der Familie" onClose={onClose} wide>
      {loading ? (
        <div className="py-12 flex items-center justify-center text-forest/50">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <p className="py-8 text-center text-sm text-forest/50">
          Noch keine Links erstellt.
        </p>
      ) : (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto -mx-1 px-1">
          {grouped.map(({ link, items }) => {
            const expired = new Date(link.expires_at) < new Date();
            const statusColor = !link.is_active ? "bg-gray-200 text-gray-600"
              : expired                           ? "bg-amber-100 text-amber-800"
              :                                     "bg-mint/25 text-forest";
            const statusLabel = !link.is_active ? "deaktiviert"
              : expired                           ? "abgelaufen"
              :                                     "aktiv";

            return (
              <section key={link.id} className="border border-forest/10 rounded-xl p-4 bg-cream/40">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-forest italic leading-snug">
                      „{link.question}“
                    </p>
                    <p className="text-[11px] text-forest/50 mt-0.5">
                      {new Date(link.created_at).toLocaleDateString("de-DE")} ·
                      {" "}läuft ab {new Date(link.expires_at).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${statusColor}`}>
                      {statusLabel}
                    </span>
                    {link.is_active && !expired && (
                      <button
                        onClick={() => handleToggle(link.id, false)}
                        className="text-[11px] text-forest/60 hover:text-forest underline"
                      >
                        deaktivieren
                      </button>
                    )}
                    {!link.is_active && (
                      <button
                        onClick={() => handleToggle(link.id, true)}
                        className="text-[11px] text-forest/60 hover:text-forest underline"
                      >
                        aktivieren
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-terracotta/70 hover:text-terracotta p-1"
                      aria-label="Link löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-forest/40 italic pl-2">Noch keine Antworten.</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((r) => (
                      <li key={r.id} className="bg-white rounded-lg p-3 border border-forest/5">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-forest">
                              {r.name ?? "Anonym"}
                            </span>
                            {r.rating && (
                              <span className="inline-flex items-center gap-0.5 text-mint">
                                {Array.from({ length: r.rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-mint" strokeWidth={0} />
                                ))}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-forest/40">
                            {new Date(r.created_at).toLocaleString("de-DE", {
                              day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-forest/80 whitespace-pre-wrap">{r.message}</p>
                        <button
                          onClick={() => handleDeleteResponse(r.id)}
                          className="text-[10px] text-forest/30 hover:text-terracotta mt-1.5"
                        >
                          Antwort löschen
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest/90">
          Schließen
        </button>
      </div>
    </ModalShell>
  );
}

// ── ModalShell ──────────────────────────────────────────────────────────────

function ModalShell({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-forest/10">
          <h3 className="font-headline text-lg text-forest">{title}</h3>
          <button onClick={onClose} className="text-forest/40 hover:text-forest">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
