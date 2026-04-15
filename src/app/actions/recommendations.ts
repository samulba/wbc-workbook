"use server";

import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types/product";

export type RecommendationsResult = {
  products:    Product[];
  favoriteIds: string[];
};

export type FavoriteResult =
  | { ok: true; isFavorite: boolean }
  | { ok: false; error: string };

// ── Effect → style/tag hints ──────────────────────────────────────────────────
// Used to score products more highly when their style matches the room effect
const EFFECT_STYLE_HINTS: Record<string, string[]> = {
  ruhe_erholung:          ["Skandinavisch", "Minimalistisch", "Japandi"],
  fokus_konzentration:    ["Modern", "Minimalistisch", "Industrial"],
  energie_aktivitaet:     ["Modern", "Industrial", "Art Deco"],
  kreativitaet_inspiration: ["Boho", "Art Deco", "Mediterran"],
  begegnung_austausch:    ["Mediterran", "Boho", "Rustikal"],
};

// ── Fetch matching products + user's favorites ────────────────────────────────
export async function getProductRecommendations({
  roomType,
  mainEffect,
  limit = 4,
}: {
  roomType:   string;
  mainEffect?: string | null;
  limit?:     number;
}): Promise<RecommendationsResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { products: [], favoriteIds: [] };

  // Fetch all active module-1 products (small set in practice)
  const { data: raw } = await supabase
    .from("products")
    .select("*")
    .eq("module", 1)
    .eq("is_active", true)
    .order("priority", { ascending: false });

  const all = (raw ?? []) as Product[];

  // ── Score + filter ────────────────────────────────────────────
  const styleHints = mainEffect ? (EFFECT_STYLE_HINTS[mainEffect] ?? []) : [];

  const scored = all
    .map((p) => {
      const roomTypes = p.room_types ?? [];

      // Room type match: product must include this room OR have no restriction
      const roomMatch = roomTypes.length === 0 || roomTypes.includes(roomType);
      if (!roomMatch) return null;

      // Score bonus for effect-matching style
      const styleBonus = styleHints.includes(p.style ?? "") ? 10 : 0;

      // Score bonus if effect appears in product tags
      const tagBonus = mainEffect && (p.tags ?? []).some(
        (t) => t.toLowerCase().includes(mainEffect.replace("_", " "))
      ) ? 5 : 0;

      return { product: p, score: (p.priority ?? 0) + styleBonus + tagBonus };
    })
    .filter(Boolean) as { product: Product; score: number }[];

  const sorted  = scored.sort((a, b) => b.score - a.score);
  const matched = sorted.slice(0, limit).map((s) => s.product);

  if (matched.length === 0) return { products: [], favoriteIds: [] };

  // ── Fetch user favorites for matched products ─────────────────
  const productIds = matched.map((p) => p.id);
  const { data: favs } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id)
    .in("product_id", productIds);

  const favoriteIds = (favs ?? []).map((f) => f.product_id as string);

  return { products: matched, favoriteIds };
}

// ── Toggle favorite ───────────────────────────────────────────────────────────
export async function toggleFavorite(
  productId: string,
  roomId: string | null
): Promise<FavoriteResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet" };

  // Check existing favorite
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) return { ok: false, error: "Fehler beim Entfernen" };
    return { ok: true, isFavorite: false };
  }

  const { error } = await supabase.from("favorites").insert({
    user_id:    user.id,
    product_id: productId,
    room_id:    roomId ?? null,
  });
  if (error) return { ok: false, error: "Fehler beim Speichern" };
  return { ok: true, isFavorite: true };
}
