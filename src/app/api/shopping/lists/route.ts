import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ lists: [] });

  const { data } = await supabase
    .from("shopping_lists")
    .select("id, name, project_id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return NextResponse.json({ lists: data ?? [] });
}
