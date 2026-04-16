"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, FolderOpen, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  favoriteCount: number;
}

const NAV_ITEMS = [
  { href: "/dashboard",           label: "Projekte",  Icon: FolderOpen, exact: true  },
  { href: "/dashboard/favoriten", label: "Favoriten", Icon: Heart,      exact: false },
  { href: "/dashboard/coaching",  label: "Coaching",  Icon: PhoneCall,  exact: false },
] as const;

export function DashboardNav({ favoriteCount }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex items-stretch h-full gap-0.5">
      {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        const isFav    = href === "/dashboard/favoriten";

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 px-3 text-sm font-sans font-medium transition-colors",
              "border-b-2 whitespace-nowrap",
              isActive
                ? "border-forest text-forest"
                : "border-transparent text-gray/55 hover:text-forest hover:border-forest/25"
            )}
          >
            <Icon
              className={cn(
                "w-3.5 h-3.5 shrink-0",
                isFav && isActive ? "fill-terracotta text-terracotta" : ""
              )}
              strokeWidth={isFav && isActive ? 0 : 1.5}
            />
            <span>{label}</span>
            {isFav && favoriteCount > 0 && (
              <span
                className={cn(
                  "min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold leading-none flex items-center justify-center",
                  isActive
                    ? "bg-terracotta text-white"
                    : "bg-sand/35 text-forest/70"
                )}
              >
                {favoriteCount > 99 ? "99+" : favoriteCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
