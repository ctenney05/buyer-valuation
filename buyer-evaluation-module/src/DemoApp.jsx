import { useState } from 'react';
import BuyerPortal from './components/buyer/BuyerPortal.jsx';
import SellerDashboard from './components/seller/SellerDashboard.jsx';
import { adminDeals } from './data/adminData.js';
import { initDealFlags } from './lib/portalConfig.js';

// ===========================================================================
// DemoApp — STANDALONE TEST HARNESS. *Not* part of the shippable module.
//
// It exists only to run both sections side by side and demonstrate the data
// flow that a host (the combined dashboard) would otherwise own:
//   - shares one `dealFlags` map so PortalConfig edits in the seller view change
//     what the buyer portal shows (the portal-config signal, IN→buyer);
//   - turns the buyer's renewal decision (BuyerPortal `onDecision`) into a deal
//     status change the seller pipeline reflects (the decision signal, OUT);
//   - logs the normalized OUT payload (getBuyerSignals) to the console.
//
// The view switch is a harness affordance — drop it (and this file) when mounting
// the real BuyerPortal / SellerDashboard into the combined dashboard.
// ===========================================================================

const BUYER_DEAL_ID = 'deal-001'; // the deal the buyer portal represents

export default function DemoApp() {
  const [view, setView] = useState('seller');
  const [dealFlags, setDealFlags] = useState(() => initDealFlags(adminDeals));

  function handleFlagChange(dealId, key, value) {
    setDealFlags((prev) => ({ ...prev, [dealId]: { ...prev[dealId], [key]: value } }));
  }

  function handleDecision(decision) {
    // OUT signal: the buyer confirmed a renewal. The host forwards this event
    // downstream. (No terminal deal-status state machine — see signals.js.)
    console.log('[buyer-eval OUT] decision event:', decision);
  }

  return (
    <>
      {/* Harness-only view switch — bottom-right so it never overlaps either
          header's controls (notably the buyer's Confirm & Renew button). */}
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, display: 'flex', borderRadius: 9999, overflow: 'hidden', border: '1px solid var(--border-default)', background: 'var(--surface-card)', boxShadow: 'var(--shadow-sm)' }}>
        {['buyer', 'seller'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
              padding: '5px 14px', border: 'none', cursor: 'pointer',
              background: view === v ? 'var(--clay-500)' : 'transparent',
              color: view === v ? '#fff' : 'var(--text-muted)',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'buyer' ? (
        <BuyerPortal
          dealId={BUYER_DEAL_ID}
          featureFlags={dealFlags[BUYER_DEAL_ID] ?? {}}
          onDecision={handleDecision}
        />
      ) : (
        <SellerDashboard
          deals={adminDeals}
          dealFlags={dealFlags}
          onFlagChange={handleFlagChange}
        />
      )}
    </>
  );
}
