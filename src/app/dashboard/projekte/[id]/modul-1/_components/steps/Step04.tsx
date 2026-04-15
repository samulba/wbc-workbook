"use client";

import { cn } from "@/lib/utils";
import { EFFECTS, type RoomEffect } from "../effectsConfig";
import type { Module1Data } from "@/lib/types/module1";
import { Info } from "lucide-react";
import { ProductRecommendations } from "../ProductRecommendations";

interface Props {
  data:     Module1Data;
  roomType: string;
  onChange: (patch: Partial<Module1Data>) => void;
}

export function Step04({ data, roomType, onChange }: Props) {
  const selected = data.main_effect ?? null;

  function select(value: RoomEffect) {
    onChange({ main_effect: value });
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {EFFECTS.map((effect) => {
          const { Icon } = effect;
          const isSelected = selected === effect.value;

          return (
            <button
              key={effect.value}
              type="button"
              onClick={() => select(effect.value)}
              className={cn(
                "w-full text-left rounded-2xl border-2 p-5 transition-all duration-150 group",
                isSelected
                  ? `${effect.selectedBg} ${effect.selectedBorder} ${effect.selectedRing}`
                  : `${effect.cardBg} ${effect.cardBorder} hover:border-sand hover:bg-sand/5`
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon bubble */}
                <div
                  className={cn(
                    "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors",
                    isSelected ? effect.selectedIconBg : "bg-sand/20 group-hover:bg-sand/30"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isSelected ? effect.infoIconColor : "text-gray/50"
                    )}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={cn(
                      "font-headline text-lg leading-snug transition-colors",
                      isSelected ? "text-forest" : "text-forest/70"
                    )}>
                      {effect.label}
                    </h3>
                    {/* Selected indicator */}
                    <span className={cn(
                      "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected ? "border-forest bg-forest" : "border-sand/60"
                    )}>
                      {isSelected && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-cream stroke-[2.5]">
                          <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </div>

                  <p className={cn(
                    "text-sm font-sans font-medium mb-1 transition-colors",
                    isSelected ? effect.infoIconColor : "text-gray/40"
                  )}>
                    {effect.keywords}
                  </p>

                  <p className={cn(
                    "text-sm font-sans leading-relaxed transition-colors",
                    isSelected ? "text-gray/70" : "text-gray/40"
                  )}>
                    {effect.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 rounded-xl bg-sand/15 border border-sand/30 px-4 py-3.5">
        <Info className="w-4 h-4 text-sand shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-sm font-sans text-gray/60 leading-relaxed">
          <span className="font-medium text-forest/70">Tipp:</span> Bei
          multifunktionalen Räumen – z. B. einem Wohn-Arbeitszimmer – kannst du
          im nächsten Schritt weitere Wirkungen ergänzen. Wähle hier die
          Wirkung, die am stärksten im Vordergrund stehen soll.
        </p>
      </div>

      {/* Product recommendations – shown once an effect is selected */}
      <ProductRecommendations
        roomType={roomType}
        mainEffect={data.main_effect}
        roomId={data.room_id ?? null}
        heading={
          selected
            ? `Passende Produkte für ${EFFECTS.find((e) => e.value === selected)?.label ?? "deine Wirkung"}`
            : "Produktempfehlungen"
        }
        requireEffect
      />

    </div>
  );
}
