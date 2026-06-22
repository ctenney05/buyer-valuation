// ===========================================================================
// portalConfig.js — initial portal feature flags per deal.
//
// The seller shapes what the buyer sees via PortalConfigCard (in DealDetail).
// The STARTING point for those toggles is derived from the Qualification agent's
// accountType (data/qualificationOutput.js): an upsell shows ROI + usage proof, a
// downsell hides them and leans on history. The seller can override any toggle.
// ===========================================================================

import { qualByDealId } from '../data/qualificationOutput.js';

// accountType -> initial featureFlags. Merged OVER each deal's own featureFlags.
export const FLAG_DEFAULTS = {
  upsell:   { showUsageData: true,  showROICalculator: true,  showContractHistory: true,  showProposalDeck: true,  showHighlights: false },
  flat:     { showUsageData: false, showROICalculator: true,  showContractHistory: true,  showProposalDeck: true,  showHighlights: true  },
  downsell: { showUsageData: false, showROICalculator: false, showContractHistory: true,  showProposalDeck: false, showHighlights: true  },
};

// Build the { [dealId]: featureFlags } map the dashboard starts from.
export function initDealFlags(deals) {
  return Object.fromEntries(
    deals.map((d) => {
      const qual = qualByDealId[d.id];
      const typeDefaults = FLAG_DEFAULTS[qual?.accountType] ?? {};
      return [d.id, { ...d.featureFlags, ...typeDefaults }];
    }),
  );
}
