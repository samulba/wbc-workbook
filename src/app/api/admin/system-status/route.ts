import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

function readPkg(): { version: string } {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf-8");
    return JSON.parse(raw) as { version: string };
  } catch {
    return { version: "—" };
  }
}

// ── GET /api/admin/system-status ─────────────────────────────────────────────

export async function GET() {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // 1. Supabase check — simple count query
  let supabaseStatus: "ok" | "warn" | "error" = "ok";
  let supabaseLatencyMs = 0;
  let supabaseDetail = "";
  let dbTableCount = 0;

  try {
    const t0 = Date.now();
    const { count, error } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true });
    supabaseLatencyMs = Date.now() - t0;

    if (error) throw error;
    supabaseDetail = `${supabaseLatencyMs}ms`;
    if (supabaseLatencyMs > 2000) supabaseStatus = "warn";

    // Fallback: count known tables
    const knownTables = [
      "profiles", "projects", "rooms", "module1_analysis",
      "products", "inspiration_images", "color_palettes", "faqs",
      "user_feedback", "error_logs", "coaching_bookings",
    ];
    dbTableCount = knownTables.length;
    void count; // used for the query
  } catch (e: unknown) {
    supabaseStatus  = "error";
    supabaseDetail  = e instanceof Error ? e.message.slice(0, 80) : "Verbindung fehlgeschlagen";
  }

  // 2. Env-var checks
  const anthropicOk  = !!process.env.ANTHROPIC_API_KEY;
  const stabilityOk  = !!process.env.STABILITY_API_KEY || !!process.env.NEXT_PUBLIC_STABILITY_API_KEY;

  // 3. App version
  const pkg = readPkg();

  // 4. Next.js version (read from its own package.json)
  let nextVersion = "—";
  try {
    const raw = readFileSync(join(process.cwd(), "node_modules/next/package.json"), "utf-8");
    nextVersion = (JSON.parse(raw) as { version: string }).version;
  } catch { /* ignore */ }

  const checkedAt = new Date().toISOString();

  return NextResponse.json({
    checkedAt,
    services: {
      supabase:  { status: supabaseStatus,                  detail: supabaseDetail,              label: "Supabase" },
      vercel:    { status: "ok" as const,                   detail: "Deployment aktiv",          label: "Vercel" },
      anthropic: { status: anthropicOk ? "ok" : "warn" as "ok" | "warn", detail: anthropicOk ? "API Key gesetzt" : "Key nicht gesetzt", label: "Anthropic AI" },
      stability: { status: stabilityOk ? "ok" : "warn" as "ok" | "warn", detail: stabilityOk ? "API Key gesetzt" : "Key nicht gesetzt", label: "Stability AI" },
    },
    info: {
      appVersion:   pkg.version,
      nodeVersion:  process.version,
      nextVersion,
      dbTableCount,
      platform:     process.platform,
    },
  });
}
