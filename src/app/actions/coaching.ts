"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CreateBookingResult =
  | { ok: true;  bookingId: string }
  | { ok: false; error: string };

export type CancelBookingResult =
  | { ok: true }
  | { ok: false; error: string };

export type UpdateStatusResult =
  | { ok: true }
  | { ok: false; error: string };

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface CoachingBooking {
  id:           string;
  user_id:      string;
  room_id:      string | null;
  booking_date: string;
  booking_time: string;
  duration:     number;
  status:       BookingStatus;
  notes:        string | null;
  admin_notes:  string | null;
  created_at:   string;
  updated_at:   string;
}

// ── createBooking ─────────────────────────────────────────────────────────────

export async function createBooking(data: {
  roomId:      string | null;
  bookingDate: string;  // YYYY-MM-DD
  bookingTime: string;  // HH:MM
  notes:       string;
}): Promise<CreateBookingResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!data.bookingDate || !data.bookingTime) {
    return { ok: false, error: "Bitte Datum und Uhrzeit auswählen." };
  }

  // Verify room belongs to user (if provided)
  if (data.roomId) {
    const { data: room } = await supabase
      .from("rooms")
      .select("id, project_id, projects!inner(user_id)")
      .eq("id", data.roomId)
      .single();

    const projects = room?.projects as unknown as { user_id: string } | null;
    if (!room || projects?.user_id !== user.id) {
      return { ok: false, error: "Ungültige Raum-Auswahl." };
    }
  }

  const { data: booking, error } = await supabase
    .from("coaching_bookings")
    .insert({
      user_id:      user.id,
      room_id:      data.roomId ?? null,
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      duration:     30,
      status:       "pending",
      notes:        data.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !booking) {
    return { ok: false, error: "Buchung konnte nicht gespeichert werden." };
  }

  // TODO: Send confirmation email to user
  // TODO: Send notification email to admin/Lisa

  revalidatePath("/dashboard/coaching");
  return { ok: true, bookingId: booking.id };
}

// ── cancelBooking ─────────────────────────────────────────────────────────────

export async function cancelBooking(bookingId: string): Promise<CancelBookingResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch booking (RLS ensures ownership)
  const { data: booking } = await supabase
    .from("coaching_bookings")
    .select("id, booking_date, booking_time, status")
    .eq("id", bookingId)
    .single();

  if (!booking) return { ok: false, error: "Buchung nicht gefunden." };
  if (booking.status === "cancelled") return { ok: false, error: "Bereits storniert." };
  if (booking.status === "completed") return { ok: false, error: "Abgeschlossene Buchungen können nicht storniert werden." };

  // 24h rule
  const [h, m]    = booking.booking_time.split(":").map(Number);
  const dt        = new Date(booking.booking_date);
  dt.setHours(h, m, 0, 0);
  const deadline  = new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (dt <= deadline) {
    return { ok: false, error: "Stornierung nur bis 24 Stunden vor dem Termin möglich." };
  }

  const { error } = await supabase
    .from("coaching_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) return { ok: false, error: "Stornierung fehlgeschlagen." };

  revalidatePath("/dashboard/coaching");
  return { ok: true };
}

// ── updateBookingStatus (admin) ───────────────────────────────────────────────

export async function updateBookingStatus(
  bookingId:  string,
  status:     BookingStatus,
  adminNotes?: string,
): Promise<UpdateStatusResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Keine Berechtigung." };
  }

  const patch: Record<string, unknown> = { status };
  if (adminNotes !== undefined) patch.admin_notes = adminNotes.trim() || null;

  const { error } = await supabase
    .from("coaching_bookings")
    .update(patch)
    .eq("id", bookingId);

  if (error) return { ok: false, error: "Statusänderung fehlgeschlagen." };

  revalidatePath("/admin/coaching");
  revalidatePath("/dashboard/coaching");
  return { ok: true };
}
