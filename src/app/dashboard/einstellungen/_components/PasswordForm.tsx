"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePassword } from "@/app/actions/profile";
import type { PasswordResult } from "@/app/actions/profile";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 px-5 rounded-lg bg-forest text-white text-sm font-sans font-medium hover:bg-forest/90 transition-colors disabled:opacity-60 flex items-center gap-2"
    >
      {pending ? (
        <>
          <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          Speichern …
        </>
      ) : (
        "Passwort ändern"
      )}
    </button>
  );
}

function PasswordInput({ id, name, label, placeholder }: {
  id: string; name: string; label: string; placeholder?: string
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-sans font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder ?? "••••••••"}
          required
          minLength={8}
          className="w-full h-10 px-4 pr-10 rounded-lg border border-gray-200 bg-white text-sm font-sans text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/40 transition"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}

export function PasswordForm() {
  const [state, formAction] = useFormState<PasswordResult | null, FormData>(
    updatePassword,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <PasswordInput id="newPassword"     name="newPassword"     label="Neues Passwort"          placeholder="Min. 8 Zeichen" />
      <PasswordInput id="confirmPassword" name="confirmPassword" label="Passwort bestätigen" />

      {state?.ok === false && (
        <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      {state?.ok === true && (
        <p className="flex items-center gap-1.5 text-xs text-forest font-sans">
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
          Passwort erfolgreich geändert.
        </p>
      )}

      <div className="flex justify-end pt-1">
        <SubmitButton />
      </div>
    </form>
  );
}
