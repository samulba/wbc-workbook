import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CancelBookingButton } from "./_components/CancelBookingButton";

export const metadata: Metadata = { title: "Meine Coaching-Calls – Wellbeing Workbook" };

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:   { label: "Angefragt",     dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200"   },
  confirmed: { label: "Bestätigt",     dot: "bg-forest",     badge: "bg-forest/8 text-forest border-forest/20"      },
  completed: { label: "Abgeschlossen", dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-600 border-gray-200"     },
  cancelled: { label: "Storniert",     dot: "bg-terracotta", badge: "bg-terracotta/8 text-terracotta border-terracotta/20" },
} as const;

const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;
const MONTH_SHORT   = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
                        "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"] as const;

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00");
  return `${WEEKDAY_SHORT[d.getDay()]}, ${d.getDate()}. ${MONTH_SHORT[d.getMonth()]}`;
}

function canCancel(bookingDate: string, bookingTime: string, status: string) {
  if (status === "completed" || status === "cancelled") return false;
  const [h, m] = bookingTime.split(":").map(Number);
  const dt = new Date(bookingDate + "T00:00");
  dt.setHours(h, m, 0, 0);
  return dt > new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export default async function DashboardCoachingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("coaching_bookings")
    .select(`
      id, booking_date, booking_time, duration, status, notes, admin_notes, created_at,
      rooms ( name, room_type )
    `)
    .eq("user_id", user.id)
    .order("booking_date", { ascending: false })
    .order("booking_time", { ascending: false });

  type BookingRow = {
    id:           string;
    booking_date: string;
    booking_time: string;
    duration:     number;
    status:       keyof typeof STATUS_CONFIG;
    notes:        string | null;
    admin_notes:  string | null;
    created_at:   string;
    rooms:        { name: string; room_type: string }[] | null;
  };

  const rows = (bookings as unknown as BookingRow[]) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-sans mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-sand mb-1">
            Persönliche Beratung
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl text-forest">Meine Coaching-Calls</h1>
        </div>
        <Link
          href="/coaching/buchen"
          className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-forest text-white text-xs font-sans font-medium px-3.5 py-2 hover:bg-forest/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Neuen Termin buchen
        </Link>
      </div>

      {/* Empty state */}
      {rows.length === 0 && (
        <div className="rounded-2xl border border-sand/30 bg-white p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-sand/15 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-7 h-7 text-sand" strokeWidth={1.5} />
          </div>
          <h2 className="font-headline text-xl text-forest mb-2">Noch keine Buchungen</h2>
          <p className="text-sm font-sans text-gray-500 mb-6 leading-relaxed max-w-sm mx-auto">
            Buch deinen ersten Coaching-Call und besprich dein Raumkonzept persönlich mit unserer Interior-Expertin.
          </p>
          <Link
            href="/coaching/buchen"
            className="inline-flex items-center gap-2 rounded-xl bg-forest text-white text-sm font-sans font-medium px-5 py-2.5 hover:bg-forest/90 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Coaching-Call buchen
          </Link>
        </div>
      )}

      {/* Booking list */}
      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          {rows.map((booking) => {
            const cfg        = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
            const cancellable = canCancel(booking.booking_date, booking.booking_time, booking.status);

            return (
              <div
                key={booking.id}
                className={cn(
                  "rounded-2xl border bg-white overflow-hidden",
                  booking.status === "cancelled" ? "opacity-65 border-gray-200" : "border-sand/30"
                )}
              >
                {/* Main row */}
                <div className="px-5 py-4 flex items-start gap-4">
                  {/* Date block */}
                  <div className={cn(
                    "w-12 shrink-0 rounded-xl flex flex-col items-center py-2 border",
                    booking.status === "confirmed" ? "bg-forest/5 border-forest/15" : "bg-gray-50 border-gray-100"
                  )}>
                    <span className="text-[9px] font-sans uppercase text-gray-400 leading-none">
                      {WEEKDAY_SHORT[new Date(booking.booking_date + "T00:00").getDay()]}
                    </span>
                    <span className="font-headline text-xl text-gray-800 leading-tight">
                      {new Date(booking.booking_date + "T00:00").getDate()}
                    </span>
                    <span className="text-[9px] font-sans text-gray-400 leading-none">
                      {MONTH_SHORT[new Date(booking.booking_date + "T00:00").getMonth()]}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded-full border",
                        cfg.badge
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                        {cfg.label}
                      </span>
                      {booking.rooms?.[0] && (
                        <span className="text-[11px] font-sans text-gray-400 truncate">
                          {booking.rooms[0].name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm font-sans text-gray-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
                        {booking.booking_time} Uhr
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500">{booking.duration} Min</span>
                    </div>

                    {booking.notes && (
                      <p className="text-xs font-sans text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {booking.notes}
                      </p>
                    )}

                    {booking.admin_notes && (
                      <div className="mt-2 rounded-lg bg-forest/4 border border-forest/10 px-2.5 py-1.5">
                        <p className="text-[10px] font-sans font-medium text-forest/60 uppercase tracking-wider mb-0.5">
                          Nachricht von Lisa
                        </p>
                        <p className="text-xs font-sans text-forest/70 leading-relaxed">
                          {booking.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Cancel */}
                  {cancellable && (
                    <CancelBookingButton bookingId={booking.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
