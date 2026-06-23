import { useState, useEffect, useMemo } from 'react';
import { Zap, CalendarDays, ExternalLink, ChevronLeft, ChevronRight, Clock, Video, Check, X } from 'lucide-react';
import { SLIDES } from '../ProposalDeck/ProposalDeckTab.jsx';
import {
  renewal, contractStats, utilization,
  orderForm, buyerTeam, sellerContacts,
  renewalProgress, selectedOrder,
} from '../../data/renewalData.js';
import { formatCurrency } from '../../data/format.js';

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24)));
}

// ── Left column ──────────────────────────────────────────────────────────────

function CountdownBox() {
  const days = daysUntil(renewal.renewalDate);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const urgency = days <= 7
    ? { bg: 'var(--danger-100)', bd: 'var(--danger-600)', fg: 'var(--danger-600)', word: 'Closing soon' }
    : days <= 30
      ? { bg: 'var(--clay-100)', bd: 'var(--clay-400)', fg: 'var(--clay-700)', word: 'Action needed' }
      : { bg: 'var(--success-100)', bd: 'var(--success-600)', fg: 'var(--success-600)', word: 'On track' };

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: urgency.bg,
        border: `1px solid ${urgency.bd}`,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <span
          className="text-[10.5px] tracking-widest uppercase font-semibold"
          style={{ fontFamily: 'var(--font-mono)', color: urgency.fg }}
        >
          {urgency.word}
        </span>
        <span
          className="text-[11.5px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
        >
          {renewal.status || 'In negotiation'}
        </span>
      </div>
      <p className="text-[13.5px] leading-snug" style={{ color: 'var(--ink-700)' }}>
        Your <span className="font-semibold">{renewal.vendor}</span> renewal is coming up
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="text-[46px] font-semibold leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-serif)', color: urgency.fg }}
        >
          {days}
        </span>
        <span className="text-[15px] font-medium" style={{ color: 'var(--ink-700)' }}>
          days remaining
        </span>
      </div>
      <div className="mt-4">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(20,20,19,0.07)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: (() => {
                const total = Math.ceil((new Date(renewal.renewalDate) - new Date(renewal.contractStart)) / 86400000);
                const elapsed = Math.max(0, total - days);
                return `${Math.min(100, Math.max(3, (elapsed / total) * 100))}%`;
              })(),
              background: urgency.fg,
            }}
          />
        </div>
        <div
          className="flex justify-between mt-1.5 text-[11px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
        >
          <span>Started {fmtDate(renewal.contractStart)}</span>
          <span className="font-semibold" style={{ color: urgency.fg }}>
            Renews {fmtDate(renewal.renewalDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// Renewal status — read-only, account-team-maintained snapshot of where the renewal
// stands (owner + due per step + progress). Deliberately NOT a buyer-interactive
// checklist: research (Jun 22) showed buyer-facing MAPs/checklists go stale and buyers
// rarely return to tick them off, so this is framed as visibility, not a to-do.
// Data-driven from renewalProgress (renewalData.js).
function RenewalPathStrip() {
  const steps = renewalProgress;
  const doneCount = steps.filter((s) => s.status === 'done').length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <p
          className="text-[10.5px] font-semibold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
        >
          Renewal status
        </p>
        <span
          className="text-[10.5px] font-semibold"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--clay-700)' }}
        >
          {doneCount} of {steps.length} complete
        </span>
      </div>
      <p className="text-[10.5px] mb-3" style={{ color: 'var(--text-subtle)' }}>
        Maintained by your account team — for visibility, not a checklist.
      </p>

      {/* Progress bar (matches CountdownBox styling) */}
      <div
        className="h-1.5 rounded-full overflow-hidden mb-4"
        style={{ background: 'rgba(20,20,19,0.07)' }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(4, pct)}%`, background: 'var(--clay-500)' }}
        />
      </div>

      <div>
        {steps.map((step, i) => {
          const done = step.status === 'done';
          const active = step.status === 'current';
          const last = i === steps.length - 1;
          return (
            <div key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: done ? 'var(--clay-500)' : 'transparent',
                    border: done
                      ? 'none'
                      : active
                      ? '2px solid var(--clay-500)'
                      : '1.5px solid var(--border-default)',
                  }}
                >
                  {done ? (
                    <Check size={10} color="white" strokeWidth={3} />
                  ) : (
                    <span
                      className="text-[9.5px] font-bold leading-none"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: active ? 'var(--clay-600)' : 'var(--text-muted)',
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
                {!last && (
                  <div
                    className="w-px my-1"
                    style={{
                      height: '38px',
                      background: done ? 'var(--clay-300)' : 'var(--border-subtle)',
                    }}
                  />
                )}
              </div>
              <div className={`flex-1 min-w-0 ${!last ? 'pb-3' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-[12.5px] font-semibold leading-snug"
                    style={{ color: step.status === 'upcoming' ? 'var(--text-muted)' : 'var(--text-strong)' }}
                  >
                    {step.label}
                  </p>
                  <span
                    className="text-[10.5px] flex-shrink-0 mt-0.5"
                    style={{ fontFamily: 'var(--font-mono)', color: active ? 'var(--clay-700)' : 'var(--text-subtle)' }}
                  >
                    {step.due}
                  </span>
                </div>
                <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: 'var(--text-subtle)' }}>
                  {step.sub}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                    style={{ fontFamily: 'var(--font-mono)', background: 'var(--clay-100)', color: 'var(--clay-700)' }}
                  >
                    {initialsOf(step.owner)}
                  </span>
                  <span className="text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
                    {step.owner} · {step.ownerRole}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContractStats() {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3
        className="text-[18px] font-semibold mb-3.5"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
      >
        Current contract
      </h3>
      <div className="space-y-3">
        {contractStats.map((s, i) => (
          <div
            key={s.label}
            className={i > 0 ? 'pt-3' : ''}
            style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : undefined}
          >
            <p className="text-[12.5px] mb-0.5" style={{ color: 'var(--text-subtle)' }}>
              {s.label}
            </p>
            <p
              className="font-semibold leading-none"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: i === 0 ? '28px' : '20px',
                color: i === 0 ? 'var(--clay-600)' : 'var(--text-strong)',
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UtilizationList({ showBars }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3
        className="text-[18px] font-semibold mb-1"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
      >
        Your products
      </h3>
      <p className="text-[12.5px] mb-4 leading-snug" style={{ color: 'var(--text-subtle)' }}>
        Adoption across your plan.
      </p>
      <div className="space-y-4">
        {utilization.map((u) => {
          const active = u.usagePct > 0;
          return (
            <div key={u.product}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                {u.url ? (
                  <a
                    href={u.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[13.5px] font-medium"
                    style={{ color: active ? 'var(--clay-600)' : 'var(--text-subtle)', textDecoration: 'none', pointerEvents: active ? 'auto' : 'none' }}
                    onMouseEnter={e => { if (active) e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {u.product}
                    {active && <ExternalLink style={{ width: 11, height: 11, flexShrink: 0 }} />}
                  </a>
                ) : (
                  <span className="text-[13.5px] font-medium" style={{ color: active ? 'var(--ink-800)' : 'var(--text-subtle)' }}>
                    {u.product}
                  </span>
                )}
                <span
                  className="font-semibold text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={
                    active
                      ? { background: '#DCFCE7', color: '#15803D' }
                      : { background: 'var(--cream-200)', color: 'var(--text-subtle)' }
                  }
                >
                  {active ? 'Included' : 'Add-on'}
                </span>
              </div>
              {u.description && (
                <p className="text-[10.5px] mb-1.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                  {u.description}
                </p>
              )}
              {!active && u.url && (
                <a
                  href={u.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold mt-0.5"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--clay-600)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Learn more <ExternalLink style={{ width: 10, height: 10 }} />
                </a>
              )}
              {active && showBars && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: 'var(--surface-sunken)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${u.usagePct}%`,
                        background: u.usagePct >= 80 ? 'var(--success-600)' : u.usagePct >= 50 ? 'var(--clay-500)' : 'var(--danger-600)',
                      }}
                    />
                  </div>
                  <span
                    className="text-[10.5px] font-semibold flex-shrink-0"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: u.usagePct >= 80 ? 'var(--success-600)' : u.usagePct >= 50 ? 'var(--clay-600)' : 'var(--danger-600)',
                    }}
                  >
                    {u.usagePct}% utilized
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Center column ─────────────────────────────────────────────────────────────

function WhatChangedCard({ selectedOption }) {
  const order = selectedOrder(selectedOption ?? 0);
  const pct = Math.round(((order.priceValue - order.prevTotalValue) / order.prevTotalValue) * 100);
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-3"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}
      >
        What's changed
      </p>
      <div className="space-y-2.5">
        {/* Price */}
        <div className="flex items-baseline justify-between gap-4">
          <span className="flex-shrink-0 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
            Price
          </span>
          <span className="text-[12px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>
            {formatCurrency(order.prevTotalValue)} → <strong>{formatCurrency(order.priceValue)}</strong>
            {pct !== 0 && (
              <span style={{ color: pct > 0 ? 'var(--clay-600)' : 'var(--success-600)' }}> {pct > 0 ? '↑' : '↓'} {Math.abs(pct)}%</span>
            )}
          </span>
        </div>

        {/* Terms */}
        {orderForm.keyChanges.map((change, i) => (
          <div key={i} className="flex items-start justify-between gap-4">
            <span className="flex-shrink-0 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)', minWidth: 48 }}>
              {i === 0 ? 'Terms' : ''}
            </span>
            <span className="text-right text-[12px]" style={{ color: 'var(--text-body)' }}>
              {change}
            </span>
          </div>
        ))}

        {/* MSA */}
        <div className="flex items-baseline justify-between gap-4">
          <span className="flex-shrink-0 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
            Agreement
          </span>
          <a
            href={orderForm.msaUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[12px]"
            style={{ color: 'var(--clay-600)', textDecoration: 'underline' }}
          >
            Master Software Agreement ↗
          </a>
        </div>
      </div>
      <p
        className="mt-3 text-[10px]"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
      >
        Portal assembled by Pareto Agent · Jun 1, 2026
      </p>
    </div>
  );
}

const HIGHLIGHT_COLORS = {
  removed: { headerBg: '#FECACA', bg: '#FEF2F2', bd: '#FECACA', fg: '#DC2626', tag: 'Clause Removed' },
  added:   { headerBg: '#BBF7D0', bg: '#F0FDF4', bd: '#BBF7D0', fg: '#16A34A', tag: 'Clause Added'   },
  changed: { headerBg: 'var(--clay-200)', bg: 'var(--clay-100)', bd: 'var(--clay-200)', fg: 'var(--clay-700)', tag: 'Clause Updated' },
};

function ProposedChanges({ selectedOption, onOptionChange, showHighlights }) {
  const [highlightsOn, setHighlightsOn] = useState(false);

  // Live re-pricing: line items + total follow the selected renewal option.
  const order = selectedOrder(selectedOption ?? 0);
  const delta = order.priceValue - order.prevTotalValue;

  return (
    <div
      className="rounded-xl flex flex-col h-full overflow-hidden"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <h2
            className="text-[22px] font-semibold"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
          >
            Order Form
          </h2>
          <span
            className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full uppercase"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'var(--clay-100)',
              color: 'var(--clay-700)',
            }}
          >
            For Review
          </span>
        </div>
        {showHighlights && (
          <button
            onClick={() => setHighlightsOn((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
            style={
              highlightsOn
                ? { background: 'var(--clay-600)', borderColor: 'var(--clay-600)', color: '#fff' }
                : { background: 'transparent', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Highlights {highlightsOn ? 'ON' : 'OFF'}
          </button>
        )}
      </div>

      {/* Renewal option selector */}
      <div
        className="px-6 py-3 flex items-center gap-2 flex-wrap"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span
          className="text-[10.5px] uppercase tracking-widest mr-1"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
        >
          Renewal Option:
        </span>
        {orderForm.renewalOptions.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => onOptionChange(i)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
            style={
              selectedOption === i
                ? { background: 'var(--clay-500)', borderColor: 'var(--clay-500)', color: '#fff' }
                : { background: 'transparent', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }
            }
          >
            {selectedOption === i && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            {opt.label} · <span className="font-bold">{opt.price}</span>
          </button>
        ))}
      </div>

      {/* Redline legend */}
      {highlightsOn && (
        <div
          className="px-6 py-2 flex items-center gap-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <span className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
            Changes vs. prior term:
          </span>
          {Object.entries(HIGHLIGHT_COLORS).map(([key, s]) => (
            <span
              key={key}
              className="text-[11px] font-semibold"
              style={{ fontFamily: 'var(--font-mono)', color: s.fg }}
            >
              {s.tag}
            </span>
          ))}
        </div>
      )}

      {/* Document body */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Quote header card */}
        <div
          className="rounded-lg p-4"
          style={{
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-sans text-sm font-bold" style={{ color: 'var(--text-strong)' }}>
                Quote Number: {orderForm.quoteNumber}
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
              >
                Docusign Envelope Pending
              </p>
            </div>
            <div className="text-right font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
              <p className="font-bold" style={{ color: 'var(--text-body)' }}>{orderForm.vendor.name}</p>
              <p>{orderForm.vendor.address}</p>
              <p>{orderForm.vendor.cityStateZip}</p>
              <a href="#" style={{ color: 'var(--clay-600)' }}>{orderForm.vendor.website}</a>
            </div>
          </div>

          {/* Ship to / Invoice to */}
          <div
            className="grid grid-cols-2 gap-4 mt-4 pt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
              >
                Ship To
              </p>
              <p className="font-sans text-xs font-semibold" style={{ color: 'var(--text-body)' }}>{orderForm.shipTo.company}</p>
              <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{orderForm.shipTo.address}</p>
              <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{orderForm.shipTo.cityStateZip}</p>
              <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{orderForm.shipTo.country}</p>
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
              >
                Invoice To
              </p>
              <p className="font-sans text-xs font-semibold" style={{ color: 'var(--text-body)' }}>{orderForm.invoiceTo.company}</p>
              <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{orderForm.invoiceTo.address}</p>
              <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{orderForm.invoiceTo.cityStateZip}</p>
              <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{orderForm.invoiceTo.country}</p>
            </div>
          </div>

          {/* Metadata row */}
          <div
            className="grid grid-cols-3 gap-4 mt-4 pt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            {[
              { label: orderForm.vendor.name.toUpperCase() + ' SALES REP', value: orderForm.salesRep },
              { label: 'ORDER TYPE',      value: orderForm.orderType },
              { label: 'EXPIRATION DATE', value: orderForm.expirationDate },
            ].map((m) => (
              <div key={m.label}>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}
                >
                  {m.label}
                </p>
                <p className="font-sans text-sm font-bold" style={{ color: 'var(--text-body)' }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Line items table */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Subscription Term', 'Product', 'Qty', 'Unit Price', 'Final Price'].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-2 pr-3 last:pr-0 last:text-right"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'var(--text-subtle)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.lineItems.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="py-3 pr-3 align-top whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{item.term}</td>
                    <td className="py-3 pr-3 font-medium align-top" style={{ color: 'var(--text-body)' }}>{item.product}</td>
                    <td className="py-3 pr-3 align-top" style={{ color: 'var(--text-muted)' }}>{item.qty}</td>
                    <td className="py-3 pr-3 align-top">
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-body)' }}>{item.unitPrice}</span>
                      <span style={{ color: 'var(--text-subtle)' }}> {item.unitNote}</span>
                    </td>
                    <td className="py-3 text-right align-top" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-strong)' }}>{item.finalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] mt-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
              {orderForm.priceNote}
            </p>
            {orderForm.pricingJustification && (
              <div
                className="flex items-start gap-2 mt-2 rounded-lg px-3 py-2.5"
                style={{ background: 'var(--clay-50, var(--clay-100))', border: '1px solid var(--clay-200)' }}
              >
                <span
                  className="text-[9.5px] font-bold uppercase tracking-widest flex-shrink-0 mt-px px-1.5 py-0.5 rounded"
                  style={{ fontFamily: 'var(--font-mono)', background: 'var(--clay-200)', color: 'var(--clay-700)' }}
                >
                  Why this price?
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] leading-relaxed italic" style={{ color: 'var(--ink-700)' }}>
                    "{orderForm.pricingJustification}"
                  </p>
                  <p className="mt-1.5 text-[9.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                    [Generated by Proposal Agent]
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-end gap-3 mt-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {delta !== 0 && (
                <span
                  className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: delta > 0 ? 'var(--clay-100)' : 'var(--success-100)',
                    color: delta > 0 ? 'var(--clay-700)' : 'var(--success-600)',
                  }}
                >
                  {delta > 0 ? '▲' : '▼'} {formatCurrency(Math.abs(delta))} vs last term
                </span>
              )}
              <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>TOTAL:</span>
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{formatCurrency(order.priceValue)}/yr</span>
            </div>
          </div>

          {/* Redline diffs overlay */}
          {highlightsOn && (
            <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {orderForm.highlightDiffs.map((d, i) => {
                const s = HIGHLIGHT_COLORS[d.type] ?? HIGHLIGHT_COLORS.changed;
                return (
                  <div key={i} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${s.bd}` }}>
                    <div className="px-3 py-1.5 flex items-center gap-1.5" style={{ background: s.headerBg }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.fg }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: s.fg, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {s.tag}
                      </span>
                    </div>
                    <div className="px-3 py-3" style={{ background: s.bg }}>
                      <p className="font-semibold text-xs mb-2" style={{ color: 'var(--text-body)' }}>{d.title}</p>
                      {d.prev && (
                        <p className="text-xs leading-relaxed mb-1.5 line-through" style={{ color: s.fg, opacity: 0.75 }}>
                          {d.prev}
                        </p>
                      )}
                      {d.curr && (
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                          {d.curr}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-[11px] px-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
          {orderForm.footer}
        </p>
      </div>
    </div>
  );
}

function InviteModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const portalUrl = 'https://hub.paretoagent.ai/uber-leandata-2026';

  function handleCopy() {
    navigator.clipboard.writeText(portalUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(20,20,19,0.45)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-[380px] max-w-[90vw] space-y-4"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg, 0 8px 32px rgba(20,20,19,0.18))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}>
            Invite a colleague
          </h3>
          <p className="mt-1 text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
            Share this link so they can review the proposal and pricing directly.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            readOnly
            value={portalUrl}
            className="flex-1 rounded-lg px-3 py-2 text-[12px] outline-none"
            style={{
              fontFamily: 'var(--font-mono)',
              border: '1px solid var(--border-default)',
              background: 'var(--surface-sunken)',
              color: 'var(--text-body)',
            }}
          />
          <button
            onClick={handleCopy}
            className="flex-shrink-0 rounded-lg px-4 py-2 text-[12.5px] font-semibold"
            style={{
              background: copied ? 'var(--success-100)' : 'var(--clay-500)',
              color: copied ? 'var(--success-600)' : '#fff',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full text-[12px] py-1"
          style={{ color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function BuyerTeamPanel() {
  const [showInvite, setShowInvite] = useState(false);
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--clay-200)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-[16.5px] font-semibold"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
        >
          Buyer renewal team
        </h3>
        <span
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--clay-100)',
            color: 'var(--clay-700)',
          }}
        >
          buyer
        </span>
      </div>
      <div className="space-y-3">
        {buyerTeam.map((p) => (
          <div key={p.initials} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                fontFamily: 'var(--font-sans)',
                background: 'var(--clay-100)',
                color: 'var(--clay-700)',
              }}
            >
              {p.initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold leading-tight" style={{ color: 'var(--text-strong)' }}>
                {p.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{p.role}</p>
            </div>
          </div>
        ))}
        <button
          onClick={() => setShowInvite(true)}
          className="w-full flex items-center gap-2 mt-1 rounded-lg py-2 px-3 text-[12.5px] font-medium transition-colors"
          style={{
            border: '1px dashed var(--border-default)',
            color: 'var(--text-subtle)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--clay-400)';
            e.currentTarget.style.color = 'var(--clay-600)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-subtle)';
          }}
        >
          + Invite a colleague
        </button>
      </div>
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}

function ChatbotWidget() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi — I\'m your renewal assistant. Ask me about pricing, terms, or what\'s changed since last year.' },
  ]);

  const chips = ['What changed?', 'Why is it more?'];

  function reply(msg) {
    const m = (msg || '').toLowerCase();
    if (/price|cost|acv|expensive|discount|escalat/.test(m))
      return 'Your ACV holds at $148,500. The per-seat price stays at $594 — no escalator applied for this term.';
    if (/term|length|year|multi|auto.?renew/.test(m))
      return 'The proposed term is 12 months with the new auto-renew clause. A multi-year option is available if you\'d prefer.';
    if (/seat|user|license|utiliz|usage|adopt/.test(m))
      return 'You\'re at 91% utilization on Orchestration and 78% on Scheduling. Two modules are underutilized — happy to set up enablement sessions.';
    if (/redline|diff|chang|legal/.test(m))
      return 'Flip the Highlights toggle in the center panel to see every change with prior values struck through. The new auto-renew clause is the main legal addition.';
    return 'Good question — I\'ve flagged it for Jordan Lee, your account manager, who\'ll follow up today.';
  }

  function handleSend(text) {
    const t = (text || input).trim();
    if (!t) return;
    setInput('');
    setMessages((m) => [...m, { from: 'user', text: t }]);
    setTimeout(() => setMessages((m) => [...m, { from: 'bot', text: reply(t) }]), 320);
  }

  return (
    <div
      className="rounded-xl flex flex-col overflow-hidden"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
        height: 200,
      }}
    >
      {/* Compact header */}
      <div
        className="px-3 py-2 flex items-center gap-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--clay-100)' }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--clay-500)' }} />
        </span>
        <p className="text-[13px] font-semibold leading-none" style={{ color: 'var(--text-strong)' }}>
          Renewal assistant
        </p>
        <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: '#16A34A' }}>● Online</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[90%] px-2.5 py-1.5 text-[12px] leading-snug"
              style={{
                borderRadius: 10,
                borderBottomRightRadius: m.from === 'user' ? 3 : 10,
                borderBottomLeftRadius: m.from === 'user' ? 10 : 3,
                background: m.from === 'user' ? 'var(--clay-500)' : 'var(--surface-sunken)',
                color: m.from === 'user' ? '#fff' : 'var(--text-body)',
                border: m.from === 'user' ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick chips — single row, no wrap */}
      <div className="flex gap-1 px-3 pb-1.5 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => handleSend(c)}
            className="text-[11px] font-medium rounded-full px-2.5 py-0.5 flex-shrink-0"
            style={{
              border: '1px solid var(--border-default)',
              background: 'var(--surface-card)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--clay-400)';
              e.currentTarget.style.color = 'var(--clay-600)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="px-3 pb-3 pt-1.5 flex gap-2 items-center flex-shrink-0"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your renewal…"
          className="flex-1 h-8 rounded-full px-3 text-[12px] outline-none"
          style={{
            border: '1px solid var(--border-default)',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-body)',
            background: 'var(--surface-card)',
          }}
        />
        <button
          onClick={() => handleSend()}
          className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center"
          style={{ background: 'var(--clay-500)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--clay-600)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--clay-500)')}
        >
          <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" style={{ color: '#fff' }}>
            <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── BookIt-style scheduling picker ────────────────────────────────────────────

const SLOT_TIMES = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
];

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// First bookable weekday strictly after `from` (skips weekends).
function firstBookableDay(from) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  let guard = 0;
  do {
    d.setDate(d.getDate() + 1);
    guard += 1;
  } while ((d.getDay() === 0 || d.getDay() === 6) && guard < 30);
  return d;
}

// A calendar cell is bookable if it's a weekday strictly after today.
function isBookableDay(date, today) {
  if (!date) return false;
  if (date.getDay() === 0 || date.getDay() === 6) return false;
  return date.getTime() > today.getTime();
}

// Weeks (arrays of 7) for the given month; null pads leading/trailing cells.
function buildMonthMatrix(year, month) {
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// Stable, deterministic "already booked" pattern keyed on the calendar date — no
// Math.random so it never shifts mid-demo, and each day shows a different set of
// open times. Additive day term keeps every day a mix of open/taken slots.
function slotBooked(date, slotIdx) {
  return (slotIdx + date.getDate() * 2 + 1) % 5 === 0;
}

function ScheduleModal({ am, onClose, onBooked }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const firstDay = useMemo(() => firstBookableDay(today), [today]);
  const [view, setView] = useState({ year: firstDay.getFullYear(), month: firstDay.getMonth() });
  const [selectedDate, setSelectedDate] = useState(firstDay);
  const [slot, setSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmHovered, setConfirmHovered] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const weeks = useMemo(() => buildMonthMatrix(view.year, view.month), [view]);
  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const canGoPrev = view.year > today.getFullYear() || (view.year === today.getFullYear() && view.month > today.getMonth());
  const dayLabel = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  function shiftMonth(delta) {
    setView((v) => {
      let m = v.month + delta;
      let y = v.year;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      return { year: y, month: m };
    });
  }

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function handleConfirm() {
    setConfirmed(true);
    if (onBooked) onBooked({ day: selectedDate, slot });
  }

  return (
    <>
      <div
        className="fixed inset-0"
        style={{ background: 'rgba(35,33,30,0.45)', backdropFilter: 'blur(2px)', zIndex: 110 }}
        onClick={onClose}
      />
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 120 }}
        onClick={onClose}
      >
        <div
          className="relative rounded-2xl overflow-hidden w-full flex flex-col"
          style={{ maxWidth: 820, maxHeight: '90vh', background: 'var(--surface-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg, 0 16px 48px rgba(0,0,0,0.18))' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute flex items-center justify-center rounded-full"
            style={{ top: 14, right: 14, width: 30, height: 30, background: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', zIndex: 2 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.09)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row" style={{ minHeight: 0 }}>
            {/* Left — meeting summary */}
            <div
              className="p-6 flex-shrink-0 sm:w-[252px]"
              style={{ background: 'var(--surface-sunken)', borderRight: '1px solid var(--border-subtle)' }}
            >
              <p className="text-[10px] uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                LeanData · Renewals
              </p>
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'var(--ocean-200)', color: 'var(--ocean-600)' }}
                >
                  {am.initials}
                </div>
                <div>
                  <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--text-strong)' }}>{am.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>{am.role}</p>
                </div>
              </div>
              <h3 className="text-[18px] font-semibold leading-snug mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}>
                Renewal review call
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-subtle)' }} />
                  <span className="text-[12.5px]" style={{ color: 'var(--text-body)' }}>30 min</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-subtle)' }} />
                  <span className="text-[12.5px]" style={{ color: 'var(--text-body)' }}>Zoom · link on confirm</span>
                </div>
                {slot && (
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--ocean-600)' }} />
                    <span className="text-[12.5px] font-medium" style={{ color: 'var(--ocean-600)' }}>
                      {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {slot}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11.5px] mt-5 leading-relaxed" style={{ color: 'var(--text-subtle)' }}>
                Walk through your proposed order form, pricing, and any redlines before you sign.
              </p>
              <p className="text-[10px] uppercase tracking-widest mt-6" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                Powered by <span style={{ color: 'var(--ocean-600)', fontWeight: 600 }}>BookIt</span>
              </p>
            </div>

            {/* Right — picker / confirmation */}
            <div className="p-6 flex-1 flex flex-col" style={{ minWidth: 0 }}>
              {confirmed ? (
                <div className="flex flex-col items-center justify-center text-center flex-1 py-6">
                  <div
                    className="flex items-center justify-center rounded-full mb-4"
                    style={{ width: 52, height: 52, background: '#DCFCE7', color: '#15803D' }}
                  >
                    <Check className="w-7 h-7" />
                  </div>
                  <h3 className="text-[19px] font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}>
                    You're booked
                  </h3>
                  <p className="text-[13px] mb-1" style={{ color: 'var(--text-body)' }}>{dayLabel} at {slot}</p>
                  <p className="text-[12px] mb-6" style={{ color: 'var(--text-subtle)' }}>
                    A calendar invite with the Zoom link is on its way to your inbox.
                  </p>
                  <button
                    onClick={onClose}
                    className="rounded-lg px-6 py-2.5 text-[13px] font-semibold"
                    style={{ background: 'var(--ocean-600)', color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-5 flex-1" style={{ minHeight: 0 }}>
                    {/* Month calendar */}
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[13px] font-semibold" style={{ color: 'var(--text-strong)' }}>{monthLabel}</p>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => canGoPrev && shiftMonth(-1)}
                            disabled={!canGoPrev}
                            aria-label="Previous month"
                            className="flex items-center justify-center rounded-md"
                            style={{ width: 28, height: 28, background: 'transparent', border: '1px solid var(--border-default)', cursor: canGoPrev ? 'pointer' : 'not-allowed', color: canGoPrev ? 'var(--ocean-600)' : 'var(--text-subtle)', opacity: canGoPrev ? 1 : 0.4 }}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => shiftMonth(1)}
                            aria-label="Next month"
                            className="flex items-center justify-center rounded-md"
                            style={{ width: 28, height: 28, background: 'transparent', border: '1px solid var(--border-default)', cursor: 'pointer', color: 'var(--ocean-600)' }}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {WEEKDAY_LABELS.map((w, i) => (
                          <div key={i} className="text-center text-[10px] uppercase" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>{w}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {weeks.flat().map((d, i) => {
                          if (!d) return <div key={i} />;
                          const bookable = isBookableDay(d, today);
                          const active = sameDay(d, selectedDate);
                          return (
                            <button
                              key={i}
                              disabled={!bookable}
                              onClick={() => { setSelectedDate(d); setSlot(null); }}
                              className="flex items-center justify-center rounded-lg text-[12.5px] font-medium transition-colors"
                              style={{
                                height: 34,
                                background: active ? 'var(--ocean-600)' : 'transparent',
                                color: active ? '#fff' : bookable ? 'var(--ocean-600)' : 'var(--text-subtle)',
                                border: `1px solid ${active ? 'var(--ocean-600)' : bookable ? 'var(--ocean-200)' : 'transparent'}`,
                                cursor: bookable ? 'pointer' : 'default',
                                opacity: bookable ? 1 : 0.35,
                              }}
                            >
                              {d.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time column */}
                    <div className="flex-shrink-0 sm:w-[164px] flex flex-col" style={{ minHeight: 0 }}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[12px] font-semibold" style={{ color: 'var(--text-strong)' }}>
                          {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <p className="text-[10px] mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>Pacific Time</p>
                      <div className="flex flex-col gap-1.5 overflow-y-auto pr-1" style={{ maxHeight: 248 }}>
                        {SLOT_TIMES.map((t, si) => {
                          const booked = slotBooked(selectedDate, si);
                          const active = slot === t;
                          return (
                            <button
                              key={t}
                              disabled={booked}
                              onClick={() => setSlot(t)}
                              className="rounded-lg py-2 text-[12.5px] font-medium transition-colors flex-shrink-0"
                              style={{
                                background: active ? 'var(--ocean-600)' : booked ? 'var(--surface-sunken)' : 'var(--surface-card)',
                                color: active ? '#fff' : booked ? 'var(--text-subtle)' : 'var(--ocean-600)',
                                border: `1px solid ${active ? 'var(--ocean-600)' : booked ? 'var(--border-subtle)' : 'var(--ocean-200)'}`,
                                cursor: booked ? 'not-allowed' : 'pointer',
                                textDecoration: booked ? 'line-through' : 'none',
                                opacity: booked ? 0.6 : 1,
                              }}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={!slot}
                    onMouseEnter={() => setConfirmHovered(true)}
                    onMouseLeave={() => setConfirmHovered(false)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13.5px] font-semibold transition-colors mt-4 flex-shrink-0"
                    style={{
                      background: !slot ? 'var(--surface-sunken)' : confirmHovered ? 'var(--ocean-700, #1f6f8b)' : 'var(--ocean-600)',
                      color: !slot ? 'var(--text-subtle)' : '#fff',
                      border: 'none',
                      cursor: slot ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <CalendarDays className="w-4 h-4" />
                    {slot ? `Continue with ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${slot}` : 'Select a time to continue'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SellerContactsPanel() {
  const [scheduling, setScheduling] = useState(false);
  const [booked, setBooked] = useState(null);
  const [hovered, setHovered] = useState(false);
  const am = sellerContacts[0] ?? { initials: 'AM', name: 'Your account manager', role: 'Account Manager' };

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--ocean-200)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-[16.5px] font-semibold"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
        >
          Account team
        </h3>
        <span
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--ocean-200)',
            color: 'var(--ocean-600)',
          }}
        >
          seller
        </span>
      </div>
      <div className="space-y-3">
        {sellerContacts.map((c) => (
          <div key={c.initials} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: 'var(--ocean-200)',
                color: 'var(--ocean-600)',
              }}
            >
              {c.initials}
            </div>
            <div>
              <p className="text-[13.5px] font-semibold leading-tight" style={{ color: 'var(--text-strong)' }}>
                {c.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{c.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule call CTA */}
      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {booked ? (
          <button
            onClick={() => setScheduling(true)}
            className="w-full rounded-lg px-3 py-2 flex items-center gap-2.5 text-left"
            style={{ background: 'var(--ocean-200)', border: '1px solid var(--ocean-200)', cursor: 'pointer' }}
          >
            <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--ocean-600)' }} />
            <div>
              <p className="text-[12.5px] font-semibold leading-tight" style={{ color: 'var(--ocean-600)' }}>
                Call booked with {am.name.split(' ')[0]}
              </p>
              <p className="text-[10.5px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                {booked.day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {booked.slot}
              </p>
            </div>
          </button>
        ) : (
          <button
            onClick={() => setScheduling(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full rounded-lg px-3 py-2 flex items-center gap-2.5 text-left"
            style={{
              background: hovered ? 'var(--ocean-200)' : 'var(--surface-sunken)',
              border: '1px solid var(--ocean-200)',
              cursor: 'pointer',
            }}
          >
            <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--ocean-600)' }} />
            <div>
              <p className="text-[12.5px] font-semibold leading-tight" style={{ color: 'var(--ocean-700, var(--ocean-600))' }}>
                Schedule a call with your AM
              </p>
              <p className="text-[10.5px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                {am.name} · pick a time
              </p>
            </div>
          </button>
        )}
      </div>

      {scheduling && (
        <ScheduleModal
          am={am}
          onClose={() => setScheduling(false)}
          onBooked={setBooked}
        />
      )}
    </div>
  );
}

// ── Deck teaser card ──────────────────────────────────────────────────────────

const TEASER_INDICES = [0, 3, 5]; // Cover, Pricing, Next Steps

function DeckTeaserCard({ onViewDeck }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div>
          <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--text-strong)' }}>
            Renewals Deck
          </p>
          <p className="text-[10px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
            Generated by the Proposal Agent · {SLIDES.length} slides
          </p>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="p-3 flex gap-2">
        {TEASER_INDICES.map((idx) => {
          const { Component, title } = SLIDES[idx];
          return (
            <button
              key={idx}
              onClick={onViewDeck}
              className="flex-1 flex flex-col gap-1 cursor-pointer"
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
            >
              <div
                className="w-full overflow-hidden rounded"
                style={{
                  aspectRatio: '16 / 9',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', inset: 0 }}>
                  <Component size="thumb" />
                </div>
              </div>
              <p
                className="truncate"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--text-subtle)' }}
              >
                {title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="px-3 pb-3">
        <button
          onClick={onViewDeck}
          className="w-full rounded-lg py-2 text-[12px] font-semibold"
          style={{
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-default)',
            color: 'var(--clay-600)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--clay-100)'; e.currentTarget.style.borderColor = 'var(--clay-200)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-sunken)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
        >
          View full deck →
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function HomeTab({ selectedOption, onOptionChange, featureFlags, onTabChange }) {
  return (
    <div className="grid grid-cols-12 gap-5 items-start">
      <div className="col-span-3 space-y-4">
        <CountdownBox />
        <ContractStats />
        <RenewalPathStrip />
        <UtilizationList showBars={featureFlags?.showUsageData !== false} />
      </div>

      <div className="col-span-6 space-y-4 self-stretch flex flex-col">
        <WhatChangedCard selectedOption={selectedOption} />
        <div className="flex-1">
          <ProposedChanges
            selectedOption={selectedOption}
            onOptionChange={onOptionChange}
            showHighlights={featureFlags?.showHighlights !== false}
          />
        </div>
      </div>

      <div className="col-span-3 space-y-4">
        {featureFlags?.showChatbot !== false && <ChatbotWidget />}
        {featureFlags?.showProposalDeck !== false && (
          <DeckTeaserCard onViewDeck={() => onTabChange?.('proposal-deck')} />
        )}
        <SellerContactsPanel />
        <BuyerTeamPanel />
      </div>
    </div>
  );
}
