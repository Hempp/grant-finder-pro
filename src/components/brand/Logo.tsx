/**
 * GrantPilot Logo System
 *
 * Three variants:
 * - Logomark: The icon alone (for favicons, app icons, compact spaces)
 * - Logotype: The wordmark alone
 * - Logo: Logomark + Logotype combined (default)
 *
 * The mark is a stylized compass-arrow: an upward-pointing chevron
 * (growth/funding) with a central spark node (AI intelligence) and
 * radiating facets (navigation/discovery). It reads as "guided upward"
 * at a glance.
 */

interface LogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light";
  className?: string;
}

const SIZES = {
  xs: { mark: 20, height: 20, wordSize: 14, gap: 4 },
  sm: { mark: 28, height: 28, wordSize: 18, gap: 6 },
  md: { mark: 36, height: 36, wordSize: 22, gap: 8 },
  lg: { mark: 48, height: 48, wordSize: 30, gap: 10 },
  xl: { mark: 64, height: 64, wordSize: 40, gap: 14 },
};

export function GrantPilotMark({ size = 36, className = "" }: { size?: number; className?: string }) {
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
        {/* Brand gradient: emerald → teal → cyan */}
        <linearGradient id="gp-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        {/* Subtle inner glow */}
        <radialGradient id="gp-glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        {/* Shadow filter */}
        <filter id="gp-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Background rounded square */}
      <rect
        x="2" y="2" width="60" height="60" rx="16"
        fill="url(#gp-grad)"
        filter="url(#gp-shadow)"
      />

      {/* Inner glow layer */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#gp-glow)" />

      {/* The Mark: Upward compass-arrow with spark */}
      <g transform="translate(32, 32)">
        {/* Main upward chevron — the "pilot" arrow */}
        <path
          d="M0 -18 L14 4 L8 4 L8 18 L-8 18 L-8 4 L-14 4 Z"
          fill="white"
          fillOpacity="0.95"
        />

        {/* Spark node at center — the "AI" element */}
        <circle cx="0" cy="2" r="3.5" fill="white" />

        {/* Small radiating facets — "discovery" rays */}
        <line x1="-12" y1="-6" x2="-17" y2="-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
        <line x1="12" y1="-6" x2="17" y2="-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
        <line x1="-10" y1="10" x2="-15" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
        <line x1="10" y1="10" x2="15" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
      </g>
    </svg>
  );
}

export function GrantPilotWordmark({
  size = 22,
  theme = "dark",
  className = "",
}: {
  size?: number;
  theme?: "dark" | "light";
  className?: string;
}) {
  const textColor = theme === "dark" ? "white" : "#0f172a";
  const accentColor = "#10b981";

  return (
    <svg
      height={size}
      viewBox="0 0 180 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="GrantPilot"
    >
      <defs>
        <linearGradient id="gp-text-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <text
        x="0" y="30"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="800"
        fontSize="32"
        letterSpacing="-0.5"
      >
        <tspan fill={textColor}>Grant</tspan>
        <tspan fill="url(#gp-text-grad)">Pilot</tspan>
      </text>
    </svg>
  );
}

export function Logo({ variant = "full", size = "md", theme = "dark", className = "" }: LogoProps) {
  const s = SIZES[size];

  if (variant === "mark") {
    return <GrantPilotMark size={s.mark} className={className} />;
  }

  if (variant === "wordmark") {
    return <GrantPilotWordmark size={s.wordSize} theme={theme} className={className} />;
  }

  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: s.gap }}>
      <GrantPilotMark size={s.mark} />
      <GrantPilotWordmark size={s.wordSize} theme={theme} />
    </span>
  );
}

export default Logo;
