"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addRoom } from "@/app/actions/projects";
import type { AddRoomResult } from "@/app/actions/projects";

const ROOM_OPTIONS = [
  { value: "wohnzimmer",    label: "Wohnzimmer"    },
  { value: "schlafzimmer",  label: "Schlafzimmer"  },
  { value: "arbeitszimmer", label: "Arbeitszimmer" },
  { value: "kinderzimmer",  label: "Kinderzimmer"  },
  { value: "badezimmer",    label: "Bad"           },
  { value: "kueche",        label: "Küche"         },
  { value: "esszimmer",     label: "Esszimmer"     },
  { value: "flur",          label: "Flur"          },
  { value: "keller",        label: "Keller"        },
  { value: "buero",         label: "Büro"          },
  { value: "yogaraum",      label: "Yogaraum"      },
  { value: "wellness",      label: "Wellness"      },
  { value: "studio",        label: "Studio"        },
  { value: "sonstiges",     label: "Sonstiges"     },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-12 rounded-xl bg-forest text-white font-sans font-medium text-sm hover:bg-forest/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          Wird erstellt …
        </>
      ) : (
        "Raum hinzufügen"
      )}
    </button>
  );
}

export function AddRoomForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useFormState<AddRoomResult | null, FormData>(addRoom, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="projectId" value={projectId} />

      {/* Room name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="roomName" className="text-sm font-sans font-medium text-gray-700">
          Raumname
        </label>
        <input
          id="roomName"
          name="roomName"
          type="text"
          placeholder="z. B. Schlafzimmer OG, Büro Erdgeschoss …"
          required
          className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-base font-sans text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/40 transition"
        />
      </div>

      {/* Room type */}
      <div className="flex flex-col gap-2">
        <label htmlFor="roomType" className="text-sm font-sans font-medium text-gray-700">
          Raumtyp
        </label>
        <select
          id="roomType"
          name="roomType"
          required
          defaultValue=""
          className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-base font-sans text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/40 transition appearance-none"
        >
          <option value="" disabled>Bitte auswählen …</option>
          {ROOM_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {state && "error" in state && (
        <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
