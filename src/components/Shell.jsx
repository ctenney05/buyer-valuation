import { RefreshCw } from 'lucide-react';
import { renewal } from '../data/renewalData.js';

const TABS = [
  { id: 'home',             label: 'Home'             },
  { id: 'chatbot',          label: 'Chatbot'          },
  { id: 'contract-history', label: 'Contract History' },
  { id: 'roi-calculator',   label: 'ROI Calculator'   },
  { id: 'vendor-contacts',  label: 'Vendor Contacts'  },
];

export default function Shell({ activeTab, onTabChange, children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-slate-800 text-base tracking-tight">The Renewals Hub</span>
        </div>
        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
          {renewal.vendor}
        </span>
      </header>

      {/* Tab bar */}
      <nav className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={[
                'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
