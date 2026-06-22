import { useState } from 'react';
import { Download, MessageCircle, Flame, ChevronLeft } from 'lucide-react';
import { documentGroups } from '../../data/documents';
import { DocumentRow, GROUP_ICONS } from '../ContractHistory/ContractHistoryTab';

const cardStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  boxShadow: 'var(--shadow-sm)',
};

const initials = (name) => name.split(' ').map((n) => n[0]).join('').slice(0, 2);

function urgencyStyle(days) {
  if (days <= 7)  return { bg: 'var(--danger-100)',  bd: 'var(--danger-600)',  fg: 'var(--danger-600)',  word: 'Closing soon'   };
  if (days <= 30) return { bg: 'var(--clay-100)',    bd: 'var(--clay-400)',    fg: 'var(--clay-700)',    word: 'Action needed'  };
  return            { bg: 'var(--success-100)', bd: 'var(--success-600)', fg: 'var(--success-600)', word: 'On track'       };
}

function CountdownBox({ deal }) {
  // Terminal status states — no countdown
  if (deal.status === 'renewed') {
    return (
      <div className="rounded-xl p-5" style={{ background: 'var(--success-100)', border: '1px solid var(--success-600)', boxShadow: 'var(--shadow-xs)' }}>
        <div className="flex items-center mb-3.5">
          <span className="text-[10.5px] tracking-widest uppercase font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--success-600)' }}>
            Renewed
          </span>
        </div>
        <p className="text-[13.5px] leading-snug" style={{ color: 'var(--ink-700)' }}>
          <span className="font-semibold">{deal.buyerCompany}</span> renewal signed
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-[46px] font-semibold leading-none tracking-tight" style={{ fontFamily: 'var(--font-serif)', color: 'var(--success-600)' }}>✓</span>
          <span className="text-[15px] font-medium" style={{ color: 'var(--ink-700)' }}>
            Signed {fmtDate(deal.renewedDate)}
          </span>
        </div>
      </div>
    );
  }

  if (deal.status === 'declined') {
    return (
      <div className="rounded-xl p-5" style={{ background: 'var(--danger-100)', border: '1px solid var(--danger-600)', boxShadow: 'var(--shadow-xs)' }}>
        <div className="flex items-center mb-3.5">
          <span className="text-[10.5px] tracking-widest uppercase font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger-600)' }}>
            Declined
          </span>
        </div>
        <p className="text-[13.5px] leading-snug" style={{ color: 'var(--ink-700)' }}>
          <span className="font-semibold">{deal.buyerCompany}</span> did not renew
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[15px] font-medium" style={{ color: 'var(--danger-600)' }}>
            Renewal window closed {fmtDate(deal.renewalDate)}
          </span>
        </div>
      </div>
    );
  }

  // evaluation — standard countdown
  const isOverdue   = deal.daysToRenewal <= 0;
  const displayDays = Math.max(0, deal.daysToRenewal);
  const u           = urgencyStyle(displayDays);
  const statusWord  = isOverdue ? 'Overdue' : u.word;
  const ds          = isOverdue
    ? { bg: 'var(--danger-600)', bd: 'var(--danger-700)', fg: '#ffffff', bodyFg: 'rgba(255,255,255,0.9)', trackBg: 'rgba(255,255,255,0.2)', trackFill: 'rgba(255,255,255,0.85)', dateFg: 'rgba(255,255,255,0.6)' }
    : { bg: u.bg, bd: u.bd, fg: u.fg, bodyFg: 'var(--ink-700)', trackBg: 'rgba(20,20,19,0.07)', trackFill: u.fg, dateFg: 'var(--text-subtle)' };

  const contractStart = (() => {
    const d = new Date(deal.renewalDate);
    d.setFullYear(d.getFullYear() - 1);
    return d;
  })();
  const renewalDate  = new Date(deal.renewalDate);
  const totalDays    = Math.ceil((renewalDate - contractStart) / 86400000);
  const elapsed      = Math.max(0, totalDays - deal.daysToRenewal);
  const pct          = Math.min(100, Math.max(3, (elapsed / totalDays) * 100));

  return (
    <div
      className={`rounded-xl px-5 py-3.5${isOverdue ? ' overdue-pulse' : ''}`}
      style={{ background: ds.bg, border: `1px solid ${ds.bd}`, boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[30px] font-semibold leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', color: ds.fg }}
          >
            {displayDays}
          </span>
          <span className="text-[13.5px] font-medium" style={{ color: ds.bodyFg }}>
            {isOverdue ? 'days — renewal date passed' : 'days remaining'}
          </span>
        </div>
        <span
          className="text-[10.5px] tracking-widest uppercase font-semibold flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono)', color: ds.fg }}
        >
          {statusWord}
        </span>
      </div>
      <div className="mt-2.5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: ds.trackBg }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ds.trackFill }} />
        </div>
        <div
          className="flex justify-between mt-1.5 text-[10.5px]"
          style={{ fontFamily: 'var(--font-mono)', color: ds.dateFg }}
        >
          <span>
            Started {contractStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="font-semibold" style={{ color: ds.fg }}>
            Renews {fmtDate(deal.renewalDate)}
          </span>
        </div>
      </div>
    </div>
  );
}


function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SectionLabel({ children }) {
  return (
    <p
      className="font-semibold uppercase tracking-widest mb-4"
      style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)' }}
    >
      {children}
    </p>
  );
}

function ProgressTracker({ progress }) {
  return (
    <div className="flex items-start justify-between relative py-1">
      <div
        className="absolute left-[calc(100%/10)] right-[calc(100%/10)] h-px"
        style={{ background: 'var(--border-default)', top: '0.875rem' }}
      />
      {progress.map((step) => (
        <div key={step.label} className="flex flex-col items-center gap-1 flex-1 relative z-10">
          {step.completed ? (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--clay-500)' }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" style={{ color: '#fff' }}>
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : step.current ? (
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: 'var(--clay-500)', background: 'var(--surface-card)' }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--clay-500)' }}
              />
            </div>
          ) : (
            <div
              className="w-5 h-5 rounded-full border-2"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-card)' }}
            />
          )}
          <span
            className="text-[10px] font-medium text-center leading-tight"
            style={{
              fontFamily: 'var(--font-mono)',
              color: step.completed ? 'var(--clay-600)' : step.current ? 'var(--ink-700)' : 'var(--text-subtle)',
            }}
          >
            {step.label}
          </span>
          {step.date && (
            <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
              {step.date}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const PORTAL_TOGGLE_GROUPS = [
  {
    label: 'Tabs',
    toggles: [
      { key: 'showROICalculator',   label: 'ROI Calculator',    hint: 'Hide if buyer has their own ROI model'                    },
      { key: 'showContractHistory', label: 'Contract History',  hint: 'Hide for newer relationships with limited history'        },
      { key: 'showProposalDeck',    label: 'Renewals Deck',     hint: 'Hide until deck is finalized'                             },
    ],
  },
  {
    label: 'Home sections',
    toggles: [
      { key: 'showUsageData',  label: 'Seat utilization', hint: 'Enable for upsell accounts, hide when under-contract'  },
      { key: 'showHighlights', label: 'Highlights',       hint: 'Color-coded contract changes — hide for flat renewals' },
    ],
  },
];

function TogglePill({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative flex-shrink-0"
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: on ? 'var(--clay-500)' : 'var(--border-default)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s',
        padding: 0,
      }}
      aria-pressed={on}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 19 : 3,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
          transition: 'left 0.15s',
        }}
      />
    </button>
  );
}

function PortalConfigCard({ featureFlags, onFlagChange }) {
  return (
    <div className="rounded-xl overflow-hidden" style={cardStyle}>
      <div
        className="px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <p
          className="font-semibold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)', margin: 0 }}
        >
          Portal Configuration
        </p>
      </div>
      {PORTAL_TOGGLE_GROUPS.map((group, gi) => (
        <div key={group.label} style={gi < PORTAL_TOGGLE_GROUPS.length - 1 ? { borderBottom: '1px solid var(--border-default)' } : undefined}>
          {/* Group header — tinted band */}
          <div
            className="px-5 py-2 flex items-center gap-2"
            style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-subtle)' }}
          >
            <span
              className="uppercase tracking-widest font-semibold"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-muted)' }}
            >
              {group.label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-subtle)' }}>
              {group.label === 'Tabs' ? '— show/hide nav tabs' : '— show/hide sections on Home'}
            </span>
          </div>
          <div className="px-5 pb-1">
            {group.toggles.map((t, i) => (
              <div
                key={t.key}
                className="flex items-center justify-between gap-4 py-3"
                style={i < group.toggles.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : undefined}
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium leading-tight" style={{ color: 'var(--text-body)' }}>
                    {t.label}
                  </p>
                  <p className="text-[10.5px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                    {t.hint}
                  </p>
                </div>
                <TogglePill
                  on={featureFlags[t.key] !== false}
                  onChange={(val) => onFlagChange(t.key, val)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Crazy-Egg-style warm ramp: amber (light) → orange (warm) → red (hot).
function heatRgb(v) {
  if (v >= 0.66) return '220,38,38';   // red — hottest
  if (v >= 0.33) return '249,115,22';  // orange — warm
  return '245,158,11';                 // amber — light touch
}

function PreviewBlock({ label, always, on, heat }) {
  const active = always || on;

  // Heat overlay — always on, but only for VISIBLE blocks (a hidden section
  // can't have been viewed). Hidden blocks fall through to the dashed render.
  if (active) {
    const v = heat ?? 0;
    const alpha = v === 0 ? 0 : 0.18 + v * 0.62; // 0.18 → 0.80
    const minutes = v === 0 ? 0 : Math.max(1, Math.round(v * 9));
    const hot = v >= 0.5;
    return (
      <div
        className="rounded px-2 flex items-center justify-between flex-1"
        style={{
          background: v === 0 ? 'var(--surface-sunken)' : `rgba(${heatRgb(v)}, ${alpha})`,
          border: `1px solid ${v === 0 ? 'var(--border-subtle)' : `rgba(${heatRgb(v)}, 0.9)`}`,
          minHeight: '32px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', fontWeight: 600, color: hot ? '#fff' : 'var(--ink-700)' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: hot ? 'rgba(255,255,255,0.92)' : 'var(--text-subtle)' }}>
          {v === 0 ? '—' : `${minutes}m`}
        </span>
      </div>
    );
  }

  // Hidden block (toggled off in portal config) — dashed, dimmed, no heat.
  return (
    <div
      className="rounded px-2 flex items-center flex-1"
      style={{
        background: 'transparent',
        border: '1px dashed var(--border-default)',
        opacity: 0.45,
        minHeight: '32px',
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-subtle)' }}>
        {label}
      </span>
    </div>
  );
}

const PREVIEW_TABS = [
  { label: 'Home',     always: true                          },
  { label: 'Docs',     flag: 'showContractHistory'           },
  { label: 'ROI',      flag: 'showROICalculator'             },
  { label: 'Deck',     flag: 'showProposalDeck'              },
];

const PREVIEW_COLUMNS = [
  [
    { label: 'Countdown',        always: true                },
    { label: 'Stats',            always: true                },
    { label: 'Seat utilization', flag: 'showUsageData'       },
  ],
  [
    { label: "What's Changed",   always: true                },
    { label: 'Order Form',       always: true                },
    { label: 'Highlights',       flag: 'showHighlights'      },
  ],
  [
    { label: 'Renewal assistant', always: true },
    { label: 'Seller contacts',   always: true },
    { label: 'Buyer team',        always: true },
  ],
];

function BuyerPreview({ featureFlags, heat }) {
  const flag = (key) => featureFlags?.[key] !== false;
  const hasHeat = heat && Object.values(heat).some((v) => v > 0);
  return (
    <div className="rounded-xl overflow-hidden flex flex-col flex-1" style={cardStyle}>
      <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <p className="font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)', margin: 0 }}>
          Buyer View
        </p>
        <span
          className="flex items-center gap-1.5 rounded-full"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '9.5px', fontWeight: 600,
            padding: '3px 9px', background: 'var(--clay-100)', color: 'var(--clay-700)',
            border: '1px solid var(--clay-200)',
          }}
        >
          <Flame style={{ width: 11, height: 11 }} />
          Heatmap
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3 rounded-lg px-3 py-2" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-subtle)' }}>
            {hasHeat ? 'Time spent per section' : 'No section activity yet'}
          </span>
          <div className="flex items-center gap-1.5">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-subtle)' }}>less</span>
            <div style={{ width: 64, height: 8, borderRadius: 4, background: 'linear-gradient(90deg, rgba(245,158,11,0.25), rgba(249,115,22,0.7), rgba(220,38,38,0.95))' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-subtle)' }}>more</span>
          </div>
        </div>
        {/* Mini tab bar */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {PREVIEW_TABS.map(tab => {
            const visible = tab.always || flag(tab.flag);
            const isFixed = !!tab.always;
            return (
              <span
                key={tab.label}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: visible ? (isFixed ? 'var(--border-strong)' : 'var(--ink-700)') : 'var(--surface-sunken)',
                  color: visible ? '#fff' : 'var(--text-subtle)',
                  textDecoration: visible ? 'none' : 'line-through',
                  border: visible ? 'none' : '1px solid var(--border-default)',
                }}
              >
                {tab.label}
              </span>
            );
          })}
        </div>
        {/* 3-column schematic — mirrors buyer portal layout */}
        <div className="grid grid-cols-3 gap-2 flex-1">
          {PREVIEW_COLUMNS.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1.5">
              {col.map(block => (
                <PreviewBlock
                  key={block.label}
                  label={block.label}
                  always={!!block.always}
                  on={block.flag ? flag(block.flag) : undefined}
                  heat={heat?.[block.label]}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Combined Buying Team + Engagement card. Per Evan: "combine these two — here's
// what each of these people have done and when." Each stakeholder row folds in
// their last portal visit (date + time); the chat log lives in the same card.
function BuyingTeam({ sharedWith, portalAccessLog, buyerContact, chatTranscript, lastActive }) {
  const [showChat, setShowChat] = useState(false);
  if (!sharedWith || sharedWith.length === 0) return null;

  const primaryName = buyerContact?.name;

  const people = sharedWith.map(person => {
    const visits = (portalAccessLog ?? []).filter(e => e.name === person.name);
    const lastVisit = visits[visits.length - 1];
    return { ...person, accessed: visits.length > 0, visitCount: visits.length, lastVisit };
  });

  const sorted = [...people].sort((a, b) => (b.accessed ? 1 : 0) - (a.accessed ? 1 : 0));
  const newViewers = people.filter(p => p.accessed && p.name !== primaryName).length;
  const hasChat = chatTranscript && chatTranscript.length > 0;

  return (
    <div className="rounded-xl overflow-hidden" style={cardStyle}>
      <div className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <p className="font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)', margin: 0 }}>
          Buying Team
        </p>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {lastActive && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)' }}>
              Last active {lastActive}
            </span>
          )}
          {newViewers > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: 'var(--font-mono)', background: 'var(--clay-100)', color: 'var(--clay-600)', border: '1px solid var(--clay-200)' }}>
              +{newViewers} {newViewers === 1 ? 'stakeholder' : 'stakeholders'} viewed
            </span>
          )}
        </div>
      </div>
      <div>
        {sorted.map((person, i) => {
          const isAdditional = person.name !== primaryName;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3"
              style={i < sorted.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : undefined}
            >
              {/* Accessed indicator dot */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: person.accessed ? 'var(--success-600)' : 'transparent',
                  border: person.accessed ? 'none' : '1.5px solid var(--border-default)',
                }}
              />
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{
                  background: person.accessed && isAdditional ? 'var(--clay-100)' : 'var(--surface-sunken)',
                  color: person.accessed && isAdditional ? 'var(--clay-700)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {initials(person.name)}
              </div>
              {/* Name + role */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--text-body)' }}>
                  {person.name}
                </p>
                <p className="text-[11px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                  {person.role}
                </p>
              </div>
              {/* Last activity + email */}
              <div className="text-right flex-shrink-0 space-y-0.5">
                {person.accessed ? (
                  <p className="text-[10.5px] font-medium" style={{ fontFamily: 'var(--font-mono)', color: isAdditional ? 'var(--clay-600)' : 'var(--text-muted)' }}>
                    Viewed {person.lastVisit?.date}{person.lastVisit?.time ? ` · ${person.lastVisit.time}` : ''}
                    {person.visitCount > 1 ? ` · ${person.visitCount} visits` : ''}
                  </p>
                ) : (
                  <p className="text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                    Not yet viewed
                  </p>
                )}
                <a
                  href={`mailto:${person.email}`}
                  className="text-[11px] block"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {person.email}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat log — folded into the same card */}
      {hasChat && (
        <div className="px-5 py-3.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setShowChat(v => !v)}
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              background: showChat ? 'var(--clay-100)' : 'var(--surface-sunken)',
              border: `1px solid ${showChat ? 'var(--clay-200)' : 'var(--border-default)'}`,
              color: showChat ? 'var(--clay-600)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'background 0.12s, border-color 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { if (!showChat) { e.currentTarget.style.background = 'var(--clay-100)'; e.currentTarget.style.borderColor = 'var(--clay-200)'; e.currentTarget.style.color = 'var(--clay-600)'; }}}
            onMouseLeave={e => { if (!showChat) { e.currentTarget.style.background = 'var(--surface-sunken)'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
          >
            <MessageCircle style={{ width: 12, height: 12 }} />
            {showChat ? 'Hide chat log' : 'Show chat log'}
            <span style={{ opacity: 0.6 }}>· {chatTranscript.length} messages</span>
            <span style={{ transform: showChat ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.15s' }}>▾</span>
          </button>
          {showChat && (
            <div className="mt-3 space-y-2">
              {chatTranscript.map((msg, i) => {
                const isBuyer = msg.role === 'buyer';
                return (
                  <div key={i} className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[82%] rounded-xl px-3 py-2"
                      style={{
                        background: isBuyer ? 'var(--clay-100)' : 'var(--surface-sunken)',
                        border: `1px solid ${isBuyer ? 'var(--clay-200)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      <p className="text-[12px] leading-snug" style={{ color: 'var(--text-body)' }}>
                        {msg.message}
                      </p>
                      <p className="mt-1 text-[9.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)', textAlign: isBuyer ? 'right' : 'left' }}>
                        {isBuyer ? 'Buyer' : '[Renewal Assistant]'} · {msg.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DealDetail({ deal, featureFlags, onFlagChange, onBack }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Scrollable deal content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

      {/* Back to pipeline */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-subtle)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--clay-600)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to pipeline
        </button>
      )}

      {/* Section 1 — Header */}
      <div className="rounded-xl px-5 py-4" style={cardStyle}>
        <div className="flex items-center gap-4">
          {/* Company logo */}
          {deal.domain && (
            <img
              src={`https://www.google.com/s2/favicons?sz=128&domain_url=https://${deal.domain}`}
              alt={deal.buyerCompany}
              className="w-10 h-10 rounded-lg flex-shrink-0"
              style={{ border: '1px solid var(--border-subtle)', objectFit: 'contain', background: '#fff' }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          {/* Company + vendor */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2
                className="font-bold leading-tight"
                style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--text-strong)' }}
              >
                {deal.buyerCompany}
              </h2>
              {deal.status === 'renewed'  && <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: 'var(--font-mono)', background: 'var(--success-100)', color: 'var(--success-600)' }}>Renewed ✓</span>}
              {deal.status === 'declined' && <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: 'var(--font-mono)', background: 'var(--danger-100)', color: 'var(--danger-600)' }}>Declined</span>}
            </div>
            <p
              className="mt-0.5"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-subtle)' }}
            >
              {deal.vendor}
            </p>
          </div>
          {/* Progress tracker — inline */}
          <div className="flex-1 min-w-0">
            <ProgressTracker progress={deal.progress} />
          </div>
          {/* ACV */}
          <div className="flex-shrink-0 text-right">
            <p
              className="font-bold"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--clay-600)' }}
            >
              ${deal.annualValue.toLocaleString()}/yr
            </p>
          </div>
        </div>
      </div>

      {/* Countdown box */}
      <CountdownBox deal={deal} />

      {/* Buying Team + engagement — who the buyer pulled in, what each has done, and the chat log */}
      <BuyingTeam
        sharedWith={deal.sharedWith}
        portalAccessLog={deal.portalAccessLog}
        buyerContact={deal.buyerContact}
        chatTranscript={deal.chatTranscript}
        lastActive={deal.lastActive}
      />

      {/* Section 4 — Portal Configuration + Buyer Preview */}
      <div className="flex gap-5 items-stretch">
        <div className="flex-1 min-w-0 flex flex-col">
          <PortalConfigCard featureFlags={featureFlags} onFlagChange={onFlagChange} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <BuyerPreview featureFlags={featureFlags} heat={deal.sectionHeat} />
        </div>
      </div>

      {/* Section 6 — Documents */}
      <DocumentsCard deal={deal} />

      </div>{/* end scrollable */}
    </div>
  );
}

const CONTRACT_STATUS = {
  active:  { background: '#DCFCE7', color: '#15803D', label: 'Active'   },
  expired: { background: 'var(--surface-sunken)', color: 'var(--text-muted)', label: 'Expired' },
};

// Just the contract table body — the card wrapper + header now come from the
// surrounding Documents accordion group.
function ContractHistoryTable({ history }) {
  const [downloading, setDownloading] = useState(null);

  function handleDownload(idx) {
    setDownloading(idx);
    setTimeout(() => setDownloading(null), 1800);
  }

  return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-subtle)' }}>
              {['Term', 'ACV', 'Seats', 'Status', 'Notes'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  {h}
                </th>
              ))}
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {history.map((c, i) => {
              const s = CONTRACT_STATUS[c.status] ?? CONTRACT_STATUS.expired;
              return (
                <tr key={i} style={i < history.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : undefined}>
                  <td className="px-4 py-3 whitespace-nowrap font-medium" style={{ color: 'var(--text-body)' }}>
                    {c.term}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--clay-600)' }}>
                    ${c.annualValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>
                    {c.seats}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.background, color: s.color }}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[140px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {c.notes}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDownload(i)}
                      className="flex items-center gap-1 font-medium transition-colors"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: downloading === i ? 'var(--success-600)' : 'var(--clay-600)', background: 'transparent', border: 'none', cursor: 'pointer', minWidth: '46px' }}
                      onMouseEnter={(e) => { if (downloading !== i) e.currentTarget.style.color = 'var(--clay-700)'; }}
                      onMouseLeave={(e) => { if (downloading !== i) e.currentTarget.style.color = 'var(--clay-600)'; }}
                    >
                      {downloading === i ? <><span>✓</span> Saved</> : <><Download style={{ width: 11, height: 11 }} /> PDF</>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  );
}

// Collapsible group inside the Documents card — collapsed by default, header
// shows an icon + title + count, chevron rotates on toggle (same pattern as the
// BuyingTeam chat-log toggle).
function AccordionGroup({ icon, title, count, divided, children }) {
  const [open, setOpen] = useState(false);
  const Icon = GROUP_ICONS[icon];
  return (
    <div style={divided ? { borderTop: '1px solid var(--border-subtle)' } : undefined}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-5 py-3 text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-sunken)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 30, height: 30, background: 'var(--clay-100)', color: 'var(--clay-600)' }}
        >
          {Icon && <Icon className="w-4 h-4" />}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}>
            {title}
          </h3>
          <span className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
            {count}
          </span>
        </div>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.15s', color: 'var(--text-subtle)' }}>
          ▾
        </span>
      </button>
      {open && <div style={{ borderTop: '1px solid var(--border-subtle)' }}>{children}</div>}
    </div>
  );
}

// "Documents" card — mirrors the buyer Documents tab: key legal docs (MSA/DPA/SOC2
// from documents.js) + this deal's contract history, each as a collapsible group.
function DocumentsCard({ deal }) {
  const legal = documentGroups.find((g) => g.id === 'legal');
  return (
    <div className="rounded-xl overflow-hidden" style={cardStyle}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <p className="font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)', margin: 0 }}>
          Documents
        </p>
      </div>
      {legal && (
        <AccordionGroup icon={legal.icon} title={legal.title} count={legal.documents.length}>
          {legal.documents.map((doc, i) => (
            <DocumentRow key={doc.id} doc={doc} isLast={i === legal.documents.length - 1} />
          ))}
        </AccordionGroup>
      )}
      <AccordionGroup icon="history" title="Contract History" count={deal.contractHistory.length} divided>
        <ContractHistoryTable history={deal.contractHistory} />
      </AccordionGroup>
    </div>
  );
}

