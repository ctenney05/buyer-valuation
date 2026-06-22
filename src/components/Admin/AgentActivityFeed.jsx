import { useState } from 'react';
import { Zap, AlertTriangle, BarChart3, Mail, FileText } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function parseDate(str, today) {
  const m = str?.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (!m) return null;
  const i = MONTHS.indexOf(m[1]);
  return i === -1 ? null : new Date(today.getFullYear(), i, parseInt(m[2]));
}
function relative(d, today) {
  const ago = Math.round((today - d) / 86400000);
  return ago <= 0 ? 'today' : ago === 1 ? '1d' : `${ago}d`;
}

// kind → { icon, color, agent }
const KINDS = {
  transition:    { icon: Zap,           color: 'var(--clay-600)',    agent: 'Pipeline' },
  risk:          { icon: AlertTriangle, color: 'var(--danger-600)',  agent: 'Monitoring' },
  qualification: { icon: BarChart3,     color: 'var(--ocean-600)',   agent: 'Qualification' },
  outreach:      { icon: Mail,          color: 'var(--clay-600)',    agent: 'Outreach' },
  proposal:      { icon: FileText,      color: 'var(--text-subtle)', agent: 'Proposal' },
};

const FILTERS = [
  { id: 'all',        label: 'All' },
  { id: 'transition', label: 'Agent moves' },
  { id: 'risk',       label: 'Risk' },
];

function buildAgentEvents(deals, today) {
  const events = [];
  deals.forEach((deal) => {
    (deal.agentActivity ?? []).forEach((a, i) => {
      const date = parseDate(a.date, today);
      events.push({
        key: `${deal.id}-a${i}`,
        dealId: deal.id,
        company: deal.buyerCompany,
        kind: a.kind,
        text: a.text,
        date,
        ago: date ? Math.round((today - date) / 86400000) : 999,
      });
    });
  });
  return events.sort((a, b) => a.ago - b.ago);
}

export default function AgentActivityFeed({ deals, today, onSelect }) {
  const [filter, setFilter] = useState('all');
  const all = buildAgentEvents(deals, today);
  const weekCount = all.filter((e) => e.ago <= 7).length;
  const shown = filter === 'all' ? all : all.filter((e) => e.kind === filter);

  return (
    <div className="p-4">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-[18px] h-[18px] flex-shrink-0" style={{ color: 'var(--clay-600)' }} />
          <h2 className="font-bold leading-tight" style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--text-strong)' }}>
            What AI is doing
          </h2>
        </div>
        <p className="mt-1 text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
          <span style={{ color: 'var(--text-strong)', fontWeight: 600 }}>{weekCount} autonomous actions</span> this week · 0 needed you
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-3">
        {FILTERS.map((f) => {
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="rounded-full"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: on ? 600 : 400, padding: '3px 9px',
                background: on ? 'var(--clay-100)' : 'transparent',
                color: on ? 'var(--clay-700)' : 'var(--text-subtle)',
                border: on ? '1px solid var(--clay-200)' : '1px solid var(--border-subtle)', cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="text-[12px] px-1 py-4" style={{ color: 'var(--text-subtle)' }}>No agent activity.</p>
      ) : (
        <div className="space-y-1">
          {shown.map((e) => {
            const k = KINDS[e.kind] ?? KINDS.transition;
            const Icon = k.icon;
            return (
              <button
                key={e.key}
                onClick={() => onSelect?.(e.dealId)}
                className="w-full text-left p-2 rounded-lg flex items-start gap-2.5"
                style={{ background: 'transparent', cursor: 'pointer' }}
                onMouseEnter={(ev) => (ev.currentTarget.style.background = 'var(--surface-sunken)')}
                onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--surface-sunken)' }}>
                  <Icon className="w-3 h-3" style={{ color: k.color }} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="text-[11.5px] leading-snug" style={{ color: 'var(--text-body)' }}>
                    {e.text}
                  </span>
                  <span className="block mt-0.5 text-[9.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                    {k.agent} agent · {e.date ? relative(e.date, today) : ''}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
