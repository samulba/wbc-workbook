"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PaletteRow {
  id: string;
  name: string;
  room_effect: string | null;
  primary_colors: string[];
  secondary_colors: string[];
  accent_color: string | null;
  is_active: boolean;
  created_at: string;
}

interface Props {
  palette: PaletteRow | null; // null = create mode
  onClose: () => void;
  onSaved: (p: PaletteRow) => void;
}

const ROOM_EFFECTS = [
  "Beruhigend", "Belebend", "Wärmend", "Kühlend", "Neutral",
  "Festlich", "Romantisch", "Fokussierend", "Natürlich",
];

const DEFAULT_COLORS = {
  primary:   ["#2D5A4F", "#8BC5B4"],
  secondary: ["#C4956A", "#C96A50"],
  accent:    "#F5F0E8",
};

function safeHex(val: unknown, fallback: string): string {
  if (typeof val === "string" && /^#[0-9a-fA-F]{6}$/.test(val)) return val;
  return fallback;
}

// ── Color Picker Row ──────────────────────────────────────────────────────────

function ColorRow({
  label,
  colors,
  onChange,
  max = 4,
}: {
  label: string;
  colors: string[];
  onChange: (colors: string[]) => void;
  max?: number;
}) {
  const add  = () => onChange([...colors, "#cccccc"]);
  const rem  = (i: number) => onChange(colors.filter((_, idx) => idx !== i));
  const set  = (i: number, v: string) => onChange(colors.map((c, idx) => (idx === i ? v : c)));

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
        {colors.length < max && (
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900"
          >
            <Plus className="w-3 h-3" /> Farbe
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-1 group">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer overflow-hidden"
                style={{ backgroundColor: safeHex(c, "#cccccc") }}
              >
                <input
                  type="color"
                  value={safeHex(c, "#cccccc")}
                  onChange={(e) => set(i, e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </div>
            </div>
            <input
              type="text"
              value={c}
              onChange={(e) => set(i, e.target.value)}
              className="w-20 text-xs border border-gray-200 dark:border-gray-600 rounded px-1.5 py-1 font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              maxLength={7}
              placeholder="#000000"
            />
            {colors.length > 1 && (
              <button
                type="button"
                onClick={() => rem(i)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────

function PalettePreview({
  primary,
  secondary,
  accent,
}: {
  primary: string[];
  secondary: string[];
  accent: string | null;
}) {
  const allColors = [...primary, ...secondary, ...(accent ? [accent] : [])];
  return (
    <div className="flex gap-1.5 flex-wrap">
      {allColors.map((c, i) => (
        <div
          key={i}
          className="w-10 h-10 rounded-full border-2 border-white shadow"
          style={{ backgroundColor: safeHex(c, "#cccccc") }}
          title={c}
        />
      ))}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function PaletteModal({ palette, onClose, onSaved }: Props) {
  const isEdit = !!palette;

  const [name,       setName]       = useState(palette?.name ?? "");
  const [effect,     setEffect]     = useState(palette?.room_effect ?? "");
  const [primary,    setPrimary]    = useState<string[]>(
    palette?.primary_colors?.length ? palette.primary_colors : [...DEFAULT_COLORS.primary]
  );
  const [secondary,  setSecondary]  = useState<string[]>(
    palette?.secondary_colors?.length ? palette.secondary_colors : [...DEFAULT_COLORS.secondary]
  );
  const [accent,     setAccent]     = useState(
    palette?.accent_color ?? DEFAULT_COLORS.accent
  );
  const [isActive,   setIsActive]   = useState(palette?.is_active ?? true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  // Close on Escape
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
    if (!name.trim()) { setError("Name ist erforderlich"); return; }

    setSaving(true);
    try {
      const payload = {
        name:             name.trim(),
        room_effect:      effect || null,
        primary_colors:   primary,
        secondary_colors: secondary,
        accent_color:     accent || null,
        is_active:        isActive,
      };

      const url    = isEdit ? `/api/admin/palettes/${palette!.id}` : "/api/admin/palettes";
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
            {isEdit ? "Palette bearbeiten" : "Neue Farbpalette"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Vorschau</p>
            <PalettePreview primary={primary} secondary={secondary} accent={accent} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
              placeholder="z. B. Waldgrün-Palette"
            />
          </div>

          {/* Room Effect */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Raumwirkung</label>
            <select
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
            >
              <option value="">— keine —</option>
              {ROOM_EFFECTS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Primary Colors */}
          <ColorRow label="Primärfarben (max 2)" colors={primary} onChange={setPrimary} max={2} />

          {/* Secondary Colors */}
          <ColorRow label="Sekundärfarben (max 4)" colors={secondary} onChange={setSecondary} max={4} />

          {/* Accent */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Akzentfarbe</label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer overflow-hidden"
                  style={{ backgroundColor: safeHex(accent, "#F5F0E8") }}
                >
                  <input
                    type="color"
                    value={safeHex(accent, "#F5F0E8")}
                    onChange={(e) => setAccent(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
              </div>
              <input
                type="text"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-24 text-xs border border-gray-200 dark:border-gray-600 rounded px-1.5 py-1 font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                maxLength={7}
                placeholder="#F5F0E8"
              />
            </div>
          </div>

          {/* Active toggle — toggle bg adapts automatically */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Aktiv</span>
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
