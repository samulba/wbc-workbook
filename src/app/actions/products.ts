"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Product, ProductInsert } from "@/lib/types/product";

// ── Auth helper ───────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");
  return { supabase, user };
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProductActionResult =
  | { ok: true; productId?: string }
  | { ok: false; error: string };

export type AdminStats = {
  products:        number;
  activeProducts:  number;
  users:           number;
  projects:        number;
};

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const { supabase } = await requireAdmin();

  const [
    { count: products },
    { count: activeProducts },
    { count: users },
    { count: projects },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
  ]);

  return {
    products:       products       ?? 0,
    activeProducts: activeProducts ?? 0,
    users:          users          ?? 0,
    projects:       projects       ?? 0,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllProducts error:", error);
    return [];
  }

  return (data ?? []) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Product;
}

// ── Write ─────────────────────────────────────────────────────────────────────

function parseProductForm(formData: FormData): ProductInsert {
  const tagsRaw = (formData.get("tags") as string ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const roomTypesRaw = formData.getAll("room_types") as string[];

  const moduleRaw = formData.get("module") as string;
  const moduleNum = moduleRaw ? parseInt(moduleRaw, 10) : null;

  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw) : null;

  const priorityRaw = formData.get("priority") as string;
  const priority = priorityRaw ? parseInt(priorityRaw, 10) : 0;

  return {
    name:          (formData.get("name") as string).trim(),
    description:   (formData.get("description") as string)?.trim() || null,
    affiliate_url: (formData.get("affiliate_url") as string).trim(),
    image_url:     (formData.get("image_url") as string)?.trim() || null,
    price:         price && !isNaN(price) ? price : null,
    partner:       (formData.get("partner") as string)?.trim() || null,
    category:      (formData.get("category") as string)?.trim() || null,
    subcategory:   (formData.get("subcategory") as string)?.trim() || null,
    module:        moduleNum && !isNaN(moduleNum) ? moduleNum : null,
    tags:          tagsRaw,
    style:         (formData.get("style") as string)?.trim() || null,
    material:      (formData.get("material") as string)?.trim() || null,
    color_family:  (formData.get("color_family") as string)?.trim() || null,
    room_types:    roomTypesRaw,
    why_fits:      (formData.get("why_fits") as string)?.trim() || null,
    is_active:     formData.get("is_active") === "true",
    priority:      !isNaN(priority) ? priority : 0,
  };
}

export async function createProduct(
  _prev: ProductActionResult | null,
  formData: FormData
): Promise<ProductActionResult> {
  const { supabase } = await requireAdmin();

  const payload = parseProductForm(formData);

  if (!payload.name) return { ok: false, error: "Name ist erforderlich." };
  if (!payload.affiliate_url) return { ok: false, error: "Affiliate-Link ist erforderlich." };

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("createProduct error:", error);
    return { ok: false, error: "Produkt konnte nicht gespeichert werden." };
  }

  return { ok: true, productId: data.id };
}

export async function updateProduct(
  id: string,
  _prev: ProductActionResult | null,
  formData: FormData
): Promise<ProductActionResult> {
  const { supabase } = await requireAdmin();

  const payload = parseProductForm(formData);

  if (!payload.name) return { ok: false, error: "Name ist erforderlich." };
  if (!payload.affiliate_url) return { ok: false, error: "Affiliate-Link ist erforderlich." };

  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("updateProduct error:", error);
    return { ok: false, error: "Produkt konnte nicht aktualisiert werden." };
  }

  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteProduct error:", error);
    return { ok: false, error: "Produkt konnte nicht gelöscht werden." };
  }

  return { ok: true };
}

export async function toggleProductActive(
  id: string,
  isActive: boolean
): Promise<ProductActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Status konnte nicht geändert werden." };
  }

  return { ok: true };
}
