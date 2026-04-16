"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createBooking } from "@/app/actions/coaching";
import {
  CalendarDays, Clock, ChevronRight,
  Home, Sofa, Moon, Monitor, Star, Droplets,
  ChefHat, UtensilsCrossed, DoorOpen, Package,
  Briefcase, Leaf, Sparkles, Camera,
  MessageSquare, AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────────────

const TIME_SLOTS = ["10:00", "11:00", "14:00", "15:00", "16:00"] as const;

const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;
const MONTH_SHORT   = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
                        "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"] as const;

const ROOM_ICONS: Record<string, LucideIcon> = {
  wohnzimmer: Sofa, schlafzimmer: Moon,
  arbeitszimmer: Monitor, kinderzimmer: Star,
  badezimmer: Droplets, kueche: ChefHat,
  esszimmer: UtensilsCrossed, flur: DoorOpen,
  keller: Package, buero: Briefcase,
  yogaraum: Leaf, wellness: Sparkles,
  studio: Camera, sonstiges: Home,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RoomOption {
  id:        string;
  name:      string;
  room_type: string;
  projectName: string;
}

interface Props {
  rooms:         RoomOption[];
  preselectedRoomId: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDays(): { date: Date; iso: string; isWeekend: boolean }[] {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay(); // 0=Sun 6=Sat
    days.push({
      date: d,
      iso:  d.toISOString().slice(0, 10),
      isWeekend: dow === 0 || dow === 6,
    });
  }
  return days;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BookingForm({ rooms, preselectedRoomId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [selectedRoom, setSelectedRoom] = useState<string>(preselectedRoomId ?? "");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes,        setNotes]        = useState("");
  const [error,        setError]        = useState<string | null>(null);

  const days = buildDays();

  function handleSubmit() {
    if (!selectedDate) { setError("Bitte wähle ein Datum."); return; }
    if (!selectedTime) { setError("Bitte wähle eine Uhrzeit."); return; }
    setError(null);

    startTransition(async () => {
      const result = await createBooking({
        roomId:      selectedRoom || null,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        notes,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/coaching/bestaetigung/${result.bookingId}`);
    });
  }

  const selectedRoomObj = rooms.find((r) => r.id === selectedRoom);
  const RoomIcon = selectedRoomObj ? (ROOM_ICONS[selectedRoomObj.room_type] ?? Home) : null;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Room selector ────────────────────────────────── */}
      {rooms.length > 0 && (
        <section>
          <label className="block text-[10px] font-sans uppercase tracking-[0.2em] text-sand mb-3">
            Welchen Raum möchtest du besprechen?
          </label>
          <div className="flex flex-col gap-2">
            {rooms.map((room) => {
              const Icon = ROOM_ICONS[room.room_type] ?? Home;
              const active = selectedRoom === room.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoom(active ? "" : room.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                    active
                      ? "border-forest bg-forest/5 ring-1 ring-forest/15"
                      : "border-gray-200 bg-white hover:border-forest/30 hover:bg-forest/3"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    active ? "bg-forest/10" : "bg-gray-100"
                  )}>
                    <Icon className={cn("w-4 h-4", active ? "text-forest" : "text-gray-400")} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-sans font-medium leading-tight truncate", active ? "text-forest" : "text-gray-800")}>
                      {room.name}
                    </p>
                    <p className="text-xs text-gray-400 font-sans">{room.projectName}</p>
                  </div>
                  {active && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-forest flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 4l3 3 5-6" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Date picker ──────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-3.5 h-3.5 text-sand" strokeWidth={1.5} />
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-sand">
            Datum wählen
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map(({ date, iso, isWeekend }) => {
            const isSelected = selectedDate === iso;
            const dow   = WEEKDAY_SHORT[date.getDay()];
            const day   = date.getDate();
            const month = MONTH_SHORT[date.getMonth()];

            return (
              <button
                key={iso}
                type="button"
                disabled={isWeekend}
                onClick={() => setSelectedDate(iso)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl py-2.5 px-1 border transition-all text-center",
                  isSelected
                    ? "bg-forest text-white border-forest shadow-sm"
                    : isWeekend
                    ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                    : "bg-white border-gray-200 text-gray-700 hover:border-forest/40 hover:bg-forest/3"
                )}
              >
                <span className={cn(
                  "text-[9px] font-sans uppercase tracking-wide leading-tight",
                  isSelected ? "text-white/70" : "text-gray-400"
                )}>
                  {dow}
                </span>
                <span className={cn(
                  "text-sm font-sans font-semibold leading-tight mt-0.5",
                  isSelected ? "text-white" : "text-gray-800"
                )}>
                  {day}
                </span>
                <span className={cn(
                  "text-[9px] font-sans leading-tight",
                  isSelected ? "text-white/70" : "text-gray-400"
                )}>
                  {month}
                </span>
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <p className="text-xs text-forest font-sans mt-2">
            Gewählt: {new Date(selectedDate + "T00:00").toLocaleDateString("de-DE", {
              weekday: "long", day: "numeric", month: "long",
            })}
          </p>
        )}
      </section>

      {/* ── Time slots ───────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-sand" strokeWidth={1.5} />
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-sand">
            Uhrzeit wählen
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedTime(slot)}
              className={cn(
                "px-5 py-2.5 rounded-full border text-sm font-sans font-medium transition-all",
                selectedTime === slot
                  ? "bg-forest text-white border-forest shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-forest/40 hover:bg-forest/3"
              )}
            >
              {slot} Uhr
            </button>
          ))}
        </div>
      </section>

      {/* ── Notes ────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-sand" strokeWidth={1.5} />
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-sand">
            Was möchtest du besprechen?
          </span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Z. B. Ich möchte mein Wohnzimmer umgestalten und brauche Hilfe bei der Farbwahl und Möbelanordnung..."
          rows={4}
          maxLength={1000}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-sans text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-forest/40 focus:ring-2 focus:ring-forest/10 resize-none transition-colors"
        />
        <p className="text-[10px] text-gray-400 font-sans mt-1 text-right">
          {notes.length}/1000
        </p>
      </section>

      {/* ── Summary strip ────────────────────────────────── */}
      {(selectedDate || selectedTime || selectedRoomObj) && (
        <div className="rounded-xl border border-forest/15 bg-forest/4 px-4 py-3 flex flex-wrap gap-3 text-xs font-sans text-forest/70">
          {selectedRoomObj && RoomIcon && (
            <span className="flex items-center gap-1">
              <RoomIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {selectedRoomObj.name}
            </span>
          )}
          {selectedDate && (
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} />
              {new Date(selectedDate + "T00:00").toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
            </span>
          )}
          {selectedTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              {selectedTime} Uhr · 30 Min
            </span>
          )}
        </div>
      )}

      {/* ── Error ────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-terracotta/20 bg-terracotta/5 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-terracotta shrink-0" strokeWidth={1.5} />
          <p className="text-sm font-sans text-terracotta">{error}</p>
        </div>
      )}

      {/* ── Submit ───────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-xl px-5 py-4",
          "text-sm font-sans font-semibold transition-all",
          pending
            ? "bg-forest/40 text-white cursor-not-allowed"
            : "bg-forest text-white hover:bg-forest/90 shadow-sm hover:shadow-md"
        )}
      >
        {pending ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
            Anfrage wird gesendet …
          </>
        ) : (
          <>
            Anfrage senden
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </>
        )}
      </button>

    </div>
  );
}
