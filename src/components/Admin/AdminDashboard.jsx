import { useState } from 'react';
import { adminDeals } from '../../data/adminData.js';
import { qualByDealId } from '../../data/qualificationOutput.js';
import PipelineList from './PipelineList.jsx';
import DealDetail from './DealDetail.jsx';
import SnapshotView from './SnapshotView.jsx';

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
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {logo && !imgFailed ? (
        <img
          src={logo}
          alt={name}
          onError={() => setImgFailed(true)}
          className="w-5 h-5 rounded flex-shrink-0"
          style={{ objectFit: 'contain' }}
        />
      ) : (
        <span
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono)', background: 'var(--ocean-200)', color: 'var(--ocean-600)' }}
        >
          {initials}
        </span>
      )}
      <span
        className="text-[13px] font-semibold leading-none"
        style={{ color: 'var(--text-strong)' }}
      >
        {name}
      </span>
    </div>
  );
}

export default function AdminDashboard({ onModeChange, buyerRenewed, onReset, dealFlags, onFlagChange, selectedDealId, onSelectDeal }) {
  const setSelectedDealId = onSelectDeal;
  const rawDeals = buyerRenewed
    ? adminDeals.map((d) => d.id === 'deal-001' ? { ...d, status: 'renewed', renewedDate: '2026-06-18' } : d)
    : adminDeals;
  const deals = rawDeals.map(d => ({ ...d, qualSignal: qualByDealId[d.id] ?? null }));

  const visibleDeals  = deals.filter(d => !isArchived(d));

  const sortedDeals = [...visibleDeals].sort((a, b) => {
    const aActive = a.status === 'evaluation';
    const bActive = b.status === 'evaluation';
    if (aActive !== bActive) return aActive ? -1 : 1;
    if (aActive) return a.daysToRenewal - b.daysToRenewal;
    const da = new Date(a.closedDate ?? a.renewedDate ?? a.renewalDate);
    const db = new Date(b.closedDate ?? b.renewedDate ?? b.renewalDate);
    return db - da;
  });

  // Null selection = landing state (pipeline list + snapshot). A set id opens that
  // account full-width. No fallback to [0] — the landing must be reachable.
  const selectedDeal  = selectedDealId ? sortedDeals.find((d) => d.id === selectedDealId) ?? null : null;
  // Vendor is constant across the pipeline; keep the header chip stable on the landing.
  const headerDeal    = selectedDeal ?? sortedDeals[0];

  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden', background: 'var(--surface-page)' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-20 backdrop-blur-md flex-shrink-0"
        style={{
          background: 'rgba(250,249,245,0.92)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="px-7 h-16 flex items-center gap-6">
          {/* Left: seller chip + title */}
          <div className="leading-tight flex-shrink-0">
            <div className="flex items-center gap-2.5 mb-0.5">
              <SellerChip
                name={headerDeal.vendor}
                logo={headerDeal.vendorLogo}
                initials={headerDeal.vendorInitials}
              />
              <div
                className="font-semibold tracking-[-0.01em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', color: 'var(--text-strong)' }}
              >
                Account Manager Dashboard
              </div>
            </div>
            <div
              className="uppercase"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: 'var(--text-subtle)',
              }}
            >
              Powered by Pareto Agent
            </div>
          </div>

          <div className="flex-1" />

          {/* Right: toggle + invisible Quick Renew placeholder (matches Shell layout exactly) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Segmented toggle — Seller active */}
            <div
              className="flex rounded-full overflow-hidden"
              style={{ border: '1px solid var(--border-default)' }}
            >
              <button
                onClick={onModeChange}
                className="text-xs font-medium px-4 py-1.5"
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: 'none',
                  borderRight: '1px solid var(--border-default)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-sunken)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Buyer
              </button>
              <button
                className="text-xs font-medium px-4 py-1.5"
                style={{ background: 'var(--clay-500)', color: '#fff', border: 'none', cursor: 'default' }}
              >
                Admin
              </button>
            </div>
            {/* Invisible spacer matching Confirm & Renew button width so toggle sits in same position as buyer view */}
            <div
              className="flex items-center gap-2 font-semibold text-sm px-5 py-2 rounded-full"
              style={{ visibility: 'hidden', pointerEvents: 'none' }}
              aria-hidden="true"
            >
              <div className="w-4 h-4" />
              Confirm &amp; Renew
            </div>

            {buyerRenewed && onReset && (
              <button
                onClick={onReset}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-subtle)',
                  border: '1px solid var(--border-default)',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'var(--surface-sunken)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-subtle)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ↺ Reset demo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Body — landing (list + snapshot) until an account is opened, then full-width detail */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {selectedDeal ? (
          <DealDetail
            deal={selectedDeal}
            featureFlags={dealFlags?.[selectedDeal.id] ?? {}}
            onFlagChange={(key, value) => onFlagChange?.(selectedDeal.id, key, value)}
            onBack={() => setSelectedDealId(null)}
          />
        ) : (
          <>
            <PipelineList
              deals={sortedDeals}
              selectedDealId={selectedDealId}
              onSelect={setSelectedDealId}
            />
            <SnapshotView
              deals={sortedDeals}
              today={DEMO_TODAY}
              onSelect={setSelectedDealId}
            />
          </>
        )}
      </div>

    </div>
  );
}
