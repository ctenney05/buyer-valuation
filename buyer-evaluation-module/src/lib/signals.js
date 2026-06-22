// ===========================================================================
// signals.js — the Buyer Evaluation hub's OUTBOUND data contract.
//
// Everything the hub emits to the next pipeline stage is derived HERE, from the
// seller-side deal shape (see data/adminData.js). The seller-facing components
// (PipelineList, ActivityFeed, DealDetail) import these helpers too, so the UI
// and the downstream contract can never drift apart — there is one source of
// truth for "how engaged is this buyer / who got pulled in / did they decide".
//
// Two kinds of signal:
//   1. PASSIVE  — engagement level, stakeholder pull-ins, questions asked.
//                 Derived from portalViews / portalAccessLog / activityLog.
//   2. ACTIVE   — the renewal decision (renew / decline). The highest-value
//                 signal. In the demo this is produced by the buyer clicking
//                 "Confirm & Renew" in the portal (see BuyerPortal `onDecision`)
//                 and lands on the deal as status: 'renewed' | 'declined'.
//
// `getBuyerSignals(deal)` returns the normalized payload a downstream agent
// consumes. `getPipelineSignals(deals)` maps it over the whole pipeline.
// ===========================================================================

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------------------------------------------------------------------------
// Date helpers. The sample data uses "Jun 17"-style strings for log dates and
// a "N days ago" string for recency. Swap these out if real data uses ISO.
// ---------------------------------------------------------------------------

// Parse a "Jun 17"-style date string against a reference "today".
export function parseLogDate(str, today) {
  const m = str?.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (!m) return null;
  const monthIdx = MONTHS.indexOf(m[1]);
  if (monthIdx === -1) return null;
  return new Date(today.getFullYear(), monthIdx, parseInt(m[2]));
}

export function daysAgo(date, today) {
  return Math.round((today - date) / 86400000);
}

// Days since last portal activity, parsed from the "N days ago" string.
// "Today"/"Yesterday"/unparseable read as 0 (i.e. not stale).
export function daysInactive(deal) {
  const match = deal.lastActive?.match(/^(\d+) days? ago$/);
  return match ? parseInt(match[1]) : 0;
}

// ---------------------------------------------------------------------------
// PASSIVE SIGNAL — engagement
//
// Keyed on portal opens only. A lone chat message does NOT count as engaged
// (a buyer who asked one question then went dark is still dark).
// ---------------------------------------------------------------------------

// Semantic engagement enum — the value the OUT contract carries.
export function engagementLevel(deal) {
  if (deal.portalViews >= 4) return 'engaged';
  if (deal.portalViews >= 2) return 'some';
  return 'none';
}

// Numeric rank for sorting the pipeline by engagement.
export function engagementRank(deal) {
  if (deal.portalViews >= 4) return 2;
  if (deal.portalViews >= 2) return 1;
  return 0;
}

// UI adornment (label + token color) built on top of engagementLevel.
// Consumed by PipelineList for both the left-edge dot and the right-side pill,
// so the two can never contradict. Colors are CSS-variable names (see index.css).
const ENGAGEMENT_DISPLAY = {
  engaged: { label: 'Engaged',       color: 'var(--success-600)', muted: false },
  some:    { label: 'Some activity', color: 'var(--clay-600)',    muted: false },
  none:    { label: 'Not engaged',   color: 'var(--danger-600)',  muted: false },
};

export function engagementSignal(deal) {
  return ENGAGEMENT_DISPLAY[engagementLevel(deal)];
}

// ---------------------------------------------------------------------------
// PASSIVE SIGNAL — stakeholder pull-ins ("who else got involved")
//
// The buying committee forming is the highest-value passive signal (Evan's
// north star). A pull-in = a portal access by someone who is NOT the champion.
// ---------------------------------------------------------------------------

// Unique non-champion stakeholders, with the date they first appeared.
export function stakeholderPullIns(deal) {
  const champion = deal.buyerContact?.name;
  const seen = new Map();
  (deal.portalAccessLog ?? []).forEach((entry) => {
    if (entry.name === champion) return;
    if (!seen.has(entry.name)) {
      seen.set(entry.name, { name: entry.name, role: entry.role, firstSeen: entry.date, time: entry.time });
    }
  });
  return [...seen.values()];
}

// ---------------------------------------------------------------------------
// PASSIVE SIGNAL — questions asked
//
// Sourced from activityLog `chatbot` entries (already human-readable summaries).
// `deal.chatTranscript` carries the full verbatim Q&A if you need richer text.
// ---------------------------------------------------------------------------

export function questionsAsked(deal) {
  return (deal.activityLog ?? [])
    .filter((e) => e.type === 'chatbot')
    .map((e) => ({ text: e.detail, date: e.date }));
}

// Note on the ACTIVE signal (the renewal decision): the hub does NOT track a
// terminal deal status (renewed/declined). The buyer's decision leaves the hub
// as an EVENT — BuyerPortal fires `onDecision({ dealId, status, selectedOption })`
// when the buyer confirms a renewal — which the host forwards downstream.

// ---------------------------------------------------------------------------
// Cross-account ACTIVITY FEED events (UI helper, shared with the OUT shape).
//
// Returns the high-signal events — stakeholder pull-ins + questions — newest
// first, within `windowDays`. Each event carries the full `deal` so the feed UI
// can render a logo/company without a second lookup. ActivityFeed.jsx renders
// these directly; getBuyerSignals() reuses the same primitives above.
// ---------------------------------------------------------------------------

export function buildActivityEvents(deals, today, { windowDays = 14 } = {}) {
  const events = [];
  deals
    .filter((d) => d.status === 'evaluation')
    .forEach((deal) => {
      const champion = deal.buyerContact?.name;

      (deal.portalAccessLog ?? []).forEach((entry) => {
        if (entry.name === champion) return;
        const date = parseLogDate(entry.date, today);
        if (!date) return;
        events.push({
          key: `${deal.id}-stk-${entry.name}-${entry.date}`,
          dealId: deal.id, deal, company: deal.buyerCompany,
          kind: 'stakeholder', name: entry.name, role: entry.role, time: entry.time, date,
        });
      });

      (deal.activityLog ?? []).forEach((entry) => {
        if (entry.type !== 'chatbot') return;
        const date = parseLogDate(entry.date, today);
        if (!date) return;
        events.push({
          key: `${deal.id}-q-${entry.date}-${entry.detail}`,
          dealId: deal.id, deal, company: deal.buyerCompany,
          kind: 'question', text: entry.detail, date,
        });
      });
    });

  return events
    .map((e) => ({ ...e, ago: daysAgo(e.date, today) }))
    .filter((e) => e.ago >= 0 && e.ago <= windowDays)
    .sort((a, b) => b.date - a.date || a.company.localeCompare(b.company));
}

// ---------------------------------------------------------------------------
// THE OUT CONTRACT — normalized buyer-evaluation signal for one account.
//
// This is the object a downstream agent (Outreach, Renewal ops, CRM sync)
// consumes. Stable shape; the fields above are its only inputs.
// ---------------------------------------------------------------------------

export function getBuyerSignals(deal, today = new Date()) {
  return {
    dealId: deal.id,
    company: deal.buyerCompany,
    stage: 'Buyer Evaluation',
    renewalDate: deal.renewalDate ?? null,
    daysToRenewal: deal.daysToRenewal ?? null,
    engagement: {
      level: engagementLevel(deal),          // 'engaged' | 'some' | 'none'
      portalViews: deal.portalViews ?? 0,
      chatMessages: deal.chatMessages ?? 0,
      lastActive: deal.lastActive ?? null,
      daysInactive: daysInactive(deal),
    },
    stakeholders: stakeholderPullIns(deal),   // [{ name, role, firstSeen, time }]
    questions: questionsAsked(deal),          // [{ text, date }]
    // The renewal decision is emitted as an event (BuyerPortal `onDecision`), not
    // carried here as a deal status.
  };
}

export function getPipelineSignals(deals, today = new Date()) {
  return deals.map((d) => getBuyerSignals(d, today));
}
