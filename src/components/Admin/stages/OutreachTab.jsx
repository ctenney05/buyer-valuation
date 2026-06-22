import { Fragment } from 'react';
import { Check, Sparkles } from 'lucide-react';

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' };
const Label = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{children}</p>
);
const STEPS = ['draft', 'sent', 'waiting', 'engaged'];

function Lifecycle({ current }) {
  const curIdx = STEPS.indexOf(current);
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i < curIdx, active = i === curIdx;
        return (
          <Fragment key={s}>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: active ? 'var(--clay-500)' : done ? 'var(--clay-100)' : 'var(--surface-sunken)', border: active ? 'none' : `1px solid ${done ? 'var(--clay-200)' : 'var(--border-subtle)'}` }}>
                {done ? <Check className="w-3 h-3" style={{ color: 'var(--clay-600)' }} /> : <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? '#fff' : 'var(--text-subtle)' }} />}
              </span>
              <span className="text-[11px] font-semibold capitalize" style={{ fontFamily: 'var(--font-mono)', color: active ? 'var(--clay-700)' : done ? 'var(--text-muted)' : 'var(--text-subtle)' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px mx-2" style={{ background: i < curIdx ? 'var(--clay-200)' : 'var(--border-default)' }} />}
          </Fragment>
        );
      })}
    </div>
  );
}

const SENT_COLOR = { positive: 'var(--success-600)', neutral: 'var(--text-subtle)', negative: 'var(--danger-600)' };

export default function OutreachTab({ deal, data }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Lifecycle */}
      <div className="rounded-xl p-5" style={card}>
        <Label>Outreach lifecycle</Label>
        <Lifecycle current={data.outreachStage} />
        <p className="mt-3 text-[11.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>{data.nextAction}</p>
      </div>

      {/* AI recommendation */}
      <div className="rounded-xl p-5" style={{ ...card, background: 'var(--clay-100)', borderColor: 'var(--clay-200)' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--clay-600)' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--clay-700)' }}>{data.recommendation.headline}</span>
        </div>
        <p className="text-[12.5px] italic" style={{ color: 'var(--text-body)' }}>“{data.recommendation.draftReply}”</p>
      </div>

      {/* Email thread */}
      <div className="rounded-xl p-5" style={card}>
        <Label>Email thread</Label>
        <div className="space-y-3">
          {data.thread.map((e, i) => {
            const out = e.direction === 'outbound';
            return (
              <div key={i} className={`flex ${out ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[82%] rounded-xl px-3.5 py-2.5" style={{ background: out ? 'var(--clay-100)' : 'var(--surface-sunken)', border: `1px solid ${out ? 'var(--clay-200)' : 'var(--border-subtle)'}` }}>
                  <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--text-strong)' }}>{e.subject}</p>
                  <p className="text-[12px] leading-snug" style={{ color: 'var(--text-body)' }}>{e.body}</p>
                  <p className="mt-1 text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                    {out ? (e.origin === 'ai_automated' ? 'AI · auto-sent' : e.origin === 'ai_drafted' ? 'AI · drafted' : 'Outbound') : 'Buyer'}
                  </p>
                  {e.analysis && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-card)', color: SENT_COLOR[e.analysis.sentiment] ?? 'var(--text-subtle)', border: '1px solid var(--border-subtle)' }}>{e.analysis.sentiment}</span>
                      {e.analysis.buyingSignals?.map((b, j) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-card)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>{b}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stakeholders + style guide */}
      <div className="flex gap-5 items-stretch">
        <div className="flex-1 rounded-xl p-5" style={card}>
          <Label>Buying team</Label>
          <div className="flex flex-wrap gap-1.5">
            {data.org.length ? data.org.map((o, i) => (
              <span key={i} className="text-[10.5px] font-semibold px-2 py-1 rounded-full" style={{ fontFamily: 'var(--font-mono)', background: o.champion ? 'var(--clay-100)' : 'var(--surface-sunken)', color: o.champion ? 'var(--clay-700)' : 'var(--text-muted)', border: `1px solid ${o.champion ? 'var(--clay-200)' : 'var(--border-subtle)'}` }}>
                {o.name} · {o.role}
              </span>
            )) : <span className="text-[12px]" style={{ color: 'var(--text-subtle)' }}>No stakeholders mapped.</span>}
          </div>
        </div>
        <div className="w-64 flex-shrink-0 rounded-xl p-5" style={card}>
          <Label>Style guide</Label>
          <p className="text-[11.5px]" style={{ color: 'var(--text-body)' }}>{data.styleGuide.formality} · {data.styleGuide.tone}</p>
          <ul className="mt-1.5 space-y-0.5">
            {data.styleGuide.dosDonts.map((d, i) => (
              <li key={i} className="text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>· {d}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-[10px] text-center" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
        via Outreach agent · Client contract
      </p>
    </div>
  );
}
