/**
 * Circuit Breaker Pattern (Quantum Decoherence)
 *
 * When an external source fails repeatedly, the circuit "trips" and
 * stops calling it for a cooldown period. This prevents:
 * - Cascade failures when APIs go down
 * - Wasted API quota on broken endpoints
 * - Slow scraping jobs waiting on timeouts
 *
 * States: CLOSED (healthy) → OPEN (tripped) → HALF_OPEN (testing)
 */

type CircuitState = "closed" | "open" | "half_open";

interface CircuitBreakerOptions {
  failureThreshold: number; // failures before tripping (default: 3)
  cooldownMs: number;       // ms to wait before retrying (default: 5 min)
  halfOpenMaxAttempts: number; // attempts in half-open before closing (default: 1)
}

interface CircuitRecord {
  state: CircuitState;
  failures: number;
  lastFailure: number;
  lastSuccess: number;
  trippedAt: number;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 3,
  cooldownMs: 5 * 60 * 1000, // 5 minutes
  halfOpenMaxAttempts: 1,
};

// In-memory circuit state (resets on cold start — fine for serverless)
const circuits = new Map<string, CircuitRecord>();

function getCircuit(id: string): CircuitRecord {
  if (!circuits.has(id)) {
    circuits.set(id, {
      state: "closed",
      failures: 0,
      lastFailure: 0,
      lastSuccess: 0,
      trippedAt: 0,
    });
  }
  return circuits.get(id)!;
}

/**
 * Execute a function with circuit breaker protection.
 *
 * @param id - Unique identifier for this circuit (e.g., source.id)
 * @param fn - The async function to execute
 * @param fallback - Fallback value to return when circuit is open
 * @param options - Circuit breaker configuration
 */
export async function withCircuitBreaker<T>(
  id: string,
  fn: () => Promise<T>,
  fallback: T,
  options: Partial<CircuitBreakerOptions> = {}
): Promise<{ result: T; circuitState: CircuitState; fromFallback: boolean }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const circuit = getCircuit(id);
  const now = Date.now();

  // Check if open circuit should transition to half-open
  if (circuit.state === "open") {
    if (now - circuit.trippedAt >= opts.cooldownMs) {
      circuit.state = "half_open";
    } else {
      // Circuit is open — return fallback without calling
      return { result: fallback, circuitState: "open", fromFallback: true };
    }
  }

  try {
    const result = await fn();

    // Success — reset circuit
    circuit.state = "closed";
    circuit.failures = 0;
    circuit.lastSuccess = now;

    return { result, circuitState: "closed", fromFallback: false };
  } catch (error) {
    circuit.failures++;
    circuit.lastFailure = now;

    if (circuit.failures >= opts.failureThreshold) {
      circuit.state = "open";
      circuit.trippedAt = now;
      console.warn(
        `[CircuitBreaker] ${id}: TRIPPED after ${circuit.failures} failures. ` +
        `Cooldown for ${opts.cooldownMs / 1000}s. Serving fallback.`
      );
    }

    // In half-open state, any failure trips immediately
    if (circuit.state === "half_open") {
      circuit.state = "open";
      circuit.trippedAt = now;
    }

    return { result: fallback, circuitState: circuit.state, fromFallback: true };
  }
}

/**
 * Get the current state of all circuits (for monitoring/debugging).
 */
export function getCircuitStates(): Record<string, { state: CircuitState; failures: number }> {
  const states: Record<string, { state: CircuitState; failures: number }> = {};
  for (const [id, record] of circuits) {
    states[id] = { state: record.state, failures: record.failures };
  }
  return states;
}

/**
 * Reset a specific circuit (for manual recovery).
 */
export function resetCircuit(id: string): void {
  circuits.delete(id);
}
