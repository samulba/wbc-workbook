"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ColorSwatch({
  label,
  value,
  onChange,
  placeholder = "z. B. Salbeigrün oder #94c1a4",
  className,
}: ColorSwatchProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  // Determine display color: use value if it looks like a hex, else white
  const isHex = /^#[0-9a-fA-F]{3,6}$/.test(value);
  const displayColor = isHex ? value : "#f6ede2";
  const isEmpty = !value.trim();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-xs font-sans font-medium text-gray/60 uppercase tracking-wider">
          {label}
        </span>
      )}

      <div className="flex items-center gap-3">
        {/* Swatch circle – click to open native color picker */}
        <button
          type="button"
          onClick={() => pickerRef.current?.click()}
          title="Farbe wählen"
          className={cn(
            "w-11 h-11 shrink-0 rounded-full border-2 transition-all hover:scale-105 active:scale-95 shadow-sm",
            isEmpty
              ? "border-dashed border-sand/60 bg-cream"
              : "border-sand/40 hover:border-forest/40"
          )}
          style={{ backgroundColor: displayColor }}
        >
          {isEmpty && (
            <span className="text-gray/30 text-lg leading-none">+</span>
          )}
        </button>

        {/* Hidden native color picker */}
        <input
          ref={pickerRef}
          type="color"
          value={isHex ? value : "#f6ede2"}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          aria-hidden
        />

        {/* Text input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex-1 h-10 rounded-lg border border-sand/60 bg-cream px-3 text-sm text-forest",
            "placeholder:text-gray/35 focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent",
            "transition-colors"
          )}
        />
      </div>
    </div>
  );
}
