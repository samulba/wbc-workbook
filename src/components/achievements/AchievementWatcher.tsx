"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Trophy, X } from "lucide-react";
import { AchievementIcon } from "./AchievementIcon";

interface Unseen {
  id:          string;
  unlocked_at: string;
  achievement: {
    key:         string;
    name:        string;
    description: string;
    icon:        string;
    points:      number;
    category:    string;
  };
}

export function AchievementWatcher() {
  const pathname = usePathname();
  const [queue, setQueue] = useState<Unseen[]>([]);

  const fetchUnseen = useCallback(async () => {
    try {
      const res = await fetch("/api/achievements/unseen", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.items) && json.items.length > 0) {
        setQueue((prev) => {
          const existing = new Set(prev.map((p) => p.id));
          const fresh    = (json.items as Unseen[]).filter((i) => !existing.has(i.id));
          return [...prev, ...fresh];
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Fetch on mount + every route change
  useEffect(() => {
    fetchUnseen();
  }, [fetchUnseen, pathname]);

  const current = queue[0] ?? null;

  // When a toast is shown, auto-dismiss after 5s and mark seen
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(async () => {
      try {
        await fetch("/api/achievements/unseen", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ ids: [current.id] }),
        });
      } catch {
        /* ignore */
      }
      setQueue((prev) => prev.slice(1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [current]);

  async function dismiss() {
    if (!current) return;
    try {
      await fetch("/api/achievements/unseen", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ids: [current.id] }),
      });
    } catch {
      /* ignore */
    }
    setQueue((prev) => prev.slice(1));
  }

  if (!current) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
      <Toast achievement={current} onDismiss={dismiss} />
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ achievement, onDismiss }: { achievement: Unseen; onDismiss: () => void }) {
  const a = achievement.achievement;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto relative w-80 overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-500/40 bg-white dark:bg-gray-900 shadow-2xl shadow-amber-500/20 animate-achv-in"
    >
      <Confetti />

      <div className="relative p-4 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
          <AchievementIcon name={a.icon} className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">
            <Trophy className="w-3 h-3" strokeWidth={2} />
            Achievement freigeschaltet
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {a.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">
            {a.description}
          </p>
          <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 mt-1.5">
            +{a.points} Punkte
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label="Schließen"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      </div>

      {/* progress bar */}
      <div className="h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 origin-left animate-achv-progress" />

      <style jsx>{`
        @keyframes achv-in {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes achv-progress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
        .animate-achv-in       { animation: achv-in 420ms cubic-bezier(0.22, 1, 0.36, 1); }
        .animate-achv-progress { animation: achv-progress 5s linear forwards; }
      `}</style>
    </div>
  );
}

// ── Confetti ─────────────────────────────────────────────────────────────────
// Lightweight CSS-only burst (no libraries). 20 colored particles.

const COLORS = ["#fbbf24", "#f97316", "#10b981", "#3b82f6", "#ec4899", "#a855f7"];

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const left  = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const dur   = 1.5 + Math.random() * 0.8;
        const size  = 4 + Math.random() * 4;
        const rot   = Math.random() * 360;
        return (
          <span
            key={i}
            className="absolute top-0 rounded-sm animate-achv-fall"
            style={{
              left:            `${left}%`,
              width:           `${size}px`,
              height:          `${size}px`,
              backgroundColor: color,
              transform:       `rotate(${rot}deg)`,
              animationDelay:  `${delay}s`,
              animationDuration: `${dur}s`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes achv-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(140px) rotate(540deg); opacity: 0; }
        }
        .animate-achv-fall { animation: achv-fall linear forwards; }
      `}</style>
    </div>
  );
}
