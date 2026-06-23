import { useState } from 'react';
import { adminDeals } from './data/adminData.js';
import { initDealFlags } from './lib/portalConfig.js';
import DealDetail from './components/seller/DealDetail.jsx';

// ===========================================================================
// AccountPage — the unified account-page shell (the CRM-replacement view).
//
// One account, a tab per pipeline STAGE, and the active tab renders that stage's
// module. Buyer Evaluation (Cooper) is wired LIVE via the embedded DealDetail;
// the other four stages are placeholder panels — each teammate slots their own
// mountable component into one `Component:` slot below.
//
// THE INTEGRATION CONTRACT (per stage):
//   1. A single mountable React component that takes the shared `account` (deal).
//   2. Its own data-in / data-out contract (see buyer-eval's lib/signals.js +
//      lib/proposalInput.js as the reference).
//   3. The shared design tokens (src/index.css) so every tab looks like one app.
//
// Stages share ONE account object (the journey timeline): each module reads its
// inputs from it and writes its outputs back. Swap `adminDeals[0]` for whichever
// account the page is showing.
// ===========================================================================

const STAGES = [
  { id: 'qual',      label: 'Qual',       owner: 'Qualification',     who: 'Aaron', summary: 'Account scoring · renewal plan · usage health' },
  { id: 'outreach',  label: 'Outreach',   owner: 'Outreach',          who: 'Parth', summary: 'Renewal emails · sequencing · comps tracking' },
  { id: 'proposal',  label: 'Proposal',   owner: 'Proposal',          who: 'Dean',  summary: 'Tailored deck · pricing justification by story type' },
  { id: 'buyerEval', label: 'Buyer Eval', owner: 'Buyer Evaluation',  who: 'Cooper', summary: 'Countdown · buying-team engagement · portal config · documents', live: true },
  { id: 'negotiated', label: 'Negotiated', owner: 'Negotiation',       who: '—',     summary: 'Final terms · redlines · pricing agreement' },
  { id: 'closed',     label: 'Closed',     owner: 'Closed',            who: '—',     summary: 'Signed agreement · DocuSign · post-renewal handoff' },
];

function daysColor(days) {
  if (days > 90)  return { fg: 'var(--success-600)', track: 'var(--success-600)', word: 'On track'      };
  if (days >= 30) return { fg: 'var(--clay-600)',    track: 'var(--clay-600)',    word: 'Action needed' };
  return            { fg: 'var(--danger-600)',   track: 'var(--danger-600)',   word: 'Closing soon'  };
}

// Shared account header — account chip + countdown bar + ACV (matches the mockup).
function AccountHeader({ deal }) {
  const c = daysColor(deal.daysToRenewal);
  // Elapsed fraction of the (assumed 1-year) term, for the progress bar.
  const renewal = new Date(deal.renewalDate);
  const start = new Date(renewal); start.setFullYear(start.getFullYear() - 1);
  const total = Math.ceil((renewal - start) / 86400000);
  const pct = Math.min(100, Math.max(3, ((total - deal.daysToRenewal) / total) * 100));

  return (
    <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Account chip */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {deal.domain && (
          <img
            src={`https://www.google.com/s2/favicons?sz=128&domain_url=https://${deal.domain}`}
            alt={deal.buyerCompany}
            className="w-9 h-9 rounded-lg" style={{ border: '1px solid var(--border-subtle)', objectFit: 'contain', background: '#fff' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className="leading-tight">
          <div className="font-bold" style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', color: 'var(--text-strong)' }}>{deal.buyerCompany}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-subtle)' }}>{deal.vendor}</div>
        </div>
      </div>

      {/* Countdown bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-semibold" style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: c.fg }}>
            {Math.max(0, deal.daysToRenewal)} <span className="text-[12px] font-normal" style={{ color: 'var(--ink-700)' }}>days</span>
          </span>
          <span className="uppercase tracking-widest font-semibold" style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: c.fg }}>{c.word}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(20,20,19,0.07)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.track }} />
        </div>
      </div>

      {/* ACV */}
      <div className="flex-shrink-0 text-right">
        <p className="font-bold" style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--clay-600)' }}>
          ${deal.annualValue.toLocaleString()}/yr
        </p>
      </div>
    </div>
  );
}

function StageTabs({ stages, active, onSelect }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {stages.map((s) => {
        const on = s.id === active;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="flex items-center gap-2 rounded-lg px-3.5 py-2"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
              background: on ? 'var(--clay-100)' : 'var(--surface-card)',
              color:      on ? 'var(--clay-700)' : 'var(--text-muted)',
              border: `1px solid ${on ? 'var(--clay-400)' : 'var(--border-default)'}`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: on ? 'var(--clay-500)' : (s.live ? 'var(--success-600)' : 'var(--border-strong)') }} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// Placeholder for a stage another teammate owns — shows where their module mounts.
function StagePlaceholder({ stage }) {
  return (
    <div className="rounded-xl p-10 flex flex-col items-center justify-center text-center" style={{ background: 'var(--surface-card)', border: '1px dashed var(--border-strong)' }}>
      <span className="uppercase tracking-widest font-semibold mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)' }}>
        {stage.owner} module · {stage.who}
      </span>
      <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-strong)' }}>
        Mounts here
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', maxWidth: 460, lineHeight: 1.5 }}>
        {stage.summary}
      </p>
      <p className="mt-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-subtle)', maxWidth: 460, lineHeight: 1.5 }}>
        Replace this panel with {stage.who}'s mountable component:
        <br />
        <code style={{ color: 'var(--clay-700)' }}>{`<${stage.owner.replace(/\s/g, '')}Module account={account} />`}</code>
      </p>
    </div>
  );
}

export default function AccountPage() {
  // The account this page is showing. Swap for a real lookup / route param.
  const account = adminDeals[0]; // deal-001 (Uber × LeanData)
  const [stage, setStage] = useState('buyerEval');
  const [dealFlags, setDealFlags] = useState(() => initDealFlags(adminDeals));

  const activeStage = STAGES.find((s) => s.id === stage);

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-page)' }}>
      <div className="max-w-[1100px] mx-auto px-7 py-7">

        {/* Page label */}
        <div className="mb-4">
          <p className="uppercase tracking-widest font-semibold" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--clay-600)' }}>
            Account
          </p>
          <h1 className="font-bold" style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--text-strong)' }}>
            Account page
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-subtle)' }}>
            One account · the journey timeline + a tab per stage · the CRM-replacement view
          </p>
        </div>

        <AccountHeader deal={account} />

        <div className="my-5">
          <StageTabs stages={STAGES} active={stage} onSelect={setStage} />
        </div>

        {/* Active-stage banner */}
        <div className="mb-3 flex items-baseline gap-3">
          <span className="uppercase tracking-widest font-semibold" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--clay-600)' }}>
            Active tab · {activeStage.who}'s module
          </span>
          <span className="font-bold" style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--text-strong)' }}>
            {activeStage.owner}
          </span>
        </div>

        {/* Active-stage content */}
        {stage === 'buyerEval' ? (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-card)' }}>
            <DealDetail
              deal={account}
              featureFlags={dealFlags[account.id] ?? {}}
              onFlagChange={(key, value) => setDealFlags((p) => ({ ...p, [account.id]: { ...p[account.id], [key]: value } }))}
              embedded
            />
          </div>
        ) : (
          <StagePlaceholder stage={activeStage} />
        )}

      </div>
    </div>
  );
}
