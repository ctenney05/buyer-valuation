import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { roiDefaults } from '../../data/roiData.js';
import { renewal } from '../../data/renewalData.js';
import { formatCurrency } from '../../data/format.js';

function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

function InputRow({ label, hint, value, onChange, min, max, step, prefix, suffix }) {
  const minLabel = prefix ? `${prefix}${min}` : `${min}${suffix ? ' ' + suffix : ''}`;
  const maxLabel = prefix ? `${prefix}${max}` : `${max}${suffix ? ' ' + suffix : ''}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>{label}</label>
          {hint && <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>{hint}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {prefix && (
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--clay-600)' }}>
              {prefix}
            </span>
          )}
          <input
            type="number"
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="text-base font-semibold text-right rounded-md px-2 py-0.5 outline-none w-20"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--clay-600)',
              border: '1px solid var(--border-default)',
              background: 'var(--surface-card)',
            }}
          />
          {suffix && (
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--clay-600)' }}>
              {suffix}
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-clay-500"
        style={{ cursor: 'pointer', height: '6px' }}
      />
      <div className="flex justify-between" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-subtle)' }}>
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function ROICalculatorTab() {
  const [hoursSaved, setHoursSaved] = useState(roiDefaults.hoursSavedPerUserPerMonth);
  const [hourlyRate, setHourlyRate] = useState(roiDefaults.avgHourlyRate);
  const [users, setUsers]           = useState(roiDefaults.activeUsers);

  const annualCost = renewal.annualCost;

  const results = useMemo(() => {
    const annualHours   = hoursSaved * 12 * users;
    const annualSavings = annualHours * hourlyRate;
    const roi           = annualCost > 0 ? ((annualSavings - annualCost) / annualCost) * 100 : 0;
    const paybackMonths = annualSavings > 0 ? (annualCost / annualSavings) * 12 : 0;
    return { annualHours, annualSavings, roi, paybackMonths };
  }, [hoursSaved, hourlyRate, users]);

  const cardStyle = {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    boxShadow: 'var(--shadow-sm)',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5" style={{ color: 'var(--text-subtle)' }} />
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
        >
          ROI Calculator
        </h2>
      </div>

      <p className="text-[13.5px]" style={{ color: 'var(--text-muted)' }}>
        Adjust the inputs below to model your team's time savings and see how the investment pays back.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="rounded-xl p-6 space-y-6" style={cardStyle}>
          <h3
            className="font-semibold text-sm uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
          >
            Adjust Assumptions
          </h3>
          <InputRow
            label="Hours saved per user per month"
            hint="Estimated time the platform saves each active user"
            value={hoursSaved} onChange={setHoursSaved}
            min={0} max={20} step={0.5} suffix="hrs"
          />
          <InputRow
            label="Average fully-loaded hourly rate"
            hint="Blended rate across your active user base"
            value={hourlyRate} onChange={setHourlyRate}
            min={20} max={250} step={5} prefix="$"
          />
          <InputRow
            label="Active users"
            value={users} onChange={setUsers}
            min={1} max={500} step={1} suffix="users"
          />
        </div>

        {/* Outputs */}
        <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
          <h3
            className="font-semibold text-sm uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
          >
            Calculated Results
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Annual Hours Saved', value: formatNumber(results.annualHours) + ' hrs' },
              { label: 'Productivity Value', value: formatCurrency(results.annualSavings)       },
              { label: 'Annual Cost',        value: formatCurrency(annualCost)                  },
              { label: 'Net Benefit',        value: formatCurrency(results.annualSavings - annualCost) },
            ].map((r) => (
              <div key={r.label} className="rounded-lg p-3" style={{ background: 'var(--surface-sunken)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>{r.label}</p>
                <p
                  className="text-lg font-bold mt-0.5"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}
                >
                  {r.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="rounded-lg p-4 text-center" style={{ background: 'var(--clay-100)' }}>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--clay-600)' }}
              >
                ROI
              </p>
              <p
                className="text-3xl font-bold mt-0.5"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--clay-700)' }}
              >
                {results.roi.toFixed(0)}%
              </p>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ background: '#F0FDF4' }}>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono)', color: '#16A34A' }}
              >
                Payback
              </p>
              <p
                className="text-3xl font-bold mt-0.5"
                style={{ fontFamily: 'var(--font-mono)', color: '#15803D' }}
              >
                {results.paybackMonths.toFixed(1)} mo
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
