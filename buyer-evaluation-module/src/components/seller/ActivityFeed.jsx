import { useState } from 'react';
import { UserPlus, MessageCircle, Moon } from 'lucide-react';
// The cross-account event list is built by the shared OUT contract — the same
// stakeholder-pull-in + question primitives that feed the downstream signal.
import { buildActivityEvents } from '../../lib/signals.js';

const cardStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  boxShadow: 'var(--shadow-sm)',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FEED_DAYS = 14; // how far back the activity feed looks
const FEED_CAP = 15;  // max rows

// Activity-feed kind filters.
const FILTERS = [
  { id: 'all',         label: 'All'          },
  { id: 'stakeholder', label: 'Stakeholders' },
  { id: 'question',    label: 'Questions'    },
];

// Time buckets for the feed — only non-empty groups render.
const GROUPS = [
  { label: 'Today',     test: (ago) => ago === 0 },
  { label: 'This week', test: (ago) => ago >= 1 && ago <= 7 },
  { label: 'Earlier',   test: (ago) => ago >= 8 },
];

function relativeLabel(ago) {
  if (ago <= 0) return 'today';
  if (ago === 1) return '1d';
  return `${ago}d`;
}

function MiniLogo({ deal }) {
  const [failed, setFailed] = useState(false);
  if (failed || !deal.domain) {
    return (
      <span
        className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-semibold flex-shrink-0"
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
      className="w-5 h-5 rounded flex-shrink-0"
      style={{ border: '1px solid var(--border-subtle)', objectFit: 'contain', background: '#fff', padding: '1.5px' }}
    />
  );
}

function EventRow({ e, onSelect }) {
  const isStakeholder = e.kind === 'stakeholder';
  const deal = e.deal;
  const Icon = isStakeholder ? UserPlus : MessageCircle;
  const badge = isStakeholder
    ? { label: 'New stakeholder', fg: 'var(--clay-700)',   bg: 'var(--clay-100)',      bd: 'var(--clay-200)'     }
    : { label: 'Question',        fg: 'var(--text-muted)', bg: 'var(--surface-sunken)', bd: 'var(--border-subtle)' };
  const dateStr = `${MONTHS[e.date.getMonth()]} ${e.date.getDate()}`;
  const meta = isStakeholder
    ? `Opened the portal · ${dateStr}${e.time ? ` · ${e.time}` : ''}`
    : `Asked · ${dateStr}`;

  return (
    <button
      onClick={() => onSelect(e.dealId)}
      className="w-full text-left p-2.5 rounded-lg"
      style={{ background: 'transparent', cursor: 'pointer' }}
      onMouseEnter={(ev) => (ev.currentTarget.style.background = 'var(--surface-sunken)')}
      onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
    >
      {/* Header — logo + company + recency */}
      <div className="flex items-center gap-2">
        <MiniLogo deal={deal} />
        <span className="flex-1 min-w-0 font-semibold truncate" style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--text-strong)' }}>
          {deal.buyerCompany}
        </span>
        <span className="flex-shrink-0 text-[9.5px] whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
          {relativeLabel(e.ago)}
        </span>
      </div>

      {/* Type badge */}
      <span
        className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 mt-1.5"
        style={{ background: badge.bg, border: `1px solid ${badge.bd}` }}
      >
        <Icon className="w-2.5 h-2.5" style={{ color: badge.fg }} />
        <span className="text-[8.5px] font-semibold uppercase" style={{ fontFamily: 'var(--font-mono)', color: badge.fg, letterSpacing: '0.04em' }}>
          {badge.label}
        </span>
      </span>

      {/* Detail */}
      <p
        className="mt-1.5 text-[11.5px] leading-snug"
        style={{ color: 'var(--text-body)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {isStakeholder ? (
          <><span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{e.name}</span> · {e.role}</>
        ) : (
          <span style={{ fontStyle: 'italic' }}>&ldquo;{e.text}&rdquo;</span>
        )}
      </p>

      {/* Meta */}
      <p className="mt-1 text-[9.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
        {meta}
      </p>
    </button>
  );
}

export default function ActivityFeed({ deals, today, onSelect }) {
  const [filter, setFilter] = useState('all');

  const all = buildActivityEvents(deals, today, { windowDays: FEED_DAYS });
  const filtered = filter === 'all' ? all : all.filter((e) => e.kind === filter);
  const shown = filtered.slice(0, FEED_CAP);

  // Accounts with no high-signal events in the window — the dark ones.
  // Always computed from unfiltered activity, independent of the kind pill.
  const active = deals.filter((d) => d.status === 'evaluation');
  const withEvents = new Set(all.map((e) => e.dealId));
  const quiet = active.filter((d) => !withEvents.has(d.id));

  // Split the shown events into the non-empty time groups, preserving order.
  const grouped = GROUPS
    .map((g) => ({ label: g.label, events: shown.filter((e) => g.test(e.ago)) }))
    .filter((g) => g.events.length > 0);

  const emptyLabel = filter === 'stakeholder' ? 'new stakeholder'
    : filter === 'question' ? 'question'
    : 'buyer';

  return (
    <div className="w-1/4 min-w-[280px] flex-shrink-0 overflow-y-auto p-4" style={{ borderLeft: '1px solid var(--border-default)' }}>
      <div className="mb-3">
        <h2
          className="font-bold leading-tight"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--text-strong)' }}
        >
          Recent activity
        </h2>
      </div>

      {/* Kind filter pills */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {FILTERS.map((f) => {
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="rounded-full"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: on ? 600 : 400,
                padding: '3px 9px',
                background: on ? 'var(--clay-100)' : 'transparent',
                color:      on ? 'var(--clay-700)' : 'var(--text-subtle)',
                border:     on ? '1px solid var(--clay-200)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl p-2" style={cardStyle}>
          <p className="text-[12px] px-3 py-6 text-center" style={{ color: 'var(--text-subtle)' }}>
            No {emptyLabel} activity in the last {FEED_DAYS} days.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((g) => (
            <div key={g.label}>
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-1.5 px-1"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}
              >
                {g.label}
              </p>
              <div className="rounded-xl p-2" style={cardStyle}>
                {g.events.map((e) => (
                  <EventRow key={e.key} e={e} onSelect={onSelect} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {quiet.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-3 px-1">
          <Moon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-subtle)' }} />
          <span className="text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
            Quiet ({FEED_DAYS}d):
          </span>
          {quiet.map((d, i) => (
            <span key={d.id} className="text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>
              <button
                onClick={() => onSelect(d.id)}
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                onMouseEnter={(ev) => (ev.currentTarget.style.color = 'var(--clay-600)')}
                onMouseLeave={(ev) => (ev.currentTarget.style.color = 'var(--text-muted)')}
              >
                {d.buyerCompany}
              </button>
              {i < quiet.length - 1 ? <span style={{ color: 'var(--text-subtle)' }}> · </span> : null}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
