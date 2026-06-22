import { Check, Clock, X, PenLine } from 'lucide-react';

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' };
const Label = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{children}</p>
);
const STATUS_ICON = { Complete: Check, 'In Progress': Clock, 'Not Started': Clock, Blocked: X };
const STATUS_COLOR = { Complete: 'var(--success-600)', 'In Progress': 'var(--clay-600)', 'Not Started': 'var(--text-subtle)', Blocked: 'var(--danger-600)' };
const OUTCOME = {
  signed: { label: 'Renewal signed', color: 'var(--success-600)', bg: 'var(--success-100)' },
  declined: { label: 'Declined', color: 'var(--danger-600)', bg: 'var(--danger-100)' },
  pending: { label: 'In progress', color: 'var(--clay-600)', bg: 'var(--clay-100)' },
};

export default function RenewalTab({ deal, data }) {
  const o = OUTCOME[data.outcome] ?? OUTCOME.pending;
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="rounded-xl p-5 flex items-center gap-3" style={card}>
        <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: o.bg }}>
          <PenLine className="w-5 h-5" style={{ color: o.color }} />
        </span>
        <div>
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ fontFamily: 'var(--font-mono)', background: o.bg, color: o.color }}>{o.label}</span>
          {data.signedDate && <p className="mt-1 text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>signed {data.signedDate}</p>}
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <Label>Closing checklist</Label>
        <div className="grid grid-cols-2 gap-3">
          {data.checklist.map((c) => {
            const Icon = STATUS_ICON[c.status] ?? Clock;
            return (
              <div key={c.item} className="flex items-center gap-2.5 rounded-lg p-3" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}>
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: STATUS_COLOR[c.status] }} />
                <div>
                  <p className="text-[12.5px] font-semibold" style={{ color: 'var(--text-strong)' }}>{c.item}</p>
                  <p className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: STATUS_COLOR[c.status] }}>{c.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
