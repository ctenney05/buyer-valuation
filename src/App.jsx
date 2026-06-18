import { useState } from 'react';
import Shell from './components/Shell.jsx';
import HomeTab from './components/Home/HomeTab.jsx';
import ContractHistoryTab from './components/ContractHistory/ContractHistoryTab.jsx';
import ROICalculatorTab from './components/ROICalculator/ROICalculatorTab.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';

const TAB_COMPONENTS = {
  'home':             HomeTab,
  'contract-history': ContractHistoryTab,
  'roi-calculator':   ROICalculatorTab,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [mode, setMode] = useState('buyer');
  const [buyerRenewed, setBuyerRenewed] = useState(false);
  const TabComponent = TAB_COMPONENTS[activeTab];

  if (mode === 'admin') {
    return <AdminDashboard onModeChange={() => setMode('buyer')} buyerRenewed={buyerRenewed} onReset={() => setBuyerRenewed(false)} />;
  }

  return (
    <Shell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onModeChange={() => setMode('admin')}
      onRenew={() => setBuyerRenewed(true)}
      renewed={buyerRenewed}
    >
      <TabComponent onRenew={() => setBuyerRenewed(true)} renewed={buyerRenewed} />
    </Shell>
  );
}
