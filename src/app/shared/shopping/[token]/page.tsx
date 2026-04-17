import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PRIORITY_LABELS, type ShoppingPriority } from "@/lib/types/shopping";

export const metadata: Metadata = { title: "Geteilte Shopping-Liste" };
export const dynamic = "force-dynamic";

interface ListRow { list_id: string; list_name: string; project_name: string | null; budget_total: number | null; created_at: string; }
interface ItemRow {
  id: string; name: string; price: number | null; url: string | null; image: string | null;
  quantity: number; priority: string; is_purchased: boolean; notes: string | null;
}

export default async function SharedShoppingPage({ params }: { params: { token: string } }) {
  const supabase = createClient();

  const [{ data: listArr }, { data: itemsArr }] = await Promise.all([
    supabase.rpc("get_shared_shopping_list", { p_token: params.token }),
    supabase.rpc("get_shared_shopping_items", { p_token: params.token }),
  ]);

  const list  = (listArr  as ListRow[] | null)?.[0];
  const items = (itemsArr as ItemRow[] | null) ?? [];

  if (!list) notFound();

  const total = items.reduce((s, i) => s + ((i.price ?? 0) * i.quantity), 0);
  const percent = list.budget_total && list.budget_total > 0
    ? Math.min(150, (total / list.budget_total) * 100)
    : 0;

  const grouped: Record<string, ItemRow[]> = { must_have: [], nice_to_have: [], maybe_later: [] };
  for (const i of items) {
    (grouped[i.priority] ??= []).push(i);
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-forest text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.25em] text-mint mb-3">Geteilte Shopping-Liste</p>
          <h1 className="font-headline text-4xl sm:text-5xl leading-none mb-2">{list.list_name}</h1>
          {list.project_name && <p className="text-mint/80 mt-2 text-sm">📁 {list.project_name}</p>}

          {list.budget_total && list.budget_total > 0 && (
            <div className="mt-6 max-w-md">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-mono">€ {total.toLocaleString("de-DE", { maximumFractionDigits: 0 })}</span>
                <span className="font-mono text-mint/70">/ € {list.budget_total.toLocaleString("de-DE", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-mint transition-all"
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {items.length === 0 ? (
          <p className="text-center text-gray/60 py-16">Diese Liste enthält noch keine Artikel.</p>
        ) : (
          (["must_have", "nice_to_have", "maybe_later"] as ShoppingPriority[]).map((p) => {
            const group = grouped[p];
            if (!group || group.length === 0) return null;
            return (
              <section key={p} className="mb-10">
                <h2 className="font-headline text-2xl text-forest mb-4">{PRIORITY_LABELS[p]}</h2>
                <div className="space-y-2">
                  {group.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm ${
                        item.is_purchased ? "opacity-60" : ""
                      }`}
                    >
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 ${item.is_purchased ? "line-through" : ""}`}>
                          {item.name}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400 mt-0.5">Menge: {item.quantity}</p>
                        )}
                      </div>
                      {item.price !== null && (
                        <p className="text-sm font-mono font-semibold text-forest shrink-0">
                          € {((item.price ?? 0) * item.quantity).toLocaleString("de-DE", { maximumFractionDigits: 0 })}
                        </p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-forest shrink-0"
                          aria-label="Produkt öffnen"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}

        <div className="mt-12 pt-6 border-t border-forest/10 text-center text-xs text-gray/60">
          <Link href="/" className="text-forest hover:underline">Wellbeing Workbook</Link>
          {" — "}
          geteilt am {new Date(list.created_at).toLocaleDateString("de-DE")}
        </div>
      </main>
    </div>
  );
}
