import { getAdminStats } from "@/app/actions/products";
import Link from "next/link";
import { ShoppingBag, Users, FolderOpen, TrendingUp, Plus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const STAT_CARDS = [
    {
      label: "Produkte gesamt",
      value: stats.products,
      sub:   `${stats.activeProducts} aktiv`,
      Icon:  ShoppingBag,
      href:  "/admin/produkte",
      iconColor: "text-forest",
      iconBg:    "bg-forest/10 dark:bg-forest/20",
    },
    {
      label: "Aktive Produkte",
      value: stats.activeProducts,
      sub:   `${stats.products - stats.activeProducts} inaktiv`,
      Icon:  TrendingUp,
      href:  "/admin/produkte",
      iconColor: "text-mint",
      iconBg:    "bg-mint/20 dark:bg-mint/20",
    },
    {
      label: "Benutzer",
      value: stats.users,
      sub:   "registrierte Accounts",
      Icon:  Users,
      href:  "/admin/user",
      iconColor: "text-terracotta",
      iconBg:    "bg-terracotta/10 dark:bg-terracotta/20",
    },
    {
      label: "Projekte",
      value: stats.projects,
      sub:   "alle Projekte",
      Icon:  FolderOpen,
      href:  "#",
      iconColor: "text-sand",
      iconBg:    "bg-sand/20 dark:bg-sand/20",
    },
  ];

  const QUICK_LINKS = [
    {
      label:   "Neues Produkt anlegen",
      desc:    "Produkt mit Affiliate-Link hinzufügen",
      href:    "/admin/produkte/neu",
      primary: true,
      Icon:    Plus,
    },
    {
      label:   "Alle Produkte",
      desc:    "Produkte verwalten, filtern und bearbeiten",
      href:    "/admin/produkte",
      primary: false,
      Icon:    ArrowRight,
    },
  ];

  return (
    <div className="max-w-5xl space-y-8">

      {/* Page heading */}
      <div>
        <h2 className="text-xl font-semibold text-forest dark:text-mint">Übersicht</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Willkommen im Admin-Bereich.</p>
      </div>

      {/* Stats grid */}
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

      {/* Quick links */}
      <div>
        <h3 className="text-xs font-semibold text-forest/70 dark:text-mint/60 uppercase tracking-wider mb-3">
          Schnellzugriff
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {QUICK_LINKS.map(({ label, desc, href, primary, Icon }) => (
            <Link
              key={label}
              href={href}
              className={`rounded-xl border px-5 py-4 transition-all flex items-start justify-between gap-4 group ${
                primary
                  ? "bg-forest text-white border-forest hover:bg-forest/90"
                  : "bg-cream dark:bg-gray-800 text-forest dark:text-gray-200 border-forest/20 dark:border-gray-700 hover:border-forest/40 dark:hover:border-mint/40 hover:shadow-sm"
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${primary ? "text-white" : "text-forest dark:text-gray-100"}`}>
                  {label}
                </p>
                <p className={`text-xs mt-1 ${primary ? "text-white/70" : "text-forest/60 dark:text-gray-500"}`}>
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
    </div>
  );
}
