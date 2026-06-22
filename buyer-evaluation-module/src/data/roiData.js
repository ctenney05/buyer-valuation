// ---------------------------------------------------------------------------
// roiData.js — swap these exports for API calls to connect real data
// ---------------------------------------------------------------------------

export const roiDefaults = {
  hoursSavedPerUserPerMonth: 4,
  avgHourlyRate: 65,
  activeUsers: 187,
};

export const roiLineItems = [
  {
    id: 1,
    category: 'Productivity',
    description: 'Reduced manual lead routing and assignment time',
    annualHours: 2244,
    annualValue: 145860,
  },
  {
    id: 2,
    category: 'Productivity',
    description: 'Faster rep onboarding with automated territory setup',
    annualHours: 480,
    annualValue: 31200,
  },
  {
    id: 3,
    category: 'Cost Avoidance',
    description: 'Eliminated redundant point-solution routing tools',
    annualHours: 0,
    annualValue: 24000,
  },
  {
    id: 4,
    category: 'Risk Reduction',
    description: 'Audit trail for compliance and lead ownership disputes',
    annualHours: 320,
    annualValue: 20800,
  },
];
