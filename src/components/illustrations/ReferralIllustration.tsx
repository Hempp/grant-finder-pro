"use client";

export function ReferralHeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circles */}
      <circle cx="200" cy="150" r="120" fill="url(#grad1)" opacity="0.1" />
      <circle cx="200" cy="150" r="80" fill="url(#grad1)" opacity="0.15" />

      {/* Connection lines */}
      <path
        d="M120 150 L200 150"
        stroke="url(#lineGrad)"
        strokeWidth="3"
        strokeDasharray="8 4"
        opacity="0.6"
      />
      <path
        d="M200 150 L280 150"
        stroke="url(#lineGrad)"
        strokeWidth="3"
        strokeDasharray="8 4"
        opacity="0.6"
      />
      <path
        d="M200 150 L240 100"
        stroke="url(#lineGrad)"
        strokeWidth="3"
        strokeDasharray="8 4"
        opacity="0.6"
      />
      <path
        d="M200 150 L240 200"
        stroke="url(#lineGrad)"
        strokeWidth="3"
        strokeDasharray="8 4"
        opacity="0.6"
      />

      {/* Center person (referrer) */}
      <g transform="translate(200, 150)">
        <circle cx="0" cy="-20" r="24" fill="url(#personGrad1)" />
        <circle cx="0" cy="-20" r="10" fill="#1e293b" />
        <ellipse cx="0" cy="15" rx="20" ry="12" fill="url(#personGrad1)" />
        {/* Star badge */}
        <circle cx="18" cy="-30" r="12" fill="#10b981" />
        <path
          d="M18 -36 L20 -32 L24 -32 L21 -29 L22 -25 L18 -28 L14 -25 L15 -29 L12 -32 L16 -32 Z"
          fill="#fff"
        />
      </g>

      {/* Left person */}
      <g transform="translate(80, 150)">
        <circle cx="0" cy="-15" r="18" fill="url(#personGrad2)" />
        <circle cx="0" cy="-15" r="7" fill="#1e293b" />
        <ellipse cx="0" cy="10" rx="15" ry="9" fill="url(#personGrad2)" />
      </g>

      {/* Right person */}
      <g transform="translate(320, 150)">
        <circle cx="0" cy="-15" r="18" fill="url(#personGrad3)" />
        <circle cx="0" cy="-15" r="7" fill="#1e293b" />
        <ellipse cx="0" cy="10" rx="15" ry="9" fill="url(#personGrad3)" />
      </g>

      {/* Top right person */}
      <g transform="translate(270, 85)">
        <circle cx="0" cy="-12" r="15" fill="url(#personGrad2)" />
        <circle cx="0" cy="-12" r="6" fill="#1e293b" />
        <ellipse cx="0" cy="8" rx="12" ry="7" fill="url(#personGrad2)" />
      </g>

      {/* Bottom right person */}
      <g transform="translate(270, 215)">
        <circle cx="0" cy="-12" r="15" fill="url(#personGrad3)" />
        <circle cx="0" cy="-12" r="6" fill="#1e293b" />
        <ellipse cx="0" cy="8" rx="12" ry="7" fill="url(#personGrad3)" />
      </g>

      {/* Gift boxes floating */}
      <g transform="translate(140, 80)">
        <rect x="-12" y="-12" width="24" height="24" rx="4" fill="#10b981" />
        <rect x="-12" y="-2" width="24" height="4" fill="#059669" />
        <rect x="-2" y="-12" width="4" height="24" fill="#059669" />
        <path d="M-8 -12 Q0 -20 8 -12" stroke="#fbbf24" strokeWidth="2" fill="none" />
      </g>

      <g transform="translate(300, 240)">
        <rect x="-10" y="-10" width="20" height="20" rx="3" fill="#8b5cf6" />
        <rect x="-10" y="-2" width="20" height="4" fill="#7c3aed" />
        <rect x="-2" y="-10" width="4" height="20" fill="#7c3aed" />
        <path d="M-6 -10 Q0 -16 6 -10" stroke="#fbbf24" strokeWidth="2" fill="none" />
      </g>

      {/* Sparkles */}
      <g fill="#fbbf24">
        <path d="M100 80 L102 85 L107 85 L103 88 L105 93 L100 90 L95 93 L97 88 L93 85 L98 85 Z" />
        <path d="M320 100 L321.5 103 L325 103 L322 105 L323 109 L320 107 L317 109 L318 105 L315 103 L318.5 103 Z" />
        <path d="M350 180 L351 182 L354 182 L352 184 L353 187 L350 185 L347 187 L348 184 L346 182 L349 182 Z" />
        <path d="M60 200 L61.5 203 L65 203 L62 205 L63 209 L60 207 L57 209 L58 205 L55 203 L58.5 203 Z" />
      </g>

      {/* Floating coins */}
      <g transform="translate(330, 70)">
        <ellipse cx="0" cy="0" rx="14" ry="10" fill="#fbbf24" />
        <ellipse cx="0" cy="-2" rx="14" ry="10" fill="#fcd34d" />
        <text x="0" y="2" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400e">$</text>
      </g>

      <g transform="translate(50, 120)">
        <ellipse cx="0" cy="0" rx="12" ry="8" fill="#fbbf24" />
        <ellipse cx="0" cy="-2" rx="12" ry="8" fill="#fcd34d" />
        <text x="0" y="1" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#92400e">$</text>
      </g>

      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="personGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="personGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="personGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function EmptyReferralsIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <circle cx="100" cy="80" r="60" fill="url(#emptyGrad)" opacity="0.1" />

      {/* Envelope */}
      <g transform="translate(100, 80)">
        <rect x="-40" y="-20" width="80" height="50" rx="4" fill="#334155" />
        <path d="M-40 -16 L0 15 L40 -16" stroke="#475569" strokeWidth="3" fill="none" />
        <path d="M-36 -20 L0 10 L36 -20" fill="#3b82f6" opacity="0.3" />

        {/* Letter coming out */}
        <rect x="-30" y="-45" width="60" height="40" rx="2" fill="#f1f5f9" />
        <rect x="-22" y="-38" width="30" height="3" rx="1" fill="#cbd5e1" />
        <rect x="-22" y="-32" width="44" height="2" rx="1" fill="#e2e8f0" />
        <rect x="-22" y="-27" width="44" height="2" rx="1" fill="#e2e8f0" />
        <rect x="-22" y="-22" width="30" height="2" rx="1" fill="#e2e8f0" />

        {/* Heart on letter */}
        <path
          d="M15 -35 C15 -40 22 -40 22 -35 C22 -30 15 -25 15 -25 C15 -25 8 -30 8 -35 C8 -40 15 -40 15 -35"
          fill="#f472b6"
        />
      </g>

      {/* Dotted circle */}
      <circle
        cx="100"
        cy="80"
        r="55"
        stroke="#475569"
        strokeWidth="2"
        strokeDasharray="6 6"
        fill="none"
        opacity="0.5"
      />

      {/* Small decorative elements */}
      <circle cx="40" cy="40" r="4" fill="#10b981" opacity="0.4" />
      <circle cx="160" cy="50" r="3" fill="#8b5cf6" opacity="0.4" />
      <circle cx="150" cy="130" r="5" fill="#06b6d4" opacity="0.4" />
      <circle cx="50" cy="120" r="3" fill="#fbbf24" opacity="0.4" />

      <defs>
        <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function RewardBadgeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Glow effect */}
      <circle cx="40" cy="40" r="35" fill="url(#badgeGlow)" opacity="0.3" />

      {/* Badge body */}
      <circle cx="40" cy="40" r="28" fill="url(#badgeGrad)" />
      <circle cx="40" cy="40" r="24" fill="url(#badgeInner)" />

      {/* Star */}
      <path
        d="M40 20 L45 32 L58 32 L48 40 L52 53 L40 45 L28 53 L32 40 L22 32 L35 32 Z"
        fill="#fbbf24"
      />

      {/* Ribbon */}
      <path d="M28 58 L28 75 L35 68 L40 75 L40 58" fill="#ef4444" />
      <path d="M52 58 L52 75 L45 68 L40 75 L40 58" fill="#dc2626" />

      {/* Sparkles */}
      <circle cx="60" cy="20" r="3" fill="#fbbf24" />
      <circle cx="20" cy="25" r="2" fill="#fbbf24" />
      <circle cx="65" cy="45" r="2" fill="#fbbf24" />

      <defs>
        <radialGradient id="badgeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="badgeInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ShareIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Phone */}
      <rect x="35" y="10" width="50" height="80" rx="8" fill="#334155" />
      <rect x="38" y="18" width="44" height="64" rx="2" fill="#1e293b" />
      <circle cx="60" cy="86" r="4" fill="#475569" />

      {/* Screen content */}
      <rect x="42" y="24" width="36" height="6" rx="2" fill="#10b981" opacity="0.5" />
      <rect x="42" y="34" width="36" height="20" rx="2" fill="#8b5cf6" opacity="0.3" />
      <rect x="42" y="58" width="24" height="4" rx="1" fill="#475569" />
      <rect x="42" y="66" width="36" height="4" rx="1" fill="#475569" />

      {/* Share arrows flying out */}
      <g transform="translate(90, 35)">
        <circle cx="0" cy="0" r="12" fill="url(#shareGrad1)" />
        <path d="M-4 0 L4 0 M0 -4 L4 0 L0 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>

      <g transform="translate(100, 55)">
        <circle cx="0" cy="0" r="10" fill="url(#shareGrad2)" />
        <path d="M-3 0 L3 0 M0 -3 L3 0 L0 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>

      <g transform="translate(95, 75)">
        <circle cx="0" cy="0" r="8" fill="url(#shareGrad3)" />
        <path d="M-2 0 L2 0 M0 -2 L2 0 L0 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Motion lines */}
      <path d="M82 35 L88 35" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M84 55 L90 55" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M83 75 L88 75" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      <defs>
        <linearGradient id="shareGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="shareGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="shareGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
    </svg>
  );
}
