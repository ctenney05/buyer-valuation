import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { funnelCounts, renewalOutcomes } from '../../data/orgMetrics.js';

const STAGE_ABBR = {
  'Monitoring': 'Monitoring',
  'Qualification': 'Qualification',
  'Outreach': 'Outreach',
  'Proposal': 'Proposal',
  'Buyer Evaluation': 'Buyer Eval',
};

function kfmt(n) {
  if (!n) return '$0';
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
}

function StageChips({ deals }) {
  const shown = deals.slice(0, 4);
  const extra = deals.length - shown.length;
  return (
    <div className="flex items-center gap-1 mt-2" style={{ pointerEvents: 'none' }}>
      {shown.map((d) => (
        d.domain ? (
          <img
            key={d.id}
            src={`https://www.google.com/s2/favicons?sz=64&domain_url=https://${d.domain}`}
            alt=""
            className="w-4 h-4 rounded-[3px]"
            style={{ background: '#fff', border: '1px solid var(--border-subtle)', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
          />
        ) : (
          <span key={d.id} className="w-4 h-4 rounded-[3px] flex items-center justify-center text-[7px] font-semibold"
            style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            {d.buyerInitials}
          </span>
        )
      ))}
      {extra > 0 && (
        <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>+{extra}</span>
      )}
    </div>
  );
}

export default function PipelineFunnel({ deals, activeStage = null, compact = false, onSelectStage }) {
  const cols = funnelCounts(deals); // [{stage,count,arr}]
  const outcomes = renewalOutcomes(deals);
  const dealsByStage = (stage) => deals.filter((d) => d.stage === stage);

  return (
    <div>
      <div className="flex items-stretch">
        {cols.map((c, i) => {
          const active = activeStage === c.stage;
          return (
            <Fragment key={c.stage}>
              <button
                onClick={() => onSelectStage?.(c.stage)}
                className={`rounded-lg text-left ${compact ? 'px-2.5 py-2' : 'px-3.5 py-3'}`}
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  cursor: 'pointer',
                  background: active ? 'var(--clay-100)' : 'var(--surface-card)',
                  border: `1px solid ${active ? 'var(--clay-500)' : 'var(--border-default)'}`,
                  boxShadow: active ? 'none' : 'var(--shadow-xs)',
                  transition: 'transform 120ms ease, box-shadow 120ms ease',
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = active ? 'none' : 'var(--shadow-xs)'; }}
              >
                <p className="uppercase truncate" style={{ fontFamily: 'var(--font-mono)', fontSize: compact ? '8.5px' : '9.5px', letterSpacing: '0.06em', color: active ? 'var(--clay-700)' : 'var(--text-subtle)' }}>
                  {STAGE_ABBR[c.stage]}
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-bold leading-none" style={{ fontFamily: 'var(--font-serif)', fontSize: compact ? '18px' : '24px', color: c.count ? 'var(--text-strong)' : 'var(--text-subtle)' }}>
                    {c.count}
                  </span>
                  {!compact && (
                    <span className="text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>{kfmt(c.arr)}</span>
                  )}
                </div>
                {!compact && c.count > 0 && <StageChips deals={dealsByStage(c.stage)} />}
              </button>
              {i < cols.length - 1 && (
                <div className="flex items-center flex-shrink-0 px-1">
                  <ChevronRight className={compact ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={2.75} style={{ color: 'var(--clay-500)' }} />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      {!compact && (
        <div className="flex items-center gap-4 mt-2.5 px-1">
          <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>Renewal outcomes</span>
          <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--success-600)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success-600)' }} />
            {outcomes.signed} signed {kfmt(outcomes.signedArr)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ border: '1px solid var(--text-subtle)' }} />
            {outcomes.declined} declined
          </span>
        </div>
      )}
    </div>
  );
}
