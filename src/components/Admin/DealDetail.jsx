import { Download } from 'lucide-react';

const cardStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  boxShadow: 'var(--shadow-sm)',
};

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
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10.5px] tracking-widest uppercase font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--success-600)' }}>
            Renewed
          </span>
          <span className="text-[11.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Buyer Evaluation
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
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10.5px] tracking-widest uppercase font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger-600)' }}>
            Declined
          </span>
          <span className="text-[11.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Buyer Evaluation
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
  const u = urgencyStyle(deal.daysToRenewal);
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
      className="rounded-xl p-5"
      style={{ background: u.bg, border: `1px solid ${u.bd}`, boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <span
          className="text-[10.5px] tracking-widest uppercase font-semibold"
          style={{ fontFamily: 'var(--font-mono)', color: u.fg }}
        >
          {u.word}
        </span>
        <span
          className="text-[11.5px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
        >
          Buyer Evaluation
        </span>
      </div>
      <p className="text-[13.5px] leading-snug" style={{ color: 'var(--ink-700)' }}>
        <span className="font-semibold">{deal.buyerCompany}</span> renewal window
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="text-[46px] font-semibold leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-serif)', color: u.fg }}
        >
          {deal.daysToRenewal}
        </span>
        <span className="text-[15px] font-medium" style={{ color: 'var(--ink-700)' }}>
          days remaining
        </span>
      </div>
      <div className="mt-4">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(20,20,19,0.07)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: u.fg }} />
        </div>
        <div
          className="flex justify-between mt-1.5 text-[11px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
        >
          <span>
            Started {contractStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="font-semibold" style={{ color: u.fg }}>
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

const SNAPSHOT_BUCKETS = [
  { key: 'at-risk',    label: 'At Risk',    color: '#EF4444' },
  { key: 'monitoring', label: 'Monitoring', color: '#F59E0B' },
  { key: 'engaged',    label: 'Engaged',    color: '#22C55E' },
  { key: 'closed',     label: 'Closed',     color: 'var(--text-subtle)' },
];

function PortfolioSnapshot({ bucketCounts, flags, onSelect }) {
  return (
    <div className="rounded-xl p-5" style={cardStyle}>
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-3"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}
      >
        Portfolio snapshot
      </p>
      <div className="space-y-2">
        {SNAPSHOT_BUCKETS.map((b) => (
          <div key={b.key} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
              <span className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                {b.label}
              </span>
            </div>
            <span className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
              {bucketCounts[b.key]}
            </span>
          </div>
        ))}
      </div>
      {flags.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ fontFamily: 'var(--font-mono)', color: '#EF4444' }}
          >
            ⚠ Needs action
          </p>
          <div className="flex flex-wrap gap-1.5">
            {flags.slice(0, 5).map(d => (
              <button
                key={d.id}
                onClick={() => onSelect(d.id)}
                className="text-[11px] font-medium rounded-full px-2.5 py-1"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#DC2626',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
              >
                {d.company} · {d.daysToRenewal}d · {d.portalViews} {d.portalViews === 1 ? 'open' : 'opens'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DealDetail({ deal, bucketCounts, flags, onSelect }) {
  const engagementTiles = [
    { label: 'Portal Opens',      value: deal.portalViews,   color: 'var(--text-strong)' },
    { label: 'Chatbot Messages',  value: deal.chatMessages,  color: 'var(--text-strong)' },
    { label: 'Last Active',       value: deal.lastActive,    color: 'var(--text-strong)' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Fixed snapshot — does not scroll */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <PortfolioSnapshot bucketCounts={bucketCounts} flags={flags} onSelect={onSelect} />
      </div>

      {/* Scrollable deal content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

      {/* Section 1 — Header */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2
                className="font-bold leading-tight"
                style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--text-strong)' }}
              >
                {deal.buyerCompany}
              </h2>
              {deal.status === 'renewed'  && <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: 'var(--font-mono)', background: '#DCFCE7', color: '#15803D' }}>Renewed ✓</span>}
              {deal.status === 'declined' && <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: 'var(--font-mono)', background: 'var(--danger-100)', color: 'var(--danger-600)' }}>Declined</span>}
            </div>
            <p
              className="mt-1"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-subtle)' }}
            >
              {deal.vendor} · {deal.stage}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p
              className="font-bold"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--clay-600)' }}
            >
              ${deal.annualValue.toLocaleString()}/yr
            </p>
            <p
              className="mt-1"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}
            >
              Renews {fmtDate(deal.renewalDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Countdown box */}
      <CountdownBox deal={deal} />

      {/* Section 2 — Progress tracker */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <SectionLabel>Renewal Progress</SectionLabel>
        <ProgressTracker progress={deal.progress} />
      </div>

      {/* Section 3 — Engagement metrics */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <SectionLabel>Engagement</SectionLabel>
        {/* Top row: 3 metric tiles */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {engagementTiles.map((tile) => (
            <div
              key={tile.label}
              className="rounded-lg p-3"
              style={{ background: 'var(--surface-sunken)' }}
            >
              <p
                className="mb-1"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)' }}
              >
                {tile.label}
              </p>
              <p
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-mono)', color: tile.color }}
              >
                {tile.value}
              </p>
            </div>
          ))}
        </div>
        {/* Portal access log */}
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-subtle)' }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Portal Access Log
            </p>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)' }}>
              {deal.portalAccessLog ? deal.portalAccessLog.length : deal.portalViews} visits
            </span>
          </div>
          {deal.portalAccessLog && deal.portalAccessLog.length > 0 ? (
            deal.portalAccessLog.map((entry, i) => (
              <div
                key={i}
                className="px-3 py-2.5 flex items-center justify-between"
                style={i < deal.portalAccessLog.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: 'var(--clay-100)', color: 'var(--clay-700)', fontFamily: 'var(--font-mono)' }}
                  >
                    {entry.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium leading-tight" style={{ color: 'var(--text-body)' }}>
                      {entry.name}
                    </p>
                    <p className="text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                      {entry.role}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-right flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {entry.date}<br />
                  <span style={{ color: 'var(--text-subtle)' }}>{entry.time}</span>
                </p>
              </div>
            ))
          ) : (
            <div className="px-3 py-3">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-subtle)' }}>No visits yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 4 — Contract History */}
      <ContractHistory history={deal.contractHistory} />

      {/* Section 5 — Contacts */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <SectionLabel>Contacts</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <ContactCard person={deal.buyerContact} kind="buyer" label="Buyer" />
          <ContactCard person={deal.sellerContact} kind="seller" label="Seller" />
        </div>
      </div>

      </div>{/* end scrollable */}
    </div>
  );
}

const CONTRACT_STATUS = {
  active:  { background: '#DCFCE7', color: '#15803D', label: 'Active'   },
  expired: { background: 'var(--surface-sunken)', color: 'var(--text-muted)', label: 'Expired' },
};

function ContractHistory({ history }) {
  function fmtSigned(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="rounded-xl overflow-hidden" style={cardStyle}>
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <p
          className="font-semibold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)', margin: 0 }}
        >
          Contract History
        </p>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)' }}>
          {history.length} contracts
        </span>
      </div>
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
                      onClick={() => window.print()}
                      className="flex items-center gap-1 font-medium transition-colors"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--clay-600)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--clay-700)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--clay-600)')}
                    >
                      <Download style={{ width: 11, height: 11 }} />
                      PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactCard({ person, kind, label }) {
  const isBuyer = kind === 'buyer';
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: 'var(--surface-sunken)',
        border: isBuyer ? '1px solid var(--clay-200)' : '1px solid var(--ocean-200)',
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-2"
        style={{
          fontFamily: 'var(--font-mono)',
          color: isBuyer ? 'var(--clay-600)' : 'var(--ocean-500)',
        }}
      >
        {label}
      </p>
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            fontFamily: 'var(--font-sans)',
            background: isBuyer ? 'var(--clay-100)' : 'var(--ocean-200)',
            color:      isBuyer ? 'var(--clay-700)' : 'var(--ocean-600)',
          }}
        >
          {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p
            className="font-semibold leading-tight truncate"
            style={{ fontSize: '13.5px', color: 'var(--text-strong)' }}
          >
            {person.name}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-subtle)' }}>
            {person.role}
          </p>
        </div>
      </div>
    </div>
  );
}
