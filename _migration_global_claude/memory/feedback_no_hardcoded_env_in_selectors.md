---
name: no hardcoded environment values in selector files
description: Currency, locale, office number, and other environment-dependent values must be parameterized at the selector layer — never literal in the testid value. Per-context entries (e.g. drpPrimaryLaborPricingUSD/CAD/MXN) follow the framework convention from currency.ts.
type: feedback
originSessionId: 4add5afd-d918-4625-8460-69663fdc2651
---
Selector files (`clients/${ACTIVE_CLIENT}/src/selectors/**`) MUST NOT hardcode environment-dependent values into singleton selector strings. Currency, locale, office number, language, role-context — anything that varies by test context — belongs in either (a) explicit per-context named entries (matches `currency.ts` `chkUSDSelected/chkCADSelected/chkMXNSelected` pattern) or (b) typed test-data constants imported by the page object.

**Why:** in the 2026-04-29 testid migration, the engineer keyed Pricing dropdowns per-currency (`location-settings-select-primary-labor-pricing-{usd|mxn|cad}`). My first-cut migration hardcoded `-usd` into the 5 singleton exports (`drpPrimaryLaborPricing` etc.). For office 1604 (USD default) this preserved current spec behavior, but it's a silent regression for any future spec running CAD/MXN context — the singleton would silently still resolve to USD. /final-q caught this; Phase E refactored to 15 explicit per-currency entries (5 kinds × 3 ccys) matching `currency.ts`.

**How to apply:**
- When adding selectors with environment-keyed testids: enumerate one entry per (kind, env-context) pair. Don't pick a default; let the test-data describe which entry to use.
- When refactoring: grep the selector file for currency/locale/office tokens. If any appear inside the testid VALUE string for a singleton (e.g., `'select-...-usd'` for an unkeyed export name), that's the anti-pattern — fix it.
- The "default = USD" or "default = office 1604" assumption belongs in `tests/test-data/setup/locations/*.data.ts` (already does — see `DEFAULT_CURRENCY = 'USD'` in `location-currency.data.ts`). Selectors stay context-neutral.
- Typed helper functions are acceptable when per-context fan-out would be unmanageable (≥10 contexts), but for ≤5 contexts explicit entries are more discoverable and match the framework pattern.
