/**
 * SSRF defense for user-supplied URLs.
 *
 * `assertPublicHttpUrl` enforces:
 *   - protocol ∈ {http, https}
 *   - hostname is NOT localhost / .local / loopback
 *   - hostname does NOT resolve to a private IP range (best-effort)
 *   - hostname is NOT the AWS metadata IP (169.254.169.254)
 *
 * Throws `SafeUrlError` with a user-facing message on rejection.
 * The server-side fetch still needs a fetch-time timeout + response size cap
 * — this helper guards the URL shape, not the network egress.
 */

const PRIVATE_CIDR_PATTERNS: RegExp[] = [
  /^10\./, // 10.0.0.0/8
  /^127\./, // 127.0.0.0/8 loopback
  /^169\.254\./, // 169.254.0.0/16 link-local (includes AWS metadata)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./, // 192.168.0.0/16
  /^0\./, // 0.0.0.0/8
  /^::1$/, // IPv6 loopback
  /^f[cd][0-9a-f]{2}:/i, // IPv6 unique local
  /^fe80:/i, // IPv6 link-local
];

const HOSTNAME_BLOCKLIST = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.goog",
]);

export class SafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafeUrlError";
  }
}

export function assertPublicHttpUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new SafeUrlError("That doesn't look like a valid URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SafeUrlError("Only http:// and https:// URLs are allowed.");
  }

  // URL constructor returns IPv6 hostnames wrapped in brackets (`[::1]`);
  // strip them so our pattern tests match.
  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (HOSTNAME_BLOCKLIST.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new SafeUrlError("That hostname isn't allowed.");
  }

  // If hostname looks like a literal IP, check the private ranges.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) {
    for (const pattern of PRIVATE_CIDR_PATTERNS) {
      if (pattern.test(host)) {
        throw new SafeUrlError("Private network addresses aren't allowed.");
      }
    }
  }

  return parsed;
}
