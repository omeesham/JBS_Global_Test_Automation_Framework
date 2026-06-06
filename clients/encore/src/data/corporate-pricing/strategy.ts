/**
 * Corporate Pricing — Pricing Strategy test data.
 * Verified on the live app, 2026-06-05. Only live-verified values are committed. Volatile
 * values (locations, flags) are asserted by content/containment, not exact counts.
 *
 * Mutation safety: save-cycle tests mutate the `strategyFixture` and restore via
 * `ensureDefaultState()`. The only UI-reversible save mutation is editing the EXISTING strategy's
 * name (rename → save → rename back). Persisting a NEW strategy is NOT UI-reversible (a saved
 * strategy becomes legacy and loses its Remove control) — so add/remove tests discard WITHOUT saving,
 * and full new-strategy persistence is left to a follow-up Strategy coverage pass.
 */
import { CORPORATE_PRICING_COMMON, CORPORATE_PRICING_FIXTURES } from './common';

export const STRATEGY = {
  office: CORPORATE_PRICING_COMMON.office, // '1604'
  /** strategyFixture pricebook (Strategy suite only — distinct from detailFixture). */
  pricebookGuid: CORPORATE_PRICING_FIXTURES.strategyFixture.guid, // 5f2a4088-9268-b033-4925-a48146afb1cb
  pricebookName: CORPORATE_PRICING_FIXTURES.strategyFixture.name, // '2022-NP Tier 1'

  /** The single (legacy) strategy on this pricebook — same name as the book here. */
  fixtureStrategyName: '2022-NP Tier 1',

  /** Read-only header reference values (live 2026-06-05). */
  header: {
    name: '2022-NP Tier 1',
    type: 'Equipment', // Labor/Equipment
    year: '2022',
    currency: 'USD',
    active: 'Active',
  },

  /** Strategy editor flag checkboxes (live state on this fixture). */
  flags: {
    isProductions: { checked: true, disabled: false },
    isInternal: { checked: false, disabled: true },
    isGSO: { checked: false, disabled: true },
    isActive: { checked: true, disabled: false },
  },

  /** Locations assigned to the fixture strategy (assert containment, not exact count). */
  expectedLocations: [
    { office: '1991', name: 'Premier Global Events' },
    { office: '7011', name: 'Production' },
  ],

  /** Reversible edit marker for the existing strategy name (save-cycle TCs). */
  reversibleEdit: {
    editedName: '2022-NP Tier 1 (qa)',
    restoredName: '2022-NP Tier 1',
  },

  /** Safe payload for the Add-New dialog (add-then-discard ONLY — never saved). */
  newStrategyPayload: {
    name: 'ZZ-QA-TEMP-STRATEGY (discard)',
  },

  /** Tabs: live shows 2; the requirements name 3 (History absent on the live app). */
  liveTabs: ['Pricing Strategy', 'Pricing Detail'] as const,
  docxTabs: ['Pricing Strategy', 'Pricing Detail', 'History'] as const,
  absentTab: 'History',
} as const;
