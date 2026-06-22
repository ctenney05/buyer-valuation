import { useState } from 'react';
import Shell from './Shell.jsx';
import HomeTab from './HomeTab.jsx';
import DocumentsTab from './DocumentsTab.jsx';
import ROICalculatorTab from './ROICalculatorTab.jsx';
import ProposalDeckTab from './ProposalDeckTab.jsx';

// ===========================================================================
// BuyerPortal — the buyer-facing entry point of the hub.
//
// What the buyer sees for THEIR ONE renewal: Home (proposed order form, countdown,
// stakeholder-relevant content), Documents, ROI Calculator, Renewals Deck.
//
// >>> #1 INTEGRATION SEAM (read this) <<<
// The buyer portal is conceptually SINGLE-DEAL — a buyer sees only their own
// renewal. The leaf tabs read that deal's content straight from the data module
// (`data/renewalData.js`: renewal, orderForm, etc.) rather than from props. So
// the DATA-IN hookup is: populate `renewalData.js` (or the API behind it) with the
// proposal for the deal being viewed. The Proposal agent feeds `orderForm` +
// `pricingJustification` there — see lib/proposalInput.js. Do NOT prop-drill a deal
// into these tabs; swap the data module instead.
//
// PROPS
//   featureFlags  which tabs/sections show (set by the seller in PortalConfigCard).
//                 A flag === false hides; anything else shows.
//   onDecision    called when the buyer confirms a renewal — the hub's primary
//                 OUTBOUND signal. Receives { dealId, status:'renewed', selectedOption }.
//   dealId        id of the deal this portal represents (for the onDecision payload).
// ===========================================================================

const TAB_COMPONENTS = {
  'home':             HomeTab,
  'contract-history': DocumentsTab,
  'roi-calculator':   ROICalculatorTab,
  'proposal-deck':    ProposalDeckTab,
};

export default function BuyerPortal({ featureFlags = {}, onDecision, dealId = 'deal-001' }) {
  const [activeTab, setActiveTab] = useState('home');
  const [renewed, setRenewed] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);

  // If the active tab is hidden by current flags, fall back to Home.
  const tabHidden =
    (activeTab === 'roi-calculator'   && featureFlags.showROICalculator   === false) ||
    (activeTab === 'contract-history' && featureFlags.showContractHistory === false) ||
    (activeTab === 'proposal-deck'    && featureFlags.showProposalDeck    === false);
  const resolvedTab = tabHidden ? 'home' : activeTab;
  const TabComponent = TAB_COMPONENTS[resolvedTab] ?? HomeTab;

  function handleRenew() {
    setRenewed(true);
    onDecision?.({ dealId, status: 'renewed', selectedOption });
  }

  return (
    <Shell
      activeTab={resolvedTab}
      onTabChange={setActiveTab}
      onRenew={handleRenew}
      renewed={renewed}
      selectedOption={selectedOption}
      featureFlags={featureFlags}
    >
      <TabComponent
        onRenew={handleRenew}
        renewed={renewed}
        selectedOption={selectedOption}
        onOptionChange={setSelectedOption}
        featureFlags={featureFlags}
        onTabChange={setActiveTab}
      />
    </Shell>
  );
}
