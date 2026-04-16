import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { InspirationFeed } from "./_components/InspirationFeed";
import type { InspirationImage } from "./_components/InspirationFeed";

export const dynamic  = "force-dynamic";
export const metadata: Metadata = { title: "Inspiration – Wellbeing Workbook" };

const PAGE_SIZE = 12;

export default async function InspirationPage() {
  const supabase = createClient();

  const { data: initial } = await supabase
    .from("inspiration_images")
    .select("id, image_url, title, description, room_effect, room_type, colors, tags, source_url, created_at")
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-20">

      {/* ── Page header ──────────────────────────────────────── */}
      <section className="pb-8 sm:pb-10 border-b border-sand/30 mb-8 sm:mb-10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-forest/8 border border-forest/12 flex items-center justify-center shrink-0 mt-1">
            <Sparkles className="w-5 h-5 text-forest/60" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-sand mb-2">
              Kuratiert für dich
            </p>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl text-forest leading-none mb-3">
              Inspiration
            </h1>
            <p className="text-gray/60 font-sans text-sm sm:text-base leading-relaxed max-w-lg">
              Lass dich von echten Räumen inspirieren – gefiltert nach Wirkung, Raumtyp und Farbwelt.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feed ─────────────────────────────────────────────── */}
      <InspirationFeed initialItems={(initial ?? []) as InspirationImage[]} pageSize={PAGE_SIZE} />
    </div>
  );
}
