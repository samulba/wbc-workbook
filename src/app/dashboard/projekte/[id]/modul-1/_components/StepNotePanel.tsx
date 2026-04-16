"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PenLine, Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveStepNote } from "@/app/actions/module1";

interface Props {
  moduleId:      string;
  stepNumber:    number;
  allNotes:      Record<string, string>;
  onNotesChange: (notes: Record<string, string>) => void;
}

const DEBOUNCE_MS = 2000;
const PREVIEW_LEN = 45;

export function StepNotePanel({ moduleId, stepNumber, allNotes, onNotesChange }: Props) {
  const key          = String(stepNumber);
  const initialText  = allNotes[key] ?? "";

  const [expanded, setExpanded] = useState(false);
  const [text,     setText]     = useState(initialText);
  const [saving,   setSaving]   = useState(false);
  const [savedAt,  setSavedAt]  = useState<string | null>(initialText ? "gespeichert" : null);
  const [dirty,    setDirty]    = useState(false);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>(initialText);

  // Sync when step changes
  useEffect(() => {
    const incoming = allNotes[key] ?? "";
    setText(incoming);
    lastSavedRef.current = incoming;
    setDirty(false);
    setSavedAt(incoming ? "gespeichert" : null);
    setExpanded(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepNumber]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || !expanded) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text, expanded]);

  // Focus textarea when expanded
  useEffect(() => {
    if (expanded) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [expanded]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const persistNote = useCallback(async (value: string) => {
    if (value === lastSavedRef.current) return;
    setSaving(true);
    setDirty(false);
    const updated = { ...allNotes };
    if (value.trim()) {
      updated[key] = value;
    } else {
      delete updated[key];
    }
    const result = await saveStepNote(moduleId, updated);
    setSaving(false);
    if (result.ok) {
      lastSavedRef.current = value;
      setSavedAt(result.savedAt);
      onNotesChange(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, key, allNotes, onNotesChange]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setText(val);
    setDirty(true);
    setSavedAt(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persistNote(val), DEBOUNCE_MS);
  }

  function handleBlur() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (dirty || text !== lastSavedRef.current) {
      persistNote(text);
    }
  }

  const hasNote   = Boolean(text.trim());
  const preview   = hasNote ? text.trim().slice(0, PREVIEW_LEN) + (text.trim().length > PREVIEW_LEN ? "…" : "") : "";

  return (
    <div className="mt-6 rounded-xl border border-dashed border-sand/40 overflow-hidden">

      {/* ── Toggle header ──────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors",
          "hover:bg-sand/5",
          expanded && "bg-sand/5"
        )}
      >
        <PenLine
          className={cn("w-3.5 h-3.5 shrink-0 transition-colors", hasNote ? "text-sand" : "text-sand/50")}
          strokeWidth={1.5}
        />

        <span className="flex-1 min-w-0 flex items-center gap-2">
          <span className={cn("text-xs font-sans font-medium", hasNote ? "text-forest/70" : "text-gray-400")}>
            Eigene Notizen
          </span>
          {!expanded && hasNote && (
            <span className="text-xs font-sans text-gray-400 truncate hidden sm:block">
              · {preview}
            </span>
          )}
          {!expanded && !hasNote && (
            <span className="text-[11px] font-sans text-gray-400 italic hidden sm:block">
              hinzufügen …
            </span>
          )}
        </span>

        {/* Saved / saving indicator */}
        <span className="shrink-0 flex items-center gap-1">
          {saving && (
            <span className="w-3 h-3 rounded-full border-2 border-sand/40 border-t-sand animate-spin" />
          )}
          {!saving && savedAt && hasNote && (
            <span className="flex items-center gap-1 text-[10px] font-sans text-mint/70">
              <Check className="w-3 h-3" strokeWidth={2} />
              <span className="hidden sm:inline">gespeichert</span>
            </span>
          )}
        </span>

        {expanded
          ? <ChevronUp   className="w-3.5 h-3.5 text-sand/50 shrink-0" strokeWidth={1.5} />
          : <ChevronDown className="w-3.5 h-3.5 text-sand/50 shrink-0" strokeWidth={1.5} />
        }
      </button>

      {/* ── Expanded textarea ──────────────────────────────── */}
      {expanded && (
        <div className="px-4 pb-4 pt-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Deine Gedanken, Ideen oder Notizen zu diesem Schritt …"
            rows={3}
            className={cn(
              "w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm font-sans",
              "bg-sand/5 border-sand/30 text-forest placeholder:text-gray-400",
              "focus:outline-none focus:ring-1 focus:ring-sand/50 focus:border-sand/50",
              "transition-colors leading-relaxed",
              "min-h-[80px]"
            )}
            style={{ overflow: "hidden" }}
          />
          <p className="text-[10px] font-sans text-gray-400 mt-1.5">
            Wird automatisch gespeichert
          </p>
        </div>
      )}
    </div>
  );
}
