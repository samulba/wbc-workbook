"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw, Sparkles, Image as ImageIcon, Coins,
  ScanSearch, TrendingUp, Users,
} from "lucide-react";

// ── Types (mirror /api/admin/ai-usage response) ──────────────────────────────

interface Bucket {
  calls:  number;
  input:  number;
  output: number;
  images: number;
  micros: number;
}
interface TopUser {
  userId: string;
  email:  string | null;
  bucket: Bucket;
}
interface RecentRow {
  id:            string;
  createdAt:     string;
  userId:        string | null;
  endpoint:      string;
  model:         string;
  inputTokens:   number;
  outputTokens:  number;
  imageCount:    number;
  costMicros:    number;
  metadata:      unknown;
}
type Daily = { day: string } & Bucket;

interface UsageResponse {
  checkedAt: string;
  totals:    { today: Bucket; last7d: Bucket; last30d: Bucket; allTime: Bucket };
  byEndpoint:Record<string, Bucket>;
  topUsers:  TopUser[];
  daily:     Daily[];
  recent:    RecentRow[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function usd(micros: number): string {
  const v = micros / 1_000_000;
  if (v >= 10)   return `$${v.toFixed(2)}`;
  if (v >= 1)    return `$${v.toFixed(3)}`;
  if (v >= 0.01) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(5)}`;
}

function nf(n: number): string {
  return n.toLocaleString("de-DE");
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5)     return "gerade eben";
  if (diff < 60)    return `vor ${diff}s`;
  if (diff < 3600)  return `vor ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)}h`;
  return `vor ${Math.floor(diff / 86400)}d`;
}

const ENDPOINT_META: Record<string, { label: string; Icon: React.ElementType; tint: string }> = {
  "analyse-room": { label: "KI-Analyse",     Icon: ScanSearch, tint: "text-forest bg-forest/10 border-forest/20" },
  "render-room":  { label: "Visualisierung", Icon: ImageIcon,  tint: "text-terracotta bg-terracotta/10 border-terracotta/20" },
};

// ── Component ────────────────────────────────────────────────────────────────

export function AiUsageDashboard() {
  const [data,    setData]    = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ai-usage", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as UsageResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 60_000);
    return () => clearInterval(t);
  }, [fetchData]);

  // Scale for daily bar chart
  const daily = data?.daily ?? [];
  const maxMicros = useMemo(
    () => Math.max(1, ...daily.map((d) => d.micros)),
    [daily],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-sans uppercase tracking-[0.2em] text-gray-400 mb-1">
            System
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl text-forest dark:text-mint leading-none">
            AI-Usage
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            OpenAI Token-Verbrauch &amp; geschätzte Kosten — aggregiert pro Endpoint und Nutzer.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
          Aktualisieren
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 mb-6 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {!data ? (
        <div className="text-sm text-gray-400">Lade Daten …</div>
      ) : (
        <>
          {/* Headline stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            <TotalCard label="Heute"           bucket={data.totals.today}   />
            <TotalCard label="Letzte 7 Tage"   bucket={data.totals.last7d}  />
            <TotalCard label="Letzte 30 Tage"  bucket={data.totals.last30d} />
            <TotalCard label="Gesamt"          bucket={data.totals.allTime} emphasis />
          </div>

          {/* Daily spend bars */}
          <SectionHeader icon={TrendingUp} title="Ausgaben · letzte 30 Tage" />
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 mb-10">
            <div className="flex items-end gap-1 h-32">
              {daily.map((d) => {
                const h = (d.micros / maxMicros) * 100;
                return (
                  <div
                    key={d.day}
                    title={`${d.day}: ${usd(d.micros)} (${d.calls} Calls)`}
                    className="flex-1 min-w-0 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t-md bg-forest/70 dark:bg-mint/70 hover:bg-forest dark:hover:bg-mint transition-colors"
                      style={{ height: `${Math.max(h, d.calls > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
              <span>{daily[0]?.day.slice(5) ?? ""}</span>
              <span>{daily[Math.floor(daily.length / 2)]?.day.slice(5) ?? ""}</span>
              <span>{daily[daily.length - 1]?.day.slice(5) ?? ""}</span>
            </div>
          </div>

          {/* Per-endpoint breakdown */}
          <SectionHeader icon={Sparkles} title="Nach Endpoint · letzte 30 Tage" />
          <div className="grid md:grid-cols-2 gap-3 mb-10">
            {Object.entries(data.byEndpoint).length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-400 text-center">
                Noch keine API-Calls in den letzten 30 Tagen.
              </div>
            )}
            {Object.entries(data.byEndpoint).map(([endpoint, bucket]) => {
              const meta = ENDPOINT_META[endpoint] ?? { label: endpoint, Icon: Sparkles, tint: "text-gray-700 bg-gray-100 border-gray-200" };
              const Icon = meta.Icon;
              return (
                <div key={endpoint} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-10 h-10 rounded-xl border flex items-center justify-center ${meta.tint}`}>
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{meta.label}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{endpoint}</p>
                    </div>
                    <p className="ml-auto text-xl font-mono font-semibold text-forest dark:text-mint">
                      {usd(bucket.micros)}
                    </p>
                  </div>
                  <dl className="grid grid-cols-4 gap-3 text-xs">
                    <Stat label="Calls"   value={nf(bucket.calls)}  />
                    <Stat label="Input"   value={nf(bucket.input)}  />
                    <Stat label="Output"  value={nf(bucket.output)} />
                    <Stat label="Bilder"  value={nf(bucket.images)} />
                  </dl>
                </div>
              );
            })}
          </div>

          {/* Top users */}
          <SectionHeader icon={Users} title="Top Nutzer · letzte 30 Tage" />
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden mb-10">
            {data.topUsers.length === 0 ? (
              <div className="p-6 text-sm text-gray-400 text-center">Noch keine Nutzer-Aktivität.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-[11px] uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="text-left  px-4 py-2.5">Nutzer</th>
                    <th className="text-right px-4 py-2.5">Calls</th>
                    <th className="text-right px-4 py-2.5 hidden sm:table-cell">Input</th>
                    <th className="text-right px-4 py-2.5 hidden sm:table-cell">Output</th>
                    <th className="text-right px-4 py-2.5 hidden md:table-cell">Bilder</th>
                    <th className="text-right px-4 py-2.5">Kosten</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.topUsers.map((u) => (
                    <tr key={u.userId} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-2.5 truncate max-w-[220px]">
                        <span className="text-gray-900 dark:text-gray-100">{u.email ?? "—"}</span>
                        <span className="block text-[10px] text-gray-400 font-mono truncate">{u.userId.slice(0, 8)}…</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">{nf(u.bucket.calls)}</td>
                      <td className="px-4 py-2.5 text-right font-mono hidden sm:table-cell">{nf(u.bucket.input)}</td>
                      <td className="px-4 py-2.5 text-right font-mono hidden sm:table-cell">{nf(u.bucket.output)}</td>
                      <td className="px-4 py-2.5 text-right font-mono hidden md:table-cell">{nf(u.bucket.images)}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-forest dark:text-mint">{usd(u.bucket.micros)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent calls */}
          <SectionHeader icon={Coins} title="Letzte Calls" />
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            {data.recent.length === 0 ? (
              <div className="p-6 text-sm text-gray-400 text-center">Noch keine API-Calls aufgezeichnet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-[11px] uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="text-left  px-4 py-2.5">Wann</th>
                    <th className="text-left  px-4 py-2.5">Endpoint</th>
                    <th className="text-left  px-4 py-2.5 hidden sm:table-cell">Modell</th>
                    <th className="text-right px-4 py-2.5 hidden md:table-cell">Input</th>
                    <th className="text-right px-4 py-2.5 hidden md:table-cell">Output</th>
                    <th className="text-right px-4 py-2.5 hidden md:table-cell">Bilder</th>
                    <th className="text-right px-4 py-2.5">Kosten</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.recent.map((r) => {
                    const meta = ENDPOINT_META[r.endpoint];
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{timeAgo(r.createdAt)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${meta?.tint ?? "text-gray-600 bg-gray-100 border-gray-200"}`}>
                            {meta?.label ?? r.endpoint}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 font-mono text-[12px] hidden sm:table-cell">{r.model}</td>
                        <td className="px-4 py-2.5 text-right font-mono hidden md:table-cell">{nf(r.inputTokens)}</td>
                        <td className="px-4 py-2.5 text-right font-mono hidden md:table-cell">{nf(r.outputTokens)}</td>
                        <td className="px-4 py-2.5 text-right font-mono hidden md:table-cell">{nf(r.imageCount)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-forest dark:text-mint">{usd(r.costMicros)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <p className="text-[11px] text-gray-400 mt-4 text-center">
            Daten seit Aktivierung der Usage-Logs · geschätzte Kosten nach aktuellem OpenAI-Preisblatt (medium quality, 1024×1024 Renders)
          </p>
        </>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-forest dark:text-mint" strokeWidth={1.5} />
      <h2 className="font-headline text-lg text-forest dark:text-mint">{title}</h2>
    </div>
  );
}

function TotalCard({ label, bucket, emphasis }: { label: string; bucket: Bucket; emphasis?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${emphasis ? "border-mint/50 bg-gradient-to-br from-mint/8 to-forest/5 dark:from-mint/15 dark:to-forest/20" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"}`}>
      <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="font-mono text-2xl font-semibold text-forest dark:text-mint tracking-tight">
        {usd(bucket.micros)}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {nf(bucket.calls)} Calls · {nf(bucket.input + bucket.output)} Tokens · {nf(bucket.images)} Bilder
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className="font-mono text-sm text-gray-900 dark:text-gray-100 mt-0.5">{value}</dd>
    </div>
  );
}
