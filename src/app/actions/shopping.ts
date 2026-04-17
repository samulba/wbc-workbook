"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import type { ShoppingPriority } from "@/lib/types/shopping";

// ── Types ────────────────────────────────────────────────────────────────────

export type CreateListResult = { ok: true; listId: string } | { ok: false; error: string };
export type BasicResult      = { ok: true } | { ok: false; error: string };
export type ShareResult      = { ok: true; token: string | null } | { ok: false; error: string };

// ── Utilities ────────────────────────────────────────────────────────────────

async function ensureListOwnership(listId: string): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? user.id : null;
}

// ── List CRUD ────────────────────────────────────────────────────────────────

export async function createShoppingList(input: {
  name:         string;
  projectId?:   string | null;
  budgetTotal?: number | null;
}): Promise<CreateListResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Bitte gib einen Namen ein." };

  const { data, error } = await supabase
    .from("shopping_lists")
    .insert({
      user_id:      user.id,
      project_id:   input.projectId ?? null,
      name,
      budget_total: input.budgetTotal ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createShoppingList:", error);
    return { ok: false, error: "Liste konnte nicht erstellt werden." };
  }

  revalidatePath("/dashboard/shopping");
  revalidatePath("/dashboard");
  return { ok: true, listId: data.id };
}

export async function renameShoppingList(listId: string, name: string): Promise<BasicResult> {
  const userId = await ensureListOwnership(listId);
  if (!userId) return { ok: false, error: "Keine Berechtigung." };
  const n = name.trim();
  if (!n) return { ok: false, error: "Name darf nicht leer sein." };

  const supabase = createClient();
  const { error } = await supabase
    .from("shopping_lists")
    .update({ name: n })
    .eq("id", listId);

  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };
  revalidatePath(`/dashboard/shopping/${listId}`);
  revalidatePath("/dashboard/shopping");
  return { ok: true };
}

export async function updateShoppingBudget(listId: string, budget: number | null): Promise<BasicResult> {
  const userId = await ensureListOwnership(listId);
  if (!userId) return { ok: false, error: "Keine Berechtigung." };

  const supabase = createClient();
  const { error } = await supabase
    .from("shopping_lists")
    .update({ budget_total: budget })
    .eq("id", listId);

  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };
  revalidatePath(`/dashboard/shopping/${listId}`);
  revalidatePath("/dashboard/shopping");
  return { ok: true };
}

export async function deleteShoppingList(listId: string): Promise<BasicResult> {
  const userId = await ensureListOwnership(listId);
  if (!userId) return { ok: false, error: "Keine Berechtigung." };

  const supabase = createClient();
  const { error } = await supabase.from("shopping_lists").delete().eq("id", listId);

  if (error) return { ok: false, error: "Löschen fehlgeschlagen." };
  revalidatePath("/dashboard/shopping");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── Item CRUD ────────────────────────────────────────────────────────────────

export async function addProductToList(input: {
  listId:    string;
  productId: string;
  priority?: ShoppingPriority;
  quantity?: number;
}): Promise<BasicResult> {
  const userId = await ensureListOwnership(input.listId);
  if (!userId) return { ok: false, error: "Keine Berechtigung." };

  const supabase = createClient();
  const { error } = await supabase.from("shopping_list_items").insert({
    list_id:    input.listId,
    product_id: input.productId,
    quantity:   input.quantity ?? 1,
    priority:   input.priority ?? "nice_to_have",
  });

  if (error) {
    console.error("addProductToList:", error);
    return { ok: false, error: "Produkt konnte nicht hinzugefügt werden." };
  }

  revalidatePath(`/dashboard/shopping/${input.listId}`);
  revalidatePath("/dashboard/shopping");
  return { ok: true };
}

export async function addCustomItem(input: {
  listId:   string;
  name:     string;
  price?:   number | null;
  url?:     string | null;
  image?:   string | null;
  quantity?: number;
  priority?: ShoppingPriority;
}): Promise<BasicResult> {
  const userId = await ensureListOwnership(input.listId);
  if (!userId) return { ok: false, error: "Keine Berechtigung." };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name ist erforderlich." };

  const supabase = createClient();
  const { error } = await supabase.from("shopping_list_items").insert({
    list_id:      input.listId,
    custom_name:  name,
    custom_price: input.price ?? null,
    custom_url:   input.url?.trim() || null,
    custom_image: input.image?.trim() || null,
    quantity:     input.quantity ?? 1,
    priority:     input.priority ?? "nice_to_have",
  });

  if (error) {
    console.error("addCustomItem:", error);
    return { ok: false, error: "Eintrag konnte nicht hinzugefügt werden." };
  }

  revalidatePath(`/dashboard/shopping/${input.listId}`);
  revalidatePath("/dashboard/shopping");
  return { ok: true };
}

export async function toggleItemPurchased(itemId: string, listId: string): Promise<BasicResult> {
  const userId = await ensureListOwnership(listId);
  if (!userId) return { ok: false, error: "Keine Berechtigung." };

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("shopping_list_items")
    .select("is_purchased")
    .eq("id", itemId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Nicht gefunden." };

  const { error } = await supabase
    .from("shopping_list_items")
    .update({ is_purchased: !existing.is_purchased })
    .eq("id", itemId);

  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };
  revalidatePath(`/dashboard/shopping/${listId}`);
  return { ok: true };
}

export async function updateItemPriority(
  itemId: string,
  listId: string,
  priority: ShoppingPriority,
): Promise<BasicResult> {
  const userId = await ensureListOwnership(listId);
  if (!userId) return { ok: false, error: "Keine Berechtigung." };

  const supabase = createClient();
  const { error } = await supabase
    .from("shopping_list_items")
    .update({ priority })
    .eq("id", itemId);

  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };
  revalidatePath(`/dashboard/shopping/${listId}`);
  return { ok: true };
}

export async function updateItemQuantity(
  itemId: string,
  listId: string,
  quantity: number,
): Promise<BasicResult> {
  const userId = await ensureListOwnership(listId);
  if (!userId) return { ok: false, error: "Keine Berechtigung." };
  const q = Math.max(1, Math.min(99, Math.floor(quantity)));

  const supabase = createClient();
  const { error } = await supabase
    .from("shopping_list_items")
    .update({ quantity: q })
    .eq("id", itemId);

  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };
  revalidatePath(`/dashboard/shopping/${listId}`);
  return { ok: true };
}

export async function deleteItem(itemId: string, listId: string): Promise<BasicResult> {
  const userId = await ensureListOwnership(listId);
  if (!userId) return { ok: false, error: "Keine Berechtigung." };

  const supabase = createClient();
  const { error } = await supabase.from("shopping_list_items").delete().eq("id", itemId);

  if (error) return { ok: false, error: "Löschen fehlgeschlagen." };
  revalidatePath(`/dashboard/shopping/${listId}`);
  return { ok: true };
}

// ── Sharing ──────────────────────────────────────────────────────────────────

export async function toggleListShare(listId: string): Promise<ShareResult> {
  const userId = await ensureListOwnership(listId);
  if (!userId) return { ok: false, error: "Keine Berechtigung." };

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("shopping_lists")
    .select("is_shared, share_token")
    .eq("id", listId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Nicht gefunden." };

  const nextShared = !existing.is_shared;
  const nextToken  = nextShared
    ? existing.share_token ?? randomBytes(16).toString("hex")
    : existing.share_token;

  const { error } = await supabase
    .from("shopping_lists")
    .update({ is_shared: nextShared, share_token: nextToken })
    .eq("id", listId);

  if (error) return { ok: false, error: "Speichern fehlgeschlagen." };
  revalidatePath(`/dashboard/shopping/${listId}`);
  return { ok: true, token: nextShared ? nextToken : null };
}
