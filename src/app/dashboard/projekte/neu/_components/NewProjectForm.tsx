"use client";

import { useFormState } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Button } from "@/components/ui/Button";
import { createProject, type CreateProjectResult } from "@/app/actions/projects";

const ROOM_OPTIONS: { value: string; label: string }[] = [
  { value: "wohnzimmer", label: "Wohnzimmer" },
  { value: "schlafzimmer", label: "Schlafzimmer" },
  { value: "arbeitszimmer", label: "Arbeitszimmer" },
  { value: "kueche", label: "Küche" },
  { value: "badezimmer", label: "Bad" },
  { value: "yogaraum", label: "Yogaraum" },
  { value: "wellness", label: "Wellness" },
  { value: "studio", label: "Studio" },
  { value: "sonstiges", label: "Sonstiges" },
];

const ROOM_STATE_OPTIONS = [
  {
    value: "new",
    label: "Neuer Raum",
    description: "Der Raum wird neu eingerichtet oder komplett neu gestaltet.",
  },
  {
    value: "existing",
    label: "Bestehender Raum",
    description: "Der Raum existiert bereits und soll überarbeitet oder optimiert werden.",
  },
];

/** Format a raw integer as German thousand-separated string: 10000 → "10.000" */
function formatBudget(raw: number): string {
  return raw.toLocaleString("de-DE");
}

/** Parse German-formatted budget string to integer, returns NaN if invalid */
function parseBudget(input: string): number {
  const cleaned = input.replace(/\./g, "").replace(/,/g, "").trim();
  if (!cleaned) return NaN;
  const n = parseInt(cleaned, 10);
  return isNaN(n) || n < 0 || n > 1_000_000 ? NaN : n;
}

const initialState: CreateProjectResult | null = null;

export function NewProjectForm() {
  const [state, formAction] = useFormState(createProject, initialState);
  const [pending, setPending] = useState(false);
  const [roomType, setRoomType] = useState("");
  const [roomState, setRoomState] = useState("new");

  // Budget: display string (formatted) + raw number for hidden input
  const [budgetDisplay, setBudgetDisplay] = useState("");
  const [budgetRaw, setBudgetRaw] = useState("");
  const [budgetError, setBudgetError] = useState("");

  const selectedRoom = ROOM_OPTIONS.find((o) => o.value === roomType);

  // Reset pending whenever state changes (error or redirect won't fire this)
  useEffect(() => {
    if (state) setPending(false);
  }, [state]);

  function handleBudgetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // Allow only digits and dots (German thousand separator typed by user)
    const digitsOnly = value.replace(/\./g, "").replace(/[^0-9]/g, "");
    setBudgetError("");

    if (digitsOnly === "") {
      setBudgetDisplay("");
      setBudgetRaw("");
      return;
    }

    const n = parseInt(digitsOnly, 10);
    if (n > 1_000_000) {
      setBudgetError("Maximal 1.000.000 €");
      return;
    }

    setBudgetRaw(String(n));
    // Format live as user types
    setBudgetDisplay(formatBudget(n));
  }

  function handleBudgetBlur() {
    if (!budgetRaw) return;
    const n = parseInt(budgetRaw, 10);
    if (!isNaN(n)) setBudgetDisplay(formatBudget(n));
  }

  return (
    <form
      action={formAction}
      onSubmit={() => setPending(true)}
      className="flex flex-col gap-7"
    >
      {/* ── Projektname ──────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-1.5">
        <Input
          id="name"
          name="name"
          label="Projektname *"
          placeholder="z. B. Wohnzimmer Umbau 2026"
          required
          autoFocus
          autoComplete="off"
        />
      </fieldset>

      {/* ── Raumtyp ──────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-1.5">
        <Select
          id="roomType"
          name="roomType"
          label="Raumtyp *"
          placeholder="Raum auswählen …"
          options={ROOM_OPTIONS}
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          required
        />
        {/* Hidden field for human-readable label */}
        <input
          type="hidden"
          name="roomLabel"
          value={selectedRoom?.label ?? ""}
        />
      </fieldset>

      {/* ── Raumzustand ──────────────────────────────────────── */}
      <RadioGroup
        label="Handelt es sich um …"
        name="roomState"
        options={ROOM_STATE_OPTIONS}
        value={roomState}
        onChange={setRoomState}
      />

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-sand/30" />
        <span className="text-xs text-gray/40 font-sans uppercase tracking-widest">
          Optional
        </span>
        <div className="flex-1 h-px bg-sand/30" />
      </div>

      {/* ── Budget ───────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-1.5">
        <div className="relative">
          {/* Visible formatted input */}
          <input
            id="budget-display"
            type="text"
            inputMode="numeric"
            value={budgetDisplay}
            onChange={handleBudgetChange}
            onBlur={handleBudgetBlur}
            placeholder="5.000"
            aria-label="Budget"
            className="h-12 w-full rounded-lg border border-sand/60 bg-cream px-3 pr-8 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent"
          />
          {/* Hidden input carries the raw value to the server action */}
          <input type="hidden" name="budget" value={budgetRaw} />
          <label
            htmlFor="budget-display"
            className="absolute -top-6 left-0 text-sm font-medium text-forest"
          >
            Budget
          </label>
          <span className="absolute right-3 bottom-0 h-12 flex items-center text-sm text-gray/50 pointer-events-none">
            €
          </span>
        </div>
        {budgetError ? (
          <p className="text-xs text-terracotta font-sans">{budgetError}</p>
        ) : (
          <p className="text-xs text-gray/50 font-sans">
            Dein ungefähres Gesamtbudget (bis 1.000.000 €).
          </p>
        )}
      </fieldset>

      {/* ── Deadline ─────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="deadline" className="text-sm font-medium text-forest">
          Wunschdatum
        </label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          className="h-12 w-full rounded-lg border border-sand/60 bg-cream px-3 text-base text-forest focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent [color-scheme:light]"
        />
        <p className="text-xs text-gray/50 font-sans">
          Bis wann soll das Projekt abgeschlossen sein?
        </p>
      </fieldset>

      {/* ── Error message ────────────────────────────────────── */}
      {state && "error" in state && (
        <div className="rounded-lg bg-terracotta/10 border border-terracotta/20 px-4 py-3">
          <p className="text-sm font-semibold text-terracotta mb-0.5">Fehler beim Speichern</p>
          <p className="text-sm text-terracotta/80">{state.error}</p>
        </div>
      )}

      {/* ── Submit ───────────────────────────────────────────── */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          loading={pending}
          disabled={pending || !!budgetError}
          className="w-full"
        >
          {pending ? "Wird gespeichert …" : "Projekt erstellen & Analyse starten"}
        </Button>
      </div>
    </form>
  );
}
