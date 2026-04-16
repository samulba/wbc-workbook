import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProfileForm } from "./_components/ProfileForm";

export const metadata: Metadata = { title: "Profil bearbeiten" };

function getInitials(email: string): string {
  const local = email.split("@")[0];
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

export default async function ProfilPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const email       = user.email ?? "";
  const displayName = (user.user_metadata?.full_name as string) ?? "";
  const initials    = getInitials(email);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-sans mb-8 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <div className="max-w-md">
        {/* Header */}
        <h1 className="font-headline text-2xl sm:text-3xl text-gray-900 mb-1">
          Profil bearbeiten
        </h1>
        <p className="text-sm text-gray-500 font-sans mb-8">
          Deine persönlichen Daten verwalten.
        </p>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-8 p-4 rounded-xl border border-gray-200 bg-white">
          <div className="w-14 h-14 rounded-full bg-forest/12 border-2 border-forest/20 flex items-center justify-center shrink-0">
            <span className="text-lg font-sans font-bold text-forest">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-sans font-semibold text-gray-900">
              {displayName || email.split("@")[0]}
            </p>
            <p className="text-xs text-gray-500 font-sans">{email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <ProfileForm initialName={displayName} email={email} />
        </div>
      </div>
    </div>
  );
}
