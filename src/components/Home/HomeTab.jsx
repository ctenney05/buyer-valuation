import { TrendingUp, TrendingDown, Minus, CalendarDays, CheckCircle2, Circle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { renewal, metrics, actionItems, keyDates } from '../../data/renewalData.js';

// ── helpers ────────────────────────────────────────────────────────────────

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ── sub-components ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  'on-track':       { label: 'On Track',       bg: 'bg-emerald-50', text: 'text-emerald-700', Icon: CheckCircle2 },
  'review-needed':  { label: 'Review Needed',  bg: 'bg-amber-50',   text: 'text-amber-700',   Icon: AlertTriangle },
  'at-risk':        { label: 'At Risk',         bg: 'bg-red-50',     text: 'text-red-700',     Icon: XCircle },
};

function RenewalBanner() {
  const days = daysUntil(renewal.renewalDate);
  const cfg = STATUS_CONFIG[renewal.status] ?? STATUS_CONFIG['on-track'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-800">{renewal.vendor}</h2>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
              <cfg.Icon className="w-3 h-3" />
              {cfg.label}
            </span>
          </div>
          <p className="text-sm text-slate-500">{renewal.product}</p>
          <p className="text-xs text-slate-400 mt-1">
            {formatDate(renewal.contractStart)} – {formatDate(renewal.renewalDate)}
          </p>
        </div>

        <div className="flex gap-6 sm:text-right">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Renews in</p>
            <p className={`text-3xl font-bold ${days <= 60 ? 'text-red-600' : days <= 120 ? 'text-amber-600' : 'text-slate-800'}`}>
              {days}
            </p>
            <p className="text-xs text-slate-500">days</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Annual Spend</p>
            <p className="text-3xl font-bold text-slate-800">{formatCurrency(renewal.annualSpend)}</p>
            <p className="text-xs text-slate-500">{renewal.currency}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
        <span><span className="font-medium text-slate-700">AE:</span> {renewal.accountExecutive}</span>
        <span><span className="font-medium text-slate-700">CSM:</span> {renewal.csm}</span>
        <span><span className="font-medium text-slate-700">Renewal date:</span> {formatDate(renewal.renewalDate)}</span>
      </div>
    </div>
  );
}

function TrendIcon({ trend }) {
  if (trend === 'up')   return <TrendingUp   className="w-3.5 h-3.5" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5" />;
  return <Minus className="w-3.5 h-3.5" />;
}

function MetricsRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const isUp      = m.trend === 'up';
        const isDown    = m.trend === 'down';
        const deltaColor = isUp ? 'text-red-600 bg-red-50' : isDown ? 'text-amber-600 bg-amber-50' : 'text-slate-500 bg-slate-100';

        return (
          <div key={m.label} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{m.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{m.value}</p>
            {m.delta !== '—' && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded mt-2 ${deltaColor}`}>
                <TrendIcon trend={m.trend} />
                {m.delta}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActionItems() {
  const done  = actionItems.filter((a) => a.done).length;
  const total = actionItems.length;
  const pct   = Math.round((done / total) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">Action Items</h3>
        <span className="text-xs text-slate-500">{done} of {total} complete</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-3">
        {actionItems.map((item) => (
          <li key={item.id} className={`flex items-start gap-3 ${item.done ? 'opacity-50' : ''}`}>
            <div className="mt-0.5 flex-shrink-0">
              {item.done
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                : <Circle className="w-4 h-4 text-slate-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm text-slate-700 ${item.done ? 'line-through' : ''}`}>{item.task}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{item.owner}</span>
              <span className="text-xs text-slate-400">{formatDate(item.dueDate)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const DATE_TYPE_CONFIG = {
  critical: { dot: 'bg-red-500',   text: 'text-red-700',   label: 'bg-red-50'   },
  warning:  { dot: 'bg-amber-400', text: 'text-amber-700', label: 'bg-amber-50' },
  info:     { dot: 'bg-slate-400', text: 'text-slate-600', label: 'bg-slate-50' },
};

function KeyDates() {
  const sorted = [...keyDates].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <CalendarDays className="w-4 h-4 text-slate-400" />
        <h3 className="font-semibold text-slate-800">Key Dates</h3>
      </div>

      <ol className="relative border-l border-slate-200 ml-2 space-y-5">
        {sorted.map((kd) => {
          const cfg = DATE_TYPE_CONFIG[kd.type] ?? DATE_TYPE_CONFIG.info;
          const days = daysUntil(kd.date);
          return (
            <li key={kd.label} className="ml-5">
              <span className={`absolute -left-[5px] w-2.5 h-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-700">{kd.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.label} ${cfg.text}`}>
                  {formatDate(kd.date)}
                </span>
                <span className="text-xs text-slate-400">
                  {days > 0 ? `in ${days} days` : days === 0 ? 'today' : `${Math.abs(days)} days ago`}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── main export ─────────────────────────────────────────────────────────────

export default function HomeTab() {
  return (
    <div className="space-y-6">
      <RenewalBanner />
      <MetricsRow />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionItems />
        <KeyDates />
      </div>
    </div>
  );
}
