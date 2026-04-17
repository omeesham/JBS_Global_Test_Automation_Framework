# Encore — Client-Specific Agent Rules

Companion to `docs/read_only_docs/AGENT_SHARED_RULES.md` (framework). This file holds rules that name Encore product surfaces, Encore Jira IDs, or Encore-specific URLs — anything that would be wrong to apply to a non-Encore client.

Agents running against Encore load both files. Framework rules apply globally; rules here apply only when the active client is Encore.

---

## §E1. Encore Module Registry

**Application**: Navigator Cloud
**Base URL**: `cloudapps-e2e.encoreglobal.com` (E2E environment)
**Module registry**: `clients/encore/docs/MODULE_REGISTRY.md`
**Requirements**: `clients/encore/docs/REQUIREMENTS.md`

When framework rule §18 (Module Boundary Enforcement) says "the application's module registry", for Encore that resolves to `clients/encore/docs/MODULE_REGISTRY.md`. Every page in Navigator Cloud belongs to exactly ONE module defined there.

---

## §E2. Encore Jira / ID Conventions

| Convention | Used for | Example |
|---|---|---|
| `NM-NNNN` | Jira tickets (Navigator module) | `NM-1264` (Delivery ≥ Prep cross-field validator) |
| `TC-LOC-*` | Test Cases for Location Management/Settings specs | `TC-LOC-LI-003`, `TC-LOC-HIST-*` |
| `BUG-{MOD}-{NNN}` | Bug reports (from framework LR-034 bug filing protocol) | `BUG-LI-001` (Oracle required + Save silent no-op) |

When agents file escalations or reference prior incidents, use these prefixes so Encore-side tooling (queue, escalations, mistakes log) can route correctly.

---

## §E3. Encore Test Office Hardcode

Most Encore tests hardcode **Office 1604** as the execution office. This is documented in `clients/encore/docs/REQUIREMENTS.md` (search for "TEST_OFFICE" or "1604"). Fixme Category A (office-limited features) parameterizes this via `TEST_OFFICE` env var + per-office data.

When generating new specs or page objects for Encore: default to Office 1604 unless the test plan explicitly names a different office. Never introduce a new office hardcode without a matching entry in test-data.

---

## §E4. Encore Beforeunload Dialog (addendum to framework §12 ALL-052)

Framework rule §12 ALL-052 documents the generic "safe navigation pattern" for Angular apps with dirty form state. The Encore website specifically fires `beforeunload` **whenever form edits are made without clicking Save** — this includes:

- Any tab switch within Location Settings when a numeric/date offset field has been touched (LR-010 cross-field validation triggers even on identity edits)
- Page reloads during MCP walkthroughs after typing into any form input
- Navigating away from Local Office Settings after toggling any checkbox

Agents running MCP exploration against Encore must apply the ALL-052 safe navigation pattern (`browser_navigate("about:blank")` → `browser_handle_dialog(accept: true)` → target URL) more aggressively than on a "well-behaved" Angular app.

---

## §E5. Navigator URL Patterns

| Path pattern | Encore page |
|---|---|
| `/settings/location` | Location Settings (tabs: Basic Info, Local Information, Pricing, ECT, Notes, …) |
| `/settings/local-office` | Local Office Settings (different page — LR-017) |
| `/setup/locations/*/history` | Location Management History grid (Unicode ✔ boolean format — LR-036) |
| `/setup/local-office/*/history` | Local Office Settings History grid (SVG `lucide-check` boolean format — LR-036) |
| `/auth/*` (Microsoft SSO) | Login + TOTP flow |

These URL patterns are Encore-specific. Framework rules that say "navigate to the page" resolve to these paths when the active client is Encore.

---

## §E6. Encore-Specific §2 Path Additions

Framework §2 ownership table uses `clients/${ACTIVE_CLIENT}/...` placeholders. For Encore, those resolve to:

| Placeholder | Encore path |
|---|---|
| `clients/${ACTIVE_CLIENT}/tests/specs/**` | `clients/encore/tests/specs/**` |
| `clients/${ACTIVE_CLIENT}/tests/test-data/**` | `clients/encore/tests/test-data/**` |
| `clients/${ACTIVE_CLIENT}/src/pages/**` | `clients/encore/src/pages/**` |
| `clients/${ACTIVE_CLIENT}/src/common/base-page.ts` | `clients/encore/src/common/base-page.ts` |
| `clients/${ACTIVE_CLIENT}/src/selectors/index.ts` | `clients/encore/src/selectors/index.ts` |
| `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md` | `clients/encore/docs/REQUIREMENTS.md` |
| `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-queue.json` | `clients/encore/specs_planning/_internal/agent-queue.json` |
| `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md` | `clients/encore/specs_planning/_internal/agent-activity-log.md` |
| `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` | `clients/encore/specs_planning/_internal/agent-mistakes.md` |
| `clients/${ACTIVE_CLIENT}/specs_planning/test-cases/**` | `clients/encore/specs_planning/test-cases/**` |
| `clients/${ACTIVE_CLIENT}/specs_planning/test-plans/**` | `clients/encore/specs_planning/test-plans/**` |

This table is the Encore-side resolution of framework §2 placeholders. When a new client is added, each client creates its own equivalent section in its own `AGENT_RULES_{CLIENT}.md`.
