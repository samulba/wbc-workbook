import { getAdminStats } from "@/app/actions/products";
import Link from "next/link";
import { ShoppingBag, Users, FolderOpen, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const STAT_CARDS = [
    {
      label:    "Produkte gesamt",
      value:    stats.products,
      sub:      `${stats.activeProducts} aktiv`,
      Icon:     ShoppingBag,
      href:     "/admin/produkte",
      color:    "text-forest",
      bg:       "bg-forest/8",
      border:   "border-forest/15",
    },
    {
      label:    "Aktive Produkte",
      value:    stats.activeProducts,
      sub:      `${stats.products - stats.activeProducts} inaktiv`,
      Icon:     TrendingUp,
      href:     "/admin/produkte",
      color:    "text-emerald-600",
      bg:       "bg-emerald-50",
      border:   "border-emerald-100",
    },
    {
      label:    "Benutzer",
      value:    stats.users,
      sub:      "registrierte Accounts",
      Icon:     Users,
      href:     "#",
      color:    "text-blue-600",
      bg:       "bg-blue-50",
      border:   "border-blue-100",
    },
    {
      label:    "Projekte",
      value:    stats.projects,
      sub:      "alle Projekte",
      Icon:     FolderOpen,
      href:     "#",
      color:    "text-amber-600",
      bg:       "bg-amber-50",
      border:   "border-amber-100",
    },
  ];

  const QUICK_LINKS = [
    {
      label:   "Neues Produkt anlegen",
      desc:    "Produkt mit Affiliate-Link hinzufügen",
      href:    "/admin/produkte/neu",
      primary: true,
    },
    {
      label:   "Alle Produkte",
      desc:    "Produkte verwalten, filtern und bearbeiten",
      href:    "/admin/produkte",
      primary: false,
    },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Übersicht</h2>
        <p className="text-sm text-slate-500 mt-1">Willkommen im Admin-Bereich.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, sub, Icon, href, color, bg, border }) => (
          <Link
            key={label}
            href={href}
            className={`rounded-xl border ${border} bg-white p-5 hover:shadow-sm transition-shadow group`}
          >
            <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
            <p className="text-xs font-medium text-slate-600 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
          Schnellzugriff
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {QUICK_LINKS.map(({ label, desc, href, primary }) => (
            <Link
              key={label}
              href={href}
              className={`rounded-xl border px-5 py-4 transition-all ${
                primary
                  ? "bg-forest text-white border-forest hover:bg-forest/90"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <p className={`text-sm font-semibold ${primary ? "text-white" : "text-slate-800"}`}>
                {label}
              </p>
              <p className={`text-xs mt-1 ${primary ? "text-white/70" : "text-slate-400"}`}>
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
