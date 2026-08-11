// scripts/walk-coverage/lib/module-config.mjs
// Pure data — no imports, no side effects.
// Single source of truth for per-module requiredStates consumed by verify-denominator.mjs
// (W-DENOM gate, LR-062). Must stay in sync with the requiredStates entries in
// enumerate-page.mjs MODULE_CONFIG whenever a module's required walk states change.
//
// Item 1(c): A resting-only declaration MUST carry an `evidence` field citing the enumeration
// run that found zero openers, or verify-denominator will fail it. A hand-written comment
// is not evidence — the evidence field must reference a dated walk artifact or run ID.

export const MODULE_CONFIG = {
  // Service Charge — resting state (Basic Information tab default) + History tab state.
  'service-charge': {
    requiredStates: [
      { label: 'resting' },
      { label: 'tab:history' },
    ],
  },
  pricing: {
    requiredStates: [{ label: 'resting' }, { label: 'cascade:alt-on' }],
    dependencyPairs: [
      { source: 'override-price', dependent: 'current-price', description: 'Override Price → Current Price' },
      { source: 'max-discount', dependent: 'location-pricing-export', description: 'Max Discount → Location Pricing export value' },
    ],
    editableFields: ['override-price', 'max-discount'],
  },
  'corporate-pricing-search': {
    requiredStates: [{ label: 'resting' }, { label: 'expand:import-menu' }],
  },
  // Strategy tab: resting-only declaration with evidence from enumeration run.
  'corporate-pricing-strategy': {
    requiredStates: [{ label: 'resting', evidence: 'enumeration:2026-06-05:zero-openers-found' }],
  },
  // Pricing Detail grid: resting-only declaration with evidence from enumeration run.
  'corporate-pricing-detail': {
    requiredStates: [{ label: 'resting', evidence: 'enumeration:2026-06-05:zero-openers-found' }],
  },
  // New Pricebook form: resting-only declaration with evidence from enumeration run.
  'corporate-pricing-new-pricebook': {
    requiredStates: [{ label: 'resting', evidence: 'enumeration:2026-06-05:zero-openers-found' }],
  },
  // Override surface has two tabs (Equipment/Labor), a currency combobox, and a rows-per-page
  // combobox — each exposes distinct elements. A re-walk with a location selected and a non-ALL
  // currency additionally exposes the Product-Group Picker add controls (NM-1472).
  'corporate-override': {
    requiredStates: [
      { label: 'resting' },
      { label: 'tab:labor' },
      { label: 'expand:currency' },
      { label: 'expand:rows-per-page' },
      { label: 'location-selected+non-all-currency' },
    ],
    dependencyPairs: [
      { source: 'override-price', dependent: 'current-price', description: 'Override Price → Current Price (per-location)' },
    ],
    editableFields: ['override-price'],
  },
};
