import { stageStatusFor } from '../../data/orgMetrics.js';
import { TONE_BG } from '../../data/stages.js';

// One source of truth for a deal's stage-status pill. Buyer Evaluation derives
// from engagementSignal (via stageStatusFor) so it matches the per-account signal.
export default function StatusPill({ deal }) {
  const { label, color } = stageStatusFor(deal);
  const bg = TONE_BG[color] ?? 'var(--surface-sunken)';
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: bg }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[10px] font-semibold whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color }}>
        {label}
      </span>
    </span>
  );
}
