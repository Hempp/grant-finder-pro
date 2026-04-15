/**
 * Lightweight structured logging for production observability.
 *
 * Emits JSON to stdout/stderr so Vercel's log drain (or any downstream
 * log aggregator) can parse it. Zero dependencies, zero paid tiers.
 *
 * Usage:
 *   logEvent("ai.generate.succeeded", { durationMs, tokens })
 *   logError(err, { endpoint: "/api/ai/generate" })
 *   const stop = timer("stripe.checkout"); ...; stop({ userId })
 *
 * Conventions:
 *   - event names are dotted, lowercase, prefixed by domain
 *     (ai.*, stripe.*, cron.*, application.*, auth.*)
 *   - durations go in `durationMs` (number), not a string
 *   - user-identifying props use the full id; masking is a downstream job
 */

type LogLevel = "info" | "warn" | "error";

interface LogEvent {
  timestamp: string;
  level: LogLevel;
  name: string;
  durationMs?: number;
  props?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

function emit(level: LogLevel, event: Omit<LogEvent, "level">): void {
  const line = JSON.stringify({ level, ...event });
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function logEvent(name: string, props?: Record<string, unknown>): void {
  emit("info", { timestamp: new Date().toISOString(), name, props });
}

export function logWarning(name: string, props?: Record<string, unknown>): void {
  emit("warn", { timestamp: new Date().toISOString(), name, props });
}

export function logError(err: unknown, context?: Record<string, unknown>): void {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  emit("error", {
    timestamp: new Date().toISOString(),
    name: "error",
    props: { message, stack },
    context,
  });
}

/**
 * Starts a timer. Returns a stop function that emits an event with
 * `durationMs`. Pass extra props to the stop call.
 *
 *   const stop = timer("ai.generate");
 *   ... do work ...
 *   stop({ source: "claude", tokens: 842 });
 */
export function timer(name: string): (props?: Record<string, unknown>) => number {
  const start = Date.now();
  return (props) => {
    const durationMs = Date.now() - start;
    emit("info", {
      timestamp: new Date().toISOString(),
      name,
      durationMs,
      props,
    });
    return durationMs;
  };
}
