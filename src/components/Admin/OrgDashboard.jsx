import MetricsRow from './MetricsRow.jsx';
import PipelineFunnel from './PipelineFunnel.jsx';
import PipelineList from './PipelineList.jsx';
import { dealsForQuarter } from '../../data/orgMetrics.js';

// Org-level overview: KPIs + ARR-weighted funnel (quarter-scoped) + the account
// list for the quarter. The landing screen.
export default function OrgDashboard({ deals, quarter, selectedDealId, onSelectStage, onSelectDeal }) {
  const quarterDeals = dealsForQuarter(deals, quarter);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Metrics + funnel (fixed) */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4 space-y-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <MetricsRow deals={quarterDeals} />
        <div>
          <p className="uppercase mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-subtle)' }}>
            Pipeline — click a stage to drill in
          </p>
          <PipelineFunnel deals={quarterDeals} onSelectStage={onSelectStage} />
        </div>
      </div>

      {/* Accounts this quarter (full width) */}
      <div className="flex-1 flex overflow-hidden">
        <PipelineList deals={quarterDeals} selectedDealId={selectedDealId} onSelect={onSelectDeal} />
      </div>
    </div>
  );
}
