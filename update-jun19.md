# Renewals Hub — Updates Since Scott Demo (Jun 18)

---
**buyer side**
ading

**Admin dashboard**
- Portfolio Snapshot card added at top of deal detail — bucketed deal counts (At Risk / Monitoring / Engaged / Closed)
- Needs Action flag chips for deals ≤30 days with <2 portal opens

---

## Today (Jun 19)

### Admin pipeline list
- Overdue deals show a filled red **"Overdue"** badge instead of a negative day count
- Red dot on overdue accounts regardless of portal views

### Portfolio Snapshot
- Bucket labels updated: **Needs Action** (≤45d + low engagement, or overdue), **Renewing Soon** (catch-all active), **Engaged**, **Closed**
- **60-day archive**: closed deals older than 60 days disappear from the list and snapshot; archived count shown as a note below the tiles
- Expanded bucket rows show "Overdue" instead of a negative number

### Portal Configuration
- Per-account feature flag toggles visible in admin deal detail: Seat utilization, ROI Calculator, Contract History, Proposal Deck, Highlights, Renewal assistant
- Live **Buyer View** schematic next to toggles — tabs and sections update instantly as flags change

---

## Post Evan 1:1 (Jun 19, PM)

> Evan's framing: the new info he wants is *last interaction + engagement level + who else got pulled in*. He already knows the qual/proposal content from upstream agents — summarize it, don't put it in boxes. Strict master-detail: click an account → see only that account.

### Admin — simplified per Evan
- **Portfolio Snapshot — REMOVED.** Read as aggregate data while looking at a single account, breaking the master-detail model. Engagement now lives inline on each pipeline row (red/clay/green dot + engaged / not-engaged label + stakeholder roles).
- **Qualification-agent card — REMOVED** from the deal detail. The signal still flows in the background (drives portal pre-configuration) — just no on-screen box. "Those agents already told me."
- **Contacts (Buyer / Seller) card — REMOVED** from the bottom of the deal detail (redundant — contact info already lives in the engagement/stakeholder sections).
- **Buyer View heatmap (Crazy Egg / Qualified style) — ADDED, always on.** Each schematic section is shaded by how much time the buyer spent there (amber → orange → red) with a per-section time label + less→more legend. Driven by per-deal `sectionHeat`; renders only on visible sections. Demo: Uber reads cold (dark account), Airbnb warm (hottest on Order Form + What's Changed where Finance/Legal dug in).

### Buyer side
- **"Contract History" tab → "Documents".** Now a grouped library where contract history is one type among several:
  - **Legal & Compliance** — Master Service Agreement (link), Data Processing Agreement, SOC 2 Type II Report
  - **Contract History** — the original signed-terms table
  - **Product Briefs** — Orchestration, Scheduling
  - Trimmed from the first cut (was 10 docs across 4 groups) to reduce clutter; dropped add-on briefs + the Implementation & Support group.
  - Legal docs relabeled so the *why* is obvious to a non-specialist: DPA = "Privacy & GDPR data terms — for your Legal team"; SOC 2 = "Security & compliance — for your InfoSec review."
- **Schedule-a-call → Calendly/BookIt-style picker.** Real calendar: pick an available day + time slot, confirm, see a "You're booked" confirmation. Visual only.

### Still open (from the 1:1)
- **Meeting recording bot** — Evan does not want it auto-joining domain-wide (it joined his confidential meetings). Needs a per-meeting opt-in or a different solution. (Ops/permissions decision — not portal code.)
- **(Optional) Combine the two engagement views** — Evan floated merging the heatmap with the per-stakeholder "who viewed what & when" log into one view. The view-timestamps are the *more actionable* signal; the heatmap is the realistic-but-less-actionable companion.
