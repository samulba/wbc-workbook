import Link from "next/link";
import {
  ShoppingBag, Users, FolderOpen, TrendingUp, Plus,
  Images, Home, PhoneCall, MessageSquare, Coins, Activity, AlertTriangle,
  CheckCircle2, Clock, Sparkles,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { formatUsd } from "@/lib/ai/pricing";

export const dynamic = "force-dynamic";

type RecentProject = {
  id:         string;
  name:       string;
  created_at: string;
  user_id:    string;
};

type RecentBooking = {
  id:           string;
  booking_date: string;
  booking_time: string;
  status:       string;
  created_at:   string;
};

async function getDashboardData() {
  const admin = createAdminClient();

  const [
    productCounts,
    userCount,
    projectCount,
    roomCount,
    inspirationCount,
    feedbackCount,
    unreadFeedbackCount,
    coachingPendingCount,
    recentProjects,
    recentBookings,
    aiUsageToday,
    errorCount24h,
  ] = await Promise.all([
    admin.from("products").select("is_active", { count: "exact" }),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("projects").select("*", { count: "exact", head: true }),
    admin.from("rooms").select("*", { count: "exact", head: true }),
    admin.from("inspiration_images").select("*", { count: "exact", head: true }),
    admin.from("user_feedback").select("*", { count: "exact", head: true }),
    admin.from("user_feedback").select("*", { count: "exact", head: true }).eq("status", "neu"),
    admin.from("coaching_bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("projects").select("id, name, created_at, user_id").order("created_at", { ascending: false }).limit(5),
    admin.from("coaching_bookings")
      .select("id, booking_date, booking_time, status, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    admin.from("ai_usage")
      .select("cost_micros")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    admin.from("error_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const products       = productCounts.count ?? 0;
  const activeProducts = (productCounts.data ?? []).filter((p) => p.is_active).length;

  const aiCostTodayMicros = (aiUsageToday.data ?? [])
    .reduce((sum, row) => sum + ((row as { cost_micros: number }).cost_micros ?? 0), 0);

  return {
    products,
    activeProducts,
    users:             userCount.count       ?? 0,
    projects:          projectCount.count    ?? 0,
    rooms:             roomCount.count       ?? 0,
    inspiration:       inspirationCount.count ?? 0,
    feedback:          feedbackCount.count   ?? 0,
    unreadFeedback:    unreadFeedbackCount.count ?? 0,
    coachingPending:   coachingPendingCount.count ?? 0,
    recentProjects:    (recentProjects.data  ?? []) as RecentProject[],
    recentBookings:    (recentBookings.data  ?? []) as RecentBooking[],
    aiCostTodayMicros,
    aiCallsToday:      (aiUsageToday.data    ?? []).length,
    errorsLast24h:     errorCount24h.count   ?? 0,
  };
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins   = Math.floor(diffMs / 60_000);
  if (mins < 1)    return "gerade eben";
  if (mins < 60)   return `vor ${mins} Min`;
  const hours    = Math.floor(mins / 60);
  if (hours < 24)  return `vor ${hours} Std`;
  const days     = Math.floor(hours / 24);
  if (days < 7)    return `vor ${days} Tag${days === 1 ? "" : "en"}`;
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

export default async function AdminDashboardPage() {
  const d = await getDashboardData();

  const STAT_CARDS = [
    {
      label: "Produkte",
      value: d.products,
      sub:   `${d.activeProducts} aktiv · ${d.products - d.activeProducts} inaktiv`,
      Icon:  ShoppingBag,
      href:  "/admin/produkte",
      iconColor: "text-forest dark:text-mint",
      iconBg:    "bg-forest/10 dark:bg-mint/20",
    },
    {
      label: "Benutzer",
      value: d.users,
      sub:   "registrierte Accounts",
      Icon:  Users,
      href:  "/admin/user",
      iconColor: "text-terracotta",
      iconBg:    "bg-terracotta/10 dark:bg-terracotta/20",
    },
    {
      label: "Projekte",
      value: d.projects,
      sub:   `${d.rooms} Räume gesamt`,
      Icon:  FolderOpen,
      href:  "/admin/user",
      iconColor: "text-sand",
      iconBg:    "bg-sand/20 dark:bg-sand/20",
    },
    {
      label: "Inspirations-Bilder",
      value: d.inspiration,
      sub:   "im Kuratierten-Pool",
      Icon:  Images,
      href:  "/admin/inspiration",
      iconColor: "text-mint",
      iconBg:    "bg-mint/20 dark:bg-mint/20",
    },
  ];

  const ACTIVITY_CARDS = [
    {
      label:      "Coaching offen",
      value:      d.coachingPending,
      sub:        d.coachingPending === 1 ? "Anfrage wartet auf Bestätigung" : "Anfragen warten",
      Icon:       PhoneCall,
      href:       "/admin/coaching",
      tint:       d.coachingPending > 0 ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300" : undefined,
    },
    {
      label:      "Feedback ungelesen",
      value:      d.unreadFeedback,
      sub:        `von ${d.feedback} gesamt`,
      Icon:       MessageSquare,
      href:       "/admin/feedback",
      tint:       d.unreadFeedback > 0 ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300" : undefined,
    },
    {
      label:      "AI-Kosten heute",
      value:      formatUsd(d.aiCostTodayMicros),
      sub:        `${d.aiCallsToday} API-Calls`,
      Icon:       Coins,
      href:       "/admin/ai-usage",
    },
    {
      label:      "Fehler (24h)",
      value:      d.errorsLast24h,
      sub:        d.errorsLast24h === 0 ? "Alles clean" : "Zum Error-Log",
      Icon:       AlertTriangle,
      href:       "/admin/errors",
      tint:       d.errorsLast24h > 0 ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300" : undefined,
    },
  ];

  const QUICK_LINKS = [
    { label: "Neues Produkt anlegen",  desc: "Produkt mit Affiliate-Link hinzufügen", href: "/admin/produkte/neu", primary: true,  Icon: Plus      },
    { label: "Bild zu Inspiration",    desc: "Inspirations-Pool erweitern",           href: "/admin/inspiration",  primary: false, Icon: Images    },
    { label: "Analytics öffnen",       desc: "Deep-Dive über Nutzerverhalten",        href: "/admin/analytics",    primary: false, Icon: TrendingUp },
    { label: "System-Status prüfen",   desc: "ENV-Vars, API-Keys, Connectivity",      href: "/admin/status",       primary: false, Icon: Activity   },
  ];

  return (
    <div className="max-w-6xl space-y-8">

      {/* Page heading */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-forest dark:text-mint">Übersicht</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Willkommen im Admin-Bereich · {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link
          href="/admin/status"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-forest dark:hover:text-mint transition-colors"
        >
          <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
          System OK
        </Link>
      </div>

      {/* Core stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, sub, Icon, href, iconColor, iconBg }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all group"
          >
            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center mb-4`}>
              <Icon className={`w-[18px] h-[18px] ${iconColor}`} strokeWidth={1.5} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums leading-none">
              {value}
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Activity / attention */}
      <div>
        <h3 className="text-xs font-semibold text-forest/70 dark:text-mint/60 uppercase tracking-wider mb-3">
          Aufmerksamkeit & Kosten
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTIVITY_CARDS.map(({ label, value, sub, Icon, href, tint }) => (
            <Link
              key={label}
              href={href}
              className={tint
                ? `rounded-xl border p-4 hover:shadow-md transition-all ${tint}`
                : "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              }
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span className="text-[11px] font-medium uppercase tracking-wider opacity-80">
                  {label}
                </span>
              </div>
              <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
              <p className={`text-xs mt-1 ${tint ? "opacity-80" : "text-gray-400 dark:text-gray-500"}`}>
                {sub}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity two-column */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent projects */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Zuletzt erstellte Projekte</h3>
            <Link href="/admin/user" className="text-xs text-forest/70 dark:text-mint/70 hover:text-forest dark:hover:text-mint">
              Alle Benutzer →
            </Link>
          </div>
          {d.recentProjects.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <FolderOpen className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-gray-400 dark:text-gray-500">Noch keine Projekte</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {d.recentProjects.map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forest/8 dark:bg-mint/20 border border-forest/15 dark:border-mint/30 flex items-center justify-center shrink-0">
                    <Home className="w-3.5 h-3.5 text-forest dark:text-mint" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{formatRelativeTime(p.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent coaching */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Zuletzt eingegangen: Coaching</h3>
            <Link href="/admin/coaching" className="text-xs text-forest/70 dark:text-mint/70 hover:text-forest dark:hover:text-mint">
              Alle →
            </Link>
          </div>
          {d.recentBookings.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <PhoneCall className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm text-gray-400 dark:text-gray-500">Noch keine Coaching-Anfragen</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {d.recentBookings.map((b) => {
                const statusTone = b.status === "pending"   ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                 : b.status === "confirmed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                 : b.status === "completed" ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                 :                            "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300";
                const statusLabel = b.status === "pending" ? "Angefragt" : b.status === "confirmed" ? "Bestätigt" : b.status === "completed" ? "Abgeschlossen" : "Storniert";
                return (
                  <div key={b.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sand/15 dark:bg-sand/20 border border-sand/30 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#8a6030] dark:text-sand" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusTone}`}>
                          {statusLabel}
                        </span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(b.booking_date + "T00:00").toLocaleDateString("de-DE", { day: "numeric", month: "short" })} · {b.booking_time}
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Erstellt {formatRelativeTime(b.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h3 className="text-xs font-semibold text-forest/70 dark:text-mint/60 uppercase tracking-wider mb-3">
          Schnellzugriff
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ label, desc, href, primary, Icon }) => (
            <Link
              key={label}
              href={href}
              className={`rounded-xl border px-4 py-4 transition-all flex items-start justify-between gap-3 group ${
                primary
                  ? "bg-forest text-white border-forest hover:bg-forest/90"
                  : "bg-white dark:bg-gray-800 text-forest dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-forest/40 dark:hover:border-mint/40 hover:shadow-sm"
              }`}
            >
              <div className="min-w-0">
                <p className={`text-sm font-semibold leading-tight ${primary ? "text-white" : "text-forest dark:text-gray-100"}`}>
                  {label}
                </p>
                <p className={`text-[11px] mt-1 ${primary ? "text-white/70" : "text-gray-500 dark:text-gray-500"}`}>
                  {desc}
                </p>
              </div>
              <Icon
                className={`w-4 h-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 ${
                  primary ? "text-white/80" : "text-forest/50 dark:text-gray-500"
                }`}
                strokeWidth={1.5}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Footer tip */}
      <div className="rounded-xl border border-dashed border-sand/40 bg-sand/5 dark:bg-sand/10 px-5 py-3 flex items-center gap-2.5">
        <Sparkles className="w-3.5 h-3.5 text-sand shrink-0" strokeWidth={1.75} />
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Tipp: Die AI-Usage-Seite zeigt dir pro Feature (Analyse, Render, Light-Studio) die genauen Kosten im Zeitverlauf.
        </p>
      </div>
    </div>
  );
}
