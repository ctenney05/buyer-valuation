# The Renewals Hub — Product Requirements Document

**Status:** Draft · **Author:** Cooper Tenney · **Date:** 2026-06-19 · **Audience:** Exec / external (Pareto Agent leadership, design partners)

## Summary

The Renewals Hub is a read-only buyer portal that centralizes everything a buyer needs to complete a contract-renewal evaluation — the proposed order form, a plain-language year-over-year diff, ROI proof, contract history, and direct seller contacts — paired with a context-aware chatbot. It is the **Stage 4 (Buyer Evaluation)** deliverable in Pareto Agent's four-agent renewal pipeline. Its job is to collapse the "dark period" — the weeks buyers go silent during renewal — by doing their internal justification work *for* them, and to make that previously invisible buyer activity legible to the seller through a paired admin dashboard.

## Problem / Motivation

> "Going dark is usually one of a few things: you're reassessing… there can be internal justification… or every vendor starts the renewal cycle 6 months out, and I hate an always-on cycle. It's fully exhausting." — Courtney Cherry-Ellis, buyer

Buyers don't go silent because they've lost interest. They go silent because renewal forces unassisted internal work: digging up last year's contract, reconstructing what changed, rebuilding an ROI case for Finance, and quietly looping in Legal, Procurement, and InfoSec. Today both sides lose:

- **Buyers** can't easily get the inputs they need. Asking the vendor for a contract feels like flagging churn, so they don't ask — and the vendor doesn't volunteer it for the same reason (Luke Newquist). Pricing is opaque after a multi-year term ("you don't actually know where that $92 per person per month is" — Courtney). Vendors never take credit for the features they shipped during the term, so buyers have no ammunition to justify a renewal internally (Courtney).
- **Sellers** see nothing during this window. They can't tell a reassessing buyer from a churning one, can't see that Legal just got pulled in, and learn the deal is dead only when it's too late to act.

**Evan's north star:** *"Buyers go dark. If I could actually see what they're actually doing, who else is getting involved — that's extremely valuable."*

There are two users of one product: the buyer (who gets a frictionless evaluation surface) and the seller (who gets visibility into buyer engagement, with **stakeholder breadth as the primary buying signal**).

## Goals

- **Shorten the dark period.** Hand the buyer every input they'd otherwise assemble themselves — proposed order form, YoY diff, ROI, contract history — in one read-only place, with zero "asking = churn signal" dynamic.
- **Make flat renewals one-click.** A buyer who likes the deal as-is can Quick-Renew without a call (Christine: *"If it were flat… sign, I'll sign it early."*).
- **Surface what changed, in plain language.** YoY contract diff calling out auto-renewal, uplift %, term, and MSA changes (Christine).
- **Provide internal justification ammunition.** Show ROI proof and features shipped during the term that the buyer actively uses (Courtney, Luke).
- **Make pricing legible.** Per-unit clarity and visible levers (seats, term) instead of opaque bundles, so the champion looks credible to Procurement (Jeremy, Brennan).
- **Give the seller engagement visibility.** Reveal who is engaging and *who else got pulled in* (Finance? Legal? Procurement?) — the buying signal Evan and Scott care most about.
- **Slot cleanly into the agent pipeline.** Consume structured output from the Qualification and Proposal agents with a single documented data contract.

## Non-Goals

- **Not a negotiation tool.** Jeremy explicitly doesn't want to *see* the negotiation. The hub presents what's being bought; it does not host back-and-forth bargaining.
- **Not a feature land-grab.** Per Evan, do not add seller-side features outside of stakeholder/engagement visibility.
- **No write-back to source systems (demo scope).** Quick Renew and scheduling are not yet built; when added they will be visual-only until backend wiring is complete (see Rollout). The chatbot tab is built with canned keyword-matched replies. Downloads are visual-only.
- **Not a general CLM/contract-management product.** Scope is the renewal evaluation moment, not full contract lifecycle.
- **No buyer-facing aggregate analytics.** Engagement data is seller-only.

## Personas

| Persona | Role / context | Core pain | What the hub gives them |
|---|---|---|---|
| **Christine Maxey** (Nvidia/LeanData) | MarTech buyer, wants to transact not be sold to | Vendors never show prior vs. current pricing; she digs up old contracts herself | Prior + current order form, plain-language YoY diff, one-click flat renewal |
| **Jeremy Schwartz** (Palo Alto Networks) | Enterprise product owner; 10+ stakeholders, 3–6mo InfoSec | Procurement fights price; he just wants clarity to hand off | Transparent pricing with visible levers; clean docs that make him credible |
| **Brennan McAdams** | Pragmatic buyer; hates line-item complexity | Opaque line items "worse than a car sticker"; signals ignored | Per-unit pricing; flat renewals get a "sign now" path |
| **Luke Newquist** (Nvidia) | Buyer; Finance requires ROI proof every cycle | Asking for a contract feels like a churn flag; builds ROI inputs himself | Contract + renewal date + ROI building blocks surfaced proactively |
| **Courtney Cherry-Ellis** (Sutter Hill/Auditboard) | Senior revenue leader; self-serve mindset | Going dark = internal justification work; vendors never take credit for improvements | "What's new since you bought this" tied to her usage; everything in one place |
| **The Seller / AE** (e.g. Evan) | Account manager carrying a renewal book | Buyers go dark; can't see who's involved or whether to act | Pipeline engagement signals + per-account stakeholder visibility |

## Proposed Approach

A single React + Vite SPA currently implementing the buyer portal. Admin mode is planned but not yet built.

- **Buyer mode** — a 5-tab read-only portal (Home, Chatbot, Contract History, ROI Calculator, Vendor Contacts) presenting one renewal. The Home tab shows a renewal banner (vendor name, status badge, days-to-renewal count, annual spend, AE/CSM names), a row of four metric cards (Annual Spend, Seats Purchased, Seats Active, Cost/Seat), an action-items checklist, and a key-dates timeline.
- **Admin mode** *(not yet built)* — a master-detail seller dashboard: a pipeline list of accounts with inline engagement signals (left), and a per-account detail pane (right) leading with **stakeholder visibility** and engagement telemetry.

The hub is **Stage 4** of the pipeline. Upstream agents feed it:

```
Qualification (Aaron) ──► Outreach (Parth) ──► Proposal (Dean) ──► Buyer Evaluation (Cooper)
   account type,                                  justified         ◄── THE RENEWALS HUB
   urgency, red flags,                            pricing,
   recommended action                            tailored deck
```

- The **Proposal agent** writes the pricing justification injected into the order form ("this sentence was written by the proposal agent").
- The **Qualification agent** writes a per-account signal (account type, urgency, tone, red flags, champion, recommended action) that **pre-configures which buyer portal sections are shown** (it no longer renders as an admin card — per Evan, "those agents have already told me"; the signal works in the background).

**Data boundary:** all content is fake data in `src/data/`. Going to production = replacing those exports with API calls; the UI is unchanged. The single integration contract for the Qualification agent will be `src/data/qualificationOutput.js` *(not yet created)*.

## Detailed Design — Feature Set

### Buyer portal

**Home tab:**
- **Renewal banner** — vendor name, status badge (On Track / Review Needed / At Risk), days-to-renewal count, annual spend, AE and CSM names; contract term dates in a footer row.
- **Metric cards** — four stat tiles: Annual Spend, Seats Purchased, Seats Active, and Cost/Seat, each with a YoY delta badge.
- **Action items** — checklist of open tasks with owner label, due date, and a progress bar showing completion count.
- **Key dates** — chronological timeline of upcoming milestones (negotiation, budget lock, legal review, renewal deadline) with color-coded urgency dots.

*Not yet built: countdown box with elapsed-progress bar; "Your products" Included/Add-on list; Highlights toggle; Proposed Order Form with Redlines toggle, Pricing Justification, and renewal-option selector; inline chatbot panel; inline contacts panel; Deck teaser.*

**Contract History tab** — a table of prior contracts showing term, annual value, seat count, status badge (Active / Expired / In Negotiation), signed date, and notes.

*Not yet built: grouped document library (Legal & Compliance, Product Briefs, Implementation & Support sections); format badges (PDF/DOCX/Link); Updated/New/Required-to-sign tags; transient "Saved" state.*

**ROI Calculator tab** — three input sliders (typeable) compute ROI and payback against annual cost. This is the Finance-proof artifact buyers otherwise build themselves.

**Chatbot tab** — a standalone renewal-assistant chatbot with keyword-matched canned replies covering renewal date, seat utilization, action items, and spend comparison; ships with suggested-prompt chips (demo mode).

**Vendor Contacts tab** — a grid of seller-team contact cards showing name, role, team badge (Sales / Customer Success / Pre-Sales / Support / Professional Services), email, and phone.

**Renewals Deck tab** *(not yet built)* — the Proposal agent's tailored deck (cover → pricing → next steps), expandable slide-by-slide with keyboard nav. Shown only when a proposal has been prepared.

**Quick Renew** *(not yet built)* — header CTA with a confirmation modal for frictionless flat renewal.

**Planned, not yet built:** a "What's new since you bought this" module — features shipped *during the contract term* that the buyer actively uses, as internal justification ammunition (Courtney's headline ask). Today the closest built surface is the ROI Calculator; it does not yet tie shipped features to the buyer's usage. This is the highest-value next addition to the buyer portal.

### Admin dashboard (seller)

*(Not yet built — no code exists in `src/components/Admin/`; design intent documented below for implementation reference.)*

The dashboard is **strict master-detail**, per Evan's 1:1 (Jun 19): *"first I'm seeing a summary of accounts and once I click into an account, I'm only seeing the account."* The summary and the account never coexist on screen — the original failure of the bucketed Portfolio Snapshot was that it stayed pinned above the account detail and read as a whole-product dashboard.

- **Landing state — account snapshot** (`SnapshotView`, default when `selectedDealId` is `null`). A summary of the active book shown *before* any account is selected; clicking an account collapses the list and the detail goes full-width with a back button (the snapshot is not visible while inside an account). Card priority is set by what Evan actually asked for — his two stated signals lead:
  - **Gone-dark alerts (most prominent — north star).** Active deals that are *Not engaged* or inactive ≥7 days, sorted by days-to-renewal asc: `Company · {days}d to renewal · silent {N}d · {views} opens`. Grounded in Evan: *"the closer they are to renewal, the more I'd be worried that they're not engaged,"* and Scott's surviving "flag accounts that have done nothing." Reuses the exported `engagementSignal` / `daysInactive` helpers so it matches the inline row rule.
  - **New stakeholders pulled in (primary buying signal).** Per active deal, scan `portalAccessLog` for a non-champion (name ≠ `deal.buyerContact.name`) with a recent date (~7 days): `Company · Name (Role) · date`, most-recent first. This is the *"who else got pulled in"* signal — Evan framed it within an account, so surfacing it cross-account on the landing page is a deliberate extrapolation, not a verbatim ask.
  - **Engagement breakdown** *(de-prioritized).* Evan floated three buckets (*"not engaged, somewhat engaged, very engaged… maybe those three"*) then reversed — *"the status isn't as interesting to me as how close they are to renewal."* So engagement lives as the **per-row signal**, not a headline aggregate tile. Include only as a minor at-a-glance tally, if at all.
  - **Portfolio metrics tiles** *(cut / minimal — flagged risk).* Active-renewal count, ACV-at-stake, nearest renewal. Evan never asked for these and they're the closest to the "*is this the dashboard for the entire product?*" reaction that killed the original snapshot. Omit, or keep to a single thin context line.
- **Pipeline list** — accounts sorted by urgency (overdue first, then days-to-renewal). Each row shows days-to-renewal + a right-aligned **engagement signal** (Engaged / Some activity / Not engaged, driven by portal opens — a lone chat message does *not* count as engaged) and a third line surfacing stakeholder roles or inactivity ("No activity in N days"). Overdue deals get a solid red badge. Arrow-key navigable.
- **Deal detail** — header (logo, company, inline progress, ACV) → countdown → **Stakeholders card (placed first — primary buying signal)** showing who the portal was shared with and each person's last-access date → engagement section (Portal Opens, Chatbot Messages, Last Active + a full Portal Access Log). *(The Qualification Signal card was removed Jun 19 per Evan — "those agents have already told me… I wouldn't put them into boxes." The signal still flows in the background to pre-configure portal flags; it just has no on-screen card.)*
- **Section heatmap** — Crazy-Egg-style overlay on a live schematic of the buyer portal showing which sections the buyer actually dwelled on (e.g. Airbnb hottest on Order Form + What's Changed, where Finance/Legal dug in).
- **Portal Configuration** — per-account feature-flag toggles (tabs + Home sections) with a **live Buyer Preview schematic** that updates instantly. Defaults are pre-set by the Qualification agent's `accountType` (upsell / flat / downsell).

### Data contract (the only file that changes when agents go live)

`qualificationOutput.js` *(not yet created in `src/data/`)* per account:
```
{ dealId, generatedAt, accountType: 'upsell'|'flat'|'downsell',
  urgency, communicationTone, renewalStory, usageHealth,
  redFlags[], champion, recommendedAction }
```
`accountType` → default buyer-portal flags via `FLAG_DEFAULTS` (e.g. `flat` shows Highlights, hides seat utilization). Seller can override any flag manually.

## Success Metrics

- **Dark-period length** — days between proposal sent and buyer's first substantive response (target: down).
- **Time-to-signature on flat renewals** — Quick-Renew adoption; early signatures (Christine/Brennan both sign flat deals early when handed the info).
- **Stakeholder visibility** — % of renewals where the seller can name the additional stakeholders pulled in (Legal/Finance/Procurement) before close.
- **Portal engagement** — opens, sections viewed, return visits per account.
- **Self-serve rate** — renewals completed without a live call.

## Alternatives Considered

- **Email + attachments (status quo)** — what happens today; produces the dark period and zero seller visibility. Rejected: it's the problem.
- **Seller-only analytics dashboard, no buyer surface** — gives visibility but doesn't reduce buyer friction, so there's less for the buyer to engage with and less signal to observe. Rejected: the two halves reinforce each other.
- **Full CLM / negotiation platform** — too broad; Jeremy explicitly doesn't want to see negotiation. Rejected as scope creep.
- **Portfolio Snapshot (bucketed aggregate) pinned in the deal detail** — built then cut (Jun 19, per Evan): read as aggregate data while looking at one account, breaking the strict master-detail model. Engagement moved inline onto each row. **Reintroduced in a different form** as the `SnapshotView` *landing state* (shown only when no account is selected, replaced full-screen on drill-in) — this resolves Evan's objection, which was the snapshot *coexisting* with the account detail, not the existence of a summary. Per the 1:1, the landing cards lead with his two signals (gone-dark, new stakeholders); aggregate portfolio tiles and an engagement-bucket card are de-scoped because he reversed on buckets and never asked for whole-book metrics.

## Risks & Open Questions

- **Buyer adoption of a vendor-hosted portal.** Mitigation: read-only, no login friction, surfaces things buyers already want; "asking = churn" dynamic removed.
- **Engagement tracking perceived as surveillance.** Mitigation: it mirrors what buyers expect from any modern web product; keep it seller-only and framed around being responsive, not creepy.
- **Quality of upstream agent output.** Garbage qualification/proposal content surfaces directly to the buyer. Mitigation: single reviewable data contract; seller can override flags and content.
- **Open:** Does Quick Renew write back to the CRM/CLM, or generate a signature task for the AE? (Demo is visual-only.)
- **Open:** Authentication / per-buyer access model for production (magic link vs. SSO).
- **Open:** Source-of-truth for the YoY diff and "features shipped during term" — which system feeds these in production?

## Rollout / Testing

- **Now (demo):** All data is fake (`src/data/`), all actions visual-only. Buyer portal demo covers the five built tabs (Home, Chatbot, Contract History, ROI Calculator, Vendor Contacts). Admin pipeline demo (Uber reads dark, Airbnb engaged, stakeholder card first) is the target narrative for when admin mode ships. Each agent module demos as a separately sellable unit; dashboards consolidate per customer.
- **Phase 1 — real read data:** Replace `src/data/*` exports with API calls (contract history, order form, ROI inputs, engagement telemetry). No UI change required.
- **Phase 2 — agent integration:** Wire `qualificationOutput.js` to Aaron's qualification agent; pipe Proposal-agent pricing justification + deck.
- **Phase 3 — write actions:** Back Quick Renew, scheduling, and document downloads with real services; add auth.
- **Testing:** persona walkthroughs (one per buyer above), engagement-signal correctness (lone chat ≠ engaged; overdue treatment), and feature-flag/heatmap composition (heat only on visible sections).
