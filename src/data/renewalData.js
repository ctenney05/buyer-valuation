// ---------------------------------------------------------------------------
// renewalData.js — swap these exports for API calls to connect real data
// ---------------------------------------------------------------------------

export const deckUrl = '';  // paste Google Slides ?embedded=true URL here to activate

export const renewal = {
  vendor: 'LeanData',
  vendorLogo: 'https://www.google.com/s2/favicons?domain=leandata.com&sz=128',
  product: 'LeanData Platform',
  renewalDate: '2026-07-23',
  contractStart: '2025-06-23',
  buyerCompany: 'Uber',
  buyerLogo: 'https://www.google.com/s2/favicons?domain=uber.com&sz=128',
  annualCost: 6800,
  status: 'In negotiation',
};

export const contractStats = [
  { label: 'Annual Contract Value', value: '$6,800'  },
  { label: 'Seats Purchased',       value: '250'     },
  { label: 'Cost per Seat',         value: '$27.20'  },
];

export const utilization = [
  { product: 'Orchestration', usagePct: 91, description: 'Lead routing and assignment automation', url: 'https://app.leandata.com/orchestration'        },
  { product: 'Scheduling',    usagePct: 78, description: 'Territory and capacity management',     url: 'https://app.leandata.com/scheduling'            },
  { product: 'Buying Groups', usagePct: 0,  description: 'Multi-stakeholder deal rooms',          url: 'https://www.leandata.com/product/buying-groups' },
  { product: 'Product 4',     usagePct: 0,  description: 'Usage & churn-risk analytics',          url: 'https://www.leandata.com/product/analytics'     },
];

export const orderForm = {
  quoteNumber: 'Q-26071-1',
  vendor: {
    name: 'LeanData',
    address: '3979 Freedom Circle, Suite 800',
    cityStateZip: 'Santa Clara, CA 95054 US',
    website: 'www.leandata.com',
  },
  shipTo: {
    company: 'Uber',
    address: '548 Market Street, Suite 67507',
    cityStateZip: 'San Francisco, CA 94104',
    country: 'United States',
  },
  invoiceTo: {
    company: 'Uber',
    address: '548 Market Street, Suite 67507',
    cityStateZip: 'San Francisco, CA 94104',
    country: 'United States',
    accountsPayable: 'ap@uber.com',
  },
  salesRep: 'Jordan Lee',
  orderType: 'Renewal',
  expirationDate: '06/23/2026',
  // Each option carries a numeric priceValue + its own line items/total so the
  // order form can re-price live as the buyer switches plans. selectedOrder()
  // (below) resolves the active option; top-level lineItems/total are fallbacks.
  renewalOptions: [
    {
      label: 'Renew Current Plan',
      price: '$6,800/yr',
      priceValue: 6800,
      total: '$6,800',
      selected: true,
      lineItems: [
        {
          term: '6/23/2026 to\n6/22/2027',
          product: 'LeanData Revenue Orchestration — Advanced User Subscription License',
          qty: 250,
          unitPrice: '$27.20',
          unitNote: '/user/year',
          finalPrice: '$6,800',
        },
      ],
    },
    {
      label: 'Upgrade to Enterprise+',
      price: '$8,500/yr',
      priceValue: 8500,
      total: '$8,500',
      selected: false,
      lineItems: [
        {
          term: '6/23/2026 to\n6/22/2027',
          product: 'LeanData Revenue Orchestration — Enterprise+ User Subscription License',
          qty: 250,
          unitPrice: '$34.00',
          unitNote: '/user/year',
          finalPrice: '$8,500',
        },
      ],
    },
  ],
  lineItems: [
    {
      term: '6/23/2026 to\n6/22/2027',
      product: 'LeanData Revenue Orchestration — Advanced User Subscription License',
      qty: 250,
      unitPrice: '$27.20',
      unitNote: '/user/year',
      finalPrice: '$6,800',
    },
  ],
  priceNote: 'List price $30.00/user/year · ~9.3% negotiated discount · billed annually',
  pricingJustification: 'Reflects a standard 5% annual seat-price increase over the prior term ($26.00 → $27.20/user/year), applied at renewal per enterprise agreement terms. Multi-year pricing available upon request.',
  prevTotal: '$6,476',
  prevTotalValue: 6476,
  total: '$6,800',
  msaUrl: 'https://www.leandata.com/terms-of-service/',
  keyChanges: [
    'Auto-renewal clause added (60-day written notice required)',
    'Data Processing Agreement updated to 2024 SCCs',
  ],
  footer: 'Standard Support is included with every LeanData Subscription — see leandata.com/services',
  highlightDiffs: [
    {
      type: 'added',
      title: 'Auto-Renewal Clause',
      curr: 'This agreement will automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least 60 days prior to the end of the then-current term. Renewal pricing will be at the then-current list price unless otherwise agreed in writing.',
    },
    {
      type: 'changed',
      title: 'Data Processing Agreement',
      prev: 'The parties agree that the 2021 Standard Contractual Clauses pursuant to GDPR Article 28 shall apply to all data processing activities under this agreement.',
      curr: 'The parties agree that the 2024 Standard Contractual Clauses pursuant to GDPR Article 28, available at leandata.com/dpa, shall apply. This DPA supersedes and replaces the 2021 Standard Contractual Clauses previously incorporated by the parties.',
    },
    {
      type: 'removed',
      title: 'Onboarding Fee Waiver',
      prev: 'LeanData will waive the one-time onboarding fee for the initial setup and configuration of the LeanData platform for Customer. This waiver applies to the initial onboarding only and is not transferable to subsequent seat expansions or renewal terms. This clause is superseded as LeanData onboarding is now included as standard for all Enterprise subscriptions.',
    },
  ],
};

// Resolve the active renewal option (with its line items + total), falling back
// to the top-level orderForm fields. Used by the buyer order form + the Quick
// Renew / sign modal so the on-screen total and the signed amount never drift.
export function selectedOrder(idx = 0) {
  const opt = orderForm.renewalOptions[idx] ?? orderForm.renewalOptions[0];
  return {
    label: opt.label,
    price: opt.price,
    priceValue: opt.priceValue ?? orderForm.prevTotalValue,
    total: opt.total ?? orderForm.total,
    lineItems: opt.lineItems ?? orderForm.lineItems,
    prevTotalValue: orderForm.prevTotalValue,
  };
}

// Buyer-facing mutual action plan — dated path to close with an owner per step.
// status: 'done' | 'current' | 'upcoming'. Owners map to buyerTeam roles.
export const renewalProgress = [
  { label: 'Review proposal',     sub: 'Order form, pricing & redlines',          owner: 'Courtney Kim', ownerRole: 'Champion',    due: 'Jun 24', status: 'done'     },
  { label: 'Finance sign-off',    sub: 'Budget approval for renewal spend',       owner: 'James Rivera', ownerRole: 'Finance',     due: 'Jun 30', status: 'current'  },
  { label: 'Legal review',        sub: 'Auto-renewal clause & updated 2024 DPA',  owner: 'Amy Liu',      ownerRole: 'Legal',       due: 'Jul 8',  status: 'upcoming' },
  { label: 'Procurement approval', sub: 'Vendor record & PO setup',               owner: 'Marcus Brown', ownerRole: 'Procurement', due: 'Jul 15', status: 'upcoming' },
  { label: 'Sign & renew',        sub: 'Quick Renew when the team is aligned',    owner: 'Courtney Kim', ownerRole: 'Champion',    due: 'Jul 22', status: 'upcoming' },
];

export const buyerTeam = [
  { initials: 'CK', name: 'Courtney Kim',   role: 'Champion'    },
  { initials: 'JR', name: 'James Rivera',   role: 'Finance'     },
  { initials: 'AL', name: 'Amy Liu',        role: 'Legal'       },
  { initials: 'MB', name: 'Marcus Brown',   role: 'Procurement' },
];

export const sellerContacts = [
  { initials: 'JL', name: 'Jordan Lee', role: 'Account Manager' },
  { initials: 'TK', name: 'Taylor Kim', role: 'CSM'             },
];
