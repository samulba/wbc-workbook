import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarDays, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminBookingRow } from "./_components/AdminBookingRow";
import type { BookingStatus } from "@/app/actions/coaching";

export const metadata: Metadata = { title: "Coaching-Buchungen – Admin" };

const STATUS_COUNTS_ORDER: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];
const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   "Angefragt",
  confirmed: "Bestätigt",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

export default async function AdminCoachingPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const statusFilter = searchParams.status as BookingStatus | undefined;

  // Fetch bookings with user profile + room + project
  let query = supabase
    .from("coaching_bookings")
    .select(`
      id, booking_date, booking_time, duration, status, notes, admin_notes, created_at,
      profiles ( full_name ),
      rooms (
        name, room_type,
        projects ( name )
      )
    `)
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true });

  if (statusFilter && STATUS_COUNTS_ORDER.includes(statusFilter)) {
    query = query.eq("status", statusFilter);
  }

  const { data: bookings } = await query;

  type BookingRow = {
    id:           string;
    booking_date: string;
    booking_time: string;
    duration:     number;
    status:       BookingStatus;
    notes:        string | null;
    admin_notes:  string | null;
    created_at:   string;
    profiles:     { full_name: string | null }[] | null;
    rooms: {
      name: string;
      room_type: string;
      projects: { name: string }[] | null;
    }[] | null;
  };

  const rows = (bookings as unknown as BookingRow[]) ?? [];

  // Count by status (all bookings for the counters)
  const { data: allBookings } = await supabase
    .from("coaching_bookings")
    .select("status");

  const counts = STATUS_COUNTS_ORDER.reduce<Record<BookingStatus, number>>((acc, s) => {
    acc[s] = (allBookings ?? []).filter((b) => b.status === s).length;
    return acc;
  }, {} as Record<BookingStatus, number>);

  const formatted = rows.map((b) => ({
    id:           b.id,
    booking_date: b.booking_date,
    booking_time: b.booking_time,
    duration:     b.duration,
    status:       b.status,
    notes:        b.notes,
    admin_notes:  b.admin_notes,
    userName:     b.profiles?.[0]?.full_name ?? "Unbekannt",
    roomName:     b.rooms?.[0]?.name ?? null,
    projectName:  b.rooms?.[0]?.projects?.[0]?.name ?? null,
  }));

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-forest/10 border border-forest/20 dark:bg-mint/15 dark:border-mint/20 flex items-center justify-center">
          <PhoneCall className="w-4 h-4 text-forest dark:text-mint" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Coaching-Buchungen</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {(allBookings ?? []).length} Buchungen gesamt
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        <a
          href="/admin/coaching"
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
            !statusFilter
              ? "bg-forest/8 text-forest border-forest/20 dark:bg-white/12 dark:text-white dark:border-white/15"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5"
          )}
        >
          Alle ({(allBookings ?? []).length})
        </a>
        {STATUS_COUNTS_ORDER.map((s) => (
          <a
            key={s}
            href={`/admin/coaching?status=${s}`}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
              statusFilter === s
                ? "bg-forest/8 text-forest border-forest/20 dark:bg-white/12 dark:text-white dark:border-white/15"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5"
            )}
          >
            {STATUS_LABELS[s]} ({counts[s]})
          </a>
        ))}
      </div>

      {/* Booking list */}
      {formatted.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/50 p-10 text-center">
          <CalendarDays className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-500 dark:text-slate-400 text-sm">Keine Buchungen gefunden.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/50 overflow-hidden">
          {formatted.map((booking) => (
            <AdminBookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
