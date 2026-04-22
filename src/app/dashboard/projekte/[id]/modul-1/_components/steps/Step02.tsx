"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Plus, Check, Lightbulb } from "lucide-react";
import { Textarea } from "@/components/ui/Textarea";
import type { Module1Data } from "@/lib/types/module1";

interface Props {
  data: Module1Data;
  onChange: (patch: Partial<Module1Data>) => void;
}

// ── Suggestion tags for the two-column "more/less" picker ───────────────────

const MORE_TAGS = [
  "Natürlichkeit", "Ruhe", "Wärme", "Ordnung", "Offenheit", "Licht",
  "Gemütlichkeit", "Leichtigkeit", "Struktur", "Farbe", "Pflanzen",
  "Weite", "Stille", "Klarheit", "Charakter",
];

const LESS_TAGS = [
  "Chaos", "Grelles Licht", "Kälte", "Leere", "Enge", "Hall",
  "Kahle Wände", "Staub", "Kabelgewirr", "Plastik", "Überfüllung",
  "Künstlichkeit", "Beige-Langeweile", "Reizüberflutung", "Muff",
];

const COUNTER_MAX = 500;

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseTags(s: string | null | undefined): string[] {
  if (!s) return [];
  return s.split(",").map((t) => t.trim()).filter(Boolean);
}

function joinTags(arr: string[]): string {
  return arr.join(", ");
}

// ── Auto-growing textarea ──────────────────────────────────────────────────

function AutoTextarea({
  value, onChange, placeholder, maxLength = 1000,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(120, el.scrollHeight)}px`;
  }

  useEffect(resize, [value]);

  return (
    <div className="relative">
      <Textarea
        ref={ref}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="resize-none overflow-hidden transition-all duration-200 focus-within:shadow-[0_0_0_4px_rgba(148,193,164,0.15)]"
      />
      <p className="text-[11px] text-gray/40 font-mono mt-1 text-right tabular-nums">
        {value.length} / {maxLength}
      </p>
    </div>
  );
}

// ── Examples hint card ────────────────────────────────────────────────────────

function ExamplesHint({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl bg-sand/10 border border-sand/30 px-4 py-3 flex gap-3">
      <Lightbulb className="w-4 h-4 text-sand shrink-0 mt-0.5" strokeWidth={1.75} />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-widest text-[#8a6030] font-semibold">
          Beispiele
        </p>
        {items.map((s, i) => (
          <p key={i} className="text-sm font-sans text-forest/75 italic leading-snug">
            „{s}“
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Column with tag-picker ─────────────────────────────────────────────────

function TagColumn({
  title, subtitle, accent, tags, suggestions, onChange,
}: {
  title: string;
  subtitle: string;
  accent: "mint" | "terracotta";
  tags: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    onChange([...tags, t]);
  }
  function remove(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    add(draft);
    setDraft("");
  }

  const accentClasses = accent === "mint"
    ? {
        card:   "bg-mint/5 border-mint/40",
        badge:  "bg-mint text-forest",
        chip:   "bg-mint/25 text-forest ring-1 ring-mint/40",
        pick:   "border-mint/40 text-forest/70 hover:bg-mint/20 hover:border-mint/60",
        input:  "focus-visible:ring-mint/50 border-mint/30",
        plus:   "text-forest bg-mint/30",
        sign:   "+",
      }
    : {
        card:   "bg-terracotta/5 border-terracotta/30",
        badge:  "bg-terracotta/60 text-cream",
        chip:   "bg-terracotta/15 text-terracotta ring-1 ring-terracotta/30",
        pick:   "border-terracotta/30 text-terracotta/70 hover:bg-terracotta/10 hover:border-terracotta/50",
        input:  "focus-visible:ring-terracotta/40 border-terracotta/25",
        plus:   "text-cream bg-terracotta/60",
        sign:   "−",
      };

  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${accentClasses.card}`}>
      <div className="flex items-center gap-2">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold leading-none ${accentClasses.badge}`}>
          {accentClasses.sign}
        </span>
        <div className="min-w-0">
          <p className="font-headline text-lg text-forest leading-none">{title}</p>
          <p className="text-[11px] text-gray/60 font-sans mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Selected chips */}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((t) => (
            <span
              key={t}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${accentClasses.chip}`}
            >
              {t}
              <button
                type="button"
                onClick={() => remove(t)}
                className="ml-0.5 text-forest/60 hover:text-forest"
                aria-label={`${t} entfernen`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-gray/40 py-1">
          Wähle unten oder gib eigene Begriffe ein.
        </p>
      )}

      {/* Custom input */}
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Eigenen Begriff hinzufügen"
          className={`flex-1 h-9 px-3 rounded-full border text-sm bg-white/70 focus:outline-none focus:ring-2 ${accentClasses.input}`}
        />
        <button
          type="submit"
          aria-label="Hinzufügen"
          disabled={!draft.trim()}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform disabled:opacity-30 hover:scale-105 ${accentClasses.plus}`}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
        </button>
      </form>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {suggestions.map((s) => {
          const picked = tags.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => (picked ? remove(s) : add(s))}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                picked
                  ? `${accentClasses.chip} animate-pulse-once`
                  : `bg-white/60 ${accentClasses.pick}`
              }`}
            >
              {picked && <Check className="w-3 h-3" strokeWidth={3} />}
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export function Step02({ data, onChange }: Props) {
  const moreTags = useMemo(() => parseTags(data.more_of), [data.more_of]);
  const lessTags = useMemo(() => parseTags(data.less_of), [data.less_of]);

  return (
    <div className="flex flex-col gap-10">

      {/* ── IST-Zustand ──────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="font-headline text-xl text-forest mb-1">
            Was fühlt sich aktuell nicht stimmig an?
          </h3>
          <p className="text-sm text-gray/60 font-sans">
            Schreibe frei – was stört, fehlt oder belastet dich in diesem Raum?
          </p>
        </div>
        <ExamplesHint
          items={[
            "Ich fühle mich beengt, sobald ich reinkomme.",
            "Das Licht ist zu hart, nichts erholt mich hier.",
            "Die Farben wirken kühl – ich will nicht länger als nötig bleiben.",
          ]}
        />
        <AutoTextarea
          value={data.current_issues ?? ""}
          onChange={(v) => onChange({ current_issues: v })}
          placeholder="Schreibe frei – ein Satz oder mehrere, ganz wie du magst …"
          maxLength={COUNTER_MAX}
        />
      </section>

      {/* ── Veränderungswunsch: Two-column tag picker ────── */}
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="font-headline text-xl text-forest mb-1">
            Was soll sich verändern?
          </h3>
          <p className="text-sm text-gray/60 font-sans">
            Tippe auf Vorschläge oder gib eigene Begriffe ein — links, was du dir mehr wünschst, rechts, was weniger werden darf.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <TagColumn
            title="Mehr davon"
            subtitle="Was soll zunehmen?"
            accent="mint"
            tags={moreTags}
            suggestions={MORE_TAGS}
            onChange={(arr) => onChange({ more_of: joinTags(arr) })}
          />
          <TagColumn
            title="Weniger davon"
            subtitle="Was darf weichen?"
            accent="terracotta"
            tags={lessTags}
            suggestions={LESS_TAGS}
            onChange={(arr) => onChange({ less_of: joinTags(arr) })}
          />
        </div>
      </section>

      {/* ── Kernbegründung ──────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="font-headline text-xl text-forest mb-1">
            Ich verändere diesen Raum, weil …
          </h3>
          <p className="text-sm text-gray/60 font-sans">
            Ein Satz. Dein Anker für das gesamte Projekt.
          </p>
        </div>
        <div className="relative">
          <Textarea
            placeholder="… ich mir einen Rückzugsort schaffen möchte, der wirklich zu mir passt."
            value={data.change_reason ?? ""}
            onChange={(e) => onChange({ change_reason: e.target.value })}
            rows={2}
            className="pl-8 pr-4 font-sans italic text-forest/80 transition-all focus-within:shadow-[0_0_0_4px_rgba(148,193,164,0.15)]"
          />
          <span className="absolute -top-1 left-1 font-headline text-5xl text-mint/40 leading-none select-none pointer-events-none">
            &ldquo;
          </span>
        </div>
      </section>

      <style jsx>{`
        @keyframes wbc-pulse-once {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        :global(.animate-pulse-once) { animation: wbc-pulse-once 280ms ease-out; }
      `}</style>
    </div>
  );
}
