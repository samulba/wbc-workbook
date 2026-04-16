"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-sans font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-forest text-cream hover:bg-forest/90 focus-visible:ring-forest",
      secondary:
        "bg-mint text-forest hover:bg-mint/80 focus-visible:ring-mint",
      ghost:
        "bg-transparent text-forest hover:bg-mint/20 focus-visible:ring-mint",
      danger:
        "bg-terracotta text-cream hover:bg-terracotta/90 focus-visible:ring-terracotta",
    };

    const sizes = {
      // sm: compact for admin tables / secondary actions
      sm: "h-9 px-3 text-sm",
      // md: primary touch target — 44px minimum
      md: "h-11 px-4 text-sm",
      // lg: prominent CTA
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
