import Link from "next/link";
import { ShoppingBag, ArrowRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function ShoppingWidget() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: lists } = await supabase
    .from("shopping_lists")
    .select(`
      id, name, budget_total, created_at,
      items:shopping_list_items ( custom_price, quantity, product_id, products ( price ) )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (!lists || lists.length === 0) {
    return (
      <Link
        href="/dashboard/shopping"
        className="group flex items-center gap-4 rounded-2xl border border-forest/20 dark:border-gray-700 bg-cream dark:bg-gray-800 p-4 hover:border-forest/40 hover:shadow-md transition-all"
      >
        <div className="w-11 h-11 rounded-xl bg-forest/15 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5 text-forest dark:text-mint" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-sans uppercase tracking-[0.15em] text-gray-400 mb-0.5">
            Shopping-Listen
          </p>
          <p className="text-sm font-semibold text-forest dark:text-mint leading-tight">
            Erste Liste anlegen
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Budget & Prioritäten im Blick
          </p>
        </div>
        <Plus className="w-4 h-4 text-forest/60 group-hover:translate-x-0.5 transition-all" />
      </Link>
    );
  }

  const list = lists[0];
  type ItemRow = { custom_price: number | null; quantity: number; product_id: string | null; products: { price: number | null } | null };
  const items = (list.items as unknown as ItemRow[]) ?? [];

  const totalSpent = items.reduce((sum, i) => {
    const price = i.custom_price ?? i.products?.price ?? 0;
    return sum + price * (i.quantity ?? 1);
  }, 0);

  const budget  = list.budget_total ?? 0;
  const percent = budget > 0 ? Math.min(150, (totalSpent / budget) * 100) : 0;

  const color =
    percent > 100 ? "bg-terracotta" :
    percent > 80  ? "bg-amber-500" :
                    "bg-mint";

  return (
    <Link
      href={`/dashboard/shopping/${list.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-forest/40 dark:hover:border-mint/40 hover:shadow-md transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-forest/10 dark:bg-forest/20 flex items-center justify-center shrink-0">
        <ShoppingBag className="w-5 h-5 text-forest dark:text-mint" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-sans uppercase tracking-[0.15em] text-gray-400 mb-0.5">
          Aktive Shopping-Liste
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">
          {list.name}
        </p>
        {budget > 0 ? (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-mono text-gray-600 dark:text-gray-400">
                € {totalSpent.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
              </span>
              <span className="font-mono text-gray-400">
                / € {budget.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-full ${color} transition-all`}
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic mt-0.5">Kein Budget</p>
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-forest group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
