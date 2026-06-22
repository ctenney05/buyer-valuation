// ---------------------------------------------------------------------------
// stages.js — the single source of truth for the renewal pipeline stages.
// Org funnel renders the 5 ACTIVE stages; Renewal is a terminal outcome bucket.
// ---------------------------------------------------------------------------

export const PIPELINE_STAGES = [
  'Monitoring',
  'Qualification',
  'Outreach',
  'Proposal',
  'Buyer Evaluation',
  'Renewal',
];

// The funnel columns (in-flight work). Renewal is terminal → shown as an outcome strip.
export const ACTIVE_STAGES = PIPELINE_STAGES.slice(0, 5);

// Per-stage status vocabulary: { stage: { value: label } }.
// Buyer Evaluation is intentionally empty — its pill is DERIVED from engagementSignal.
export const STAGE_STATUS = {
  'Monitoring':       { watching: 'Watching',  'clock-started': 'Clock started' },
  'Qualification':    { watching: 'Watching',  qualified: 'Qualified' },
  'Outreach':         { draft: 'Draft', sent: 'Sent', waiting: 'Waiting', engaged: 'Engaged' },
  'Proposal':         { drafting: 'Drafting', sent: 'Sent', reviewed: 'Reviewed' },
  'Buyer Evaluation': {},
  'Renewal':          { signed: 'Signed', declined: 'Declined' },
};

// status value → color token (mirrors the existing pill ramps).
export const STATUS_TONE = {
  watching:        'var(--text-subtle)',
  'clock-started': 'var(--clay-600)',
  qualified:       'var(--success-600)',
  draft:           'var(--text-subtle)',
  sent:            'var(--ocean-600)',
  waiting:         'var(--clay-600)',
  engaged:         'var(--success-600)',
  drafting:        'var(--text-subtle)',
  reviewed:        'var(--success-600)',
  signed:          'var(--success-600)',
  declined:        'var(--danger-600)',
};

// Soft tint background per tone color, for the pill chip (mirrors PipelineList PILL_BG).
export const TONE_BG = {
  'var(--success-600)': 'var(--success-100)',
  'var(--clay-600)':    'var(--clay-100)',
  'var(--danger-600)':  'var(--danger-100)',
  'var(--ocean-600)':   'var(--ocean-200)',
  'var(--text-subtle)': 'var(--surface-sunken)',
};
