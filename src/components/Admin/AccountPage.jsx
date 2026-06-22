import { useState, Fragment } from 'react';
import { ChevronLeft, Check, Lock, BarChart3, Mail, FileText, Users, PenLine } from 'lucide-react';
import DealDetail, { CountdownBox } from './DealDetail.jsx';

const cardStyle = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  boxShadow: 'var(--shadow-sm)',
};

// The buyer-journey pipeline stages. Each is a tab on the account page; the
// Buyer Evaluation stage renders the live DealDetail module, the rest are
// placeholders for the modules that will plug in here (qualification / outreach /
// proposal owned by the other agents).
const STAGES = [
  { id: 'qualification', label: 'Qualification',    icon: BarChart3, owner: 'Qualification agent',     desc: 'Account scoring, renewal-risk signals, and the recommended renewal plan render here.' },
  { id: 'outreach',      label: 'Outreach',         icon: Mail,      owner: 'Outreach agent',          desc: 'Email drafting and the draft → sent → waiting → engaged lifecycle render here.' },
  { id: 'proposal',      label: 'Proposal',         icon: FileText,  owner: 'Proposal agent',          desc: 'The generated renewal deck and pricing story render here.' },
  { id: 'evaluation',    label: 'Buyer Evaluation', icon: Users,     owner: 'Buyer Evaluation module', desc: '' },
  { id: 'renewal',       label: 'Renewal',          icon: PenLine,   owner: 'Decision & signature',    desc: 'Closes out when the buyer signs the renewal.' },
];

const STAGE_INDEX = { Qualification: 0, Outreach: 1, Proposal: 2, 'Buyer Evaluation': 3, Renewal: 4 };

function currentStageIdx(deal) {
  if (deal.status === 'renewed' || deal.status === 'declined') return 4;
  return STAGE_INDEX[deal.stage] ?? 3;
}

function AccountLogo({ deal }) {
  const [failed, setFailed] = useState(false);
  if (failed || !deal.domain) {
    return (
      <span
        className="w-11 h-11 rounded-lg flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
        style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-sunken)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
      >
        {deal.buyerInitials}
      </span>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=128&domain_url=https://${deal.domain}`}
      alt={deal.buyerCompany}
      onError={() => setFailed(true)}
      className="w-11 h-11 rounded-lg flex-shrink-0"
      style={{ border: '1px solid var(--border-subtle)', objectFit: 'contain', background: '#fff', padding: '5px' }}
    />
  );
}

function StagePlaceholder({ stage, completed }) {
  const Icon = stage.icon;
  return (
    <div className="max-w-xl mx-auto mt-10 rounded-xl p-8 text-center" style={cardStyle}>
      <span
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'var(--clay-100)' }}
      >
        <Icon className="w-5 h-5" style={{ color: 'var(--clay-600)' }} />
      </span>
      <h3 className="font-bold" style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--text-strong)' }}>
        {stage.label}
      </h3>
      <p className="mt-1 text-[11px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
        {stage.owner}
      </p>
      <p className="mt-4 text-[13px] leading-relaxed mx-auto" style={{ color: 'var(--text-body)', maxWidth: '34ch' }}>
        {stage.desc}
      </p>
      <div className="mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
        style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: completed ? 'var(--success-600)' : 'var(--text-subtle)' }} />
        <span className="text-[10.5px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {completed ? 'Completed — module integrates here' : 'Upcoming — module integrates here'}
        </span>
      </div>
    </div>
  );
}

export default function AccountPage({ deal, featureFlags, onFlagChange, onBack }) {
  const currentIdx = currentStageIdx(deal);
  const [activeId, setActiveId] = useState(STAGES[currentIdx].id);
  const activeIdx = STAGES.findIndex((s) => s.id === activeId);
  const activeStage = STAGES[activeIdx];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ---- Top chrome: back + identity + stage timeline (fixed) ---- */}
      <div className="flex-shrink-0 px-6 pt-4" style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--surface-page)' }}>
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mb-3"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-subtle)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--clay-600)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to pipeline
        </button>

        {/* Identity */}
        <div className="flex items-center gap-3.5 mb-4">
          <AccountLogo deal={deal} />
          <div className="flex-shrink-0">
            <h2 className="font-bold leading-tight" style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--text-strong)' }}>
              {deal.buyerCompany}
            </h2>
            <p className="text-[12px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
              {deal.vendor}
            </p>
          </div>
          <div className="flex-1 min-w-0 mx-4">
            <CountdownBox deal={deal} />
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold" style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--clay-600)' }}>
              ${deal.annualValue.toLocaleString()}/yr
            </p>
            <p className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
              annual value
            </p>
          </div>
        </div>

        {/* Stage timeline — doubles as the tab bar */}
        <div className="flex items-center">
          {STAGES.map((s, i) => {
            const done = i < currentIdx;
            const current = i === currentIdx;
            const locked = i > currentIdx;
            const active = i === activeIdx;
            const Icon = s.icon;
            const accent = done || current ? 'var(--clay-600)' : 'var(--text-subtle)';
            return (
              <Fragment key={s.id}>
                <button
                  onClick={() => !locked && setActiveId(s.id)}
                  disabled={locked}
                  className="flex items-center gap-2 rounded-t-lg px-2.5 pt-1.5 pb-2.5 flex-shrink-0"
                  style={{
                    cursor: locked ? 'default' : 'pointer',
                    background: active ? 'var(--surface-card)' : 'transparent',
                    borderBottom: active ? '2px solid var(--clay-500)' : '2px solid transparent',
                    opacity: locked ? 0.45 : 1,
                    marginBottom: '-1px',
                  }}
                  title={locked ? `${s.label} — upcoming` : s.label}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: current ? 'var(--clay-500)' : done ? 'var(--clay-100)' : 'var(--surface-sunken)',
                      border: current ? 'none' : `1px solid ${done ? 'var(--clay-200)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {done
                      ? <Check className="w-3 h-3" style={{ color: 'var(--clay-600)' }} />
                      : locked
                        ? <Lock className="w-2.5 h-2.5" style={{ color: 'var(--text-subtle)' }} />
                        : <Icon className="w-3 h-3" style={{ color: '#fff' }} />}
                  </span>
                  <span
                    className="text-[11px] font-semibold whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-mono)', color: active ? 'var(--clay-700)' : accent }}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STAGES.length - 1 && (
                  <div className="flex-1 h-px mx-1.5" style={{ background: i < currentIdx ? 'var(--clay-200)' : 'var(--border-default)' }} />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* ---- Active stage panel ---- */}
      {activeId === 'evaluation' ? (
        <DealDetail deal={deal} featureFlags={featureFlags} onFlagChange={onFlagChange} embedded />
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <StagePlaceholder stage={activeStage} completed={activeIdx < currentIdx} />
        </div>
      )}

    </div>
  );
}
