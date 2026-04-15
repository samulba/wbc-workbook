"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage(
          "Bitte überprüfe deine E-Mail und bestätige deine Registrierung."
        );
      }
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-3xl text-forest mb-2">
          {mode === "login" ? "Willkommen zurück" : "Konto erstellen"}
        </h1>
        <p className="text-sm text-gray">
          {mode === "login"
            ? "Melde dich in deinem Workbook an."
            : "Starte deine Wellbeing-Reise."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label="E-Mail"
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          id="password"
          type="password"
          label="Passwort"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
        />

        {error && (
          <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-lg bg-mint/20 px-3 py-2 text-sm text-forest">
            {message}
          </p>
        )}

        <Button type="submit" loading={loading} size="lg" className="mt-2">
          {mode === "login" ? "Anmelden" : "Registrieren"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray">
        {mode === "login" ? (
          <>
            Noch kein Konto?{" "}
            <Link
              href="/signup"
              className="text-forest font-medium hover:text-mint underline underline-offset-2"
            >
              Registrieren
            </Link>
          </>
        ) : (
          <>
            Bereits registriert?{" "}
            <Link
              href="/login"
              className="text-forest font-medium hover:text-mint underline underline-offset-2"
            >
              Anmelden
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
