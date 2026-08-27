# Module Registry — Page-to-Directory Mapping

> **Agent-only, gitignored** (`clients/*/docs/` per root `.gitignore:184`) — never ships.
> **Routing authority**: this file decides where EVERY file goes (selectors, page objects, specs, test data, test cases, test plans). If it is wrong, new files land in the wrong directory.
> **Last reconciled against the live filesystem: 2026-06-25** (post-2026-06-05 POM restructure — `specs/`→`tests/`, `src/data/testdata/`→`src/data/`, section-prefix dropped from src/tests dirs). The live module index with per-surface findings is `.claude/context/navigation.md` §C Exploration Registry.

Every page in Navigator Cloud belongs to exactly ONE module. Module directory names are **flat** (e.g. `locations`, NOT `setup/locations`) — the legacy `setup/` section prefix was removed from the `src/` + `tests/` trees in the 2026-06-05 POM restructure. The `setup/` grouping survives ONLY under the planning-artifact trees (`specs_planning/test-cases/setup/<module>/`, `specs_planning/test-plans/setup/<module>/`).

## How to use this registry
1. Before creating ANY new file, look up the page's module here.
2. If the page doesn't exist in this registry, ADD IT before creating files.
3. Module = a flat directory name resolving one Navigator page (or page-group).
4. Different URLs = different modules. ALWAYS (LR-017).
5. Tabs within a page are NOT separate modules (e.g. Currency is a tab in Location Settings → stays in `locations`).

## Registry — automated modules (live on disk 2026-06-25)

| Module dir | Page | URL pattern | Surfaces / tabs (one spec file each unless noted) |
|---|---|---|---|
| `locations` | Location Settings | `/settings/location` | local-information, currency, pricing, account-address, legal, notes, shared-setup-locations, auto-addon, left-panel-basic-information, management-history |
| `local-office` | Local Office Settings | `/settings/local-office` | settings (Basic Information), history (Location Settings History), ect (ECT Settings) |
| `corporate-pricing` | Corporate Pricing | `/settings/corporate-pricing` | search, strategy, detail (`/details/<guid>`), new-pricebook (`/add?type=equipment\|labor`), toolbar-io |
| `corporate-override` | Corporate Override | `/pg-override` | core, location-picker, filters, grid-sort, labor-grid, export, import |
| `auth` | Microsoft SSO login | `/auth/sign-in` | page object `src/pages/auth/login.page.ts`; session setup `tests/auth.setup.ts` |
| `discount-matrix` | Discount Matrix | `/locations/{office}/settings/discount-matrix` | discount-matrix-criteria (Search Criteria bar), region-weekly-peaks, location-activation — L1 QUICK under NM-3530. The Company Matrix tab is NOT registered here: NM-3343 owns it and its future module registration (scope lock in `plans/pending/PLAN_DISCOUNT_MATRIX_AUTOMATION.md`) |

> Spec file names are flat inside each module dir (e.g. `tests/locations/location-pricing.spec.ts`), NOT nested under a `setup/` or `history/` subfolder.

## Not-yet-automated sections (add a row above when work starts)

These Navigator sections exist but have no module dir yet. When a HUNTER/GIVER/BUILDER starts work on one, ADD a flat module row above BEFORE creating any file.

| Section | Known sub-pages |
|---|---|
| **Setup (other)** | Corporate Billing, Discount Optimization, ECT Settings (standalone), Users, Bill Through Date, Service Type, Service Type Name, Service Charge — *(Discount Matrix promoted to a registered module 2026-08-26, NM-3530; its Company Matrix tab stays unregistered pending NM-3343)* |
| **Actions** | Sourcing Dashboard, Reports, Offline Reports, Reports Statistics, Approve Equipment Transfers, Release Notes, Search Statistics, Fix Unlinked CRM Orders, FAQ |
| **Commissions** | CMP, Allow DPCD, Tier/Flat, Product Code — **corporate office 1101 only (Navigator Contracts role)**; pre-intake KT: `specs_planning/_internal/intake/commission-hunter-2026-06-26.md` |
| **Tax** | Order Origin Tax, Sales, Special Rate, State Tax, Tax Type Detail |
| **Search** | Order/Job/Asset/Customer/DRO/Payment/Item/ECT Search, Event Agendas |

## Directory convention (verified live 2026-06-25)

> All paths relative to the client root `clients/encore/`. `<module>` = a flat name from the registry above.

| Artifact | Path |
|---|---|
| Selectors | `src/selectors/<module>/` (+ barrel `src/selectors/index.ts`) |
| Page objects | `src/pages/<module>/` (+ shared `src/pages/base.page.ts`, `src/pages/components/`) |
| Test data | `src/data/<module>/` (+ shared `src/data/common.ts`) — NOTE: `.data.ts` suffix dropped; lives under `src/`, not `tests/` |
| Specs | `tests/<module>/<page>.spec.ts` (+ session setup `tests/auth.setup.ts`) |
| Test cases | `specs_planning/test-cases/setup/<module>/` |
| Test plans | `specs_planning/test-plans/setup/<module>/` |
| Fixtures / global setup | `src/fixtures/pages.fixture.ts`, `src/setup/global-setup.ts` |

## Rules
- One page = one flat module directory. No exceptions.
- Tabs within a page are NOT separate modules (e.g. Currency stays in `locations`).
- Different URLs (or different URL suffixes) → DIFFERENT modules (LR-017).
- Shared components (dialogs, nav) → `src/pages/components/`; shared selectors → `src/selectors/index.ts` barrel.
- Directory hierarchy mirrors the app navigation hierarchy; the `setup/` grouping is kept ONLY in the `specs_planning/test-cases|test-plans/` trees.
