import { FileText, Download } from 'lucide-react';
import { contracts } from '../../data/contractHistory.js';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_STYLES = {
  active:           { background: '#DCFCE7', color: '#15803D' },
  expired:          { background: 'var(--cream-200)', color: 'var(--text-muted)' },
  'in-negotiation': { background: 'var(--clay-100)', color: 'var(--clay-700)' },
};

const STATUS_LABELS = {
  active:           'Active',
  expired:          'Expired',
  'in-negotiation': 'In Negotiation',
};

export default function ContractHistoryTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5" style={{ color: 'var(--text-subtle)' }} />
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
        >
          Contract History
        </h2>
        <span className="text-xs ml-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
          {contracts.length} contracts
        </span>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)' }}>
                {['Term', 'Annual Value', 'Seats', 'Status', 'Signed', 'Notes', 'PDF'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10.5px',
                      fontWeight: 600,
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
              {contracts.map((c, idx) => (
                <tr
                  key={c.id}
                  style={idx < contracts.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : undefined}
                >
                  <td className="px-5 py-4 font-medium whitespace-nowrap" style={{ color: 'var(--text-body)' }}>
                    {c.term}
                  </td>
                  <td className="px-5 py-4 font-semibold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
                    {formatCurrency(c.annualValue)}
                  </td>
                  <td className="px-5 py-4 tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>
                    {c.seats}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={STATUS_STYLES[c.status] ?? STATUS_STYLES.expired}
                    >
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
                    {formatDate(c.signedDate)}
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {c.notes}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1 text-xs font-medium transition-colors"
                      style={{ color: 'var(--clay-600)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--clay-700)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--clay-600)')}
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
