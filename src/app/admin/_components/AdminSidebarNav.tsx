"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  Palette,
  HelpCircle,
  Users,
  Mail,
  PhoneCall,
  MessageSquare,
  BarChart3,
  Activity,
  AlertTriangle,
  DatabaseBackup,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  href:    string;
  label:   string;
  Icon:    React.ElementType;
  exact?:  boolean;
  enabled: boolean;
}

interface NavGroup {
  label?: string;
  items:  NavItem[];
}

// ── Nav structure ─────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true, enabled: true },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/produkte",    label: "Produkte",    Icon: ShoppingBag,    enabled: true  },
      { href: "/admin/inspiration", label: "Inspiration", Icon: Sparkles,       enabled: true  },
      { href: "/admin/farben",      label: "Farbpaletten",Icon: Palette,        enabled: true  },
      { href: "/admin/faq",         label: "FAQ",         Icon: HelpCircle,     enabled: true  },
    ],
  },
  {
    label: "Users",
    items: [
      { href: "/admin/user",      label: "Benutzer",    Icon: Users,          enabled: true  },
      { href: "/admin/emails",    label: "Email-Liste", Icon: Mail,           enabled: false },
      { href: "/admin/coaching",  label: "Coaching",    Icon: PhoneCall,      enabled: true  },
      { href: "/admin/feedback",  label: "Feedback",    Icon: MessageSquare,  enabled: false },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/analytics", label: "Analytics",    Icon: BarChart3,       enabled: true  },
      { href: "/admin/status",    label: "System-Status",Icon: Activity,        enabled: false },
      { href: "/admin/errors",    label: "Error-Logs",   Icon: AlertTriangle,   enabled: false },
      { href: "/admin/backups",   label: "Backups",      Icon: DatabaseBackup,  enabled: false },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 select-none">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map(({ href, label, Icon, exact, enabled }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href);

              if (!enabled) {
                return (
                  <div
                    key={href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-30 cursor-not-allowed select-none"
                  >
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.5} />
                    <span className="text-sm text-slate-400 flex-1">{label}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-700/60 px-1.5 py-0.5 rounded">
                      Bald
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-white/12 text-white border-l-2 border-mint pl-[10px]"
                      : "text-slate-400 hover:bg-white/8 hover:text-slate-200"
                  )}
                >
                  <Icon
                    className={cn("w-4 h-4 shrink-0", isActive ? "text-mint" : "")}
                    strokeWidth={1.5}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
