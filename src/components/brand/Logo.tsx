/**
 * GrantPilot Logo System
 *
 * The Mark: A circular lens/compass containing three ascending chevrons
 * (motion trail effect) with a central AI spark node and orbiting data points.
 * Represents: navigation through funding → upward trajectory → AI intelligence.
 *
 * Variants:
 * - mark: Icon only (favicons, compact spaces)
 * - wordmark: Text only
 * - full: Mark + wordmark (default)
 *
 * The animated variant adds a subtle breathing glow and rotating orbit.
 */

interface LogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light";
  animated?: boolean;
  className?: string;
}

const SIZES = {
  xs: { mark: 20, fontSize: "text-sm", gap: "gap-1.5" },
  sm: { mark: 28, fontSize: "text-base", gap: "gap-2" },
  md: { mark: 36, fontSize: "text-xl", gap: "gap-2.5" },
  lg: { mark: 48, fontSize: "text-2xl", gap: "gap-3" },
  xl: { mark: 64, fontSize: "text-3xl", gap: "gap-4" },
};

export function GrantPilotMark({
  size = 36,
  animated = false,
  className = "",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const id = `gp-${size}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="64" x2="64" y2="0">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="70%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id={`${id}-hi`} x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.08" />
        </linearGradient>
        <radialGradient id={`${id}-depth`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
        </radialGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {animated && (
          <filter id={`${id}-pulse`}>
            <feGaussianBlur stdDeviation="2">
              <animate attributeName="stdDeviation" values="1.5;2.5;1.5" dur="3s" repeatCount="indefinite" />
            </feGaussianBlur>
            <feComposite in="SourceGraphic" in2="" operator="over" />
          </filter>
        )}
      </defs>

      {/* Squircle background */}
      <rect x="1" y="1" width="62" height="62" rx="18" fill={`url(#${id}-bg)`} />
      <rect x="1" y="1" width="62" height="62" rx="18" fill={`url(#${id}-depth)`} />
      <rect x="1" y="1" width="62" height="62" rx="18" fill={`url(#${id}-hi)`} />

      {/* The Mark */}
      <g filter={`url(#${id}-glow)`}>
        {/* Compass ring */}
        <circle cx="32" cy="32" r="19" stroke="white" strokeWidth="2.5" strokeOpacity="0.9" fill="none" />

        {/* Triple ascending chevrons — motion trail */}
        <path d="M22 38 L32 30 L42 38" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" fill="none" />
        <path d="M24 33 L32 25 L40 33" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" fill="none" />
        <path d="M26 28 L32 20 L38 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95" fill="none">
          {animated && (
            <animate attributeName="strokeOpacity" values="0.95;1;0.95" dur="2s" repeatCount="indefinite" />
          )}
        </path>

        {/* Central AI spark */}
        <circle cx="32" cy="31" r="2.5" fill="white" fillOpacity="0.95">
          {animated && (
            <animate attributeName="r" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
          )}
        </circle>

        {/* Orbiting data points */}
        <circle cx="20" cy="25" r="1.2" fill="white" fillOpacity="0.5">
          {animated && (
            <animate attributeName="fillOpacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx="44" cy="25" r="1.2" fill="white" fillOpacity="0.5">
          {animated && (
            <animate attributeName="fillOpacity" values="0.5;0.8;0.5" dur="3s" begin="1s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx="32" cy="46" r="1" fill="white" fillOpacity="0.3">
          {animated && (
            <animate attributeName="fillOpacity" values="0.3;0.6;0.3" dur="3s" begin="2s" repeatCount="indefinite" />
          )}
        </circle>
      </g>

      {/* Inner border highlight */}
      <rect x="2" y="2" width="60" height="60" rx="17" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

export function Logo({
  variant = "full",
  size = "md",
  theme = "dark",
  animated = false,
  className = "",
}: LogoProps) {
  const s = SIZES[size];
  const textColor = theme === "dark" ? "text-white" : "text-slate-900";

  if (variant === "mark") {
    return <GrantPilotMark size={s.mark} animated={animated} className={className} />;
  }

  if (variant === "wordmark") {
    return (
      <span className={`font-bold ${s.fontSize} ${textColor} ${className}`}>
        Grant<span className="text-emerald-400">Pilot</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <GrantPilotMark size={s.mark} animated={animated} />
      <span className={`font-bold ${s.fontSize} ${textColor}`}>
        Grant<span className="text-emerald-400">Pilot</span>
      </span>
    </span>
  );
}

export default Logo;
