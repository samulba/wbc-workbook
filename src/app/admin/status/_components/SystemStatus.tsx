"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Globe,
  Bot,
  Server,
  Info,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ServiceStatus = "ok" | "warn" | "error" | "unknown";

interface Service {
  status:  ServiceStatus;
  label:   string;
  detail?: string;
  latency?: number;
}

interface StatusData {
  checkedAt: string;
  services: {
    supabase: Service;
    vercel:   Service;
    openai:   Service;
  };
  info: {
    appVersion:   string;
    nodeVersion:  string;
    nextVersion:  string;
    dbTableCount: number;
    platform:     string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ServiceStatus, { color: string; bg: string; border: string; Icon: React.ElementType; label: string }> = {
  ok:      { color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-950/30",  border: "border-green-200 dark:border-green-800",  Icon: CheckCircle2,   label: "Betrieb" },
  warn:    { color: "text-yellow-600 dark:text-yellow-400",bg: "bg-yellow-50 dark:bg-yellow-950/30",border: "border-yellow-200 dark:border-yellow-800",Icon: AlertTriangle,  label: "Warnung" },
  error:   { color: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-950/30",      border: "border-red-200 dark:border-red-800",      Icon: XCircle,        label: "Fehler"  },
  unknown: { color: "text-gray-500 dark:text-gray-400",    bg: "bg-gray-50 dark:bg-gray-800",        border: "border-gray-200 dark:border-gray-700",    Icon: AlertTriangle,  label: "Unbekannt" },
};

const SERVICE_ICONS: Record<string, React.ElementType> = {
  supabase: Database,
  vercel:   Globe,
  openai:   Bot,
};

const SERVICE_LABELS: Record<string, string> = {
  supabase: "Supabase (DB)",
  vercel:   "Vercel",
  openai:   "OpenAI (Analyse & Rendering)",
};

function overallStatus(services: StatusData["services"]): ServiceStatus {
  const statuses = Object.values(services).map((s) => s.status);
  if (statuses.includes("error"))   return "error";
  if (statuses.includes("warn"))    return "warn";
  if (statuses.includes("unknown")) return "warn";
  return "ok";
}

function relativeTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5)   return "gerade eben";
  if (diff < 60)  return `vor ${diff}s`;
  if (diff < 3600) return `vor ${Math.floor(diff / 60)}min`;
  return new Date(iso).toLocaleTimeString("de-DE");
}

// ── ServiceCard ───────────────────────────────────────────────────────────────

function ServiceCard({ name, service }: { name: string; service: Service }) {
  const cfg        = STATUS_CONFIG[service.status];
  const StatusIcon = cfg.Icon;
  const ServiceIcon = SERVICE_ICONS[name] ?? Server;

  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ServiceIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
          <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
            {SERVICE_LABELS[name] ?? service.label}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
          <StatusIcon className="w-4 h-4" />
          {cfg.label}
        </div>
      </div>

      {service.detail && (
        <p className="text-xs text-gray-600 dark:text-gray-400">{service.detail}</p>
      )}

      {service.latency !== undefined && (
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Latenz: <span className="font-mono">{service.latency}ms</span>
        </p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SystemStatus() {
  const [data,    setData]    = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/system-status");
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6 text-center">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        <button onClick={load} className="mt-3 text-sm text-red-500 underline">
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!data) return null;

  const overall    = overallStatus(data.services);
  const overallCfg = STATUS_CONFIG[overall];
  const OverallIcon = overallCfg.Icon;

  return (
    <div className="space-y-6">
      {/* Overall Banner */}
      <div className={`rounded-xl border p-5 flex items-center gap-4 ${overallCfg.bg} ${overallCfg.border}`}>
        <OverallIcon className={`w-8 h-8 ${overallCfg.color}`} />
        <div className="flex-1">
          <p className={`text-lg font-bold ${overallCfg.color}`}>
            {overall === "ok"    && "Alle Systeme in Betrieb"}
            {overall === "warn"  && "Achtung: Teilweise Einschränkungen"}
            {overall === "error" && "Kritischer Fehler erkannt"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Zuletzt geprüft: {relativeTime(data.checkedAt)}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Aktualisieren
        </button>
      </div>

      {/* Service Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
          Dienste
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.entries(data.services) as [string, Service][]).map(([name, svc]) => (
            <ServiceCard key={name} name={name} service={svc} />
          ))}
        </div>
      </div>

      {/* System Info */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
          Systeminfo
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {[
            { label: "App-Version",   value: data.info.appVersion,              icon: Info   },
            { label: "Node.js",       value: data.info.nodeVersion,             icon: Server },
            { label: "Next.js",       value: data.info.nextVersion,             icon: Globe  },
            { label: "DB-Tabellen",   value: `${data.info.dbTableCount} Tabellen`, icon: Database },
            { label: "Plattform",     value: data.info.platform,               icon: Server },
          ].map(({ label, value, icon: Icon }, i, arr) => (
            <div
              key={label}
              className={`flex items-center gap-4 px-5 py-3 ${i < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
            >
              <Icon className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
              <span className="text-sm text-gray-500 dark:text-gray-400 w-32 shrink-0">{label}</span>
              <span className="text-sm font-mono text-gray-800 dark:text-gray-100">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
