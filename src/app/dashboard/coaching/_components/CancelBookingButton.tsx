"use client";

import { useState, useTransition } from "react";
import { X, AlertCircle } from "lucide-react";
import { cancelBooking } from "@/app/actions/coaching";
import { useRouter } from "next/navigation";

interface Props {
  bookingId: string;
}

export function CancelBookingButton({ bookingId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm]      = useState(false);
  const [error,   setError]        = useState<string | null>(null);

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBooking(bookingId);
      if (!result.ok) {
        setError(result.error);
        setConfirm(false);
        return;
      }
      router.refresh();
    });
  }

  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-sans text-terracotta shrink-0">
        <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
        {error}
      </div>
    );
  }

  if (confirm) {
    return (
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <p className="text-[10px] font-sans text-gray-500">Wirklich stornieren?</p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="text-[11px] font-sans font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg border border-gray-200 transition-colors"
          >
            Nein
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={handleCancel}
            className="text-[11px] font-sans font-medium text-white bg-terracotta hover:bg-terracotta/90 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
          >
            {pending ? "…" : "Ja, stornieren"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:border-terracotta/30 hover:bg-terracotta/5 text-gray-400 hover:text-terracotta transition-all"
      title="Termin stornieren"
    >
      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
    </button>
  );
}
