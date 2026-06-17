import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { roiDefaults, roiLineItems } from '../../data/roiData.js';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

function InputRow({ label, hint, value, onChange, min, max, step, prefix, suffix }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      <div className="flex items-center gap-3">
        {prefix && <span className="text-sm text-slate-500 font-medium w-4">{prefix}</span>}
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <div className="flex items-center gap-0.5 w-20">
          {prefix && <span className="text-sm text-slate-500">{prefix}</span>}
          <input
            type="number"
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

export default function ROICalculatorTab() {
  const [hoursSaved, setHoursSaved] = useState(roiDefaults.hoursSavedPerUserPerMonth);
  const [hourlyRate, setHourlyRate] = useState(roiDefaults.avgHourlyRate);
  const [users, setUsers]           = useState(roiDefaults.activeUsers);

  const annualCost = 148500; // from renewalData — could import

  const results = useMemo(() => {
    const annualHours   = hoursSaved * 12 * users;
    const annualSavings = annualHours * hourlyRate;
    const lineTotal     = roiLineItems.reduce((sum, l) => sum + l.annualValue, 0);
    const totalBenefit  = annualSavings + lineTotal;
    const roi           = annualCost > 0 ? ((totalBenefit - annualCost) / annualCost) * 100 : 0;
    const paybackMonths = totalBenefit > 0 ? (annualCost / totalBenefit) * 12 : 0;
    return { annualHours, annualSavings, lineTotal, totalBenefit, roi, paybackMonths };
  }, [hoursSaved, hourlyRate, users]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-800">ROI Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Adjust Assumptions</h3>
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
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Calculated Results</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Annual Hours Saved',  value: formatNumber(results.annualHours) + ' hrs' },
              { label: 'Productivity Value',  value: formatCurrency(results.annualSavings)        },
              { label: 'Total Annual Benefit',value: formatCurrency(results.totalBenefit)          },
              { label: 'Annual Cost',         value: formatCurrency(annualCost)                    },
            ].map((r) => (
              <div key={r.label} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium">{r.label}</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">ROI</p>
              <p className="text-3xl font-bold text-indigo-700 mt-0.5">{results.roi.toFixed(0)}%</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Payback</p>
              <p className="text-3xl font-bold text-emerald-700 mt-0.5">{results.paybackMonths.toFixed(1)} mo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Benefit Breakdown</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left bg-slate-50">
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Annual Hours</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Annual Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roiLineItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{item.category}</span>
                </td>
                <td className="px-5 py-4 text-slate-700">{item.description}</td>
                <td className="px-5 py-4 text-slate-500 tabular-nums text-right">{item.annualHours > 0 ? formatNumber(item.annualHours) : '—'}</td>
                <td className="px-5 py-4 text-slate-700 tabular-nums font-medium text-right">{formatCurrency(item.annualValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
