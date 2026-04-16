import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-forest"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            // h-12 = 48px touch target; text-base = 16px prevents iOS zoom
            "h-12 w-full rounded-lg border border-sand/60 bg-cream px-3 text-base text-forest placeholder:text-gray/50",
            "focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-terracotta focus:ring-terracotta",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-terracotta">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
