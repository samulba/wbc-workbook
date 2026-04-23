"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, CheckCircle2, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateBookingStatus } from "@/app/actions/coaching";
import type { BookingStatus } from "@/app/actions/coaching";

interface Props {
  booking: {
    id:           string;
    booking_date: string;
    booking_time: string;
    duration:     number;
    status:       BookingStatus;
    notes:        string | null;
    admin_notes:  string | null;
    userName:     string;
    roomName:     string | null;
    projectName:  string | null;
  };
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   "Angefragt",
  confirmed: "Bestätigt",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

const STATUS_BADGE: Record<BookingStatus, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-gray-100 text-gray-500 border-gray-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const MONTH_SHORT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
                     "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"] as const;
const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;

export function AdminBookingRow({ booking }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [expanded,   setExpanded]  = useState(false);
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes ?? "");
  const [error,      setError]     = useState<string | null>(null);

  const d    = new Date(booking.booking_date + "T00:00");
  const date = `${WEEKDAY_SHORT[d.getDay()]}, ${d.getDate()}. ${MONTH_SHORT[d.getMonth()]}`;

  function changeStatus(status: BookingStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, status, adminNotes);
      if (!result.ok) { setError(result.error); return; }
      router.refresh();
    });
  }

  function saveNotes() {
    setError(null);
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, booking.status, adminNotes);
      if (!result.ok) { setError(result.error); return; }
      router.refresh();
    });
  }

  return (
    <div className="border-b border-gray-200 dark:border-slate-700/50 last:border-0">
      {/* Main row */}
      <div className="px-5 py-4 flex items-start gap-4">
        {/* Date */}
        <div className="w-14 shrink-0 rounded-xl bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/10 flex flex-col items-center py-2">
          <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase">{WEEKDAY_SHORT[d.getDay()]}</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{d.getDate()}</span>
          <span className="text-[9px] text-gray-400 dark:text-slate-500">{MONTH_SHORT[d.getMonth()]}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn(
              "inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border",
              STATUS_BADGE[booking.status]
            )}>
              {STATUS_LABELS[booking.status]}
            </span>
            <span className="text-xs text-gray-800 dark:text-slate-300 font-medium">{booking.userName}</span>
            {booking.roomName && (
              <span className="text-xs text-gray-500 dark:text-slate-500">· {booking.roomName}</span>
            )}
            {booking.projectName && (
              <span className="text-xs text-gray-400 dark:text-slate-600">({booking.projectName})</span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-slate-300">
            {date} · {booking.booking_time} Uhr · {booking.duration} Min
          </p>
          {booking.notes && (
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1 line-clamp-1">
              {booking.notes}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {booking.status === "pending" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => changeStatus("confirmed")}
              className="flex items-center gap-1 text-[11px] font-medium text-white bg-green-600 hover:bg-green-700 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-3 h-3" strokeWidth={2} />
              Bestätigen
            </button>
          )}
          {booking.status === "confirmed" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => changeStatus("completed")}
              className="flex items-center gap-1 text-[11px] font-medium text-white bg-forest hover:bg-forest/90 dark:bg-slate-600 dark:hover:bg-slate-500 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
              Abschließen
            </button>
          )}
          {(booking.status === "pending" || booking.status === "confirmed") && (
            <button
              type="button"
              disabled={pending}
              onClick={() => changeStatus("cancelled")}
              className="flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 dark:text-slate-300 dark:hover:text-red-400 dark:border-slate-600 dark:hover:border-red-400/40 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-3 h-3" strokeWidth={2} />
              Absagen
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-300 hover:bg-gray-100 text-gray-500 dark:border-slate-600 dark:hover:bg-white/5 dark:text-slate-400 transition-colors"
          >
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.5} />
              : <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
            }
          </button>
        </div>
      </div>

      {/* Expanded: full notes + admin notes */}
      {expanded && (
        <div className="px-5 pb-4 flex flex-col gap-3">
          {booking.notes && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/8 px-3 py-2.5">
              <p className="text-[10px] font-sans font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-1">
                User-Nachricht
              </p>
              <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {/* Admin notes */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3 h-3 text-gray-500 dark:text-slate-500" strokeWidth={1.5} />
              <p className="text-[10px] font-sans font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                Nachricht an User (sichtbar)
              </p>
            </div>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              placeholder="Z. B. Ich freue mich auf unser Gespräch! Hier ist der Meeting-Link: …"
              className="w-full rounded-lg bg-gray-50 border border-gray-300 text-xs text-gray-800 placeholder:text-gray-400 dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:placeholder:text-slate-600 px-3 py-2 resize-none focus:outline-none focus:border-forest/40 dark:focus:border-mint/30 transition-colors"
            />
            <button
              type="button"
              disabled={pending}
              onClick={saveNotes}
              className="mt-1.5 text-[11px] font-medium text-forest hover:text-forest/80 dark:text-mint dark:hover:text-mint/80 transition-colors disabled:opacity-50"
            >
              {pending ? "Speichern…" : "Notiz speichern"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
