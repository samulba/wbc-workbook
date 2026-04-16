import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PhoneCall, Shield, Star } from "lucide-react";
import { BookingForm } from "./_components/BookingForm";
import type { RoomOption } from "./_components/BookingForm";

export const metadata: Metadata = { title: "Coaching-Call buchen – Wellbeing Workbook" };

export default async function CoachingBuchenPage({
  searchParams,
}: {
  searchParams: { room?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load all user rooms across all projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select(`
      id, name,
      rooms ( id, name, room_type )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  type ProjectRow = {
    id: string;
    name: string;
    rooms: { id: string; name: string; room_type: string }[] | null;
  };

  const rooms: RoomOption[] = (projectsData as ProjectRow[] ?? []).flatMap((p) =>
    (p.rooms ?? []).map((r) => ({
      id:          r.id,
      name:        r.name,
      room_type:   r.room_type,
      projectName: p.name,
    }))
  );

  const preselectedRoomId = searchParams.room ?? null;
  // Validate: must be one of the user's rooms
  const validPreselect = rooms.find((r) => r.id === preselectedRoomId) ? preselectedRoomId : null;

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Hero header ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-forest to-forest/85 text-white">
        <div className="mx-auto max-w-2xl px-5 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Dashboard
          </Link>
          <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-mint/70 mb-2">
            Persönliche Beratung
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl text-white mb-2 leading-tight">
            Experten-Coaching buchen
          </h1>
          <p className="text-sm font-sans text-white/65 leading-relaxed max-w-md">
            Besprich dein Raumkonzept persönlich mit unserer Interior-Expertin Lisa – 30 Minuten, ganz individuell.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              { Icon: PhoneCall, label: "30 Min Video-Call" },
              { Icon: Star,      label: "Individuelle Beratung" },
              { Icon: Shield,    label: "Kostenlos anfragen" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1">
                <Icon className="w-3 h-3 text-mint" strokeWidth={1.5} />
                <span className="text-xs font-sans text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-5 py-8 pb-20">
        <BookingForm
          rooms={rooms}
          preselectedRoomId={validPreselect}
        />
      </div>
    </div>
  );
}
