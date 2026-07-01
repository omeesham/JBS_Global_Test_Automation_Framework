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

  /**
   * Cross-surface seed for TC-CPR-STR-013 ("Locations Using Pricing As Default" grid).
   * Live-verified 2026-06-29: office 1604's Primary Equipment Pricing = this strategy ⇒ office 1604
   * appears in the strategy's grid. The grid is a read-only back-reference populated by a location
   * selecting the strategy as its Primary Pricing — so the test points office 1604's Primary
   * Equipment Pricing at this strategy, asserts 1604 surfaces in the grid, then restores the
   * location's original selection (the prior fixed-assignment data 1991/7011 had been reassigned
   * away, which is exactly what made the old row-shape loop pass vacuously on an empty grid).
   */
  crossSurfaceSeed: {
    office: '1604',
    strategyName: '2026-Tier 2 Resort B',
    pricebookGuid: 'd4f8d502-ca92-5fdf-91d6-5b1bee109f54',
  },

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

  /** Deep-coverage (NM-2261) — in-session strategy names; never saved (reload discards). */
  deep: {
    alpha: 'ZZ-QA-Alpha (discard)',
    bravo: 'ZZ-QA-Bravo (discard)',
    charlie: 'ZZ-QA-Charlie (discard)',
    inactiveFlag: 'ZZ-QA-Inactive-Flag (discard)',
    gsoFlag: 'ZZ-QA-GSO-Flag (discard)',
    internalFlag: 'ZZ-QA-Internal-Flag (discard)',
    productionsFlag: 'ZZ-QA-Productions-Flag (discard)',
    /** A 255-character entry — the name field caps input at 100 characters. */
    overLengthName: 'A'.repeat(255),
    nameMaxLength: 100,
    /** Special characters — accepted and preserved verbatim. */
    specialName: 'ZZ-Test & <Strategy> "2026"',
    /** Reusing the existing strategy name triggers the duplicate-name rejection. */
    duplicateName: '2022-NP Tier 1',
    duplicateError: 'A pricing strategy with this name already exists.',
    /** Reversible special-character rename of the existing strategy (restored afterward). */
    specialPersistName: '2022-NP Tier 1 & "QA"',
  },
} as const;
