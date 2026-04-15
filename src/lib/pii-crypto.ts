/**
 * Field-level encryption for PII at rest.
 *
 * Why: StudentProfile holds gender, ethnicity, citizenship — categories that
 * legal/regulatory regimes (FERPA-adjacent, GDPR special-category, state laws)
 * treat as sensitive. Plaintext storage means a database dump exposes them.
 *
 * Algorithm: AES-256-GCM. Authenticated, NIST-approved, fast.
 *
 * Format: `enc:v1:{iv-hex}:{tag-hex}:{ciphertext-hex}` — the `enc:v1:` prefix
 * lets the decrypt path detect plaintext (legacy rows written before this
 * helper landed) and pass them through untouched. Migration is therefore
 * lazy: rows re-encrypt on the next write.
 *
 * Key: 32-byte hex string in `process.env.PII_ENCRYPTION_KEY`. Generate with
 *      `openssl rand -hex 32`. Store in Vercel/Supabase secrets, never commit.
 *      If the env var is absent the helpers no-op (return input unchanged) so
 *      development without the secret still works.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";
const ALGO = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;

let cachedKey: Buffer | null | undefined;

function getKey(): Buffer | null {
  if (cachedKey !== undefined) return cachedKey;
  const hex = process.env.PII_ENCRYPTION_KEY;
  if (!hex) {
    cachedKey = null;
    return null;
  }
  if (hex.length !== KEY_BYTES * 2) {
    // Fail loud at startup if the key is malformed — we'd rather break the
    // build than silently store ciphertext nobody can decrypt.
    throw new Error(
      `PII_ENCRYPTION_KEY must be ${KEY_BYTES * 2} hex chars (got ${hex.length}). ` +
        `Generate one with: openssl rand -hex ${KEY_BYTES}`
    );
  }
  cachedKey = Buffer.from(hex, "hex");
  return cachedKey;
}

export function encryptPII(plaintext: string | null | undefined): string | null | undefined {
  if (plaintext === null || plaintext === undefined || plaintext === "") return plaintext;
  if (plaintext.startsWith(PREFIX)) return plaintext; // already encrypted
  const key = getKey();
  if (!key) return plaintext; // dev mode without secret — no-op

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptPII(value: string | null | undefined): string | null | undefined {
  if (value === null || value === undefined || value === "") return value;
  if (!value.startsWith(PREFIX)) return value; // legacy plaintext — pass through
  const key = getKey();
  if (!key) return value; // can't decrypt without key, return as-is

  const parts = value.slice(PREFIX.length).split(":");
  if (parts.length !== 3) return value; // malformed — don't crash the read

  try {
    const [ivHex, tagHex, dataHex] = parts;
    const decipher = createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (err) {
    // Auth tag mismatch usually means the key rotated. Surface the error in
    // logs but don't crash — return ciphertext so the caller sees something
    // is wrong.
    console.error("PII decrypt failed (key rotation? corrupted row?):", err);
    return value;
  }
}

/** Fields on StudentProfile that pass through encryption helpers transparently. */
export const STUDENT_PROFILE_PII_FIELDS = [
  "gender",
  "ethnicity",
  "citizenship",
] as const;

export type StudentProfilePIIField = (typeof STUDENT_PROFILE_PII_FIELDS)[number];
