import { useState } from 'react';
import {
  FolderOpen, FileText, Download, ExternalLink, Check,
  Shield, History, Package,
} from 'lucide-react';
import { contracts } from '../../data/contractHistory.js';
import { documentGroups } from '../../data/documents.js';
import { formatCurrency } from '../../data/format.js';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Exported for reuse in the admin deal-detail Documents card (DealDetail.jsx).
export const GROUP_ICONS = {
  shield:  Shield,
  history: History,
  package: Package,
};

// File-format badge styling — clay for the live agreement link, ink for files.
const FORMAT_STYLES = {
  PDF:  { background: 'var(--clay-100)',     color: 'var(--clay-700)' },
  DOCX: { background: 'var(--ocean-200)',    color: 'var(--ocean-600)' },
  Link: { background: 'var(--surface-sunken)', color: 'var(--text-muted)' },
};

const TAG_STYLES = {
  'Updated':          { background: 'var(--ocean-200)', color: 'var(--ocean-600)' },
  'New':              { background: '#DCFCE7',          color: '#15803D' },
  'Required to sign': { background: 'var(--clay-100)',  color: 'var(--clay-700)' },
};

// ── Contract history table ────────────────────────────────────────────────────

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

function ContractTable() {
  const [downloading, setDownloading] = useState(null);

  function handleDownload(contractId) {
    setDownloading(contractId);
    setTimeout(() => setDownloading(null), 1800);
  }

  return (
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
                  className={`px-5 py-3 ${['Annual Value', 'Seats'].includes(h) ? 'text-right' : 'text-left'}`}
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
                <td className="px-5 py-4 font-semibold tabular-nums text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
                  {formatCurrency(c.annualValue)}
                </td>
                <td className="px-5 py-4 tabular-nums text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>
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
                <td className="px-5 py-4 max-w-xs truncate" title={c.notes} style={{ color: 'var(--text-muted)' }}>
                  {c.notes}
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleDownload(c.id)}
                    className="flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{ color: downloading === c.id ? 'var(--success-600)' : 'var(--clay-600)', minWidth: '58px' }}
                    onMouseEnter={(e) => { if (downloading !== c.id) e.currentTarget.style.color = 'var(--clay-700)'; }}
                    onMouseLeave={(e) => { if (downloading !== c.id) e.currentTarget.style.color = 'var(--clay-600)'; }}
                  >
                    {downloading === c.id ? (
                      <><Check className="w-3.5 h-3.5" /> Saved</>
                    ) : (
                      <><Download className="w-3.5 h-3.5" /> PDF</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Document row ────────────────────────────────────────────────────────────

export function DocumentRow({ doc, isLast }) {
  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isLink = doc.format === 'Link';
  const fmt = FORMAT_STYLES[doc.format] ?? FORMAT_STYLES.PDF;

  function handleAction() {
    if (isLink && doc.url) {
      window.open(doc.url, '_blank', 'noopener');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5"
      style={isLast ? undefined : { borderBottom: '1px solid var(--border-subtle)' }}
    >
      {/* Format badge */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg"
        style={{ width: 42, height: 42, ...fmt }}
      >
        <FileText className="w-4 h-4" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7.5px', fontWeight: 700, letterSpacing: '0.04em', marginTop: 1 }}>
          {doc.format === 'Link' ? 'WEB' : doc.format}
        </span>
      </div>

      {/* Name + description */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-strong)' }}>
            {doc.name}
          </p>
          {doc.tag && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ fontFamily: 'var(--font-mono)', ...(TAG_STYLES[doc.tag] ?? TAG_STYLES.Updated) }}
            >
              {doc.tag}
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
          {doc.description}
        </p>
      </div>

      {/* Meta */}
      <div className="hidden sm:block text-right flex-shrink-0" style={{ minWidth: 96 }}>
        <p className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
          {formatDate(doc.date)}
        </p>
        {doc.size && (
          <p className="text-[10.5px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
            {doc.size}
          </p>
        )}
      </div>

      {/* Action */}
      <button
        onClick={handleAction}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-colors"
        style={{
          minWidth: 96,
          padding: '7px 12px',
          background: hovered ? 'var(--clay-600)' : 'var(--clay-100)',
          color: hovered ? '#fff' : 'var(--clay-700)',
          border: '1px solid var(--clay-200)',
          cursor: 'pointer',
        }}
      >
        {saved ? (
          <><Check className="w-3.5 h-3.5" /> Saved</>
        ) : isLink ? (
          <><ExternalLink className="w-3.5 h-3.5" /> Open</>
        ) : (
          <><Download className="w-3.5 h-3.5" /> Download</>
        )}
      </button>
    </div>
  );
}

// ── Document group section ────────────────────────────────────────────────────

function DocumentGroup({ group }) {
  const Icon = GROUP_ICONS[group.icon] ?? FileText;
  const count = group.kind === 'contracts' ? contracts.length : group.documents.length;

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 30, height: 30, background: 'var(--clay-100)', color: 'var(--clay-600)' }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3
              className="text-base font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
            >
              {group.title}
            </h3>
            <span className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
              {count}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{group.blurb}</p>
        </div>
      </div>

      {group.kind === 'contracts' ? (
        <ContractTable />
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {group.documents.map((doc, idx) => (
            <DocumentRow key={doc.id} doc={doc} isLast={idx === group.documents.length - 1} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Tab ───────────────────────────────────────────────────────────────────────

export default function DocumentsTab() {
  const totalDocs =
    contracts.length +
    documentGroups.reduce((sum, g) => sum + (g.kind === 'contracts' ? 0 : g.documents.length), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <FolderOpen className="w-5 h-5" style={{ color: 'var(--text-subtle)' }} />
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-strong)' }}
        >
          Documents
        </h2>
        <span className="text-xs ml-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
          {totalDocs} items
        </span>
      </div>

      {documentGroups.map((group) => (
        <DocumentGroup key={group.id} group={group} />
      ))}
    </div>
  );
}
