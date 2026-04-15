"use client";

import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
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

const initialState: CreateProjectResult | null = null;

export function NewProjectForm() {
  const [state, formAction] = useFormState(createProject, initialState);
  const [pending, setPending] = useState(false);
  const [roomType, setRoomType] = useState("");
  const [roomState, setRoomState] = useState("new");

  // Track pending state via transitions
  const selectedRoom = ROOM_OPTIONS.find((o) => o.value === roomType);

  // Reset pending if error comes back
  useEffect(() => {
    if (state && "error" in state) {
      setPending(false);
    }
  }, [state]);

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
          <Input
            id="budget"
            name="budget"
            type="number"
            label="Budget"
            placeholder="5.000"
            min="0"
            step="100"
            className="pr-8"
          />
          <span className="absolute right-3 bottom-0 h-10 flex items-center text-sm text-gray/50 pointer-events-none">
            €
          </span>
        </div>
        <p className="text-xs text-gray/50 font-sans">
          Dein ungefähres Gesamtbudget für dieses Projekt.
        </p>
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
          className="h-10 w-full rounded-lg border border-sand/60 bg-cream px-3 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent [color-scheme:light]"
        />
        <p className="text-xs text-gray/50 font-sans">
          Bis wann soll das Projekt abgeschlossen sein?
        </p>
      </fieldset>

      {/* ── Error message ────────────────────────────────────── */}
      {state && "error" in state && (
        <div className="rounded-lg bg-terracotta/10 border border-terracotta/20 px-4 py-3">
          <p className="text-sm text-terracotta">{state.error}</p>
        </div>
      )}

      {/* ── Submit ───────────────────────────────────────────── */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          loading={pending}
          className="w-full"
        >
          Projekt erstellen & Analyse starten
        </Button>
      </div>
    </form>
  );
}
