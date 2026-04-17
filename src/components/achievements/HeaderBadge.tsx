"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { AchievementIcon } from "./AchievementIcon";

interface Summary {
  unlocked: number;
  total:    number;
  points:   number;
  recent:   Array<{
    unlocked_at: string;
    achievement: {
      key:    string;
      name:   string;
      icon:   string;
      points: number;
    };
  }>;
}

export function HeaderBadge() {
  const [data, setData] = useState<Summary | null>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    fetch("/api/achievements/summary", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Summary | null) => setData(d))
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        href="/dashboard/achievements"
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
        aria-label={`${data.points} Punkte — ${data.unlocked}/${data.total} Achievements`}
      >
        <Trophy className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
        <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 leading-none">
          {data.points}
        </span>
      </Link>

      {hover && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-3.5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">
                Achievements
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {data.unlocked} / {data.total}
              </p>
            </div>
            <p className="text-lg font-bold text-amber-500 font-mono">{data.points}</p>
          </div>

          {data.recent.length > 0 ? (
            <ul className="py-1">
              {data.recent.map((r, i) => (
                <li key={i} className="px-3.5 py-2 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                    <AchievementIcon
                      name={r.achievement.icon}
                      className="w-3.5 h-3.5 text-white"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {r.achievement.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(r.unlocked_at).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3.5 py-3 text-xs text-gray-400 italic text-center">
              Noch keine Achievements freigeschaltet.
            </p>
          )}

          <Link
            href="/dashboard/achievements"
            className="block px-3.5 py-2.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-t border-gray-100 dark:border-gray-700 text-center transition-colors"
          >
            Alle anzeigen →
          </Link>
        </div>
      )}
    </div>
  );
}
