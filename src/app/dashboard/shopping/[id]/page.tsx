import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ShoppingListView } from "./_components/ShoppingListView";
import type { ShoppingItemResolved } from "@/lib/types/shopping";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("shopping_lists")
    .select("name")
    .eq("id", params.id)
    .maybeSingle();
  return { title: data?.name ?? "Shopping-Liste" };
}

export default async function ShoppingListPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: list } = await supabase
    .from("shopping_lists")
    .select(`
      id, user_id, project_id, name, budget_total, is_shared, share_token, created_at,
      project:projects ( id, name )
    `)
    .eq("id", params.id)
    .maybeSingle();

  if (!list || list.user_id !== user.id) notFound();

  const { data: rawItems } = await supabase
    .from("shopping_list_items")
    .select(`
      id, list_id, product_id, custom_name, custom_price, custom_url, custom_image,
      quantity, priority, is_purchased, notes, created_at,
      product:products ( name, price, affiliate_url, image_url )
    `)
    .eq("list_id", list.id)
    .order("created_at");

  type Row = {
    id: string; list_id: string; product_id: string | null;
    custom_name: string | null; custom_price: number | null;
    custom_url: string | null; custom_image: string | null;
    quantity: number; priority: "must_have" | "nice_to_have" | "maybe_later";
    is_purchased: boolean; notes: string | null; created_at: string;
    product: { name: string | null; price: number | null; affiliate_url: string | null; image_url: string | null } | null;
  };

  const items: ShoppingItemResolved[] = ((rawItems ?? []) as unknown as Row[]).map((r) => ({
    id:           r.id,
    list_id:      r.list_id,
    product_id:   r.product_id,
    name:         r.custom_name  ?? r.product?.name          ?? "Produkt",
    price:        r.custom_price ?? r.product?.price         ?? null,
    url:          r.custom_url   ?? r.product?.affiliate_url ?? null,
    image:        r.custom_image ?? r.product?.image_url     ?? null,
    quantity:     r.quantity,
    priority:     r.priority,
    is_purchased: r.is_purchased,
    notes:        r.notes,
    created_at:   r.created_at,
  }));

  // Recommendations for the add-from-recommendations modal (products table)
  const { data: products } = await supabase
    .from("products")
    .select("id, name, image_url, affiliate_url, price, partner, category")
    .eq("is_active", true)
    .order("priority", { ascending: false })
    .limit(80);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <Link
        href="/dashboard/shopping"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-forest dark:hover:text-mint transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
      </Link>

      <ShoppingListView
        list={{
          id:           list.id,
          name:         list.name,
          budget_total: list.budget_total,
          is_shared:    list.is_shared,
          share_token:  list.share_token,
          project:      (list.project as unknown as { id: string; name: string } | null) ?? null,
        }}
        items={items}
        products={products ?? []}
      />
    </div>
  );
}
