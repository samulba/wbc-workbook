"use client";

import Link from "next/link";
import { BrainCircuit, Camera, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  projectId: string;
  roomId:    string;
  hasAnalysis: boolean;
}

export function StepKiAnalyse({ projectId, roomId, hasAnalysis }: Props) {
  const href = `/dashboard/projekte/${projectId}/raum/${roomId}/analyse`;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="w-4 h-4 text-forest" strokeWidth={1.5} />
          <h3 className="font-headline text-lg text-forest">KI-Raumanalyse (optional)</h3>
        </div>
        <p className="text-sm text-gray/60 font-sans leading-relaxed">
          Lade ein Foto deines Raums hoch und lass die Wellbeing KI eine Einschätzung
          liefern — Licht, Farbstimmung, was bereits gut funktioniert und wo Potenzial
          schlummert. Dieser Schritt ist freiwillig, hilft aber in den Folge-Modulen enorm.
        </p>
      </div>

      {hasAnalysis ? (
        <Link
          href={href}
          className="flex items-start gap-4 rounded-xl border border-forest/30 bg-gradient-to-br from-forest/5 to-mint/10 px-5 py-4 hover:from-forest/10 hover:to-mint/20 hover:border-forest/50 hover:shadow-warm-sm transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-forest text-cream flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-sans font-semibold text-forest leading-snug">
              Deine KI-Analyse liegt bereit
            </p>
            <p className="text-xs font-sans text-forest/60 mt-0.5">
              Öffne sie, um die Einschätzung nochmal zu lesen oder den Raum neu zu visualisieren.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-forest shrink-0 bg-cream border border-forest/20 rounded-full px-3 py-1.5 group-hover:bg-forest group-hover:text-cream transition-colors">
            Öffnen
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
          </span>
        </Link>
      ) : (
        <Link
          href={href}
          className="flex items-start gap-4 rounded-xl border border-forest/30 bg-gradient-to-br from-forest/5 to-mint/10 px-5 py-4 hover:from-forest/10 hover:to-mint/20 hover:border-forest/50 hover:shadow-warm-sm transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-forest text-cream flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-sans font-semibold text-forest leading-snug">
              Analyse starten
            </p>
            <p className="text-xs font-sans text-forest/60 mt-0.5">
              Foto hochladen → GPT-4o-Vision liest Atmosphäre, Licht und Farben und erstellt
              eine konkrete Einschätzung inkl. Verbesserungsvorschlägen.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-forest shrink-0 bg-cream border border-forest/20 rounded-full px-3 py-1.5 group-hover:bg-forest group-hover:text-cream transition-colors">
            Starten
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
          </span>
        </Link>
      )}

      {/* Value props */}
      <div className="grid sm:grid-cols-3 gap-3">
        <ValuePropCard Icon={Camera} title="Foto reicht"
          desc="Dein Smartphone-Foto oder Screenshot genügt – keine Profi-Kamera nötig." />
        <ValuePropCard Icon={BrainCircuit} title="Direkte Insights"
          desc="Die KI erkennt Licht-Situation, Farbstimmung, Zonen und gibt konkrete Hinweise." />
        <ValuePropCard Icon={Sparkles} title="Hilft später"
          desc="Die Ergebnisse fließen in M2-Stilfindung und M3-Lichtkonzept ein." />
      </div>

      <p className="text-xs text-gray/45 font-sans italic">
        Du kannst diesen Schritt auch überspringen und später jederzeit zurückkehren – die Analyse
        bleibt optional.
      </p>
    </div>
  );
}

function ValuePropCard({
  Icon, title, desc,
}: {
  Icon:  React.ElementType;
  title: string;
  desc:  string;
}) {
  return (
    <div className="rounded-xl border border-sand/40 bg-white p-4 flex flex-col gap-2">
      <div className="w-9 h-9 rounded-lg bg-forest/8 border border-forest/12 flex items-center justify-center">
        <Icon className="w-4 h-4 text-forest/70" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-sans font-semibold text-forest leading-tight">{title}</p>
      <p className="text-xs text-gray/55 font-sans leading-relaxed">{desc}</p>
    </div>
  );
}
