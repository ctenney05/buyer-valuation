// ---------------------------------------------------------------------------
// renewalData.js — swap these exports for API calls to connect real data
// ---------------------------------------------------------------------------

export const renewal = {
  vendor: 'Acme SaaS Co.',
  product: 'Acme Platform',
  renewalDate: '2026-09-30',
  contractStart: '2025-10-01',
  annualSpend: 148500,
  currency: 'USD',
  accountExecutive: 'Jordan Lee',
  csm: 'Taylor Kim',
  // "on-track" | "review-needed" | "at-risk"
  status: 'review-needed',
};

export const metrics = [
  { label: 'Annual Spend',    value: '$148,500', delta: '+4.2%', trend: 'up'      },
  { label: 'Seats Purchased', value: '250',      delta: '—',     trend: 'neutral' },
  { label: 'Seats Active',    value: '187',      delta: '74.8%', trend: 'down'    },
  { label: 'Cost / Seat',     value: '$594',     delta: '+4.2%', trend: 'up'      },
];

export const actionItems = [
  { id: 1, task: 'Request updated usage report from vendor', owner: 'You',         dueDate: '2026-06-30', done: false },
  { id: 2, task: 'Share ROI summary with finance',           owner: 'Finance',     dueDate: '2026-07-10', done: false },
  { id: 3, task: 'Schedule renewal review meeting',          owner: 'You',         dueDate: '2026-07-15', done: true  },
  { id: 4, task: 'Negotiate pricing with AE',                owner: 'Procurement', dueDate: '2026-08-01', done: false },
  { id: 5, task: 'Get legal sign-off on new terms',          owner: 'Legal',       dueDate: '2026-08-20', done: false },
];

export const keyDates = [
  { label: 'Kickoff review call',  date: '2026-07-15', type: 'info'     },
  { label: 'Pricing negotiation',  date: '2026-08-01', type: 'info'     },
  { label: 'Budget lock',          date: '2026-08-15', type: 'warning'  },
  { label: 'Legal review due',     date: '2026-08-20', type: 'warning'  },
  { label: 'Renewal deadline',     date: '2026-09-30', type: 'critical' },
];
