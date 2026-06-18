import { useState } from 'react';
import { Zap, X, CheckCircle } from 'lucide-react';
import { renewal } from '../data/renewalData.js';

const TABS = [
  { id: 'home',             label: 'Home'             },
  { id: 'contract-history', label: 'Contract History' },
  { id: 'roi-calculator',   label: 'ROI Calculator'   },
];

function PartyChip({ name, initials, kind }) {
  const isBuyer = kind === 'buyer';
  return (
    <div
      className="flex items-center gap-2 h-[34px] px-3 pl-1.5 rounded-full"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10.5px] font-semibold flex-shrink-0"
        style={{
          fontFamily: 'var(--font-mono)',
          background: isBuyer ? 'var(--clay-100)' : 'var(--ocean-200)',
          color:      isBuyer ? 'var(--clay-700)' : 'var(--ocean-600)',
        }}
      >
        {initials}
      </span>
      <span
        className="text-[13.5px] font-semibold leading-none"
        style={{ color: 'var(--text-strong)' }}
      >
        {name}
      </span>
      <span
        className="text-[10px] uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
      >
        {kind}
      </span>
    </div>
  );
}


export default function Shell({ activeTab, onTabChange, onModeChange, onRenew, renewed, children }) {
  const [showModal, setShowModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  function handleConfirm() {
    setShowModal(false);
    if (onRenew) onRenew();
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-page)' }}>
      <header
        className="backdrop-blur-md sticky top-0 z-20"
        style={{
          background: 'rgba(250,249,245,0.92)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="px-7 h-16 flex items-center gap-6">
          {/* Left: title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="leading-tight">
              <div
                className="text-[19px] font-semibold tracking-[-0.01em]"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
              >
                Renewal Hub
              </div>
              <div
                className="text-[10px] tracking-widest uppercase mt-0.5"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
              >
                Powered by Pareto Agent
              </div>
            </div>
          </div>

          {/* Center: party chips */}
          <div className="flex-1 flex items-center justify-center gap-2.5">
            <PartyChip name={renewal.buyerCompany} initials="UB" kind="buyer" />
            <span
              className="text-base italic"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-subtle)' }}
            >
              ×
            </span>
            <PartyChip name={renewal.vendor} initials="LD" kind="seller" />
          </div>

          {/* Right: view toggle + quick renew */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Segmented toggle — Buyer active */}
            <div
              className="flex rounded-full overflow-hidden flex-shrink-0"
              style={{ border: '1px solid var(--border-default)' }}
            >
              <button
                className="text-xs font-medium px-4 py-1.5"
                style={{ background: 'var(--clay-500)', color: '#fff', cursor: 'default', border: 'none' }}
              >
                Buyer
              </button>
              <button
                onClick={onModeChange}
                className="text-xs font-medium px-4 py-1.5"
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: 'none',
                  borderLeft: '1px solid var(--border-default)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-sunken)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Admin
              </button>
            </div>

            {renewed ? (
              <div
                className="flex items-center gap-2 font-semibold text-sm px-5 py-2 rounded-full"
                style={{
                  background: 'var(--surface-sunken)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--success-600)' }} />
                Renewal Submitted
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 font-semibold text-sm px-5 py-2 rounded-full transition-colors"
                style={{
                  background: 'var(--clay-500)',
                  color: '#fff',
                  boxShadow: 'var(--shadow-sm)',
                  outline: '2px solid var(--clay-700)',
                  outlineOffset: '2px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--clay-600)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--clay-500)')}
              >
                <Zap className="w-4 h-4" />
                Quick Renew
              </button>
            )}
          </div>
        </div>

      </header>

      <nav
        className="backdrop-blur-md px-7 sticky top-[64px] z-[15]"
        style={{
          background: 'rgba(250,249,245,0.92)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
              style={
                activeTab === tab.id
                  ? { borderBottomColor: 'var(--clay-500)', color: 'var(--clay-700)' }
                  : { borderBottomColor: 'transparent', color: 'var(--text-muted)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Renewal success banner */}
      {renewed && !bannerDismissed && (
        <div
          className="flex items-center justify-between px-7 py-3"
          style={{
            background: 'var(--success-100)',
            borderBottom: '1px solid var(--success-600)',
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success-600)' }} />
            <p
              className="text-[14px]"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--success-600)' }}
            >
              Renewal submitted — your <strong>{renewal.vendor}</strong> agreement is on its way to DocuSign.
            </p>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="flex-shrink-0 ml-4 p-1 rounded"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--success-600)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--success-200, rgba(0,0,0,0.06))')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 px-7 py-6 max-w-[1400px] mx-auto w-full">
        {children}
      </main>

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(20,20,19,0.4)' }}
        >
          <div
            className="rounded-xl shadow-xl p-6 max-w-sm w-full mx-4"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
            >
              Confirm Renewal
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              This will initiate a renewal for{' '}
              <span className="font-medium" style={{ color: 'var(--text-body)' }}>
                {renewal.vendor}
              </span>{' '}
              at the proposed contract terms.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors"
                style={{
                  color: 'var(--ink-600)',
                  border: '1px solid var(--border-default)',
                  background: 'transparent',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors"
                style={{
                  background: 'var(--clay-500)',
                  color: '#fff',
                  border: '1px solid var(--clay-500)',
                }}
              >
                Confirm Renewal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
