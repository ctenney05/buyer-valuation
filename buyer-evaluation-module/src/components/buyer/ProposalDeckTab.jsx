import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { deckUrl, renewal, orderForm, utilization, sellerContacts } from '../../data/renewalData.js';
import { roiLineItems } from '../../data/roiData.js';

const DIFF_COLORS = {
  added:   { bg: '#F0FDF4', border: '#86EFAC', fg: '#15803D', label: 'Added'   },
  changed: { bg: 'var(--clay-100)', border: 'var(--clay-200)', fg: 'var(--clay-700)', label: 'Changed' },
  removed: { bg: 'var(--danger-100)', border: 'var(--danger-100)', fg: 'var(--danger-700)', label: 'Removed' },
};

const roiTotal = roiLineItems.reduce((s, r) => s + r.annualValue, 0);
const roiMultiple = Math.round(roiTotal / renewal.annualCost);

// ── Individual slide components (designed for both thumbnail + expanded view) ──

function SlideCover({ size = 'thumb' }) {
  const sm = size === 'thumb';
  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'var(--ink-900)', padding: sm ? 12 : 40 }}>
      {/* Agent badge */}
      <div className="flex justify-end" style={{ marginBottom: sm ? 6 : 16 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 7 : 11, background: 'var(--clay-500)', color: '#fff', borderRadius: 4, padding: sm ? '2px 5px' : '4px 10px' }}>
          Proposal Agent
        </span>
      </div>
      {/* Brand pairing */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 7 : 12, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: sm ? 3 : 8 }}>
          2026 Renewal Proposal
        </p>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: sm ? 14 : 36, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.05, marginBottom: sm ? 6 : 16 }}>
          {renewal.vendor}<br />
          <span style={{ color: 'var(--clay-400)' }}>× {renewal.buyerCompany}</span>
        </p>
        <div style={{ width: sm ? 20 : 40, height: 1, background: 'var(--clay-500)', marginBottom: sm ? 6 : 16 }} />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 7 : 12, color: 'rgba(255,255,255,0.5)' }}>
          {orderForm.quoteNumber} · Renews Jul 23, 2026
        </p>
      </div>
      {/* Footer */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 6 : 10, color: 'rgba(255,255,255,0.3)' }}>
        Prepared by {orderForm.salesRep} · LeanData Account Manager
      </p>
    </div>
  );
}

function SlideBusinessReview({ size = 'thumb' }) {
  const sm = size === 'thumb';
  const activeProducts = utilization.filter(u => u.usagePct > 0);
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#FFFFFF', padding: sm ? 10 : 36 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 7 : 11, color: 'var(--clay-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: sm ? 4 : 12 }}>
        Business Review
      </p>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: sm ? 11 : 26, color: 'var(--text-strong)', marginBottom: sm ? 6 : 20 }}>
        Year 3 of Partnership
      </p>
      <div style={{ display: 'flex', gap: sm ? 4 : 12, flex: 1 }}>
        {activeProducts.map(u => (
          <div key={u.product} style={{ flex: 1, background: 'var(--surface-sunken)', borderRadius: sm ? 4 : 10, padding: sm ? '5px 6px' : '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 7 : 11, color: 'var(--text-subtle)', marginBottom: sm ? 2 : 6 }}>
              {u.product}
            </p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: sm ? 16 : 40, color: 'var(--clay-500)', fontWeight: 400, lineHeight: 1 }}>
              {u.usagePct}%
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 5.5 : 9, color: 'var(--text-subtle)', marginTop: sm ? 2 : 4 }}>
              utilization
            </p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: sm ? 5 : 14, display: 'flex', gap: sm ? 8 : 20 }}>
        {[['250', 'seats'], ['$6,800', 'ACV'], ['3rd', 'renewal']].map(([val, lbl]) => (
          <div key={lbl}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 8 : 16, fontWeight: 700, color: 'var(--text-strong)' }}>{val}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 5.5 : 9, color: 'var(--text-subtle)' }}>{lbl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideWhatChanged({ size = 'thumb' }) {
  const sm = size === 'thumb';
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#FFFFFF', padding: sm ? 10 : 36 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 7 : 11, color: 'var(--clay-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: sm ? 3 : 10 }}>
        Contract Updates
      </p>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: sm ? 11 : 26, color: 'var(--text-strong)', marginBottom: sm ? 5 : 16 }}>
        3 Changes This Term
      </p>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: sm ? 3 : 10 }}>
        {orderForm.highlightDiffs.map((diff) => {
          const c = DIFF_COLORS[diff.type];
          return (
            <div key={diff.title} style={{ display: 'flex', alignItems: sm ? 'center' : 'flex-start', gap: sm ? 4 : 10, background: c.bg, border: `1px solid ${c.border}`, borderRadius: sm ? 4 : 8, padding: sm ? '4px 6px' : '10px 14px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 6 : 9, fontWeight: 700, color: c.fg, textTransform: 'uppercase', flexShrink: 0 }}>
                {c.label}
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: sm ? 7 : 12, fontWeight: 600, color: 'var(--text-body)' }}>
                  {diff.title}
                </p>
                {!sm && (
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>
                    {diff.curr ? diff.curr.slice(0, 120) + (diff.curr.length > 120 ? '…' : '') : diff.prev?.slice(0, 120)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlidePricing({ size = 'thumb' }) {
  const sm = size === 'thumb';
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#FFFFFF', padding: sm ? 10 : 36 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 7 : 11, color: 'var(--clay-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: sm ? 3 : 10 }}>
        Renewal Options
      </p>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: sm ? 11 : 26, color: 'var(--text-strong)', marginBottom: sm ? 5 : 16 }}>
        Two Paths Forward
      </p>
      <div style={{ flex: 1, display: 'flex', gap: sm ? 4 : 12, alignItems: 'stretch' }}>
        {orderForm.renewalOptions.map((opt) => (
          <div
            key={opt.label}
            style={{
              flex: 1,
              borderRadius: sm ? 4 : 10,
              padding: sm ? '5px 6px' : '16px 18px',
              background: opt.selected ? 'var(--clay-100)' : 'var(--surface-sunken)',
              border: `${opt.selected ? '2px' : '1px'} solid ${opt.selected ? 'var(--clay-400)' : 'var(--border-default)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: sm ? 2 : 6,
            }}
          >
            {opt.selected && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 5.5 : 9, fontWeight: 700, color: 'var(--clay-600)', textTransform: 'uppercase' }}>
                ★ Recommended
              </span>
            )}
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: sm ? 7 : 12, fontWeight: 600, color: 'var(--text-body)' }}>{opt.label}</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: sm ? 13 : 28, color: opt.selected ? 'var(--clay-600)' : 'var(--text-muted)', fontWeight: 400 }}>{opt.price}</p>
          </div>
        ))}
      </div>
      {!sm && (
        <div style={{ marginTop: 14, background: 'var(--surface-sunken)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, background: 'var(--clay-500)', color: '#fff', borderRadius: 3, padding: '2px 6px', flexShrink: 0, marginTop: 1 }}>
            Pricing Justification
          </span>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
            {orderForm.pricingJustification}
          </p>
        </div>
      )}
      {sm && (
        <div style={{ marginTop: 4, borderRadius: 3, padding: '3px 5px', background: 'var(--surface-sunken)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 5.5, color: 'var(--text-subtle)' }}>
            [Pricing Justification] {orderForm.pricingJustification.slice(0, 60)}…
          </p>
        </div>
      )}
    </div>
  );
}

function SlideROI({ size = 'thumb' }) {
  const sm = size === 'thumb';
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#FFFFFF', padding: sm ? 10 : 36 }}>
      <div style={{ display: 'flex', alignItems: sm ? 'center' : 'flex-start', justifyContent: 'space-between', marginBottom: sm ? 4 : 14 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 7 : 11, color: 'var(--clay-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          ROI Summary
        </p>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 6 : 9, background: '#F0FDF4', color: '#15803D', borderRadius: 4, padding: sm ? '1px 4px' : '3px 8px' }}>
          ROI Agent
        </span>
      </div>
      <div style={{ display: 'flex', gap: sm ? 4 : 12, marginBottom: sm ? 5 : 16 }}>
        {[
          { label: 'Annual Value', val: `$${(roiTotal / 1000).toFixed(0)}k` },
          { label: 'Annual Cost',  val: `$${(renewal.annualCost / 1000).toFixed(1)}k` },
          { label: 'ROI Multiple', val: `${roiMultiple}×` },
        ].map(({ label, val }) => (
          <div key={label} style={{ flex: 1, background: 'var(--surface-sunken)', borderRadius: sm ? 3 : 8, padding: sm ? '4px 5px' : '12px 14px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 5.5 : 9, color: 'var(--text-subtle)', marginBottom: sm ? 1 : 4 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: sm ? 12 : 28, color: 'var(--text-strong)', fontWeight: 400 }}>{val}</p>
          </div>
        ))}
      </div>
      {!sm && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {roiLineItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-body)', flex: 1 }}>{item.description}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--clay-600)', flexShrink: 0 }}>
                ${item.annualValue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
      {sm && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {roiLineItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
              <p style={{ fontSize: 5.5, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 5.5, color: 'var(--clay-600)', flexShrink: 0 }}>${(item.annualValue / 1000).toFixed(0)}k</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SlideNextSteps({ size = 'thumb' }) {
  const sm = size === 'thumb';
  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#FFFFFF', padding: sm ? 10 : 36 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 7 : 11, color: 'var(--clay-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: sm ? 3 : 10 }}>
        Next Steps
      </p>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: sm ? 11 : 26, color: 'var(--text-strong)', marginBottom: sm ? 5 : 18 }}>
        Renewal by Jul 23, 2026
      </p>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: sm ? 3 : 10 }}>
        {[
          { num: '01', step: 'Review', detail: 'Review the proposed order form and contract changes in the Renewal Hub' },
          { num: '02', step: 'Confirm', detail: 'Select your preferred option and click Confirm & Renew to submit' },
          { num: '03', step: 'Sign', detail: 'DocuSign packet will be sent within 1 business day' },
        ].map(({ num, step, detail }) => (
          <div key={num} style={{ display: 'flex', gap: sm ? 5 : 14, alignItems: sm ? 'center' : 'flex-start' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: sm ? 8 : 16, fontWeight: 700, color: 'var(--clay-500)', flexShrink: 0, minWidth: sm ? 14 : 28 }}>
              {num}
            </span>
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: sm ? 7 : 13, fontWeight: 600, color: 'var(--text-body)' }}>{step}</p>
              {!sm && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{detail}</p>}
            </div>
          </div>
        ))}
      </div>
      {!sm && (
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          {sellerContacts.map(c => (
            <div key={c.name} style={{ flex: 1, background: 'var(--surface-sunken)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--clay-100)', color: 'var(--clay-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
                {c.initials}
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>{c.name}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-subtle)' }}>{c.role}</p>
            </div>
          ))}
        </div>
      )}
      {sm && (
        <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
          {sellerContacts.map(c => (
            <div key={c.name} style={{ flex: 1, background: 'var(--surface-sunken)', borderRadius: 3, padding: '3px 4px' }}>
              <p style={{ fontSize: 6, fontWeight: 600, color: 'var(--text-body)', fontFamily: 'var(--font-sans)' }}>{c.name}</p>
              <p style={{ fontSize: 5.5, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>{c.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const SLIDES = [
  { title: 'Cover',           Component: SlideCover },
  { title: 'Business Review', Component: SlideBusinessReview },
  { title: 'What Changed',    Component: SlideWhatChanged },
  { title: 'Pricing',         Component: SlidePricing },
  { title: 'ROI Summary',     Component: SlideROI },
  { title: 'Next Steps',      Component: SlideNextSteps },
];

export default function ProposalDeckTab() {
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (expanded === null) return;
    function handleKeyDown(e) {
      if (e.key === 'ArrowLeft')  setExpanded(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setExpanded(i => Math.min(SLIDES.length - 1, i + 1));
      if (e.key === 'Escape')     setExpanded(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expanded]);

  if (deckUrl) {
    return (
      <iframe
        src={deckUrl}
        style={{ width: '100%', height: 'calc(100vh - 200px)', border: 'none', borderRadius: 12 }}
        allowFullScreen
        title="Renewals Deck"
      />
    );
  }

  const ExpandedSlide = expanded !== null ? SLIDES[expanded].Component : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-[22px] font-semibold tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
          >
            Renewals Deck
          </h2>
          <p
            className="text-[11px] mt-0.5"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
          >
            Generated by Proposal Agent · Stage 3 of 4
          </p>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ fontFamily: 'var(--font-mono)', background: 'var(--clay-100)', color: 'var(--clay-700)' }}
        >
          Proposal Agent
        </span>
      </div>

      {/* Slide grid */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="grid grid-cols-3 gap-4">
          {SLIDES.map(({ title, Component }, i) => (
            <button
              key={i}
              onClick={() => setExpanded(i)}
              className="text-left rounded-lg overflow-hidden"
              style={{
                aspectRatio: '16/9',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                background: 'transparent',
                padding: 0,
                transition: 'box-shadow 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--clay-400)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            >
              <Component size="thumb" />
            </button>
          ))}
        </div>
        <p
          className="text-[11px] text-center mt-5"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
        >
          Click any slide to expand · Generated by the Proposal Agent from your account data
        </p>
      </div>

      {/* Expanded slide modal */}
      {expanded !== null && ExpandedSlide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(20,20,19,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setExpanded(null)}
        >
          <div
            className="relative rounded-xl overflow-hidden"
            style={{ width: 'min(880px, 90vw)', aspectRatio: '16/9', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <ExpandedSlide size="full" />
            {/* nav arrows */}
            <button
              onClick={() => setExpanded(i => Math.max(0, i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: expanded > 0 ? 'pointer' : 'default',
                opacity: expanded > 0 ? 1 : 0.2,
                transition: 'opacity 0.15s',
              }}
            >
              <ChevronLeft style={{ width: 18, height: 18, color: '#fff' }} />
            </button>
            <button
              onClick={() => setExpanded(i => Math.min(SLIDES.length - 1, i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: expanded < SLIDES.length - 1 ? 'pointer' : 'default',
                opacity: expanded < SLIDES.length - 1 ? 1 : 0.2,
                transition: 'opacity 0.15s',
              }}
            >
              <ChevronRight style={{ width: 18, height: 18, color: '#fff' }} />
            </button>
            {/* slide counter + close */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                {expanded + 1} / {SLIDES.length}
              </span>
              <button
                onClick={() => setExpanded(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
              >
                <X style={{ width: 13, height: 13, color: '#fff' }} />
              </button>
            </div>
            {/* slide title bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2" style={{ background: 'rgba(20,20,19,0.5)', backdropFilter: 'blur(8px)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                Slide {expanded + 1} — {SLIDES[expanded].title}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
