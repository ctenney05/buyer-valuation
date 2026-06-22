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

**Font-weight gotcha (Jun 21):** Spline Sans Mono (`--font-mono`) loads weights `400;500;600;700` in `index.html`. `font-bold` (700) was added Jun 21 — before that only 400/500/600 were loaded, so `font-bold` on mono text silently fell back to 600 and looked identical to `font-semibold`. When applying a new Tailwind weight to mono/serif/sans text, confirm that weight is in the `index.html` Google Fonts URL.

## Architecture

### Tab structure
4 tabs: **Home**, **Documents**, **ROI Calculator**, **Renewals Deck**. `App.jsx` holds `activeTab` state and renders the matching component from `src/components/`.

The tab id and internal flag key remain `'proposal-deck'` / `showProposalDeck` — only the user-visible label changed to "Renewals Deck". Likewise the **Documents** tab keeps the id `'contract-history'` and flag `showContractHistory` (App.jsx tab-hidden logic + Shell.jsx nav filter depend on these) — only the label and content changed. The component file stays `src/components/ContractHistory/ContractHistoryTab.jsx` but its default export is now `DocumentsTab` (imported under that alias in `App.jsx`).

The Home tab has a **3-column layout** (col-span-3 / col-span-5 / col-span-4 on a 12-col grid):
- **Left:** Countdown box, contract stat cards, "Your products" utilization list
- **Center:** Proposed Order Form — the main content (quote number, addresses, line items, redlines toggle, renewal option selector)
- **Right sidebar (Home only):** Chatbot widget (top), Buyer Renewal Team, Seller Account Team contacts

### Data layer
All fake data lives in `src/data/`. To swap in real data, replace these exports with API calls — nothing else changes:

| File | What it contains |
|---|---|
| `renewalData.js` | `renewal` (vendor/buyer/dates/annualCost), `contractStats`, `utilization`, `orderForm` (full order form with line items, addresses, redline diffs), `renewalProgress`, `buyerTeam`, `sellerContacts` |
| `contractHistory.js` | Historical contracts array (rendered as the Contract History section inside the Documents tab) |
| `documents.js` | `documentGroups` — the Documents tab content: ordered groups (Legal & Compliance, Contract History, Product Briefs, Implementation & Support). Each group is `kind: 'docs'` (a list of document rows) or `kind: 'contracts'` (renders the contract history table from `contractHistory.js`) |
| `roiData.js` | ROI calculator inputs/outputs |
| `format.js` | Shared formatting helpers — `formatCurrency(n)` (USD, no decimals). Imported by ROICalculator + Documents tabs (deduped from per-file copies). |

### Key design decisions
- **Documents tab** (`ContractHistoryTab.jsx`, label "Documents"): a grouped document library driven by `documentGroups` in `documents.js`. Contract history is **one group among several** (`kind: 'contracts'` renders the original contracts table; other groups render `DocumentRow` lists). Each doc has a `format` (`PDF`/`DOCX`/`Link`) → file badge + action verb (Download vs Open). `Link` docs (e.g. the MSA → `leandata.com/terms-of-service`) `window.open` in a new tab; file docs show a transient "Saved" state (visual only, no real download). `tag` renders a small pill (`Updated`/`New`/`Required to sign`). The admin Buyer-Preview tab chip mirror reads **"Docs"** (`PREVIEW_TABS` in `DealDetail.jsx`) to stay consistent with the renamed buyer tab. **`DocumentRow` and `GROUP_ICONS` are exported** (additive) so the admin Documents card can reuse them — `DocumentRow` is self-contained (its `FORMAT_STYLES`/`TAG_STYLES`/`formatDate` are module-local).
- **Schedule-a-call picker** (`ScheduleModal` in `HomeTab.jsx`, opened from `SellerContactsPanel`): a Calendly/BookIt-style modal — left rail shows the meeting summary (AM, 30 min, Zoom), right pane is a horizontal day strip (next 6 weekdays, generated with real `new Date()` since this is browser-side) + a 3-col time-slot grid. Some slots are deterministically "booked" (struck-through, disabled) via `slotBooked(dateIdx, slotIdx)` — stable, no `Math.random`, so it never shifts mid-demo. Confirming shows a "You're booked" screen; the card CTA then reflects the booked day/slot. Uses the **ocean** accent (matches the seller card). Visual only — no backend.
- `utilization` uses `usagePct` values — a product is **Included** if `usagePct > 0`, **Add-on** if `0`. Only the badge is shown; no numbers or bars are displayed. The section heading is "Your products."
- The **Redlines toggle** uses clay-600 when ON (not rose/red). Shows/hides `orderForm.redlineDiffs`, color-coded by type (`added` / `changed` / `removed`).
- The **Quick Renew** button in the Shell header opens a confirmation modal (visual only — no backend). Hover states use `onMouseEnter`/`onMouseLeave` inline since Tailwind hover classes are avoided for colors.
- The **Countdown box** progress bar uses actual contract elapsed percentage (`daysElapsed / totalDays`), not a fixed 90-day window.
- The **step progress tracker** lives in a dedicated strip inside `<header>` (below the h-16 title row), separated by a subtle top border. Labels and dates are shown. Connecting line is at `top: 0.875rem`. The nav's sticky offset is `top-[144px]` to clear both header rows.
- Chatbot widget is UI-only (no backend) — messages stored in local component state with canned replies keyed on regex patterns.
- The nav `z-index` uses `z-[15]` (Tailwind arbitrary value) — `z-15` is not a valid Tailwind class.
- **Number inputs** (ROI calculator): spin buttons hidden globally via CSS in `src/index.css` (`-webkit-appearance: none` + `-moz-appearance: textfield`).
- **ROI Calculator**: Benefit Breakdown table removed. `roiLineItems` no longer used — ROI and payback calculate purely from the 3 sliders vs `annualCost`. `InputRow` shows label + typeable number input on top row, full-width slider below, min/max labels at bottom.
- **Renewals Deck slide modal**: Expanded slide view shows visible `ChevronLeft`/`ChevronRight` buttons (`w-10 h-10`, `rgba(0,0,0,0.45)` bg) that are always rendered but `opacity: 0.2` when at first/last slide. ←/→ arrow keys navigate slides; Esc closes the modal. Navigation implemented via a `keydown` `useEffect` that fires only when `expanded !== null`.
- **Deck teaser on Home**: When `showProposalDeck` is on, a compact `DeckTeaserCard` appears in the Home right sidebar (between chatbot and seller contacts). Shows Cover, Pricing, and Next Steps thumbnails using the same slide components as the full tab (rendered at `size='thumb'`). "View full deck →" button calls `onTabChange('proposal-deck')` — prop threaded from `App.jsx` → `HomeTab`. SLIDES is exported from `ProposalDeckTab.jsx` and imported in `HomeTab.jsx`. Teaser and tab are both controlled by the `showProposalDeck` flag.
- **`showProposalDeck` default**: `false` for all deals except Uber (deal-001) and Airbnb (deal-003) — only show the deck when a proposal has actually been prepared. AE turns it on via the Portal Config toggle.

### Admin Dashboard (Seller View) — BUILT
- `App.jsx` holds `mode` state (`'buyer'` | `'admin'`); a segmented toggle in the Shell header switches views
- `src/components/Admin/`: `AdminDashboard.jsx`, `PipelineList.jsx`, `DealDetail.jsx`, `SnapshotView.jsx`
- `src/data/adminData.js` with 15 fake pipeline deals — all vendor is "LeanData"
- **Landing vs. detail layout (Jun 21, per Evan)**: the admin view is **no longer always master-detail**. On the **landing state** (`selectedDealId === null`) it is **list-dominant**: `PipelineList` (left, `flex-1`, ~3/4) + `SnapshotView` activity-feed **rail** (right, `w-1/4 min-w-[280px] flex-shrink-0`). **Clicking an account collapses both** — the `DealDetail` then takes the **full width** (list + rail disappear) with a **"← Back to pipeline"** affordance at the top of the detail (`onBack` prop → sets `selectedDealId` to `null`). AdminDashboard branches on `selectedDeal` to swap between the two (its JSX is unchanged; the widths live in the children's root classes). `selectedDeal` no longer falls back to `sortedDeals[0]` (null = landing); a `headerDeal = selectedDeal ?? sortedDeals[0]` keeps the header vendor chip stable since vendor is constant across the pipeline.
- **Admin header**: title is `"{vendor} Account Manager Dashboard"` — no buyer × seller chips
- **PipelineList**: days-to-renewal shown inline next to company name (urgency dimension). Each row has a **right-aligned engagement signal** (colored dot + label) — Evan's "per line, on the right hand side, tell me engaged / not engaged." Driven by `engagementSignal(deal)`, keyed on portal opens only: `Engaged` (green, views≥4), `Some activity` (clay, views≥2), `Not engaged` (red, <2), or muted `Renewed`/`Declined` for closed deals. **A lone chat message does NOT count as engaged** — Uber (1 view, 1 msg) must read dark per the demo narrative. The **left-edge dot uses the same `engagementSignal().color`** so the two never contradict — engagement is its own dimension, independent of renewal urgency (so an engaged overdue deal still reads green, with urgency carried by the "Overdue" badge). Since the list is now full-width (Jun 21), `DealRow` is a **wide column layout** (single line): `[engagement dot] · [Company + days/Overdue badge, w-56] · [renews MM/DD, w-28] · [recency/activity line, flex-1] · [engagement dot+label, right w-32] · [chevron]`. The **recency/activity** column (`activityLine(deal)`): red `"No activity in N days"` for evaluation deals inactive ≥7 days (e.g. Uber), otherwise a muted `"Active today / yesterday / N days ago"`. (The earlier clay stakeholder-role pills were removed Jun 21 — the "who got pulled in" signal now lives in the landing **activity feed** rail (`SnapshotView`), not on the list rows.) Overdue deals show a solid red filled "Overdue" badge instead of a day count. The list has a sticky **`ListHeader`** column-label row (Account / Renews / Last activity / Engagement) sharing widths via the `COL` const; its labels are `font-bold` + **black (`#000`)** mono caps (Jun 21).
- **Arrow key navigation**: ↑/↓ navigates the sorted pipeline list; selected row auto-scrolls into view (`scrollIntoView({ block: 'nearest' })`). On the landing state (no selection) `ArrowDown` opens the first deal.
- **Default selection is `null` (landing)**: `selectedDealId` inits to `null` in `App.jsx` so admin opens on the pipeline-list + snapshot landing (no account pre-selected). The PipelineList filter `useEffect` is guarded with `selectedDealId &&` so it only re-homes a *hidden* selection — it never auto-selects out of the null landing. (Buyer mode is unaffected: it reads `dealFlags['deal-001']`, not `selectedDealId`.)
- **`SnapshotView` (right pane on the landing, Jun 21) — now an ACTIVITY FEED**: every *account-grouping* card we tried (portfolio metrics, engagement tally, gone-dark, engagement buckets) read as either redundant with the urgency-sorted list or as the aggregate dashboard Evan dislikes — because **the list already IS the pipeline overview**. The resolution: the right pane carries the one axis the list structurally lacks — **time**. So `SnapshotView` renders a **cross-account activity feed** ("what buyers are doing across your pipeline"), newest first.
  - **High-signal events only** (`buildEvents`): (1) **stakeholder pull-ins** — `portalAccessLog` entries where `name !== buyerContact.name` → "{name} opened the portal" + role pill, `UserPlus` icon, clay; (2) **questions** — `activityLog` entries with `type === 'chatbot'` → `entry.detail`, `MessageCircle` icon, muted. Routine champion re-opens are intentionally excluded as noise.
  - Dates are `"Mon DD"` strings parsed via `parseLogDate(str, today)`. Window = `FEED_DAYS` (14) back from `today`, sorted desc, capped at `FEED_CAP` (15). Each row is a button → `onSelect(deal.id)`. With current data it surfaces ~15 events, Legal/Finance/CFO-heavy (the buying-committee story), Uber's lone question sinking to the bottom (dark narrative intact), quiet accounts absent.
  - **Slim rail layout (Jun 21)**: lives in a `w-1/4 min-w-[280px]` rail. `EventRow` is a **notification card**: header = `MiniLogo` favicon + company (serif) + relative `Nd`; a **type badge** pill (`UserPlus` "New stakeholder" clay / `MessageCircle` "Question" sunken); a detail line (stakeholder → **{name}** · {role}; question → the question text in quotes, 2-line clamp); and a mono meta line — stakeholder `Opened the portal · {Mon D}{ · time}`, question `Asked · {Mon D}` (days-to-renewal intentionally omitted — redundant with the list). `buildEvents` attaches the full `deal` (+ `time` for stakeholder events) to each event for this. Header is the plain "Recent activity" / "Across your pipeline" (an earlier "Buyer activity" masthead with icon+legend was reverted).
  - **Kind filter pills** (`FILTERS`: All / Stakeholders / Questions) sit above the list; `filter` state filters events by `e.kind` before the cap + grouping. Empty-state copy is kind-aware. The quiet-accounts line stays computed from unfiltered activity.
  - **Time-grouped**: events render under `Today` / `This week` (1–7d) / `Earlier` (8–14d) sub-headers (`GROUPS` const; empty groups skipped). Row markup is the `EventRow` component.
  - **Quiet-accounts one-liner** at the bottom: active deals with **no** event in the window (`buildEvents` returns the full windowed set; cap applies only to display) render as a muted `Moon` line — "Quiet — no new stakeholders or questions in 14d:" + each company name as an inline button → `onSelect`. Current data: Shopify · Atlassian · Box · Zendesk · Okta. Hidden when empty.
  - **Quick pivot**: top-of-file const **`LANDING_MODE = 'feed' | 'empty'`**. `'feed'` → `ActivityFeed`; `'empty'` → `EmptyLanding` (a centered "Select an account" empty state). One-word flip to switch — the fallback if the feed doesn't land.
  - Takes `deals` (sorted/filtered) + `today={DEMO_TODAY}` + `onSelect`. The `engagementSignal`/`daysInactive` exports in `PipelineList.jsx` are **no longer consumed here** (still used internally for the row activity line — harmless to keep exported).
- **DealDetail header card**: single flex row — company logo (40px, Google favicon API) + company name/vendor + inline ProgressTracker + ACV. No separate "RENEWAL PROGRESS" label or divider.
- **Company logos**: each deal has a `domain` field in `adminData.js`; rendered via `https://www.google.com/s2/favicons?sz=128&domain_url=https://${deal.domain}` with `onError` hide fallback. Clearbit Logo API is shut down — do not use it.
- **`BuyingTeam` card — Buying Team + Engagement combined (Jun 19, per Evan)**: the separate "Engagement / Portal Access Log" card was merged into the Buying Team card. Evan: "combine these two — here's what each of these people have done and when." The standalone access-log table was redundant (same people), so each stakeholder row now folds in their last visit: `Viewed {date} · {time} · {N visits}` (from `portalAccessLog` name match) or `Not yet viewed`. Header shows "Last active {deal.lastActive}" + the "+N stakeholders viewed" clay badge. The **chat-log toggle lives inside this same card** at the bottom (own `showChat` state in `BuyingTeam`; the old `DealDetail`-level state was removed). Renders right after CountdownBox — stakeholder breadth is the primary buying signal per Evan/Scott framing.
- **`DocumentsCard` (Section 6, replaced "Contract History" — Jun 19, per Evan)**: the admin contract-history table card became a **Documents** card mirroring the buyer Documents tab ("contracts are documents"). It's a **per-group accordion** (`AccordionGroup`), every group **collapsed by default** with an icon box + title + count + rotating `▾`. Two groups, lighter than the buyer's 4: **Legal & Compliance** (MSA/DPA/SOC 2 — the `id:'legal'` group from `documents.js`, rendered via the reused `DocumentRow`) and **Contract History** (per-deal `deal.contractHistory`, rendered by `ContractHistoryTable` — the old table extracted out of its card wrapper). Collapse pattern matches the BuyingTeam chat toggle.
- **All 15 deals** in `adminData.js` have `sharedWith[]`, `activityLog[]`, `chatTranscript[]` (where `chatMessages > 0`), and `domain`. Chat transcripts are company-specific.
- **Countdown box** in DealDetail handles 4 states: `evaluation` (countdown), `renewed` (green ✓ signed date), `declined` (red closed), `overdue` (evaluation with `daysToRenewal <= 0` — solid red background, white text, pulsing glow via `.overdue-pulse` CSS class)
- **Quick Renew button** has a pulsing clay glow ring via `.quick-renew-pulse` CSS class + `@keyframes renew-pulse` in `index.css`
- **Overdue pulse animation**: `.overdue-pulse` + `@keyframes overdue-pulse` in `index.css` — 1.5s cadence (faster than renew-pulse's 2s), danger-600 color
- **Pricing justification**: `orderForm.pricingJustification` in `renewalData.js` renders as a `[Pricing Justification]` badge + italic quote below the line items table in HomeTab. Badge reads "Pricing Justification" not "Proposal Agent" — buyers don't know what a Proposal Agent is.
- **Overdue prevention**: `daysUntil()` in HomeTab uses `Math.max(0, ...)` so countdown never goes negative
- **PortfolioSnapshot — REMOVED (Jun 19), reborn as the landing `SnapshotView` (Jun 21)**: the old bucketed snapshot card *inside the detail pane* was cut — Evan found it confusing because it read like aggregate data while he was looking at a single account (the `getBucket`/`BUCKETS`/`bucketDeals` machinery was deleted). The snapshot now lives **only on the landing state** (right pane, when no account is open), which resolves that objection: aggregate-style context never co-exists with a single-account view. See the `SnapshotView` entry above for its (deliberately non-aggregate) contents.
- **Deal archiving**: Closed deals with `closedDate`/`renewedDate` > 60 days ago are hidden from the pipeline list. `CLOSED_ARCHIVE_DAYS = 60`, `DEMO_TODAY = new Date('2026-06-19')` in `AdminDashboard.jsx`. Each deal needs a `closedDate` field (or falls back to `renewedDate` then `renewalDate`). Notion (deal-005) is the demo archived deal (`closedDate: '2026-03-15'`).
- **Overdue demo deal**: Dropbox (deal-008) has `daysToRenewal: -5` — shows the overdue alarming treatment.
- **Mode switch scroll memory**: `selectedDealId` lifted to `App.jsx` (persists across mode switches). `buyerScrollRef` saves `window.scrollY` before switching to admin; a `useEffect` on `mode` restores it when switching back to buyer.
- **MSA URL**: `orderForm.msaUrl` in `renewalData.js` points to `https://www.leandata.com/terms-of-service/`
- **Feature flags default** (deal-001/Uber): `showUsageData: false`, `showProposalDeck: false` (overridden for Uber and Airbnb), all others `true`.
- **Portal Configuration card**: toggles grouped into two sections — "Tabs" (ROI Calculator, Contract History, Renewals Deck) and "Home sections" (Seat utilization, Highlights). `showChatbot` removed — Renewal assistant is always on, no toggle. Each group has a tinted header band. Home tab is not in the toggle list — it's always on.
- **BuyerPreview card**: lives next to PortalConfigCard in a `flex gap-5 items-stretch` container. Shows a live schematic of the buyer portal — mini tab bar (tabs strike-through when hidden) + 3-column grid of PreviewBlocks mirroring the buyer layout. `always: true` blocks render in sunken style; flag-driven blocks render in clay when on, dashed-border when off. Both cards use `flex-1 min-w-0 flex flex-col` + `flex flex-col flex-1` on their root div to match height.
- **`PREVIEW_COLUMNS`** right column: all three entries (`Renewal assistant`, `Seller contacts`, `Buyer team`) use `always: true` — none are toggleable. The first tab chip mirror reads **"Docs"** (renamed from "History" alongside the buyer Documents tab).
- **BuyerPreview heatmap** (Crazy Egg / Qualified style): **always on** — there is no toggle (the header shows a static "🔥 Heatmap" chip + a less→more legend). Each schematic block carries a warm intensity ramp (amber → orange → red via `heatRgb(v)`) + a per-block `Nm` time label, plus a less→more legend bar. Driven by `deal.sectionHeat` — an object keyed by **PreviewBlock label** (must match exactly: `Countdown`, `Stats`, `Seat utilization`, `What's Changed`, `Order Form`, `Highlights`, `Renewal assistant`, `Seller contacts`, `Buyer team`) → intensity `0..1`. Heat renders **only on visible blocks** (a flag-hidden section can't have been viewed), so it composes with the feature flags. Only demo-critical deals carry `sectionHeat` (Uber/deal-001 = cold/sparse to preserve the "dark" narrative; Airbnb/deal-003 = warm, hottest on Order Form + What's Changed where Finance/Legal dug in; Dropbox/deal-008 = cool with mild Countdown urgency); the other 12 deals have no `sectionHeat` and read "No section activity yet" when the toggle is on.
- **`onTabChange` threading**: `App.jsx` passes `onTabChange={setActiveTab}` to `TabComponent` (all tab children). `HomeTab` accepts and forwards it to `DeckTeaserCard`.
- **Pipeline list sort order**: active deals sorted by `daysToRenewal` ascending (most urgent first); closed deals sorted by `closedDate` descending (most recent first). Overdue deals (`daysToRenewal <= 0`) sort before all other active deals via status check.

### Qualification Agent Integration — BUILT (Jun 19)
- **`src/data/qualificationOutput.js`** (new) — the drop-in JSON contract for Aaron's qualification agent. Exports `qualificationOutputs[]` (15 dummy entries) and `qualByDealId` lookup map. **This is the only file that changes when the real agent goes live.**
- **Schema per account**: `{ dealId, generatedAt, accountType, urgency, communicationTone, renewalStory, usageHealth, redFlags[], champion, recommendedAction }`
- **`accountType`** values: `'upsell'` | `'flat'` | `'downsell'`
- **FLAG_DEFAULTS** in `App.jsx` maps `accountType` → initial `featureFlags`:
  ```js
  upsell:   { showUsageData: true,  showROICalculator: true,  showContractHistory: true,  showProposalDeck: true,  showHighlights: false }
  flat:     { showUsageData: false, showROICalculator: true,  showContractHistory: true,  showProposalDeck: true,  showHighlights: true  }
  downsell: { showUsageData: false, showROICalculator: false, showContractHistory: true,  showProposalDeck: false, showHighlights: true  }
  ```
- **`dealFlags` init** in `App.jsx` merges `{ ...d.featureFlags, ...FLAG_DEFAULTS[qual?.accountType] }` — qual signal overrides featureFlags defaults; seller can still override manually via toggles.
- **`AdminDashboard.jsx`** merges `qualSignal: qualByDealId[d.id] ?? null` onto each deal object.
- **`QualSignalCard` — REMOVED (Jun 19, per Evan)**: the visible qual-agent card (accountType pill, urgency/tone badges, red flag, recommended action, attribution footer) was cut from `DealDetail.jsx`. Evan: "you don't want any of that at this point in time — those agents have already told me." The qual signal still flows in the background: `deal.qualSignal` (`qualByDealId`) is still merged in `AdminDashboard.jsx` and still drives `FLAG_DEFAULTS` portal pre-configuration in `App.jsx` — only the on-screen card is gone. The `ACCOUNT_TYPE_STYLES`/`URGENCY_STYLES`/`TONE_STYLES` consts were deleted with it.

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

**Core demo narrative (AJ demo, week of Jun 23):** Open on the admin **landing** (pipeline list + activity feed). The feed reads top-down as a buying-committee forming — Airbnb's CFO opened the portal (1d), Intercom's Legal asked about indemnification (2d), Finance/Legal showing up across Stripe/HubSpot/Asana — while Uber sits at the bottom (lone question 12d ago) and quiet accounts are absent: the "dark" story. The list (left) reinforces it: Uber = red "No activity in 12 days" + "Not engaged". Click Airbnb → list collapses, full-width detail; Stakeholders card appears first → "David Park (Legal) last accessed Jun 17 — Legal just got pulled in." Evan wants a 1:1 early that week to align before the demo.

**Evan's north star quote:** "Buyers go dark. If I could actually see what they're actually doing, who else is getting involved — that's extremely valuable." Stay focused on making that dark space visible. Per Evan: don't add features outside of stakeholder visibility.

## Project Context

This is a demo built for buyers during Stage 4 of the Pareto Agent renewal pipeline (Qualification → Outreach → Proposal → **Buyer Evaluation**). The buyer personas driving design decisions are documented in the Dropbox folder one level up (`Buyer Painpoints.md`, `Features and Components of Buyer Evaluation Stage.md`).

At the end of every session, update this `CLAUDE.md` file with any new decisions, design patterns, or architectural context learned during the session.
