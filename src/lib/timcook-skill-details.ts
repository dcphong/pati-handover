// Auto-generated 2026-05-28 from ~/.openclaw/workspace/agents/timcook/skills/*/SKILL.md on Mac mini.
// Each entry = raw markdown content of SKILL.md, rendered when user clicks a skill row.

export const skillDetails: Record<string, string> = {
  "refund-flow": `---
name: refund-flow
description: Decision tree + execution for customer refund requests. Defines authority limits and execution sequence. Read before processing any refund.
---

# Refund Flow

## When to invoke
- Customer requests refund explicitly
- Failed delivery confirmed unrecoverable + customer not yet refunded
- sentiment-handling skill fired (use customer-favoring authority)



## R4: This skill operates as PRIMITIVE under orchestrators

When called from \`cancellation-retention\` (Phase 3), \`sentiment-handling\` (emotional mode), or \`escalation-protocol\` Cat A (legal/medical/>100%/address-post-ship), this skill is a PRIMITIVE — do NOT re-detect customer intent or fire from own triggers. Execute the refund/replacement action passed by orchestrator + log + reply.

This skill fires INDEPENDENTLY only on the explicit "When to invoke" cases above (refund request, failed delivery unrecoverable). For all other contexts, expect orchestrator coordination.

## Authority — up to 100% of order value, in-conversation, no handoff

You can refund up to 100% of order value without seeking approval, when:
- Within policy window (30 days from delivery): default execute
- Outside policy + customer-friendly tone: 1-time courtesy, execute
- Customer hostile/dispute-threat: skip negotiation, full refund immediately
- Emotional mode fired (sentiment-handling): auto-grant up to 100% (subject to anti-abuse check in that skill)

You cannot:
- Refund more than 100% of order value
- Refund subscription cancellations beyond active billing cycle
- Offer credit AND refund (one or the other)

When customer demands > 100% order value:
- Execute the 100% refund (max authority)
- Reply: "Hi [Name], I've processed the full refund of $X for order #Y — that's the maximum I can refund (the full order value). You'll see it in 5-7 business days. Compensation beyond the original purchase amount isn't something we offer, but the order itself is fully refunded."
- Do NOT mention any team or escalation
- Log to \`memory/YYYY-MM-DD.md\`

## Execution

Use the \`exec\` tool to invoke \`shopify_execute.py\`:

\`\`\`python
import sys
sys.path.insert(0, '/Users/timcook/.openclaw/workspace/agents/timcook/scripts')
from shopify_execute import shopify_refund
result = shopify_refund(
    order_id=NUMERIC_ORDER_ID,
    amount=AMOUNT_OR_NONE,           # None = full refund
    reason="customer_request",        # or "fraud", "declined", "general"
    note="Customer-facing context"
)
print(result)
\`\`\`

Return shape (verify):
- Success: \`{"status": "success", "refund_id": ..., "amount": "X.XX", "currency": "USD", "created_at": "..."}\`
- Error: \`{"error": "..."}\`

If \`result["status"] == "success"\`:
- Reply customer with confirmed amount + ETA: "I've processed your refund of $X for order #Y. You'll see it in 5-7 business days."
- Append to \`memory/refund_history.jsonl\` (one JSON line per refund):
  \`\`\`json
  {"ts": "ISO8601", "customer_email": "...", "order_id": "...", "amount": N, "currency": "USD", "reason": "policy|courtesy|emotional|hostile|emotional_verified|emotional_partial|emotional_blocked", "evidence": "..."}
  \`\`\`
- Append decision summary to \`memory/YYYY-MM-DD.md\`

If \`error\` in result:
- Reply: "I'm running into a technical issue. Let me retry — if it doesn't go through in the next minute, I'll reply with confirmation either way."
- Retry up to 3 times with backoff (1s, 5s, 30s)
- If still failing: append failure to \`memory/YYYY-MM-DD.md\`. Reply: "I wasn't able to process this through our system right now. I've flagged it and will follow up directly within 4 hours."

## Anti-hallucination

- NEVER claim "refund processed" until result has \`status=success\`
- NEVER quote amount different from \`result.amount\`
- NEVER mention "supervisor" — timcook resolves in-conversation
- "Refund processed BUT API timed out" = hallucination, STOP (per \`context-discipline\` BUT-trap rule)

## Examples

**Within policy:**
> "Hi Sarah, no problem. I'm processing your refund of $52 for order #WN200234 now. You'll see it on your card in 5-7 business days."

**Emotional mode (sentiment-handling fired, anti-abuse passed), $80 order:**
> "Hi Sarah, I hear you. I've processed a full refund of $80 for order #WN200234 right now. You'll see it in 5-7 business days. I'm sorry this didn't work for you."

**Customer demands $250 on $90 order:**
> "Hi Sarah, I've processed the full refund of $90 for order #WN200234 — that's the maximum I can refund. You'll see it in 5-7 business days. Compensation beyond the order amount isn't something we offer."

## OOS (Out of Stock) Substitution

When a refund/replacement request involves a product that is out of stock:

### Decision Tree
1. Check Shopify inventory for the SKU being refunded/replaced
2. If SKU is **in stock**: process normally (refund or replace with same SKU)
3. If SKU is **out of stock**:
   - For **Best cannot ship** orders: substitute with **Gold Grade (WNPSGS2024)** when original SKU is WNSJRS2023 or another OOS SKU
   - For **normal refund/replacement**: offer the customer a choice:
     a. Substitute with WNPSGS2024 Gold Grade (in-stock alternative)
     b. Full refund instead
     c. Store credit + 15% off next order
4. **Log the substitution** clearly — include original SKU, substitute SKU, and rationale in the order note and memory log

### Substitution Table
| Original SKU | Product | Substitute | When to Use |
|---|---|---|---|
| WNSJRS2023 | Joint & Muscle Relief Soak | WNPSGS2024 Gold Grade | OOS or Best cannot ship |
| Any OOS SKU | — | WNPSGS2024 Gold Grade | When customer agrees |

### NS Alignment
- **NS#6 (Stock Cover)**: Substitution prevents order cancellations due to OOS items
- **NS#3 (Refund Prevention)**: Offering a substitute reduces refund rate vs. "sorry, out of stock"
- Rule: Never refund an OOS order without first offering a substitute

## Cross-references
- \`skills/sentiment-handling/SKILL.md\` — emotional mode authority bias + anti-abuse check
- \`skills/escalation-protocol/SKILL.md\` — non-refund customer cases
- \`skills/context-discipline/SKILL.md\` — anti-hallucination rules
- \`scripts/shopify_execute.py\` — refund execution (function \`shopify_refund\`)
- \`scripts/recharge_execute.py\` — subscription cancel/pause/skip functions
- \`skills/best-cannot-ship/SKILL.md\` — Flexport order creation for OOS + Best cannot ship orders


## ⛔ MANDATORY refund_history.jsonl append (R4-logging)

**Every successful refund MUST append to \`memory/refund_history.jsonl\`** — required for NS#3 tracking. This file is currently empty 2026-05-06 because previous skill version had logging as "Append to..." soft suggestion. Now MANDATORY.

After \`shopify_refund(...)\` returns success, BEFORE replying to customer:

\`\`\`python
import json
from datetime import datetime, timezone
from pathlib import Path

# Required after every successful refund execution
log_path = Path.home() / ".openclaw" / "workspace" / "agents" / "timcook" / "memory" / "refund_history.jsonl"
entry = {
    "ts": datetime.now(timezone.utc).isoformat(),
    "customer_email": customer_email,
    "order_id": order_id,
    "amount": amount,
    "currency": "USD",
    "reason": reason,  # policy|courtesy|emotional|hostile|emotional_verified|emotional_partial|emotional_blocked
    "evidence": evidence_summary,  # 1-line: original request + decision rationale
    "refund_id": result.get("refund_id"),
    "operator": "timcook"
}
with open(log_path, "a") as f:
    f.write(json.dumps(entry) + "\\n")
\`\`\`

If append fails (disk full, permission, etc.), STILL reply to customer with refund confirmation — but ALSO write to \`memory/YYYY-MM-DD.md\` as backup, AND alert PATI group with: "⚠️ Refund executed for $X order #Y but refund_history.jsonl append failed — check NS#3 tracking integrity".

NS#3 verification: HEARTBEAT.md cron checks \`wc -l memory/refund_history.jsonl\` daily. If count drops or stalls vs Recharge data, supervisor flags discrepancy.`,
  "cancellation-retention": `---
name: cancellation-retention
description: End-to-end handling of subscription cancellation intents — from multilingual detection (Phase 1) through retention offers (Phase 2A) and direct cancellation (Phase 2B) to execution verification (Phase 3), with crash recovery.
---

# Cancellation & Retention Combined Pipeline (Phase 1-3)

**Last updated:** 2026-05-05

**Purpose:** End-to-end handling of subscription cancellation intents — from detection through retention offers to final execution, with crash recovery.

**Scripts referenced:**
- \`scripts/daily_operations_recovery.py\` — Recovery of stuck requests
- \`scripts/crash_recovery_system.py\` — Gateway monitoring (30s intervals)
- \`scripts/recharge_execute.py\` — Recharge API execution
- \`scripts/ns2_tier1_automation.py\` / \`ns2_tier2_automation.py\` / \`ns2_tier3_automation.py\` — OTIF tier automation
- \`scripts/phase2_automation.py\` / \`scripts/phase2_negotiation.py\` — Phase 2 flows
- \`scripts/process_stuck_customers.js\` — Manual stuck customer reprocessing

---

## SECTION 1: Detection (Phase 1)

### 1.1 Multilingual Intent Detection

Detect cancellation intent from customer messages in these languages:

\`\`\`yaml
English: cancel, stop, end, terminate, unsubscribe, remove, delete my subscription
French: annuler, arrêter, supprimer, résilier, annulation, désabonnement
German: kündigen, beenden, stoppen, abbestellen
Spanish: cancelar, terminar, parar, dar de baja
Italian: cancellare, terminare, interrompere, disdire
\`\`\`

**Do NOT match:** "cancel my account" if clearly referring to a different service, support requests about how to cancel (not actual cancellation requests), ambiguous language like "stop sending me emails" (could be marketing opt-out only).

### 1.2 Commitment Check (4-month minimum) — PRECEDES charge window check

**Policy (sếp 2026-05-16)**: subscriptions have a 4-month minimum term. Cannot cancel
within the first 120 days from \`subscription.created_at\` without supervisor
(Bao/Phong) approval.

\`\`\`
Fetch subscription, compute age_days = today - created_at.
- age_days < 120  → POLICY_DECLINE. Do NOT cancel.
                    Respond to customer per template below.
                    Log to phase3_executions.jsonl with status=policy_decline.
- age_days >= 120 → proceed to 1.3 Charge Window Check.
\`\`\`

Both \`scripts/recharge_execute.py\` and \`email-bridge/recharge_confirmation.js\`
return \`status=policy_decline\` for under-age subs. Use that, do not bypass.

**Customer-facing decline template** (English; translate per \`lang_*\` tag):

> Hi {first_name},
>
> Thanks for reaching out. We received your request to cancel your Wellness Nest
> subscription. We'd love to keep helping you on your wellness journey.
>
> Just a quick note on the subscription terms: there is a 4-month minimum commitment
> from the date your subscription started ({created_at_short}). Your subscription is
> currently {age_days} days old, so it will become eligible for cancellation on
> {eligible_date}.
>
> In the meantime, I can offer one of these:
> 1. **Pause** the next charge (30, 60, or 90 days) so you have time to enjoy what
>    you've already got.
> 2. **Skip** just the upcoming charge and resume after that.
> 3. **Reschedule** to a date that works better for you.
>
> Reply with which option you prefer and I'll set it up right away.
>
> Thanks,
> Wellness Nest Support

When the 4-month date passes and customer hasn't responded, do NOT auto-cancel —
the customer must re-confirm. Send a one-off reminder on the eligibility date,
no more.

### 1.3 Charge Window Check (CRITICAL)

This is the **first operational action** before ANY response to the customer:

\`\`\`
Check \`next_charge_scheduled_at\` on the subscription:
- next_charge > 7 days away → safe to proceed with Phase 2 directly
- next_charge ≤ 7 days → **PAUSE FIRST** (30-day pause prevents fulfillment during negotiation)
- Charge already queued → **SKIP FIRST** (skip the queued charge), then pause
- Order processing / fulfillment in progress → CANNOT cancel, notify customer
\`\`\`

**Implementation pattern (from subscription-cancellation-policy):**
\`\`\`javascript
async function checkUpcomingCharge(subscriptionId) {
  const sub = await getSubscription(subscriptionId);
  const nextCharge = new Date(sub.next_charge_scheduled_at);
  const today = new Date();
  const daysUntil = Math.ceil((nextCharge - today) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 7) {
    await pauseSubscription(subscriptionId, 30);
    return { needsPause: true, daysUntil };
  }
  return { needsPause: false, daysUntil };
}
\`\`\`

### 1.3 Auto-Pause Execution

Before entering Phase 2 (confirmation/retention):

1. Call \`checkUpcomingCharge(subscriptionId)\`
2. If pause needed → call Recharge API: PUT \`/subscriptions/{id}\` with status PAUSED
3. Notify customer: *"We've paused your subscription (charging in X days) while we discuss your request."*
4. Set \`needsInvestigation: true\` on the bridge request
5. LLM analyzes email → returns \`[[ACTION:...]]\` and \`[[MODE:...]]\` tags

### 1.4 LLM Action Tag Reference

After auto-pause, the LLM must return action tags:

- \`[[ACTION:cancel]]\` — Customer wants to cancel
- \`[[ACTION:pause]]\` — Customer wants to pause
- \`[[ACTION:skip]]\` — Customer wants to skip next charge
- \`[[MODE:needs_offer]]\` — Retention offer should be sent (customer is open to discussing)
- \`[[MODE:direct_confirmation]]\` — Customer has already agreed or explicitly said "yes"
- \`[[MODE:undetermined]]\` — LLM could not determine intent → retry

### 1.5 Mismatched Email Protocol

When customer-provided email does not match subscription email:

1. Check Recharge API for subscription linked to customer-provided email.
2. If no subscription found:
   - Query Recharge API using the *registered* email to confirm existence.
   - If subscription exists under different email:
     - Send verification message to the registered email (s.raeber@kooikerhondje.ch)
     - Message content:
       > Hi [Name],
       > 
       > We received a request to cancel your subscription from kooikerhsraeber@bluewin.ch.
       > 
       > To protect your account, please confirm if this is you by replying with the code: [6-DIGIT-OTP]
       > 
       > This code will expire in 24 hours.
       > 
       > Thank you,
       > Wellness Nest Team
   - Store verification code in \`verification_staging.json\` with expiry timestamp
   - Set status to \`verification_sent\`
3. If OTP received and matches:
   - Proceed with cancellation via Recharge API
   - Send confirmation to both emails
4. If OTP expired or invalid:
   - Reply: "The verification code has expired. Please reply to this message to start a new verification process."
5. If no response within 24 hours:
   - Escalate to supervisor for manual review

### 1.6 Verification Staging

Critical: \`verification_staging.json\` must persist the following for each pending verification:
- customer_email, subscription_id, verification_code, created_at, expires_at, status
- retryCount, last_action

This prevents memory loss on bridge restart. Flood writes to this file after every state transition.

If LLM returns no action tag, or returns \`undetermined\`:
1. Increment \`retryCount\` on the request
2. Set \`needsInvestigation: true\` (next poll cycle re-processes)
3. Set \`retryAt: now + 5 min\`
4. Send generic holding reply to customer
5. Max retries: 3. After 3 → keep as \`detected\` (manual review via \`process_stuck_customers.js\`)

---

## SECTION 2A: Retention Strategy (Phase 2 — Branch A)

### Sếp policy 2026-05-18 — RETENTION ESCALATION LADDER

**Money out is LAST RESORT.** Try free tools first, then partial revenue
loss, then deferred cost, ONLY then real refund. Track \`retention_history\`
in staging — Tier 4 forbidden as first offer.

\`\`\`
TIER 1 → TIER 2 → TIER 3 → TIER 4
DELAY   DOWNSALE  CREDITS   CANCEL/REFUND
$0      ~-30%rev  deferred  ACTUAL $ OUT
\`\`\`

### Tier 1 — DELAY (offer FIRST regardless of LTV)

| Action | Use when |
|---|---|
| Pause 30/60/90 days | Default for any cancel intent |
| Skip next charge only | "Lần này thôi" / "just this month" |
| Reschedule next charge date | Customer wants control over timing |
| Change frequency (monthly→2-mo→4-mo) | "Too much volume", "I have too many" |

**Cost: $0.** No OTP needed (free actions). Template:

\`\`\`
Hi [Name],

Sorry to hear you're considering cancelling. Before we do that — would you
like to pause your subscription for 30, 60, or 90 days instead? You keep
your spot, no charges, change your mind anytime.

If that doesn't suit, we can also:
- Skip just the next charge and resume after that
- Switch to a different frequency (every 2 or 4 months instead)

Just reply with your preference and we'll set it up.

With care,
Wellness Nest Team 💚
\`\`\`

### Tier 2 — DOWNSALE (only after Tier 1 rejected)

| Action | Use when |
|---|---|
| Smaller pack (3-mo bundle → 1-mo) | "Too expensive right now" |
| Lower-tier product variant | Volume too much, want lighter version |
| Switch to monthly billing | "Cam kết dài quá", anti-commitment |

**Cost: 20-40% revenue per cycle.** Goal: retain 60-80% of recurring revenue.
Template asks customer to pick — OTP required for confirmation.

### Tier 3 — CREDITS (only after Tier 1+2 rejected)

| Action | Amount |
|---|---|
| Store credit toward next purchase | $20-50 |
| Free 1 month on subscription (time-credit) | 1 cycle free |
| VIP discount code, valid 60 days | 20-30% off |

**Cost: deferred, non-cash.** OTP required. Template:

\`\`\`
Hi [Name],

I understand the pause/swap options don't fit your situation. As an
alternative, we'd like to offer you a $[20-50] store credit to use whenever
you're ready, or a free month on us. The credit doesn't expire.

Reply with this code to claim: [6-DIGIT-OTP]

With care,
Wellness Nest Team 💚
\`\`\`

### Tier 4 — CANCEL or REFUND (LAST RESORT, money out)

ONLY allowed after Tier 1+2+3 have been offered AND rejected (audit trail in
\`retention_history\`), OR when a hard-rule trigger fires (see below).

| Action | Condition |
|---|---|
| Cancel clean (no refund) | Tiers 1-3 rejected, customer just wants to leave |
| Partial refund 10-25% | Tiers 1-3 rejected + good rapport |
| Full refund + return label | Defective/damaged product |
| Full refund + medical handling | Allergic reaction |
| Full refund + reship correct product | Wrong product shipped |
| Full refund (90-day guarantee) | Customer insists within 90 days |
| Full refund + legal escalation | Legal/fraud claim |

**HARD RULE**: If LLM proposes Tier 4 without retention_history showing
≥2 rejected tiers AND no hard-rule trigger → mark request \`needs_supervisor_review\`
and STOP. Do not execute.

### Mood-aware shortcuts

| Mood | Behavior |
|---|---|
| Calm + first complaint | Full ladder T1→T2→T3→T4, one tier per email |
| Frustrated | T1 + T3 together (offer both, let customer pick) |
| Angry/threatening | Skip to T3 (credits) or T4 (refund) — don't waste time |
| Abusive | Do not engage — escalate via \`process_stuck_customers.js\` |

### Reason-driven offer selection

LLM tag \`[[REASON:...]]\` drives Tier 1 sub-choice:

| Reason | Best Tier 1 |
|---|---|
| \`price\` / \`finance\` | Skip next charge, change to lower frequency |
| \`too_much_volume\` | Change frequency to longer interval |
| \`product_quality\` | Skip + ask for specifics (may escalate to Tier 4 if defective) |
| \`delivery\` | Reschedule + 17track investigation (not a real cancel intent) |
| \`life_change\` | Pause 90 days (long break) |
| \`defective\` / \`allergic\` / \`legal\` | **SKIP to Tier 4 full refund immediately** |

### OTP Generation & Confirmation

Tier 1 actions (pause/skip/reschedule) — **no OTP needed**, low-friction.
Tier 2+ actions — OTP required (6-digit, 24h expire):

1. Generate random 6-digit code
2. Store in staging file with \`tier\`, \`offer_details\`, \`confirmation_code\`
3. Set \`status\` to \`confirmation_sent\`
4. Customer must reply with exact OTP to proceed

### Phase 2 Staging Persistence — NEW SCHEMA (2026-05-18)

\`confirmation_staging.json\` per pending request MUST persist:

\`\`\`json
{
  "customer_email": "...",
  "subscription_id": "...",
  "current_tier": 2,
  "retention_history": [
    {"tier": 1, "offer": "pause_30d", "outcome": "rejected", "ts": "2026-05-18T10:00:00Z"},
    {"tier": 2, "offer": "downsale_monthly", "outcome": "sent", "ts": "2026-05-18T11:00:00Z"}
  ],
  "reason_detected": "price",
  "mood_detected": "calm",
  "confirmation_code": "837291",
  "expires_at": "2026-05-19T11:00:00Z",
  "status": "confirmation_sent"
}
\`\`\`

Flood-write after every state transition. Used by \`retention_ladder.py\`
orchestrator and \`retention_analytics.py\` daily roll-up.

### Full Refund (90-Day Guarantee)

| Situation | Action |
|-----------|--------|
| Product defective/damaged | Full refund + return label |
| Wrong product shipped | Full refund + return + correct product shipped |
| Allergic reaction | Full refund + medical concern handling |
| Customer INSISTS on full refund (within 90 days) | Honor the guarantee |

### When to Decline / Offer Discount Only

| Situation | Action |
|-----------|--------|
| Outside 90-day window | Explain policy, offer 10-20% discount on next order |
| Suspected fraud | Investigate, follow dispute handling SOP |
| Customer abusive/threatening | Do not engage — escalate via process_stuck_customers.js |
| Multiple refund requests | Review history, offer one-time solution at lowest tier |

### OTP Generation & Confirmation

Every retention offer email MUST include a **6-digit numeric OTP code**:

1. Generate random 6-digit code (e.g., \`837291\`)
2. Store in the bridge pending request with \`confirmation_code\` field
3. Set \`status\` to \`confirmation_sent\`
4. Customer must reply with exact OTP code to proceed
5. OTP expires after 24 hours
6. If code expired → set status to \`expired\`, re-contact customer with new offer

### Phase 2 Staging Persistence

**Critical:** \`confirmation_staging.json\` must persist the following for each pending request:
- customer_email, subscription_id, action_type, confirmation_code, offer_details
- created_at, expires_at, status
- retryCount, last_action

This prevents memory loss on bridge restart. Flood writes to this file after every state transition.

---

## SECTION 2B: Direct Cancellation (Phase 2 — Branch B)

### When Mode is \`direct_confirmation\` OR Customer Rejects Offer

If customer insists on cancellation after retention offer (or they came in already confirmed):

1. **Confirm intent** — Ask once: *"Just to confirm, you'd like to proceed with cancellation?"*
2. **Balance check** — Check for unused subscription balance (prepaid months):
   - If balance exists → Notify customer: *"You have X unused balance. We'll process a refund for that."*
   - If no balance → Proceed directly
3. **Final confirmation** — Customer must reply with OTP code (or ESL "Yes")
4. **Execute cancellation** via Recharge API (see Section 3)

### Cancellation Confirmation Email Template
\`\`\`
Hi [Name],

We've processed your subscription cancellation as requested.

Here's what to expect:
- Your subscription has been cancelled as of today
- Any unused balance will be refunded within 5-7 business days
- You'll receive a confirmation email from our payment processor

If you change your mind, you're always welcome to resubscribe.

Thank you for being part of Wellness Nest.

With care,
Wellness Nest Team 💚
\`\`\`

---

## SECTION 3: Execution (Phase 3 — confirmed → executed)

### 3.1 Recharge API Commands

When request status reaches \`confirmed\`, trigger \`executeRechargeAction()\`:

#### Cancel subscription
\`\`\`
POST /subscriptions/{id}/cancel
Headers:
  X-Recharge-Access-Token: {api_key}
  Content-Type: application/json
Body: {}
\`\`\`

#### Pause subscription
\`\`\`
PUT /subscriptions/{id}
Headers:
  X-Recharge-Access-Token: {api_key}
  Content-Type: application/json
Body: {"subscription": {"status": "PAUSED", "pause_next_charge_date": "YYYY-MM-DD"}}
\`\`\`

#### Skip next charge
\`\`\`
DELETE /subscriptions/{id}/charges/queued
Headers:
  X-Recharge-Access-Token: {api_key}
  Content-Type: application/json
\`\`\`

Or use the Recharge skip endpoint via \`scripts/recharge_execute.py\`:
\`\`\`bash
python3 scripts/recharge_execute.py --action skip --subscription 694711793
\`\`\`

### 3.2 Shopify Order Integration

After Recharge cancellation:
1. Check if there are open Shopify orders linked to this subscription
2. If yes → Send cancellation note via Shopify API
3. Update order tags: \`cancel-requested\` → \`cancel-confirmed\`
4. Skip this step if no open orders exist (this is a subscription, not a one-time)

### 3.3 Confirmation Tracking

Once executed:
1. Send final confirmation email to customer
2. Update request status → \`executed\`
3. Log to SLA metrics file (\`logs/sla_metrics.jsonl\`)
4. Update \`confirmation_staging.json\` to reflect completed status
5. If applicable, update Obsidian memory log (see Section 5 protocol)

### 3.4 Retry Logic

**3 retries max, 5-minute intervals between each:**
1. On first API failure → wait 5 min, retry
2. On second failure → wait 5 min, retry
3. On third failure → log as \`execution_failed\`, flag for manual review
4. Track which API endpoint failed to help diagnose credential issues

Common API failure patterns:
- Recharge 404: Subscription already canceled — log and move on (no retry needed)
- Recharge 400: Bad request — check payload (retries unlikely to help)
- Recharge 503: Service unavailable — safe to retry
- Network timeout — safe to retry
- Claudible API 503 → switch to DeepSeek (see Section 6)

---

## SECTION 4: API Chain & Error Handling

### API Priority Chain

Current (as of 2026-05-04 update):
\`\`\`
DeepSeek → Claudible → Fallback
\`\`\`

Previous chain (replaced due to Claudible 400 errors):
\`\`\`
Claudible → DeepSeek → Fallback
\`\`\`

**Note:** The priority order may change based on real-time health. The chain is configured in \`worker_with_recharge.js\`.

### API Error Handling

| Error | Action |
|-------|--------|
| Claudible API 503 / 400 | Switch to DeepSeek immediately, log the switch |
| DeepSeek 503 | Switch to Fallback |
| Recharge 404 (sub not found) | Log as \`subscription_gone\` and move on — no retry |
| Recharge 402 | Check \`auth-profiles.json\` for expired API key |
| LLM returns no \`[[ACTION:]]\` tag | Retry with \`retryCount\` incremented, max 3 |
| Network timeout on any API | Retry after 5 min |

### OTP Errors

| Issue | Action |
|-------|--------|
| Customer replies with wrong code | Re-send with new code, note the mismatch attempt |
| OTP expired (past 24h) | Set status to \`expired\`, re-contact customer with fresh offer + new code |
| OTP found but match fails on bridge restart | Check \`confirmation_staging.json\` persistence — codes survive restarts |

---

## SECTION 5: Crash Recovery

### 5.1 Stuck Request Detection

A request is "stuck" when:
- Status is \`detected\` for >2 hours
- Less than 3 retries attempted
- No recent SLA logging update (no activity in last hour)

**Detection script:**
\`\`\`bash
python3 scripts/daily_operations_recovery.py
\`\`\`

This runs on bridge startup and daily cron. It:
1. Checks bridge PM2 status
2. Verifies SLA logging activity (last 1 hour)
3. Finds stuck "detected" requests (>2h, <3 retries) → requeues them with \`needsInvestigation: true\`
4. Checks MiniMax + DeepSeek API health
5. Logs all to \`logs/recovery_health.jsonl\`

### 5.2 Bridge vs Gateway Restart

**CRITICAL DISTINCTION:** Gateway restart ≠ bridge restart.

- **Gateway restart:** Managed by \`scripts/crash_recovery_system.py\` (monitors every 30s, auto-restarts, validates credentials, sends Telegram alert)
- **Bridge restart:** NOT covered by crash_recovery_system.py. Bridge runs as a separate PM2 process. On bridge crash:
  - PM2 auto-restarts the bridge process
  - \`daily_operations_recovery.py\` runs on bridge startup (via PM2 restart hook)
  - Stuck Phase 2 requests get requeued for LLM re-analysis
  - MiniMax + DeepSeek API health verified

### 5.3 Manual Stuck Customer Processing

For requests stuck >24h where automated recovery didn't work:
\`\`\`bash
node scripts/process_stuck_customers.js --action execute --subscription {id}
\`\`\`

This bypasses the OTP flow and directly executes the requested action. Use sparingly.

### 5.4 What to Check on Startup

When the system starts or after a crash:

1. **SLA logging activity** — Check \`logs/sla_metrics.jsonl\` for recent timestamps
2. **Stuck "detected" requests** — Check \`logs/pending_confirmation_requests.json\`
3. **MiniMax + DeepSeek health** — Run API health check (see daily_operations_recovery.py)
4. **confirmation_staging.json** — Verify persistence file is intact (OTP codes preserved)
5. **PM2 status** — \`pm2 status\` to check email-bridge and any other processes
6. **drp_auto_recovery.sh** — NOTE: This has been REPLACED by daily_operations_recovery.py. Do not use.

---

## SECTION 6: Metric Tracking & Auditing

Every action MUST be timestamped and auditable. Record to:

### SLA Metrics File
\`\`\`jsonl
{"timestamp":"2026-05-05T05:00:00Z","customer":"email@example.com","phase":"detection","action":"cancel","latency_seconds":120}
{"timestamp":"2026-05-05T05:02:00Z","customer":"email@example.com","phase":"retention_offer","action":"partial_refund_30pct","offer_accepted":false}
{"timestamp":"2026-05-05T05:05:00Z","customer":"email@example.com","phase":"execution","action":"cancel_subscription","status":"success"}
\`\`\`

### NS Metrics to Watch
- NS#1: Response time <7 min (420s target, Phase 1 set to 180s)
- NS#2: OTIF >98% (handled by ns2_tier1/2/3 automation scripts)
- NS#3: Refund rate <3% (partial refunds preferred over full refunds)
- NS#4: Churn 5-7% (retention offers directly impact this)

### Phase 1-3 Conversion Report
\`\`\`bash
python3 scripts/daily_phase1_3_report.py
\`\`\`
Generates daily stats on: detected → offer sent → confirmed → executed conversion rates.

---

## SECTION 7: Quick Reference — Full Pipeline Sequence

This is the complete sequence from start to finish:

\`\`\`
1. CUSTOMER EMAILS → Bridge receives email
2. INTENT DETECTION → LLM checks for cancel/pause/skip keywords (multilingual)
3. CHARGE WINDOW CHECK → next_charge ≤ 7 days? PAUSE FIRST
4. AUTO-PAUSE (if needed) → Recharge API PUT status=PAUSED
5. LLM ANALYSIS → Returns [[ACTION:...]] and [[MODE:...]] tags
6a. MODE=needs_offer → Check LTV tier → Send retention offer with OTP → Status=confirmation_sent
6b. MODE=direct_confirmation → Confirm intent → Skip to Phase 3
7. CUSTOMER REPLIES with OTP → Validate code (24h window)
8. STATUS=confirmed → Execute action via Recharge API
9. STATUS=executed → Send confirmation email → Log metrics
10. FAILURE → Retry logic (x3, 5 min intervals) → Log error → Flag for manual if needed
\`\`\`

### Confirmation_staging.json State Machine

\`\`\`
detected → (with OTP sent) → confirmation_sent → (OTP validated) → confirmed → (API success) → executed
                ↓                                       ↓
            (no OTP needed)                 (OTP expired) → expired → re-contact
                ↓
           retry(x3 max, 5min intervals) → escalation
\`\`\`

---

## EXAMPLES

### Example 1: High LTV Customer Cancel Request

**Input:** Email from moniquerenaudin@yahoo.fr: "Je veux annuler l'envoi"
- Step 1: Detect French → cancel intent
- Step 2: Check next_charge = April 25 (2 days away) → PAUSE
- Step 3: Auto-pause subscription via Recharge API
- Step 4: Check customer: 5 orders, $1200 spent → HIGH LTV
- Step 5: Send retention offer: "40% partial refund? Reply with OTP 837291"
- Step 6: Customer accepts → OTP validated → Action: cancel + process partial refund
- Step 7: Status = executed, send confirmation

### Example 2: New Customer Delivery Delay

**Input:** Email: "I want to cancel, my package is late"
- Step 1: Detect English → cancel intent
- Step 2: Check next_charge = Nov 15 (22 days away) → no pause needed
- Step 3: Check customer: 1 order, $79.99 → NEW customer
- Step 4: Send retention offer: "20% discount on this order? Reply with OTP"
- Step 5: Customer accepts → Partial refund processed → Subscription continues
- Step 6: Status = executed (subscription not cancelled, but offer accepted)

### Example 3: Customer Insists on Cancel

**Input:** Email: "No, I want to cancel. Process it please."
- Step 1: Detect cancel intent
- Step 2: Check charge window → PAUSE if ≤7 days
- Step 3: LLM returns \`[[MODE:direct_confirmation]]\` (customer refusing offer)
- Step 4: Send: "To confirm, please reply with OTP 482193"
- Step 5: Customer sends OTP → Validate → Execute cancel via Recharge API
- Step 6: Check balance → Process unused balance refund if any
- Step 7: Send cancellation confirmation email`,
  "wismo": `---
name: wismo
description: Handle customer Where Is My Order inquiries — multilingual detection, 17track lookup, Shopify fulfillment check, and template response based on tracking status.
---

# WISMO Protocol Skill

Complete protocol doc: \`~/Documents/claude-obsidian/wiki/operations/wismo-protocol.md\`

## Trigger Phrases

When a customer email or message matches any pattern below, flag as WISMO and follow this skill.

**English:** "where is my order", "order status", "tracking", "track my package", "when will it arrive", "estimated delivery", "haven't received", "still waiting", "shipping status", "did it ship", "any update on my order"

**French:** "où est ma commande", "suivi de commande", "statut de la commande", "quand vais-je recevoir", "pas reçu", "suivi de colis", "numéro de suivi"

**German:** "wo ist meine Bestellung", "Sendungsverfolgung", "Lieferstatus", "Bestellstatus", "wann kommt", "nicht erhalten", "Versand", "Sendungsnummer"

**Italian:** "dov'è il mio ordine", "stato dell'ordine", "tracciamento", "quando arriva", "non ho ricevuto", "spedizione"

**Spanish:** "dónde está mi pedido", "seguimiento", "estado del envío", "cuándo llega", "no he recibido"

**Portuguese:** "onde está meu pedido", "rastreamento", "código de rastreio", "status da entrega", "não recebi"

## Step 1: Detect

The email bridge or session gateway should apply a \`WISMO\` label when the inbound message matches trigger patterns. Detection should scan:

- Email subject line
- First 200 characters of email body
- Telegram/group chat messages mentioning order numbers

Once detected: immediately proceed to Lookup without waiting. Speed matters (NS#1: <7 min response).

## Step 2: Lookup

### Priority Sequence

**A. Shopify — order info**

Run \`scripts/shopify_lookup.py <customer_email>\` to get:
- Order number (format \`#WNXXXXXX\`)
- Fulfillment status (fulfilled / partial / null)
- Tracking numbers from fulfillments
- Created date, line items, total price

If the customer provided an order number directly in the message, use it instead of email lookup. Query Shopify orders API directly with the order name.

*Edge case:* If no order found by email, ask for order number. Some customers write from a different email than their Shopify account.

**B. 17track — tracking status**

For each tracking number found (from Shopify or provided by customer):

\`\`\`
POST https://api.17track.net/track/v2.2/gettrackinfo
Headers: 17token: {TOKEN}, Content-Type: application/json
Body: {"number": "TRACKING_NUMBER"}
\`\`\`

Extract from response:
- \`track_info.latest_status.status\` — primary status enum
- \`track_info.latest_status.sub_status\` — granular reason
- \`track_info.latest_event.time_iso\`, \`.location\`, \`.description\` — current event
- \`track_info.milestone[]\` — key milestones (Delivered, Returned, Pickup)
- \`track_info.time_metrics.days_of_transit\` and \`.days_after_last_update\`
- \`track_info.shipping_info\` — sender/recipient country

If tracking is rejected (not on our account), try:

\`\`\`
POST https://api.17track.net/track/v2.2/register
Body: {"number": "TRACKING_NUMBER", "auto_detection": true}
\`\`\`

For YunExpress prefixes (YSD, WNBAA, VR, XYYEX), try carrier code \`190008\` or \`190798\`. Reference \`scripts/failed_deliveries_pipeline.py\` for the full auto-registration logic (lines ~160-230).

**C. Lark Base Failed Deliveries**

Check if order exists in Failed Deliveries table (\`tblrQO1qZHBEfUgF\`):
- Match by order number
- If found, read \`Fail Delivery Reason\`, \`Pati Response\`, \`Best Action (Auto)\`
- Don't duplicate work already done by the failed deliveries pipeline

**D. Best 3PL / Flexport (manual escalation)**

Only needed when:
- 17track NotFound AND Shopify fulfilled >7 days ago
- Tracking Expired
- Customer reports damage or theft post-delivery

## Step 3: Classify

Map 17track status to decision:

| Status | Customer Message | Action |
|--------|-----------------|--------|
| \`NotFound\` | "Tracking not found" | Check if order shipped. If yes: carrier hasn't scanned yet, reassure. If no: order is being prepared. |
| \`Transit\` | Package moving | Share latest location, days in transit, estimated delivery window |
| \`Transit: InfoReceived\` | Carrier notified | First scan pending (1-2 days) |
| \`Transit: OutForDelivery\` | On delivery truck | Usually delivers same/next day |
| \`Pickup\` | Ready for pickup | Share pickup location and hold period |
| \`Delivered\` | Marked delivered | Confirm with customer, suggest checking neighbors |
| \`Exception: address_issue\` | Address problem | Request corrected address |
| \`Exception: recipient_not_available\` | No answer | Offer re-delivery |
| \`Exception: refused\` | Refused | Ask why, offer resend or refund |
| \`Exception: returning\` | Returning to sender | Inform, offer resend or refund when returned |
| \`Exception: expired\` | Pickup expired | Package is returning, offer options |
| \`Exception: undeliverable\` | Can't deliver | Escalate to Best 3PL |
| \`Expired\` | No update >30d | Offer replacement or refund |
| \`REJECTED\` | Not in 17track | Try register+requery, or fallback to yuntrack.com |

## Step 4: Respond

### Response Templates (bilingual EN + FR)

Use these templates, substituting \`{ORDER_NUMBER}\`, \`{LATEST_LOCATION}\`, \`{LATEST_TIME}\`, \`{DAYS_IN_TRANSIT}\`, \`{DAYS_AGO}\`, \`{CREATED_DATE}\`, \`{DELIVERED_TIME}\`, \`{EVENT_DESCRIPTION}\` from the 17track response.

**not_found:**
- EN: "Your order \`{ORDER_NUMBER}\` was placed on \`{CREATED_DATE}\`. The tracking number hasn't been scanned by the carrier yet. This is normal — tracking typically activates within 24-48 hours. I'll auto-check in 48 hours and update you."
- FR: "Votre commande \`{ORDER_NUMBER}\` a été passée le \`{CREATED_DATE}\`. Le numéro de suivi n'a pas encore été scanné — cela prend généralement 24 à 48 heures. Je vérifierai dans 48 heures."

**transit:**
- EN: "Your order \`{ORDER_NUMBER}\` is in transit. Current location: \`{LATEST_LOCATION}\`. Last update: \`{LATEST_TIME}\` (\`{DAYS_AGO}\` days ago). Days in transit: \`{DAYS_IN_TRANSIT}\`. International shipments typically arrive in 7-14 business days. I'll keep monitoring."
- FR: "Votre commande \`{ORDER_NUMBER}\` est en transit. Emplacement actuel : \`{LATEST_LOCATION}\`. Dernière mise à jour : \`{LATEST_TIME}\`. Délai estimé : 7 à 14 jours ouvrés. Je continue de suivre."

**pickup:**
- EN: "Your order \`{ORDER_NUMBER}\` is ready for pickup at \`{LOCATION}\`. Carrier holds packages for 7-14 days. Please arrange pickup. If you need alternatives, let me know."
- FR: "Votre commande \`{ORDER_NUMBER}\` est prête à être récupérée à \`{LOCATION}\`. Le transporteur conserve les colis 7 à 14 jours. Répondez-moi si besoin d'aide."

**delivered:**
- EN: "Your order \`{ORDER_NUMBER}\` was delivered on \`{DELIVERED_TIME}\`. If you received it, great! If not, check with neighbors, building reception, or around your property. Reply if still missing."
- FR: "Votre commande \`{ORDER_NUMBER}\` a été livrée le \`{DELIVERED_TIME}\`. Vérifiez auprès de vos voisins. Si vous ne trouvez toujours pas, répondez-moi."

**exception (address):**
- EN: "Your order \`{ORDER_NUMBER}\` couldn't be delivered due to an address issue. Carrier reported: \`{EVENT_DESCRIPTION}\`. Please reply with your correct shipping address and I'll arrange re-delivery."
- FR: "Votre commande \`{ORDER_NUMBER}\` n'a pas pu être livrée en raison d'un problème d'adresse. Le transporteur indique : \`{EVENT_DESCRIPTION}\`. Veuillez confirmer votre adresse."

**exception (missed delivery):**
- EN: "Delivery was attempted but no one was home for order \`{ORDER_NUMBER}\`. I can arrange a re-delivery. Let me know if there's a better time or a safe drop-off location."
- FR: "La livraison a été tentée pour \`{ORDER_NUMBER}\` mais personne n'était présent. Je peux organiser une nouvelle livraison."

**exception (returning):**
- EN: "Your order \`{ORDER_NUMBER}\` is being returned to us. Once it arrives, I can resend it or process a refund. Which do you prefer?"
- FR: "Votre commande \`{ORDER_NUMBER}\` nous est retournée. Je peux la renvoyer ou procéder à un remboursement. Que préférez-vous ?"

**expired:**
- EN: "Your order \`{ORDER_NUMBER}\` has been in transit for \`{DAYS_IN_TRANSIT}\` days without recent updates. Options: (1) Replacement at no cost, (2) Full refund, (3) Continue monitoring. Which works for you?"
- FR: "Votre commande \`{ORDER_NUMBER}\` est en transit depuis \`{DAYS_IN_TRANSIT}\` jours sans mise à jour. Options : (1) Remplacement gratuit, (2) Remboursement complet, (3) Continuer à surveiller."

### Language Selection

Respond in the language the customer wrote in. If the email is in:
- English → use EN template
- French → use FR template
- German → translate EN template to German (formal "Sie")
- Italian → translate EN template to Italian
- Spanish → translate EN template to Spanish / use FR as base (similar phrasing)

## Step 5: Follow-up

### Auto-Follow-Up Triggers

**5-day no-update:** If \`days_after_last_update\` >= 5, schedule proactive outreach:
"I'm checking on order \`{ORDER_NUMBER}\`. No tracking update since \`{LAST_EVENT_DATE}\`. International delays happen — still within normal range. I'll keep monitoring."

**14-day in transit:** If \`days_of_transit\` > 14 for international or > 7 for domestic, proactively offer assistance:
"Your order \`{ORDER_NUMBER}\` is taking longer than usual (\`{DAYS}\` days). I'm investigating with the carrier and will update you within 24 hours."

**Delivery confirmation:** If Delivered but no customer reply in 48h, send follow-up:
"Hi! Did order \`{ORDER_NUMBER}\` arrive safely? Reply YES or NO."

### When Not to Auto-Follow-Up

- Customer already replied acknowledging delivery
- Subscription orders (Recharge handles status)
- Orders where customer explicitly said "please don't contact me"

## Script Reference

- \`scripts/shopify_lookup.py\` — Customer/order lookup by email → JSON
- \`scripts/query_17track_batch.py\` — Batch 17track register + query + classify (handles auto-registration and carrier fallbacks)
- \`scripts/failed_deliveries_pipeline.py\` — Full pipeline with Lark + 17track + emails (reference for 17track error handling and YunExpress carrier codes)
- \`scripts/send_customer_email.py\` — SMTP email dispatch with templates

## Error Recovery

| Problem | Fix |
|---------|-----|
| 17track returns 403 | Token expired. Check \`.api-credentials.json\` \`17track.api_token\` |
| 17track returns 429 | Rate limited. Add 1s delay between batches of 40 |
| Shopify returns empty orders | Customer may have used different email. Ask for order number |
| Tracking number not recognized | Try \`POST /register\` first, then re-query |
| YunExpress tracking (YSD/WNBAA) | Try carrier 190008, fallback to yuntrack.com |
| Tracking not found but order shipped | Best 3PL may not use 17track-trackable carriers. Escalate via Lark |`,
  "failed-deliveries": `---
name: failed-deliveries
description: Handle failed delivery orders from Best 3PL feed. Cover the full lifecycle: receiving via Lark Base, 17track enrichment for sub-classification, decision tree routing, Pati response generation, direct customer emailing (SMTP), and daily pipeline automation. Trigger on: failed deliveries, delivery exceptions, returned packages, 17track enrichment, delivery problem routing, Best 3PL escalation, address issue handling.
---

# Failed Deliveries Protocol

This is the enhanced protocol for handling delivery-exception orders flowing through Best 3PL's feed. Uses 17track API to auto-classify generic "Delivery failed" into specific reasons, then routes responses via Pati with emoji-prefixed, actionable text.

## Pipeline Scripts

| Script | Purpose |
|--------|---------|
| \`scripts/failed_deliveries_pipeline.py\` | Daily pipeline — fetches, enriches, updates, emails |
| \`scripts/query_17track_batch.py\` | Batch 17track queries with carrier fallback logic |
| \`scripts/bulk_pati_response.py\` | One-shot Pati response rewriter for bulk |
| \`scripts/order_problems_enriched.py\` | Lark Base enrichment pipeline |
| \`scripts/17track_webhook_receiver.py\` | Webhook receiver for 17track push events |
| \`scripts/17track_integration.py\` | Register trackings with 17track from Shopify |

## SECTION 1: Receiving Failed Orders

**Where they come from:** Best 3PL pushes delivery-exception orders into the Lark Base **Failed Deliveries** table (\`tblrQO1qZHBEfUgF\`).

**Duplicate reality:** Some orders appear 2-3x in Best's feed (re-pushes). The pipeline handles this.

**Before creating a record:**
1. Fetch ALL records from Failed Deliveries table
2. Fetch ALL records from **Protocol** table (\`tbltNEqU2JNLpW9M\`)
3. Build a lookup set of \`Order (Trimmed)\` from Protocol
4. ONLY create Protocol records for orders NOT already in Protocol

**API Endpoint pattern (Lark Base):**
\`\`\`python
token = requests.post(
  'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
  json={'app_id': APP_ID, 'app_secret': APP_SECRET}
).json()['tenant_access_token']

# Paginate records
records = []
page_token = None
while True:
  params = {'page_size': 100}
  if page_token: params['page_token'] = page_token
  r = requests.get(f'https://open.larksuite.com/open-apis/bitable/v1/apps/{WIKI_ID}/tables/{table_id}/records',
    headers={'Authorization': f'Bearer {token}'}, params=params)
  data = r.json().get('data', {})
  records.extend(data.get('items', []))
  page_token = data.get('page_token')
  if not page_token: break
\`\`\`

## SECTION 2: 17track Enrichment

Query ALL unique tracking numbers from Failed Deliveries table via 17track batch API (40 per batch). Two-pass system:

**Pass 1:** Auto-detect carrier, query in batches of 40.
**Pass 2:** For \`YSD*\`, \`WNBAA*\`, \`VR*\`, \`XYYEX*\` prefixes still showing \`NotFound\`, re-query with carrier \`190798\` (DHL eCommerce partner).

**Creds:**
- 17track token: \`3DA025EE5593145660E367220E0B90D3\`
- Endpoint: \`https://api.17track.net/track/v2/gettrackinfo\`

**Response mapping (status + sub_status + description → sub-type):**

| 17track Signal | Sub-Classification | Expected % |
|----------------|-------------------|------------|
| Status=Delivered or delivered_time exists | \`Delivered_Confirmed\` | ~50% |
| Status=Returned or returned_time exists | \`Returned_To_Sender\` | ~12% |
| Status=Exception + description has "return"/"returning" | \`Returning_To_Sender\` | ~6% |
| Status=NotFound or REJECTED | \`Tracking_Not_Found\` | ~18% |
| Status=Exception + address-related description | \`Incorrect_Address\` | varies |
| Status=Exception + no-answer description | \`Attempted_Delivery_No_Answer\` | varies |
| Status=Exception + refused description | \`Recipient_Refused\` | varies |
| Status=Exception + generic "failed" desc | \`Delivery_Failed_Unknown\` | ~14% |
| Status=Pickup | \`Available_For_Pickup\` | varies |
| Status=Expired | \`Expired_No_Update\` | varies |
| Status=InTransit (but Best says failed) | \`In_Transit\` | rare — carrier false positive |

**Classification function:**
- If \`returned_time\` is set → \`Returned_To_Sender\`
- If \`delivered_time\` is set → \`Delivered_Confirmed\`
- If \`picked_up_time\` is set → \`Picked_Up\`
- Parse \`latest_event.description\` for keywords: \`address\`, \`refused\`, \`return\`, \`pickup\`, \`failed\`, \`expired\`
- Parse \`sub_status\` for: \`address_issue\`, \`recipient_not_available\`, \`refused\`, \`returning\`
- Fallback to \`Delivery_Failed_Unknown\`

## SECTION 3: Sub-Classification Decision Tree

| Problem | Action | Pati Emoji | What Happens |
|---------|--------|-----------|--------------|
| Pickup (warehouse) | Contact customer for pickup | 📮 | Customer notified, auto-reminder 48h |
| Delivery failed | Carrier investigation | 🚚 | Ask Best for failure reason + tracking screenshot |
| Refused/Unclaimed | Resend to new address | ↩️ | Offer resend (with fee) or refund (minus shipping) |
| Address issues | Contact customer for address | 📍 | Customer for correction, Flexport validation |
| Overdue | Carrier investigation | ⏳ | 17track query, customer notified, Best investigate |
| Delivered (false positive) | Removed - false positive | ✅ | Remove from queue, verify with customer |
| Tracking not found | Carrier investigation | ❓ | Best verify tracking number |

**Best Action (Auto) field** — multi-select mapped from decision:
- \`Contact customer for pickup\` — pickup records
- \`Contact customer for address\` — address issues
- \`Resend to new address\` — refused/returned
- \`Pickup information needed\` — rare
- \`Carrier investigation\` — delivery failed/overdue
- \`Skipped - no action needed\` — in transit
- \`Removed - false positive\` — 17track shows delivered

**Resend Status pipeline:**
1. Pipeline sets \`Resend Status = Awaiting customer\` when \`Best Action = Resend to new address\`
2. Email bridge contacts customer → customer replies with new address
3. Pipeline/bridge updates \`New Address\` field + \`Resend Status = Ready to resend\`
4. Best reads → ships → sets \`Resend Status = Reshipped\`

## SECTION 4: Pati Response Generation

Every response MUST have:
1. Order number prefix \`[#WN123456]\`
2. Emoji prefix matching the subtype
3. **The real tracking status from 17track** (not "Escalating to Best")
4. Actionable instruction for the recipient (Best / Customer)

**Templates by sub-type:**

\`\`\`
[#WN203372] 🚚 Delivery attempted — no answer. Customer contacted for new attempt.

[#WN203300] 📍 Invalid address (address_issue). Customer contacted for correction.

[#WN202270] ↩️ Package refused. Customer offered resend (with fee) or refund.

[#WN203375] ↩️ Package returning to sender (Exception_Returning). Await return → resend/refund.

[#WN200983] ✅ 17track shows DELIVERED (delivered, IT). Verify with customer. Remove if confirmed.

[#WN203582] ❓ Tracking not found on 17track. Best: verify tracking number.

[#WN201026] 🚚 17track shows IN TRANSIT. Still moving — monitor 48h.

[#WN200344] 📮 Available for pickup. Customer notified with pickup instructions.

[#WN203218] ⏳ Package expired — no update since 2026-04-20. Best: investigate lost.

[#WN203355] 🚚 Delivery exception at Milano — 17track: Exception_Returning (in return). Best: contact carrier.

[#WN203582] 📋 No failure reason recorded. Escalating to Best 3PL for status check.
\`\`\`

**Email vs Best routing:**
- If customer has email AND action is emailable (\`address\`, \`pickup\`, \`returning\`, \`delivered_confirm\`) → pipeline sends SMTP email directly. Response gets prefix: \`✅ Emailed customer (Contact customer for address) ...\`
- If no email OR action is \`Carrier investigation\` → response gets prefix: \`[Best: Carrier investigation] ...\`
- Rate limit: 10 emails per pipeline run, 500ms delay between sends

**SMTP config:** \`smtp.larksuite.com:465\`, from \`support@wellnessnest.co\`

## SECTION 5: Pipeline Automation

**Cron schedule:** Daily at 9 AM (Asia/Saigon) via OpenClaw cron or crontab.

**Pipeline flow (failed_deliveries_pipeline.py):**
\`\`\`
Step 1: Authenticate to Lark Base
Step 2: Fetch ALL Failed Deliveries records
Step 3: Fetch ALL Protocol table records
Step 4: Dedupe check: cross-reference order numbers
Step 5: Collect all tracking numbers → batch query 17track (40 per batch, 2-pass)
Step 6: Classify each record using 17track data
Step 7: Create Protocol records for truly new orders
Step 8: Generate Pati Responses (reason-specific + 17track-enriched)
Step 9: Send customer emails (max 10/run, 500ms spacing)
Step 10: Update Pati Response + Best Action (Auto) + Resend Status fields
Step 11: Save report to logs/failed_deliveries_pipeline_YYYYMMDD.json
\`\`\`

**Running it:**
\`\`\`bash
cd ~/.openclaw/workspace/agents/timcook
python3 scripts/failed_deliveries_pipeline.py
\`\`\`

**Log:** \`logs/cron_failed_deliveries.log\`

**17track registration fallback:** Best 3PL prefixes (\`YSD*\`, \`WNBAA*\`, \`VR*\`, \`XYYEX*\`) may not be registered on 17track. Pipeline auto-registers them with the correct carrier ID from the mapping below. If they still show \`NotFound\`, re-query with carrier \`190798\` (DHL eCommerce partner). Manual fallback: check Best 3PL portal directly for the real carrier tracking number.

**Carrier mapping:** VR→190012 (YANWEN), WNBAA→190086 (Wanb Express), XYYEX→190340 (XYY Express), YSD→190798 (YSDPOST), YT→190008 (YunExpress), SYRM→190072 (SUNYOU).

---

## SECTION 8: Pickup Follow-Up Protocol (2026-05-05)

### Trigger
Orders where \`Fail Delivery Reason\` contains \`pickup\`, \`pick up\`, \`unclaimed\`, or where \`Tracking Status\` = \`AvailableForPickup\`/\`Pickup\`.

### Follow-Up Flow

**Step 1: Initial Email (Day 0)**
- Generate Pati response with [📮] prefix
- Send SMTP email to customer's email address
- Set \`Resend Status\` → \`Awaiting customer\`
- Increment \`Email Resent Count\` → 1 in both Failed Deliveries and Protocol tables

**Step 2: 2nd Reminder (48h after step 1)**
- Check: \`Email Resent Count\` >= 1 AND < 2 AND no reply from customer
- Generate 2nd reminder email with ⚠️ FINAL REMINDER subject line
- Warn: package will be returned to sender if not collected in 48h
- Increment \`Email Resent Count\` → 2
- If customer replied: set \`Resend Status\` → \`New address received\` or resolve

**Step 3: Escalation (72h after step 2 / 5 days total)**
- If still no pickup: \`Resend Status\` → \`Ready to resend\`
- Contact Best 3PL for resend to new address or warehouse return
- Offer customer exchange/refund if package is already returned

### API Execution
\`\`\`python
# Update Lark Failed Deliveries table
token = get_lark_token(creds)
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
requests.put(
    f'https://open.larksuite.com/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/tblrQO1qZHBEfUgF/records/{record_id}',
    headers=headers,
    json={'fields': {
        'Resend Status': 'Awaiting customer',
        'Pati Response': email_body[:500]
    }}
)

# Also update Protocol table if order exists there
requests.put(
    f'https://open.larksuite.com/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/tbltNEqU2JNLpW9M/records/{protocol_record_id}',
    headers=headers,
    json={'fields': {
        'Email Resent Count': str(count),
        'Pati Response': email_body[:500]
    }}
)
\`\`\`

### Email Templates

**First reminder:**
Subject: 📮 Your package is ready for pickup! - Order {order_num}
Body: Your package is available for pickup. Please collect to avoid return to sender.

**Second reminder (48h later):**
Subject: ⚠️ FINAL NOTICE - Your package is still waiting! - Order {order_num}
Body: This is your second reminder. If not collected within 48 hours, the package will be returned to sender at your cost.

### Monitoring
- Run \`scripts/scrub_tracking_status.py --pickup-followup --update-lark\` daily at 9 AM
- Report: count of pickup orders by Resend Status
- Alert if any order remains in "Awaiting customer" for > 7 days`,
  "address-email-protocol": `# Address Email Protocol

This is the protocol for handling address verification emails when a delivery fails due to an incorrect address.

## 1. Email Templates

### Email 1: Initial Verification Request

**Subject:** Your Wellness Nest order needs address confirmation

**Body:**
Hi {first_name},

We tried delivering your order #{order_number}, but the carrier couldn't complete delivery.

Could you confirm your shipping address is correct?

{address}

If anything is wrong, just reply with your correct address and we'll update it right away.

If the address looks right, reply "Address is correct" and we'll arrange re-delivery.

Thanks,
Wellness Nest Support

### Email 2: Follow-up Reminder

**Subject:** Quick follow-up about your Wellness Nest order

**Body:**
Hi {first_name},

Just checking in — we still haven't heard back about your order #{order_number}.

Your package couldn't be delivered to:

{address}

Without a confirmed address, we can't arrange re-delivery. Please reply with:
- "Address is correct" if it's right, or
- Your correct address if it needs updating

We want to make sure you get your order!

Thanks,
Wellness Nest Support

### Email 3: Final Notice

**Subject:** Final notice: your Wellness Nest order #{order_number}

**Body:**
Hi {first_name},

We've tried reaching you a few times about your order #{order_number}.

If we don't hear from you within 5 days, the package may be returned to us and your order will be refunded.

Please reply to confirm or update your address so we can get this sorted.

Thanks,
Wellness Nest Support

## 2. Send Cadence & Intervals

- **Email 1:** Sent immediately when the record is detected (Day 0)
- **Email 2:** Sent 72 hours after Email 1 (Day 3)
- **Email 3:** Sent 96 hours after Email 2 (Day 7)

## 3. Action Status Values

The following status values are used to track the progress of each address verification:

- \`None\` - Initial state, no email sent yet
- \`Email 1 Sent\` - First email sent
- \`Email 2 Sent\` - Second email sent
- \`Email 3 Sent\` - Third email sent
- \`Customer Replied\` - Customer has replied with their response
- \`Address Updated\` - Address has been successfully updated in Shopify
- \`Closed\` - Issue resolved (either addressed or closed after final notice)

## 4. Automation Script

Yes, I have built a script to automate this entire workflow:

- **Script path:** \`scripts/address_email_automation.py\`
- **Functionality:**
  - Reads the Lark Base table for records where "Action Needed = Contact customer for address"
  - Sends emails according to the cadence above
  - Updates the "Action Status" field in Lark Base
  - Logs all sent emails to \`logs/address_emails_sent.jsonl\`
- **Usage:**
  - \`python3 scripts/address_email_automation.py\` - Dry run (no sends)
  - \`python3 scripts/address_email_automation.py --send\` - Actually send emails
  - \`python3 scripts/address_email_automation.py --status\` - Show current state

## 5. Cron Job Setup

To ensure this automation runs daily, I recommend setting up a cron job:

\`\`\`bash
# Daily at 8:00 AM SGT (Asia/Saigon)
0 8 * * * cd ~/.openclaw/workspace/agents/timcook && python3 scripts/address_email_automation.py --send
\`\`\`

This will check for any new address verification records and send emails as needed.

## 6. Customer Reply Handling

When a customer replies to any of these emails, the email bridge will capture the message and update the corresponding Lark Base record. The system will then automatically set the status to \`Customer Replied\`, which triggers the next step in the workflow.

## 7. North Star Alignment

This protocol directly supports our North Star metrics:

- **NS#2: On-time-in-full delivery >98%** - By resolving address issues quickly, we prevent delivery failures
- **NS#3: Refund rate <3%** - By offering customers a chance to fix their address before refunding
- **NS#4: Monthly churn 5–7%** - By maintaining positive customer relationships through proactive communication

All actions are logged to \`memory/YYYY-MM-DD.md\` for auditability.`,
  "sentiment-handling": `---
name: sentiment-handling
description: Detect emotional sentiment, switch to careful empathy mode with customer-favoring authority + anti-abuse check. Timcook resolves to completion, never hands off.
---

# Sentiment Handling (Emotional Mode)



## R3: This skill OWNS emotional gate (single source of truth)

\`escalation-protocol\` Cat A no longer has "emotional" trigger — that has been BANNED to avoid sentiment ⟂ refund-flow ⟂ escalation triple-overlap (R3 fix 2026-05-06).

Sentiment-handling fires FIRST when emotional markers detected. Within sentiment mode:
- If action = refund → call \`refund-flow\` as PRIMITIVE (passes \`caller="sentiment"\` flag)
- If action = replacement → call refund-flow with replacement option
- If action = courtesy credit → execute directly within sentiment skill

→ Sentiment is the ORCHESTRATOR for emotional cases. refund-flow is PRIMITIVE.
→ escalation-protocol is for non-emotional triggers ONLY (legal, medical, post-ship address, 3+ unanswered, >100% demand).

## Triggers — fire if ANY:

**A. Negative sentiment keywords (multi-language):**
- EN: frustrated, angry, ridiculous, never again, scam, ripoff, horrible
- DE: wütend, frustriert, Betrug, schrecklich
- FR: en colère, frustré, arnaque, scandaleux
- IT: arrabbiato, truffa, scandaloso
- ES: enojado, estafa, horrible

**B. Emotional intensifiers (formatting):**
- ALL CAPS rant: >50% caps in a message ≥30 chars
- 3+ exclamation marks
- Trailing "!!!", "???", "!?!?"
- Multi-paragraph venting (≥3 paragraphs of complaint)

**C. Repeat-complaint pattern:**
- Same customer + same issue + 3+ messages within 24h
- Customer ignored last 2 timcook replies + tone escalating

**D. Negative emoji escalation:** 😡 😤 🤬 💢

## Mode change actions when fired

### 1. Empathy-first reply
- Acknowledge feelings explicitly BEFORE any solution
- Use customer's first name
- Short sentences, plain language
- Avoid: "I understand your concern", "As an AI", "Per our policy"

### 2. Customer-favoring authority bias
- Refund/credit: auto-grant up to 100% order value (per refund-flow) — SUBJECT TO ANTI-ABUSE CHECK below
- Replacement: prefer over partial refund if logistics feasible
- Courtesy credit: default offer
- Decision rule: ≤ 100% order value AND would resolve concern AND anti-abuse check passes → grant without asking

### 3. Slower + stricter verification
- Re-read full thread before responding
- Double-check facts via API call (order_id, amount, status, ship date)
- Anti-hallucination guards tighter (per \`context-discipline\` BUT-trap rule)
- Tool timeout → say "I'm checking this — give me a moment", do NOT claim done

### 4. Tone calibration
- First-person ownership: "I'm taking care of this right now"
- Specific commitment: "I'm processing $X refund for order #Y now"
- Time-bound: "You'll see this on your card in 5-7 business days"
- No corporate jargon, no formal closures

### 5. Outcome log
- Tag in \`memory/YYYY-MM-DD.md\`: emotional=true, tone_start=<negative_marker>, action_taken=<refund_amount/replacement/etc>
- Track: did customer's tone improve in last reply? Said thanks?

## When NOT to fire

- Single word ALL CAPS for emphasis ("I REALLY need this Friday")
- Pure transactional + slight irritation ("when will my order arrive??")
- Single emoji in otherwise calm message
- Language conventions (German nouns capitalized)

## Anti-abuse check (BEFORE auto-grant 100%)

Before processing emotional-mode refund, ALWAYS check abuse pattern first.

### Step 1: Search refund history

Use \`read\` tool: \`memory/refund_history.jsonl\`
Filter: customer_email matches AND timestamp within last 6 months AND reason starts with "emotional"
Count matches.

### Step 2: Decision branch

**If count < 2:**
- Proceed normal emotional-mode auto-grant
- After grant: append to \`memory/refund_history.jsonl\` with \`reason="emotional"\`

**If count >= 2:**
- Do NOT auto-grant 100% yet
- Switch to evidence-request mode (Step 3)

### Step 3: Evidence request (when threshold hit)

Reply asking for specific evidence — empathetic tone, NOT accusatory:

> "Hi [Name], I want to make sure we resolve this right. To process the refund, can you share:
> 1. A photo or video of the issue (if product is damaged or defective)
> 2. The specific reason this order didn't work (delivery, quality, expectation)
>
> Once I have those details, I'll get this sorted out for you immediately."

Then verify in parallel using available evidence sources:

| Source | What to check | How |
|---|---|---|
| **Shopify** | order delivery_status, fulfillment_status, financial_status | \`shopify_execute.py\` query order_id |
| **17track** | tracking events, delivery proof, exception codes | \`.api-credentials.json → 17track.api_token\` |
| **Lark Base failed_deliveries** | Is order in official ops-confirmed problem list? | Existing Lark integration. If yes → auto-grant (legitimate confirmed) |
| **Recharge state** | Customer's pause/cancel/restart pattern | \`recharge_execute.py\` functions |
| **Chargeflow disputes** | Has customer filed chargebacks before? | Chargeflow API credentials |
| **Refund:order ratio** | Total $ refunded ÷ Total $ ordered (all-time) | Compute from \`memory/refund_history.jsonl\` + Shopify order count. **>50% = red flag** (normal customers <10%) |

### Step 4: Final decision

Based on evidence + customer reply:

- **Evidence supports legitimate issue** (Lark Base entry, 17track exception, photo of defect, delivery problem confirmed) → grant 100% refund. Tag \`reason="emotional_verified"\`. Genuine 3x bad luck happens.
- **Evidence ambiguous** (order delivered fine, customer claims dissatisfaction, no concrete proof) → offer 50% refund OR full replacement (their choice). Tag \`reason="emotional_partial"\`.
- **Evidence shows abuse pattern** (refund:order ratio > 50%, chargebacks history, claim contradicts delivery proof) → do NOT grant. Reply: *"Hi [Name], based on our records I'm unable to process another refund without [specific evidence]. If you can provide [photo/details], I'll review again."* Tag \`reason="emotional_blocked"\`.
- **Customer doesn't reply with evidence within 48h** → close ticket, no grant. Tag \`reason="emotional_no_evidence"\`.

### Step 5: Always log decision

Append to \`memory/YYYY-MM-DD.md\`:
> \`2026-05-05 14:30 — Anti-abuse triggered for sarah@email.com (3 prior emotional refunds, ratio 65%). Decision: blocked. Evidence requested.\`

## Worst case (still no human handoff)

If after emotional mode + anti-abuse check + appropriate decision, customer still demands more:
- Reaffirm what's been done: "I've already processed your full refund of $X — that's the maximum I can do"
- Acknowledge feelings without conceding more: "I understand this isn't what you wanted to hear"
- Offer thread continuity: "If anything else comes up, this thread reaches me directly"
- Do NOT continue arguing
- Log to \`memory/YYYY-MM-DD.md\` with tag: \`pushback_after_max_refund\`

## Examples

**Customer all-caps, first emotional refund (count=0):**
> Input: "I HAVE BEEN WAITING 3 WEEKS!!! THIS IS RIDICULOUS!!! Refund NOW!!!"
> Timcook: anti-abuse check → 0 prior → proceed.
> Reply: "Hi Sarah, I hear you and you're right — 3 weeks is way too long. I've processed your full refund of $X for order #Y right now. You'll see it on your card in 5-7 business days. I'm sorry we let you down."
> Append \`refund_history.jsonl\` with \`reason="emotional"\`.

**Same customer 2 months later, 3rd emotional refund (count=2):**
> Input: "Worst service ever!!! Refund immediately!!!"
> Timcook: anti-abuse check → 2 prior emotional → switch to evidence mode.
> Reply: "Hi Sarah, I want to make sure we resolve this right. Can you share a photo or video of the issue, and the specific reason this order didn't work? Once I have those details, I'll get this sorted out for you immediately."
> Verify in parallel: Shopify shows delivered, 17track shows signature received. No defect evidence.
> Customer replies with photo of damaged box → grant 100%, tag \`reason="emotional_verified"\`.
> Customer doesn't reply within 48h → close, tag \`reason="emotional_no_evidence"\`.

**Customer threatens lawyer (legal trigger from escalation-protocol Cat A #2, also fires emotional):**
> Input: "If you don't refund me today, I'm calling my lawyer and BBB."
> Timcook: anti-abuse check → 0 prior → proceed.
> Reply: "Hi [Name], I take this seriously. I've just processed your full refund of $X for order #Y — you'll see it in 5-7 business days. I'm flagging this with our team for further review. If anything else comes up, this thread reaches me directly."

## Cross-references
- \`skills/refund-flow/SKILL.md\` — emotional-mode cap = 100% order value, executes refund
- \`skills/escalation-protocol/SKILL.md\` — Category A trigger 6 defers here
- \`skills/context-discipline/SKILL.md\` — anti-hallucination + tone discipline
- \`memory/refund_history.jsonl\` — historical refund tracking (for anti-abuse search)`,
  "escalation-protocol": `---
name: escalation-protocol
description: Two-category protocol — Category A (customer escalations, handle in-conversation) and Category B (system alerts, post to PATI group). Timcook never hands customer to human mid-conversation.
---

# Escalation Protocol

Timcook is full-automate. Customer escalations are NEVER handed off mid-conversation. Timcook resolves in-conversation using customer-favoring authority. System operational alerts are posted to the PATI group telegram chat where humans read them.

## Category A — Customer-facing (handle in-conversation)

Triggers:
1. **Refund/credit > 100% order value** → execute 100% refund + reply per refund-flow rules
2. **Legal-threat language**: lawyer, BBB, attorney, "filing complaint", chargeback, credit-card threat
3. **Medical reaction**: allergic, rash, illness, ER, hospitalized
4. **Address change post-shipment**
5. **3+ unanswered emails** from same customer in 24h

Action per trigger:

**Trigger 1 (>100%)** — see refund-flow skill, reject excess in-conversation. No team mention.

**Trigger 2 (legal threat)** — auto-grant within authority (up to 100% refund) + formal acknowledgment:
> "Hi [Name], I take this seriously. I've processed your full refund of $X for order #Y — you'll see it in 5-7 business days. I'm flagging this with our team for further review. If anything else comes up, this thread reaches me directly."

**Trigger 3 (medical reaction)** — empathy + auto-refund + recommend doctor:
> "Hi [Name], I'm so sorry to hear this. I've processed your full refund of $X for order #Y immediately, and I'm flagging this with our team for further review. Please consult your doctor about the reaction — your health comes first. If there's anything else I can do, this thread reaches me directly."

**Trigger 4 (address post-ship)** — use \`exec\` tool to attempt carrier API. If fails, arrange replacement at no charge (per refund-flow authority).

**Trigger 5 (3+ unanswered)** — proactive re-engage with context summary.


Always log decision + outcome to \`memory/YYYY-MM-DD.md\`.

## ORCHESTRATOR / PRIMITIVE COORDINATION (R4)

When escalation Cat A trigger fires (legal/medical/>100%/post-ship-address/3+unanswered), this skill is the ORCHESTRATOR. Refund-flow is invoked as PRIMITIVE within the action.

**Rule**: refund-flow MUST NOT fire independently when escalation has already detected the same case. Avoid double-execution.

Decision flow:
1. Customer message arrives → check Cat A triggers FIRST
2. If trigger matched → run escalation action (which calls refund-flow as primitive)
3. Refund-flow receives \`caller="escalation"\` flag → execute API call without re-checking triggers
4. Single reply, single API call, single audit log entry

If multiple triggers match (e.g., medical + >100%), use highest-severity rule (medical = trigger 3 priority).


## Category B — System alerts (post to PATI group, NOT customer)

Triggers (system signals, not customer):
1. sendMessage / external API fails 3+ consecutive times
2. North Star metric drift > 5% in 24h
3. Tool returns 5xx from Shopify/Recharge/Klaviyo/Chargeflow/17track
4. Bridge process down or no emails polled > 10 min — **fire only AFTER \`bridge-crash-recovery\` skill exhausts auto-recovery (2 retry attempts). PATI alert is last resort, not first response.**

Action: send to PATI group via \`message\` tool with \`channel=telegram, target=-5295288516\`:

\`\`\`
🚨 [SYSTEM ALERT] {trigger}
Context: {2-3 sentence summary}
Affected: {customers/sessions/orders impacted}
Recommended action: {what should happen, if anything}
Logs: {session_id or log path}
\`\`\`

- Append to \`memory/YYYY-MM-DD.md\`
- Do NOT inform any customer
- Do NOT ping individual operators (DMs) — group has humans who read it

## Boundaries

- Never escalate routine queries (order status, tracking, sub pause/skip) — handle directly per WISMO/refund-flow skills
- Never CC customer on system alert
- Never promise customer "I've escalated to my supervisor" — timcook resolves in-conversation
- Never lie about action taken (per \`context-discipline\` anti-hallucination rules)
- "Team" language in customer-facing replies (Triggers 2, 3) is intentional brand voice — timcook represents the brand collectively even though full-automate

## Cross-references
- \`skills/refund-flow/SKILL.md\`
- \`skills/sentiment-handling/SKILL.md\`
- \`skills/context-discipline/SKILL.md\``,
  "chargeflow-collect-evidence": `---
name: chargeflow-collect-evidence
description: |
  Collect and upload supporting evidence for ChargeFlow disputes (chargebacks).
  Two-layer architecture:
  1) Python core (this skill's scripts/) — proven, reliable: list disputes, inspect, upload, verify
  2) Agent + Playwright MCP — flexible navigation: Shopify lookup, Lark Mail thread capture, LLM evidence curation
trigger:
  - User asks to "process disputes", "collect dispute evidence", "handle chargebacks"
  - User gives a dispute ID or PP-R-* reference
  - Daily/weekly cron checking ChargeFlow Optimize Dispute queue
---

# ChargeFlow Collect Evidence — Skill v5 (hardened 2026-05-18)

## CRITICAL OPERATIONAL RULES (added 2026-05-18 after multi-hour incident)

These rules came out of a real outage where load avg hit 276, Chrome had 49 zombie
processes, and the cron monitor silently reported "All clear" while every upload
failed for hours. Read these BEFORE touching the pipeline.

### Rule 1 — Preflight session check is MANDATORY before any submit run

Every \`chargeflow_dispute_monitor.py --submit\` invocation runs \`session_warmer.py
--check-only\` FIRST. If Chargeflow / Shopify / Lark Mail browser sessions are
dead (any redirected to login page), the monitor aborts with rc=2 and the
session_warmer (cron every 20 min) sends a Lark alert to \`openclaw-alerts\`.

Never run an upload pipeline assuming sessions are alive. The old failure mode
was: precondition_lark_account.py timed out trying to find "Other Accounts" in
a logged-out tab, returned non-zero, submit_evidence stored the error in
\`entry["evidence_result"]\` but the cron's terminal report only counted
\`state==manual\` (not the error result) so the operator saw "All clear".

### Rule 2 — Browser sessions DIE periodically (must be warmed)

Lark Mail, Shopify Admin, and Chargeflow sessions expire from inactivity, even
when Chrome's user-data-dir profile is preserved. Cookies need page-load
activity to refresh. The \`com.pati.session-warmer\` LaunchAgent runs every
20 min: navigates to each service, checks if redirected to /auth/login/lookup,
alerts Lark if dead. Don't disable it.

When sessions DO die, re-auth requires GUI access (Tailscale screen share
to \`vnc://100.94.220.128\`). Chrome flag \`--no-startup-window\` masks the issue
because there's no tab to navigate-and-refresh cookies — keep at least one
real tab on launch.

### Rule 3 — Every CDP script MUST close its tabs (try/finally)

Pre-2026-05-18 the pipeline leaked ~50+ tabs per dispute cycle (one new tab
per dispute per script × 4 scripts × 12 disputes + 5 satellite stripe/cookiebot
tabs per chargeflow page load). Chrome accumulated 81 tabs and 49 processes
burning 850% CPU on auth-retry loops.

**Pattern for every Playwright script in this skill:**

\`\`\`python
page = await ctx.new_page()  # NEVER reuse via "if dispute_id in p.url" — stale state bleeds
try:
    # ... navigation, upload, screenshot work ...
finally:
    try:
        await page.close()
    except Exception:
        pass
\`\`\`

The substring-match reuse (\`if did in p.url\`) was a bug source for two reasons:
- Short prefixes match the wrong dispute (e.g. \`6a02761914\` and \`6a02761a\` share
  8 chars)
- Stale tab state from previous failed navigation causes "upload UI not
  reachable" bails

**Backstop**: \`session_warmer.py\` cleanup pass closes tabs by host quota
(\`LEAKY_HOSTS\`) every 20 min. Hosts with quota=0 (stripe, cookiebot, accounts.*)
get killed unconditionally. Hosts with quota=N keep newest N, close older.

### Rule 4 — PNG-only upload (three-layer guard)

Legacy code uploaded \`evidence_Shopify<ORDER>.txt\` via REST API. The .txt files
took up category slots (max 5 per category) without adding evidence value.
**Never upload non-image files.** Enforced at three layers:

1. **Manifest builder** in \`chargeflow_dispute_monitor.py\` only appends files
   matching \`*.png\`. The hardcoded list is \`04-mail-*.png\`, \`05-tracking-*.png\`,
   \`02-shopify-orders.png\`, \`03-shopify-order-detail.png\`.

2. **Pre-flight filter** in \`cf_upload.py\` \`main()\` drops any manifest entry
   whose extension is not in \`ALLOWED_EXTS = {".png", ".jpg", ".jpeg", ".gif",
   ".pdf"}\`, logs them as "Pre-flight: rejected N non-image file(s)".

3. **Per-file guard** in \`cf_upload.py\` \`upload_one()\` returns
   \`("badext", filename, ...)\` before calling \`set_input_files()\` if extension
   isn't allowed.

Cleanup for historical .txt: \`cf_delete_junk.py <dispute_id>\` — opens each
category, clicks trash icon next to non-PNG rows (CF DOM: \`<div class="left">
filename</div>\` sibling to \`<div class="right"><span><svg fill="#D1293D">\`),
confirms "Delete file" modal, polls 8s for DOM update.

### Rule 5 — Triage states and the optimize_needs_evidence override

\`cf_triage.py\` classifies into 5 states. Monitor's loop processes
\`state in ('manual', 'optimize_needs_evidence')\`, NOT just \`manual\`.

| State | UI signal | Action |
|---|---|---|
| \`cf_auto\` | "Evidence will be submitted by Chargeflow" + no submit btn | skip |
| \`submitted\` | "evidence was submitted to the bank" | skip |
| \`manual\` | submit button visible, no auto message | process |
| \`optimize_needs_evidence\` | Inquiry stage OR (cf_auto + addl-evidence nav visible) | **process** |
| \`no_action\` | nothing matches | skip but log |

**Inquiry-stage override**: PayPal Inquiry disputes (stage=="Inquiry") always
classify as \`optimize_needs_evidence\` regardless of UI text — the "submitted"
regex sometimes falsely matches Inquiry boilerplate.

### Rule 6 — Cron jobs.json sessionKey must match delivery channel

\`~/.openclaw/cron/jobs.json\` entries have BOTH \`sessionKey\` (runtime auth
context) AND \`delivery\` (where the result goes). They must agree:

\`\`\`json
{
  "sessionKey": "agent:timcook:feishu:group:oc_5712feff0ac72fa8c607322bf0a2056b",
  "delivery": {"channel": "feishu", "to": "oc_5712feff0ac72fa8c607322bf0a2056b"}
}
\`\`\`

If \`sessionKey\` says Telegram but the agent's \`message(action="send",
channel="feishu", target=...)\` call fires, the gateway rejects with
\`Cross-context messaging denied: action=send target provider "feishu" while
bound to "telegram"\`. This silently bricks daily reports.

After editing jobs.json, restart gateway: \`launchctl kickstart -k
gui/$(id -u)/ai.openclaw.gateway\`. Gateway loads jobs.json once at startup.

### Rule 7 — Tracking capture URL gotchas

\`cf_tracking_capture.py\` uses 17track only — Yanwen (\`track.yanwen.com\`) is
dead DNS (\`No answer\`, 2026-05-18). URL must be \`https://t.17track.net/en?nums=<TRACK>\`
NOT \`#nums=<TRACK>\`. Hash-fragment URLs don't fire \`wait_until="domcontentloaded"\`
reliably and leave the tab in a half-loaded state that breaks subsequent gotos.

Always \`page.goto("about:blank")\` between attempts to clear any
\`chrome-error://chromewebdata/\` residue from prior failures.

### Rule 8 — Avoid fire-and-forget subprocess spawn in long-running daemons

The email-bridge previously did
\`\`\`js
const p = spawn('python3', [spamClassifier, json]);
p.on('close', ...);
setTimeout(() => { /* empty */ }, 5000);
\`\`\`
without awaiting. Node's SIGCHLD reaper got overwhelmed at ~8 spawns/sec, leaving
122 zombie processes and load avg 230+. If you need async classification,
either properly \`await\` or use a worker-pool pattern with concurrency cap.

The spam_classifier itself was also hardcoded to a dead Qwen API key — it had
been failing fast for days but the bridge kept respawning. Always log a
heartbeat from periodic subprocesses so dead dependencies surface.

---

## Tested ground truth (2 disputes end-to-end)

| Case | Dispute ID | Order | Reason | Amount | Final inventory |
|---|---|---|---|---|---|
| Hana Hahn  | 69fd83f628e5e845841fabbb | #WN202090 | Not as Described | 46.76 EUR | CC: 5, Tracking: 1 (all uploaded by us) |
| Alfredo Del Pia | 69df844ebfcb31b75e6636ef | #WN203589 | Not Received | 93.52 EUR | CC: 1 (CF auto), Tracking: 3 (2 CF auto + 1 us) |

The Python upload pipeline (cf_upload.py) is the load-bearing component. **Use it as-is**
unless ChargeFlow renames the testids below.

## Critical insight: ChargeFlow auto-collects for "Managed" disputes

When a dispute is **"Managed by Chargeflow"** (toggle ON), ChargeFlow itself ingests:
- **Customer Communication**: an order receipt screenshot (\`#<ORDER>_order.png\`)
- **Tracking Information**: carrier tracking page snapshot (\`.html\`) + screenshot (\`.png\`),
  named like \`#<ORDER>_tracking_<TRACK>.png\`

So **don't duplicate Chargeflow's work**. Our role is to ADD value-add evidence:
- Custom emails from Lark Mail (Chargeflow can't see our inbox)
- Shopify Admin order detail with repeat-customer count + subscription history
- Internal context Chargeflow wouldn't know

Always run \`cf_inspect_categories.py\` (or check \`01-current-attachments.json\`) **before**
building the upload manifest, so you don't over-fill a category and get rejected past the
5-file cap.

## Selectors (verified 2026-05-11)

| Element | Selector |
|---|---|
| Open upload UI (left nav) | \`[data-testid="additional-evidence-nav"]\` |
| Customer Communication card | \`[data-testid="cust-comm-evidence-type"]\` |
| Tracking Information card | \`[data-testid="tracking-info-evidence-type"]\` |
| Supplemental Evidence card | \`[data-testid="addtl-notes-evidence-type"]\` |
| File input (per category) | \`input[type="file"]\` |

Constraints: max **5 files per category**, **5 MB per file**, formats JPG/JPEG/GIF/PNG/PDF.

If a category card already has a green check ✅, files are already attached. Click the
card to see the existing list (cf_inspect_categories.py).

## Prerequisites

1. **Chrome with CDP** running on \`localhost:9222\`. Run \`setup_chrome.sh\` if needed —
   it launches Chrome with \`--remote-debugging-port=9222\` and opens 3 login URLs:
   ChargeFlow, Shopify Admin, Lark Mail. The user logs in once; sessions persist
   in \`~/.openclaw/chrome-cdp-profile/\`.
2. **Python3 + playwright-core** (\`pip3 install playwright\`).
3. Evidence directory: \`~/.openclaw/workspace/agents/timcook/dispute-evidences/<dispute_id>/\`
4. Optional but recommended: open the dispute tab in Chrome before invoking — the scripts
   will reuse it instead of opening a new one.

## Folder structure (per dispute)

\`\`\`
~/.openclaw/workspace/agents/timcook/dispute-evidences/<dispute_id>/
├── 00-manifest.json              # final manifest (case meta + final inventory + defense narrative)
├── 00-dispute-meta.json          # raw scrape from cf_inspect_dispute.py
├── 01-dispute-summary.png        # ChargeFlow dispute page
├── 01-dispute-upload-ui.png      # upload modal state at start
├── 01-current-attachments.json   # what's already attached at start
├── 02-shopify-orders.png         # Shopify search result
├── 03-shopify-order-detail.png   # order detail (DELIVERED status, tracking, customer email)
├── 04-mail-N.png                 # Lark Mail customer thread screenshots (numbered)
├── 05-tracking-N.png             # carrier tracking page screenshots
├── 06-pre-upload.png             # state before our upload
├── 07-post-upload.png            # state after our upload
├── 99-upload-result.json         # per-file success/fail from cf_upload.py
└── 99-upload-manifest.json       # the upload manifest we built (input to cf_upload.py)
\`\`\`

**Naming convention** (load-bearing — cf_upload.py reads filenames as-is from manifest):
- Customer comm: \`04-mail-{N}.png\`
- Tracking: \`05-tracking-{N}.png\`
- Supplemental: \`06-supp-{N}.png\`

## End-to-end procedure

## HARD RULE — Store identity verification (Wellness Nest, NOT Wellness Nest DE)

Wellness Nest customer support handles **only the main \`Wellness Nest\` store**, NOT
the \`Wellness Nest DE\` (Germany) store. Disputes from DE orders are out of scope —
leave them for the DE team. Uploading evidence to a DE dispute, or pulling order
data from the DE store for a non-DE dispute, is a hard error.

**Before Phase 2 (Shopify capture), the agent MUST verify the current store:**

1. Take a screenshot of the Shopify Admin top-right (the area next to the bell icon).
2. The store badge must read exactly **"Wellness Nest"** with the **WN** avatar (pink/magenta).
3. If it reads **"Wellness Nest DE"** with the **WD** avatar (purple): WRONG STORE.
4. Recovery: click the store badge → store switcher dropdown opens → click
   "Wellness Nest" (the entry with the green check mark). Wait, then re-screenshot
   to confirm the badge now shows "Wellness Nest".
5. Cross-check URL: correct store path contains \`/store/wellnessnest1/\`. The DE
   store contains a different identifier (\`wellnessnest-de\` or similar).
6. If after one switch attempt the store still cannot be confirmed as "Wellness
   Nest": abort this dispute case with error code \`WRONG_STORE:<observed_name>\`
   and move on.

This check is LLM-based (visual). Use \`playwright__browser_take_screenshot\` to
capture the badge region, then read the store name and decide. Do not skip the
visual confirmation just because the URL looks right — the URL can lag after a
manual store-switch click.

---

### Phase 0: Setup
\`\`\`bash
# Ensure Chrome CDP is up
curl -s http://localhost:9222/json/version || ./setup_chrome.sh
# Pick a dispute (or get from user)
python3 scripts/cf_list_disputes.py
\`\`\`

### Phase 0 (MANDATORY) — UI triage gate

Before any inspection, upload, or evidence collection, **run cf_triage.py**. The
ChargeFlow API status \`needs_response\` is misleading — it means "case is open with
the bank", NOT "merchant must act". The UI shows the real state. Acting on a
CF-managed dispute wastes effort and may interfere with CF's own submission.

\`\`\`bash
/usr/bin/python3 scripts/cf_triage.py
# writes /tmp/cf_triage.json with per-dispute classification:
#   cf_auto    — page says "Evidence will be submitted by Chargeflow" → SKIP
#   submitted  — page says "evidence was submitted to the bank by the merchant" → SKIP
#   manual     — neither → act on this one
\`\`\`

**HARD RULE**: only the disputes classified \`state=manual\` proceed to Phases 1-6.
For \`cf_auto\` and \`submitted\`, do nothing. Report counts in a single Lark message:

\`\`\`
📋 Chargeflow Dispute Triage — <DD Mon YYYY HH:MM> ICT

API needs_response: <total>
🟢 cf_auto (CF handles): <N> — skipped
✅ submitted (done): <N> — skipped
🔴 manual (act): <M>

<If M > 0, proceed with Phases 1-6 per dispute. If M == 0, end here.>
\`\`\`

If \`cf_triage.json\` is older than 30 minutes, re-run it — CF state can change as
they auto-collect evidence.

### Phase 1: Inspect the target dispute
\`\`\`bash
DID=<dispute_id>
EVID=~/.openclaw/workspace/agents/timcook/dispute-evidences/$DID
mkdir -p "$EVID"
python3 scripts/cf_inspect_dispute.py "$DID" "$EVID"
\`\`\`
This writes \`00-dispute-meta.json\` and \`01-current-attachments.json\`. **Read both
files** to know:
- What's the order number and chargeback reason
- What's the tracking number (often pre-populated by ChargeFlow)
- Are there already files attached? (Don't re-upload — you'll hit the 5-file cap)

**Trap**: ChargeFlow often shows fields as \`‌\` (zero-width non-joiner) when its
backend hasn't finished indexing the dispute. If \`customer_email\` is empty/zwnj, fall
through to the Shopify lookup in Phase 2 to get it.

### Phase 2 — Shopify capture

> [!warning] HARD RULE applies: verify store is **Wellness Nest** (NOT Wellness Nest DE) BEFORE running cf_shopify_capture.py. See top of this skill for recovery steps.


For "Not Received", "Not as Described", "Fraudulent" disputes — Shopify order detail
is essential:

\`\`\`
playwright__browser_navigate https://admin.shopify.com/store/wellnessnest-eu/orders
# wait for page
playwright__browser_snapshot                         # accessibility tree
playwright__browser_press_key Tab Tab Tab            # focus the search field, or
playwright__browser_type "<ORDER_NUMBER>" Enter      # search by order #
# screenshot result
playwright__browser_take_screenshot 02-shopify-orders.png fullPage=true
playwright__browser_click <order row>
playwright__browser_take_screenshot 03-shopify-order-detail.png fullPage=true
\`\`\`

What to extract from \`03-shopify-order-detail.png\`:
- Customer name + email
- Order status (Paid? Fulfilled? Delivered?)
- Tracking number + carrier
- Repeat customer indicator (orders count > 1 = strong signal)
- Fulfillment timestamp

**Save the file** to \`$EVID/03-shopify-order-detail.png\` (the gateway CWD writes
default to \`~/.openclaw/\`, so \`mv\` after each shot, or use the MCP output-dir flag).

### Phase 3 — Collect customer communication via Lark Mail (Playwright MCP)

**THIS PHASE IS MANDATORY for ALL dispute reasons:**
- canceled_recurring_billing
- credit_not_processed
- not_received
- not_as_described
- **fraud** (still mandatory — see below)
- Any reason involving customer claims

**For fraud reason specifically:**
Two outcomes are BOTH valid evidence:
1. Customer DID email support → capture threads (proves they tried to resolve; weakens "I didn't make this purchase" claim)
2. Customer did NOT email support → capture \`04-mail-no-communication.png\` (proves customer skipped support, jumped to dispute — important pattern for bank)

DO NOT SKIP Phase 3 for any reason. Always either capture threads OR no-comm screenshot.

> [!danger] If \`04-mail-search-results.png\` exists but no \`04-mail-N.png\` numbered
> screenshots exist, **Phase 3 is INCOMPLETE**. The agent MUST click each result
> and capture each thread individually. Stopping after the search results page is
> a failure, not success.

#### Step 3.0 (MANDATORY HARDLINE) — Switch Lark Mail to support@wellnessnest.co

**ALWAYS execute this switch.** Do NOT skip even if you think Chrome is already on the
correct account. Visual inspection of the sidebar header is UNRELIABLE — the text gets
truncated (e.g., "chanphongat..." vs "support@wellne..." both look similar at small
sizes). The cost of an unnecessary switch is ~5s; the cost of search in the wrong
mailbox is "0 threads found" → wasted Phase 3 → bad evidence.

**Mandatory sequence — execute every step. Do not skip any.**

\`\`\`
1. playwright__browser_navigate https://paticreativeagency.sg.larksuite.com/mail
   playwright__browser_wait_for time=3000

2. playwright__browser_take_screenshot 04-mail-pre-switch.png fullPage=true

3. CLICK "Other Accounts" — element text is literally "Other Accounts" in left sidebar,
   has a red badge with unread count next to it (e.g., "999+" or "40"):
   playwright__browser_click "text=Other Accounts"
   playwright__browser_wait_for time=2000

4. CLICK "support@wellnessnest.co" — appears in the expanded left sidebar:
   playwright__browser_click "text=support@wellnessnest.co"
   playwright__browser_wait_for time=5000   # CF takes 3-4s to switch context

5. VERIFY switch via DOM evaluate (not visual interpretation):
   playwright__browser_evaluate
   () => {
     // Find the active account label in sidebar
     const all = document.querySelectorAll('div, span');
     for (const el of all) {
       const t = (el.innerText || '').trim();
       if (t === 'support@wellnessnest.co') {
         const rect = el.getBoundingClientRect();
         // Active account is in top portion of sidebar (Y < 200), small element
         if (rect.y < 200 && rect.x < 250) {
           return { switched: true, y: rect.y };
         }
       }
     }
     return { switched: false };
   }

6. If \`switched: false\` → repeat step 3-5 ONCE. If still false → abort skill with
   error "LARK_SWITCH_FAILED". Do not proceed to Step 3.1 in wrong mailbox.

7. Take screenshot 04-mail-account-switched.png AFTER verified switch.
\`\`\`

**Auto-fire idempotency**: this skill runs on a cron every hour. The previous run may
have left Chrome on support@wellnessnest.co, but Lark sometimes auto-reverts to the
"default" personal account when the session restarts or after idle period. Always switch
regardless of perceived state.

**Audit JSON requirement** (HARD RULE):
- \`lark_account_switched: true\` requires step 5 returned \`switched: true\`
- \`lark_account: "support@wellnessnest.co"\` required when proceeding to Step 3.1
- If switch failed: \`success: false\`, \`crashed_at_phase: "3.0_lark_switch"\`

#### Step 3.1: Search using Lark Mail header search (NOT cmd+K)

\`\`\`
1. CLICK the header search input at top of Lark Mail UI:
   Element: input[placeholder="Search"] near (246, 21) — there's a magnifying
   glass icon to the left and "⌘K" hint to the right.
   selector: '.larkw-web-header-search-input-wrap' OR 'input[placeholder="Search"]'

   playwright__browser_click '.larkw-web-header-search-input-wrap'
   playwright__browser_wait_for time=1500

2. TYPE customer email + Enter:
   playwright__browser_type "maria.mkfd@hotmail.com"   # use the actual email
   playwright__browser_press_key Enter
   playwright__browser_wait_for time=4000

3. SCREENSHOT search results modal:
   playwright__browser_take_screenshot 04-mail-search-results.png fullPage=true
\`\`\`

**HARD RULE — DO NOT use cmd+K**: cmd+K opens Lark's GLOBAL search (across
Docs/Sheets/Bitable/etc), which does NOT search Mail content. ONLY the header
search input searches Mail.

> [!warning] After Step 3.1, the screen shows a modal with rows like:
> \`\`\`
> [M] maria mkfd <maria.mkfd@hotmail.com>      Apr 26
>     Re: Confirm your subscription change - Wellness Nest
>     PM Προς: maria.mkfd@hotmail.com ...
> \`\`\`
> Each row is a thread. **Take screenshot of the modal but do NOT stop here.**
> The modal alone is NOT useful evidence — bank reviewer needs thread CONTENT.

#### Step 3.2: CRITICAL LOOP — click each thread, screenshot content

After Step 3.1, search results modal shows 1-N threads. Iterate:

\`\`\`
FOR i = 1 to min(5, N):
  1. IDENTIFY row #i in the results modal.
     Strategy A: click by subject text (most reliable):
       playwright__browser_click "text=<thread subject>"
     Strategy B: click by coordinate (fallback):
       Row 1 around Y=250, Row 2 around Y=340, Row 3 around Y=430, etc.
       (each row is roughly 90px tall, modal centered at X≈600)
       playwright__browser_mouse_click x=600 y=(160+i*90)

  2. After click, the thread VIEW opens (replaces modal).
     playwright__browser_wait_for time=3500

  3. Take FULL-PAGE screenshot:
     playwright__browser_take_screenshot 04-mail-\${i}.png fullPage=true

  4. VERIFY screenshot has thread CONTENT visible:
     - Customer name/email visible in header (e.g., "maria mkfd <maria.mkfd@hotmail.com>")
     - At least one message body block visible (greeting, content, signature)
     - If screenshot is blank / shows search modal still / wrong content → redo

  5. Return to search results:
     playwright__browser_navigate_back   # OR
     playwright__browser_press_key Escape

  6. Wait for results modal to reappear, then continue to next thread
\`\`\`

**Numbering convention**: \`04-mail-1.png\`, \`04-mail-2.png\`, ..., \`04-mail-N.png\`
correspond to threads in REVERSE-CHRONOLOGICAL order (newest first as Lark shows).

#### Step 3.3: Fallback if 0 results — CAPTURE "no communication" evidence

If search by customer_email returns zero results EVEN AFTER switching to
support@wellnessnest.co, try in order:

1. First-name search (e.g., "maria")
2. Last-name search (e.g., "Kompo" or "Komp")
3. Email domain (e.g., "hotmail.com")
4. Shopify order number (e.g., "#WN202308")
5. Product name from order (e.g., "Shilajit")

Document attempts in audit JSON under \`lark_search_attempts: [...]\`.

**MANDATORY — if ALL 5 fallback searches return 0 results:**

This is VALUABLE NEGATIVE EVIDENCE for the dispute, NOT a failure. A customer who
files a chargeback WITHOUT first contacting support is a strong signal — proves they
didn't attempt resolution before disputing. The bank reviewer values "merchant was
not given chance to resolve" as part of evidence package.

\`\`\`
1. Re-run the search by customer_email one more time to get a clean
   "0 results / no results found" state in the UI.
2. playwright__browser_take_screenshot 04-mail-no-communication.png fullPage=true
   The screenshot MUST clearly show:
   - The header search bar with the customer's email visible as the active query
   - The empty/no-results state of the search results modal or list
   - support@wellnessnest.co account active in the left sidebar (proves we searched
     the correct inbox)
3. Set audit JSON fields:
   - lark_threads_not_found: true
   - no_communication_evidence_captured: true
   - lark_search_attempts: [list of 5 attempts with "0 results" annotations]
4. Phase 6 manifest MUST include this file:
   {
     "customer_comm": ["04-mail-no-communication.png"],
     "tracking_info": [<tracking PNG if any>],
     "supplemental": [<shopify shots>]
   }
\`\`\`

\`04-mail-no-communication.png\` IS legitimate customer_comm evidence. Upload it.
This applies for ALL dispute reasons (not_as_described, fraud, credit_not_processed,
not_received, etc.) when customer skipped support contact.

#### Verification before Phase 4

Before Phase 4, verify the dispute folder contains at least one file matching
glob \`04-mail-[0-9]*.png\` (NOT \`04-mail-search-*.png\`, \`04-mail-inbox.png\`,
\`04-mail-account-*.png\` — those are navigation artifacts, not thread content).

If only navigation screenshots exist: Phase 3 failed. Re-run Steps 3.0-3.2.

#### Common pitfalls

- **Phong's account has 0 results**: you forgot Step 3.0. Switch account first.
- **cmd+K opens wrong search**: use header \`input[placeholder="Search"]\` instead.
- **Search input loses focus**: use \`playwright__browser_evaluate\` to set value
  directly, then dispatch input/change events.
- **Thread view back-navigation**: use \`playwright__browser_press_key Escape\`
  OR click the back-arrow icon at top-left of thread view.
- **Auto-reply threads from timcook itself**: DO upload (proves responsive
  support); flag in Phase 4 curation as \`auto_reply\`.
- **Greek/Cyrillic/non-ASCII names**: search by email (always ASCII) first;
  fall back to name only if email fails.

### Phase 4: LLM evidence curation

Now you have a folder of candidate screenshots. **Read them visually** (they're already
in your filesystem — use the \`Read\` tool with each PNG path) and label each as:

- **HELPFUL** — supports merchant defense (e.g., DELIVERED status, repeat customer,
  customer asking for return-not-refund, polite tone)
- **NEUTRAL** — context but not directly supportive
- **HARMFUL** — could hurt our case (e.g., customer alleging product never arrived
  with believable detail, our agent making mistake) — **NEVER UPLOAD**

For each HELPFUL/NEUTRAL screenshot, decide a category:
- \`customer_comm\` — customer↔merchant emails
- \`tracking_info\` — Shopify order showing fulfilled, carrier tracking pages
- \`supplemental\` — anything else (refund records, T&C screenshots)

**Write the upload manifest** at \`$EVID/99-upload-manifest.json\`:
\`\`\`json
{
  "customer_comm": ["04-mail-2.png", "04-mail-3.png", "04-mail-4.png", "04-mail-5.png", "04-mail-6.png"],
  "tracking_info": ["05-tracking-1.png"],
  "supplemental": []
}
\`\`\`

Constraints:
- Max 5 files per category
- All filenames must exist in \`$EVID/\`
- All files < 5 MB

### Phase 5: Upload + verify

\`\`\`bash
python3 scripts/cf_upload.py "$DID" "$EVID" "$EVID/99-upload-manifest.json"
# inspect after
python3 scripts/cf_inspect_categories.py   # check Hana Hahn case is hardcoded — pass DID later
\`\`\`

\`cf_upload.py\` writes \`$EVID/99-upload-result.json\` with per-file status. Then you
**must** verify by re-inspecting the dispute on ChargeFlow:
\`\`\`bash
python3 scripts/cf_inspect_dispute.py "$DID" "$EVID"
# Read $EVID/01-current-attachments.json — confirm count matches what you uploaded
\`\`\`

### Phase 6: Build final case manifest + report

Write \`$EVID/00-manifest.json\`:
\`\`\`json
{
  "dispute_id": "...",
  "chargeback_ref": "...",
  "order_number": "...",
  "customer": { "name": "...", "email": "..." },
  "amount_eur": 0.0,
  "reason": "...",
  "uploaded_at": "<ISO8601>",
  "status_on_chargeflow": "...",
  "evidence_uploaded": { "Customer Communication": [...], "Tracking Information": [...], "Supplemental Evidence": [...] },
  "skipped": { "filename.png": "reason for skipping" },
  "defense_narrative": "<one-paragraph defense argument citing the evidence>",
  "evidence_descriptions": { "filename.png": "what this screenshot shows" }
}
\`\`\`

Report back to user:
- Dispute ID + order # + amount
- N files uploaded across X categories (final inventory)
- Defense narrative
- Any anomalies (timeouts, files skipped) — be honest, don't claim success on partial uploads

## Anti-patterns (bugs we paid for)

- ❌ **DO NOT** treat ChargeFlow API \`status=needs_response\` as "merchant must act".
  That field only means the case is open with the bank. CF's UI shows the real state:
  "Evidence will be submitted by Chargeflow" → CF auto-handles, you must NOT upload.
  Always gate on \`cf_triage.py\` (Phase 0) before any action.
- ❌ **DO NOT** call the dispute "auto-submitted" or "evidence uploaded" based on a
  HTTP 200 from \`/disputes/{id}/evidence\`. That endpoint accepts files but does not
  change \`status\` or \`customerCommunication\`. Final source of truth is the UI label
  via \`cf_triage.py\` re-run after upload.

- ❌ **DO NOT** claim "evidence was submitted" based only on the timeline text "The evidence
  was submitted to the bank by the merchant" — that text shows generically once any single
  file is uploaded. **Verify by reading actual file list per category** (cf_inspect_categories.py).
- ❌ **DO NOT** rely on \`text=Upload Evidence\` selector — the button renames to
  "Additional Evidence" after the first upload. Use \`[data-testid="additional-evidence-nav"]\`.
- ❌ **DO NOT** loop on the Lark search modal — if first click+type doesn't work, use
  \`playwright__browser_evaluate\` to set value directly.
- ❌ **DO NOT** take a duplicate screenshot — check md5 between consecutive shots; if same,
  the page didn't render between calls (likely the previous click had no effect).
- ❌ **DO NOT** skip Phase 5's verification step. Always re-inspect the dispute via the
  ChargeFlow UI after upload to confirm files actually attached.
- ❌ **DO NOT** upload "wrong-account" Lark Mail screenshots (e.g., showing chanphong@
  instead of support@wellnessnest.co). Read each screenshot visually before adding to
  manifest.
- ❌ **DO NOT** assume Shopify store slug is \`wellnessnest-eu\`. The actual slug is
  \`wellnessnest1\` (the EU store has a different name). Hardcoded in cf_shopify_capture.py.
- ❌ **DO NOT** assume cf_upload.py's per-file verification status is authoritative — its
  filename detection can return false negatives (false "nochange" when file actually
  uploaded). The \`final_inventory\` block in \`99-upload-result.json\` is the source of truth
  (it re-clicks each card and reads the file list).

## Defense narrative templates (pick the closest match, fill in specifics)

### Reason: "Not Received"
> Order [#ORDER] was placed on [DATE], paid in full ([AMOUNT]), fulfilled and shipped
> on [SHIP_DATE] with tracking number [TRACK]. Customer [NAME] is a [repeat / first-time]
> customer with [N] orders on the account. Order is currently archived in our system.
> Chargeflow auto-collected the carrier tracking page; we added Shopify Admin order
> detail showing fulfillment timestamp + customer history.

### Reason: "Not as Described"
> Customer [NAME] mail thread shows requests for return/refund — not a "wrong product"
> claim. Wellness Nest provided return address and assisted with return process. The
> dispute reason mismatches actual customer intent in their own emails.
> Order #[ORDER] was DELIVERED on [DATE] per tracking [TRACK].

### Reason: "Fraudulent"
> Order #[ORDER] is a [Nth] subscription order for customer [NAME] using payment
> method [METHOD]. Prior orders #[PREV_ORDERS] were also paid by this customer with
> no chargeback — pattern inconsistent with fraud. Shopify customer panel shows
> [N] orders + same shipping address + same email since [FIRST_ORDER_DATE].

### Reason: "Canceled" (Subscription billing)
> The disputed charge corresponds to a Recharge subscription that was active at
> charge time. Cancellation request received [BEFORE / AFTER] charge. Customer
> mail thread shows [acknowledgment / no acknowledgment] of the subscription terms.
> Refund [was / was not] issued.

## When ChargeFlow drifts (DOM rename)

If the Python scripts fail because a testid changed:
1. Run \`cf_inspect_dispute.py\` and read the JSON it dumps — look at the body_text_sample.
2. Use Playwright MCP to inspect the DOM: \`playwright__browser_evaluate "document.querySelectorAll('[data-testid]')"\`.
3. Update the constant in the failing script's \`CATS\` dict (cf_upload.py and
   cf_inspect_categories.py) AND the testid in \`open_upload_ui()\` (cf_inspect_dispute.py).
4. Append the new selector + observation date to \`LEARNED_SELECTORS.md\` so the next run picks it up.

## Stealth-mode rule

This skill is operator-facing (Bao+Phong). **DO NOT** trigger HEARTBEAT.md updates,
"Morning Brief", "EOD Summary", or any cron-scoped reporting from running this skill.
The output should land in \`dispute-evidences/<id>/00-manifest.json\` and a terse text
report in the conversation — nothing else.

---

## HARD RULE — Audit accuracy (Phase A4)

The audit JSON at \`/tmp/manual_chargeflow_<dispute_id>.json\` MUST reflect the
REAL filesystem state, not the agent's belief.

**Mandatory checks before writing audit JSON:**

1. **\`success: true\` requires ALL of these:**
   - File \`<evidence_dir>/99-upload-result.json\` exists AND is valid JSON
   - That JSON's \`results\` array has at least one item with \`status == "ok"\`
   - That JSON's \`final_inventory\` shows AT LEAST one file in at least one of
     Customer Comm / Tracking Info / Supplemental (excluding files that were
     already there from CF auto-upload)

2. **\`success: false\` is the SAFE default** if any check fails OR if the agent
   isn't sure. Hallucinating success is worse than reporting failure.

3. **\`crashed_at_phase: ""\` (empty) requires** that ALL of Phases 1-8 ran AND
   their output artifacts exist on disk:
   - Phase 1: \`00-dispute-meta.json\` + \`01-current-attachments.json\` exist
   - Phase 2: \`02-shopify-orders.png\` OR \`03-shopify-order-detail.png\` exists
   - Phase 3: at least one \`04-mail-[0-9]*.png\` exists (NOT just \`04-mail-search-*.png\`)
   - Phase 5: \`05-tracking-1.png\` exists OR audit notes "no_tracking_number"
   - Phase 6: \`99-upload-manifest.json\` exists
   - Phase 7: \`99-upload-result.json\` exists
   - Phase 8: re-inspect shows new files in CF dashboard

4. **\`files_uploaded_actual_count\`** must equal the count in
   \`99-upload-result.json\` \`results\` array filtered for \`status == "ok"\`.

If audit JSON violates these rules in test, the SKILL fails review. Re-run.

## HARD RULE — Phase 8 mandatory re-inspect (Phase A5)

After Phase 7 (cf_upload.py), Phase 8 MUST run before declaring success:

\`\`\`bash
/usr/bin/python3 ~/.openclaw/workspace/agents/timcook/skills/chargeflow-collect-evidence/scripts/cf_inspect_dispute.py <dispute_id> /tmp/verify_<dispute_id>
\`\`\`

Compare:
- \`01-current-attachments.json\` (pre-upload, from Phase 1)
- \`/tmp/verify_<dispute_id>/01-current-attachments.json\` (post-upload, from Phase 8)

Phase 8 PASS criteria: post-upload counts > pre-upload counts in at least one
category that we uploaded to. If counts unchanged → upload silently failed →
audit \`success: false\` + \`phase8_verify: "no_change_detected"\`.`,
  "csat-collection": `---
name: csat-collection
description: Post-interaction satisfaction collection. Defines when to ask, how to ask, where to log. Read after successfully resolving a customer interaction.
---

# CSAT Collection

## When to invoke
- After successfully resolving a customer issue (refund processed, replacement shipped, question answered with confirmation)
- NOT after escalation (supervisor handles their own follow-up)
- NOT for FYI replies or status updates

## When NOT to ask
- Customer is angry or frustrated (asking CSAT then = tone-deaf)
- Customer is in middle of multi-step issue
- More than 1 CSAT request to same customer in 30 days

## Format

After your resolution message, append:

\`\`\`
---
P.S. Was this helpful? Quick reply with:
👍 Yes, thanks!
👎 No, still an issue
💬 Or just tell me anything else.

(One-tap response is fine — helps me get better.)
\`\`\`

For Telegram, use inline keyboard:
- 👍 Helpful
- 👎 Not helpful
- 💬 More help needed

## Logging

Customer's response → append to \`memory/csat_responses.jsonl\`:
\`\`\`json
{"ts": "ISO8601", "customer_email": "...", "session_key": "...", "rating": "positive|negative|neutral", "feedback_text": "...", "issue_category": "delivery|refund|product|other"}
\`\`\`

## Aggregation (weekly cron)
- Compute % positive / negative / neutral
- Group by issue_category
- Add to weekly North Star report
- If negative >15% in any category: flag for SOUL/AGENTS revision

## Anti-hallucination
- Never claim CSAT score in conversation if not measured
- Never reuse same CSAT prompt within 30 days for same customer
- Never weight responses (treat all responses equal)

## Boundaries
- Never ask CSAT in the middle of an unresolved issue
- Never ask CSAT after a complaint about agent behavior
- Never push for higher rating ("if you'd rate us 5 stars...")`,
  "best-3pl-protocol": `# Best 3PL Tracking Protocol

## Overview
This skill governs the complete lifecycle of Best 3PL orders: from internal tracking code → real carrier tracking → 17track enrichment → Lark Base status updates.

**Companion scripts:** \`scripts/best_3pl_integration.py\`, \`scripts/tracking_status_sync.py\`, \`scripts/best_3pl_diagnostics.py\`

---

## Key Distinctions

| Feature | Best 3PL | Flexport |
|---------|----------|----------|
| Internal ID prefix | VR / WNBAA / XY / YSD / YT / SYRM | FLEX-* |
| Real tracking appears | Best 3PL portal (no fixed window) | Flexport portal (12–16h) |
| Carrier mapping | See Carrier Map below | N/A |
| Portal | best3pl.com | flexport.com |

**Never mention Flexport for Best 3PL orders. Never mention "FLEX-*" for Best 3PL orders.**

---

## Carrier Mapping

Use these carrier IDs when registering Best 3PL tracking numbers with 17track:

| Prefix | Carrier ID | Carrier Name |
|--------|-----------|--------------|
| VR | 190012 | YANWEN |
| WNBAA | 190086 | Wanb Express |
| XYYEX | 190340 | XYY Express |
| YSD | 190798 | YSDPOST |
| YT | 190008 | YunExpress |
| SYRM | 190072 | SUNYOU |

---

## Tracking Number Lifecycle

### Phase 1: Internal ID only (Day 0)
- Best 3PL pushes order with internal code (e.g., \`VR861486720YP\`)
- This is NOT a carrier tracking number — 17track won't find it
- Lark Base record created with internal ID only

### Phase 2: Extract real tracking (Best 3PL portal)
- Real carrier tracking number appears in Best 3PL portal when carrier assigns it
- **Extract it from the portal manually or via Best 3PL API**
- Real tracking format: 10–30 digit numeric codes (e.g., \`9261290389148421880274\`)

### Phase 3: Register with 17track
- Register the real tracking number with 17track using correct carrier ID
- Use \`scripts/tracking_status_sync.py\` — it handles registration + status fetch in one pass
- Or use \`scripts/best_3pl_integration.py\` for Shopify+Lark enriched flow

### Phase 4: Update Lark Base
- Push real tracking number + 17track status to Lark Base
- Update fields: \`tracking_number\`, \`tracking_status\`, \`last_tracking_time\`, \`carrier\`

---

## 17track Integration

### Register a tracking
\`\`\`python
import requests

token = "3DA025EE5593145660E367220E0B90D3"
url = "https://api.17track.net/track/v2/register"

payload = {
    "code": "TRACKING_NUMBER",
    "carrier": 190012  # Use carrier ID from mapping above
}
headers = {"Content-Type": "application/json", "17token": token}

r = requests.post(url, json=payload, headers=headers)
\`\`\`

### Query status
\`\`\`python
url = "https://api.17track.net/track/v2/gettrackinfo"
payload = {"data": [{"code": "TRACKING_NUMBER", "carrier": 190012}]}
r = requests.post(url, json=payload, headers=headers)
data = r.json()["data"][0]

status = data["status"]          # InTransit, Delivered, Exception, NotFound, etc.
sub_status = data["sub_status"]  # Detailed: address_issue, refused, returning, etc.
description = data["latest_event"]["description"]
\`\`\`

### Status → Lark Base mapping
| 17track status | Lark Base tracking_status |
|----------------|--------------------------|
| Delivered | \`Delivered\` |
| Exception + \`address\` in description | \`Exception_AddressIssue\` |
| Exception + \`refused\` in description | \`Exception_Refused\` |
| Exception + \`return\` in description | \`Exception_Returning\` |
| Exception + \`pickup\` in description | \`Available_For_Pickup\` |
| NotFound | \`NotFound\` |
| Expired | \`Expired\` |
| InTransit | \`In_Transit\` |

---

## Lark Base Tables

### Order Problems table (Best 3PL communication)
Used by \`best_3pl_integration.py\` for enriched rows.

| Field | Source |
|-------|--------|
| order_number | Input |
| tracking_number | Best 3PL portal → 17track |
| customer_name | Shopify API |
| customer_email | Shopify API |
| address | Shopify API |
| country | Shopify API |
| product_name | Shopify API |
| sku | Shopify API |
| 3pl | Constant: \`Best 3PL\` |
| shopify_link | Shopify API |
| tracking_status | 17track |
| last_tracking_time | 17track |
| tim_cook_classification | Decision tree |
| tim_cook_action_requested | Decision tree |

### Failed Deliveries table
Source: Best 3PL feed push. Used by \`failed_deliveries_pipeline.py\`.

---

## Automation

### Daily sync (recommended: 8 AM SGT)
\`\`\`bash
cd ~/.openclaw/workspace/agents/timcook
python3 scripts/tracking_status_sync.py
\`\`\`
This script:
1. Fetches all records from Lark Base
2. Extracts Best 3PL tracking numbers
3. Registers unregistered ones with 17track (correct carrier ID)
4. Queries 17track for status
5. Updates Lark Base with \`tracking_status\`, \`last_tracking_time\`

### Log file
\`logs/tracking_status_sync.log\`

---

## Diagnostic
If tracking numbers are missing status in Lark Base:
\`\`\`bash
python3 scripts/best_3pl_diagnostics.py
\`\`\`
This checks field coverage, failure scenarios, and credentials.

---

## Error Handling

| Problem | Fix |
|---------|-----|
| 17track returns \`NotFound\` | Re-register with correct carrier ID. If still fails, check Best 3PL portal for real tracking number |
| Lark Base not updating | Check credentials in \`.api-credentials.json\` → \`lark_base\` |
| VR code shows on 17track | That's public 17track — ignore. Use paid account with real tracking number only |
| Real tracking not in Best 3PL portal | Best 3PL hasn't assigned carrier yet — wait and re-check |`,
  "best-3pl-tracking-update": `# Best 3PL — Tracking Status Update Protocol

## Purpose
Systematically update all rows in the Lark Base **Protocol table** (\`tbltNEqU2JNLpW9M\`) so every record has accurate \`Tracking Status\`, \`Best Action\`, \`Last Tracking Info\`, and \`Pati Response\`.

Triggered by: manual run, daily cron, or supervisor command.

---

## Record Classification Matrix

Every record falls into one of 5 categories. Use \`Last Tracking Info\` as the source of truth when \`Tracking Status\` is blank.

| Category | Condition | Action |
|----------|-----------|--------|
| **C1: REJECTED** | \`Last Tracking Info = "REJECTED/: "\` | Cannot fix via 17track — Best 3PL internal code only. Flag as \`Best Action = Awaiting tracking number\`. No customer contact. |
| **C2: Delivered (false positive)** | \`Tracking Status = Delivered\` OR \`Last Tracking Info = "Delivered"\` | Verify via customer email. Set \`Best Action = Closed - Delivered\`. Remove from active queue. |
| **C3: Exception** | \`Last Tracking Info\` starts with \`Exception/\` | Parse sub-status → set Best Action per table below. |
| **C4: Available For Pickup** | \`Last Tracking Info\` starts with \`AvailableForPickup/\` | Email customer pickup instructions. Set \`Best Action = Contact customer for pickup\`. |
| **C5: Address Issue** | \`Last Tracking Info\` contains \`Incorrect address\` | Email customer for address correction. Set \`Best Action = Contact customer for address\`. |
| **C6: Overdue/Delivery Failed** | \`Last Tracking Info = "overdue"\` or \`"Delivery failed"\` | Set \`Best Action = Carrier investigation\`. Log in Pati. |
| **C7: No tracking info** | \`Last Tracking Info = None/empty\` AND internal code (VR/SYRM) | Cannot act. Set \`Best Action = Awaiting tracking number\`. |

---

## 17track Status → Lark Field Mapping

Use these exact values when updating \`Tracking Status\`:

| 17track status returned | Lark \`Tracking Status\` | Notes |
|------------------------|----------------------|-------|
| \`Delivered\` | \`Delivered\` | |
| \`Exception_Returning\` | \`Exception\` | Package being returned |
| \`Exception_Refused\` | \`Exception\` | Customer refused |
| \`Exception_AddressIssue\` | \`Exception\` | Wrong/undeliverable address |
| \`Exception_Other\` | \`Exception\` | Generic exception |
| \`InTransit\` | \`InTransit\` | Still moving |
| \`NotFound\` | \`NotFound\` | Not yet registered |
| \`Expired\` | \`Expired\` | No updates for extended period |
| \`AvailableForPickup\` | \`Pickup\` | At pickup point |
| \`REJECTED\` (from Lark field) | \`REJECTED\` | Internal Best 3PL code — not a carrier tracking |

---

## Best Action Values (official Lark multi-select options)

These must match exactly what Lark Base accepts:

- \`Contact customer for address\` — Address correction needed
- \`Contact customer for pickup\` — Customer must collect package
- \`Contact customer for refused\` — **NEW: Email customer first, ask why refused before escalating to carrier**
- \`Carrier investigation\` — Investigating with carrier/Best 3PL
- \`Awaiting tracking number\` — Internal Best 3PL code, no carrier tracking yet
- \`Closed - Delivered\` — Confirmed delivered, no further action
- \`Closed - Refunded\` — Customer refunded
- \`Closed - Resent\` — Package resent with new tracking
- \`Resend to new address\` — Customer confirmed new address, ready to resend

---

## Refused Customer Outreach — Step-by-Step

**Trigger:** \`Last Tracking Info\` contains \`refused\` or sub_status = \`Exception_Refused\`

**Step 1:** Do NOT escalate to carrier immediately. Email customer first.

**Step 2:** Send email:
\`\`\`
Subject: Regarding your order #WN{order} — delivery refused
Body: We noticed the delivery for your order was refused. We'd like to understand what happened and help resolve this quickly. Could you let us know the reason? If the package is still available, we can arrange a re-delivery at a convenient time.
\`\`\`

**Step 3:** Set \`Best Action = Contact customer for refused\`

**Step 4:** Wait for customer reply (max 48h)

**Step 5:** On reply:
- If customer wants redelivery → \`Best Action = Resend to new address\`
- If customer wants refund → process refund per refund-flow skill
- If no reply in 48h → escalate to \`Carrier investigation\`

---

## Batch Update Script

\`\`\`bash
cd ~/.openclaw/workspace/agents/timcook
python3 scripts/best_3pl_batch_update.py
\`\`\`

**What the script does:**
1. Fetches ALL 615 records from Protocol table
2. For each record with blank \`Tracking Status\`:
   a. Parse \`Last Tracking Info\` field
   b. Map to correct \`Tracking Status\` value
   c. Look up customer from Shopify API
   d. Set \`Best Action\` per classification matrix
   e. Generate \`Pati Response\` with emoji prefix
3. Batches updates (50 records per API call)
4. Logs results to \`logs/best_3pl_batch_update_YYYYMMDD.json\`

---

## Classification Rules Summary

\`\`\`
IF Last Tracking Info == "REJECTED/: "
  → Status = REJECTED, Best Action = Awaiting tracking number

ELIF Last Tracking Info starts with "Exception/Exception_Refused"
  → Status = Exception, Best Action = Contact customer for refused
  → EMAIL_CUSTOMER = True

ELIF Last Tracking Info starts with "Exception/Exception_Returning"
  → Status = Exception, Best Action = Carrier investigation
  → Pati = "↩️ Package returning to sender"

ELIF Last Tracking Info starts with "Exception/Exception_AddressIssue"
  → Status = Exception, Best Action = Contact customer for address
  → EMAIL_CUSTOMER = True

ELIF Last Tracking Info starts with "AvailableForPickup/"
  → Status = Pickup, Best Action = Contact customer for pickup
  → EMAIL_CUSTOMER = True

ELIF Last Tracking Info contains "Incorrect address"
  → Status = Exception, Best Action = Contact customer for address
  → EMAIL_CUSTOMER = True

ELIF Last Tracking Info == "Delivered"
  → Status = Delivered, Best Action = Closed - Delivered

ELIF Last Tracking Info in ("overdue", "Delivery failed")
  → Status = Exception, Best Action = Carrier investigation

ELIF tracking prefix in (VR, SYRM) AND Last Tracking Info is None
  → Best Action = Awaiting tracking number
\`\`\`

---

## REJECTED Status — Clarification

\`REJECTED\` in \`Last Tracking Info\` means:
- The tracking number is a **Best 3PL internal code** (VR/SYRM prefix), not a real carrier tracking
- 17track cannot find it because it was never registered with a carrier
- **This is not an error** — it's a data quality issue at source (Best 3PL)

**Correct response for REJECTED records:**
- Set \`Best Action = Awaiting tracking number\`
- Do NOT email customer (we have no actionable tracking to share)
- Do NOT escalate to carrier investigation (carrier doesn't have it yet)
- Pati response: \`❓ Internal tracking only — awaiting carrier assignment from Best 3PL\`

These records need Best 3PL to push the real carrier tracking number to Lark Base.

---

## Shopify Enrichment (for records missing customer data)

For records where \`Customer Email\` is blank but \`Order (Trimmed)\` is filled:

\`\`\`python
def get_shopify_customer(order_number: str) -> dict:
    order_id = order_number.replace("#WN", "").strip()
    url = f"https://{shopify_store}/admin/api/2024-01/orders/{order_id}.json"
    headers = {"X-Shopify-Access-Token": shopify_token}
    r = requests.get(url, headers=headers, timeout=10)
    order = r.json()["order"]
    return {
        "customer_email": order.get("email"),
        "customer_name": f"{addr.get('first_name')} {addr.get('last_name')}",
        "address": f"{addr.get('address1')} {addr.get('address2')}",
        "city": addr.get("city"),
        "country": addr.get("country_code"),
    }
\`\`\`

---

## Execution Checklist

- [ ] Fetch all records from \`tbltNEqU2JNLpW9M\`
- [ ] Parse \`Last Tracking Info\` for each blank-status record
- [ ] Classify → set \`Tracking Status\` + \`Best Action\`
- [ ] Enrich customer data from Shopify for records missing it
- [ ] Generate \`Pati Response\` for each record
- [ ] Batch update Lark Base (50/batch)
- [ ] Log to \`logs/best_3pl_batch_update_YYYYMMDD.json\`
- [ ] Report: updated count, needs-attention count, closed count`,
  "best-cannot-ship": `---
title: Best Cannot Ship
description: Daily scan of Lark Base table for orders Best 3PL explicitly flagged as unable to fulfill (needs Flexport). Covers detection, Flexport order creation, Shopify fulfillment, and cron automation.
---

# Best Cannot Ship Protocol

Trigger on: best cannot ship, best unfulfilled, flexport fulfillment, create flexport order, daily scan.

## Overview

One Lark Base table needs daily monitoring:

**Best Cannot Ship** (\`tbloYzPvpIRSE4it\` — "OF - BEST cannot ship") — Orders that **Best 3PL cannot fulfill** (out of stock, address issues, etc.). Best 3PL pastes these here when they can't ship them. Our job: create Flexport fulfillment orders for these.

### IMPORTANT: Best CAN ship vs Best CANNOT ship
- **Best cannot ship table** (this table) → Orders Best explicitly flagged as unable to fulfill. We create Flexport orders.
- **Best CAN ship but unfulfilled** → Normal Best 3PL orders that are still processing. Do NOT create Flexport orders. This is covered by a separate SOP — do not handle here.
- **Wrong address table** (\`tblBiEp5YGNvrunU\`) → handled by \`address-verification-protocol\` cron, NOT this skill.

## Prerequisites

- Lark Base app token: \`JhiDwNmtwizHQ6kTV8slDMJZgOr\`
- Lark credentials in \`.api-credentials.json\` → \`lark_base\`
- Shopify credentials in \`.api-credentials.json\` → \`shopify\`
- Flexport portal credentials in \`.api-credentials.json\` → \`flexport.portal\`

## Step 1: Scan Best Unfulfilled Table

\`\`\`python
# Get Lark token
r = requests.post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', json={
    'app_id': app_id, 'app_secret': app_secret
})
token = r.json()['tenant_access_token']

# Search for pending records
r = requests.post(
    f'https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/tbloYzPvpIRSE4it/records/search',
    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
    json={'field_names': ['Order ID', 'Fulfillment status', 'Tracking number']}
)
\`\`\`

Look for records where \`Fulfillment status\` is empty or "In progress".

## Step 2: Scan Wrong Address Table

Use the **list API** (not search) to get all records:

\`\`\`python
r = requests.get(
    f'https://open.larksuite.com/open-apis/bitable/v1/apps/{app_token}/tables/tblBiEp5YGNvrunU/records?page_size=50',

⚠️ **Pagination bug (2026-05-07)**: The list API paginates at 20 records per page by default. Using \`page_size=50\` only returns the first 50 records. If the table has >50 records, newer entries on later pages will be missed. Always iterate with \`page_token\` until \`has_more=false\`.

\`\`\`python
all_items = []
page_token = None
while True:
    url = f'.../records?page_size=20'
    if page_token:
        url += f'&page_token={page_token}'
    r = requests.get(url, headers=...)
    data = r.json()['data']
    all_items.extend(data['items'])
    if not data.get('has_more'):
        break
    page_token = data.get('page_token')
\`\`\`
    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
)
\`\`\`

Filter locally for records where \`Status\` is "Address checking", "SMS/E-mail sent", or "Send email".

Note: The search API may return 0 results even when records exist. Always use the list API for the wrong address table.

## Step 3: For Each Best Unfulfilled Order

### 3a. Check Shopify
\`\`\`python
r = requests.get(f'https://{store}/admin/api/2024-01/orders.json?name=WN{number}&status=any',
    headers={'X-Shopify-Access-Token': token})
\`\`\`

Verify: order is active (not cancelled/refunded), get SKU, shipping address, customer info.

### 3b. Create Flexport Order (via Playwright/CLI browser)

⚠️ **Full form-filling details** — the Flexport New Order page is a multi-step wizard. Missing any step = no submit button.

1. **Login**: Navigate to \`https://login.portal.flexport.com\` (chanphong@patigroup.com).
2. **Navigate**: Go to \`https://portal.flexport.com/orders/new\`.
3. **Fill shipping address**:
   - First & Last Name, Street Address, City, ZIP Code
   - **State field** — even if the country has no states (e.g. Liechtenstein), this field MUST be filled. Use the textbox input (not the dropdown), type the country name. The "Review Order" button stays disabled if State is empty.
   - **Country dropdown** — click the country dropdown, then search by typing the country name (e.g. "Liechtenstein"), then select from results. The country also auto-fills the State field with the country name in a separate dropdown below.
   - **Phone country code** — can differ from shipping country. A US phone (+1) for a Liechtenstein address is fine. Do NOT waste time trying to change the phone country code unless the actual phone number is non-US.
   - Email — required for international shipping.
4. **Search product**: Click the product search input and type the SKU. Select the correct variant from dropdown. If original SKU is OOS, substitute with Gold Grade (WNPSGS2024) if available.
5. **Select shipping method**: After address + product are filled, a "Select a service" section appears below the product row. Click the shipping service button (e.g. "Worldwide Standard Delivered Duty Unpaid $15.31").
6. **Click Review Order** — this button is disabled until State field is filled, product is added, AND shipping service is selected.
7. **Click Confirm Order** — on the review page, verify details then click "Confirm Order".
8. **Handle Invalid Address** — Flexport may flag the address as invalid after creation. If this happens:
   - Click "Update or Confirm Address"
   - Check "Confirm address to skip validation" checkbox
   - Click "Update" button
   - This sets the order status to "Processing"
9. **Note the Flexport order ID** — it appears on the order detail page (e.g. \`/orders/157755228/detail\`). The FLEX-XXXXX number is the **internal Flexport order ID**, NOT a carrier tracking number.

### 3c. Create Shopify Fulfillment (⚠️ NO tracking info — real tracking comes 12-16h later)

Do NOT include tracking info. FLEX-* is an internal order ID, not a carrier tracking number.

\`\`\`graphql
mutation fulfillmentCreateV2($fulfillment: FulfillmentV2Input!) {
  fulfillmentCreateV2(fulfillment: $fulfillment) {
    fulfillment { id status }
    userErrors { field message }
  }
}
\`\`\`

Variables (no trackingInfo — it will be added later via Step 3f):
\`\`\`json
{
  "fulfillment": {
    "lineItemsByFulfillmentOrder": [{
      "fulfillmentOrderId": "gid://shopify/FulfillmentOrder/{id}",
      "fulfillmentOrderLineItems": [{
        "id": "gid://shopify/FulfillmentOrderLineItem/{id}",
        "quantity": 1
      }]
    }],
    "notifyCustomer": true
  }
}
\`\`\`

### 3d. Update Lark Base
- Set \`Fulfillment status\` = "Fulfilled"
- Add \`_note\` to \`Shopify lookup JSON\` with Flexport link and substitution info

### 3e. Add Shopify Order Note
\`\`\`python
r = requests.put(f'https://{store}/admin/api/2024-01/orders/{shopify_id}.json',
    json={'order': {'id': shopify_id, 'note': 'Flexport order: {link}. Substitution notes.'}})
\`\`\`

### 3f. Check Back for Real Tracking (12-16h later)
- Login to Flexport portal
- Navigate to order detail page
- Look for carrier tracking number
- Update Shopify fulfillment via GraphQL:
\`\`\`graphql
mutation fulfillmentTrackingInfoUpdate($fulfillmentId: ID!, $trackingInfoInput: FulfillmentTrackingInput!) {
  fulfillmentTrackingInfoUpdate(fulfillmentId: $fulfillmentId, trackingInfoInput: $trackingInfoInput) {
    fulfillment { trackingInfo { company number url } }
    userErrors { field message }
  }
}
\`\`\`
- Update Lark Base \`Tracking number\` field

## Step 4: For Each Wrong Address Order

### 4a. Verify Address
- Search address on Google Maps
- Check if address is valid and deliverable

### 4b. Take Action
- **Address correct** → Status = "Address confirmed"
- **Minor errors** → Fix in \`Corrected Address\`, Status = "Address confirmed", update Shopify
- **Clearly wrong** → Email customer, Status = "SMS/E-mail sent", set 48h timer
- **Cannot ship** → Status = "Cancelled", process refund

### 4c. Update Shopify
- If address corrected: \`PUT /admin/api/2024-01/orders/{id}.json\` with new \`shipping_address\`
- If cancelled: Cancel order + process refund

### 4d. Update Lark Base
- Set Status, Corrected Address, Note fields

## Cron Automation

### Best Cannot Ship Scan + Tracking Check (merged, 2x daily)

Runs at **9 AM and 4 PM ICT**.

**Cron job name**: \`best-cannot-ship-scan (merged with tracking check)\`
**Schedule**: \`0 9,16 * * *\` Asia/Saigon
**What it does — Part 1 (Scan new orders)**:
1. Scans Lark Base table \`tbloYzPvpIRSE4it\` ("OF - BEST cannot ship") for records where Fulfillment status is empty or "In progress"
2. For each pending order: verify in Shopify, create Flexport fulfillment order via Playwright portal
3. Create Shopify fulfillment record via GraphQL (NO tracking — FLEX-* is NOT tracking)
4. Update Lark Base status to "Fulfilled"

**What it does — Part 2 (Check for real tracking)**:
1. Also scans for records where Fulfillment status is "Fulfilled" and Tracking number is null/empty
2. For each: log into Flexport portal, check order detail page for carrier tracking number
3. If carrier tracking found (appears 12-16h after order creation):
   - Update Shopify fulfillment via \`fulfillmentTrackingInfoUpdateV2\`
   - Update Lark Base \`Tracking number\` field
4. Reports combined results to PATI group

**Note**: The wrong address scan (\`tblBiEp5YGNvrunU\`) is handled by a separate cron (\`address-verification-protocol\` at 06:00 and 18:00 ICT). This cron only handles the Best cannot ship table.

### Reminder for daily scans

When triggered by the cron or manually asked to scan, always check:
1. ✅ Best cannot ship table (\`tbloYzPvpIRSE4it\`) — any new orders Best flagged?
2. ❌ Do NOT check Best CAN ship orders — that's a separate SOP
3. ❌ Do NOT check wrong address table — that's the address-verification-protocol cron

## Important Rules

1. **FLEX-* is NOT a tracking number** — it's the Flexport internal order ID. Real tracking appears 12-16h later. Do NOT upload FLEX-* to Shopify as tracking.
2. **Flexport fulfillment = 2-step process** — Flexport portal order + Shopify fulfillment record. Both required.
3. **Product substitution** — When original SKU is OOS, substitute with Gold Grade (WNPSGS2024). Log the substitution.
4. **Lark Base PATCH = 404** — Always use PUT for updates.
5. **Shopify REST fulfillment POST = 406** — Use GraphQL \`fulfillmentCreateV2\` instead.
6. **Wrong address table may be empty** — That's normal. Only act when records exist.
7. **State field required** — Even for countries without states (Liechtenstein), fill the State textbox with the country name. Empty State = disabled Review Order button.
8. **Phone country code ≠ shipping country** — Phone can stay US (+1) even for international addresses. Change only if the actual number is non-US.
9. **Flexport New Order is a multi-step wizard** — Not a single form. Steps: fill address → add product → select shipping service → Review Order → Confirm Order → handle invalid address if needed.
10. **Invalid address after creation** — Click "Update or Confirm Address" → check "Confirm address to skip validation" → click Update. This is expected for some international addresses.

## Error Recovery

| Error | Action |
|-------|--------|
| Flexport login fails | Check credentials, retry |
| Product not found in Flexport | Search by name, try alternative SKU |
| Shopify fulfillment 406 | Use GraphQL instead of REST |
| Lark Base 404 | Use PUT not PATCH |
| Token expired | Refresh via auth/v3/tenant_access_token/internal |
| No records found | Report "0 pending — all clear" |
| Review Order button disabled | Check State field is filled, product is added, and shipping service is selected |
| Invalid Address after creation | Click "Update or Confirm Address" → check confirm checkbox → click Update |
| Phone code won't change | Leave as-is unless the actual number is non-US — it's OK to have different phone/shipping countries |`,
  "context-discipline": `---
name: context-discipline
description: Self-management rules for timcook to prevent hallucination, context overflow, and memory loss. Read this skill at session start and after every 30 min of active work.
---

# Context Discipline & Memory Hygiene

## When to invoke this skill

- **Session start** — refresh awareness of context budget + memory rules
- **Before stating a fact** in customer reply or status update — anti-hallucination check
- **After completing significant work** — write key outcome to memory
- **On heartbeat (every 15 min)** — update TODAY'S PRIORITIES, prune stale items
- **When session message count > 100** — proactively suggest /compact or summarize-and-fork
- **When asked to "remember", "log", "document", or "report"** — write to file (not just respond inline)

## Core principles

### 1. Context budget awareness
You operate inside a 12k-char-per-file truncation limit for bootstrap files (SOUL/MEMORY/HEARTBEAT/AGENTS). If a file exceeds 12k, OpenClaw silently truncates the tail — content there is invisible to you. Therefore:
- Keep MEMORY.md under 12k. Archive entries older than 7 days to \`memory/archive/\`.
- Keep HEARTBEAT.md under ~3k (it loads every 15 min — bloat = 96× daily token waste).
- Daily files (\`memory/YYYY-MM-DD.md\`) have NO size limit — write freely there, distill later.

### 2. Source verification (zero hallucination policy)
Every factual claim must trace to: (a) an API call result you ran THIS session, (b) a file you read THIS session, or (c) a log entry. If you cannot point to one of these, prefix with "I'm not certain, but..." or run the verification before answering.

Forbidden phrases without evidence:
- "We deployed X" — verify with \`ps aux | grep X\` or read deployment log
- "Customer received Y" — verify with bridge.log or sent_emails.jsonl
- "It's been working since Z" — verify with log timestamp range
- "All N records updated" — count the records, don't estimate

### 3. Memory hygiene
**Write to file** when:
- A decision is made (what + why + by whom)
- A bug is fixed (root cause + fix + verification)
- A new credential/endpoint is added (location + scope, never the secret)
- A user explicitly says "remember this"
- A lesson is learned ("never X because Y")

**File routing:**
| Content | Destination |
|---|---|
| Today's raw work log | \`memory/YYYY-MM-DD.md\` |
| Distilled lesson worth keeping >7 days | \`MEMORY.md\` (recent section) |
| Procedural rule (always-true) | \`AGENTS.md\` |
| Tool/workflow change | \`TOOLS.md\` or relevant skill |
| One-off historical incident (resolved) | \`memory/archive/\` |

**Never** dump raw conversation transcripts, tool output blobs, or full API responses into MEMORY.md. Distill: "Bug X had root cause Y; fix in commit Z."

## Anti-hallucination self-check (run before each significant claim)

\`\`\`
1. Does this claim require evidence? (Y/N)
2. Have I seen the evidence in THIS session's tool output? (Y/N)
3. If N, can I verify it now in <30s with a tool call? (Y/N)
4. If still N, am I extrapolating from training data or memory of past sessions?
5. If extrapolating, prefix response with "I believe..." or run verification.
\`\`\`

If you skip steps 1-4 and just answer, you are hallucinating.

### State-counting rule (added 2026-05-07 — citing pending state numbers)

When asked about pending queues, customer counts, status breakdowns, or any numeric state from a JSON/JSONL/log file:

**ALWAYS re-read the file FRESH** with the \`read\` tool BEFORE quoting any numbers. Do NOT cite from:
- Prior conversation messages (numbers may be stale by minutes/hours)
- Memory of earlier sessions (state changes constantly)
- Summaries / compacted context (often round-number-truncated)
- Inference ("the queue should be roughly X")

**Specific to timcook**:
- For pending breakdown → re-read \`logs/pending_confirmation_requests.json\`, count by status
- For replied customers → re-read \`logs/replied_emails.json\`
- For SLA/FRT metrics → re-read \`memory/frt.jsonl\` or \`logs/sla_metrics.jsonl\` (whichever is current)
- For cron state → re-read \`cron/jobs.json\` enabled flag
- For email today → grep latest \`email-bridge/bridge_manual_*.log\` for \`Successfully replied to\` (don't trust your in-memory count)

**Forbidden phrases without fresh-read evidence**:
- "Pending file: 0 stuck, 0 needs_human_review, X awaiting" → re-count from current file
- "Today's email batch is N customers" → grep bridge log for actual SMTP success
- "All clear, queue is empty" → query the file, don't extrapolate
- "I processed all customer emails today" → enumerate explicitly from log, do not summarize

**Why this rule exists** (2026-05-07 incident): timcook reported "0 stuck, 0 needs_human_review, 19 awaiting confirmation" while actual state was "40 stuck, 51 needs_human_review, 17 awaiting confirmation". Wrong numbers from stale memory misled operator. Always re-read fresh.

## Context overflow prevention

When session reaches certain thresholds, take action:

| Trigger | Action |
|---|---|
| Session > 100 messages | Summarize last 50 → write to \`memory/YYYY-MM-DD.md\` → request /compact |
| Session > 300 messages | Refuse new substantive work — only acknowledge + write to memory + ask for fresh session |
| Reading any file > 50KB | Don't dump full content into context; grep specific section |
| Tool output > 5KB | Summarize before storing in conversation |
| User asks for "history" | Read archive file, grep relevant entries — don't recite full archive |

## Heartbeat self-update (every 15 min)

When heartbeat fires, update HEARTBEAT.md \`## TODAY'S PRIORITIES\` section:
1. Move resolved items to "STABLE" or remove
2. Add new immediate items (24h SLA risk)
3. Drop items older than 24h that aren't actively blocked
4. Keep total under 500 chars

If nothing changed, reply \`HEARTBEAT_OK\` and skip the file write.

## Recovery if you suspect you're hallucinating

1. Stop generating. Run a verification tool call (read file, query API, list dir).
2. Compare actual output to what you were about to say.
3. If mismatch, correct yourself: "Earlier I said X, but verifying just now shows Y."
4. Write the correction to \`memory/YYYY-MM-DD.md\` with prefix "Self-correction:"
5. Continue.

## Tool result interpretation (anti-hallucination)

**Rule**: A tool call that returns timeout, error, non-2xx HTTP status, exception, or any non-success result MUST be treated as FAILED. Never claim the underlying action succeeded based on a failed tool call.

### Forbidden phrases after a failed tool call

| Tool returned | NEVER say |
|---|---|
| Timeout | "the message went through" / "delivered" / "got through" |
| 4xx/5xx | "refund processed" / "order updated" / "API call succeeded" |
| Exception | "saved" / "logged" / "completed" |
| Empty/null response | "everything looks good" / "no errors" |

### What to do after a failed tool call

1. State the failure plainly: "I tried to send the message but the call timed out. I have not confirmed delivery."
2. Run a separate verification tool to check actual state:
   - sendMessage timeout, re-fetch message history to verify actual delivery
   - refund timeout, query Shopify refund history before claiming refund processed
   - sessions_send timeout, query target session message list, do NOT assume it landed
3. If verification also fails, escalate to supervisor + log to memory/YYYY-MM-DD.md. Do NOT generate a confident-sounding reply.

### Worked example pointer

Real incident 2026-05-05: timcook hallucinated "sessions_send calls timing out BUT messages going through" four runs in a row. Full incident + correct-behavior in \`wiki/log.md\` under "[2026-05-05] operations | timcook telegram non-reply incident".

### Self-send ban (sessions_send to current session)

Before calling \`sessions_send\`, check: is the target \`sessionKey\` equal to the CURRENT session's \`sessionKey\`?

If yes, STOP. Sending to your own session is a self-loop:
- Your message gets queued on the same lane that is currently processing your run
- The lane cannot drain because you are holding it
- The call times out, you hallucinate "delivered", you try again
- You consume the slot real telegram messages need

Real incident pointer: lane stalled 272s, Bao messages queued behind self-send timeouts. See \`wiki/log.md\` 2026-05-05 telegram entry.

What to do instead:
- Replying to telegram → use \`message\` tool with \`channel=telegram, target=<chat_id>\`. Do NOT use \`sessions_send\` to your own telegram session.
- Forwarding to a different agent's session (e.g. supervisor) → \`sessions_send\` with target = that OTHER session's key. Verify target != current.
- Posting status to operator → \`message\` with \`channel=telegram, target=<operator_chat_id>\`.

Self-check before any \`sessions_send\`:
1. What is my current sessionKey? (look at session metadata)
2. What is the target sessionKey of this call?
3. If they match: this is the bug. Switch to \`message\` tool.

### The BUT trap

If you find yourself writing "the call failed/timed out BUT it still worked", STOP. The word BUT after a failure is the signature of hallucination. Either:
- The tool actually succeeded, you have separate evidence and should cite it
- The tool failed, say it failed, do not soften with BUT

There is no middle ground. A tool call is either confirmed-success (with evidence in this session) or unconfirmed.

## Anti-pattern catalog (things that have burned timcook before)

- **Stale memory referenced as current** — e.g. citing PID or metric from a week ago as if live. Mitigation: timestamp every claim.
- **Compaction loop trap** — when context overflow + compaction cooldown both active, agent silently drops messages. Mitigation: detect via repeat overflow errors → escalate to operator (write to \`memory/YYYY-MM-DD.md\` + ask for /compact).
- **Cross-channel context bleed** — same sessionKey serving telegram group + Control UI causes 700+ message bloat. Mitigation: prefer fresh sessions per task; don't load history across unrelated requests.
- **Reaction without reply** — emoji ack fires before LLM call; if reply fails, only emoji visible. Mitigation: log every "tried-to-reply-but-failed" event to \`memory/YYYY-MM-DD.md\` so operator can spot pattern.



## 🧹 Self-Curate Trigger (auto-managed memory hygiene)

Run this check **at every session start** AND **before appending any entry to MEMORY.md or HEARTBEAT.md**:

### Trigger thresholds

| File | Warning | Critical | Action |
|---|---|---|---|
| MEMORY.md | > 11,000 chars (92%) | > 11,500 chars (96%) | Distill before adding new |
| HEARTBEAT.md | > 11,000 chars | > 11,500 chars | Trim aggressive (see HEARTBEAT pattern) |

### Distillation procedure (for MEMORY.md)

When over warning threshold:

1. KEEP active rules + credentials full. Trim 7d-14d entries to 1-line pointer. Archive 14d+ resolved entries to \`memory/archive/\`.
2. MERGE same-day same-topic entries into 1 summary referencing daily file.
3. MOVE verbose detail to \`memory/YYYY-MM-DD.md\` (no size limit), keep ~200-char summary + link in MEMORY.md.
4. TARGET < 10,500 chars after curate (12.5% buffer).
5. LOG the action: append to today's daily file with sections distilled, sections archived, bytes saved.

### Distillation procedure (for HEARTBEAT.md)

If HEARTBEAT.md exceeds 11k:
- Drop "STATUS HISTORY" entries older than 7 days
- Compress NORTH STAR table to 1-row-per-NS (remove duplicate dispute row)
- Drop verbose deployment logs (move to memory/YYYY-MM-DD.md)
- Keep: TODAY'S PRIORITIES placeholder + targets table + monitoring checklist + escalation triggers

### Weekly review (run every Sunday session, regardless of size)

- Sample 5 random sections from MEMORY.md
- For each: ask "would future-me want this in 14 days?"
  - YES + still active → keep
  - YES but resolved → archive
  - NO → delete (not even archive)
- Append review log to memory/YYYY-MM-DD.md

### Anti-runaway rules

- **Never add a new entry if MEMORY > 11,500 chars** until distillation runs first
- **Never delete during automated distillation** — move to archive, never \`rm\`
- **Never distill the same section twice in 24h** (compaction cooldown analog)
- **Always keep at least 5 entries in "Recent" bucket** — preserves context continuity

### Why this matters

OpenClaw silently truncates bootstrap files at 12k chars. If MEMORY.md is 14k, timcook sees only the first 12k — the bottom 2k is **invisible**. Entries you carefully wrote may not be loaded. Periodic curation = reliable memory.

See [[Customer Service Agent Training Pattern]] in wiki for the broader framework.

## Sources
- \`AGENTS.md\` — base persona/protocol
- \`SOUL.md\` — system state
- \`MEMORY.md\` — long-term distilled memory (≤12k)
- \`memory/archive/MEMORY-2026-04-archive.md\` — historical entries pre-2026-04-26`,
  "bridge-crash-recovery": `---
name: bridge-crash-recovery
description: Unified recovery protocol for gateway and email bridge crashes, partial failures (API timeout, token expiry, rate limit, IMAP drop), and total system disruptions. Covers detection, priority ordering, recovery actions, and prevention.
---

# Bridge Crash Recovery & Disruption Recovery

Skill path: \`skills/bridge-crash-recovery/SKILL.md\`
Reference: Obsidian vault at \`~/Documents/claude-obsidian/wiki/operations/\`

---

## SECTION 1: Crash Detection

The system is composed of two critical processes — the **gateway** and the **email bridge**. Either can fail independently.

### Gateway Down

- Check process:
  \`\`\`
  ps aux | grep openclaw-gateway
  \`\`\`
- If not found, gateway is down
- \`crash_recovery_system.py\` monitors this every 30 seconds and auto-restarts

### Bridge Down

- Check PM2 status:
  \`\`\`
  pm2 jlist | python3 -c "import json,sys; [print(f'{p.get(\\"name\\"):20} {p.get(\\"pm2_env\\",{}).get(\\"status\\",\\"unknown\\")} PID {p.get(\\"pid\\",0)}') for p in json.load(sys.stdin)]"
  \`\`\`
- If \`email-bridge\` is not \`online\`, bridge is down
- \`bridge_health_check.sh\` monitors this every 5 minutes

### Bridge Running But Not Processing

- **No emails polled in >10 min** — possible IMAP connection issue
- Check bridge logs:
  \`\`\`
  tail -50 /Users/timcook/.openclaw/email-bridge/bridge.log
  \`\`\`
- **No replies sent in >20 min** — system may be stuck in a loop or failed API call

### API/Token Failures

- **Lark Base API returning 401/403** — \`app_access_token\` expired (2h lifespan). Re-fetch.
- **Shopify 401** — API token invalid or revoked. Check \`credentials.json\`.
- **Recharge 401** — Recharge token expired. Rotate credentials.
- **Claudible/DeepSeek non-200** — LLM API failure; fallback model activates automatically.

---

## SECTION 2: Recovery Priority

Always follow this order. Skipping steps leaves cascading failures.

### Step 1: Gateway

Restart if down:
\`\`\`
pm2 restart openclaw-gateway
\`\`\`
Or via OpenClaw:
\`\`\`
openclaw gateway restart
\`\`\`
After restart, validate credentials:
\`\`\`
python3 ~/.openclaw/workspace/agents/timcook/scripts/credential_rotator.py check
\`\`\`

### Step 2: Bridge

Restart if down:
\`\`\`
cd /Users/timcook/.openclaw/email-bridge && pm2 restart email-bridge
\`\`\`
Or manually:
\`\`\`
cd /Users/timcook/.openclaw/email-bridge && node index.js
\`\`\`
Check email polling is working after restart:
\`\`\`
tail -5 /Users/timcook/.openclaw/email-bridge/bridge.log
\`\`\`

### Step 3: Stuck Requests

Run recovery script — this finds Phase 2 requests stuck in \`detected\` status (>2h, <3 retries) and requeues them:
\`\`\`
python3 ~/.openclaw/workspace/agents/timcook/scripts/daily_operations_recovery.py
\`\`\`
This script also:
- Verifies bridge PM2 status
- Checks SLA logging activity (last 1h)
- Checks MiniMax + DeepSeek API health
- Logs all findings to \`logs/recovery_health.jsonl\`
- Handles expired confirmations with known actions

### Step 4: SLA Catch-Up

Check current SLA gap:
\`\`\`
# Check how long since last email was processed
tail -5 ~/.openclaw/workspace/agents/timcook/logs/sla_metrics.jsonl
\`\`\`
Prioritize the oldest pending requests first (the bridge handles FIFO with retry logic). Request age is calculated from \`createdAt\`.

If response time gap is large (>30 min of missed SLA), manually check the pending queue:
\`\`\`
python3 -c "
import json
with open('/Users/timcook/.openclaw/workspace/agents/timcook/logs/pending_confirmation_requests.json') as f:
    pending = json.load(f)
for req_id, req in pending.items():
    if isinstance(req, dict) and req.get('status') != 'executed':
        print(f'{req_id[:40]:40} {req.get(\\"customerEmail\\",\\"unknown\\"):30} {req.get(\\"status\\",\\"unknown\\"):20} retry={req.get(\\"retryCount\\",0)}')
"
\`\`\`

### Step 5: Logging

Verify logs resumed properly after restart:
\`\`\`
ls -la ~/.openclaw/workspace/agents/timcook/logs/
tail -3 ~/.openclaw/workspace/agents/timcook/logs/bridge_health.log
tail -3 ~/.openclaw/workspace/agents/timcook/logs/recovery_health.jsonl
\`\`\`

---

## SECTION 3: API Failure Modes

### LLM API Failure (Claudible/DeepSeek)

The bridge has fallback priority set to: **DeepSeek → Claudible → Static fallback**.

| Failure | Detection | Recovery Action |
|---------|-----------|-----------------|
| DeepSeek 503 / non-200 | API call returns error | Falls through to Claudible automatically |
| Claudible 503 / non-200 | API call returns error | Falls through to DeepSeek automatically |
| Both APIs down | Both return errors | Static response templates activated — generic apology sent |
| DeepSeek bans/rate-limit | 402 / 429 returned | Switch to Claudible exclusively until reset |
| Claudible 400 (wrong endpoint) | Console shows "Claudible error" | Check \`auth-profiles.json\` endpoint bindings |

Check fallback activation in bridge log:
\`\`\`
grep -i "fallback" /Users/timcook/.openclaw/email-bridge/bridge.log | tail -5
\`\`\`

### API Provider Failures

| Failure | Recovery Action |
|---------|-----------------|
| Recharge 401 | Rotate Recharge credentials in \`credentials.json\` and reload bridge |
| Lark Base token expired | Re-fetch \`app_access_token\` via \`/open-apis/auth/v3/app_access_token/internal\` |
| 17track API limit hit | Wait 60 seconds, retry with exponential backoff (max 3 retries) |
| Shopify rate limit | Wait 10 seconds, retry request. If persistent, check Shopify admin. |
| IMAP connection lost | Bridge auto-retries on poll cycle. If persistent, restart the bridge. |

### Token Expiry Reference

| Token | Lifespan | Auto-Renew |
|-------|----------|------------|
| Lark app_access_token | 2 hours | On every 401 response |
| Lark tenant_access_token | 2 hours | On every 401 response |
| Telegram bot token | Permanent (unless revoked) | Manual via BotFather |
| Shopify API token | Permanent (unless revoked) | Manual in Shopify admin |
| Recharge API token | Permanent (unless revoked) | Manual via Recharge |
| 17track API token | Permanent (unless revoked) | Manual via 17track |

---

## SECTION 4: Total System Crash Recovery

Use this when everything went down — power outage, forced system restart, kernel panic, or unknown crash.

### Step 1: Run Daily Operations Recovery

\`\`\`
python3 ~/.openclaw/workspace/agents/timcook/scripts/daily_operations_recovery.py
\`\`\`
This fixes stuck Phase 2 requests and brings the bridge back to processing state.

### Step 2: Check Crash History

\`\`\`
tail -20 ~/.openclaw/workspace/agents/timcook/logs/recovery_health.jsonl
\`\`\`
Look for the crash timeline — when did the last successful record appear vs when the crash was detected.

### Step 3: Full Startup

Run the startup sequence:
\`\`\`
bash ~/.openclaw/workspace/agents/timcook/scripts/start_timcook.sh
\`\`\`
This starts all critical processes: email bridge, bridge monitor, dispute prevention, 3PL poller. It handles double-starts gracefully (checks if running first).

### Step 4: Validate Credentials

\`\`\`
python3 ~/.openclaw/workspace/agents/timcook/scripts/credential_rotator.py check
\`\`\`
All providers should return ✅ VALID. If any show ❌ INVALID, investigate:
- Telegram invalid → regenerate token via BotFather
- Shopify invalid → check Shopify admin API tokens
- Recharge invalid → check Recharge API key
- Lark invalid → verify app_id/app_secret

Back up current credentials first:
\`\`\`
python3 ~/.openclaw/workspace/agents/timcook/scripts/credential_rotator.py backup
\`\`\`

### Step 5: Gap Detection

Check yesterday's email volume vs today's to see if any requests were missed:
\`\`\`
# Yesterday's processing count
grep $(date -v-1d +%Y-%m-%d) ~/.openclaw/workspace/agents/timcook/logs/sla_metrics.jsonl 2>/dev/null | wc -l
# Today's so far
grep $(date +%Y-%m-%d) ~/.openclaw/workspace/agents/timcook/logs/sla_metrics.jsonl 2>/dev/null | wc -l
\`\`\`
If today's count is more than 50% lower than yesterday's at same hour, requests may have been dropped.

### Step 6: Reconstruct SOUL.md (if needed)

If SOUL.md is stale or missing, reconstruct it:
\`\`\`
python3 ~/.openclaw/workspace/agents/timcook/scripts/soul_reconstructor.py reconstruct
\`\`\`

### Step 7: Notify if Crash > 1 Hour

If the system was down for more than 1 hour since the last health check entry, send a Telegram notification to the group with crash duration and recovery status:
\`\`\`
# Determine check duration from health log
# Then post to group chat
\`\`\`

Key info to include: crash duration, number of stuck requests requeued, credential validation results, and any emails that may have been missed.

---

## SECTION 5: Partial Failures

These are subtle failures where the process is running but not working correctly.

### Bridge Running But Not Polling Emails

- Check IMAP connection:
  \`\`\`
  grep -i "imap\\|poll\\|fetch\\|auth" /Users/timcook/.openclaw/email-bridge/bridge.log | tail -10
  \`\`\`
- If IMAP auth failed: credentials may be wrong or mailbox reached quota
- If no IMAP activity in >5 min: bridge is stuck. Restart:
  \`\`\`
  cd /Users/timcook/.openclaw/email-bridge && pm2 restart email-bridge
  \`\`\`

### Bridge Polling But Not Replying

- Check MiniMax/Claudible API responses:
  \`\`\`
  grep -i "model=fallback\\|Claudible error\\|DeepSeek error\\|API error" /Users/timcook/.openclaw/email-bridge/bridge.log | tail -5
  \`\`\`
- If \`model=fallback\` appears frequently, check API health:
  \`\`\`
  python3 ~/.openclaw/workspace/agents/timcook/scripts/daily_operations_recovery.py
  \`\`\`
- If MiniMax API key/endpoint is broken, \`auth-profiles.json\` needs fixing.

### Bridge Replying But Phase 2 Not Triggered

- Check that \`[[MODE:needs_offer]]\` tags are being returned by the LLM:
  \`\`\`
  grep -i "MODE\\|needs_offer\\|direct_confirmation" /Users/timcook/.openclaw/email-bridge/bridge.log | tail -10
  \`\`\`
- If LLM consistently returns \`undetermined\`:
  - Check \`retryCount\` on pending requests — they may be stuck at max retries (3)
  - Manual intervention needed: edit the pending file or use direct API call
- Phase 1 wait is 180s — customer may have already responded before Phase 2 was ready

### Phase 2 Confirming But Not Executing

- Check Recharge API responses:
  \`\`\`
  grep -i "recharge\\|cancel\\|pause\\|skip\\|subscription" /Users/timcook/.openclaw/email-bridge/bridge.log | tail -10
  \`\`\`
- If Recharge returns 401/403: token expired, rotate credentials
- If Recharge returns 404 on subscription: the subscription ID may be wrong or already cancelled
- Check the pending file for stuck \`confirmed\` status:
  \`\`\`
  python3 -c "
import json
with open('/Users/timcook/.openclaw/workspace/agents/timcook/logs/pending_confirmation_requests.json') as f:
    pending = json.load(f)
stuck = {k:v for k,v in pending.items() if isinstance(v,dict) and v.get('status') == 'confirmed'}
print(f'Found {len(stuck)} stuck in confirmed status')
for req_id, req in list(stuck.items())[:5]:
    print(f'  {req.get(\\"customerEmail\\",\\"unknown\\"):30} action={req.get(\\"actionType\\",\\"?\\")} created={req.get(\\"createdAt\\",\\"?\\")}')
"
  \`\`\`

### DRP Activation (Fallback Victims)

If the fallback mode was active during a disruption, customers received generic responses instead of personalized retention offers. Run the DRP auto-recovery script to identify victims:
\`\`\`
bash ~/.openclaw/workspace/agents/timcook/scripts/drp_auto_recovery.sh
\`\`\`
This script:
1. Identifies all customers who received generic fallback responses
2. Detects which API issues caused the fallback
3. Checks current API health
4. Verifies bridge state
5. Generates merged reports
6. Logs everything to \`logs/drp_recovery_*.log\`

The \`daily_operations_recovery.py\` script replaces the old DRP (\`drp_auto_recovery.sh\`). Run **daily_operations_recovery.py** first; only use \`drp_auto_recovery.sh\` when you need victim identification granularity.

---

## SECTION 6: Prevention

### Health Checks

1. **Bridge health every 5 minutes** — automated via \`bridge_health_check.sh\` (runs as cron or background job)
2. **Gateway every 30 seconds** — monitored by \`crash_recovery_system.py\`
3. **SLA monitoring** — check SLA logs for response time degradation:
   \`\`\`
   tail -10 ~/.openclaw/workspace/agents/timcook/logs/sla_metrics.jsonl
   \`\`\`
   Look for \`responseTime > 420s\` (7 min target breached) or gaps in processing times.

### Token Rotation Schedule

| Token | When to Rotate | How |
|-------|---------------|-----|
| Lark app_access_token | Every 2 hours (auto on 401) | POST to \`/open-apis/auth/v3/app_access_token/internal\` |
| Lark tenant_access_token | Every 2 hours (auto on 401) | POST to \`/open-apis/auth/v3/tenant_access_token/internal\` |
| Telegram bot token | When invalidated only | Manual via BotFather |
| Shopify API token | When invalidated only | Reissue in Shopify admin |
| Recharge API token | When invalidated only | Reissue in Recharge admin |

### Credential Backup

Keep a working copy of credentials:
\`\`\`
python3 ~/.openclaw/workspace/agents/timcook/scripts/credential_rotator.py backup
\`\`\`
This creates \`.api-credentials.backup.YYYYMMDD_HHMMSS\` in the workspace. The original is \`.api-credentials.json\`.

### Configuration File Checks

- \`auth-profiles.json\` — contains API endpoint mappings. If broken, LLM calls will 400.
- \`credentials.json\` — contains all API tokens. If missing, nothing works.
- \`.api-credentials.json\` — backup/validation copy of credentials.

### Preventing Stuck Requests

1. Daily cron should run \`daily_operations_recovery.py\` at least once daily to catch stuck Phase 2 requests
2. Monitor \`logs/pending_confirmation_requests.json\` for status anomalies
3. Retry logic handles 3 retries per request at 5-minute intervals
4. After 3 retries with \`undetermined\`, requests need manual review

### Preventing Total Crashes

1. \`crash_recovery_system.py\` auto-restarts gateway with layered recovery (process → state → credentials → SOUL)
2. \`bridge_health_check.sh\` auto-restarts bridge
3. \`soul_reconstructor.py\` rebuilds SOUL.md when stale (>1 hour)
4. Backup credentials exist for recovery after full credential loss

---

## Recovery Scripts Quick Reference

\`\`\`
scripts/crash_recovery_system.py         # Layer 1: monitors gateway 24/7, auto-restarts
scripts/daily_operations_recovery.py     # Layer 2: bridge health + stuck request recovery
scripts/bridge_health_check.sh           # Layer 3: bridge auto-restart every 5 min
scripts/credential_rotator.py            # Validate + backup credentials
scripts/soul_reconstructor.py            # Rebuild SOUL.md after total crash
scripts/start_timcook.sh                   # Full startup sequence
scripts/drp_auto_recovery.sh             # DRP victim identification (legacy)
\`\`\`

### Command Cheatsheet

\`\`\`
# Quick health check
python3 scripts/credential_rotator.py check

# Full recovery after crash
python3 scripts/daily_operations_recovery.py

# If gateway is down
openclaw gateway restart

# If bridge is down
pm2 restart email-bridge

# Credential backup
python3 scripts/credential_rotator.py backup

# SOUL reconstruction
python3 scripts/soul_reconstructor.py reconstruct

# Check stuck requests
python3 -c "
import json
with open('logs/pending_confirmation_requests.json') as f: pending = json.load(f)
for r in pending.values():
    if isinstance(r, dict) and r.get('status') not in ('executed', 'confirmed'):
        print(f'{r.get(\\"customerEmail\\",\\"?\\"):30} {r.get(\\"status\\"):20} retry={r.get(\\"retryCount\\",0)} age={r.get(\\"createdAt\\",\\"?\\")}')
"

# AP日 fallback victims
bash scripts/drp_auto_recovery.sh
\`\`\``,
  "stuck-case-reprocess": `---
name: stuck-case-reprocess
description: Reprocess customers stuck in pending_confirmation_requests.json with status=detected + actionType=undetermined. Battle-tested 2026-05-06 on 47 stuck cases (30 real customers reprocessed, 18 spam filtered, 0 errors). Read before any "fix all stuck cases" task.
---

# Stuck Case Reprocess

## When to invoke
- \`pending_confirmation_requests.json\` has entries with \`status=detected\` and \`actionType=undetermined\` older than 6 hours
- Customer reports "I sent email but no real reply" + pending entry exists
- Retry processor escalates a case to \`needs_human_review\`
- Weekly stuck-case audit (operator-driven)

## When NOT to invoke
- Single recent case (<1h) — let bridge worker handle naturally
- Spam-filtered entries (\`status=spam_filtered\`)
- Already replied entries (\`status=holding_sent_awaiting_human\` within last 24h)
- Cases where customer has not yet replied to a Phase 1 OTP

## Why this skill exists

Bridge worker sometimes receives email but LLM action classifier returns \`null\` (cannot classify intent). Worker queues entry as \`detected+undetermined\` with \`retryAt = now + 5min\`. **Until the retry processor (\`recharge_retry_processor.js\`) was built (2026-05-06), no consumer read \`retryAt\` → cases sat stuck for 0-48h with only generic English ack.**

This skill is the manual / batch path to flush them. Retry processor is the automatic path.

## Procedure (5 steps)

### Step 1 — Filter targets

Read \`pending_confirmation_requests.json\`, select entries where:
\`\`\`python
v.get("status") == "detected" and
v.get("actionType") == "undetermined"
\`\`\`

For each entry, classify as **REAL CUSTOMER** vs **SPAM**:
- Apply rules in \`skills/spam-classification/SKILL.md\` (regex + domain blocklist)
- Spam → mark \`status=spam_filtered\`, never reprocess
- Real → add to reprocess target list

Today's example: 48 stuck → 30 real customers + 18 spam.

### Step 2 — Build worker payloads

For each real-customer key, construct email JSON matching \`worker_with_recharge.js\` schema:
\`\`\`python
payload = {
    "from": rec["customerEmail"],
    "fromName": rec.get("customerName") or rec["customerEmail"].split("@")[0],
    "subject": rec.get("originalEmailSubject") or "(no subject)",
    "body": rec.get("originalEmailBody") or "(no body)",
    "arrival": rec.get("detectedAt"),
    "messageId": rec.get("messageId") or f"<reprocess-{ts}@wellnessnest>",
    "uid": 0, "orderNum": rec.get("orderNum"), "imapUid": 0,
    "worker_spawn_time": now_iso,
}
\`\`\`

### Step 3 — Spawn workers staggered

\`\`\`python
NODE = "/opt/homebrew/bin/node"
WORKER = "/Users/timcook/.openclaw/email-bridge/worker_with_recharge.js"
STAGGER_SEC = 8   # avoid SMTP rate limit

for idx, payload in enumerate(payloads, 1):
    log_path = f"/tmp/reprocess_logs/{idx:02d}_{email_safe}.log"
    subprocess.Popen([NODE, WORKER, json.dumps(payload)],
                     stdout=open(log_path, "w"), stderr=subprocess.STDOUT,
                     env={**os.environ, "WORKER_INDEX": str(idx)})
    if idx < len(payloads):
        time.sleep(STAGGER_SEC)
\`\`\`

Workers are detached — orchestrator script can exit without killing them.

### Step 4 — Verify outcomes

After ~5 min (each worker takes 30-60s), aggregate:
\`\`\`bash
grep -c "Successfully replied" /tmp/reprocess_logs/*.log    # success count
grep -c "Generated language-aware" /tmp/reprocess_logs/*.log  # holding-reply path
grep -lE "action=cancel|action=skip|action=pause" /tmp/reprocess_logs/*.log  # full Phase 1 OTP path
grep -l "❌ Error" /tmp/reprocess_logs/*.log
\`\`\`

Expected outcomes:
- **Best**: action classified → Phase 1 OTP email sent (customer can confirm)
- **Mid**: action=null → language-aware holding reply sent (acknowledgment only, requires human follow-up)
- **Worst**: SMTP error → retry next interval

### Step 5 — Mark + cleanup

Each worker creates a NEW pending entry (because it generates a new requestId). The OLD stuck entry stays as \`detected\`. **Cleanup is mandatory** to prevent retry-processor double-firing:

1. For each successfully reprocessed email, set on the OLD entry:
   \`\`\`python
   rec["status"] = "holding_sent_awaiting_human"
   rec["lastHoldingReplyAt"] = now_iso
   rec["holdingReplyCount"] = rec.get("holdingReplyCount", 0) + 1
   \`\`\`

2. Delete the NEW duplicate entries created during reprocess (entries with \`detectedAt\` within last 30 min for emails that already have an OLD \`holding_sent_awaiting_human\` entry).

3. Log batch summary to \`logs/reprocess_history.jsonl\`:
   \`\`\`json
   {"ts":"2026-05-06T13:24:58Z","total":30,"action_classified":0,"holding_only":30,"errors":0}
   \`\`\`

## Safety guards (MANDATORY)

- **NEVER reprocess if \`lastHoldingReplyAt\` < 24h ago** — would spam customer with duplicate ack
- **NEVER reprocess spam_filtered entries** — wastes LLM cost + risks looking spammy back
- **NEVER batch > 50 in single run** — SMTP rate limit + Recharge API throttle
- **ALWAYS dry-run first** if uncertain about target list (\`--dry-run\` flag in script)
- **ALWAYS backup \`pending_confirmation_requests.json\` before status mutations**

## Example output (today, 2026-05-06 13:18-13:23 UTC)

- 30 customers reprocessed → 28+1 success → 0 errors
- 0 actions classified (MiniMax structured-output broken, fixed later by switching to Qwen-Plus)
- 30 language-aware holding replies sent (DE/IT/FR/EL/CZ/EN/SK)
- Per-customer outcomes saved to \`/tmp/reprocess_logs/*.log\`

## Reference paths
- Pending file: \`/Users/timcook/.openclaw/workspace/agents/timcook/logs/pending_confirmation_requests.json\`
- Reprocess script (canonical): \`/tmp/reprocess_stuck.py\` (kept in \`/tmp\` since one-off; promote to \`scripts/\` if formalized)
- Worker entry: \`/Users/timcook/.openclaw/email-bridge/worker_with_recharge.js\`
- Sister skill: \`skills/spam-classification/SKILL.md\` (filter rules)`,
  "spam-classification": `---
name: spam-classification
description: Pre-LLM filter rules to distinguish real customer emails from cold outreach / B2B pitches / bot notifications. Used by stuck-case-reprocess and retry-processor to avoid wasting LLM cost (and risking spammy replies) on non-customer mail. Rules battle-tested 2026-05-06 on 48 stuck cases — 18 spam correctly identified, 30 real customers correctly preserved, 0 false positives.
---

# Spam Classification

## When to invoke
- Before any LLM-driven reply to an email currently in \`pending_confirmation_requests.json\`
- During \`stuck-case-reprocess\` filter step
- Inside retry processor before re-spawning a worker
- Before manual operator review of a "missed" customer queue

## When NOT to invoke
- For inbound email already passed bridge bot-filter at IMAP poll (low risk now, but still cheap to re-check)
- For active confirmation flows (\`status=confirmation_sent\`) — customer already engaged

## Why this skill exists

Bridge bot-filter is configured for obvious bots (mailer-daemon, noreply, etc.) but **does NOT catch cold-outreach pitches** that look human:
- "AMZ//Steve – Introduction"
- "Wellness Nest X Sifa - UGC Collaboration"
- "How to Turn Your Reviews Into a Sales Machine"
- "Your competitors are winning with reviews"

These reach the agent, get queued as \`undetermined\` (LLM can't decide if real customer asks for cancel/refund/etc), and either burn LLM retries or get a generic ack reply that looks weird to the sender.

## Three-pass filter rules

Apply in order; first match wins.

### Pass 1 — Domain blocklist (hard reject)

\`\`\`python
SPAM_DOMAINS = {
    # Internal-tool noise
    "facebook-manage.com", "thermofisher.com", "clearview88.com",
    # Cold-pitch domains seen in past 90d
    "miamibeachbum.com", "amzadvisersinsight.in", "amzadvisersinsight.info",
    "activiser.cfd",
    # Add new ones as they appear (with mtime + audit trail)
}
domain = email.split("@")[-1].lower()
if domain in SPAM_DOMAINS:
    return "spam:domain"
\`\`\`

### Pass 2 — Subject regex (cold-outreach signatures)

\`\`\`python
SPAM_SUBJECT = re.compile(
    r"sales machine|reviews into|your competitors|"
    r"\\bintroduction\\b|amz//|partnership|"
    r"saw your ad|UGC.*collab|tiktok shop|"
    r"store owner|right place to reach|"
    r"following up on your recent message|"
    r"wir zahlen deine rechnung|"           # German fake-invoice scam
    r"craziest deal ever|before you go|"    # outbound campaign reply
    r"review your purchase|already doing it right",
    re.I
)
if SPAM_SUBJECT.search(subject):
    return "spam:subject"
\`\`\`

### Pass 3 — Body content patterns

\`\`\`python
BODY_LOWER = (body or "").lower()[:500]
if "saw your ad" in BODY_LOWER:        return "spam:body-cold-pitch"
if "cynthia.feral" in BODY_LOWER:      return "spam:body-known-spam-name"
if "convert into steady sales" in BODY_LOWER: return "spam:body-store-pitch"
if "i've identified a few areas" in BODY_LOWER: return "spam:body-cold-consultant"

# Empty content — no real concern
if not subject.strip() and len(body.strip()) < 50:
    return "spam:empty-content"
\`\`\`

## Real-customer signals (should NOT be filtered)

Verify these stay through filter:
- Customer keyword in body/subject: \`refund|rückerstattung|rimborso|cancel|kündig|annul|stornier|abbestell|return|rücksend|order|bestellung|payment|abonnem|ακύρωση|skip|pause|delivery|lieferung|notifikace|vrácení|zruš\`
- Reply chain (\`Re: Re:\`) on legit Wellness Nest order/subscription mail
- Order number reference (WN######, #######)
- Multi-language customer concern even with low English fluency

## Output format

When marked spam, update entry:
\`\`\`python
v["status"] = "spam_filtered"
v["filteredAt"] = now_iso
v["filterReason"] = reason  # e.g., "spam:domain:facebook-manage.com"
\`\`\`

These entries are **never** retried by \`recharge_retry_processor.js\` (which only picks \`status=detected\`).

## Anti-patterns (DO NOT)

- ❌ Do NOT delete spam entries — keep them for audit + future ML training
- ❌ Do NOT reply to spam — even with a polite "we don't accept B2B" message; it confirms the address
- ❌ Do NOT auto-add new domains to blocklist on a single sighting — require ≥2 hits in 7d before adding
- ❌ Do NOT use spam filter on confirmed-customer email replies (Phase 2 OTP flow) — those were validated upstream

## Tuning record (audit trail)

| Date | Added pattern | Reason | False positives |
|---|---|---|---|
| 2026-05-06 | \`cynthia.feral\` body | barokobsi@outlook.com pitch in stuck queue | 0 |
| 2026-05-06 | \`wir zahlen deine rechnung\` subj | German fake-invoice scam (anitaschwarz2017) | 0 |
| 2026-05-06 | \`clearview88.com\` domain | "WELLNESS NEST: 3 resin-friendly formats" cold pitch | 0 |

When adding new patterns: cite source case + check existing real-customer corpus for false positives.

## Reference

- \`skills/stuck-case-reprocess/SKILL.md\` — caller using these rules
- \`email-bridge/recharge_retry_processor.js\` — also calls this filter (when implemented)
- Pending file: \`/Users/timcook/.openclaw/workspace/agents/timcook/logs/pending_confirmation_requests.json\``,
  "report-verification": `---
name: report-verification
description: Cross-check pattern for verifying agent reports against ground truth (Shopify GraphQL, replied_emails.json, bridge logs, pending state) before trusting batch summaries. Exposed a full hallucination on 2026-05-06 (qwen-flash session aaa47a30 fabricated "Rolandogarcia@bellsouth.net salt complaint" with zero tool calls). Read before accepting any agent report on >5 customers.
---

# Report Verification

## When to invoke
- Agent reports outcome on a batch of customers (>5)
- Agent claims to have "already replied / refunded / cancelled / processed" without a clear tool-call trail
- Operator reviewing agent output before approving downstream action
- Suspicion of hallucination (generic phrasing, round numbers, customers nobody recognizes)
- Post-incident audit ("did the bug-fix actually fix it?")

## When NOT to invoke
- Routine single-customer interactions (cost > value)
- Agent already produced verifiable artifacts (refund_history.jsonl entry, executed_actions log)
- Operator-driven manual cases where operator was in the loop

## Why this skill exists

Weak/over-loaded LLMs fabricate plausible-sounding summaries. Today (2026-05-06) we caught two distinct hallucination modes:
1. **Pure fabrication** — qwen-flash invented customer email "Rolandogarcia@bellsouth.net" with "salt taste complaint", zero matching data anywhere, zero tool calls.
2. **Mixed truth+fab** — a stronger session correctly identified 8 stuck cases by order number BUT was off on reply timestamps by 10-30 min.

Always verify before acting. Especially when context window > 100K tokens or after multiple compactions.

## Five-source cross-check matrix

For each agent claim, find ≥2 confirming sources:

| Claim type | Source 1 | Source 2 | Source 3 |
|---|---|---|---|
| "Already replied to X" | \`replied_emails.json\` (599+ entries) | bridge log \`Successfully replied to X\` | \`/tmp/reprocess_logs/*X*.log\` |
| "Order #N exists / amount $Y" | Shopify GraphQL \`orders(query:"email:X")\` | Recharge subscription lookup | order entry in \`pending_confirmation_requests.json\` |
| "Refund processed Feb 18" | Shopify order \`displayFinancialStatus=REFUNDED\` | \`refund_history.jsonl\` | Recharge charge \`status=refunded\` |
| "Tracking SYRMxxxxx" | 17track API status | Shopify fulfillment object | Flexport order entry |
| "No orders found in Shopify" | Shopify GraphQL returns empty | (single source ok if 1 confirms emptiness) | — |

## Verification procedure

### Step 1 — Read agent's report

Extract structured facts: customer email, order number, amount, date, action taken, timestamp.

### Step 2 — Pull ground truth in parallel

\`\`\`python
# Shopify orders by email
q = '''query($email: String!) {
  orders(first: 5, query: $email, sortKey: CREATED_AT, reverse: true) {
    edges { node {
      name displayFinancialStatus displayFulfillmentStatus
      totalPriceSet { shopMoney { amount currencyCode } }
      createdAt email
    } }
  }
}'''

# Reply log
rep = json.load(open("logs/replied_emails.json"))
matched = [x for x in rep if customer_email.lower() in str(x).lower()]

# Bridge log
grep -E "Successfully replied to <email>" /Users/timcook/.openclaw/email-bridge/bridge_manual_*.log
grep -E "Successfully replied to <email>" /tmp/reprocess_logs/*.log
\`\`\`

### Step 3 — Verdict per claim

For each claim issue verdict:
- ✅ **MATCH** — both ground truth sources confirm
- ⚠️ **PARTIAL** — fact correct but detail off (e.g., date ±1 day, timestamp ±30 min)
- ❌ **FAKE** — no ground truth source confirms (likely hallucination)
- ❓ **UNKNOWN** — not enough sources accessible right now

### Step 4 — Inspect agent's actual tool calls

If verdict has any ❌ or ❓:
\`\`\`python
# Read session jsonl, count tool calls
session_path = "/Users/timcook/.openclaw/agents/timcook/sessions/<id>.jsonl"
tools = Counter()
for line in open(session_path):
    r = json.loads(line)
    if r.get("type") == "message":
        for b in r.get("message",{}).get("content",[]):
            if isinstance(b, dict) and b.get("type") in ("toolCall","tool_use"):
                tools[b["name"]] += 1
print(tools)
\`\`\`

A real-work session shows 20+ \`exec\` / \`read\` calls. A hallucination session shows mostly \`read\` of skills + 0 \`message\` tool calls.

### Step 5 — Report verdict to operator

Format: table with per-claim verdict + bottom-line recommendation.
\`\`\`
## Agent claim verification

| # | Claim | Source 1 | Source 2 | Verdict |
|---|---|---|---|---|
| 1 | "Replied to X at 13:43" | replied_emails: ✓ | bridge log ts=13:21 | ⚠️ PARTIAL (timestamp off 22min) |
| 2 | "Order #198926, $64.34, refunded" | Shopify ✓ ($64.34, REFUNDED) | refund_history ✓ | ✅ MATCH |
| 3 | "Customer Rolandogarcia@bellsouth.net" | replied_emails: 0 | Shopify: 0 orders | ❌ FAKE |

## Bottom line
- Real claims: N/M
- Fake claims: K/M
- Recommendation: trust report (>90% match) / partial trust / discard
\`\`\`

## Tools cheatsheet (read-only — non-destructive)

\`\`\`bash
# Count tool calls in a session
python3 -c "
import json
from collections import Counter
c = Counter()
for l in open('SESSION_PATH'):
    try:
        r = json.loads(l)
        if r.get('type') == 'message':
            for b in r.get('message',{}).get('content',[]):
                if isinstance(b, dict) and b.get('type') in ('toolCall','tool_use'):
                    c[b['name']] += 1
    except: pass
print(c)
"

# Find session by user message keyword
grep -lE "<user-msg-keyword>" /Users/timcook/.openclaw/agents/timcook/sessions/*.jsonl

# Shopify order lookup by email (template)
cd /Users/timcook/.openclaw/workspace/agents/timcook && python3 -c "<embed query above>"
\`\`\`

## Anti-patterns (DO NOT)

- ❌ Trust agent's claim about specific customer numbers (timestamps, amounts) WITHOUT cross-check
- ❌ Verify with only 1 source (replied_emails.json alone is not enough — could be stale)
- ❌ Skip verification because "agent sounds confident" — hallucinations are confident by design
- ❌ Modify production data based on unverified report

## Today's incident (2026-05-06) reference

- Session \`aaa47a30\` (qwen-flash, archived): 130K tokens, 6 compactions, 0 message tool calls, hallucinated full "Summary of Actions Taken" about non-existent customers. Verdict: ❌ DISCARD report entirely.
- Session \`aaa47a30\` rebuild (DeepSeek, after model upgrade): 70 exec calls, real Shopify lookups, 8/8 order claims matched ground truth. Verdict: ✅ TRUST.

The difference between "trust" and "discard" was THIS skill applied. Two reports look similar in prose; only verification reveals which is real.

## Reference paths
- Replied log: \`logs/replied_emails.json\`
- Bridge log: \`/Users/timcook/.openclaw/email-bridge/bridge_manual_*.log\`
- Reprocess log: \`/tmp/reprocess_logs/*.log\`
- Session files: \`/Users/timcook/.openclaw/agents/timcook/sessions/*.jsonl\`
- Shopify creds: \`.api-credentials.json\` (key: \`shopify.access_token\`)
- Pending state: \`logs/pending_confirmation_requests.json\``,
  "held-order-release": `---
name: held-order-release
description: Release Shopify fulfillment orders held by chargeflow risk tags (e.g. on_hold). Covers detection, risk assessment, force-release override, and cron integration.
---

# Held Order Release Protocol

**Triggers:** held order, chargeflow hold, order release, on_hold fulfillment, release fulfillment, force release

**Purpose:** Scan Shopify for fulfillment orders tagged as \`on_hold\` (set by ChargeFlow risk), assess risk level, and release safe orders automatically.

**Script:** \`~/.openclaw/email-bridge/held_order_release.js\`

---

## Risk Assessment Logic

The script evaluates each held order and decides \`RELEASE\`, \`HOLD\`, or \`ESCALATE\`:

| Condition | Decision | Reason |
|-----------|----------|--------|
| New customer, order value > $200 | \`HOLD\` | High-value first order — manual review recommended |
| New customer, order value ≤ $200 | \`RELEASE\` | Normal-value first order — low fraud risk |
| Returning customer | \`RELEASE\` | Existing order history — low fraud risk |
| Any (with \`--force\`) | \`RELEASE\` | Operator override — skips all risk checks |

## Usage

\`\`\`bash
# Normal run — scans all held orders, releases safe ones
node /Users/timcook/.openclaw/email-bridge/held_order_release.js

# Force release — bypasses risk assessment for all orders
node /Users/timcook/.openclaw/email-bridge/held_order_release.js --force

# Target specific order
node /Users/timcook/.openclaw/email-bridge/held_order_release.js --order WN204882 --force
\`\`\`

## Operator Override (\`--force\`)

Added 2026-05-08 per Bảo instruction: \`--force\` flag that overrides ALL risk decisions with \`RELEASE\`. Use when:
- High-value first orders that are legitimate
- Human review would delay delivery unnecessarily
- Operator confirms the order is safe

## Cron Integration

Runs inside the 3 consolidated cron jobs:
- **7 AM** (morning brief)
- **1 PM** (midday report)
- **5 PM** (EOD summary)

## History

- **2026-05-08**: Script patched with \`--force\` override. Bảo confirmed no manual review needed for held orders — auto-release. Order #WN204882 released.`,
  "amazon-orders": `---
name: amazon-orders
description: Handle Amazon orders flowing into Lark Base. Auto-create Flexport Ecommerce Orders from address fields, then check tracking 12h+ later, write tracking back to Lark. Daily pipeline 09:00 + 15:00. Trigger on: Amazon order, Shockwave order, Flexport ecommerce, tracking update.
---

# Amazon Orders Protocol — Skill v2 (implemented 2026-05-18)

Daily pipeline: every 9 AM + 3 PM (system crontab), the agent reads new Amazon orders
from Lark and creates corresponding Flexport Ecommerce Orders. After 12 h, it
re-checks for the carrier-assigned tracking number and writes it back to Lark.

**Lark Base table:** \`tblKuy9wG7YzxUuL\` in PATI wiki ([link](https://paticreativeagency.sg.larksuite.com/wiki/JhiDwNmtwizHQ6kTV8slDMJZgOr?table=tblKuy9wG7YzxUuL&view=vewMSfO9WQ))

## Pipeline Scripts

| Script | Purpose |
|---|---|
| \`scripts/amazon_orders_pipeline.py\` | Orchestrator — runs at 09:00 + 15:00 ICT daily via system crontab |
| \`scripts/flexport_amazon_create.py\` | Login Flexport + create one Ecommerce Order from Lark record |
| \`scripts/flexport_amazon_check_tracking.py\` | Read tracking number from a Flexport order page |

## Lark schema

| Field | Type | Role |
|---|---|---|
| Customer name | Text | First & Last for Flexport |
| Product | SingleSelect | Currently only \`Shockwave\` |
| Quanity | Text | typo upstream — Quantity |
| Address | Text | Street address |
| City | Text | |
| State | Text | **CRITICAL** — mandatory in Flexport; 2-letter code (UT) auto-mapped to full name (Utah) |
| ZIP code | Text | |
| Country | Text | 2-letter code (US) auto-mapped to "United States" |
| Phone number | Text | Optional |
| Tracking number | Text | **Pipeline writes this back** when tracking found |
| Link | Url | Pipeline sets to Flexport order URL on create |
| Courrier | Text | Carrier name (USPS/UPS/etc.) — written back with tracking |
| Date created | CreatedTime | auto |

## Flow

\`\`\`
For each Lark record:
  ┌─ has Tracking number? → DONE, skip
  ├─ no state file entry?  → CREATE on Flexport
  ├─ state age < 12h?      → WAITING, skip
  ├─ last check < 3h ago?  → WAITING, skip
  └─ else                  → CHECK tracking on Flexport, write back to Lark if found
\`\`\`

State persisted at \`~/.openclaw/workspace/agents/timcook/state/amazon_orders_state.json\`,
keyed by Lark record_id → \`{flexport_order_id, created_at_iso, last_check_at_iso, attempts}\`.

## Flexport form HARD RULES

The Flexport \`/orders/new\` page is a single-step wizard. AI commonly forgets these:

1. **State is MANDATORY** — Flexport rejects submit without it. The field is a
   react-select dropdown (not text input). Use \`click_dropdown_option(page,
   "State", state_full_name)\`. The script auto-converts 2-letter codes to full
   names via \`US_STATES\` map (UT → Utah).

2. **Street Address triggers Google Places autocomplete** — must press Escape
   after filling to dismiss, otherwise State dropdown click is intercepted.

3. **Product is a react-select with hidden input** — container \`#product_search_bar\`.
   Click container → type → wait → click an option NOT marked
   \`.product_search__option--is-disabled\`. Out-of-stock variants are disabled.

4. **All Shockwave variants currently "Out of stock" (2026-05-18)** — pipeline
   detects this, returns \`status: blocked, stage: out_of_stock\`, and posts a
   Lark \`openclaw-alerts\` message. Operator must replenish Flexport inventory
   before any Amazon order can submit.

5. **Login flow** — Auth0 two-step: fill \`input[name="email"]\` → click Continue
   → fill \`input[type="password"]\` → click submit. Wait for URL to leave
   \`/login*\`. Credentials hardcoded from \`.api-credentials.json\` \`flexport.portal\`.

## Failure modes + alerting

Pipeline posts to Lark \`openclaw-alerts\` on:
- **Out of stock**: all product variants disabled. Includes SKU list.
- **Submission errors**: any non-ok status from create script.
- **Tracking found** (informational): tracking number copied to Lark.

State + tracking persist across runs so partial failures resume on next cron tick.

## Manual debug

\`\`\`bash
# Dry-run on a specific Lark record (fills form, doesn't submit)
/usr/bin/python3 ~/.openclaw/workspace/agents/timcook/scripts/flexport_amazon_create.py \\
  --record-id <lark_record_id> --dry-run

# Check tracking for a Flexport order
/usr/bin/python3 ~/.openclaw/workspace/agents/timcook/scripts/flexport_amazon_check_tracking.py \\
  --flexport-order-id <flexport_id>

# Full pipeline dry-run
/usr/bin/python3 ~/.openclaw/workspace/agents/timcook/scripts/amazon_orders_pipeline.py \\
  --dry-run --verbose

# View today's run
tail -100 ~/.openclaw/workspace/agents/timcook/logs/cron_amazon_orders.log
\`\`\`

## Cron entries (system crontab)

\`\`\`
0  9 * * * /usr/bin/python3 /Users/timcook/.openclaw/workspace/agents/timcook/scripts/amazon_orders_pipeline.py >> /Users/timcook/.openclaw/workspace/agents/timcook/logs/cron_amazon_orders.log 2>&1
0 15 * * * /usr/bin/python3 /Users/timcook/.openclaw/workspace/agents/timcook/scripts/amazon_orders_pipeline.py >> /Users/timcook/.openclaw/workspace/agents/timcook/logs/cron_amazon_orders.log 2>&1
\`\`\`

## History

- **2026-05-08**: Table discovered, stub SKILL.md only.
- **2026-05-18**: Implemented full pipeline. Tested dry-run on Pamela Dewitt record
  (\`recviJgSVJU0Kb\`) — correctly classified DONE (already has tracking). Live
  inventory check shows all Shockwave variants out-of-stock; pipeline blocks
  and alerts until restocked.`,
  "flexport-invalid-address": `---
title: Flexport Invalid Address
description: Scan Flexport portal for orders with "Invalid address" status, fix them automatically by cleaning address fields, and report results to the PATI group.
---

# Flexport Invalid Address — Skill

**Triggers:** flexport invalid address, flexport address fix, flexport portal scan, flexport cron, flexport address validation

**Purpose:** Scan Flexport portal for orders with "Invalid address" status, fix them automatically by cleaning address fields, and report results to the PATI group.

---

## Workflow

### Phase 1: Scan

Run the scanner to check current invalid address orders on Flexport portal:

\`\`\`bash
cd ~/.openclaw/workspace/agents/timcook
python3 scripts/flexport_portal_scanner.py
\`\`\`

**Output:** JSON with:
- \`orders\`: list of order numbers (e.g. \`["#WN204825"]\`)
- \`invalidAddressCount\`: count of flagged orders

### Phase 2: Fix

If orders are found, run the fixer in batch mode:

\`\`\`bash
cd ~/.openclaw/workspace/agents/timcook
python3 scripts/flexport_portal_fixer_v4.py --batch
\`\`\`

**What the fixer does for each order:**
1. Logs into Flexport portal (chanphong@patigroup.com)
2. Navigates to the order detail page by clicking the order row (Playwright locator)
3. Clicks "Update or Confirm Address" button
4. **Cleans commas** from street/city fields (e.g. "123 Main St, Apt 4" → "123 Main St")
5. **Clears Address 2** field (company names often trigger validation)
6. **Adds province** if missing (EU province map: DE→Hesse, FR→Île-de-France, etc.)
7. **Checks "Confirm address to skip validation"** checkbox
8. Clicks Update
9. Verifies the fix by re-checking the detail page

### Phase 3: Verify

After fixing, re-scan to confirm all orders are cleared:

\`\`\`bash
cd ~/.openclaw/workspace/agents/timcook
python3 scripts/flexport_portal_scanner.py
\`\`\`

### Phase 4: Report

Post results to PATI group:
- How many orders were found with invalid address
- Which ones were fixed successfully
- Any that couldn't be fixed (need manual intervention)

---

## Scripts

| Script | Purpose |
|--------|---------|
| \`scripts/flexport_portal_scanner.py\` | Scans Flexport /orders page, finds orders with "INVALID ADDRESS" status |
| \`scripts/flexport_portal_fixer_v4.py\` | Fixes invalid address orders by cleaning fields and skipping validation |

### Scanner details

The scanner:
1. Logs into Flexport portal via Playwright
2. Navigates to \`/orders\`
3. Reads the page HTML to find all order rows with "INVALID ADDRESS" status
4. Extracts order numbers (#WNXXXXXX)
5. Outputs JSON results

### Fixer details

The fixer (\`flexport_portal_fixer_v4.py\`):
- **Dynamic navigation:** Uses Playwright \`locator(text=...).click()\` to navigate to order detail pages (Flexport uses JS-rendered links — static HTML parsing doesn't work)
- **Address cleaning:** Removes commas from street/city, clears Address 2
- **Province mapping:** Adds default province for EU countries when missing
- **Skip validation:** Checks the "Confirm address to skip validation" checkbox
- **Verification:** Re-checks the order detail page after update
- **Logging:** Writes results to \`logs/address_validator.jsonl\`

---

## Cron Job

Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00 ICT)

\`\`\`json
{
  "name": "flexport-invalid-address",
  "schedule": { "kind": "cron", "expr": "0 0,6,12,18 * * *", "tz": "Asia/Saigon" },
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "Run the Flexport invalid address workflow: scan Flexport portal for invalid address orders using scripts/flexport_portal_scanner.py. If orders found, fix them using scripts/flexport_portal_fixer_v4.py --batch. Report results to the PATI group."
  },
  "delivery": { "mode": "announce", "channel": "telegram", "to": "-5295288516" }
}
\`\`\`

**Current cron status:** ✅ Active, runs at 00:00, 06:00, 12:00, 18:00 ICT daily.

---

## Credentials

Stored in both scanner and fixer scripts:
- **Email:** chanphong@patigroup.com
- **Password:** phong0610Aa@
- **Portal URL:** https://login.portal.flexport.com
- **Orders URL:** https://portal.flexport.com/orders

---

## Error Handling

| Problem | Fix |
|---------|-----|
| Scanner fails to login | Credentials may have changed or MFA enabled — alert supervisor |
| Fixer can't find order row | The Flexport UI may have changed — update the locator selector |
| Fixer clicks Update but still flagged | Flexport re-validated after update — may need manual intervention |
| Playwright not installed | \`pip3 install playwright && playwright install chromium\` |
| No invalid address orders | Report "✅ Flexport queue clear" — no action needed |

---

## Key Learning (2026-05-07)

**Flexport portal renders order links via JavaScript** — they don't appear in static HTML. The original fixer tried to pre-extract Flexport order IDs from \`inner_html\`, which returned empty results. 

**Fix:** Use Playwright \`locator(text=...).click()\` to navigate to detail pages, then extract the Flexport order ID from the URL after navigation.

---

## North Star Alignment

- **NS#2: OTIF >98%** — Unblocking invalid address orders prevents delivery delays
- **NS#3: Refund rate <3%** — Fixing addresses prevents cancelled orders and refunds
- **NS#4: Churn 5–7%** — Customers get their orders on time instead of being refunded

---

## Related Skills

- \`skills/address-email-protocol/SKILL.md\` — Sends address confirmation emails to customers via Lark Base
- \`skills/best-3pl-protocol/SKILL.md\` — Best 3PL tracking number lifecycle
- \`skills/best-unfulfilled/SKILL.md\` — Best cannot ship → Flexport fulfillment workflow`,
  "flexport-self-learn": `---
name: flexport-self-learn
description: Diagnose Flexport portal scanner failures and propose selector/flow patches. Triggered ONLY by human after orchestrator alerts UI breakage. Uses browser MCP to inspect live portal vs scanner expectations. Output is a proposed patch — human reviews + applies. Read after receiving a Telegram alert from \`flexport_self_learn_orchestrator.py\`.
---

# Flexport Self-Learn

## When to invoke
- Operator (Phong / Bảo) explicitly asks: *"investigate flexport scan failure"* OR *"@timcookpatibot read flexport-self-learn skill"*
- Right after a Telegram alert from \`flexport_self_learn_orchestrator.py\` reporting consecutive scan failures
- When \`state/flexport_self_learn.json\` shows \`auto_disabled: true\`

## When NOT to invoke
- Routine successful scans (orchestrator handles silently)
- First-time alert on a transient error (e.g. timeout) — wait for second occurrence
- Without operator explicit instruction (anti-loop guard)

## Why this skill exists

Flexport portal UI changes occasionally (selector renames, new flows, MFA additions). Hard-coded selectors in \`flexport_portal_scanner.py\` and \`flexport_portal_fixer_v4.py\` break silently. This skill captures the diagnose → propose fix loop so the operator gets a concrete patch instead of just an alert.

**Loop safety**: this skill ONLY proposes patches. Application requires human "ship" reply. Never auto-apply.

## Procedure (6 steps)

### Step 1 — Read alert + diagnostics

The orchestrator drops artifacts to \`logs/flexport-debug/<TIMESTAMP>/\`:
- \`error.txt\` — exit code + stderr from scanner

Optionally (if scanner enhanced):
- \`screenshot.png\` — full-page capture at failure point
- \`page.html\` — DOM at failure point
- \`url.txt\` — current URL when fail happened

\`\`\`bash
read /Users/timcook/.openclaw/workspace/agents/timcook/logs/flexport-debug/<TIMESTAMP>/error.txt
read /Users/timcook/.openclaw/workspace/agents/timcook/state/flexport_self_learn.json
\`\`\`

### Step 2 — Classify failure class

The orchestrator already classifies. Check \`state.last_outcome\`:
- \`fail:credentials_invalid\` → password rotation needed (operator must update \`.api-credentials.json\`)
- \`fail:mfa_required\` → portal added 2FA (need app password or MFA-aware login)
- \`fail:selector_missing\` → UI element renamed (this skill's main use case)
- \`fail:page_timeout\` → portal slow / network issue (transient — wait, don't patch)
- \`fail:navigation_fail\` → URL structure changed
- \`fail:captcha_detected\` → portal added bot detection (cannot self-fix)
- \`fail:unclassified:*\` → novel error, read stderr carefully

### Step 3 — Use browser MCP to inspect live portal

Open browser via MCP (NOT Playwright in script — use interactive browser to compare):

\`\`\`
1. Navigate to https://login.portal.flexport.com/
2. Locate the email input — note current selector (name, id, placeholder)
3. Click Next/Continue button — note current selector
4. Locate password input — note current selector
5. Submit form — observe URL after login
6. Navigate to /orders — observe table structure
7. Click Invalid Address tab — note tab selector + URL change
8. Read order rows — note row selector + status column
\`\`\`

For each step, capture: current selector vs scanner's expected selector.

### Step 4 — Compare scanner code vs live UI

Read scanner script:
\`\`\`bash
read /Users/timcook/.openclaw/workspace/agents/timcook/scripts/flexport_portal_scanner.py
\`\`\`

Identify differences:
- Selector mismatch: scanner uses \`input[name="email"]\` but UI now has \`input[name="username"]\`
- Flow change: scanner expects "Next" button but UI now has direct password field
- New step needed: MFA prompt that scanner doesn't handle

### Step 5 — Propose patch (DO NOT APPLY)

Output a structured patch suggestion to Telegram:

\`\`\`
🔧 Flexport scanner patch proposal

Failure: selector_missing on password input
Old (line 26): await page.fill('input[type="password"]', FLEXPORT_PASSWORD)
New: await page.fill('input[name="passwd"]', FLEXPORT_PASSWORD)

Reason: Flexport renamed input from type=password to name=passwd (verified via browser MCP).

To apply: reply "ship flexport patch" — I'll write to scanner + run --dry-run before
re-enabling cron.

DO NOT auto-apply.
\`\`\`

### Step 6 — Apply ONLY after human "ship"

If operator replies "ship flexport patch":
1. Write patch to scanner script (preserve \`.bak\` of current)
2. Run scanner manually to verify
3. If scanner exits 0 → run orchestrator \`--reset\` → re-enable cron in jobs.json
4. If scanner still fails → revert .bak → escalate to human (do NOT propose another patch in same session — anti-loop)

If operator does NOT reply within 24h: do nothing. State stays auto-disabled. Telegram alert remains as record.

## Anti-loop guards (MANDATORY)

- ❌ NEVER auto-apply patches without explicit "ship X" reply from operator
- ❌ NEVER propose more than 1 patch attempt per failure session — if first patch fails, escalate human, do NOT retry
- ❌ NEVER re-enable cron automatically — operator runs \`--reset\` after verifying fix
- ❌ NEVER run scanner more than 3 times in one investigation session (rate limit on browser MCP costs)
- ✅ ALWAYS preserve \`.bak\` of script before any edit
- ✅ ALWAYS run \`--dry-run\` (or single test invocation) before declaring patch successful

## Reference paths

- Orchestrator: \`/Users/timcook/.openclaw/workspace/agents/timcook/scripts/flexport_self_learn_orchestrator.py\`
- State: \`/Users/timcook/.openclaw/workspace/agents/timcook/state/flexport_self_learn.json\`
- Audit log: \`/Users/timcook/.openclaw/workspace/agents/timcook/logs/flexport_self_learn_audit.jsonl\`
- Debug artifacts: \`/Users/timcook/.openclaw/workspace/agents/timcook/logs/flexport-debug/<TS>/\`
- Scanner: \`/Users/timcook/.openclaw/workspace/agents/timcook/scripts/flexport_portal_scanner.py\`
- Fixer: \`/Users/timcook/.openclaw/workspace/agents/timcook/scripts/flexport_portal_fixer_v4.py\`
- Cron job: id \`41ecddb0-e3a6-405c-a22f-28f3e9e8a35e\` in \`/Users/timcook/.openclaw/cron/jobs.json\`
- Sister skill: \`skills/spam-classification/SKILL.md\` (anti-loop pattern reference)`,
  "semantic-recall": `---
name: semantic-recall
description: |
  Recall past notes / past disputes via semantic search.
  Backed by CocoIndex incremental indexes (sentence-transformers + SQLite-vec).
trigger:
  - User asks "have we seen this before?", "what did we do last time?", "any similar past case?"
  - Agent is about to handle a new customer issue and wants prior-art lookup
  - Building defense narrative for a new ChargeFlow dispute
---

# Semantic recall — Skill v1 (POC 2026-05-11)

Two callable indexes, both local SQLite + sqlite-vec:

| Index | Source | Use case |
|---|---|---|
| memory_index.sqlite | \`~/.openclaw/workspace/agents/timcook/memory/*.md\` (50+ daily ops logs) | "what did we do for X last time" |
| disputes_index.sqlite | \`~/.openclaw/workspace/agents/timcook/dispute-evidences/<id>/00-manifest.json\` | "find similar past disputes for narrative reuse" |

## Quick usage

\`\`\`bash
# from anywhere on macmini:
~/.openclaw/workspace/cocoindex-poc/bin/cocoindex-poc query-memory "bridge crash auto-restart"
~/.openclaw/workspace/cocoindex-poc/bin/cocoindex-poc query-disputes "Not Received subscription repeat customer" --k 3
~/.openclaw/workspace/cocoindex-poc/bin/cocoindex-poc stats
\`\`\`

## When you (timcook) should call this

- Before composing a reply to a customer email — query the memory index with
  the customer's question. If a top result has distance < 1.0, read it and
  cite the prior context in your reply.
- Before building a dispute defense narrative — query disputes index with
  "<reason> <customer profile>". If top result is the same reason and is in
  "Won" status, reuse the narrative structure.
- When a user (Phong/Bao) asks "have we seen X" or "any similar past Y",
  query and surface top 3 results.

## Distance interpretation (MiniLM, cosine-similarity-derived)

- **< 0.85** — strong match, content is directly relevant
- **0.85–1.0** — moderate match, partial topical overlap
- **1.0–1.2** — weak match, may share keywords only
- **> 1.2** — likely unrelated, don't cite

## Refresh policy

- Memory index: refreshed nightly via cron (recommended 4:00 ICT).
  Memoization means unchanged files skip work, so daily refresh is cheap.
- Dispute index: refresh after each new dispute manifest is written
  (i.e. after \`chargeflow-collect-evidence\` finishes uploading).
  Add to that skill's Phase 6: \`bin/cocoindex-poc update-disputes\`.

## Anti-patterns

- ❌ **Don't paste raw retrieval results into customer reply.** Use them
  as context to inform tone/facts; rewrite in current voice.
- ❌ **Don't query with the customer's literal email body** — it's full of
  noise. Distill to a 6-12 word topic phrase first.
- ❌ **Don't trust ranks blindly for proper-noun queries.** MiniLM is weak
  at exact names. If user asks for "customer X", grep the memory dir for
  the literal name and merge with semantic top-K.
- ❌ **Don't re-run \`cocoindex update\` in a loop** — memoization handles
  incremental. Run it once per change cycle (nightly cron or post-write hook).

## Drift / recovery

If the index gets corrupted or the schema needs to change:
\`\`\`bash
cd ~/.openclaw/workspace/cocoindex-poc
source venv/bin/activate
export COCOINDEX_DB=$PWD/cocoindex_state
cocoindex drop main.py -f      # nukes state + tables
cocoindex update main.py       # rebuild
\`\`\`

## Stack pinned

- Python 3.12 venv at \`~/.openclaw/workspace/cocoindex-poc/venv\`
- cocoindex 1.0.3, sqlite-vec 0.1.9, sentence-transformers 5.4.1
- Model: sentence-transformers/all-MiniLM-L6-v2 (384-dim, ~80MB)
- COCOINDEX_DB: \`~/.openclaw/workspace/cocoindex-poc/cocoindex_state\` (LMDB)

See \`~/.openclaw/workspace/cocoindex-poc/RUNBOOK.md\` for full architecture
and the 5 use-case roadmap (only 2 deployed so far: memory + disputes).`,
};
