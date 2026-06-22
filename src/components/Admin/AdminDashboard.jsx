import { useState, useEffect } from 'react';
import { adminDeals } from '../../data/adminData.js';
import { qualByDealId } from '../../data/qualificationOutput.js';
import AccountPage from './AccountPage.jsx';
import OrgDashboard from './OrgDashboard.jsx';
import StageDashboard from './StageDashboard.jsx';
import { QUARTERS, QUARTER_LABEL, assertTieOut } from '../../data/orgMetrics.js';

const CLOSED_ARCHIVE_DAYS = 60;
const DEMO_TODAY = new Date('2026-06-19');

function isArchived(deal) {
  if (deal.status !== 'renewed' && deal.status !== 'declined') return false;
  const closeDate = deal.closedDate ?? deal.renewedDate ?? deal.renewalDate;
  if (!closeDate) return false;
  const daysSince = (DEMO_TODAY - new Date(closeDate)) / 86400000;
  return daysSince > CLOSED_ARCHIVE_DAYS;
}

function SellerChip({ name, logo, initials }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div
      className="flex items-center gap-2 h-[30px] px-2.5 pl-1.5 rounded-full flex-shrink-0"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}
    >
      {logo && !imgFailed ? (
        <img src={logo} alt={name} onError={() => setImgFailed(true)} className="w-5 h-5 rounded flex-shrink-0" style={{ objectFit: 'contain' }} />
      ) : (
        <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono)', background: 'var(--ocean-200)', color: 'var(--ocean-600)' }}>
          {initials}
        </span>
      )}
      <span className="text-[13px] font-semibold leading-none" style={{ color: 'var(--text-strong)' }}>{name}</span>
    </div>
  );
}

function QuarterPill({ quarter, onChange }) {
  return (
    <div className="flex rounded-full overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
      {QUARTERS.map((q, i) => {
        const on = q === quarter;
        return (
          <button key={q} onClick={() => onChange(q)} className="text-[11px] font-semibold px-3 py-1.5"
            style={{
              fontFamily: 'var(--font-mono)',
              background: on ? 'var(--clay-500)' : 'transparent',
              color: on ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRight: i < QUARTERS.length - 1 ? '1px solid var(--border-default)' : 'none',
              cursor: 'pointer',
            }}>
            {q}
          </button>
        );
      })}
    </div>
  );
}

function Crumb({ label, onClick, current }) {
  if (current) {
    return <span className="font-bold" style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', color: 'var(--text-strong)' }}>{label}</span>;
  }
  return (
    <button onClick={onClick} className="font-semibold" style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', color: 'var(--text-subtle)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--clay-600)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}>
      {label}
    </button>
  );
}

const Sep = () => <span style={{ color: 'var(--border-default)', fontSize: '16px' }}>›</span>;

export default function AdminDashboard({ onModeChange, buyerRenewed, onReset, dealFlags, onFlagChange, selectedDealId, onSelectDeal }) {
  const setSelectedDealId = onSelectDeal;
  const [selectedStage, setSelectedStage] = useState(null);
  const [quarter, setQuarter] = useState('Q2');

  const rawDeals = buyerRenewed
    ? adminDeals.map((d) => d.id === 'deal-001' ? { ...d, status: 'renewed', renewedDate: '2026-06-18' } : d)
    : adminDeals;
  const deals = rawDeals.map((d) => ({ ...d, qualSignal: qualByDealId[d.id] ?? null }));
  const visibleDeals = deals.filter((d) => !isArchived(d));

  // Dev-only: numbers must reconcile across the three levels.
  useEffect(() => { assertTieOut(visibleDeals); }, [buyerRenewed]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedDeal = selectedDealId ? visibleDeals.find((d) => d.id === selectedDealId) ?? null : null;
  const headerDeal = visibleDeals[0];
  const view = selectedDeal ? 'account' : selectedStage ? 'stage' : 'org';

  function changeQuarter(q) { setQuarter(q); setSelectedStage(null); setSelectedDealId(null); }
  function goOrg() { setSelectedStage(null); setSelectedDealId(null); }

  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden', background: 'var(--surface-page)' }}>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md flex-shrink-0"
        style={{ background: 'rgba(250,249,245,0.92)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="px-7 h-16 flex items-center gap-6">
          {/* Left: brand chip + breadcrumb/title */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <SellerChip name={headerDeal.vendor} logo={headerDeal.vendorLogo} initials={headerDeal.vendorInitials} />
            {view === 'org' ? (
              <div className="leading-tight">
                <div className="font-semibold tracking-[-0.01em]" style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', color: 'var(--text-strong)' }}>
                  Renewals Pipeline
                </div>
                <div className="uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-subtle)' }}>
                  Powered by Pareto Agent
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Crumb label="Renewals" onClick={goOrg} />
                <Sep />
                <Crumb label={QUARTER_LABEL[quarter]} onClick={goOrg} />
                {selectedStage && (
                  <>
                    <Sep />
                    <Crumb label={selectedStage} onClick={() => setSelectedDealId(null)} current={view === 'stage'} />
                  </>
                )}
                {selectedDeal && (
                  <>
                    <Sep />
                    <Crumb label={selectedDeal.buyerCompany} current />
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Right: quarter pill + mode toggle */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {view !== 'account' && <QuarterPill quarter={quarter} onChange={changeQuarter} />}
            <div className="flex rounded-full overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
              <button onClick={onModeChange} className="text-xs font-medium px-4 py-1.5"
                style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', borderRight: '1px solid var(--border-default)', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-sunken)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                Buyer
              </button>
              <button className="text-xs font-medium px-4 py-1.5" style={{ background: 'var(--clay-500)', color: '#fff', border: 'none', cursor: 'default' }}>
                Admin
              </button>
            </div>
            {buyerRenewed && onReset && (
              <button onClick={onReset} className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--surface-sunken)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-subtle)'; e.currentTarget.style.background = 'transparent'; }}>
                ↺ Reset demo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Body — org → stage → account */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {view === 'account' ? (
          <AccountPage
            deal={selectedDeal}
            featureFlags={dealFlags?.[selectedDeal.id] ?? {}}
            onFlagChange={(key, value) => onFlagChange?.(selectedDeal.id, key, value)}
            onBack={() => setSelectedDealId(null)}
            backLabel={selectedStage ? `Back to ${selectedStage}` : 'Back to overview'}
          />
        ) : view === 'stage' ? (
          <StageDashboard
            deals={visibleDeals}
            quarter={quarter}
            stage={selectedStage}
            selectedDealId={selectedDealId}
            onSelectStage={setSelectedStage}
            onSelectDeal={setSelectedDealId}
          />
        ) : (
          <OrgDashboard
            deals={visibleDeals}
            quarter={quarter}
            today={DEMO_TODAY}
            selectedDealId={selectedDealId}
            onSelectStage={setSelectedStage}
            onSelectDeal={setSelectedDealId}
          />
        )}
      </div>

    </div>
  );
}
