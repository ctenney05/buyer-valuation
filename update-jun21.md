# Update — Jun 21, 2026

## Live demo
- **Production URL (shareable, no auth):** https://renewals-hub-demo.vercel.app
- Vercel project: `pareto-agent/renewals-hub-demo` · Dashboard: https://vercel.com/pareto-agent/renewals-hub-demo
- Deployments **do not expire**; redeploy with `vercel deploy --prod` (same URL alias). Currently **manual** redeploy — no Git auto-deploy connected yet (pending `vercel git connect` to `Pareto-Agent/renewals-hub`, which needs the user to authorize the Vercel GitHub app).
- ⚠️ 23 session changes are **uncommitted/unpushed**; live site was built from the local working tree at deploy time.

## Data cleanup
- Removed all past-renewal (overdue) and already-closed (renewed/declined) accounts from `adminData.js` + matching `qualificationOutput.js` entries. Pipeline is now **11 active evaluation deals**. (Earlier overdue/closed demo deals — Dropbox/Notion/Figma/Twilio — are gone.)

## Admin landing redesign (the session's main work)
Reworked the admin dashboard from always-master-detail into a **landing + drill-in** model:
- **Landing** (`selectedDealId === null`): **list-dominant** — `PipelineList` (`flex-1`, ~3/4) + activity-feed **rail** (`w-1/4 min-w-[280px]`).
- **Click an account** → list + rail collapse, `DealDetail` goes **full-width** with a "← Back to pipeline" button. Default selection is now `null`.

### Pipeline list (left, the star)
- Wide **table layout** with a sticky column header (Account / Renews / Last activity / Engagement).
- Per row: company **favicon** (+initials fallback) · company + `Nd`/Overdue · `renews Mon D` · activity/recency line · **engagement pill** (soft tinted) · chevron.
- Filter pills (All/Active/Renewed/Declined) **removed** (no closed deals to filter).

### Activity feed rail (right)
- **Cross-account activity feed** — the rationale: the list already covers accounts-by-urgency, so the rail carries the axis the list lacks (**time**). Maps to Evan's north star ("see what buyers are actually doing / who got pulled in").
- **High-signal events only**: stakeholder pull-ins (non-champion portal access) + questions (chatbot activity). 14-day window.
- **Notification cards**: favicon + company + relative `Nd`; type badge (New stakeholder / Question); detail (name·role, or question text); meta (`Opened the portal · Mon D · time` / `Asked · Mon D`). Days-to-renewal omitted as redundant with the list.
- **Filter pills**: All / Stakeholders / Questions.
- **Time-grouped** into bold **This week / Earlier** sections (each its own card).
- **Quiet (14d)** one-liner at the bottom: accounts with zero activity (currently Shopify · Atlassian · Box · Zendesk · Okta).
- **Quick pivot**: `LANDING_MODE = 'feed' | 'empty'` const in `SnapshotView.jsx` flips between the feed and a centered empty state.

## Files touched
- `src/data/adminData.js`, `src/data/qualificationOutput.js` — removed closed/overdue deals
- `src/App.jsx` — default `selectedDealId = null`
- `src/components/Admin/AdminDashboard.jsx` — landing vs. detail branch
- `src/components/Admin/PipelineList.jsx` — wide table rows, logos, engagement pills, header; filters removed
- `src/components/Admin/SnapshotView.jsx` — activity feed (cards, filters, grouping, quiet line, pivot)
- `src/components/Admin/DealDetail.jsx` — `onBack` button
- `CLAUDE.md` — documented all of the above

## Open / next
- Connect Git for auto-deploy (`vercel git connect …`) + commit & push the 23 changes.
- Optional: password-protect the demo, custom domain, or default the app to the Admin view for demos.
