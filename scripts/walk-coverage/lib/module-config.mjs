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
  // Strategy tab enumerates the default Pricing Strategy side-panel (search input, strategy list,
  // Locations Using Pricing As Default table). No interactive openers beyond the resting surface;
  // the content is fully enumerable in the resting state.
  'corporate-pricing-strategy': {
    requiredStates: [{ label: 'resting' }],
  },
  // Pricing Detail grid enumerates product-group rows and draggable affordances. No interactive
  // openers beyond the resting grid; all draggable rows are resting-state elements.
  'corporate-pricing-detail': {
    requiredStates: [{ label: 'resting' }],
  },
  // New Pricebook form enumerates create-form fields (name, year, type combobox) and
  // strategy/product-group search affordances. No openers beyond the resting form surface.
  'corporate-pricing-new-pricebook': {
    requiredStates: [{ label: 'resting' }],
  },
  // Override surface has two tabs (Equipment/Labor), a currency combobox, and a rows-per-page
  // combobox — each exposes distinct elements. A re-walk with a location selected and a non-ALL
  // currency additionally exposes the Product-Group Picker add controls (NM-1472).
  'corporate-pricing-override': {
    requiredStates: [
      { label: 'resting' },
      { label: 'tab:labor' },
      { label: 'expand:currency' },
      { label: 'expand:rows-per-page' },
      { label: 'location-selected+non-all-currency' },
    ],
  },
};
