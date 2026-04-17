"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Product } from "@/lib/types/product";

export type FavoriteItem = {
  id:         string;
  created_at: string;
  room_id:    string | null;
  product:    Product;
};

export type FavoriteActionResult =
  | { ok: true }
  | { ok: false; error: string };

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUserFavorites(): Promise<FavoriteItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      id,
      created_at,
      room_id,
      products (
        id, name, description, affiliate_url, image_url, price,
        partner, category, subcategory, module, tags,
        style, material, color_family, room_types, why_fits,
        is_active, priority
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data
    .filter((f) => f.products !== null)
    .map((f) => ({
      id:         f.id,
      created_at: f.created_at,
      room_id:    f.room_id ?? null,
      product:    f.products as unknown as Product,
    }));
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function removeFavorite(
  productId: string
): Promise<FavoriteActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    console.error("removeFavorite error:", error);
    return { ok: false, error: "Fehler beim Entfernen" };
  }

  return { ok: true };
}
