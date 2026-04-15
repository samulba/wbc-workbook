import { cn } from "@/lib/utils";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
}: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-forest">{label}</span>
      )}
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all",
                checked
                  ? "border-forest bg-forest/5"
                  : "border-sand/50 bg-cream hover:border-mint hover:bg-mint/5"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {/* Custom radio dot */}
              <span
                className={cn(
                  "mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                  checked ? "border-forest" : "border-sand"
                )}
              >
                {checked && (
                  <span className="w-2 h-2 rounded-full bg-forest" />
                )}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium text-forest">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-gray/60 font-sans mt-0.5">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-terracotta">{error}</p>}
    </div>
  );
}
