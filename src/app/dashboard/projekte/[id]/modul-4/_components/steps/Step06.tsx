"use client";

import { Eye, Ear, Flower, Hand, Apple } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Module4Data } from "@/lib/types/module4";

interface Props {
  data: Module4Data;
}

export function Step06({ data }: Props) {
  const reverb = data.reverb_level;
  const measures = data.acoustic_measures ?? [];
  const scent = data.scent_method;
  const scentNotes = data.scent_notes ?? "";
  const plants = data.plant_suggestions ?? [];
  const preferred = data.preferred_materials ?? [];
  const rejected = data.rejected_materials ?? [];
  const rituals = data.rituals ?? [];

  const senseCounts = rituals.reduce<Record<string, number>>((acc, r) => {
    r.senses.forEach((s) => { acc[s] = (acc[s] ?? 0) + 1; });
    return acc;
  }, {});

  const SENSES: { value: string; label: string; Icon: LucideIcon }[] = [
    { value: "sehen",     label: "Sehen",     Icon: Eye },
    { value: "hoeren",    label: "Hören",     Icon: Ear },
    { value: "riechen",   label: "Riechen",   Icon: Flower },
    { value: "fuehlen",   label: "Fühlen",    Icon: Hand },
    { value: "schmecken", label: "Schmecken", Icon: Apple },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <h3 className="font-headline text-lg text-forest mb-1">Dein Sinnes-Konzept im Überblick</h3>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          So sieht dein Sinnes-Plan aus — bei Bedarf gehst du zurück und passt an.
          Klicke unten auf &bdquo;Abschließen&ldquo;, um das Konzept als abgeschlossen zu markieren.
        </p>
      </div>

      {/* Sinne-Verteilung in Ritualen */}
      <div className="rounded-xl border border-sand/30 bg-white p-4">
        <p className="text-[10px] uppercase tracking-widest text-sand mb-3 font-sans">
          Sinne-Fokus in deinen Ritualen
        </p>
        <div className="grid grid-cols-5 gap-2">
          {SENSES.map(({ value, label, Icon }) => {
            const count = senseCounts[value] ?? 0;
            return (
              <div key={value} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${count > 0 ? "bg-forest/8 border-forest/20 text-forest" : "bg-cream border-sand/30 text-gray/40"}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] font-sans text-forest/70">{label}</p>
                <p className="text-[11px] font-mono text-gray/50 tabular-nums">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      <Section label="Akustik">
        {reverb ? (
          <p className="text-sm text-forest/80 font-sans capitalize">Nachhall: {reverb}</p>
        ) : (
          <p className="text-sm text-gray/45 font-sans italic">Noch nicht eingeschätzt</p>
        )}
        {measures.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {measures.map((m) => (
              <span key={m} className="text-[11px] font-sans text-forest/70 bg-cream border border-sand/30 px-2.5 py-0.5 rounded-full">
                {m}
              </span>
            ))}
          </div>
        )}
      </Section>

      <Section label="Duft & Luft">
        {scent ? (
          <p className="text-sm text-forest/80 font-sans">Duft-Träger: {scent}</p>
        ) : (
          <p className="text-sm text-gray/45 font-sans italic">Noch nicht gewählt</p>
        )}
        {scentNotes && (
          <p className="text-xs text-gray/60 font-sans mt-1 italic">&bdquo;{scentNotes}&ldquo;</p>
        )}
        {plants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {plants.map((p) => (
              <span key={p.id} className="text-[11px] font-sans text-forest/70 bg-mint/12 border border-mint/25 px-2.5 py-0.5 rounded-full">
                {p.name || "Unbenannt"}
              </span>
            ))}
          </div>
        )}
      </Section>

      <Section label="Haptik">
        {preferred.length === 0 && rejected.length === 0 && (
          <p className="text-sm text-gray/45 font-sans italic">Noch keine Materialien bewertet</p>
        )}
        {preferred.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {preferred.map((m) => (
              <span key={m} className="text-[11px] font-sans text-forest bg-forest/10 border border-forest/25 px-2.5 py-0.5 rounded-full">
                ✓ {m}
              </span>
            ))}
          </div>
        )}
        {rejected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {rejected.map((m) => (
              <span key={m} className="text-[11px] font-sans text-red-600/70 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                ✗ {m}
              </span>
            ))}
          </div>
        )}
      </Section>

      <Section label={`Rituale (${rituals.length})`}>
        {rituals.length === 0 ? (
          <p className="text-sm text-gray/45 font-sans italic">Noch keine Rituale erfasst</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {rituals.map((r) => (
              <div key={r.id} className="text-sm font-sans text-forest/80">
                <span className="text-[11px] text-sand uppercase tracking-wider mr-2">{r.block}</span>
                {r.title || "Unbenannt"}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-sand/30 bg-white p-4">
      <p className="text-[10px] uppercase tracking-widest text-sand mb-2 font-sans">{label}</p>
      {children}
    </div>
  );
}
