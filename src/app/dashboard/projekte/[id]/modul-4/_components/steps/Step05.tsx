"use client";

import { Sunrise, Sun, Sunset, Calendar, Plus, Trash2, Eye, Ear, Flower, Hand, Apple } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { Module4Data, Ritual, RitualBlock } from "@/lib/types/module4";

const BLOCKS: { value: RitualBlock; label: string; hint: string; Icon: LucideIcon }[] = [
  { value: "morgen",     label: "Morgen-Ritual",    hint: "Aufwachen · Start in den Tag", Icon: Sunrise },
  { value: "tag",        label: "Tages-Ritual",     hint: "Arbeits-Pause · Reset",         Icon: Sun     },
  { value: "abend",      label: "Abend-Ritual",     hint: "Herunterfahren · Genießen",    Icon: Sunset  },
  { value: "wochenende", label: "Wochenend-Ritual", hint: "Langsamer · Bewusster",         Icon: Calendar},
];

const SENSES: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "sehen",    label: "Sehen",    Icon: Eye    },
  { value: "hoeren",   label: "Hören",    Icon: Ear    },
  { value: "riechen",  label: "Riechen",  Icon: Flower },
  { value: "fuehlen",  label: "Fühlen",   Icon: Hand   },
  { value: "schmecken",label: "Schmecken",Icon: Apple  },
];

interface Props {
  data:     Module4Data;
  onChange: (patch: Partial<Module4Data>) => void;
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function Step05({ data, onChange }: Props) {
  const rituals = data.rituals ?? [];

  function addRitual(block: RitualBlock) {
    onChange({
      rituals: [...rituals, { id: uid(), block, title: "", senses: [], notes: "" }],
    });
  }

  function updateRitual(id: string, patch: Partial<Ritual>) {
    onChange({ rituals: rituals.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  }

  function toggleSense(id: string, sense: string) {
    const r = rituals.find((x) => x.id === id);
    if (!r) return;
    const has = r.senses.includes(sense);
    updateRitual(id, {
      senses: has ? r.senses.filter((s) => s !== sense) : [...r.senses, sense],
    });
  }

  function removeRitual(id: string) {
    onChange({ rituals: rituals.filter((r) => r.id !== id) });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <h3 className="font-headline text-lg text-forest mb-1">Ritual-Builder</h3>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Rituale machen einen Raum zum Zuhause. Plane kleine, wiederkehrende Momente pro Tageszeit und
          entscheide, welche Sinne du dabei ansprichst.
        </p>
      </div>

      {/* Quick-adds per block */}
      <div className="flex flex-wrap gap-2">
        {BLOCKS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => addRitual(value)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sand/40 bg-cream text-xs font-sans text-forest/70 hover:border-forest/40 hover:bg-mint/10 transition-colors"
          >
            <Icon className="w-3 h-3" strokeWidth={1.5} />
            <Plus className="w-3 h-3" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Rituals grouped by block */}
      {BLOCKS.map(({ value, label, hint, Icon }) => {
        const inBlock = rituals.filter((r) => r.block === value);
        if (inBlock.length === 0) return null;
        return (
          <section key={value} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest/8 border border-forest/12 flex items-center justify-center">
                <Icon className="w-4 h-4 text-forest/70" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-sans font-semibold text-forest leading-tight">{label}</p>
                <p className="text-[11px] text-gray/50 font-sans">{hint}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {inBlock.map((r) => (
                <div key={r.id} className="rounded-xl border border-sand/40 bg-white p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Ritual-Name, z. B. Morgen-Tee am Fenster"
                      value={r.title}
                      onChange={(e) => updateRitual(r.id, { title: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removeRitual(r.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      aria-label="Ritual entfernen"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-sand mb-1.5 font-sans">
                      Welche Sinne spricht es an?
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SENSES.map(({ value: sv, label: sl, Icon: SIcon }) => {
                        const active = r.senses.includes(sv);
                        return (
                          <button
                            key={sv}
                            type="button"
                            onClick={() => toggleSense(r.id, sv)}
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-sans transition",
                              active
                                ? "bg-forest text-cream border-forest"
                                : "bg-white border-sand/40 text-forest/70 hover:border-forest/30",
                            )}
                          >
                            <SIcon className="w-3 h-3" strokeWidth={1.5} />
                            {sl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Textarea
                    placeholder="Detail-Notiz: Jasmintee, weicher Kaschmir-Schal, Sonnenlicht durchs Fenster …"
                    value={r.notes}
                    onChange={(e) => updateRitual(r.id, { notes: e.target.value })}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {rituals.length === 0 && (
        <div className="rounded-xl border border-dashed border-sand/50 px-5 py-6 text-center">
          <p className="text-sm text-gray/55 font-sans">
            Noch keine Rituale — wähle oben einen Tageszeit-Block.
          </p>
        </div>
      )}
    </div>
  );
}
