import { useState } from 'react';
import { adminDeals } from '../../data/adminData.js';
import PipelineList from './PipelineList.jsx';
import DealDetail from './DealDetail.jsx';

function getBucket(deal) {
  if (deal.status === 'renewed' || deal.status === 'declined') return 'closed';
  if (deal.chatMessages > 0 || deal.portalViews >= 4) return 'engaged';
  if (deal.portalViews < 2 && deal.daysToRenewal <= 30) return 'at-risk';
  return 'monitoring';
}

const BUCKETS = [
  { key: 'at-risk',    label: 'At Risk',    color: '#EF4444' },
  { key: 'monitoring', label: 'Monitoring', color: '#F59E0B' },
  { key: 'engaged',    label: 'Engaged',    color: '#22C55E' },
  { key: 'closed',     label: 'Closed',     color: 'var(--text-subtle)' },
];

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

export default function AdminDashboard({ onModeChange, buyerRenewed, onReset }) {
  const [selectedDealId, setSelectedDealId] = useState('deal-001');
  const deals = buyerRenewed
    ? adminDeals.map((d) => d.id === 'deal-001' ? { ...d, status: 'renewed', renewedDate: '2026-06-18' } : d)
    : adminDeals;
  const selectedDeal = deals.find((d) => d.id === selectedDealId) ?? deals[0];

  const bucketCounts = { 'at-risk': 0, monitoring: 0, engaged: 0, closed: 0 };
  deals.forEach(d => { bucketCounts[getBucket(d)]++; });
  const flags = deals.filter(d =>
    d.status === 'evaluation' && d.daysToRenewal <= 30 && d.portalViews < 2
  );

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
                name={selectedDeal.vendor}
                logo={selectedDeal.vendorLogo}
                initials={selectedDeal.vendorInitials}
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

      {/* Body */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        <PipelineList
          deals={deals}
          selectedDealId={selectedDealId}
          onSelect={setSelectedDealId}
        />
        <DealDetail
          deal={selectedDeal}
          bucketCounts={bucketCounts}
          flags={flags}
          onSelect={setSelectedDealId}
        />
      </div>

    </div>
  );
}
