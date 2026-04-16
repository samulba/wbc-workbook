"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  PhoneCall,
  Users,
  BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href:     "/admin",
    label:    "Dashboard",
    Icon:     LayoutDashboard,
    exact:    true,
    enabled:  true,
  },
  {
    href:     "/admin/produkte",
    label:    "Produkte",
    Icon:     ShoppingBag,
    exact:    false,
    enabled:  true,
  },
  {
    href:     "/admin/coaching",
    label:    "Coaching",
    Icon:     PhoneCall,
    exact:    false,
    enabled:  true,
  },
  {
    href:     "/admin/user",
    label:    "Benutzer",
    Icon:     Users,
    exact:    false,
    enabled:  false,
  },
  {
    href:     "/admin/analytics",
    label:    "Analytics",
    Icon:     BarChart3,
    exact:    false,
    enabled:  false,
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {NAV_ITEMS.map(({ href, label, Icon, exact, enabled }) => {
        const isActive = exact
          ? pathname === href
          : pathname.startsWith(href);

        if (!enabled) {
          return (
            <div
              key={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-35 cursor-not-allowed"
            >
              <Icon className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
              <span className="text-sm text-slate-400">{label}</span>
              <span className="ml-auto text-[10px] text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
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
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
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
    </nav>
  );
}
