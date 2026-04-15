import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-forest">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full min-h-[100px] resize-none rounded-lg border border-sand/60 bg-cream px-3 py-2.5 text-sm text-forest leading-relaxed placeholder:text-gray/40",
            "focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors",
            error && "border-terracotta focus:ring-terracotta",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-gray/50 font-sans">{hint}</p>
        )}
        {error && <p className="text-xs text-terracotta">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
