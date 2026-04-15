# Postgres migrations (manual)

The tracked `prisma/migrations/` tree is a SQLite-era init that never got
converted when prod moved to Supabase. The project has since been kept
in sync by running `prisma db push` against the live database, which
means new schema changes need a standalone SQL file here that captures
what `prisma db push` would have applied, so ops can run it via:

```
psql "$DIRECT_URL" -f prisma/sql/<file>.sql
```

…or paste it into the Supabase SQL editor.

## Deployment order

When a schema change lands on `main`:

1. `prisma db push` against the Supabase prod DB (or run the matching
   SQL file here), **before** the Vercel deploy completes.
2. Confirm the tables exist (`\d "TableName"` in psql).
3. Let the Vercel deploy finish — new API routes will now find the
   tables they expect.

If the deploy wins the race (code live, tables missing), any API route
that touches the new tables returns 500. The blast radius is usually
small because the UI often doesn't call those routes until the user
clicks something new.

## Files

| File | What it creates |
|---|---|
| `20260415_org_invitations.sql` | `OrganizationMember`, `OrganizationInvitation` + indexes + FKs for the team-seat invitation flow |

All files are written to be idempotent (`CREATE TABLE IF NOT EXISTS`,
`DO $$ ... IF NOT EXISTS ... $$` for constraints) so re-running them is
safe.
