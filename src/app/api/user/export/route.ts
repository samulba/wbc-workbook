import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/user/export — DSGVO Art. 20 (Datenportabilität)
// Returns a JSON dump of all user-owned data. Runs through the user-scoped
// Supabase client, so RLS guarantees we only ever read data owned by the
// current user — no service-role needed here.

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    { data: profile },
    { data: projects },
    { data: rooms },
    { data: module1 },
    { data: favorites },
    { data: shoppingLists },
    { data: shoppingItems },
    { data: collections },
    { data: collectionItems },
    { data: feedback },
    { data: coaching },
    { data: unlocks },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("projects").select("*").eq("user_id", user.id),
    supabase.from("rooms").select("*, projects!inner(user_id)").eq("projects.user_id", user.id),
    supabase.from("module1_analysis").select("*, rooms!inner(project_id, projects!inner(user_id))").eq("rooms.projects.user_id", user.id),
    supabase.from("favorites").select("*").eq("user_id", user.id),
    supabase.from("shopping_lists").select("*").eq("user_id", user.id),
    supabase.from("shopping_list_items").select("*, shopping_lists!inner(user_id)").eq("shopping_lists.user_id", user.id),
    supabase.from("inspiration_collections").select("*").eq("user_id", user.id),
    supabase.from("collection_items").select("*, inspiration_collections!inner(user_id)").eq("inspiration_collections.user_id", user.id),
    supabase.from("user_feedback").select("*").eq("user_id", user.id),
    supabase.from("coaching_bookings").select("*").eq("user_id", user.id),
    supabase.from("user_achievements").select("*, achievement:achievements(key,name,points)").eq("user_id", user.id),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user: {
      id:    user.id,
      email: user.email,
      created_at: user.created_at,
    },
    data: {
      profile,
      projects,
      rooms,
      module1_analysis: module1,
      favorites,
      shopping_lists:      shoppingLists,
      shopping_list_items: shoppingItems,
      collections,
      collection_items:    collectionItems,
      feedback,
      coaching_bookings:   coaching,
      achievements_unlocked: unlocks,
    },
  };

  const json     = JSON.stringify(payload, null, 2);
  const filename = `wbc-daten-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(json, {
    headers: {
      "Content-Type":        "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
