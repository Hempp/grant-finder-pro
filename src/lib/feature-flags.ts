/**
 * Runtime feature flags — the 3am kill-switch system.
 *
 * Flags are read from environment variables at request time, so a
 * Vercel env-var change takes effect on the next cold start (<60s in
 * practice) without a redeploy. That's the whole point — when Claude's
 * API is tipping over, ops wants to flip `AI_GENERATION_ENABLED=false`
 * and have the bleeding stop now.
 *
 * A disabled flag MUST degrade gracefully. Callers that check
 * `isEnabled("ai.generation")` and receive `false` should serve the
 * template fallback, not throw.
 *
 * Flag precedence (first match wins):
 *   1. `FEATURE_FLAG_OVERRIDES` JSON in env — highest, for emergency
 *      rollback of specific flags without touching per-flag envs.
 *   2. Per-flag env var e.g. `FLAG_AI_GENERATION=false`.
 *   3. Default defined below.
 *
 * Extending:
 *   - Add the flag to FLAG_DEFAULTS below.
 *   - Document it with a 1-sentence `why` in the comment.
 *   - Use `isEnabled("your.flag")` at the call site.
 */

type FlagKey =
  /** Master switch for Claude-backed Smart Fill. When off, routes fall
   *  back to template generation silently. Use during Anthropic outages
   *  or when we're burning through monthly quota. */
  | "ai.generation"
  /** Whether cron jobs send email. Off = still run matching + update
   *  state, but suppress outbound email (useful during list-bomb
   *  incidents or deliverability issues with our email provider). */
  | "cron.email.enabled"
  /** Whether grant-source scrapers run on schedule. Off = freeze the
   *  catalogue at its current state until we figure out why scraping
   *  is noisy. */
  | "cron.scrape.enabled"
  /** Whether new signups are accepted. Off = 503 at /api/auth/register.
   *  For the "we got on Hacker News and are melting" scenario. */
  | "signup.enabled"
  /** Whether to accept new Stripe checkouts. Off = /api/stripe/checkout
   *  returns 503. For billing incidents where we need to stop creating
   *  subscriptions until the issue is resolved. */
  | "billing.checkout.enabled";

const FLAG_DEFAULTS: Record<FlagKey, boolean> = {
  "ai.generation": true,
  "cron.email.enabled": true,
  "cron.scrape.enabled": true,
  "signup.enabled": true,
  "billing.checkout.enabled": true,
};

function envVarForFlag(key: FlagKey): string {
  return "FLAG_" + key.replace(/\./g, "_").toUpperCase();
}

function parseBool(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const v = raw.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "off" || v === "no") return false;
  if (v === "true" || v === "1" || v === "on" || v === "yes") return true;
  return undefined;
}

let cachedOverrides: Partial<Record<FlagKey, boolean>> | null = null;
function getOverrides(): Partial<Record<FlagKey, boolean>> {
  if (cachedOverrides !== null) return cachedOverrides;
  const raw = process.env.FEATURE_FLAG_OVERRIDES;
  if (!raw) {
    cachedOverrides = {};
    return cachedOverrides;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      cachedOverrides = parsed as Partial<Record<FlagKey, boolean>>;
      return cachedOverrides;
    }
  } catch {
    // Malformed override JSON shouldn't brick the app — fall through.
  }
  cachedOverrides = {};
  return cachedOverrides;
}

export function isEnabled(flag: FlagKey): boolean {
  const overrides = getOverrides();
  if (flag in overrides) return overrides[flag] !== false;

  const envValue = parseBool(process.env[envVarForFlag(flag)]);
  if (envValue !== undefined) return envValue;

  return FLAG_DEFAULTS[flag];
}

/**
 * For admin debug endpoints / status pages. Do NOT expose publicly —
 * the flag list itself telegraphs incident state.
 */
export function snapshotFlags(): Record<FlagKey, boolean> {
  return Object.fromEntries(
    (Object.keys(FLAG_DEFAULTS) as FlagKey[]).map((k) => [k, isEnabled(k)])
  ) as Record<FlagKey, boolean>;
}
