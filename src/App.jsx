import { useState } from 'react';
import Shell from './components/Shell.jsx';
import HomeTab from './components/Home/HomeTab.jsx';
import ChatbotTab from './components/Chatbot/ChatbotTab.jsx';
import ContractHistoryTab from './components/ContractHistory/ContractHistoryTab.jsx';
import ROICalculatorTab from './components/ROICalculator/ROICalculatorTab.jsx';
import VendorContactsTab from './components/VendorContacts/VendorContactsTab.jsx';

const TAB_COMPONENTS = {
  'home':             HomeTab,
  'chatbot':          ChatbotTab,
  'contract-history': ContractHistoryTab,
  'roi-calculator':   ROICalculatorTab,
  'vendor-contacts':  VendorContactsTab,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const TabComponent = TAB_COMPONENTS[activeTab];

  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab}>
      <TabComponent />
    </Shell>
  );
}
