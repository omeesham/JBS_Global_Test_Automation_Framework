/**
 * Corporate Pricing — Pricing Strategy tab selectors.
 * Two-pane: left "Price Strategies" list (searchable, "Total: N", Add "+") + right strategy editor
 * (name textbox + 4 flag checkboxes) + "Locations Using Pricing As Default" table + a
 * "New Pricing Strategy" modal opened by Add.
 *
 * Strategy: text/role/content-anchored — the page has ZERO data-testids. Interactive elements
 * carry accessible names (e.g. textbox "Pricing Strategy", checkbox "Is Productions", button
 * "Add"), so the page object prefers `getByRole(role,{name})`; the structural reads below use the
 * CSS anchors. Verified on the live app, 2026-06-05.
 *
 * Tab/header/page-Save selectors live in `details.ts` (the Details shell, shared by Strategy+Detail).
 */
export const CorporatePricingStrategySelectors = {
  // ---- Left pane: Price Strategies list ----
  /** @where Strategy > Left @el heading @text "Price Strategies" @keys strategies list header */
  hdgPriceStrategies: '*:text-is("Price Strategies")',
  /** @where Strategy > Left @el textbox @text "Search strategies..." @keys search strategies filter */
  txtSearchStrategies: 'input[placeholder="Search strategies..."]',
  /** @where Strategy > Left @el text @text "Total: N" @keys strategy count total */
  lblStrategyTotal: 'text=/Total:\\s*\\d+/',

  // ---- Right pane: strategy editor (flag checkboxes by accessible name) ----
  /** @where Strategy > Editor @el text @text "Pricing Strategy" @keys editor name-field label */
  lblStrategyNameField: '*:text-is("Pricing Strategy")',

  // ---- Locations Using Pricing As Default table ----
  /** @where Strategy > Editor @el heading @text "Locations Using Pricing As Default" @keys location mapping header */
  hdgLocationsUsingDefault: '*:text-is("Locations Using Pricing As Default")',
  /** @where Strategy > Editor @el table @keys locations-using-default grid (cols: Local Office, Local Office Name) */
  tblLocationsUsingDefault: 'table:has(th:text-is("Local Office"))',

  // ---- New Pricing Strategy dialog (opened by Add "+") ----
  /** @where Strategy > Dialog @el dialog @text "New Pricing Strategy" @keys add-strategy modal container */
  dlgNewStrategy: '[role="dialog"]:has-text("New Pricing Strategy")',
} as const;
