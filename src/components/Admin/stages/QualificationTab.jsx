import { BarChart3, Target, AlertTriangle, Quote } from 'lucide-react';

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' };
const Label = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{children}</p>
);

export default function QualificationTab({ deal, data }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Signal */}
      <div className="rounded-xl p-5" style={card}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--clay-100)' }}>
              <BarChart3 className="w-5 h-5" style={{ color: 'var(--clay-600)' }} />
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: 'var(--surface-sunken)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: data.signalColor }} />
                <span className="text-[11px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: data.signalColor }}>{data.signalLabel}</span>
              </span>
              <p className="mt-1 text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                urgency {data.urgency} · tone {data.tone}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold" style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: data.projection_multiplier >= 1 ? 'var(--success-600)' : 'var(--danger-600)' }}>
              ×{data.projection_multiplier.toFixed(2)}
            </p>
            <p className="text-[9.5px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>projection</p>
          </div>
        </div>
      </div>

      {/* Recommended action */}
      <div className="rounded-xl p-5" style={card}>
        <Label>Recommended action</Label>
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--clay-600)' }} />
          <p className="text-[14px]" style={{ color: 'var(--text-body)' }}>{data.recommended_action}</p>
        </div>
      </div>

      {/* Reasons + usage health */}
      <div className="flex gap-5 items-stretch">
        <div className="flex-1 rounded-xl p-5" style={card}>
          <Label>Signals</Label>
          <ul className="space-y-1.5">
            {data.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px]" style={{ color: 'var(--text-body)' }}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-subtle)' }} />
                {r}
              </li>
            ))}
          </ul>
        </div>
        {data.usageHealth && (
          <div className="w-56 flex-shrink-0 rounded-xl p-5" style={card}>
            <Label>Usage health</Label>
            <p className="font-bold leading-none" style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', color: 'var(--text-strong)' }}>{data.usageHealth.score}</p>
            <p className="mt-1 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>{data.usageHealth.signal} · {data.usageHealth.topProduct}</p>
          </div>
        )}
      </div>

      {/* Champion + quotes */}
      <div className="rounded-xl p-5" style={card}>
        <Label>Champion</Label>
        {data.champion ? (
          <p className="text-[13px]" style={{ color: 'var(--text-body)' }}>
            <span className="font-semibold">{data.champion.name}</span> · {data.champion.role}
            {data.champion.confidence && <span style={{ color: 'var(--text-subtle)' }}> · {data.champion.confidence} confidence</span>}
          </p>
        ) : <p className="text-[12px]" style={{ color: 'var(--text-subtle)' }}>No champion identified.</p>}
        {data.quotes.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.quotes.map((q, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg p-3" style={{ background: 'var(--surface-sunken)' }}>
                <Quote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--clay-600)' }} />
                <div>
                  <p className="text-[12.5px] italic" style={{ color: 'var(--text-body)' }}>“{q.text}”</p>
                  <p className="mt-1 text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>{q.source}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-center" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
        via Qualification agent · HandoffPacket {data.schema_version}
      </p>
    </div>
  );
}
