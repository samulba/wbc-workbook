import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/user/favorites-images
// Returns image URLs from the current user's favorite products + any
// inspiration_images they have in collections. Used by the moodboard
// canvas picker.

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ images: [] });

  const [{ data: favs }, { data: collectionItems }] = await Promise.all([
    supabase
      .from("favorites")
      .select("products(image_url)")
      .eq("user_id", user.id),
    supabase
      .from("collection_items")
      .select(`
        inspiration_images(image_url),
        custom_url,
        inspiration_collections!inner(user_id)
      `)
      .eq("inspiration_collections.user_id", user.id),
  ]);

  type FavRow        = { products: { image_url: string | null } | null };
  type CollectionRow = {
    inspiration_images: { image_url: string | null } | null;
    custom_url:   string | null;
  };

  const fromFavs: string[] = ((favs ?? []) as unknown as FavRow[])
    .map((f) => f.products?.image_url)
    .filter((u): u is string => !!u);

  const fromCollections: string[] = ((collectionItems ?? []) as unknown as CollectionRow[])
    .map((i) => i.inspiration_images?.image_url ?? i.custom_url)
    .filter((u): u is string => !!u);

  // Dedupe while preserving order
  const seen = new Set<string>();
  const images: string[] = [];
  for (const url of [...fromFavs, ...fromCollections]) {
    if (!seen.has(url)) { seen.add(url); images.push(url); }
  }

  return NextResponse.json({ images });
}
