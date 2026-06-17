import { FileText } from 'lucide-react';
import { contracts } from '../../data/contractHistory.js';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_STYLES = {
  active:           'bg-emerald-50 text-emerald-700',
  expired:          'bg-slate-100 text-slate-500',
  'in-negotiation': 'bg-amber-50 text-amber-700',
};

const STATUS_LABELS = {
  active:           'Active',
  expired:          'Expired',
  'in-negotiation': 'In Negotiation',
};

export default function ContractHistoryTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-800">Contract History</h2>
        <span className="text-xs text-slate-400 ml-1">{contracts.length} contracts</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Term</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Annual Value</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Seats</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Signed</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-700 whitespace-nowrap">{c.term}</td>
                  <td className="px-5 py-4 text-slate-700 tabular-nums">{formatCurrency(c.annualValue)}</td>
                  <td className="px-5 py-4 text-slate-700 tabular-nums">{c.seats}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status] ?? STATUS_STYLES.expired}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{formatDate(c.signedDate)}</td>
                  <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
