# Handoff → Parth: account list + activity feed (dashboard layer)

**From:** Cooper · **Date:** Jun 22, 2026
**Context:** Per the Jun 22 standup, the org + stage dashboards (Levels 1–2) are yours; the account page (Level 3) stays with me. Two components I built sit in *your* layer — the cross-account **account list** and the **activity feed rail**. They're demo-validated (Evan in standup: "Claude did it really cleanly"; "people want to know who's been hitting what"), so take them as a starting point rather than rebuilding.

These currently render on my admin **landing** (`AdminDashboard.jsx`): `<PipelineList>` (≈3/4) + `<SnapshotView>` (≈1/4 rail). In the unified product they become your org/stage dashboards.

---

## 1. `PipelineList.jsx` — the sortable account table

The urgency-sorted account list: logo, company, renews-in, last-activity, engagement pill, with **sortable column headers**.

**Props**
```js
<PipelineList
  deals={Deal[]}              // the accounts to show (already filtered to the stage/quarter you want)
  selectedDealId={string|null}
  onSelect={(dealId) => void} // row click → open that account
/>
```

**Exported helpers (reuse these, don't re-derive):**
- `engagementSignal(deal)` → `{ label: 'Engaged'|'Some activity'|'Not engaged'|'Renewed'|'Declined', color, muted? }`. Keyed on `portalViews` (≥4 / ≥2 / else). This is the canonical engagement rule — use it everywhere so signals never contradict.
- `daysInactive(deal)` → integer days since last activity, parsed from `lastActive`.

**Built-in behavior:** click-to-sort headers (Account / Renews / Last activity / Engagement) with direction toggle; arrow-key nav; auto-scroll to selection; company favicons (Google s2 API + initials fallback). Module-local: `compareDeals`, `engagementRank`, `daysColor`, `fmtRenews`, `COL` (shared column widths), `PILL_BG`.

---

## 2. `SnapshotView.jsx` — the activity feed rail

Cross-account "Recent activity" feed: high-signal events (new stakeholders + questions), grouped Today / This week / Earlier, with kind-filter pills and a "Quiet (Nd)" line.

**Props**
```js
<SnapshotView
  deals={Deal[]}
  today={Date}               // demo reference date (we pass DEMO_TODAY = new Date('2026-06-19'))
  onSelect={(dealId) => void}
/>
```

**Knobs (top of file):**
- `LANDING_MODE = 'feed' | 'empty'` — one-word switch between the feed and a centered empty state.
- `FEED_DAYS = 14` (lookback window), `FEED_CAP = 15` (max rows).
- `FILTERS` (All / Stakeholders / Questions), `GROUPS` (the time buckets).

**Event sources** (`buildEvents`): per active deal, it derives events from:
- `portalAccessLog` entries where `name !== buyerContact.name` → "new stakeholder" events (uses `entry.name`, `entry.role`, `entry.date`, `entry.time`).
- `activityLog` entries where `type === 'chatbot'` → "question" events (uses `entry.detail`, `entry.date`).
Routine champion re-opens are intentionally excluded as noise.

---

## 3. The data contract (`Deal` shape these consume)

Both read from the `adminData.js` deal objects. Fields actually used:

| Field | Used by | Notes |
|---|---|---|
| `id` | both | row key + `onSelect` |
| `buyerCompany` | both | display name |
| `buyerInitials` | both | logo fallback |
| `domain` | both | favicon (`google.com/s2/favicons?...domain`) |
| `daysToRenewal` | list | urgency value + default sort; `<= 0` → "Overdue" |
| `renewalDate` | list | `"YYYY-MM-DD"` → "Renews Mon D" |
| `status` | both | `'evaluation' | 'renewed' | 'declined'` (feed/engagement gate on `'evaluation'`) |
| `portalViews` | list | drives `engagementSignal` |
| `lastActive` | list | `"N days ago" | "Today" | "Yesterday"` → `daysInactive` |
| `buyerContact.name` | feed | champion (excluded from "new stakeholder" events) |
| `portalAccessLog[]` | feed | `{ name, role, date:"Mon D", time:"H:MM AM" }` |
| `activityLog[]` | feed | `{ type, date:"Mon D", detail }` |

**Note on dates:** the demo uses string dates (`"Jun 17"`, `"2026-08-20"`) parsed against `today`. When you wire real data, keep these field names/shapes (or adapt the parsers in each file — `fmtRenews`, `parseLogDate`).

---

## 4. Integration notes

- **Design tokens:** everything uses the Pareto CSS vars from `src/index.css` (`--clay-*`, `--surface-*`, `--border-*`, `--font-serif/sans/mono`). No Tailwind color classes — keep that convention so it matches across the unified UI.
- **Fake data first:** Aaron is extracting a shared fake-data layer for integration. Point these at that; swapping to real data is just changing where `deals` comes from.
- **For stage dashboards:** pass a pre-filtered `deals` array (the accounts in that stage/quarter). The components don't filter by stage themselves — that's your dashboard's job.
- **Funnel-at-top + popover filters:** Evan wants consistent UI across dashboards. The list's sort-header pattern and the feed's filter pills are reusable starting points for that.

## 5. Boundary — what is NOT in this handoff

- **`AccountPage.jsx`** (the account shell: journey timeline + stage tabs) and **`DealDetail.jsx`** (the Buyer Evaluation module) stay with me — that's Level 3, the account page everything drills into.
- `onSelect(dealId)` is the seam: your dashboards call it to open my account page. Keep that contract and we're integrated.

## 6. Suggested first steps
1. Drop `PipelineList` + `SnapshotView` (+ the two exported helpers) into your dashboard project.
2. Feed them a stage-filtered `deals` array and wire `onSelect` to your account-page route.
3. Decide with me whether the activity rail lives in the org view, the stage view, or both.
