"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { deleteRoom, updateRoomPhoto } from "@/app/actions/projects";
import {
  CheckCircle2, ArrowRight, Trash2, AlertTriangle,
  Sparkles, ImagePlus, X, SplitSquareHorizontal, Share2, BrainCircuit, Wand2,
} from "lucide-react";
import { ShareModal } from "@/app/dashboard/_components/ShareModal";
import { CircleProgress } from "@/components/CircleProgress";

const ROOM_LABELS: Record<string, string> = {
  wohnzimmer: "Wohnzimmer", schlafzimmer: "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer", kinderzimmer: "Kinderzimmer",
  badezimmer: "Bad", kueche: "Küche", esszimmer: "Esszimmer",
  flur: "Flur", keller: "Keller", buero: "Büro",
  yogaraum: "Yogaraum", wellness: "Wellness",
  studio: "Studio", sonstiges: "Sonstiges",
};

export type RoomCardData = {
  id: string;
  name: string;
  room_type: string;
  before_image_url: string | null;
  after_image_url: string | null;
  share_token: string | null;
  is_shared: boolean;
  ai_analysis: string | null;
  rendered_images: string[] | null;
  module1_analysis: { status: string | null; current_step: number | null }[] | null;
  module2_analysis: { status: string | null; current_step: number | null }[] | null;
  module3_analysis: { status: string | null; current_step: number | null }[] | null;
  module4_analysis: { status: string | null; current_step: number | null }[] | null;
};

interface Props {
  room: RoomCardData;
  projectId: string;
  canDelete: boolean;
}

const TOTAL_STEPS = 11;

export function RoomCard({ room, projectId, canDelete }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError]     = useState<string | null>(null);

  // Share modal state
  const [showShare, setShowShare] = useState(false);

  // Photo state
  const [uploadingPhoto, setUploadingPhoto] = useState<"before" | "after" | null>(null);
  const [photoError, setPhotoError]         = useState<string | null>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef  = useRef<HTMLInputElement>(null);

  const m1          = room.module1_analysis?.[0];
  const m1Completed = m1?.status === "completed";
  const m1Step      = m1Completed ? TOTAL_STEPS : (m1?.current_step ?? 0);
  const m1Started   = m1Step > 0;
  const m1Pct       = Math.min(100, Math.round((m1Step / TOTAL_STEPS) * 100));

  // Per-module status across all four modules
  const modules = [
    { num: 1, total: 11, label: "Analyse",  slug: "modul-1", data: m1 },
    { num: 2, total:  8, label: "Interior", slug: "modul-2", data: room.module2_analysis?.[0] },
    { num: 3, total:  7, label: "Licht",    slug: "modul-3", data: room.module3_analysis?.[0] },
    { num: 4, total:  6, label: "Sinne",    slug: "modul-4", data: room.module4_analysis?.[0] },
  ] as const;
  const modulesDone = modules.filter((m) => m.data?.status === "completed").length;

  const roomLabel = ROOM_LABELS[room.room_type] ?? room.room_type;
  const href      = m1Completed
    ? `/dashboard/projekte/${projectId}/raum/${room.id}/modul-1?edit=true`
    : `/dashboard/projekte/${projectId}/raum/${room.id}/modul-1`;

  const hasBoth = !!(room.before_image_url && room.after_image_url);

  async function handlePhotoUpload(file: File, type: "before" | "after") {
    setPhotoError(null);
    setUploadingPhoto(type);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("projectId", projectId);
      fd.append("roomId", room.id);
      fd.append("type", type);
      const oldUrl = type === "before" ? room.before_image_url : room.after_image_url;
      if (oldUrl) fd.append("oldUrl", oldUrl);

      const res = await fetch("/api/upload/room-photo", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setPhotoError(body.error ?? "Upload fehlgeschlagen.");
        return;
      }

      const { url } = await res.json();
      const result = await updateRoomPhoto(room.id, type, url);
      if (!result.ok) {
        setPhotoError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setPhotoError("Upload fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setUploadingPhoto(null);
    }
  }

  async function handlePhotoDelete(type: "before" | "after") {
    const url = type === "before" ? room.before_image_url : room.after_image_url;
    if (!url) return;

    // Remove from DB first (optimistic)
    const result = await updateRoomPhoto(room.id, type, null);
    if (!result.ok) { setPhotoError(result.error); return; }

    // Background storage cleanup
    fetch("/api/upload/room-photo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => undefined);

    router.refresh();
  }

  function handleDelete() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteRoom(room.id);
      if (result.ok) {
        router.refresh();
      } else {
        setDeleteError(result.error);
        setConfirmDelete(false);
      }
    });
  }

  // ── Delete confirmation ──────────────────────────────────
  if (confirmDelete) {
    return (
      <div className="rounded-xl border-2 border-red-200 bg-white p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-gray-900 mb-0.5">Raum löschen?</p>
            <p className="font-sans text-xs text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-700">&ldquo;{room.name}&rdquo;</span> und alle
              Modul-1-Daten werden dauerhaft gelöscht.
            </p>
          </div>
        </div>
        {deleteError && (
          <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">
            {deleteError}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            disabled={isPending}
            className="flex-1 h-9 rounded-lg border border-gray-200 bg-white text-sm font-sans font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 h-9 rounded-lg bg-red-500 text-sm font-sans font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
            {isPending ? "Löschen …" : "Löschen"}
          </button>
        </div>
      </div>
    );
  }

  // ── Normal card ──────────────────────────────────────────
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors duration-150">

      {/* Share + KI + Delete buttons (top-right) */}
      <div className={cn(
        "absolute top-3 right-3 flex items-center gap-1 z-10 transition-opacity",
        "opacity-0 group-hover:opacity-100"
      )}>
        {m1Step >= 6 && (
          <Link
            href={`/dashboard/projekte/${projectId}/raum/${room.id}/visualisierung`}
            title="Raum visualisieren"
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
              (room.rendered_images?.length ?? 0) > 0
                ? "text-forest bg-forest/8 hover:bg-forest/15"
                : "text-gray-300 hover:text-forest hover:bg-forest/8"
            )}
          >
            <Wand2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        )}
        <Link
          href={`/dashboard/projekte/${projectId}/raum/${room.id}/analyse`}
          title="KI-Raumanalyse"
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
            room.ai_analysis
              ? "text-forest bg-forest/8 hover:bg-forest/15"
              : "text-gray-300 hover:text-forest hover:bg-forest/8"
          )}
        >
          <BrainCircuit className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>
        <button
          type="button"
          title="Konzept teilen"
          onClick={() => setShowShare(true)}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
            room.is_shared
              ? "text-forest bg-forest/8 hover:bg-forest/15"
              : "text-gray-300 hover:text-forest hover:bg-forest/8"
          )}
        >
          <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
        {canDelete && (
          <button
            type="button"
            title="Raum löschen"
            onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:text-red-400 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareModal
          roomId={room.id}
          initialIsShared={room.is_shared}
          initialToken={room.share_token}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Main content link */}
      <Link href={href} className="flex items-center gap-3 px-4 py-3.5 pr-10">
        {/* Circle progress */}
        <CircleProgress pct={m1Pct} size={34} stroke={2.5} labelSize="text-[8px]" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="min-w-0">
              <span className="text-sm font-sans font-semibold text-gray-900 truncate block leading-tight">
                {room.name}
              </span>
              <span className="text-xs text-gray-500 font-sans">{roomLabel}</span>
            </div>
            {m1Completed ? (
              <span className="flex items-center gap-1 text-[11px] font-sans font-medium text-forest shrink-0 ml-3">
                <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                Fertig
              </span>
            ) : m1Started ? (
              <span className="text-[11px] font-sans text-gray-400 shrink-0 ml-3">
                {m1Pct}% · Schritt {m1Step}/{TOTAL_STEPS}
              </span>
            ) : (
              <span className="text-[11px] font-sans text-gray-400 italic shrink-0 ml-3">
                Nicht gestartet
              </span>
            )}
          </div>

          <div className="h-0.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                m1Completed ? "bg-forest" : m1Pct >= 50 ? "bg-forest/70" : "bg-mint"
              )}
              style={{ width: `${m1Pct}%` }}
            />
          </div>
        </div>

        <ArrowRight
          className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0"
          strokeWidth={1.5}
        />
      </Link>

      {/* ── 4-module status strip ───────────────────────────── */}
      <div className="flex items-stretch border-t border-gray-100 divide-x divide-gray-100">
        {modules.map((m) => {
          const done      = m.data?.status === "completed";
          const stepN     = done ? m.total : (m.data?.current_step ?? 0);
          const started   = stepN > 0;
          const pct       = Math.min(100, Math.round((stepN / m.total) * 100));
          const dotColor  = done ? "bg-forest" : started ? "bg-amber-400" : "bg-gray-200";
          const textColor = done ? "text-forest" : started ? "text-amber-600" : "text-gray-400";
          return (
            <Link
              key={m.num}
              href={`/dashboard/projekte/${projectId}/raum/${room.id}/${m.slug}${done ? "?edit=true" : ""}`}
              title={`Modul ${m.num}: ${m.label} — ${done ? "abgeschlossen" : started ? `${pct}%` : "nicht gestartet"}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 hover:bg-gray-50 transition-colors"
            >
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
              <span className={cn("text-[11px] font-sans font-medium tabular-nums", textColor)}>
                0{m.num}
              </span>
              {done && <CheckCircle2 className="w-3 h-3 text-forest shrink-0" strokeWidth={2} />}
            </Link>
          );
        })}
      </div>

      {/* Capstone link (only if at least one module completed) */}
      {modulesDone > 0 && (
        <Link
          href={`/dashboard/projekte/${projectId}/raum/${room.id}/zusammenfassung`}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-t border-gray-100 transition-colors",
            modulesDone === 4 ? "bg-forest/[0.03] hover:bg-forest/[0.08]" : "hover:bg-gray-50",
          )}
        >
          <CheckCircle2
            className={cn("w-3 h-3 shrink-0", modulesDone === 4 ? "text-forest/70" : "text-gray-300")}
            strokeWidth={1.5}
          />
          <span className={cn(
            "text-[11px] font-sans font-medium",
            modulesDone === 4 ? "text-forest/70" : "text-gray-400",
          )}>
            {modulesDone === 4
              ? "Alle 4 Module abgeschlossen · Zusammenfassung öffnen"
              : `${modulesDone} von 4 Modulen fertig · Zwischenstand ansehen`}
          </span>
          <ArrowRight className="w-3 h-3 text-gray-300 ml-auto" strokeWidth={1.5} />
        </Link>
      )}

      {/* ── KI-Analyse strip ─────────────────────────────────── */}
      {room.ai_analysis ? (
        <Link
          href={`/dashboard/projekte/${projectId}/raum/${room.id}/analyse`}
          className="flex items-center gap-2 px-4 py-2 border-t border-gray-100 bg-forest/[0.02] hover:bg-forest/5 transition-colors"
        >
          <BrainCircuit className="w-3 h-3 text-forest/50 shrink-0" strokeWidth={1.5} />
          <span className="text-[11px] font-sans text-forest/60 font-medium">KI-Analyse vorhanden · ansehen</span>
          <ArrowRight className="w-3 h-3 text-forest/30 ml-auto" strokeWidth={1.5} />
        </Link>
      ) : (
        <Link
          href={`/dashboard/projekte/${projectId}/raum/${room.id}/analyse`}
          className="flex items-center gap-2 px-4 py-2 border-t border-gray-100 hover:bg-gray-50 transition-colors group/ki"
        >
          <Sparkles className="w-3 h-3 text-gray-300 group-hover/ki:text-forest/50 shrink-0 transition-colors" strokeWidth={1.5} />
          <span className="text-[11px] font-sans text-gray-400 group-hover/ki:text-forest/60 transition-colors">KI-Raumanalyse starten</span>
          <ArrowRight className="w-3 h-3 text-gray-300 group-hover/ki:text-forest/40 ml-auto transition-colors" strokeWidth={1.5} />
        </Link>
      )}

      {/* ── Visualisierung strip ─────────────────────────────── */}
      {m1Step >= 6 && (
        (room.rendered_images?.length ?? 0) > 0 ? (
          <Link
            href={`/dashboard/projekte/${projectId}/raum/${room.id}/visualisierung`}
            className="flex items-center gap-2 px-4 py-2 border-t border-gray-100 bg-forest/[0.02] hover:bg-forest/5 transition-colors"
          >
            <Wand2 className="w-3 h-3 text-forest/50 shrink-0" strokeWidth={1.5} />
            <span className="text-[11px] font-sans text-forest/60 font-medium">
              {room.rendered_images!.length} {room.rendered_images!.length === 1 ? "Visualisierung" : "Visualisierungen"} vorhanden · ansehen
            </span>
            <ArrowRight className="w-3 h-3 text-forest/30 ml-auto" strokeWidth={1.5} />
          </Link>
        ) : (
          <Link
            href={`/dashboard/projekte/${projectId}/raum/${room.id}/visualisierung`}
            className="flex items-center gap-2 px-4 py-2 border-t border-gray-100 hover:bg-gray-50 transition-colors group/vis"
          >
            <Wand2 className="w-3 h-3 text-gray-300 group-hover/vis:text-forest/50 shrink-0 transition-colors" strokeWidth={1.5} />
            <span className="text-[11px] font-sans text-gray-400 group-hover/vis:text-forest/60 transition-colors">Raum visualisieren</span>
            <ArrowRight className="w-3 h-3 text-gray-300 group-hover/vis:text-forest/40 ml-auto transition-colors" strokeWidth={1.5} />
          </Link>
        )
      )}

      {/* ── Photo strip ─────────────────────────────────────── */}
      <div className="border-t border-gray-100 px-4 py-2.5">
        {/* Error */}
        {photoError && (
          <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-100">
            <p className="text-[11px] text-red-600 font-sans flex-1">{photoError}</p>
            <button type="button" onClick={() => setPhotoError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-3 h-3" strokeWidth={2} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Before photo slot */}
          <PhotoSlot
            label="Vorher"
            url={room.before_image_url}
            uploading={uploadingPhoto === "before"}
            onUpload={(file) => handlePhotoUpload(file, "before")}
            onDelete={() => handlePhotoDelete("before")}
            inputRef={beforeInputRef}
          />

          {/* After photo slot */}
          <PhotoSlot
            label="Nachher"
            url={room.after_image_url}
            uploading={uploadingPhoto === "after"}
            disabled={!m1Completed}
            disabledHint="Erst Modul 1 abschließen"
            onUpload={(file) => handlePhotoUpload(file, "after")}
            onDelete={() => handlePhotoDelete("after")}
            inputRef={afterInputRef}
          />

          {/* Vergleich link */}
          {hasBoth && (
            <Link
              href={`/dashboard/projekte/${projectId}/raum/${room.id}/vergleich`}
              className="ml-auto flex items-center gap-1.5 text-[11px] font-sans font-medium text-forest/60 hover:text-forest transition-colors shrink-0"
            >
              <SplitSquareHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
              Vergleich
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}

// ── PhotoSlot ────────────────────────────────────────────────────────────────

interface PhotoSlotProps {
  label: string;
  url: string | null;
  uploading: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onUpload: (file: File) => void;
  onDelete: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

function PhotoSlot({
  label, url, uploading, disabled, disabledHint, onUpload, onDelete, inputRef,
}: PhotoSlotProps) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  }

  const slot = (
    <div
      className={cn(
        "relative w-20 h-14 rounded-lg overflow-hidden border transition-all duration-150",
        url
          ? "border-gray-200 bg-gray-100"
          : disabled
          ? "border-dashed border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
          : "border-dashed border-gray-300 bg-gray-50 hover:border-forest/40 hover:bg-forest/[0.03] cursor-pointer"
      )}
      onClick={() => !url && !disabled && !uploading && inputRef.current?.click()}
      title={disabled ? disabledHint : undefined}
    >
      {uploading ? (
        // Spinner
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <span className="w-4 h-4 rounded-full border-2 border-forest/30 border-t-forest animate-spin" />
        </div>
      ) : url ? (
        // Thumbnail
        <div className="relative w-full h-full group/photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="w-full h-full object-cover" />
          {/* Replace/delete on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <button
              type="button"
              title="Ersetzen"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/40 flex items-center justify-center"
            >
              <ImagePlus className="w-3 h-3 text-white" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              title="Entfernen"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-6 h-6 rounded-md bg-white/20 hover:bg-red-500/80 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        // Empty state
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <ImagePlus className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1">
      {slot}
      <span className={cn(
        "text-[10px] font-sans",
        disabled ? "text-gray-300" : "text-gray-400"
      )}>
        {label}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
