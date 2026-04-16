import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, placeholder, options, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-forest">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              // h-12 = 48px touch target; text-base = 16px prevents iOS zoom
              "h-12 w-full appearance-none rounded-lg border border-sand/60 bg-cream px-3 pr-9 text-base text-forest",
              "focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50",
              !props.value && "text-gray/50",
              error && "border-terracotta focus:ring-terracotta",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray/50" />
        </div>
        {error && <p className="text-xs text-terracotta">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
