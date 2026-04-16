"use client";

import { useRef, useState } from "react";
import { X, Upload, Loader2, Check, Link2, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InspImage {
  id:          string;
  image_url:   string;
  title:       string | null;
  description: string | null;
  room_effect: string | null;
  room_type:   string | null;
  colors:      string[];
  tags:        string[];
  is_active:   boolean;
  user_id:     string | null;
  created_at:  string;
}

interface Props {
  mode:       "create" | "edit";
  initial?:   InspImage | null;
  onClose:    () => void;
  onSaved:    (img: InspImage) => void;
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
  { value: "wohnzimmer",    label: "Wohnzimmer"   },
  { value: "schlafzimmer",  label: "Schlafzimmer" },
  { value: "arbeitszimmer", label: "Arbeitszimmer"},
  { value: "kueche",        label: "Küche"        },
  { value: "badezimmer",    label: "Bad"          },
  { value: "esszimmer",     label: "Esszimmer"    },
  { value: "yogaraum",      label: "Yogaraum"     },
  { value: "kinderzimmer",  label: "Kinderzimmer" },
  { value: "flur",          label: "Flur"         },
  { value: "keller",        label: "Keller"       },
  { value: "buero",         label: "Büro"         },
  { value: "wellness",      label: "Wellness"     },
  { value: "studio",        label: "Studio"       },
  { value: "sonstiges",     label: "Sonstiges"    },
];

function safeHex(v: string | undefined): string {
  if (!v || !/^#[0-9A-Fa-f]{6}$/.test(v)) return "#C8D5B9";
  return v;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ImageModal({ mode, initial, onClose, onSaved }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  // Source mode
  const [inputMode,  setInputMode]  = useState<"url" | "upload">("url");
  const [imageUrl,   setImageUrl]   = useState(initial?.image_url ?? "");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [preview,    setPreview]    = useState<string>(initial?.image_url ?? "");

  // Fields
  const [title,      setTitle]      = useState(initial?.title       ?? "");
  const [desc,       setDesc]       = useState(initial?.description  ?? "");
  const [effect,     setEffect]     = useState(initial?.room_effect  ?? "");
  const [roomType,   setRoomType]   = useState(initial?.room_type    ?? "");
  const [color1,     setColor1]     = useState(safeHex(initial?.colors?.[0]));
  const [color2,     setColor2]     = useState(safeHex(initial?.colors?.[1]));
  const [color3,     setColor3]     = useState(safeHex(initial?.colors?.[2]));
  const [tagsInput,  setTagsInput]  = useState((initial?.tags ?? []).join(", "));
  const [isActive,   setIsActive]   = useState(initial?.is_active ?? true);

  const [saving,  setSaving]  = useState(false);
  const [errMsg,  setErrMsg]  = useState("");
  const [done,    setDone]    = useState(false);

  function handleFileSelect(f: File) {
    if (!f.type.startsWith("image/")) return;
    setUploadFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (inputMode === "url" && !imageUrl.trim()) {
      setErrMsg("Bitte Bild-URL eingeben.");
      return;
    }
    if (inputMode === "upload" && !uploadFile && mode === "create") {
      setErrMsg("Bitte Datei auswählen.");
      return;
    }

    setSaving(true);
    setErrMsg("");

    const colors = [color1, color2, color3].filter(c => c !== "#C8D5B9" || initial?.colors?.includes(c) ? true : false);
    const tags   = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

    let res: Response;
    const isEdit = mode === "edit" && initial;

    if (inputMode === "upload" && uploadFile) {
      const form = new FormData();
      form.append("file",        uploadFile);
      form.append("title",       title);
      form.append("description", desc);
      form.append("room_effect", effect);
      form.append("room_type",   roomType);
      form.append("colors",      JSON.stringify(colors));
      form.append("tags",        JSON.stringify(tags));
      form.append("is_active",   String(isActive));

      if (isEdit) {
        // Upload new file first, then PATCH the URL
        res = await fetch("/api/admin/inspiration", { method: "POST", body: form });
        if (!res.ok) { const d = await res.json().catch(() => ({})); setErrMsg(d.error ?? "Fehler"); setSaving(false); return; }
        const created: InspImage = await res.json();
        // Delete old, return new
        await fetch(`/api/admin/inspiration/${initial.id}`, { method: "DELETE" });
        setDone(true);
        setTimeout(() => { onSaved(created); onClose(); }, 600);
        return;
      } else {
        res = await fetch("/api/admin/inspiration", { method: "POST", body: form });
      }
    } else {
      const payload = {
        image_url:   imageUrl.trim(),
        title:       title || null,
        description: desc  || null,
        room_effect: effect || null,
        room_type:   roomType || null,
        colors,
        tags,
        is_active:   isActive,
      };
      const url    = isEdit ? `/api/admin/inspiration/${initial.id}` : "/api/admin/inspiration";
      const method = isEdit ? "PATCH" : "POST";
      res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErrMsg(d.error ?? "Speichern fehlgeschlagen.");
      setSaving(false);
      return;
    }

    const saved: InspImage = await res.json();
    setDone(true);
    setTimeout(() => { onSaved(saved); onClose(); }, 600);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl shadow-2xl max-h-[95dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
            {mode === "create" ? "Neues Bild hinzufügen" : "Bild bearbeiten"}
          </h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">

          {/* Source toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
            {(["url", "upload"] as const).map(m => (
              <button key={m} type="button" onClick={() => setInputMode(m)}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 font-medium transition-colors",
                  inputMode === m ? "bg-forest text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}>
                {m === "url" ? <Link2 className="w-3.5 h-3.5" strokeWidth={2} /> : <Upload className="w-3.5 h-3.5" strokeWidth={2} />}
                {m === "url" ? "URL eingeben" : "Datei hochladen"}
              </button>
            ))}
          </div>

          {/* URL input */}
          {inputMode === "url" && (
            <div>
              <input
                type="url"
                value={imageUrl}
                onChange={e => { setImageUrl(e.target.value); setPreview(e.target.value); }}
                placeholder="https://images.unsplash.com/…"
                className="w-full h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
          )}

          {/* File upload */}
          {inputMode === "upload" && (
            <div
              role="button" tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={onDrop}
              className={cn(
                "rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden",
                uploadFile ? "border-forest/30" : "border-gray-200 dark:border-gray-700 hover:border-forest/40"
              )}
            >
              {preview && inputMode === "upload" && uploadFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="w-full max-h-48 object-cover" />
              ) : (
                <div className="py-8 flex flex-col items-center gap-2 text-gray-400">
                  <ImagePlus className="w-7 h-7" strokeWidth={1} />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Datei ablegen oder klicken</p>
                  <p className="text-xs">JPG, PNG, WebP – max 10 MB</p>
                </div>
              )}
              {uploadFile && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white bg-black/50 px-3 py-1 rounded-full">Andere Datei wählen</p>
                </div>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

          {/* Image preview (URL mode) */}
          {inputMode === "url" && preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="w-full max-h-40 object-cover rounded-xl border border-gray-100 dark:border-gray-700" onError={() => setPreview("")} />
          )}

          {/* Titel + Beschreibung */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titel (optional)" className="h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20" />
            <input type="text" value={desc}  onChange={e => setDesc(e.target.value)}  placeholder="Beschreibung (optional)" className="h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20" />
          </div>

          {/* Wirkung + Raumtyp */}
          <div className="grid grid-cols-2 gap-3">
            <select value={effect} onChange={e => setEffect(e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20">
              <option value="">Wirkung …</option>
              {EFFECTS.map(ef => <option key={ef.value} value={ef.value}>{ef.label}</option>)}
            </select>
            <select value={roomType} onChange={e => setRoomType(e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20">
              <option value="">Raumtyp …</option>
              {ROOM_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
            </select>
          </div>

          {/* Color pickers */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Farben</p>
            <div className="flex gap-4">
              {([
                { label: "Farbe 1", val: color1, set: setColor1 },
                { label: "Farbe 2", val: color2, set: setColor2 },
                { label: "Farbe 3", val: color3, set: setColor3 },
              ] as const).map(({ label, val, set }) => (
                <label key={label} className="flex flex-col items-center gap-1.5 cursor-pointer">
                  <div className="relative w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm hover:scale-105 transition-transform">
                    <span className="absolute inset-0" style={{ backgroundColor: val }} />
                    <input type="color" value={val} onChange={e => set(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{val}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <input
              type="text" value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Tags: skandinavisch, hell, holz, …"
              className="w-full h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20"
            />
            <p className="text-[11px] text-gray-400 mt-1">Komma-getrennt</p>
          </div>

          {/* is_active toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Aktiv</p>
              <p className="text-xs text-gray-400">Inaktive Bilder werden im Feed ausgeblendet</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(v => !v)}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                isActive ? "bg-forest" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <span className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                isActive ? "left-5.5 translate-x-0.5" : "left-0.5"
              )} />
            </button>
          </div>

          {/* Error */}
          {errMsg && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{errMsg}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || done}
            className="w-full h-11 rounded-xl bg-forest text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />}
            {done   && <Check   className="w-4 h-4"              strokeWidth={2}   />}
            {saving ? "Wird gespeichert …" : done ? "Gespeichert!" : mode === "create" ? "Bild hinzufügen" : "Änderungen speichern"}
          </button>

        </form>
      </div>
    </div>
  );
}
