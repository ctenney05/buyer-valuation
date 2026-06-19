import { useState } from 'react';
import { Zap, CalendarDays } from 'lucide-react';
import {
  renewal, contractStats, utilization,
  orderForm, buyerTeam, sellerContacts,
} from '../../data/renewalData.js';

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

function UtilizationList() {
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
                <span
                  className="text-[13.5px] font-medium"
                  style={{ color: active ? 'var(--ink-800)' : 'var(--text-subtle)' }}
                >
                  {u.product}
                </span>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Center column ─────────────────────────────────────────────────────────────

function WhatChangedCard() {
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
            {orderForm.prevTotal} → <strong>{orderForm.total}</strong>
            <span style={{ color: 'var(--clay-600)' }}> ↑ 5%</span>
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
    </div>
  );
}

const HIGHLIGHT_COLORS = {
  removed: { headerBg: '#FECACA', bg: '#FEF2F2', bd: '#FECACA', fg: '#DC2626', tag: 'Clause Removed' },
  added:   { headerBg: '#BBF7D0', bg: '#F0FDF4', bd: '#BBF7D0', fg: '#16A34A', tag: 'Clause Added'   },
  changed: { headerBg: 'var(--clay-200)', bg: 'var(--clay-100)', bd: 'var(--clay-200)', fg: 'var(--clay-700)', tag: 'Clause Updated' },
};

function ProposedChanges({ selectedOption, onOptionChange }) {
  const [highlightsOn, setHighlightsOn] = useState(false);

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
                {orderForm.lineItems.map((item, i) => (
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
            <div className="flex justify-end mt-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-xs font-medium mr-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>TOTAL:</span>
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{orderForm.total}</span>
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

function BuyerTeamPanel() {
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

function SellerContactsPanel() {
  const [requested, setRequested] = useState(false);
  const [hovered, setHovered] = useState(false);

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
        {requested ? (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--ocean-600)' }} />
            <p className="text-[12px] font-medium" style={{ color: 'var(--ocean-600)' }}>
              Request sent — your AM will follow up shortly.
            </p>
          </div>
        ) : (
          <button
            onClick={() => setRequested(true)}
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
                {sellerContacts[0]?.name ?? 'Your account manager'}
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function HomeTab({ selectedOption, onOptionChange }) {
  return (
    <div className="grid grid-cols-12 gap-5 items-start">
      <div className="col-span-3 space-y-4">
        <CountdownBox />
        <ContractStats />
        <UtilizationList />
      </div>

      <div className="col-span-6 space-y-4 self-stretch flex flex-col">
        <WhatChangedCard />
        <div className="flex-1">
          <ProposedChanges selectedOption={selectedOption} onOptionChange={onOptionChange} />
        </div>
      </div>

      <div className="col-span-3 space-y-4">
        <ChatbotWidget />
        <SellerContactsPanel />
        <BuyerTeamPanel />
      </div>
    </div>
  );
}
