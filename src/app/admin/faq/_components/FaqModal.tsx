"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FaqRow {
  id:         string;
  question:   string;
  answer:     string;
  category:   string;
  sort_order: number;
  is_active:  boolean;
  created_at: string;
}

interface Props {
  faq:     FaqRow | null; // null = create mode
  onClose: () => void;
  onSaved: (f: FaqRow) => void;
}

export const FAQ_CATEGORIES = [
  "Allgemein",
  "Module",
  "Produkte",
  "Coaching",
  "Technisch",
];

// ── Modal ─────────────────────────────────────────────────────────────────────

export function FaqModal({ faq, onClose, onSaved }: Props) {
  const isEdit = !!faq;

  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer,   setAnswer]   = useState(faq?.answer   ?? "");
  const [category, setCategory] = useState(faq?.category ?? FAQ_CATEGORIES[0]);
  const [isActive, setIsActive] = useState(faq?.is_active ?? true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  async function save() {
    setError("");
    if (!question.trim()) { setError("Frage ist erforderlich");   return; }
    if (!answer.trim())   { setError("Antwort ist erforderlich"); return; }

    setSaving(true);
    try {
      const payload = { question: question.trim(), answer: answer.trim(), category, is_active: isActive };
      const url    = isEdit ? `/api/admin/faqs/${faq!.id}` : "/api/admin/faqs";
      const method = isEdit ? "PATCH" : "POST";

      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unbekannter Fehler");
      onSaved(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEdit ? "FAQ bearbeiten" : "Neue FAQ"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Kategorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
            >
              {FAQ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Frage *</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
              placeholder="z. B. Wie starte ich mit Modul 1?"
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Antwort *</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-y"
              placeholder="Ausführliche Antwort…"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{answer.length} Zeichen</p>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Aktiv (öffentlich sichtbar)</span>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-5" : ""}`} />
            </button>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-60"
          >
            {saving ? "Speichern…" : isEdit ? "Speichern" : "Erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
}
