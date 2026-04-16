"use client";

import { useState, useEffect } from "react";
import { X, Link2, Check, Copy, Globe, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { setRoomSharing } from "@/app/actions/sharing";

interface Props {
  roomId: string;
  initialIsShared: boolean;
  initialToken: string | null;
  onClose: () => void;
}

export function ShareModal({ roomId, initialIsShared, initialToken, onClose }: Props) {
  const [isShared, setIsShared]     = useState(initialIsShared);
  const [token, setToken]           = useState<string | null>(initialToken);
  const [toggling, setToggling]     = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);
  const [origin, setOrigin]         = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shareUrl = token ? `${origin}/shared/${token}` : "";

  async function handleToggle() {
    setToggling(true);
    setToggleError(null);
    const result = await setRoomSharing(roomId, !isShared);
    setToggling(false);
    if (!result.ok) {
      setToggleError(result.error);
      return;
    }
    setIsShared(result.isShared);
    setToken(result.token);
  }

  function handleCopy() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl pointer-events-auto animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest/8 border border-forest/12 flex items-center justify-center">
                <Link2 className="w-4 h-4 text-forest/70" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-headline text-base text-gray-900 leading-tight">
                  Konzept teilen
                </h2>
                <p className="text-[11px] text-gray-400 font-sans">
                  Öffentlicher Link zum Raumkonzept
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mx-5" />

          {/* Body */}
          <div className="px-5 py-4 flex flex-col gap-4">

            {/* Toggle row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isShared ? (
                  <Globe className="w-4 h-4 text-forest" strokeWidth={1.5} />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                )}
                <div>
                  <p className="text-sm font-sans font-semibold text-gray-800 leading-tight">
                    {isShared ? "Öffentlich geteilt" : "Teilen deaktiviert"}
                  </p>
                  <p className="text-[11px] text-gray-400 font-sans">
                    {isShared ? "Jeder mit dem Link kann sehen" : "Nur du kannst es sehen"}
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isShared}
                onClick={handleToggle}
                disabled={toggling}
                className={cn(
                  "relative w-11 h-6 rounded-full border transition-all duration-200 shrink-0",
                  isShared
                    ? "bg-forest border-forest"
                    : "bg-gray-200 border-gray-200",
                  toggling && "opacity-60 cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200",
                    isShared ? "left-[calc(100%-1.375rem)]" : "left-0.5"
                  )}
                >
                  {toggling && (
                    <Loader2 className="w-3 h-3 text-gray-400 animate-spin absolute inset-1" strokeWidth={2} />
                  )}
                </span>
              </button>
            </div>

            {/* Error */}
            {toggleError && (
              <p className="text-xs text-red-600 font-sans bg-red-50 rounded-lg px-3 py-2">
                {toggleError}
              </p>
            )}

            {/* Share URL section */}
            {isShared && token && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* URL row */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-[11px] font-mono text-gray-600 truncate select-all">
                      {shareUrl}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Link kopieren"
                    className={cn(
                      "shrink-0 h-9 px-3.5 rounded-xl border text-xs font-sans font-medium transition-all",
                      copied
                        ? "border-forest/30 bg-forest/8 text-forest"
                        : "border-gray-200 bg-white text-gray-600 hover:border-forest/30 hover:text-forest"
                    )}
                  >
                    {copied ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        Kopiert
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3 h-3" strokeWidth={1.5} />
                        Kopieren
                      </span>
                    )}
                  </button>
                </div>

                {/* Info note */}
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed px-0.5">
                  Jeder mit diesem Link kann dein Raumkonzept ansehen – ohne Login und ohne persönliche Daten.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
