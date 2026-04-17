import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShoppingBag, Plus, ArrowRight } from "lucide-react";
import { NewListButton } from "./_components/NewListButton";

export const metadata: Metadata = { title: "Shopping-Listen" };
export const dynamic = "force-dynamic";

interface ListRow {
  id:           string;
  name:         string;
  budget_total: number | null;
  created_at:   string;
  project:      { id: string; name: string } | null;
  items:        { custom_price: number | null; quantity: number; is_purchased: boolean; product_id: string | null; products: { price: number | null } | null }[];
}

export default async function ShoppingOverviewPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: lists }, { data: projects }] = await Promise.all([
    supabase
      .from("shopping_lists")
      .select(`
        id, name, budget_total, created_at,
        project:projects ( id, name ),
        items:shopping_list_items (
          custom_price, quantity, is_purchased, product_id,
          products ( price )
        )
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name")
      .order("created_at", { ascending: false }),
  ]);

  const rows = (lists ?? []) as unknown as ListRow[];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-start justify-between gap-4 mb-8 sm:mb-10 flex-wrap">
        <div>
          <p className="text-xs font-sans uppercase tracking-[0.2em] text-gray-400 mb-2">
            Budget & Einkauf
          </p>
          <h1 className="font-headline text-4xl sm:text-5xl text-forest dark:text-mint leading-none mb-3">
            Shopping-Listen
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl">
            Plane deinen Einkauf pro Projekt — mit Budget-Tracker und Prioritäten.
          </p>
        </div>
        <NewListButton projects={projects ?? []} />
      </div>

      {rows.length === 0 ? (
        <EmptyState projects={projects ?? []} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <ListCard key={r.id} list={r} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── ListCard ─────────────────────────────────────────────────────────────────

function ListCard({ list }: { list: ListRow }) {
  const totalSpent = list.items.reduce((sum, i) => {
    const price = i.custom_price ?? i.products?.price ?? 0;
    return sum + price * (i.quantity ?? 1);
  }, 0);
  const budget   = list.budget_total ?? 0;
  const percent  = budget > 0 ? Math.min(150, (totalSpent / budget) * 100) : 0;
  const color    = percent > 100 ? "bg-terracotta" : percent > 80 ? "bg-amber-500" : "bg-mint";

  return (
    <Link
      href={`/dashboard/shopping/${list.id}`}
      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-forest/40 dark:hover:border-mint/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {list.name}
          </h3>
          {list.project && (
            <p className="text-xs text-mint-foreground mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-mint/15 text-forest dark:text-mint">
              📁 {list.project.name}
            </p>
          )}
        </div>
        <div className="w-9 h-9 rounded-lg bg-forest/10 dark:bg-forest/20 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4 text-forest dark:text-mint" strokeWidth={1.5} />
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {list.items.length} {list.items.length === 1 ? "Artikel" : "Artikel"} ·{" "}
        {list.items.filter((i) => i.is_purchased).length} gekauft
      </div>

      {budget > 0 ? (
        <>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-mono text-gray-700 dark:text-gray-300">
              € {totalSpent.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
            </span>
            <span className="font-mono text-gray-400">
              / € {budget.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full ${color} transition-all`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        </>
      ) : (
        <p className="text-xs text-gray-400 italic">Kein Budget gesetzt</p>
      )}
    </Link>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ projects }: { projects: { id: string; name: string }[] }) {
  return (
    <div className="bg-cream dark:bg-gray-800/40 border-2 border-dashed border-forest/20 dark:border-gray-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-forest/10 dark:bg-forest/20 flex items-center justify-center mb-4">
        <ShoppingBag className="w-6 h-6 text-forest dark:text-mint" strokeWidth={1.5} />
      </div>
      <h3 className="font-headline text-xl text-forest dark:text-mint mb-2">
        Noch keine Shopping-Liste
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-5">
        Erstelle deine erste Liste und behalte den Überblick über Budget und Prioritäten.
      </p>
      <NewListButton projects={projects} primary />
    </div>
  );
}

// Helper used server-side when there are no items yet
void Plus;  void ArrowRight;
