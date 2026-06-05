/**
 * Corporate Pricing — selector sub-barrel (LR-017 namespace isolation).
 *
 * NOTE (F11 — intentional NEW sub-pattern): existing modules import their partitions DIRECTLY
 * into the top-level `src/selectors/index.ts`. Corporate Pricing introduces a per-module
 * sub-barrel (this file) that merges its 4 screen partitions into one `CorporatePricingSelectors`
 * namespace. This is a deliberate new convention (not existing precedent) — chosen because this
 * module is multi-screen (Search / Details-shell / Strategy / Detail) and benefits from a single
 * import surface. The top-level barrel re-exports `CorporatePricingSelectors` and runs the
 * intra-module collision check (see `src/selectors/index.ts`).
 *
 * SELECTOR STRATEGY (Doctrine 4 / D8): text / role / grid-column-header / content-anchored.
 * Near-zero data-testid coverage (Search = 3 generic e2e-*; Details/Detail = 0). NO data-testid
 * assumptions; NO reuse of `selectors/locations/pricing.ts` (per-location Pricing tab, LR-017).
 */
import { CorporatePricingSearchSelectors } from './search';
import { CorporatePricingDetailsSelectors } from './details';
import { CorporatePricingStrategySelectors } from './strategy';
import { CorporatePricingDetailGridSelectors } from './pricing-detail';

export { CorporatePricingSearchSelectors } from './search';
export { CorporatePricingDetailsSelectors } from './details';
export { CorporatePricingStrategySelectors } from './strategy';
export { CorporatePricingDetailGridSelectors } from './pricing-detail';

/** Merged Corporate Pricing namespace (all 4 screen partitions). */
export const CorporatePricingSelectors = {
  ...CorporatePricingSearchSelectors,
  ...CorporatePricingDetailsSelectors,
  ...CorporatePricingStrategySelectors,
  ...CorporatePricingDetailGridSelectors,
} as const;
