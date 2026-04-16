import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Clock, CheckCircle2, ArrowRight, MessageSquare } from "lucide-react";

export const metadata: Metadata = { title: "Buchung bestätigt – Wellbeing Workbook" };

const WEEKDAY_DE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"] as const;
const MONTH_DE   = ["Januar", "Februar", "März", "April", "Mai", "Juni",
                     "Juli", "August", "September", "Oktober", "November", "Dezember"] as const;

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00");
  return `${WEEKDAY_DE[d.getDay()]}, ${d.getDate()}. ${MONTH_DE[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function ConfirmationPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: booking } = await supabase
    .from("coaching_bookings")
    .select(`
      id, booking_date, booking_time, duration, status, notes,
      rooms ( name, room_type )
    `)
    .eq("id", params.bookingId)
    .eq("user_id", user.id)
    .single();

  if (!booking) notFound();

  type Room = { name: string; room_type: string };
  const room = (booking.rooms as unknown as Room[] | null)?.[0] ?? null;

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="border-b border-sand/30 bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-5 h-14 flex items-center">
          <span className="font-headline text-base text-forest tracking-wide">
            Wellbeing Workbook
          </span>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex-1 mx-auto max-w-2xl px-5 py-12 w-full">

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-forest/8 border-2 border-forest/15 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-forest" strokeWidth={1.5} />
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-sand mb-2">
            Anfrage gesendet
          </p>
          <h1 className="font-headline text-3xl text-forest mb-2">
            Wir melden uns bei dir!
          </h1>
          <p className="text-sm font-sans text-gray-500 leading-relaxed max-w-md mx-auto">
            Deine Coaching-Anfrage ist eingegangen. Lisa wird sich innerhalb von 24 Stunden per E-Mail bei dir melden, um den Termin zu bestätigen.
          </p>
        </div>

        {/* Booking details card */}
        <div className="rounded-2xl border border-sand/30 bg-white overflow-hidden mb-6">
          <div className="bg-forest/4 border-b border-sand/20 px-5 py-3">
            <span className="font-headline text-sm text-forest">Deine Buchungsdetails</span>
          </div>

          <div className="divide-y divide-sand/15">
            <div className="px-5 py-4 flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-sand shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-sans uppercase tracking-wider text-gray-400 mb-0.5">Datum</p>
                <p className="text-sm font-sans font-medium text-gray-800">
                  {formatDate(booking.booking_date)}
                </p>
              </div>
            </div>

            <div className="px-5 py-4 flex items-center gap-3">
              <Clock className="w-4 h-4 text-sand shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-sans uppercase tracking-wider text-gray-400 mb-0.5">Uhrzeit</p>
                <p className="text-sm font-sans font-medium text-gray-800">
                  {booking.booking_time} Uhr · {booking.duration} Minuten
                </p>
              </div>
            </div>

            {room && (
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-forest/40" />
                </div>
                <div>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-gray-400 mb-0.5">Raum</p>
                  <p className="text-sm font-sans font-medium text-gray-800">{room.name}</p>
                </div>
              </div>
            )}

            {booking.notes && (
              <div className="px-5 py-4 flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-sand shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-gray-400 mb-0.5">Deine Nachricht</p>
                  <p className="text-sm font-sans text-gray-600 leading-relaxed">{booking.notes}</p>
                </div>
              </div>
            )}

            <div className="px-5 py-4 flex items-center gap-3">
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-sans uppercase tracking-wider text-gray-400 mb-0.5">Status</p>
                <p className="text-sm font-sans font-medium text-amber-700">Angefragt – wird in Kürze bestätigt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="rounded-xl border border-sand/30 bg-sand/8 px-4 py-3.5 mb-8">
          <p className="text-xs font-sans font-semibold text-forest/80 mb-1">Was passiert als nächstes?</p>
          <ul className="text-xs font-sans text-gray-500 space-y-1 leading-relaxed">
            <li>· Lisa prüft deine Anfrage und bestätigt den Termin per E-Mail</li>
            <li>· Du erhältst einen Video-Call-Link vor dem Termin</li>
            <li>· 30 Minuten individuelle Interior-Beratung</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/coaching"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest text-white text-sm font-sans font-semibold px-5 py-3.5 hover:bg-forest/90 transition-colors"
          >
            Meine Buchungen ansehen
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-sans font-medium px-5 py-3.5 hover:border-gray-300 transition-colors"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
