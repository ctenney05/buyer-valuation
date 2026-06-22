# Data Contract

How data flows **into** and **out of** the Buyer Evaluation hub. Everything here is real code in `src/lib/` — these schemas don't drift from the implementation because the components consume the same functions.

```
Proposal agent ──IN──▶  data/renewalData.js  ──▶  Buyer portal (Home tab, deck)
                                                        │
                                          buyer clicks "Confirm & Renew"
                                                        │
Seller dashboard ◀── data/adminData.js ◀──── engagement / stakeholder telemetry
        │
        └──OUT──▶ lib/signals.js (passive signals) + onDecision (active signal) ──▶ next stage
```

---

## DATA IN — from the Proposal agent

**Source:** Proposal agent (pipeline stage 3). **Lands in:** `data/renewalData.js`. **Schema + adapter:** `lib/proposalInput.js`.

The Proposal agent generates the renewal proposal — order form, pricing, redlines, and the **pricing justification** sentence. That output becomes the buyer's Home tab.

### The shape the agent emits

See `PROPOSAL_INPUT_SAMPLE` in `lib/proposalInput.js` for the fully-commented, copy-pasteable object. Top-level keys:

| Field | Type | Drives |
|---|---|---|
| `dealId` | string | identity |
| `vendor` / `vendorDomain` / `product` | string | header, logo |
| `buyerCompany` / `buyerDomain` | string | header, logo |
| `contractStart` / `renewalDate` | ISO date | **countdown** + progress bar |
| `annualCost` | number | ROI calculator, confirm dialog |
| `orderForm.lineItems[]` | array | the order-form table |
| `orderForm.renewalOptions[]` | array | the renew/upgrade selector |
| `orderForm.pricingJustification` | string | **the agent's headline output** — narrate "written by the Proposal agent, injected here" |
| `orderForm.highlightDiffs[]` | array of `{type:'added'\|'changed'\|'removed', title, prev?, curr?}` | the color-coded **redlines** |
| `orderForm.keyChanges[]`, `msaUrl`, `total`, `prevTotal`, addresses… | — | rest of the order form |

### Wiring it up

The buyer tabs import `{ renewal, orderForm }` from `data/renewalData.js` **directly** (the portal is single-deal — see README's #1 seam). So go live by either:

```js
import { applyProposalOutput } from './lib/proposalInput.js';
const { renewal, orderForm } = applyProposalOutput(proposalJson);
// → return these from the API behind renewalData.js, or codegen renewalData.js from them.
```

`applyProposalOutput(p)` is a pure 1:1 mapping (proposal JSON → the two exports the tabs read). **Only `proposalInput.js` and `renewalData.js` change when the real agent goes live.**

---

## DATA OUT — buyer-evaluation signals

There are **two** outbound signals. Both derive from the **seller** deal shape (`data/adminData.js`).

### 1. Passive signals — `lib/signals.js`

Engagement, stakeholder pull-ins, and questions — derived from `portalViews` / `portalAccessLog` / `activityLog`. The seller UI (`PipelineList`, `ActivityFeed`) imports these same functions, so the dashboard and the downstream payload can never disagree.

**`getBuyerSignals(deal, today)`** returns the normalized payload a downstream agent consumes. Real output for the sample Airbnb deal (`deal-003`):

```json
{
  "dealId": "deal-003",
  "company": "Airbnb",
  "stage": "Buyer Evaluation",
  "renewalDate": "2026-09-11",
  "daysToRenewal": 85,
  "engagement": {
    "level": "engaged",            // 'engaged' | 'some' | 'none' | 'renewed' | 'declined'
    "portalViews": 4,
    "chatMessages": 2,
    "lastActive": "Today",
    "daysInactive": 0
  },
  "stakeholders": [                 // the buying committee forming — Evan's north-star signal
    { "name": "David Park", "role": "Legal", "firstSeen": "Jun 10", "time": "11:30 AM" },
    { "name": "Alex Chen",  "role": "CFO",   "firstSeen": "Jun 18", "time": "2:15 PM"  }
  ],
  "questions": [
    { "text": "Asked about pricing increase",    "date": "Jun 5"  },
    { "text": "Asked about seat count changes",  "date": "Jun 10" }
  ]
}
```

**`getPipelineSignals(deals, today)`** maps it over the whole pipeline.

Engagement rules (in `engagementLevel`): keyed on **portal opens only** — `≥4 = engaged`, `≥2 = some`, else `none`. A lone chat message does **not** count as engaged (a buyer who asked one question then went dark still reads dark).

Other exported helpers: `engagementSignal` (UI label+color), `engagementRank` (sort key), `stakeholderPullIns`, `questionsAsked`, `buildActivityEvents` (the cross-account feed).

> The module does **not** track a terminal deal status (renewed / declined / overdue) — every deal is in evaluation. The renewal decision leaves as an **event** (below), not as a status field on the signals payload.

### 2. Active signal — the renewal decision (`onDecision`)

The **highest-value** signal: the buyer's actual decision. When the buyer clicks **Confirm & Renew** in `BuyerPortal`, it fires an event:

```js
<BuyerPortal onDecision={(d) => { /* d = { dealId, status: 'renewed', selectedOption } */ }} />
```

Forward this to the next stage. It's an outbound **event**, not a deal-status mutation — the hub deliberately keeps no terminal-state machine.

---

## The two deal shapes (reference)

One deal exists in two representations — buyer-facing and seller-facing. `deal-001` (Uber) is the same renewal in both.

| Concern | `renewalData.js` (buyer) | `adminData.js` (seller) |
|---|---|---|
| Scope | single deal | full pipeline (sample: 11 deals) |
| Identity | `renewal.buyerCompany`, `renewal.vendor` | `deal.buyerCompany`, `deal.vendor` |
| Renewal date | `renewal.renewalDate` | `deal.renewalDate` (+ `daysToRenewal`) |
| Economics | `renewal.annualCost`, `orderForm.*` | `deal.annualValue` |
| Proposal detail | **rich** (`orderForm` line items, redlines, justification) | — |
| Engagement telemetry | — | **rich** (`portalViews`, `portalAccessLog`, `activityLog`, `chatTranscript`, `sharedWith`) |
| Decision | emitted via `onDecision` event | — (no terminal status; every deal is `evaluation`) |

**IN populates the buyer shape; OUT derives from the seller shape.** In production both should be projections of one canonical deal record — this module keeps them separate to mirror the buyer-facing vs. seller-facing split.

> Scope note: this module intentionally has **no terminal-state machine**. The overdue / renewed / declined countdown states, the status-based pipeline sort, and the >60-day archiving were removed — every deal is in evaluation, and the renewal decision exits as an `onDecision` event rather than a status. Re-add them downstream if the combined dashboard needs closed-deal handling.
