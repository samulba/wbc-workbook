import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { ShoppingListPDF, type ShoppingListPDFProps, type ShoppingListPDFItem } from "@/lib/pdf/ShoppingListPDF";
import type { ShoppingPriority } from "@/lib/types/shopping";
import React from "react";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: list } = await supabase
    .from("shopping_lists")
    .select(`
      id, user_id, name, budget_total, created_at,
      project:projects ( name )
    `)
    .eq("id", params.id)
    .maybeSingle();

  if (!list || list.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: rawItems } = await supabase
    .from("shopping_list_items")
    .select(`
      custom_name, custom_price, custom_url, quantity, priority, is_purchased,
      product:products ( name, price, affiliate_url )
    `)
    .eq("list_id", list.id)
    .order("priority");

  type Row = {
    custom_name:  string | null;
    custom_price: number | null;
    custom_url:   string | null;
    quantity:     number;
    priority:     ShoppingPriority;
    is_purchased: boolean;
    product:      { name: string | null; price: number | null; affiliate_url: string | null } | null;
  };

  const items: ShoppingListPDFItem[] = ((rawItems ?? []) as unknown as Row[]).map((r) => ({
    name:         r.custom_name  ?? r.product?.name          ?? "Produkt",
    price:        r.custom_price ?? r.product?.price         ?? null,
    url:          r.custom_url   ?? r.product?.affiliate_url ?? null,
    quantity:     r.quantity,
    priority:     r.priority,
    is_purchased: r.is_purchased,
  }));

  const props: ShoppingListPDFProps = {
    listName:    list.name,
    projectName: (list.project as unknown as { name: string } | null)?.name ?? null,
    budgetTotal: list.budget_total,
    createdAt:   list.created_at,
    items,
  };

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(ShoppingListPDF, props) as any
  );

  const safe = list.name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().slice(0, 60) || "shopping-liste";
  const filename = `${safe}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control":       "no-cache",
    },
  });
}
