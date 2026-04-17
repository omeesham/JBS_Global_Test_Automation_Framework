# Module Registry — Page-to-Directory Mapping

Every page in Navigator4 belongs to exactly ONE module within a top-level section.
This registry determines where ALL files go: selectors, page objects, specs, test data, test cases.

## How to use this registry
1. Before creating ANY new file, look up the page's module here
2. If the page doesn't exist in this registry, ADD IT before creating files
3. Section = top-level nav item (Setup, Actions, Tax, etc.)
4. Module = sub-page within that section
5. Different URLs = different modules. ALWAYS.

## Registry

### Root-level (no nav section)
| Module ID | Page Name | URL Pattern | Directory |
|-----------|-----------|-------------|-----------|
| `login` | Microsoft SSO Login | `/auth/sign-in` | `login.*` (root) |
| `home` | Dashboard/Home | `/home` | `home.*` (root) |

### Setup section (`/settings/...`)
| Module ID | Page Name | URL Pattern | Directory |
|-----------|-----------|-------------|-----------|
| `setup/locations` | Location Settings | `/settings/location` | `setup/locations/` |
| `setup/local-office` | Local Office Settings | `/settings/local-office` | `setup/local-office/` |
| `setup/corporate-billing` | Corporate Billing | `/settings/corporate-billing` | `setup/corporate-billing/` |
| `setup/corporate-pricing` | Corporate Pricing | `/settings/corporate-pricing` | `setup/corporate-pricing/` |
| `setup/corporate-pg-pricing` | Corp PG Pricing Override | `/settings/corporate-pg-pricing-override` | `setup/corporate-pg-pricing/` |
| `setup/discount-optimization` | Discount Optimization | `/settings/discount-optimization` | `setup/discount-optimization/` |
| `setup/discount-matrix` | Discount Matrix | `/settings/discount-matrix` | `setup/discount-matrix/` |
| `setup/ect-settings` | ECT Settings | `/settings/ect` | `setup/ect-settings/` |
| `setup/users` | Users | `/settings/users` | `setup/users/` |
| `setup/bill-through-date` | Bill Through Date | `/settings/bill-through-date` | `setup/bill-through-date/` |
| `setup/service-type` | Service Type | `/settings/service-type` | `setup/service-type/` |
| `setup/service-type-name` | Service Type Name | `/settings/service-type-name` | `setup/service-type-name/` |
| `setup/service-charge` | Service Charge | `/settings/service-charge` | `setup/service-charge/` |

### Other sections (add rows as pages are automated)

Sections below exist in Navigator Cloud but are not yet automated. When a planner/generator
starts work on any of these pages, they MUST add the entry here BEFORE creating any files.

| Section | Known Sub-Pages (from MCP nav map 2026-03-25) |
|---------|-----------------------------------------------|
| **Actions** | Sourcing Dashboard, Reports, Offline Reports, Reports Statistics, Approve Equipment Transfers, Release Notes, Search Statistics, Fix Unlinked CRM Orders, FAQ |
| **Commissions** | CMP, Allow DPCD, Tier/Flat, Product Code |
| **Tax** | Order Origin Tax, Sales, Special Rate, State Tax, Tax Type Detail |
| **Search** | Order/Job/Asset/Customer/DRO/Payment/Item/ECT Search, Event Agendas |

Directory convention for these sections follows the same `{section}/{module}/` pattern:
- `actions/sourcing-dashboard/`, `commissions/cmp/`, `tax/order-origin/`, `search/order/`, etc.

## Directory Convention (six parallel trees)

For any module `{section}/{mod}`:
- Selectors: `src/selectors/{section}/{mod}/`
- Page objects: `src/pages/{section}/{mod}/`
- Specs: `tests/specs/{section}/{mod}/`
- Test data: `tests/test-data/{section}/{mod}/`
- Test cases: `specs_planning/test-cases/{section}/{mod}/`
- Test plans: `specs_planning/test-plans/{section}/{mod}/`

## Rules
- One page = one module directory. No exceptions.
- Tabs within a page are NOT separate modules (e.g., Currency is a tab in Location Settings → stays in `setup/locations/`)
- If two pages share a URL prefix but have different suffixes → DIFFERENT modules
- Shared components (dialogs, nav) go in `src/selectors/shared/` and `src/pages/components/`
- Directory hierarchy mirrors the app navigation hierarchy
