import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="font-headline text-4xl text-forest mb-2">
        Hallo{user?.email ? `, ${user.email.split("@")[0]}` : ""}
      </h1>
      <p className="text-gray mb-10">
        Willkommen in deinem persönlichen Wellbeing Workbook.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Tagesreflexion",
            desc: "Reflektiere deinen Tag mit gezielten Fragen.",
            color: "bg-mint/20 border-mint",
          },
          {
            title: "Ziele & Werte",
            desc: "Kläre, was dir wirklich wichtig ist.",
            color: "bg-sand/20 border-sand",
          },
          {
            title: "Achtsamkeit",
            desc: "Kleine Übungen für den Alltag.",
            color: "bg-terracotta/10 border-terracotta/30",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border p-6 ${card.color} transition-transform hover:-translate-y-0.5 cursor-pointer`}
          >
            <h3 className="font-headline text-xl text-forest mb-2">
              {card.title}
            </h3>
            <p className="text-sm text-gray">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
