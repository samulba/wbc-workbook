"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  badge?:  "feedback-unread";
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
      { href: "/admin/user",      label: "Benutzer",    Icon: Users,         enabled: true  },
      { href: "/admin/emails",    label: "Email-Liste", Icon: Mail,          enabled: true  },
      { href: "/admin/coaching",  label: "Coaching",    Icon: PhoneCall,     enabled: true  },
      { href: "/admin/feedback",  label: "Feedback",    Icon: MessageSquare, enabled: true,  badge: "feedback-unread" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/analytics", label: "Analytics",    Icon: BarChart3,      enabled: true  },
      { href: "/admin/status",    label: "System-Status",Icon: Activity,       enabled: true  },
      { href: "/admin/errors",    label: "Error-Logs",   Icon: AlertTriangle,  enabled: true  },
      { href: "/admin/backups",   label: "Backups",      Icon: DatabaseBackup, enabled: true  },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminSidebarNav() {
  const pathname = usePathname();
  const [unreadFeedback, setUnreadFeedback] = useState(0);

  useEffect(() => {
    fetch("/api/admin/feedback/unread-count")
      .then((r) => r.json())
      .then((d) => setUnreadFeedback(d.count ?? 0))
      .catch(() => {});
  }, []);

  return (
    <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="px-3 mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 select-none">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map(({ href, label, Icon, exact, enabled, badge }) => {
              const isActive   = exact ? pathname === href : pathname.startsWith(href);
              const badgeCount = badge === "feedback-unread" ? unreadFeedback : 0;

              if (!enabled) {
                return (
                  <div
                    key={href}
                    className="flex items-center gap-3 px-3 h-9 rounded-md opacity-40 cursor-not-allowed select-none"
                  >
                    <Icon className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{label}</span>
                    <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-medium">
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
                    "flex items-center gap-3 px-3 h-9 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive
                        ? "text-gray-700 dark:text-gray-200"
                        : "text-gray-400 dark:text-gray-500"
                    )}
                    strokeWidth={1.5}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {badgeCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
