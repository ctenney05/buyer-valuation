import { useState } from 'react';
import { X, CheckCircle, PenLine, ChevronLeft } from 'lucide-react';
import { renewal, orderForm, selectedOrder } from '../../data/renewalData.js';
import { formatCurrency } from '../../data/format.js';

// Buyer portal chrome: header (party chips + Quick Renew), tab nav, success banner.
//
// Trimmed for integration: the demo-only Buyer/Admin segmented toggle was removed
// (in the combined dashboard the buyer portal and seller view are separate mounts,
// not two modes of one screen). The Quick Renew → confirm flow is KEPT — it is the
// hub's highest-value OUTBOUND signal (the buyer's renewal decision). On confirm,
// Shell calls `onRenew`, which BuyerPortal forwards to `onDecision`.

const TABS = [
  { id: 'home',             label: 'Home'           },
  { id: 'contract-history', label: 'Documents'      },
  { id: 'roi-calculator',   label: 'ROI Calculator' },
  { id: 'proposal-deck',    label: 'Renewals Deck'  },
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
      <span className="text-[13.5px] font-semibold leading-none" style={{ color: 'var(--text-strong)' }}>
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

export default function Shell({ activeTab, onTabChange, onRenew, renewed, selectedOption, featureFlags, children }) {
  const [confirming, setConfirming] = useState(false);
  const [signStep, setSignStep] = useState('summary');   // 'summary' | 'sign'
  const [signName, setSignName] = useState('');
  const [signTitle, setSignTitle] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState(null);      // { name, title, signedAt }
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);

  const canSign = signName.trim().length > 0 && agreed;

  function closeModal() {
    setConfirming(false);
    setSignStep('summary');
  }

  function handleConfirm() {
    const signedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const sig = { name: signName.trim(), title: signTitle.trim(), signedAt };
    setSignature(sig);
    closeModal();
    if (onRenew) onRenew(sig);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-page)' }}>
      <header
        className="backdrop-blur-md sticky top-0 z-20"
        style={{ background: 'rgba(250,249,245,0.92)', borderBottom: '1px solid var(--border-default)' }}
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
            <PartyChip name={renewal.vendor} initials="LD" kind="seller" />
            <span className="text-base italic" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-subtle)' }}>×</span>
            <PartyChip name={renewal.buyerCompany} initials="UB" kind="buyer" />
          </div>

          {/* Right: Quick Renew (the OUT decision signal) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div style={{ position: 'relative' }}>
              {renewed ? (
                <div
                  className="flex items-center gap-2 font-semibold text-sm px-5 py-2 rounded-full"
                  style={{ background: 'var(--surface-sunken)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}
                >
                  <CheckCircle className="w-4 h-4" style={{ color: 'var(--success-600)' }} />
                  Renewal Submitted
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setConfirming(!confirming)}
                    onMouseEnter={() => setBtnHovered(true)}
                    onMouseLeave={() => setBtnHovered(false)}
                    className="flex items-center gap-2 font-semibold text-sm px-5 py-2 rounded-full"
                    style={{
                      background: btnHovered ? 'var(--success-600)' : 'var(--success-100)',
                      color: btnHovered ? '#fff' : 'var(--success-600)',
                      border: '1px solid var(--success-600)',
                      boxShadow: 'var(--shadow-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm &amp; Renew
                  </button>

                  {confirming && (
                    <>
                      <div className="fixed inset-0" style={{ zIndex: 90 }} onClick={closeModal} />
                      <div
                        className="rounded-xl p-4"
                        style={{
                          position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 344, zIndex: 100,
                          background: 'var(--success-100)', border: '1px solid var(--success-600)',
                          boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.12))',
                        }}
                      >
                        {signStep === 'summary' ? (
                          <>
                            <p className="text-[16px] font-semibold mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-700)' }}>
                              Review &amp; confirm
                            </p>

                            <div className="rounded-lg overflow-hidden mb-3" style={{ border: '1px solid var(--success-600)', background: 'rgba(255,255,255,0.55)' }}>
                              {(() => {
                                const order = selectedOrder(selectedOption ?? 0);
                                const rows = [
                                  { label: 'Vendor', value: renewal.vendor },
                                  { label: 'Quote',  value: orderForm.quoteNumber },
                                  { label: 'Option', value: `${order.label} · ${order.price}` },
                                  ...order.lineItems.map((item) => ({ label: item.product, value: item.finalPrice })),
                                ];
                                return rows.map((row, i) => (
                                  <div
                                    key={row.label}
                                    className="flex items-center justify-between px-3 py-1.5"
                                    style={i < rows.length - 1 ? { borderBottom: '1px solid rgba(0,0,0,0.07)' } : undefined}
                                  >
                                    <span className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                                      {row.label}
                                    </span>
                                    <span className="text-[11px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-700)', maxWidth: 180, textAlign: 'right' }}>
                                      {row.value}
                                    </span>
                                  </div>
                                ));
                              })()}
                              <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: '1px solid var(--success-600)', background: 'rgba(255,255,255,0.4)' }}>
                                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-700)' }}>
                                  Total
                                </span>
                                <span className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-700)' }}>
                                  {formatCurrency(selectedOrder(selectedOption ?? 0).priceValue)}/yr
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={closeModal}
                                className="flex-1 rounded-lg py-2 text-[13px] font-medium"
                                style={{ border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => setSignStep('sign')}
                                onMouseEnter={() => setSubmitHovered(true)}
                                onMouseLeave={() => setSubmitHovered(false)}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-semibold"
                                style={{ background: submitHovered ? '#15803D' : 'var(--success-600)', color: '#fff', border: 'none', cursor: 'pointer' }}
                              >
                                <PenLine className="w-3.5 h-3.5" />
                                Review &amp; Sign
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-[16px] font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-700)' }}>
                              Sign &amp; commit
                            </p>
                            <p className="text-[11.5px] mb-3" style={{ color: 'var(--text-muted)' }}>
                              Adopt your signature to accept order form {orderForm.quoteNumber}.
                            </p>

                            <div className="flex flex-col gap-2 mb-3">
                              <input
                                type="text"
                                value={signName}
                                onChange={(e) => setSignName(e.target.value)}
                                placeholder="Full legal name"
                                className="rounded-lg px-3 py-2 text-[13px]"
                                style={{ border: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.7)', color: 'var(--ink-700)', outline: 'none' }}
                              />
                              <input
                                type="text"
                                value={signTitle}
                                onChange={(e) => setSignTitle(e.target.value)}
                                placeholder="Title (e.g. VP Operations)"
                                className="rounded-lg px-3 py-2 text-[13px]"
                                style={{ border: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.7)', color: 'var(--ink-700)', outline: 'none' }}
                              />
                            </div>

                            {/* Adopted-signature preview (italic serif on a ruled line) */}
                            <div className="rounded-lg px-3 pt-3 pb-2 mb-3" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid var(--success-600)' }}>
                              <div className="pb-1 mb-1" style={{ borderBottom: '1px solid var(--ink-700)' }}>
                                <span
                                  className="text-[26px] leading-none"
                                  style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: signName.trim() ? 'var(--ink-700)' : 'var(--text-subtle)' }}
                                >
                                  {signName.trim() || 'Your signature'}
                                </span>
                              </div>
                              <span className="text-[9.5px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                                Signature{signTitle.trim() ? ` · ${signTitle.trim()}` : ''}
                              </span>
                            </div>

                            <label className="flex items-start gap-2 mb-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-0.5 flex-shrink-0"
                                style={{ accentColor: 'var(--success-600)' }}
                              />
                              <span className="text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                                I have authority to bind {renewal.buyerCompany} and agree to the terms of this order form.
                              </span>
                            </label>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setSignStep('summary')}
                                className="flex items-center justify-center gap-1 rounded-lg py-2 px-3 text-[13px] font-medium"
                                style={{ border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Back
                              </button>
                              <button
                                onClick={canSign ? handleConfirm : undefined}
                                disabled={!canSign}
                                onMouseEnter={() => setSubmitHovered(true)}
                                onMouseLeave={() => setSubmitHovered(false)}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-semibold"
                                style={{
                                  background: !canSign ? 'var(--surface-sunken)' : submitHovered ? '#15803D' : 'var(--success-600)',
                                  color: !canSign ? 'var(--text-subtle)' : '#fff',
                                  border: 'none',
                                  cursor: canSign ? 'pointer' : 'not-allowed',
                                }}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Sign &amp; Submit
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav
        className="backdrop-blur-md px-7 sticky top-[64px] z-[15]"
        style={{ background: 'rgba(250,249,245,0.92)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex overflow-x-auto">
          {TABS.filter((tab) => {
            if (tab.id === 'roi-calculator'   && featureFlags?.showROICalculator   === false) return false;
            if (tab.id === 'contract-history' && featureFlags?.showContractHistory === false) return false;
            if (tab.id === 'proposal-deck'    && featureFlags?.showProposalDeck    === false) return false;
            return true;
          }).map((tab) => (
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
        <div className="flex items-center justify-between px-7 py-3" style={{ background: 'var(--success-100)', borderBottom: '1px solid var(--success-600)' }}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success-600)' }} />
            <p className="text-[14px]" style={{ fontFamily: 'var(--font-serif)', color: 'var(--success-600)' }}>
              {signature ? (
                <>Signed by <strong>{signature.name}</strong>{signature.title ? `, ${signature.title}` : ''} · {signature.signedAt} — countersignature requested from <strong>{renewal.vendor}</strong>.</>
              ) : (
                <>Renewal submitted — your <strong>{renewal.vendor}</strong> agreement is on its way to DocuSign.</>
              )}
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
    </div>
  );
}
