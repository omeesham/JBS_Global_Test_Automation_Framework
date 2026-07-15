/**
 * Corporate Pricing — selector sub-barrel (per-module namespace isolation).
 *
 * This module is multi-screen (Search / Details-shell / Strategy / Detail / Override / New Pricebook),
 * so it uses a per-module sub-barrel (this file) that merges its 6 screen partitions into one
 * `CorporatePricingSelectors` namespace for a single import surface. The top-level barrel
 * re-exports `CorporatePricingSelectors` and runs the intra-module collision check
 * (see `src/selectors/index.ts`).
 *
 * Selector strategy: text / role / grid-column-header / content-anchored. Near-zero
 * data-testid coverage (Search = 3 generic e2e-*; Details/Detail = 0). No data-testid
 * assumptions; no reuse of `selectors/locations/pricing.ts` (the per-location Pricing tab).
 */
import { CorporatePricingSearchSelectors } from './search';
import { CorporatePricingDetailsSelectors } from './details';
import { CorporatePricingStrategySelectors } from './strategy';
import { CorporatePricingDetailGridSelectors } from './pricing-detail';
import { CorporatePricingOverrideSelectors } from './override';
import { CorporatePricingNewPricebookSelectors } from './new-pricebook';

export { CorporatePricingSearchSelectors } from './search';
export { CorporatePricingDetailsSelectors } from './details';
export { CorporatePricingStrategySelectors } from './strategy';
export { CorporatePricingDetailGridSelectors } from './pricing-detail';
export { CorporatePricingOverrideSelectors } from './override';
export { CorporatePricingNewPricebookSelectors } from './new-pricebook';

export const CorporatePricingSelectors = {
  ...CorporatePricingSearchSelectors,
  ...CorporatePricingDetailsSelectors,
  ...CorporatePricingStrategySelectors,
  ...CorporatePricingDetailGridSelectors,
  ...CorporatePricingOverrideSelectors,
  ...CorporatePricingNewPricebookSelectors,
} as const;
