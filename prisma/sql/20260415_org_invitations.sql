-- Migration: Organization seat invitations
-- Date:      2026-04-15
-- Target:    Postgres (Supabase)
--
-- Adds two additive tables supporting team-seat invitations without
-- touching the existing 1-1 Organization.userId "owner" relation:
--
--   OrganizationMember     — maps users to orgs as admin/editor/viewer
--   OrganizationInvitation — pending invites, sha256-hashed tokens
--
-- Apply one of two ways:
--
--   Option A (recommended, keeps parity with the schema file):
--     npx prisma db push
--
--   Option B (run this file against prod directly):
--     psql "$DIRECT_URL" -f prisma/sql/20260415_org_invitations.sql
--
-- Idempotent: safe to re-run. All CREATE statements use IF NOT EXISTS.

BEGIN;

-- ─── OrganizationMember ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OrganizationMember" (
    "id"             TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId"         TEXT NOT NULL,
    "role"           TEXT NOT NULL DEFAULT 'editor',
    "invitedById"    TEXT,
    "joinedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationMember_organizationId_userId_key"
    ON "OrganizationMember" ("organizationId", "userId");

CREATE INDEX IF NOT EXISTS "OrganizationMember_userId_idx"
    ON "OrganizationMember" ("userId");

CREATE INDEX IF NOT EXISTS "OrganizationMember_organizationId_role_idx"
    ON "OrganizationMember" ("organizationId", "role");

-- Drop-and-recreate FK pattern so re-runs are safe. Postgres doesn't
-- have "ADD CONSTRAINT IF NOT EXISTS" pre-16; the DO block emulates it.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'OrganizationMember_organizationId_fkey'
    ) THEN
        ALTER TABLE "OrganizationMember"
            ADD CONSTRAINT "OrganizationMember_organizationId_fkey"
            FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'OrganizationMember_userId_fkey'
    ) THEN
        ALTER TABLE "OrganizationMember"
            ADD CONSTRAINT "OrganizationMember_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END$$;

-- ─── OrganizationInvitation ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OrganizationInvitation" (
    "id"             TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email"          TEXT NOT NULL,
    "role"           TEXT NOT NULL DEFAULT 'editor',
    "tokenHash"      TEXT NOT NULL,
    "invitedById"    TEXT,
    "expiresAt"      TIMESTAMP(3) NOT NULL,
    "acceptedAt"     TIMESTAMP(3),
    "revokedAt"      TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("id")
);

-- tokenHash is the lookup key on accept — must be unique so a replay
-- of a stale hash can't hit multiple invitations.
CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationInvitation_tokenHash_key"
    ON "OrganizationInvitation" ("tokenHash");

-- Compound index matches the "list pending for this org" filter in
-- GET /api/org/invitations (organizationId + acceptedAt/revokedAt null).
CREATE INDEX IF NOT EXISTS "OrganizationInvitation_organizationId_acceptedAt_revokedAt_idx"
    ON "OrganizationInvitation" ("organizationId", "acceptedAt", "revokedAt");

CREATE INDEX IF NOT EXISTS "OrganizationInvitation_email_idx"
    ON "OrganizationInvitation" ("email");

-- Lets the cleanup cron (future) scan by expiry efficiently.
CREATE INDEX IF NOT EXISTS "OrganizationInvitation_expiresAt_idx"
    ON "OrganizationInvitation" ("expiresAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'OrganizationInvitation_organizationId_fkey'
    ) THEN
        ALTER TABLE "OrganizationInvitation"
            ADD CONSTRAINT "OrganizationInvitation_organizationId_fkey"
            FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- invitedBy uses SET NULL so revoking a user doesn't orphan-delete
    -- their open invitations (audit trail preserved).
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'OrganizationInvitation_invitedById_fkey'
    ) THEN
        ALTER TABLE "OrganizationInvitation"
            ADD CONSTRAINT "OrganizationInvitation_invitedById_fkey"
            FOREIGN KEY ("invitedById") REFERENCES "User"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END$$;

COMMIT;
