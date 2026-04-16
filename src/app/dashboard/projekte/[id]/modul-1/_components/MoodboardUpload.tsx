"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, UploadCloud, AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  urls: string[];
  projectId: string;
  roomId: string;
  maxImages?: number;
  onChange: (urls: string[]) => void;
}

export function MoodboardUpload({
  urls,
  projectId,
  roomId,
  maxImages = 4,
  onChange,
}: Props) {
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const lastFileRef                 = useRef<File | null>(null);
  const dragCounterRef              = useRef(0);

  const canUploadMore = urls.length < maxImages;

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      lastFileRef.current = file;

      // Client-side validation
      const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
      if (!ALLOWED.includes(file.type)) {
        setError("Ungültiges Format. Nur JPG, PNG und WebP erlaubt.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Datei zu groß. Maximal 5 MB erlaubt.");
        return;
      }

      setUploading(true);
      setProgress(15);

      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("projectId", projectId);
        fd.append("roomId", roomId);

        setProgress(40);
        const res = await fetch("/api/upload/moodboard", { method: "POST", body: fd });
        setProgress(85);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error ?? "Upload fehlgeschlagen. Bitte erneut versuchen.");
          setUploading(false);
          setProgress(0);
          return;
        }

        const { url } = await res.json();
        setProgress(100);

        // Capture current urls via closure snapshot — safe because uploadFile
        // is recreated when `urls` changes (it's in the dep array below)
        onChange([...urls, url]);

        setTimeout(() => {
          setProgress(0);
          setUploading(false);
        }, 400);
      } catch {
        setError("Upload fehlgeschlagen. Bitte erneut versuchen.");
        setUploading(false);
        setProgress(0);
      }
    },
    [urls, projectId, roomId, onChange]
  );

  const handleDelete = useCallback(
    async (urlToDelete: string) => {
      // Optimistic update
      onChange(urls.filter((u) => u !== urlToDelete));

      // Background storage delete (fire-and-forget — orphaned files are acceptable)
      fetch("/api/upload/moodboard", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToDelete }),
      }).catch(() => undefined);
    },
    [urls, onChange]
  );

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current++;
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current = 0;
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && canUploadMore && !uploading) uploadFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && canUploadMore && !uploading) uploadFile(file);
    e.target.value = "";
  }

  // ── Uploaded images grid ───────────────────────────────────────────────────
  const gridClass =
    urls.length === 1
      ? "grid-cols-1"
      : urls.length === 2
      ? "grid-cols-2"
      : "grid-cols-2";

  return (
    <div className="flex flex-col gap-3">

      {/* Existing images */}
      {urls.length > 0 && (
        <div className={cn("grid gap-2", gridClass)}>
          {urls.map((url, i) => (
            <div
              key={url}
              className="relative group rounded-xl overflow-hidden border border-sand/30 bg-sand/5"
              style={{ aspectRatio: urls.length === 1 ? "16/9" : "4/3" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Moodboard ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(url)}
                title="Bild entfernen"
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/55 hover:bg-black/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </button>
              <span className="absolute bottom-2 left-2 text-[10px] font-sans font-medium text-white/70 bg-black/30 rounded-md px-1.5 py-0.5">
                {i + 1} / {urls.length}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload drop zone */}
      {canUploadMore && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Bild hochladen"
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && !uploading && fileInputRef.current?.click()}
          className={cn(
            "rounded-xl border-2 border-dashed transition-all duration-150 outline-none",
            urls.length === 0 ? "aspect-video" : "h-20",
            uploading ? "cursor-not-allowed pointer-events-none" : "cursor-pointer",
            dragOver
              ? "border-forest/50 bg-forest/5 scale-[1.01]"
              : "border-sand/40 bg-sand/5 hover:border-forest/35 hover:bg-forest/[0.02]",
            "flex flex-col items-center justify-center gap-2"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 w-full px-8">
              <span className="w-5 h-5 rounded-full border-2 border-forest/30 border-t-forest animate-spin" />
              <div className="w-full h-1.5 rounded-full bg-sand/30 overflow-hidden">
                <div
                  className="h-full bg-forest/60 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray/40 font-sans">{progress}% hochgeladen</p>
            </div>
          ) : (
            <>
              <UploadCloud
                className={cn("w-6 h-6", dragOver ? "text-forest/50" : "text-sand/50")}
                strokeWidth={1.5}
              />
              {urls.length === 0 ? (
                <>
                  <p className="text-sm font-sans font-medium text-forest/60 text-center px-4">
                    Bild hier ablegen oder{" "}
                    <span className="underline underline-offset-2">auswählen</span>
                  </p>
                  <p className="text-xs text-gray/35 font-sans">
                    JPG · PNG · WebP · max. 5 MB
                  </p>
                </>
              ) : (
                <p className="text-xs text-forest/50 font-sans">
                  + Weiteres Bild ({urls.length}/{maxImages})
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-terracotta/8 border border-terracotta/20">
          <AlertCircle className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-xs text-terracotta font-sans flex-1 leading-relaxed">{error}</p>
          <div className="flex items-center gap-1 shrink-0">
            {lastFileRef.current && (
              <button
                type="button"
                onClick={() => lastFileRef.current && uploadFile(lastFileRef.current)}
                title="Erneut versuchen"
                className="w-6 h-6 flex items-center justify-center rounded-md text-terracotta/70 hover:text-terracotta hover:bg-terracotta/10 transition-colors"
              >
                <RefreshCw className="w-3 h-3" strokeWidth={2} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setError(null)}
              className="w-6 h-6 flex items-center justify-center rounded-md text-terracotta/70 hover:text-terracotta hover:bg-terracotta/10 transition-colors"
            >
              <X className="w-3 h-3" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
