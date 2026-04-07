# Student Grants Phase 3: Revenue — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan.

**Goal:** Collect success fees from students who win scholarships. Card on file before first auto-apply, auto-charge on outcome report, installment plans, account gating for overdue outcomes, celebration + upsell UX.

**Architecture:** Extends Phase 2. Stripe SetupIntent for card on file, PaymentIntent for charges, outcome reporting triggers fee calculation. Student settings page for payment method management.

**Tech Stack:** Stripe (SetupIntent, PaymentIntent), Prisma, Next.js, Resend

---

## Task 1: Card on File — Stripe SetupIntent

Create `src/app/api/student/payment-method/route.ts`.

**POST — Create SetupIntent:**
1. Auth check
2. Create Stripe customer if user doesn't have stripeCustomerId
3. Create SetupIntent: `stripe.setupIntents.create({ customer, usage: 'off_session' })`
4. Return `{ clientSecret: setupIntent.client_secret }`

**GET — Get current payment method:**
1. Auth check
2. If user has stripePaymentMethodId, retrieve it: `stripe.paymentMethods.retrieve(id)`
3. Return `{ last4, brand, expMonth, expYear }` or `{ hasPaymentMethod: false }`

**DELETE — Remove payment method:**
1. Auth check
2. Detach: `stripe.paymentMethods.detach(id)`
3. Clear stripePaymentMethodId on User

Create `src/app/api/student/payment-method/confirm/route.ts`:

**POST — Confirm SetupIntent and save PaymentMethod:**
1. Accept `{ setupIntentId }`
2. Retrieve SetupIntent from Stripe
3. Save the PaymentMethod ID to User.stripePaymentMethodId
4. Return success

---

## Task 2: Payment Method Gate on Auto-Apply

Modify `src/app/api/student/applications/batch/route.ts`:
- Before generating drafts, check if user has `stripePaymentMethodId` set
- If user is on free tier (successFeePercent > 0) and has NO payment method, return 402 with message: "Add a payment method before submitting applications. You won't be charged until you win."
- If user is Pro (successFeePercent === 0), skip the check

Modify `src/app/student/apply/page.tsx`:
- Before showing the queue, check if user needs a payment method (GET /api/student/payment-method)
- If needed, show a card-on-file prompt with Stripe Elements instead of the queue
- Use `@stripe/react-stripe-js` and `@stripe/stripe-js` (already in package.json)
- After card added, proceed to queue

---

## Task 3: Success Fee Charging

Create `src/lib/success-fee.ts`:

**`calculateSuccessFee(awardAmount, feePercent)`** — Returns fee amount in cents.

**`chargeSuccessFee(params)`:**
1. Accept: userId, applicationId, awardAmount, feePercent
2. Calculate fee
3. Retrieve user's stripePaymentMethodId and stripeCustomerId
4. Create PaymentIntent: `stripe.paymentIntents.create({ amount: feeCents, currency: 'usd', customer, payment_method, off_session: true, confirm: true })`
5. Update StudentApplication: successFeeAmount, successFeeStatus="charged", successFeePaidAt, stripePaymentId
6. Send fee receipt email
7. Return charge result

**`createInstallmentPlan(params)`:**
1. Accept: userId, applicationId, totalFee, installments (default 4)
2. Calculate per-installment amount
3. Generate due dates (monthly)
4. Save installment plan JSON on application
5. Charge first installment immediately
6. Return plan details

---

## Task 4: Auto-Charge on Outcome Report

Modify outcome reporting in `src/app/student/applications/[id]/page.tsx`:
- When student reports "awarded" with an amount:
  1. PATCH application with status "awarded", awardAmount, awardedAt
  2. If successFeePercent > 0, call POST `/api/student/applications/[id]/charge-fee`
  3. Show celebration screen with fee breakdown

Create `src/app/api/student/applications/[id]/charge-fee/route.ts`:
**POST:**
1. Auth check, verify ownership
2. Verify application is "awarded" with awardAmount
3. Call `chargeSuccessFee()` or offer installment plan
4. If charge fails (card declined), set successFeeStatus="failed", return error with installment offer
5. Return charge result

---

## Task 5: Account Gating for Overdue Outcomes

Create `src/lib/student/outcome-gate.ts`:

**`checkOutcomeGate(userId)`:**
1. Count StudentApplications where: status="submitted" AND deadline has passed AND outcomeReportedAt is null
2. If count > 0, return `{ gated: true, overdueCount: count, applications: [...] }`
3. Otherwise return `{ gated: false }`

Modify `src/app/api/student/applications/batch/route.ts`:
- Before generating drafts, call checkOutcomeGate
- If gated, return 403: "Report outcomes for X past-deadline applications before submitting new ones."

Modify `src/app/student/apply/page.tsx`:
- Before showing queue, check gate
- If gated, show banner: "You have X applications past their deadline. Report outcomes to continue." with links to each overdue application

---

## Task 6: Student Settings Page with Payment Method

Create `src/app/student/settings/page.tsx`:

Sections:
1. **Account** — Name, email (read-only)
2. **Subscription** — Current plan, upgrade CTA
3. **Payment Method** — Show current card (last4, brand), add/change/remove buttons
   - Uses Stripe Elements for card input
   - POST to /api/student/payment-method to create SetupIntent
   - Confirm and save
4. **Success Fee History** — List of charged fees with dates, amounts, Stripe receipt links

---

## Task 7: Celebration + Upsell UX

Modify the outcome reporting flow in `src/app/student/applications/[id]/page.tsx`:

When a student reports "awarded":
1. Show celebration modal:
   ```
   🎉 Congratulations!
   
   You won [Scholarship Name]!
   Award: $5,000
   
   GrantPilot fee (8%): $400
   You earned: $4,600 for 10 minutes of work.
   That's $27,600/hour.
   
   [Pay Now] [Split into 4 payments of $100]
   
   💡 Upgrade to Pro ($9.99/mo) to eliminate fees on future awards.
   [Upgrade to Pro →]
   ```
2. After payment, show confetti animation and "View All Applications" button
3. If Pro user (0% fee), just show the celebration without fee section

---

## Task 8: Outcome Nudge Emails

Add to `src/lib/email.ts`:

**`sendStudentOutcomeNudgeEmail(to, params)`:**
- "Have you heard back from [Scholarship]?"
- Sent 7, 14, and 30 days after deadline
- Includes link to report outcome
- Gentle tone: "Help improve recommendations for you and other students"

Create a cron-compatible function (not the actual cron route — just the logic):
**`getOverdueStudentOutcomes()`** — Query all StudentApplications where status="submitted" AND scholarship.deadline < now AND outcomeReportedAt is null, grouped by nudge timing (7d, 14d, 30d).

---

## Task 9: Integration + Build + Deploy
