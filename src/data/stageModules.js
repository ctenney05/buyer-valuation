// ---------------------------------------------------------------------------
// stageModules.js — CONTRACT-LEVEL INTEGRATION of the other stage agents.
//
// Each function returns a payload shaped to the real module's data CONTRACT
// (from the summer-build monorepo), derived from our existing fields, with
// curated overrides for the hero accounts. Returns null when a stage doesn't
// apply to an account (→ the tab falls back to StagePlaceholder).
//
// When the team unifies account identity in canonical-data, replace these
// derivations with live accessor/API calls — THIS FILE is the only swap point.
//
// Contracts adopted (summer-build):
//   Qualification  → dashboard-modules/qualification : HandoffPacket + QualResult
//   Outreach       → "2 Outreach"                    : Client + Email
//   Proposal       → proposal-agent                  : renewal deck by story type
// ---------------------------------------------------------------------------
import { qualByDealId } from './qualificationOutput.js';
import { PIPELINE_STAGES } from './stages.js';

const STAGE_IDX = Object.fromEntries(PIPELINE_STAGES.map((s, i) => [s, i]));
const reached = (deal, stage) => (STAGE_IDX[deal.stage] ?? 4) >= STAGE_IDX[stage]
  || deal.status === 'renewed' || deal.status === 'declined';

// ---- Qualification ---------------------------------------------------------
const SIGNAL_BY_TYPE = { upsell: 'expansion_ready', flat: 'flat_renewal', downsell: 'churn_risk' };
const SIGNAL_LABEL = {
  expansion_ready: 'Expansion ready', flat_renewal: 'Flat renewal', churn_risk: 'Churn risk',
  pricing_upsell: 'Pricing upsell', product_upsell: 'Product upsell', add_on_interest: 'Add-on interest',
};
const SIGNAL_COLOR = {
  expansion_ready: 'var(--success-600)', flat_renewal: 'var(--ocean-600)', churn_risk: 'var(--danger-600)',
  pricing_upsell: 'var(--clay-600)', product_upsell: 'var(--clay-600)', add_on_interest: 'var(--clay-600)',
};

const HERO_QUOTES = {
  'deal-001': [{ text: 'We need the auto-renewal clause to be more flexible before we commit.', source: 'Courtney Kim · VP Operations' }],
  'deal-002': [{ text: 'The team has grown a lot — we will likely need more seats this term.', source: 'Marcus Rivera · Head of Revenue Ops' }],
  'deal-003': [{ text: 'Legal needs to review the DPA changes; pricing looks reasonable.', source: 'Sarah Chen · Finance Director' }],
};

export function qualificationFor(deal) {
  const q = deal.qualSignal ?? qualByDealId[deal.id] ?? null;
  // Derive a signal even for light accounts with no qual record.
  const signal = q
    ? SIGNAL_BY_TYPE[q.accountType] ?? 'flat_renewal'
    : (deal.expansionMultiplier > 1 ? 'expansion_ready' : deal.expansionMultiplier < 1 ? 'churn_risk' : 'flat_renewal');
  const reasons = q?.redFlags?.length
    ? q.redFlags
    : ['Auto-scored from usage + contract-clock signals'];
  return {
    schema_version: '1.0',
    account_ref: { client: 'leandata', account_id: deal.id },
    signal,
    signalLabel: SIGNAL_LABEL[signal],
    signalColor: SIGNAL_COLOR[signal],
    recommended_action: q?.recommendedAction ?? 'Monitor — no action needed yet',
    projection_multiplier: deal.expansionMultiplier ?? 1,
    reasons,
    urgency: q?.urgency ?? 'low',
    tone: q?.communicationTone ?? 'neutral',
    champion: q?.champion ?? deal.buyerContact ?? null,
    usageHealth: q?.usageHealth ?? null,
    approved_at: q?.generatedAt ?? '2026-06-19',
    approved_by: 'Qualification agent',
    quotes: HERO_QUOTES[deal.id] ?? [],
  };
}

// ---- Outreach --------------------------------------------------------------
const OUTREACH_STEPS = ['draft', 'sent', 'waiting', 'engaged'];

const HERO_THREADS = {
  'deal-002': [
    { direction: 'outbound', origin: 'ai_automated', subject: 'Your LeanData renewal — a quick look ahead', body: 'Hi Marcus — your renewal is coming up in August. Given your team’s growth, we put together a proposal that adds 10 seats. Happy to walk through it.', analysis: null },
    { direction: 'inbound', subject: 'Re: Your LeanData renewal', body: 'Thanks — yes, we’ve added headcount. Send over the numbers and I’ll review with Finance.', analysis: { sentiment: 'positive', intent: 'pricing', urgency: 'medium', objections: [], buyingSignals: ['team growth', 'requested pricing'] } },
  ],
  'deal-003': [
    { direction: 'outbound', origin: 'ai_drafted', subject: 'Renewal + DPA update for Airbnb', body: 'Hi Sarah — ahead of your September renewal, here’s the proposed order form. Note the DPA was updated to the 2024 SCCs.', analysis: null },
    { direction: 'inbound', subject: 'Re: Renewal + DPA update', body: 'Looping in David (Legal) on the DPA. Pricing looks fine on our side.', analysis: { sentiment: 'neutral', intent: 'legal_review', urgency: 'medium', objections: ['DPA review'], buyingSignals: ['pricing accepted'] } },
  ],
};

function templatedThread(deal, stage) {
  const champ = deal.buyerContact?.name ?? 'the buyer';
  const out = [{ direction: 'outbound', origin: 'ai_automated', subject: `Your ${deal.vendor} renewal`, body: `Hi ${champ} — your renewal is approaching. Sharing the proposed terms for your review.`, analysis: null }];
  if (stage === 'engaged') {
    out.push({ direction: 'inbound', subject: 'Re: renewal', body: 'Thanks, taking a look this week.', analysis: { sentiment: 'positive', intent: 'reviewing', urgency: 'low', objections: [], buyingSignals: ['acknowledged'] } });
  }
  return out;
}

export function outreachFor(deal) {
  if (!reached(deal, 'Outreach')) return null;
  const stage = deal.stage === 'Outreach' ? (deal.stageStatus ?? 'sent') : 'engaged';
  return {
    outreachStage: stage,
    nextAction: stage === 'waiting' ? 'Auto follow-up scheduled (T+3 days)'
      : stage === 'engaged' ? 'Buyer engaged — handing to proposal'
      : 'Awaiting send',
    thread: HERO_THREADS[deal.id] ?? templatedThread(deal, stage),
    recommendation: {
      headline: stage === 'waiting' ? 'No reply yet — nudge the champion' : 'Keep the thread warm',
      confidence: 'medium',
      draftReply: 'Following up on the renewal — happy to jump on a quick call if useful.',
    },
    org: (deal.sharedWith ?? []).map((s) => ({ name: s.name, role: s.role, champion: s.name === deal.buyerContact?.name })),
    styleGuide: { formality: 'Professional, concise', tone: deal.qualSignal?.communicationTone ?? 'neutral', dosDonts: ['Lead with value', 'Avoid hard-sell language'] },
    health: deal.qualSignal?.accountType === 'downsell' ? 'red' : deal.qualSignal?.accountType === 'upsell' ? 'green' : 'yellow',
    daysTillRenewal: deal.daysToRenewal,
  };
}

// ---- Proposal --------------------------------------------------------------
const STORY_BY_TYPE = { upsell: 'Justified increase', flat: 'Flat renewal', downsell: 'Downsell / save' };

export function proposalFor(deal) {
  if (!reached(deal, 'Proposal')) return null;
  const type = deal.qualSignal?.accountType ?? 'flat';
  const current = deal.annualValue ?? deal.arr ?? 0;
  const proposed = Math.round(current * (deal.expansionMultiplier ?? 1));
  return {
    storyType: STORY_BY_TYPE[type],
    generatedBy: 'Proposal agent',
    slides: [
      { title: 'Cover', note: `${deal.buyerCompany} × ${deal.vendor} renewal` },
      { title: 'Value recap', note: 'Usage, outcomes, ROI to date' },
      { title: 'What’s changing', note: type === 'flat' ? 'No changes — same terms' : type === 'upsell' ? 'Added seats + tier' : 'Right-sized plan' },
      { title: 'Pricing', note: `${current.toLocaleString()} → ${proposed.toLocaleString()}/yr` },
      { title: 'Next steps', note: 'Sign + activate' },
    ],
    pricing: { current, proposed, delta: proposed - current },
  };
}

// ---- Monitoring (light) ----------------------------------------------------
export function monitoringFor(deal) {
  const uh = deal.qualSignal?.usageHealth ?? null;
  return {
    usageSignal: uh?.signal ?? 'moderate',
    healthScore: uh?.score ?? null,
    topProduct: uh?.topProduct ?? deal.vendor,
    daysToRenewal: deal.daysToRenewal,
    watching: ['Usage trend', 'Contract clock', 'Stakeholder changes'],
  };
}

// ---- Renewal (terminal) ----------------------------------------------------
export function renewalFor(deal) {
  if (deal.stage !== 'Renewal' && deal.status !== 'renewed' && deal.status !== 'declined') return null;
  const outcome = deal.status === 'declined' || deal.stageStatus === 'declined' ? 'declined'
    : deal.status === 'renewed' || deal.stageStatus === 'signed' ? 'signed' : 'pending';
  return {
    outcome,
    signedDate: deal.renewedDate ?? null,
    checklist: [
      { item: 'Legal', status: 'Complete' },
      { item: 'Security', status: 'Complete' },
      { item: 'Signatures', status: outcome === 'signed' ? 'Complete' : 'In Progress' },
      { item: 'PO', status: outcome === 'signed' ? 'Complete' : 'Not Started' },
    ],
  };
}

// Convenience: stage id → payload (used by AccountPage).
export const STAGE_DATA = {
  monitoring: monitoringFor,
  qualification: qualificationFor,
  outreach: outreachFor,
  proposal: proposalFor,
  renewal: renewalFor,
};
