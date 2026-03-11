# Hardening & Polish — Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire up outcome prompt emails, polish new UI components, add unit tests for business logic, and clean up loose ends.

**Architecture:** All changes are incremental — no new models or routes, just wiring existing pieces together and adding quality.

**Tech Stack:** Next.js 16, Prisma 6, Resend email, Vitest/Jest for tests

---

## 1. Wire Outcome Prompts Email

Use existing `src/lib/email.ts` infrastructure to send actual emails from the outcome-prompts cron instead of just logging.

## 2. UI Polish

- Handle untracked `middleware.ts`
- Add loading/error states to new readiness and analysis components
- Expand state portal grants (2-3 per state instead of 1)

## 3. Unit Tests

- `src/lib/readiness-score.ts` — test all 6 weighted factors
- `src/lib/predicted-score.ts` — test criterion mapping
- `src/lib/grant-sources/registry.ts` — test register, scrapeAll, error handling

Approved: 2026-03-10
