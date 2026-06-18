# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:5173 (may use 5174 if port is taken)
npm run build    # production build
npm run preview  # preview production build
```

## What This Is

**The Renewals Hub** — a read-only buyer portal that centralizes everything a buyer needs to complete a contract renewal evaluation. Built for Pareto Agent as a sales demo. The goal is to shorten the "dark period" when buyers go silent by doing their internal justification work for them.

Stack: React 18 + Vite 5 + Tailwind CSS v3 + lucide-react icons. No router — tab state is managed with `useState` in `App.jsx`.

## Design System

Uses the **Pareto Agent design system** — warm cream palette, clay accent, Newsreader serif. Colors, fonts, and shadows are defined as CSS custom properties in `src/index.css` (`:root` block) and applied via inline `style` props throughout components. **Do not use Tailwind color classes for color-critical properties** — Tailwind is used for layout only (flex, grid, gap, padding, margin, position, z-index). This guarantees exact hex color matching.

Key CSS variables:
- `--surface-page: #FAF9F5` (cream background)
- `--clay-500: #D97757` (primary accent — buttons, active states, progress dots)
- `--clay-600: #BD5D3A` (hover/darker clay)
- `--ink-700: #34322E` (body text)
- `--border-default: #DED9C7` (card borders)
- `--font-serif: 'Newsreader'`, `--font-sans: 'Hanken Grotesk'`, `--font-mono: 'Spline Sans Mono'`

Fonts load via Google Fonts in `index.html`. Full token list is in `src/index.css`.

## Architecture

### Tab structure
3 tabs: **Home**, **Contract History**, **ROI Calculator**. `App.jsx` holds `activeTab` state and renders the matching component from `src/components/`.

The Home tab has a **3-column layout** (col-span-3 / col-span-5 / col-span-4 on a 12-col grid):
- **Left:** Countdown box, contract stat cards, "Your products" utilization list
- **Center:** Proposed Order Form — the main content (quote number, addresses, line items, redlines toggle, renewal option selector)
- **Right sidebar (Home only):** Chatbot widget (top), Buyer Renewal Team, Seller Account Team contacts

### Data layer
All fake data lives in `src/data/`. To swap in real data, replace these exports with API calls — nothing else changes:

| File | What it contains |
|---|---|
| `renewalData.js` | `renewal` (vendor/buyer/dates/annualCost), `contractStats`, `utilization`, `orderForm` (full order form with line items, addresses, redline diffs), `renewalProgress`, `buyerTeam`, `sellerContacts` |
| `contractHistory.js` | Historical contracts array |
| `roiData.js` | ROI calculator inputs/outputs |

### Key design decisions
- `utilization` uses `usagePct` values — a product is **Included** if `usagePct > 0`, **Add-on** if `0`. Only the badge is shown; no numbers or bars are displayed. The section heading is "Your products."
- The **Redlines toggle** uses clay-600 when ON (not rose/red). Shows/hides `orderForm.redlineDiffs`, color-coded by type (`added` / `changed` / `removed`).
- The **Quick Renew** button in the Shell header opens a confirmation modal (visual only — no backend). Hover states use `onMouseEnter`/`onMouseLeave` inline since Tailwind hover classes are avoided for colors.
- The **Countdown box** progress bar uses actual contract elapsed percentage (`daysElapsed / totalDays`), not a fixed 90-day window.
- The **step progress tracker** lives in a dedicated strip inside `<header>` (below the h-16 title row), separated by a subtle top border. Labels and dates are shown. Connecting line is at `top: 0.875rem`. The nav's sticky offset is `top-[144px]` to clear both header rows.
- Chatbot widget is UI-only (no backend) — messages stored in local component state with canned replies keyed on regex patterns.
- The nav `z-index` uses `z-[15]` (Tailwind arbitrary value) — `z-15` is not a valid Tailwind class.
- **Number inputs** (ROI calculator): spin buttons hidden globally via CSS in `src/index.css` (`-webkit-appearance: none` + `-moz-appearance: textfield`).
- **ROI Calculator**: Benefit Breakdown table removed. `roiLineItems` no longer used — ROI and payback calculate purely from the 3 sliders vs `annualCost`. `InputRow` shows label + typeable number input on top row, full-width slider below, min/max labels at bottom.

### Admin Dashboard (Seller View) — BUILT
- `App.jsx` holds `mode` state (`'buyer'` | `'admin'`); a segmented toggle in the Shell header switches views
- `src/components/Admin/`: `AdminDashboard.jsx`, `PipelineList.jsx`, `DealDetail.jsx`
- `src/data/adminData.js` with 15 fake pipeline deals — all vendor is "LeanData"
- Master-detail layout: `w-[380px]` pipeline list (left) + `flex-1` deal detail (right)
- **Admin header**: title is `"{vendor} Account Manager Dashboard"` — no buyer × seller chips
- **PipelineList**: days-to-renewal shown inline next to company name (not right-aligned); dot color based on `portalViews` (green ≥4, clay ≥2, red <2)
- **DealDetail engagement section**: 3 tiles (Portal Opens, Chatbot Messages, Last Active) + a full-width Portal Access Log table showing name/role/date/time per visit. `portalAccessLog` array on each deal drives this. Engagement Score removed.
- **Countdown box** in DealDetail handles 3 states: `evaluation` (countdown), `renewed` (green ✓ signed date), `declined` (red closed)
- **Quick Renew button** has a pulsing clay glow ring via `.quick-renew-pulse` CSS class + `@keyframes renew-pulse` in `index.css`
- **Pricing justification**: `orderForm.pricingJustification` in `renewalData.js` renders as a `[Proposal Agent]` badge + italic quote below the line items table in HomeTab. The badge label should read **"Pricing Justification"** (not "Proposal Agent") — buyers don't know what a Proposal Agent is. The distinction matters: redlines show WHAT changed; the justification explains WHY (e.g. "reflects a standard 5% annual increase"). The justification text is authored by Dean's proposal agent and injected here.
- **Overdue prevention**: `daysUntil()` in HomeTab uses `Math.max(0, ...)` so countdown never goes negative

## Multi-agent pipeline context

The Renewals Hub is the **Stage 4 (Buyer Evaluation)** deliverable in a 4-agent pipeline:

| Stage | Agent | Owner |
|---|---|---|
| Qualification | Flags accounts by usage/timing, builds renewal plan | Aaron (Cooper) |
| Outreach | Drafts and sends renewal emails, tracks comps | Parth (Dean) |
| Proposal | Generates tailored PowerPoint deck by story type (flat / justified increase / downsell) | Dean |
| **Buyer Evaluation** | **This portal** — buyer reviews proposed order form, ROI, history | Cooper |

**Justification content flows from the Proposal agent into this hub.** When demoing, narrate: "this sentence was written by the proposal agent and injected here automatically." The portal itself is not the origin of the justification.

**Demo framing (per Juliet, Jun 18 standup):** Each dashboard demonstrates a separate agent module that can be sold independently; dashboards will be consolidated based on what the customer wants. Open with a short preamble: the pain point (dark period / buyer goes silent), what this agent solves, then dive into the demo.

## Project Context

This is a demo built for buyers during Stage 4 of the Pareto Agent renewal pipeline (Qualification → Outreach → Proposal → **Buyer Evaluation**). The buyer personas driving design decisions are documented in the Dropbox folder one level up (`Buyer Painpoints.md`, `Features and Components of Buyer Evaluation Stage.md`).

At the end of every session, update this `CLAUDE.md` file with any new decisions, design patterns, or architectural context learned during the session.
