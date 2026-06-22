// ===========================================================================
// proposalInput.js — the Buyer Evaluation hub's INBOUND data contract.
//
// The Proposal agent (pipeline stage 3) generates the renewal proposal: the
// order form (line items, pricing, addresses, redlines) and the human-readable
// pricing justification. That output flows INTO this hub and becomes the buyer's
// Home tab (proposed order form + "what changed" + countdown).
//
// This file does two things:
//   1. Documents the EXACT JSON the Proposal agent should emit (PROPOSAL_INPUT_SAMPLE).
//   2. Adapts it into the shape the buyer tabs read (`data/renewalData.js`:
//      `renewal` + `orderForm`). See applyProposalOutput().
//
// >>> WIRING <<<
// The buyer tabs import { renewal, orderForm } from data/renewalData.js directly
// (the portal is single-deal — see BuyerPortal's #1 seam note). To go live:
//   - have the API behind renewalData.js return applyProposalOutput(proposalJson), OR
//   - regenerate data/renewalData.js from the proposal at build time.
// Only this file + renewalData.js change when the real Proposal agent goes live.
// ===========================================================================

// ---------------------------------------------------------------------------
// SAMPLE — the contract shape. Mirrors what currently lives, hand-authored, in
// data/renewalData.js (the Uber × LeanData renewal). Field comments are the spec.
// ---------------------------------------------------------------------------
export const PROPOSAL_INPUT_SAMPLE = {
  dealId: 'deal-001',
  generatedAt: '2026-06-19',

  // Parties + headline economics.
  vendor: 'LeanData',
  vendorDomain: 'leandata.com',
  product: 'LeanData Platform',
  buyerCompany: 'Uber',
  buyerDomain: 'uber.com',
  contractStart: '2025-06-23',     // ISO; drives the countdown progress bar
  renewalDate: '2026-07-23',       // ISO; drives the countdown
  annualCost: 6800,                // number; used by ROI + confirm dialog
  status: 'In negotiation',

  // The proposed order form.
  orderForm: {
    quoteNumber: 'Q-26071-1',
    salesRep: 'Jordan Lee',
    orderType: 'Renewal',
    expirationDate: '06/23/2026',
    vendorAddress:   { name: 'LeanData', address: '3979 Freedom Circle, Suite 800', cityStateZip: 'Santa Clara, CA 95054 US', website: 'www.leandata.com' },
    shipTo:          { company: 'Uber', address: '548 Market Street, Suite 67507', cityStateZip: 'San Francisco, CA 94104', country: 'United States' },
    invoiceTo:       { company: 'Uber', address: '548 Market Street, Suite 67507', cityStateZip: 'San Francisco, CA 94104', country: 'United States', accountsPayable: 'ap@uber.com' },
    renewalOptions: [
      { label: 'Renew Current Plan',     price: '$6,800/yr', selected: true  },
      { label: 'Upgrade to Enterprise+', price: '$8,500/yr', selected: false },
    ],
    lineItems: [
      { term: '6/23/2026 to\n6/22/2027', product: 'LeanData Revenue Orchestration — Advanced User Subscription License', qty: 250, unitPrice: '$27.20', unitNote: '/user/year', finalPrice: '$6,800' },
    ],
    priceNote: 'List price $30.00/user/year · ~9.3% negotiated discount · billed annually',
    prevTotal: '$6,476',
    total: '$6,800',
    msaUrl: 'https://www.leandata.com/terms-of-service/',

    // THE key field the Proposal agent owns — narrate this in the demo: "this
    // sentence was written by the Proposal agent and injected here automatically."
    pricingJustification: 'Reflects a standard 5% annual seat-price increase over the prior term ($26.00 → $27.20/user/year), applied at renewal per enterprise agreement terms. Multi-year pricing available upon request.',

    keyChanges: [
      'Auto-renewal clause added (60-day written notice required)',
      'Data Processing Agreement updated to 2024 SCCs',
    ],
    // Color-coded redlines: type ∈ 'added' | 'changed' | 'removed'.
    highlightDiffs: [
      { type: 'added',   title: 'Auto-Renewal Clause', curr: 'This agreement will automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least 60 days prior to the end of the then-current term.' },
      { type: 'changed', title: 'Data Processing Agreement', prev: 'The parties agree that the 2021 Standard Contractual Clauses pursuant to GDPR Article 28 shall apply.', curr: 'The parties agree that the 2024 Standard Contractual Clauses pursuant to GDPR Article 28, available at leandata.com/dpa, shall apply.' },
      { type: 'removed', title: 'Onboarding Fee Waiver', prev: 'LeanData will waive the one-time onboarding fee for the initial setup and configuration of the LeanData platform for Customer.' },
    ],
    footer: 'Standard Support is included with every LeanData Subscription — see leandata.com/services',
  },
};

// ---------------------------------------------------------------------------
// ADAPTER — Proposal-agent JSON → the { renewal, orderForm } objects the buyer
// tabs consume. Pure; no side effects. Field mapping is 1:1 and explicit so it's
// trivial to extend when the agent's schema grows.
// ---------------------------------------------------------------------------
export function applyProposalOutput(p) {
  const of = p.orderForm ?? {};
  return {
    renewal: {
      vendor: p.vendor,
      vendorLogo: p.vendorDomain ? `https://www.google.com/s2/favicons?domain=${p.vendorDomain}&sz=128` : undefined,
      product: p.product,
      renewalDate: p.renewalDate,
      contractStart: p.contractStart,
      buyerCompany: p.buyerCompany,
      buyerLogo: p.buyerDomain ? `https://www.google.com/s2/favicons?domain=${p.buyerDomain}&sz=128` : undefined,
      annualCost: p.annualCost,
      status: p.status,
    },
    orderForm: {
      quoteNumber: of.quoteNumber,
      vendor: of.vendorAddress,
      shipTo: of.shipTo,
      invoiceTo: of.invoiceTo,
      salesRep: of.salesRep,
      orderType: of.orderType,
      expirationDate: of.expirationDate,
      renewalOptions: of.renewalOptions ?? [],
      lineItems: of.lineItems ?? [],
      priceNote: of.priceNote,
      pricingJustification: of.pricingJustification,
      prevTotal: of.prevTotal,
      total: of.total,
      msaUrl: of.msaUrl,
      keyChanges: of.keyChanges ?? [],
      highlightDiffs: of.highlightDiffs ?? [],
      footer: of.footer,
    },
  };
}
