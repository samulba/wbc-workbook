"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            label="Passwort"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            aria-pressed={showPassword}
            tabIndex={-1}
            className="absolute right-1.5 bottom-1.5 h-9 w-9 inline-flex items-center justify-center rounded-md text-gray/55 hover:text-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={1.75} />
            )}
          </button>
        </div>

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

      {mode === "signup" && (
        <p className="mt-3 text-center text-xs text-gray/70 leading-relaxed">
          Mit der Registrierung akzeptierst du unsere{" "}
          <Link href="/legal/agb" className="underline hover:text-forest">AGB</Link>
          {" "}und nimmst die{" "}
          <Link href="/legal/datenschutz" className="underline hover:text-forest">Datenschutzerklärung</Link>
          {" "}zur Kenntnis.
        </p>
      )}

      <p className="mt-6 text-center text-[11px] text-gray/60 space-x-3">
        <Link href="/legal/impressum" className="hover:text-forest">Impressum</Link>
        <span>·</span>
        <Link href="/legal/datenschutz" className="hover:text-forest">Datenschutz</Link>
        <span>·</span>
        <Link href="/legal/agb" className="hover:text-forest">AGB</Link>
      </p>
    </div>
  );
}
