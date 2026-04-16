"use client";

import { useState } from "react";
import {
  X, Star, ExternalLink, User, Calendar,
  CheckCircle2, Circle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FeedbackRow {
  id:             string;
  user_id:        string | null;
  type:           string;
  message:        string;
  page_url:       string | null;
  rating:         number | null;
  status:         "neu" | "gelesen" | "erledigt";
  admin_response: string | null;
  created_at:     string;
  user_name:      string | null;
  user_email:     string | null;
}

interface Props {
  feedback: FeedbackRow;
  onClose:  () => void;
  onUpdate: (updated: FeedbackRow) => void;
  onDelete: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Bug:       "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  Vorschlag: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Lob:       "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  Frage:     "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
};

const STATUS_OPTIONS = [
  { value: "neu",      label: "Neu",      icon: Circle,        color: "text-blue-500"  },
  { value: "gelesen",  label: "Gelesen",  icon: Clock,         color: "text-amber-500" },
  { value: "erledigt", label: "Erledigt", icon: CheckCircle2,  color: "text-green-500" },
];

// ── Star Rating Display ───────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-gray-400 dark:text-gray-500">Keine Bewertung</span>;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("w-4 h-4", i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-600")}
        />
      ))}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function FeedbackDetailModal({ feedback, onClose, onUpdate, onDelete }: Props) {
  const [status,        setStatus]        = useState(feedback.status);
  const [adminResponse, setAdminResponse] = useState(feedback.admin_response ?? "");
  const [saving,        setSaving]        = useState(false);
  const [confirmDel,    setConfirmDel]    = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res  = await fetch(`/api/admin/feedback/${feedback.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status, admin_response: adminResponse || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate({ ...feedback, ...data });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/admin/feedback/${feedback.id}`, { method: "DELETE" });
      onDelete();
    } finally {
      setDeleting(false);
    }
  }

  const statusInfo = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", TYPE_COLORS[feedback.type] ?? "bg-gray-100")}>
              {feedback.type}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(feedback.created_at).toLocaleDateString("de-DE", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* User info */}
          {(feedback.user_name || feedback.user_email) && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-forest/10 dark:bg-forest/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-forest dark:text-mint" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                {feedback.user_name && (
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{feedback.user_name}</p>
                )}
                {feedback.user_email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{feedback.user_email}</p>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Bewertung</p>
            <StarRating rating={feedback.rating} />
          </div>

          {/* Page URL */}
          {feedback.page_url && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Seite</p>
              <a
                href={feedback.page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-green-700 dark:text-mint hover:underline break-all"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                {feedback.page_url}
              </a>
            </div>
          )}

          {/* Message */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Nachricht</p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {feedback.message}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Status</p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => setStatus(value as typeof status)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                    status === value
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", status === value ? "text-green-600 dark:text-green-400" : color)} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Admin response */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Admin-Antwort <span className="font-normal">(optional)</span>
            </label>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              rows={3}
              placeholder="Interne Antwort oder Notiz…"
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          {/* Delete */}
          {!confirmDel ? (
            <button
              onClick={() => setConfirmDel(true)}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              Löschen
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Sicher?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-60"
              >
                {deleting ? "…" : "Ja, löschen"}
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Abbrechen
              </button>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Schließen
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-60"
            >
              {saving ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
