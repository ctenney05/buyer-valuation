import { useState } from 'react';
import { adminDeals } from '../../data/adminData.js';
import { qualByDealId } from '../../data/qualificationOutput.js';
import { initDealFlags } from '../../lib/portalConfig.js';
import PipelineList from './PipelineList.jsx';
import DealDetail from './DealDetail.jsx';
import ActivityFeed from './ActivityFeed.jsx';

// ===========================================================================
// SellerDashboard — the seller-facing entry point (account-manager view).
//
// Landing = pipeline list (left, urgency-sorted) + cross-account activity feed
// (right rail). Clicking an account collapses both to a full-width deal detail
// (Buying Team / stakeholders, Portal Config, Documents) with a back affordance.
//
// Trimmed for integration: the demo Buyer/Admin mode toggle, the "Reset demo"
// button, and the buyerRenewed→deal-001 status mutation glue are GONE. The
// renewal decision now arrives cleanly as deals whose status is 'renewed' /
// 'declined' (set upstream by BuyerPortal's onDecision — see DemoApp for the wiring).
//
// PROPS (all optional — works standalone or host-controlled)
//   deals         pipeline array (default: bundled sample adminDeals).
//   today         reference "now" for archiving + the activity feed.
//   dealFlags     { [dealId]: featureFlags }. If omitted, managed internally.
//   onFlagChange  (dealId, key, value) => void. If omitted, managed internally.
// ===========================================================================

// Sample data is dated around mid-2026; this is the reference "now" for the demo.
// In production pass a real `today`.
const DEFAULT_TODAY = new Date('2026-06-19');

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
        <span
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono)', background: 'var(--ocean-200)', color: 'var(--ocean-600)' }}
        >
          {initials}
        </span>
      )}
      <span className="text-[13px] font-semibold leading-none" style={{ color: 'var(--text-strong)' }}>{name}</span>
    </div>
  );
}

export default function SellerDashboard({ deals = adminDeals, today = DEFAULT_TODAY, dealFlags, onFlagChange }) {
  const [selectedDealId, setSelectedDealId] = useState(null);

  // Uncontrolled fallback so the dashboard works standalone. When a host owns the
  // flags (to share them with BuyerPortal), it passes dealFlags + onFlagChange.
  const [internalFlags, setInternalFlags] = useState(() => initDealFlags(deals));
  const flags = dealFlags ?? internalFlags;
  const changeFlag = onFlagChange ?? ((id, key, value) =>
    setInternalFlags((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } })));

  // Attach the qualification-agent signal (drives nothing visible here; kept for
  // downstream/diagnostic use — the portal pre-config consumes it via portalConfig).
  const enriched = deals.map((d) => ({ ...d, qualSignal: qualByDealId[d.id] ?? null }));

  // Every deal is in evaluation — sort by urgency (soonest renewal first).
  const sortedDeals = [...enriched].sort((a, b) => a.daysToRenewal - b.daysToRenewal);

  // Null selection = landing. A set id opens that account full-width.
  const selectedDeal = selectedDealId ? sortedDeals.find((d) => d.id === selectedDealId) ?? null : null;
  // Vendor is constant across the pipeline; keep the header chip stable on the landing.
  const headerDeal = selectedDeal ?? sortedDeals[0];

  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden', background: 'var(--surface-page)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 backdrop-blur-md flex-shrink-0"
        style={{ background: 'rgba(250,249,245,0.92)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="px-7 h-16 flex items-center gap-6">
          <div className="leading-tight flex-shrink-0">
            <div className="flex items-center gap-2.5 mb-0.5">
              {headerDeal && <SellerChip name={headerDeal.vendor} logo={headerDeal.vendorLogo} initials={headerDeal.vendorInitials} />}
              <div className="font-semibold tracking-[-0.01em]" style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', color: 'var(--text-strong)' }}>
                Account Manager Dashboard
              </div>
            </div>
            <div className="uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-subtle)' }}>
              Powered by Pareto Agent
            </div>
          </div>
          <div className="flex-1" />
        </div>
      </header>

      {/* Body — landing (list + feed) until an account is opened, then full-width detail */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {selectedDeal ? (
          <DealDetail
            deal={selectedDeal}
            featureFlags={flags?.[selectedDeal.id] ?? {}}
            onFlagChange={(key, value) => changeFlag(selectedDeal.id, key, value)}
            onBack={() => setSelectedDealId(null)}
          />
        ) : (
          <>
            <PipelineList deals={sortedDeals} selectedDealId={selectedDealId} onSelect={setSelectedDealId} />
            <ActivityFeed deals={sortedDeals} today={today} onSelect={setSelectedDealId} />
          </>
        )}
      </div>
    </div>
  );
}
