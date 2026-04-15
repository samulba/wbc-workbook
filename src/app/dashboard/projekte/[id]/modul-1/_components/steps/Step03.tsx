"use client";

import { EFFECTS } from "../effectsConfig";

export function Step03() {
  return (
    <div className="flex flex-col gap-8">

      {/* Intro text */}
      <div className="rounded-2xl bg-forest/5 border border-forest/10 p-6">
        <p className="font-sans text-base text-forest/80 leading-relaxed">
          Räume beeinflussen, wie wir uns fühlen, denken und handeln. Jeder Raum
          kann eine oder mehrere Wirkungen haben – je nachdem, wie er gestaltet,
          beleuchtet und eingerichtet ist. Im nächsten Schritt wählst du die
          Hauptwirkung für deinen Raum.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EFFECTS.map((effect, index) => {
          const { Icon } = effect;
          return (
            <div
              key={effect.value}
              className={`relative rounded-2xl border p-6 ${effect.infoBg} ${effect.infoBorder} transition-shadow`}
            >
              {/* Index number */}
              <span className="absolute top-4 right-5 font-headline text-3xl text-black/5 leading-none select-none">
                {index + 1}
              </span>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${effect.infoIconBg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${effect.infoIconColor}`} strokeWidth={1.5} />
              </div>

              {/* Label */}
              <h3 className="font-headline text-lg text-forest leading-snug mb-1.5">
                {effect.label}
              </h3>

              {/* Keywords */}
              <p className={`text-sm font-sans font-medium ${effect.infoIconColor} mb-3`}>
                {effect.keywords}
              </p>

              {/* Description */}
              <p className="text-sm font-sans text-gray/60 leading-relaxed">
                {effect.description}
              </p>
            </div>
          );
        })}

        {/* 5th card spans full width on 2-col grid */}
        {/* (handled automatically – last card fills naturally) */}
      </div>

      {/* Forward hint */}
      <div className="flex items-center gap-3 text-sm text-gray/50 font-sans">
        <div className="h-px flex-1 bg-sand/30" />
        <span>Im nächsten Schritt wählst du deine Hauptwirkung</span>
        <div className="h-px flex-1 bg-sand/30" />
      </div>

    </div>
  );
}
