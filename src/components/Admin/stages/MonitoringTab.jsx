import { Radar } from 'lucide-react';

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' };
const Label = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{children}</p>
);

export default function MonitoringTab({ deal, data }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="rounded-xl p-5 flex items-center gap-3" style={card}>
        <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--clay-100)' }}>
          <Radar className="w-5 h-5" style={{ color: 'var(--clay-600)' }} />
        </span>
        <div>
          <p className="text-[13px]" style={{ color: 'var(--text-body)' }}>Agent is watching this account — no outreach triggered yet.</p>
          <p className="mt-0.5 text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>{data.daysToRenewal}d to renewal</p>
        </div>
      </div>

      <div className="flex gap-5 items-stretch">
        {data.healthScore != null && (
          <div className="w-48 flex-shrink-0 rounded-xl p-5" style={card}>
            <Label>Usage health</Label>
            <p className="font-bold leading-none" style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', color: 'var(--text-strong)' }}>{data.healthScore}</p>
            <p className="mt-1 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>{data.usageSignal} · {data.topProduct}</p>
          </div>
        )}
        <div className="flex-1 rounded-xl p-5" style={card}>
          <Label>Watching</Label>
          <ul className="space-y-1">
            {data.watching.map((w, i) => (
              <li key={i} className="flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--text-body)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--clay-500)' }} />{w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-[10px] text-center" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>via Monitoring agent</p>
    </div>
  );
}
