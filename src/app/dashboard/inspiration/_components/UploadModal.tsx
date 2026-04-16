"use client";

import { useRef, useState } from "react";
import { X, Upload, Loader2, Check, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InspirationImage } from "./InspirationFeed";

// ── Color extraction via canvas ───────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function colorDist(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

async function extractColors(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 80;
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      URL.revokeObjectURL(url);

      // Sample every 8th pixel
      const pixels: [number, number, number][] = [];
      for (let i = 0; i < data.length; i += 4 * 8) {
        // Skip near-white and near-black pixels
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const brightness = (r + g + b) / 3;
        if (brightness > 240 || brightness < 15) continue;
        pixels.push([r, g, b]);
      }

      // Pick 3 maximally different colors
      if (!pixels.length) { resolve([]); return; }
      const selected: [number, number, number][] = [pixels[Math.floor(pixels.length / 2)]];
      for (const p of pixels) {
        const minDist = Math.min(...selected.map(s => colorDist(p, s)));
        if (minDist > 45) {
          selected.push(p);
          if (selected.length >= 3) break;
        }
      }
      resolve(selected.map(([r, g, b]) => rgbToHex(r, g, b)));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve([]); };
    img.src = url;
  });
}

// ── Options ───────────────────────────────────────────────────────────────────

const EFFECTS = [
  { value: "ruhe_erholung",            label: "Ruhe & Erholung" },
  { value: "fokus_konzentration",      label: "Fokus & Konzentration" },
  { value: "energie_aktivitaet",       label: "Energie & Aktivität" },
  { value: "kreativitaet_inspiration", label: "Kreativität & Inspiration" },
  { value: "begegnung_austausch",      label: "Begegnung & Austausch" },
];

const ROOM_TYPES = [
  { value: "wohnzimmer",   label: "Wohnzimmer" },
  { value: "schlafzimmer", label: "Schlafzimmer" },
  { value: "arbeitszimmer",label: "Arbeitszimmer" },
  { value: "kueche",       label: "Küche" },
  { value: "badezimmer",   label: "Bad" },
  { value: "esszimmer",    label: "Esszimmer" },
  { value: "yogaraum",     label: "Yogaraum" },
  { value: "sonstiges",    label: "Sonstiges" },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onClose:    () => void;
  onUploaded: (img: InspirationImage) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UploadModal({ onClose, onUploaded }: Props) {
  const fileRef    = useRef<HTMLInputElement>(null);
  const [file,     setFile]     = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [colors,   setColors]   = useState<string[]>([]);
  const [title,    setTitle]    = useState("");
  const [effect,   setEffect]   = useState("");
  const [roomType, setRoomType] = useState("");
  const [status,   setStatus]   = useState<"idle" | "extracting" | "uploading" | "done" | "error">("idle");
  const [errMsg,   setErrMsg]   = useState("");

  async function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("extracting");
    const c = await extractColors(f);
    setColors(c);
    setStatus("idle");
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus("uploading");
    setErrMsg("");

    const form = new FormData();
    form.append("file",     file);
    form.append("title",    title);
    form.append("effect",   effect);
    form.append("roomType", roomType);
    form.append("colors",   JSON.stringify(colors));

    const res = await fetch("/api/upload/inspiration", { method: "POST", body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrMsg(data.error ?? "Upload fehlgeschlagen.");
      setStatus("error");
      return;
    }
    const created = await res.json();
    setStatus("done");
    setTimeout(() => { onUploaded(created); onClose(); }, 800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[95dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-headline text-lg text-gray-900 dark:text-gray-100">Eigenes Bild hochladen</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 flex flex-col gap-5">

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            className={cn(
              "relative rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden",
              file ? "border-forest/30" : "border-gray-200 hover:border-forest/40"
            )}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Vorschau" className="w-full max-h-56 object-cover block" />
            ) : (
              <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
                <ImagePlus className="w-8 h-8" strokeWidth={1} />
                <div className="text-center">
                  <p className="text-sm font-sans font-medium text-gray-600">Bild hier ablegen</p>
                  <p className="text-xs font-sans mt-0.5">oder klicken zum Auswählen (max. 10 MB)</p>
                </div>
              </div>
            )}
            {file && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-sm text-white font-sans font-medium bg-black/50 px-3 py-1 rounded-full">Anderes Bild wählen</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />

          {/* Extracted colors */}
          {status === "extracting" && (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-sans">
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
              Farben werden analysiert …
            </div>
          )}
          {colors.length > 0 && status !== "extracting" && (
            <div>
              <p className="text-xs font-sans text-gray-500 mb-2">Extrahierte Farben</p>
              <div className="flex gap-2">
                {colors.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: c }} />
                    <span className="text-[9px] font-mono text-gray-400">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titel (optional)"
            className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-sans text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/40"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={effect}
              onChange={e => setEffect(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-sans text-gray-700 focus:outline-none focus:ring-2 focus:ring-forest/20"
            >
              <option value="">Wirkung …</option>
              {EFFECTS.map(ef => <option key={ef.value} value={ef.value}>{ef.label}</option>)}
            </select>
            <select
              value={roomType}
              onChange={e => setRoomType(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-sans text-gray-700 focus:outline-none focus:ring-2 focus:ring-forest/20"
            >
              <option value="">Raumtyp …</option>
              {ROOM_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
            </select>
          </div>

          {errMsg && (
            <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">{errMsg}</p>
          )}

          <button
            type="submit"
            disabled={!file || status === "uploading" || status === "extracting" || status === "done"}
            className="h-11 rounded-xl bg-forest text-white text-sm font-sans font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
          >
            {status === "uploading" && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />}
            {status === "done"      && <Check   className="w-4 h-4"              strokeWidth={2}   />}
            {status === "uploading" ? "Wird hochgeladen …" : status === "done" ? "Hochgeladen!" : (
              <><Upload className="w-4 h-4" strokeWidth={1.5} /> Bild hochladen</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
