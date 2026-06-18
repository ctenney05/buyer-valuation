import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

function dotColor(deal) {
  if (deal.status === 'renewed')  return 'var(--success-600)';
  if (deal.status === 'declined') return 'var(--danger-600)';
  if (deal.portalViews >= 4) return 'var(--success-600)';
  if (deal.portalViews >= 2) return 'var(--clay-600)';
  return 'var(--danger-600)';
}

function daysColor(days) {
  if (days > 90)  return 'var(--success-600)';
  if (days >= 30) return 'var(--clay-600)';
  return 'var(--danger-600)';
}

const FILTERS = [
  { id: 'all',        label: 'All'      },
  { id: 'evaluation', label: 'Active'   },
  { id: 'renewed',    label: 'Renewed'  },
  { id: 'declined',   label: 'Declined' },
];

export default function PipelineList({ deals, selectedDealId, onSelect }) {
  const [filter, setFilter] = useState('all');

  const filtered = deals.filter((d) => {
    if (filter === 'evaluation') return d.status === 'evaluation';
    if (filter === 'renewed')    return d.status === 'renewed';
    if (filter === 'declined')   return d.status === 'declined';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => a.daysToRenewal - b.daysToRenewal);

  useEffect(() => {
    const first = [...deals]
      .filter((d) => {
        if (filter === 'evaluation') return d.status === 'evaluation';
        if (filter === 'renewed')    return d.status === 'renewed';
        if (filter === 'declined')   return d.status === 'declined';
        return true;
      })
      .sort((a, b) => a.daysToRenewal - b.daysToRenewal)[0];
    if (first) onSelect(first.id);
  }, [filter]);

  return (
    <div
      className="w-[380px] flex-shrink-0 overflow-y-auto"
      style={{ borderRight: '1px solid var(--border-default)' }}
    >
      {/* Sticky header — single row */}
      <div
        className="sticky top-0 z-10 px-4 h-11 flex items-center justify-between gap-3"
        style={{
          background: 'rgba(250,249,245,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Filter pills */}
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="rounded-full"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: filter === f.id ? 600 : 400,
                padding: '3px 9px',
                background: filter === f.id ? 'var(--clay-100)' : 'transparent',
                color:      filter === f.id ? 'var(--clay-700)' : 'var(--text-subtle)',
                border:     filter === f.id ? '1px solid var(--clay-200)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {sorted.map((deal) => (
        <DealRow
          key={deal.id}
          deal={deal}
          selected={deal.id === selectedDealId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function DealRow({ deal, selected, onSelect }) {
  function handleMouseEnter(e) {
    if (!selected) e.currentTarget.style.background = 'var(--surface-sunken)';
  }
  function handleMouseLeave(e) {
    if (!selected) e.currentTarget.style.background = 'transparent';
  }

  return (
    <div
      className="flex items-center gap-3 py-3.5 px-4 cursor-pointer"
      style={{
        borderLeft:   selected ? '3px solid var(--clay-500)' : '3px solid transparent',
        background:   selected ? 'var(--clay-100)' : 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
      }}
      onClick={() => onSelect(deal.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: dotColor(deal) }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="font-semibold truncate" style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: 'var(--text-strong)' }}>
            {deal.buyerCompany}
          </p>
          <span
            className="flex-shrink-0 font-semibold"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: daysColor(deal.daysToRenewal) }}
          >
            {deal.daysToRenewal}d
          </span>
        </div>
        <p className="text-[10.5px] mt-0.5 truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
          renews {deal.renewalDate.slice(5).replace('-', '/')}
        </p>
      </div>

      {selected && <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--clay-500)' }} />}
    </div>
  );
}
