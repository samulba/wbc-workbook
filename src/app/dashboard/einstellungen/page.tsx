import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EinstellungenTabs } from "./_components/EinstellungenTabs";

export const metadata: Metadata = { title: "Einstellungen – Wellbeing Workbook" };

function getInitials(email: string): string {
  const local = email.split("@")[0];
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

export default async function EinstellungenPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const email       = user.email ?? "";
  const displayName = (user.user_metadata?.full_name as string) ?? "";
  const isAdmin     = profile?.role === "admin";
  const initials    = getInitials(email);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-sans mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="font-headline text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 mb-1">
          Einstellungen
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          Konto, Sicherheit und Datenschutz verwalten.
        </p>
      </div>

      <EinstellungenTabs
        email={email}
        displayName={displayName}
        initials={initials}
        isAdmin={isAdmin}
      />
    </div>
  );
}
