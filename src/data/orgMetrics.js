// ---------------------------------------------------------------------------
// orgMetrics.js — pure selectors over the deal array. The single place org-level
// numbers + funnel counts are derived, so every screen ties out.
// ---------------------------------------------------------------------------
import { engagementSignal, daysInactive } from '../components/Admin/PipelineList.jsx';
import { ACTIVE_STAGES, STAGE_STATUS, STATUS_TONE } from './stages.js';

export const QUARTERS = ['Q2', 'Q3', 'Q4'];
export const QUARTER_LABEL = { Q2: 'Q2 2026', Q3: 'Q3 2026', Q4: 'Q4 2026' };

const arrOf = (d) => d.arr ?? d.annualValue ?? 0;

export function dealsForQuarter(deals, q) {
  return deals.filter((d) => d.quarter === q);
}

// Projected ARR after churn/upsell. Declined → 0; else arr × expansionMultiplier.
export function projectedArr(deal) {
  if (deal.status === 'declined' || deal.stageStatus === 'declined') return 0;
  return Math.round(arrOf(deal) * (deal.expansionMultiplier ?? 1));
}

export function isAtRisk(deal) {
  return Boolean(deal.atRisk) || daysInactive(deal) >= 7 || (deal.qualSignal?.redFlags?.length > 0);
}

export function orgMetrics(deals) {
  const arrExpiring = deals.reduce((s, d) => s + arrOf(d), 0);
  const projected = deals.reduce((s, d) => s + projectedArr(d), 0);
  const atRisk = deals.filter(isAtRisk);
  return {
    arrExpiring,
    projectedArr: projected,
    nrr: arrExpiring ? (projected / arrExpiring) * 100 : 0,
    renewalCount: deals.length,
    atRiskCount: atRisk.length,
    atRiskArr: atRisk.reduce((s, d) => s + arrOf(d), 0),
  };
}

// Per active funnel stage: { stage, count, arr }.
export function funnelCounts(deals) {
  return ACTIVE_STAGES.map((stage) => {
    const inStage = deals.filter((d) => d.stage === stage);
    return { stage, count: inStage.length, arr: inStage.reduce((s, d) => s + arrOf(d), 0) };
  });
}

// Terminal Renewal bucket → { signed, signedArr, declined, declinedArr }.
export function renewalOutcomes(deals) {
  const r = deals.filter((d) => d.stage === 'Renewal');
  const signed = r.filter((d) => d.stageStatus === 'signed' || d.status === 'renewed');
  const declined = r.filter((d) => d.stageStatus === 'declined' || d.status === 'declined');
  return {
    signed: signed.length,
    signedArr: signed.reduce((s, d) => s + arrOf(d), 0),
    declined: declined.length,
    declinedArr: declined.reduce((s, d) => s + arrOf(d), 0),
  };
}

// The status pill for a deal: { value, label, color }. Buyer Evaluation derives
// from engagementSignal so it never contradicts the per-account signal.
export function stageStatusFor(deal) {
  if (deal.stage === 'Buyer Evaluation') {
    const sig = engagementSignal(deal);
    return { value: 'engagement', label: sig.label, color: sig.color };
  }
  const value = deal.stageStatus;
  const label = STAGE_STATUS[deal.stage]?.[value] ?? value ?? '—';
  return { value, label, color: STATUS_TONE[value] ?? 'var(--text-subtle)' };
}

// Dev-only invariant: org ARR == Σ funnel-stage ARR + Σ renewal-outcome ARR == Σ account ARR.
export function assertTieOut(deals) {
  const total = deals.reduce((s, d) => s + arrOf(d), 0);
  const funnel = funnelCounts(deals).reduce((s, f) => s + f.arr, 0);
  const outcomes = renewalOutcomes(deals);
  const viaBuckets = funnel + outcomes.signedArr + outcomes.declinedArr;
  console.assert(
    total === viaBuckets,
    `[orgMetrics] ARR tie-out failed: accounts=${total} buckets=${viaBuckets}`,
  );
}
