import { PrismaClient } from "@/generated/prisma/client";
import {
  decryptPII,
  encryptPII,
  STUDENT_PROFILE_PII_FIELDS,
  type StudentProfilePIIField,
} from "@/lib/pii-crypto";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof buildClient> | undefined;
};

type AnyRecord = Record<string, unknown>;

function transformOutgoing(data: AnyRecord | undefined): AnyRecord | undefined {
  if (!data) return data;
  const out: AnyRecord = { ...data };
  for (const field of STUDENT_PROFILE_PII_FIELDS as readonly StudentProfilePIIField[]) {
    const v = out[field];
    if (typeof v === "string") {
      out[field] = encryptPII(v);
    }
  }
  return out;
}

function transformIncoming<T extends AnyRecord | null | undefined>(row: T): T {
  if (!row || typeof row !== "object") return row;
  for (const field of STUDENT_PROFILE_PII_FIELDS as readonly StudentProfilePIIField[]) {
    const v = (row as AnyRecord)[field];
    if (typeof v === "string") {
      (row as AnyRecord)[field] = decryptPII(v);
    }
  }
  return row;
}

function transformIncomingMany<T extends AnyRecord>(rows: T[]): T[] {
  return rows.map((r) => transformIncoming(r));
}

/**
 * Wraps PrismaClient with a `studentProfile` extension that transparently
 * encrypts the configured PII columns on write and decrypts them on read.
 *
 * Why an extension instead of route-level wrapping: every read site (essay
 * adapter, scholarship matcher, winner verification) would otherwise need
 * to remember to call `decryptPII`. A single extension prevents drift.
 */
function buildClient() {
  const base = new PrismaClient();

  return base.$extends({
    name: "pii-encryption",
    query: {
      studentProfile: {
        async create({ args, query }) {
          if (args.data && typeof args.data === "object") {
            args.data = transformOutgoing(args.data as AnyRecord) as typeof args.data;
          }
          const result = await query(args);
          return transformIncoming(result as AnyRecord) as typeof result;
        },
        async update({ args, query }) {
          if (args.data && typeof args.data === "object") {
            args.data = transformOutgoing(args.data as AnyRecord) as typeof args.data;
          }
          const result = await query(args);
          return transformIncoming(result as AnyRecord) as typeof result;
        },
        async upsert({ args, query }) {
          if (args.create && typeof args.create === "object") {
            args.create = transformOutgoing(args.create as AnyRecord) as typeof args.create;
          }
          if (args.update && typeof args.update === "object") {
            args.update = transformOutgoing(args.update as AnyRecord) as typeof args.update;
          }
          const result = await query(args);
          return transformIncoming(result as AnyRecord) as typeof result;
        },
        async findUnique({ args, query }) {
          const result = await query(args);
          return transformIncoming(result as AnyRecord | null) as typeof result;
        },
        async findUniqueOrThrow({ args, query }) {
          const result = await query(args);
          return transformIncoming(result as AnyRecord) as typeof result;
        },
        async findFirst({ args, query }) {
          const result = await query(args);
          return transformIncoming(result as AnyRecord | null) as typeof result;
        },
        async findFirstOrThrow({ args, query }) {
          const result = await query(args);
          return transformIncoming(result as AnyRecord) as typeof result;
        },
        async findMany({ args, query }) {
          const result = await query(args);
          return transformIncomingMany(result as AnyRecord[]) as typeof result;
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
