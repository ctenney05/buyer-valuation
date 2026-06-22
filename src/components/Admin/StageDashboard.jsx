import PipelineFunnel from './PipelineFunnel.jsx';
import PipelineList from './PipelineList.jsx';
import StatusPill from './StatusPill.jsx';
import { dealsForQuarter, QUARTER_LABEL } from '../../data/orgMetrics.js';
import { formatCurrency } from '../../data/format.js';

// Stage-level: all accounts in one stage for the quarter, with per-stage status
// pills. Pinned compact funnel stays for navigation between stages.
export default function StageDashboard({ deals, quarter, stage, selectedDealId, onSelectStage, onSelectDeal }) {
  const quarterDeals = dealsForQuarter(deals, quarter);
  const stageDeals = quarterDeals.filter((d) => d.stage === stage);
  const stageArr = stageDeals.reduce((s, d) => s + (d.arr ?? d.annualValue ?? 0), 0);

  const statusColumn = { label: 'Status', render: (deal) => <StatusPill deal={deal} /> };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <PipelineFunnel deals={quarterDeals} activeStage={stage} compact onSelectStage={onSelectStage} />
        <div className="flex items-baseline justify-between mt-4">
          <h2 className="font-bold" style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', color: 'var(--text-strong)' }}>
            {stage} <span style={{ color: 'var(--text-subtle)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>· {QUARTER_LABEL[quarter]}</span>
          </h2>
          <span className="text-[12px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>
            {stageDeals.length} account{stageDeals.length === 1 ? '' : 's'} · {formatCurrency(stageArr)}
          </span>
        </div>
      </div>

      {stageDeals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>No accounts in {stage} for {QUARTER_LABEL[quarter]}.</p>
        </div>
      ) : (
        <PipelineList deals={stageDeals} selectedDealId={selectedDealId} onSelect={onSelectDeal} statusColumn={statusColumn} />
      )}
    </div>
  );
}
