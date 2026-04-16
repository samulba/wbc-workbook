"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateDisplayName } from "@/app/actions/profile";
import type { ProfileResult } from "@/app/actions/profile";
import { CheckCircle2 } from "lucide-react";

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
        "Speichern"
      )}
    </button>
  );
}

export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [state, formAction] = useFormState<ProfileResult | null, FormData>(
    updateDisplayName,
    null
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Email – read-only */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-sans font-medium text-gray-700">
          E-Mail-Adresse
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="h-10 px-4 rounded-lg border border-gray-200 bg-gray-50 text-sm font-sans text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 font-sans">
          E-Mail-Änderungen sind derzeit nicht möglich.
        </p>
      </div>

      {/* Display name */}
      <form action={formAction} className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-sans font-medium text-gray-700">
          Anzeigename
        </label>
        <div className="flex gap-2">
          <input
            id="fullName"
            name="fullName"
            type="text"
            defaultValue={initialName}
            placeholder="Dein Name"
            className="flex-1 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-sans text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/40 transition"
          />
          <SubmitButton />
        </div>

        {state?.ok === false && (
          <p className="text-xs text-red-600 font-sans">{state.error}</p>
        )}
        {state?.ok === true && (
          <p className="flex items-center gap-1.5 text-xs text-forest font-sans">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            {state.message ?? "Gespeichert"}
          </p>
        )}
      </form>
    </div>
  );
}
