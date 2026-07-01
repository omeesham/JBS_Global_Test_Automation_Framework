/**
 * Corporate Pricing — New Pricebook create-flow test data (NM-1440).
 * Verified on the live app, 2026-06-09 (both `?type=equipment` and `?type=labor`).
 *
 * MUTATION SAFETY: the New Pricebook create flow has NO reversible
 * mutation fixture — a committed pricebook is IRREVERSIBLE via the UI (no delete/deactivate). So
 * there is NO entry in `CORPORATE_PRICING_FIXTURES` for this screen; the spec is NO-COMMIT (asserts
 * the create form + Save reachability, then Cancels the confirm dialog). The "create-mode fixture"
 * is purely the input data below — nothing is persisted in CI. Baseline = a fresh,
 * always-empty create page per test (`open(type)` in `beforeEach`).
 */
import { CORPORATE_PRICING_COMMON } from './common';

export const NEW_PRICEBOOK = {
  office: CORPORATE_PRICING_COMMON.office, // '1604'

  /** Route options (the `?type=` param fixes the disabled Type field + the product-group catalog). */
  types: ['equipment', 'labor'] as const,

  /** Type display values (read-only combobox, per route). */
  typeDisplay: { equipment: 'Equipment', labor: 'Labor' } as const,

  /** Currency default + full option list (live-verified). */
  currencyDefault: 'USD',
  currencyOptions: ['USD', 'CAD', 'MXN'] as const,

  // ---- Name field-coverage inputs ----
  validName: 'QA New Pricebook',
  singleCharName: 'A',
  /** 250-char name — accepted with no client truncation (no maxlength hit at 250). */
  longName: 'Z'.repeat(250),
  specialName: 'AT&T <Tag> #1 "Q" é',
  /** Whitespace-only — treated as empty (Save stays disabled). */
  whitespaceName: '   ',

  /**
   * Committing persistence test ONLY — fixed name PREFIX; the spec appends a run-stamp suffix read
   * from process.env.PRICEBOOK_RUN_STAMP (passed in by CI/agent), falling back to the test-runner pid
   * — NEVER Date.now()/random (those are non-reproducible). Keeps each committed pricebook uniquely
   * searchable on the single-tenant environment.
   */
  persistNamePrefix: 'QA-Persist-',
  /**
   * Same committing-persistence pattern for the Labor create route — a DISTINCT prefix so a committed
   * Labor pricebook is separable from an Equipment one in Search (both routes share one Search screen).
   */
  persistNamePrefixLabor: 'QA-Persist-LAB-',

  // ---- Year field-coverage inputs ----
  validYear: '2026',
  /** Decimal — accepted client-side (Save stays enabled); server validation unverified. */
  decimalYear: '20.5',
  /** Alpha — rejected by the input (reverts to last valid). */
  alphaYear: 'abcd',

  /** Default name for an added (in-session, never-saved) strategy. */
  strategyName: 'QA-Tier-1',
  secondStrategyName: 'QA-Tier-2',

  /** Strategy dialog flag defaults (live-verified). */
  dialogFlagDefaults: {
    isActive: { checked: true },
    isGSO: { checked: false },
    isInternal: { checked: false },
    isProductions: { checked: false },
  },

  /** Product-group source anchors (content-anchored; never count-assert). */
  equipmentGroupA: 'Balloon Light Decor',          // ID 277
  equipmentGroupB: 'Analog Mixer 12 - 23 Ch',      // ID 280
  /** Labor catalog sample (differs from Equipment — type-specific). */
  laborGroupSample: ['Banners Design', 'Branding Media Production', 'Content Development'] as const,
  /**
   * A single known-addable Labor product group (catalog ID 400) — used as the commit fixture for the
   * Labor persist test, the Labor counterpart of `equipmentGroupA`. Live-verified add-able 2026-06-30.
   */
  laborGroupA: 'Banners Design',

  /**
   * An existing pricebook name (live on office 1604) — used to prove the create form does NOT
   * block a duplicate pricebook name client-side (NM-2022). The strategy name field DOES validate
   * uniqueness client-side (NM-2261); the pricebook-name field does not.
   */
  existingPricebookName: '2022-NP Tier 1',

  /** Empty-state hint on the empty Pricing Detail destination grid (create mode) — two stable phrases. */
  emptyStateHint: {
    addedPhrase: 'No items added yet',
    actionPhrase: 'Double-click or drag product groups from the sidebar',
  },

  /** Save confirmation dialog (shared "Save Changes" dialog). */
  saveDialog: {
    title: 'Save Changes',
    body: 'Are you sure you want to save the changes?',
  },
} as const;
