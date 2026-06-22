import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtRenews(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

// Days since last portal activity, parsed from the "N days ago" lastActive string.
// "Today"/"Yesterday"/unparseable read as 0 (i.e. not stale).
export function daysInactive(deal) {
  const match = deal.lastActive?.match(/^(\d+) days? ago$/);
  return match ? parseInt(match[1]) : 0;
}

// Recency line shown on every pipeline row. Stale evaluation deals (≥7 days) read
// red as a "gone dark" warning (e.g. Uber); otherwise a muted "Active <when>" line.
function activityLine(deal) {
  if (deal.status !== 'evaluation') return null;
  const inactive = daysInactive(deal);
  if (inactive >= 7) return { text: `No activity in ${inactive} days`, color: 'var(--danger-600)' };
  const la = deal.lastActive ?? '';
  const when = /^(Today|Yesterday)$/.test(la) ? la.toLowerCase() : la;
  return when ? { text: `Active ${when}`, color: 'var(--text-subtle)' } : null;
}

// Engagement is its own dimension, independent of renewal urgency (the day count
// conveys urgency). Returns the at-a-glance signal used by both the left dot and
// the right-aligned label so the two can never contradict each other.
export function engagementSignal(deal) {
  if (deal.status === 'renewed')  return { label: 'Renewed',       color: 'var(--success-600)', muted: true };
  if (deal.status === 'declined') return { label: 'Declined',      color: 'var(--text-subtle)', muted: true };
  // Portal opens are the engagement signal (matches the original dot logic). A lone
  // chat message does NOT count as engaged — e.g. Uber (1 view, 1 msg) must read dark.
  if (deal.portalViews >= 4) return { label: 'Engaged',       color: 'var(--success-600)' };
  if (deal.portalViews >= 2) return { label: 'Some activity', color: 'var(--clay-600)'    };
  return { label: 'Not engaged', color: 'var(--danger-600)' };
}

// Soft tinted background per engagement state, for the pill chip.
const PILL_BG = {
  'var(--success-600)': 'var(--success-100)',
  'var(--clay-600)':    'var(--clay-100)',
  'var(--danger-600)':  'var(--danger-100)',
};

function daysColor(days) {
  if (days > 90)  return 'var(--success-600)';
  if (days >= 30) return 'var(--clay-600)';
  return 'var(--danger-600)';
}

// Shared column widths so the header row lines up with the data rows.
const COL = {
  logo:       'w-9',
  account:    'w-56',
  renewal:    'w-20',
  engagement: 'w-36',
};

export default function PipelineList({ deals, selectedDealId, onSelect }) {
  const containerRef = useRef(null);

  const sorted = useMemo(
    () => [...deals].sort((a, b) => a.daysToRenewal - b.daysToRenewal),
    [deals],
  );

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const idx = sorted.findIndex((d) => d.id === selectedDealId);
      // Landing state (no selection): ArrowDown opens the first deal.
      if (idx === -1) {
        if (e.key === 'ArrowDown' && sorted[0]) onSelect(sorted[0].id);
        return;
      }
      const nextIdx = e.key === 'ArrowDown'
        ? Math.min(idx + 1, sorted.length - 1)
        : Math.max(idx - 1, 0);
      onSelect(sorted[nextIdx].id);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sorted, selectedDealId, onSelect]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current.querySelector('[data-selected="true"]');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedDealId]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
      style={{ borderRight: '1px solid var(--border-default)' }}
    >
      <ListHeader />
      {sorted.map((deal) => (
        <DealRow
          key={deal.id}
          deal={deal}
          selected={deal.id === selectedDealId}
          onSelect={onSelect}
          dataSelected={deal.id === selectedDealId}
        />
      ))}
    </div>
  );
}

function ListHeader() {
  const cell = 'text-[9.5px] font-bold uppercase';
  const style = { fontFamily: 'var(--font-mono)', color: '#000', letterSpacing: '0.08em' };
  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-4 px-5 h-9"
      style={{
        background: 'rgba(250,249,245,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div className={`${COL.logo} flex-shrink-0`} />
      <div className={`${COL.account} flex-shrink-0 ${cell}`} style={style}>Account</div>
      <div className={`${COL.renewal} flex-shrink-0 ${cell}`} style={style}>Renews</div>
      <div className={`flex-1 min-w-0 ${cell}`} style={style}>Last activity</div>
      <div className={`${COL.engagement} flex-shrink-0 text-right ${cell}`} style={style}>Engagement</div>
      <div className="w-4 flex-shrink-0" />
    </div>
  );
}

function CompanyLogo({ deal }) {
  const [failed, setFailed] = useState(false);
  if (failed || !deal.domain) {
    return (
      <span
        className={`${COL.logo} h-9 rounded-lg flex items-center justify-center text-[11px] font-semibold flex-shrink-0`}
        style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-sunken)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
      >
        {deal.buyerInitials}
      </span>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=128&domain_url=https://${deal.domain}`}
      alt={deal.buyerCompany}
      onError={() => setFailed(true)}
      className={`${COL.logo} h-9 rounded-lg flex-shrink-0`}
      style={{ border: '1px solid var(--border-subtle)', objectFit: 'contain', background: '#fff', padding: '4px' }}
    />
  );
}

function DealRow({ deal, selected, onSelect, dataSelected }) {
  const signal = engagementSignal(deal);
  const activity = activityLine(deal);
  const overdue = deal.daysToRenewal <= 0;
  const pillBg = signal.muted ? 'var(--surface-sunken)' : (PILL_BG[signal.color] ?? 'var(--surface-sunken)');

  function handleMouseEnter(e) {
    if (!selected) e.currentTarget.style.background = 'var(--surface-sunken)';
  }
  function handleMouseLeave(e) {
    if (!selected) e.currentTarget.style.background = 'transparent';
  }

  return (
    <div
      data-selected={dataSelected}
      className="flex items-center gap-4 py-3 px-5 cursor-pointer"
      style={{
        borderLeft:   selected ? '3px solid var(--clay-500)' : '3px solid transparent',
        background:   selected ? 'var(--clay-100)' : 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
        transition:   'background 120ms ease',
      }}
      onClick={() => onSelect(deal.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CompanyLogo deal={deal} />

      {/* Account — company + renewal date */}
      <div className={`${COL.account} flex-shrink-0 min-w-0`}>
        <p className="font-semibold truncate leading-tight" style={{ fontFamily: 'var(--font-serif)', fontSize: '14.5px', color: 'var(--text-strong)' }}>
          {deal.buyerCompany}
        </p>
        <p className="text-[10.5px] mt-0.5 truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
          renews {fmtRenews(deal.renewalDate)}
        </p>
      </div>

      {/* Renews in — urgency */}
      <div className={`${COL.renewal} flex-shrink-0`}>
        {overdue ? (
          <span
            className="font-bold"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: 'var(--danger-600)', color: '#fff', borderRadius: '4px', padding: '2px 6px', letterSpacing: '0.02em' }}
          >
            Overdue
          </span>
        ) : (
          <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: daysColor(deal.daysToRenewal) }}>
            {deal.daysToRenewal}d
          </span>
        )}
      </div>

      {/* Last activity / recency */}
      <p className="flex-1 min-w-0 text-[11px] truncate" style={{ fontFamily: 'var(--font-mono)', color: activity ? activity.color : 'var(--text-subtle)' }}>
        {activity ? activity.text : ''}
      </p>

      {/* Engagement pill — Evan: "per line, on the right hand side, tell me engaged / not engaged" */}
      <div className={`${COL.engagement} flex-shrink-0 flex justify-end`}>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: pillBg, opacity: signal.muted ? 0.7 : 1 }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: signal.color }} />
          <span className="text-[10px] font-semibold whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color: signal.color }}>
            {signal.label}
          </span>
        </span>
      </div>

      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: selected ? 'var(--clay-500)' : 'var(--border-default)' }} />
    </div>
  );
}
