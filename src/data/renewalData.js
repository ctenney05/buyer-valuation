// ---------------------------------------------------------------------------
// renewalData.js — swap these exports for API calls to connect real data
// ---------------------------------------------------------------------------

export const renewal = {
  vendor: 'LeanData',
  vendorLogo: 'https://www.google.com/s2/favicons?domain=leandata.com&sz=128',
  product: 'LeanData Platform',
  renewalDate: '2026-06-23',
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
  { product: 'Orchestration', usagePct: 91, description: 'Lead routing and assignment automation' },
  { product: 'Scheduling',    usagePct: 78, description: 'Territory and capacity management'     },
  { product: 'Buying Groups', usagePct: 0,  description: 'Multi-stakeholder deal rooms'          },
  { product: 'Product 4',     usagePct: 0,  description: 'Usage & churn-risk analytics'          },
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
  renewalOptions: [
    { label: 'Renew Current Plan',     price: '$6,800/yr',  selected: true  },
    { label: 'Upgrade to Enterprise+', price: '$8,500/yr',  selected: false },
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
  total: '$6,800',
  footer: 'Standard Support is included with every LeanData Subscription — see leandata.com/services',
  redlineDiffs: [
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

export const renewalProgress = [
  { label: 'Proposal Sent', date: 'Jun 1',  completed: true,  current: false },
  { label: 'Hub Accessed',  date: 'Jun 10', completed: true,  current: false },
  { label: 'Under Review',  date: null,     completed: false, current: true  },
  { label: 'Decision',      date: null,     completed: false, current: false },
  { label: 'Signed',        date: null,     completed: false, current: false },
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
