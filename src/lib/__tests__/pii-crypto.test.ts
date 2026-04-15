import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { encryptPII, decryptPII } from "../pii-crypto";

describe("pii-crypto", () => {
  const KEY = "0".repeat(64); // 32 bytes hex
  const originalKey = process.env.PII_ENCRYPTION_KEY;

  // The helper caches the key on first call per process. Vitest runs each
  // `it()` in the same worker, so we reset the env inside the module by
  // re-importing between cases (cheapest: just don't rely on env flips
  // mid-suite — partition by describe block).
  beforeEach(() => {
    process.env.PII_ENCRYPTION_KEY = KEY;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.PII_ENCRYPTION_KEY;
    } else {
      process.env.PII_ENCRYPTION_KEY = originalKey;
    }
  });

  it("round-trips plaintext through encrypt/decrypt", () => {
    const input = "Asian/Pacific Islander";
    const ciphertext = encryptPII(input);
    expect(ciphertext).not.toBe(input);
    expect(typeof ciphertext).toBe("string");
    expect(ciphertext).toMatch(/^enc:v1:/);
    expect(decryptPII(ciphertext)).toBe(input);
  });

  it("passes null/undefined/empty through untouched", () => {
    expect(encryptPII(null)).toBeNull();
    expect(encryptPII(undefined)).toBeUndefined();
    expect(encryptPII("")).toBe("");
    expect(decryptPII(null)).toBeNull();
    expect(decryptPII(undefined)).toBeUndefined();
    expect(decryptPII("")).toBe("");
  });

  it("is idempotent — re-encrypting ciphertext returns the same ciphertext", () => {
    const once = encryptPII("Female");
    const twice = encryptPII(once);
    expect(twice).toBe(once);
  });

  it("treats plaintext as legacy — decrypt passes through unchanged", () => {
    // This is the lazy-migration contract: rows written before encryption
    // was enabled should still be readable without a backfill job.
    const legacy = "US Citizen";
    expect(decryptPII(legacy)).toBe(legacy);
  });

  it("returns ciphertext unchanged on malformed input", () => {
    // Corrupted row or truncated blob should NOT throw — we log and return
    // the raw value so the app keeps serving reads.
    const malformed = "enc:v1:not:valid:hex";
    expect(decryptPII(malformed)).toBe(malformed);
  });

  it("different calls produce different ciphertexts for the same plaintext (IV randomness)", () => {
    const a = encryptPII("Male") as string;
    const b = encryptPII("Male") as string;
    expect(a).not.toBe(b);
    expect(decryptPII(a)).toBe("Male");
    expect(decryptPII(b)).toBe("Male");
  });
});
