interface Props {
  pct:         number;   // 0–100
  size?:       number;   // px, default 40
  stroke?:     number;   // stroke width, default 3
  showLabel?:  boolean;  // show percentage text inside
  labelSize?:  string;   // tailwind text class, default "text-[10px]"
}

/** SVG ring progress — rotated so arc starts at top */
export function CircleProgress({ pct, size = 40, stroke = 3, showLabel = true, labelSize = "text-[10px]" }: Props) {
  const r            = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset       = circumference - Math.min(pct, 100) / 100 * circumference;
  const isDone       = pct >= 100;
  const isHigh       = pct >= 50;
  const color        = isDone || isHigh ? "#445c49" : "#94c1a4";

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
        />
      </svg>
      {showLabel && (
        <span
          className={`absolute font-sans font-semibold leading-none ${labelSize}`}
          style={{ color }}
        >
          {pct >= 100 ? "✓" : `${pct}%`}
        </span>
      )}
    </div>
  );
}
