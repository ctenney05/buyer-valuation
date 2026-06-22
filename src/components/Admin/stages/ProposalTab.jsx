import { FileText } from 'lucide-react';
import { formatCurrency } from '../../../data/format.js';

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' };
const Label = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{children}</p>
);

export default function ProposalTab({ deal, data }) {
  const up = data.pricing.delta >= 0;
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="rounded-xl p-5 flex items-center justify-between gap-4" style={card}>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--clay-100)' }}>
            <FileText className="w-5 h-5" style={{ color: 'var(--clay-600)' }} />
          </span>
          <div>
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-sunken)', color: 'var(--text-strong)' }}>{data.storyType}</span>
            <p className="mt-1 text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>renewal deck · 5 slides</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold" style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', color: 'var(--text-strong)' }}>
            {formatCurrency(data.pricing.current)} → <span style={{ color: 'var(--clay-600)' }}>{formatCurrency(data.pricing.proposed)}</span>
          </p>
          <p className="text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: up ? 'var(--success-600)' : 'var(--danger-600)' }}>
            {up ? '▲' : '▼'} {formatCurrency(Math.abs(data.pricing.delta))}/yr
          </p>
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <Label>Slides</Label>
        <div className="grid grid-cols-2 gap-3">
          {data.slides.map((s, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[9px] font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>{String(i + 1).padStart(2, '0')}</p>
              <p className="text-[13px] font-semibold mt-0.5" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}>{s.title}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-center" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
        via Proposal agent · generated deck
      </p>
    </div>
  );
}
