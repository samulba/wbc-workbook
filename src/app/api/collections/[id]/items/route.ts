import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Verify collection ownership helper
async function verifyOwnership(supabase: ReturnType<typeof createClient>, collectionId: string, userId: string) {
  const { data } = await supabase
    .from("inspiration_collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

// GET /api/collections/[id]/items
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  if (!await verifyOwnership(supabase, params.id, user.id)) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("collection_items")
    .select(`
      id, added_at,
      inspiration_id, custom_url, custom_title, custom_colors,
      inspiration_images (id, image_url, title, room_effect, room_type, colors)
    `)
    .eq("collection_id", params.id)
    .order("added_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/collections/[id]/items  →  add an item
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  if (!await verifyOwnership(supabase, params.id, user.id)) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  const { inspirationId, customUrl, customTitle, customColors } =
    await req.json() as {
      inspirationId?: string;
      customUrl?: string;
      customTitle?: string;
      customColors?: string[];
    };

  if (!inspirationId && !customUrl) {
    return NextResponse.json({ error: "inspirationId oder customUrl fehlt" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("collection_items")
    .insert({
      collection_id:  params.id,
      inspiration_id: inspirationId ?? null,
      custom_url:     customUrl    ?? null,
      custom_title:   customTitle  ?? null,
      custom_colors:  customColors ?? [],
    })
    .select("id, added_at")
    .single();

  if (error) {
    // Duplicate → treat as success
    if (error.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/collections/[id]/items  →  remove an item (body: { itemId })
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  if (!await verifyOwnership(supabase, params.id, user.id)) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  const { itemId } = await req.json() as { itemId: string };
  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("id", itemId)
    .eq("collection_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
