import { orgMetrics } from '../../data/orgMetrics.js';
import { formatCurrency } from '../../data/format.js';

const cardStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  boxShadow: 'var(--shadow-sm)',
};

function Card({ label, value, valueColor, children }) {
  return (
    <div className="flex-1 rounded-xl px-4 py-3.5" style={cardStyle}>
      <p className="uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-subtle)' }}>
        {label}
      </p>
      <p className="font-bold leading-none mt-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', color: valueColor ?? 'var(--text-strong)' }}>
        {value}
      </p>
      <div className="mt-1.5 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
        {children}
      </div>
    </div>
  );
}

export default function MetricsRow({ deals }) {
  const m = orgMetrics(deals);
  const delta = m.projectedArr - m.arrExpiring;
  const deltaColor = delta >= 0 ? 'var(--success-600)' : 'var(--danger-600)';
  const nrrColor = m.nrr >= 100 ? 'var(--success-600)' : 'var(--clay-600)';

  return (
    <div className="flex gap-3">
      <Card label="ARR Expiring" value={formatCurrency(m.arrExpiring)}>
        {m.renewalCount} renewal{m.renewalCount === 1 ? '' : 's'} this quarter
      </Card>

      <Card label="Projected ARR" value={formatCurrency(m.projectedArr)}>
        <span style={{ color: deltaColor }}>
          {delta >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(delta))} {delta >= 0 ? 'net expansion' : 'net churn'}
        </span>
      </Card>

      <Card label="Net Retention" value={`${m.nrr.toFixed(1)}%`} valueColor={nrrColor}>
        forecast NRR
      </Card>

      <Card label="At Risk" value={String(m.atRiskCount)} valueColor={m.atRiskCount ? 'var(--danger-600)' : 'var(--text-strong)'}>
        {m.atRiskCount ? <span style={{ color: 'var(--danger-600)' }}>{formatCurrency(m.atRiskArr)} exposed</span> : 'all healthy'}
      </Card>
    </div>
  );
}
