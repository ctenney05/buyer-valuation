import { useState, useEffect, useRef } from 'react';
import Shell from './components/Shell.jsx';
import HomeTab from './components/Home/HomeTab.jsx';
import DocumentsTab from './components/ContractHistory/ContractHistoryTab.jsx';
import ROICalculatorTab from './components/ROICalculator/ROICalculatorTab.jsx';
import ProposalDeckTab from './components/ProposalDeck/ProposalDeckTab.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import { adminDeals } from './data/adminData.js';
import { qualByDealId } from './data/qualificationOutput.js';

// Portal config defaults derived from qualification agent accountType.
// Changing a toggle in DealDetail overrides these — it only sets initial state.
const FLAG_DEFAULTS = {
  upsell:   { showUsageData: true,  showROICalculator: true,  showContractHistory: true,  showProposalDeck: true,  showHighlights: false },
  flat:     { showUsageData: false, showROICalculator: true,  showContractHistory: true,  showProposalDeck: true,  showHighlights: true  },
  downsell: { showUsageData: false, showROICalculator: false, showContractHistory: true,  showProposalDeck: false, showHighlights: true  },
};

const TAB_COMPONENTS = {
  'home':             HomeTab,
  'contract-history': DocumentsTab,
  'roi-calculator':   ROICalculatorTab,
  'proposal-deck':    ProposalDeckTab,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [mode, setMode] = useState('buyer');
  const [buyerRenewed, setBuyerRenewed] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [dealFlags, setDealFlags] = useState(() =>
    Object.fromEntries(adminDeals.map((d) => {
      const qual = qualByDealId[d.id];
      const typeDefaults = FLAG_DEFAULTS[qual?.accountType] ?? {};
      return [d.id, { ...d.featureFlags, ...typeDefaults }];
    }))
  );
  const buyerScrollRef = useRef(0);

  useEffect(() => {
    if (mode === 'buyer') {
      window.scrollTo(0, buyerScrollRef.current);
    }
  }, [mode]);

  function handleFlagChange(dealId, key, value) {
    setDealFlags((prev) => ({ ...prev, [dealId]: { ...prev[dealId], [key]: value } }));
  }

  const buyerFlags = dealFlags['deal-001'] ?? {};

  // Reset to home if the active tab is hidden by current flags
  const tabHidden =
    (activeTab === 'roi-calculator'   && buyerFlags.showROICalculator   === false) ||
    (activeTab === 'contract-history' && buyerFlags.showContractHistory === false) ||
    (activeTab === 'proposal-deck'    && buyerFlags.showProposalDeck    === false);
  const resolvedTab = tabHidden ? 'home' : activeTab;
  const TabComponent = TAB_COMPONENTS[resolvedTab] ?? HomeTab;

  if (mode === 'admin') {
    return (
      <AdminDashboard
        onModeChange={() => setMode('buyer')}
        buyerRenewed={buyerRenewed}
        onReset={() => setBuyerRenewed(false)}
        dealFlags={dealFlags}
        onFlagChange={handleFlagChange}
        selectedDealId={selectedDealId}
        onSelectDeal={setSelectedDealId}
      />
    );
  }

  return (
    <Shell
      activeTab={resolvedTab}
      onTabChange={(tab) => setActiveTab(tab)}
      onModeChange={() => { buyerScrollRef.current = window.scrollY; setMode('admin'); }}
      onRenew={() => setBuyerRenewed(true)}
      renewed={buyerRenewed}
      selectedOption={selectedOption}
      featureFlags={buyerFlags}
    >
      <TabComponent
        onRenew={() => setBuyerRenewed(true)}
        renewed={buyerRenewed}
        selectedOption={selectedOption}
        onOptionChange={setSelectedOption}
        featureFlags={buyerFlags}
        onTabChange={setActiveTab}
      />
    </Shell>
  );
}
