/**
 * Corporate Pricing — New Pricebook create-flow test data (NM-1440).
 * Verified on the live app, 2026-06-09 (both `?type=equipment` and `?type=labor`).
 *
 * MUTATION SAFETY (Doctrine 7 / CPR-1440-Q4): the New Pricebook create flow has NO reversible
 * mutation fixture — a committed pricebook is IRREVERSIBLE via the UI (no delete/deactivate). So
 * there is NO entry in `CORPORATE_PRICING_FIXTURES` for this screen; the spec is NO-COMMIT (asserts
 * the create form + Save reachability, then Cancels the confirm dialog). The "create-mode fixture"
 * is purely the input data below — nothing is persisted in CI. Baseline (LR-019) = a fresh,
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

  // ---- Name FCC inputs ----
  validName: 'QA New Pricebook',
  singleCharName: 'A',
  /** 250-char name — accepted with no client truncation (no maxlength hit at 250). */
  longName: 'Z'.repeat(250),
  specialName: 'AT&T <Tag> #1 "Q" é',
  /** Whitespace-only — treated as empty (Save stays disabled). */
  whitespaceName: '   ',

  // ---- Year FCC inputs ----
  validYear: '2026',
  /** Decimal — accepted client-side (Save stays enabled); raised as CPR-1440-Q3. */
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

  /** Product-group source anchors (content-anchored; never count-assert — LR-022). */
  equipmentGroupA: 'Balloon Light Decor',          // ID 277
  equipmentGroupB: 'Analog Mixer 12 - 23 Ch',      // ID 280
  /** Labor catalog sample (differs from Equipment — type-specific). */
  laborGroupSample: ['Banners Design', 'Branding Media Production', 'Content Development'] as const,

  /** Save confirmation dialog (LR-012 shared). */
  saveDialog: {
    title: 'Save Changes',
    body: 'Are you sure you want to save the changes?',
  },
} as const;
