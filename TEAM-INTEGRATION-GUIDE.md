# Account Page — Module Integration Guide

**For:** Aaron (Qualification), Parth (Outreach), Dean (Proposal), + Renewal owner
**From:** Cooper (owns the Account Page shell + Buyer Evaluation module)
**Goal:** combine our four agents into **one account page** — a single account, a tab per pipeline stage, each tab rendering your module.

```
Account header (company · countdown · ACV)
┌─ Qual ─┬─ Outreach ─┬─ Proposal ─┬─ Buyer Eval ─┬─ Renewal ─┐   ← stage tabs
└────────┴────────────┴────────────┴──────────────┴───────────┘
                         ▼ active tab renders YOUR module
```

Buyer Eval is already wired in. I need **three things** from each of you so your stage slots in the same way. There's a fully-worked reference — my `buyer-evaluation-module/` (in `summer-build` → `renewals-hub/buyer-evaluation-module/`). Copy its shape.

---

## 1. One mountable React component

A single default-exported component that renders your whole stage view and takes the shared `account` via props. **No internal router, no top-level mode toggle, no global singleton state** — it must render wherever I mount it.

```jsx
// QualificationModule.jsx  (Outreach / Proposal / Renewal: same shape)
export default function QualificationModule({ account, onEmit }) {
  // render your stage UI from `account`
  // when you produce an output for the next stage, call onEmit(yourOutput)
  return ( /* ... */ );
}
```

Props contract:

| Prop | Type | Meaning |
|---|---|---|
| `account` | object | the shared account record (schema below) — **read-only inputs** |
| `onEmit(payload)` | function | call when your stage produces an output the pipeline should carry forward (optional) |

If your module is currently a standalone app (its own header / routing / demo state), **extract a component out of it** first — that's exactly the work I did to produce `BuyerPortal` / `SellerDashboard` from my demo. Don't hand me the whole app; hand me the mountable piece.

---

## 2. Your data contract (IN / OUT)

The stages form a chain — each reads the previous stage's output and produces its own:

```
Qualification ─▶ Outreach ─▶ Proposal ─▶ Buyer Evaluation ─▶ Renewal
  (account plan)   (engagement)  (order form)   (buyer signals)    (decision)
```

Tell me, in writing (a short `.md` or a commented JS file), **two things**:

- **IN** — what your module needs from the account / prior stage to render. List the exact fields.
- **OUT** — what your module produces for the next stage, as a concrete JSON shape with an example.

Reference: my module ships this as real code — `lib/proposalInput.js` (what I consume from Proposal) and `lib/signals.js` (what I emit downstream). Yours can be that precise, or just a documented JSON shape — but it must be **concrete**, not prose.

> Most important handoffs to nail:
> - **Proposal → Buyer Eval (Dean → Cooper):** the order form + pricing justification. I already defined the exact shape I expect — see `buyer-evaluation-module/src/lib/proposalInput.js` (`PROPOSAL_INPUT_SAMPLE`). Please emit that shape.
> - **Buyer Eval → Renewal:** I emit engagement + stakeholder signals + a renewal-decision event (`lib/signals.js`).

---

## 3. The shared `account` object

Every module reads from one account record. Here's the canonical shape (it's the merge of what we already have). Fill the fields your stage owns; leave the rest alone.

```js
{
  id:            'deal-001',
  company:       'Uber',              // buyer
  domain:        'uber.com',          // for the logo
  vendor:        'LeanData',          // seller (us)
  renewalDate:   '2026-07-23',        // ISO
  daysToRenewal: 34,
  annualValue:   6800,
  buyerContact:  { name: 'Courtney Kim', role: 'VP Operations' },

  // Each stage hangs its data off the account under its own key:
  qualification: { /* Aaron: accountType, urgency, renewalStory, usageHealth, champion, ... */ },
  outreach:      { /* Parth: emails sent, opens, replies, sequence state, comps, ... */ },
  proposal:      { /* Dean: orderForm, pricingJustification, deck, story type, ... */ },
  buyerEval:     { /* Cooper: portalAccessLog, activityLog, engagement, decision, ... */ },
  renewal:       { /* signed agreement, DocuSign status, ... */ },
}
```

If your stage needs a field that isn't here, tell me and I'll add it to the shared record. **Don't invent a parallel account object** — one record, one source of truth.

---

## 4. Use the shared design system (so all tabs look like one app)

This is the #1 thing that makes the combined page look unified vs. like five different apps stitched together. Color comes from **CSS variables**; Tailwind is **layout only** (flex/grid/spacing — never Tailwind color classes for brand colors).

Use these tokens (full set in `buyer-evaluation-module/src/index.css`):

| Token | Use |
|---|---|
| `--surface-page #FAF9F5` | page background |
| `--surface-card #FFFFFF` | cards |
| `--clay-500 #D97757` / `--clay-700 #A8492A` | primary accent, active states |
| `--ink-700 #34322E` | body text |
| `--border-default #DED9C7` | card borders |
| `--success-600` / `--danger-600` | status |
| `--font-serif Newsreader` / `--font-sans Hanken Grotesk` / `--font-mono Spline Sans Mono` | fonts |

Apply them via inline `style={{ color: 'var(--clay-700)' }}` (that's the house style). Fonts load via the Google Fonts `<link>`s in `index.html` — I'll provide those at the shell level; just use the families.

---

## 5. How to deliver it to me

1. Put your module in **your folder in `summer-build`** (`1 Qualification`, `2 Outreach`, `proposal-agent`, or the renewal folder) — a `*/module/` subfolder with:
   - the mountable component(s)
   - a `README.md` (how to mount it) + your IN/OUT contract
   - your data file(s), swappable like my `data/`
2. Make it build on its own (`package.json` + `npm install && npm run build` should pass) so I can verify it before mounting.
3. Ping me with the folder path + branch and I'll wire `<YourModule account={account} />` into the matching stage tab.

---

## Per-person checklist

- [ ] **Mountable component** — default export, takes `account` prop, no internal routing/global state
- [ ] **IN contract** — exact fields you read (concrete)
- [ ] **OUT contract** — JSON shape + example you emit for the next stage
- [ ] **Design tokens** — uses the shared CSS variables, Tailwind for layout only
- [ ] **Builds standalone** — `npm run build` passes
- [ ] **Delivered** — in your `summer-build` folder, README + contract included, path sent to Cooper

**Worked example to copy:** `summer-build → renewals-hub/buyer-evaluation-module/` — `README.md`, `DATA_CONTRACT.md`, `src/lib/signals.js` (OUT), `src/lib/proposalInput.js` (IN), and the mountable `BuyerPortal` / `SellerDashboard`. When in doubt, mirror that.
