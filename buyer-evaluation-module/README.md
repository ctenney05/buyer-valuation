# Buyer Evaluation Module

The **Stage 4 (Buyer Evaluation)** slice of the Pareto Agent renewal pipeline, packaged for integration into the combined renewal dashboard. It is a **copy** of the working pieces from the Renewals Hub demo — the standalone demo app is preserved untouched; this folder is the integration-ready extract.

It contains two independently-mountable surfaces plus the data contracts that connect them to the rest of the pipeline:

| Surface | Entry component | What it is |
|---|---|---|
| **Buyer portal** | `src/components/buyer/BuyerPortal.jsx` | What the buyer sees for their renewal — proposed order form, countdown, "what changed", ROI, deck, documents, and the **Quick Renew** decision flow. |
| **Seller dashboard** | `src/components/seller/SellerDashboard.jsx` | Account-manager view — pipeline list + cross-account **activity feed** landing, and a full-width deal detail (stakeholder visibility, portal config, documents). |
| **Signal contracts** | `src/lib/signals.js`, `src/lib/proposalInput.js` | The data **out** (buyer-evaluation signals) and data **in** (Proposal-agent proposal). |

---

## Run it (testable)

The module is self-contained (its own `package.json`):

```bash
cd buyer-evaluation-module
npm install       # first time only
npm run dev       # dev server (or: npx vite)
npm run build     # production build (verifies the whole module compiles)
```

`src/main.jsx` → `src/DemoApp.jsx` is a **test harness only** (a top-right Buyer/Seller switch + shared state). It demonstrates the live data flow; it is **not** part of the shippable module. When you mount into the combined dashboard, drop `DemoApp.jsx` and render `BuyerPortal` / `SellerDashboard` directly.

---

## Folder map

```
src/
  index.css                      design tokens (:root) — REQUIRED by every component
  main.jsx, DemoApp.jsx          harness only (delete on integration)
  data/                          ← the swap point. Fake data today; API calls tomorrow.
    renewalData.js                 buyer single-deal content (DATA-IN target)
    adminData.js                   seller pipeline (DATA-OUT source) — sample: 11 deals
    documents.js, contractHistory.js, roiData.js, format.js
    qualificationOutput.js         input from the Qualification agent (drives portal pre-config)
  lib/
    signals.js                     DATA-OUT: buyer-evaluation signals (single source of truth)
    proposalInput.js               DATA-IN: Proposal-agent schema + adapter
    portalConfig.js                accountType → initial portal feature flags
  components/
    buyer/   BuyerPortal · Shell · HomeTab · DocumentsTab · ROICalculatorTab · ProposalDeckTab
    seller/  SellerDashboard · PipelineList · ActivityFeed · DealDetail
```

---

## Integrating into the combined dashboard

Copy `src/data`, `src/lib`, and `src/components/{buyer,seller}` into the host app and render the two entry components wherever the dashboard wants them. **Don't touch the leaf tabs** — and drop `main.jsx` / `DemoApp.jsx` (harness only).

```jsx
import BuyerPortal from '.../components/buyer/BuyerPortal.jsx';
import SellerDashboard from '.../components/seller/SellerDashboard.jsx';
import { adminDeals } from '.../data/adminData.js';
import { initDealFlags } from '.../lib/portalConfig.js';
import { getPipelineSignals } from '.../lib/signals.js';

// Host owns the shared portal-config so the seller's toggles drive what the buyer sees.
const [dealFlags, setDealFlags] = useState(() => initDealFlags(adminDeals));

// Seller surface
<SellerDashboard
  deals={adminDeals}
  dealFlags={dealFlags}
  onFlagChange={(id, k, v) => setDealFlags(p => ({ ...p, [id]: { ...p[id], [k]: v } }))}
/>

// Buyer surface (single-deal — pick the deal this buyer represents)
<BuyerPortal
  dealId="deal-001"
  featureFlags={dealFlags['deal-001']}
  onDecision={(d) => forwardToNextStage(d)}   // d = { dealId, status: 'renewed', selectedOption }
/>
```

Then wire the three data seams (full schemas in [`DATA_CONTRACT.md`](./DATA_CONTRACT.md)):

| Seam | Hook | What to do |
|---|---|---|
| **Data IN** (Proposal agent) | `applyProposalOutput()` in `lib/proposalInput.js` | Run the proposal JSON through it and have `data/renewalData.js` (or its API) return the result. Buyer tabs read that module directly. |
| **Data OUT** (passive) | `getBuyerSignals(deal)` / `getPipelineSignals(deals)` in `lib/signals.js` | Engagement, stakeholder pull-ins, questions. The seller UI already imports these — what you see equals what ships downstream. |
| **Data OUT** (decision) | `BuyerPortal onDecision` | Forward the event to the next stage. |

**Must-carry (or it renders unstyled — color is all CSS variables, layout is all Tailwind):**

1. Import `src/index.css` once at the app root.
2. Add these components' path to the host build's Tailwind `content` glob.
3. Carry the three Google Fonts `<link>`s from `index.html` (Newsreader / Hanken Grotesk / Spline Sans Mono).

---

## ⚠️ #1 integration seam — the buyer portal is single-deal

**The buyer leaf tabs (`HomeTab`, `ProposalDeckTab`, …) read their content straight from `src/data/renewalData.js` (the `renewal` / `orderForm` exports), NOT from props.** This is intentional: a buyer only ever sees their own renewal. So:

- **To show a specific deal's proposal, populate `renewalData.js`** (or the API behind it) with that deal's data. Do **not** try to prop-drill a deal object into the tabs — they don't read it.
- This is where the **Proposal agent's output flows in** — see [`DATA_CONTRACT.md`](./DATA_CONTRACT.md) and `lib/proposalInput.js` (`applyProposalOutput`).

The seller dashboard, by contrast, **is** multi-deal and takes its `deals` array via props.

---

## Two parallel data shapes (read before wiring data)

The module carries **two representations of the same deals**, by design:

- `data/renewalData.js` — the **buyer** shape. One deal (Uber × LeanData). Rich proposal content. This is what **data-IN populates**.
- `data/adminData.js` — the **seller** shape. The whole pipeline (`deal-001` = the same Uber deal). Engagement + stakeholder + activity data. This is what **data-OUT derives from** (`lib/signals.js`).

They overlap on identity/economics (company, vendor, renewalDate, annual value) and diverge on purpose (buyer = proposal detail; seller = engagement telemetry). `DATA_CONTRACT.md` has the field-by-field mapping. **Don't be surprised by the duplication — it's the buyer-facing vs. seller-facing split of one deal.**

---

## Design system dependency

All color comes from **CSS custom properties** defined in `src/index.css` (`:root`). Tailwind is used for **layout only** (flex/grid/spacing/position). Two things must be present or everything renders unstyled:

1. **`src/index.css` must be imported once** at the app root (the harness does this in `main.jsx`).
2. **Tailwind's `content` glob must cover this folder** (`tailwind.config.js` here already does). If you fold these components into another build, add their path to that build's `content` or the layout classes won't be generated.
3. **Fonts** (Newsreader / Hanken Grotesk / Spline Sans Mono) load via Google Fonts in `index.html` — carry those `<link>`s over.

---

## What was trimmed (vs. the standalone demo)

Cut — demo-only scaffolding that would confuse a combined dashboard:

- **Buyer/Admin mode toggle** (was in `Shell` + `AdminDashboard`) — the two surfaces are now separate mounts, not two modes of one screen.
- **"Reset demo" button** and the `buyerRenewed → deal-001` status-mutation glue — the renewal decision now flows cleanly through `onDecision`.
- **Redundant landing mode** — `SnapshotView`'s `LANDING_MODE='empty'` / `EmptyLanding` (the activity feed is the only landing).
- **`BuyerPreview` heatmap card** in the deal detail — one-off preview chrome (the seat-heat schematic). The **Portal Config** card it sat beside is **kept** — that's the demo-critical control the seller uses to shape the buyer's portal.
- **Terminal-state machine** — the overdue / renewed / declined countdown states, the status-based pipeline sort, the >60-day deal archiving, and the `signals.decision` field. Every deal is in evaluation; the renewal decision exits as an `onDecision` **event** (kept) rather than a deal status. Re-add downstream if the combined dashboard needs closed-deal handling.

Kept intact — genuine working views and the signal-producing interactions: the buyer Home (order form, countdown, redlines), all supporting tabs, the **Quick Renew / confirmation flow**, the seller **stakeholder visibility + activity feed**, and **Portal Config**.

**Kept but demo-only — safe to drop on integration.** A few self-contained Home-tab widgets are genuine UI but produce no signal and carry demo placeholders; they were left in to avoid surgery on the 1361-line `HomeTab.jsx`, but the combined dashboard can delete them freely: the **chatbot** widget (canned regex replies), the **ScheduleModal** call-picker (hardcoded "booked" slots), the **InviteModal** (hardcoded portal URL + fake "Copied" state), and the **DeckTeaserCard** (redundant with the Renewals Deck tab). Each is a discrete sub-component inside `HomeTab.jsx`.

**Cross-folder note:** `seller/DealDetail.jsx` imports `DocumentRow` + `GROUP_ICONS` from `buyer/DocumentsTab.jsx` (the documents list is shared between the buyer tab and the seller's Documents card). It's the only seller→buyer dependency — if you split the two surfaces into separate packages, lift those two exports into a shared module.

---

## Reworking the UI

Each component is self-contained and reads layout from Tailwind + color from CSS vars, so restyle freely by editing the component or swapping the token values in `index.css`. The **logic** you'd want to preserve across a redesign lives in `lib/signals.js` (engagement / stakeholder / decision derivation) — keep importing from there so the UI and the downstream contract stay in sync.

See [`DATA_CONTRACT.md`](./DATA_CONTRACT.md) for the exact IN/OUT schemas.
