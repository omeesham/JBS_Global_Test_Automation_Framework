// scripts/walk-coverage/lib/module-config.mjs
// Pure data — no imports, no side effects.
// Single source of truth for per-module requiredStates consumed by verify-denominator.mjs
// (W-DENOM gate, LR-062). Must stay in sync with the requiredStates entries in
// enumerate-page.mjs MODULE_CONFIG whenever a module's required walk states change.

export const MODULE_CONFIG = {
  pricing: {
    requiredStates: [{ label: 'resting' }, { label: 'cascade:alt-on' }],
  },
  'corporate-pricing-search': {
    requiredStates: [{ label: 'resting' }, { label: 'expand:import-menu' }],
  },
};
