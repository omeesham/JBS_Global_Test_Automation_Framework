# Encore — Client-Specific Rules

**Client**: Encore (Navigator Cloud — `cloudapps-e2e.encoreglobal.com`)
**Stack**: Angular + Radix UI + Microsoft SSO + TOTP
**Framework**: encore_framework (Playwright + TypeScript, see root `CLAUDE.md`)

---

## How this file is used

Agents running against the Encore client load **both** files:
1. Root `CLAUDE.md` — framework rules (apply to any Playwright + Angular client)
2. This file — rules that name Encore product surfaces, business validations, or app-specific behaviors

If a rule applies to any Angular/Playwright client, it belongs in root `CLAUDE.md`. If a rule names an Encore page, Encore Jira ticket, Encore URL, Encore office number, or Encore-specific business rule, it belongs here.

---

## Numbering convention

- **Existing rules** (LR-008, LR-012, LR-017, LR-036) keep their original numbers — grandfathered from the pre-split registry to preserve 775+ cross-references.
- **New client rules** going forward use `LR-ENC-NNN` prefix (LR-ENC-001, LR-ENC-002, …). This prevents silent collision with framework rules that continue on `LR-NNN`.
- **New framework rules** go in root `CLAUDE.md` as `LR-038`, `LR-039`, … .

---

## Product context (quick reference)

- **App**: Navigator Cloud — Encore's rental/event management platform
- **Base URL**: `cloudapps-e2e.encoreglobal.com` (E2E environment; see `config/environments/.env.development`)
- **Test office**: 1604 (hardcoded in many TCs; see `clients/encore/docs/REQUIREMENTS.md`)
- **Auth**: Microsoft SSO + TOTP; credentials in `config/environments/.env.development`
- **Module registry**: `clients/encore/docs/MODULE_REGISTRY.md`
- **Requirements**: `clients/encore/docs/REQUIREMENTS.md`
- **Encore-specific agent rules** (ALL-* additions): `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md`
- **Jira prefix**: `NM-NNNN` (e.g., NM-1264 — Delivery ≥ Prep cross-field validation)

---

## Client-Specific Learned Rules

### LR-008: Date offset validation — positivity constraints per field type
"Relative to start" fields (Prep, Set, Delivery) must be <= 0.
"Relative to end" fields (Return, Strike, Pickup) must be >= 0.
Delivery has additional NM-1264 constraint: must be >= Prep.
Test values must respect ALL constraints for the field being tested.
**Trigger**: Any test involving date offset fields on Location Settings.

### LR-012: Save dialogs are SHARED unless MCP-proven otherwise
Default assumption: all Location Settings tabs use the shared "Save Changes" dialog
(dlgSaveChanges / btnSaveChangesConfirm from shared.ts). Do NOT create custom dialog
selectors unless MCP verification proves a custom dialog exists.
**Trigger**: Any new page object for Location Settings tabs.

### LR-017: Different pages MUST have separate selector namespaces and directories
Pages at different URLs are DIFFERENT pages. Never merge selectors into a shared flat
object or co-locate files in the same directory. Each page group gets its own selector
partition, own directory, and own collision detection boundary.
"Location Settings" (`/settings/location`) ≠ "Local Office Settings" (`/settings/local-office`).
Check `clients/encore/docs/REQUIREMENTS.md` and `clients/encore/docs/MODULE_REGISTRY.md` for page boundaries before creating any new page object.
Directory structure mirrors the app navigation hierarchy: `{section}/{module}/`.
**Trigger**: Any new page object or selector file creation.

### LR-036: Boolean render format differs per page — MCP-verify detection per table
Tables/grids/lists in the same Angular app can render boolean values with DIFFERENT HTML.
A helper that works on one table will silently return wrong values on another:
- **Unicode checkmark "✔"**: readable via `textContent` — used by Location Management History
  (col 3 Active, col 12 Corporate Pricing, etc.) and similar legacy tables
- **SVG icon `<svg class="lucide lucide-check">`**: `textContent` returns EMPTY for BOTH TRUE and
  FALSE cells — used by Local Office Settings History and other newer shadcn/lucide-based tables
- **Empty cell**: represents FALSE in both cases

Detection patterns:
- Unicode tables: `cell.textContent?.includes('✔')` → TRUE
- SVG tables (TRUE): `(await cell.innerHTML()).includes('lucide-check')` → TRUE
- SVG tables (FALSE): `(await cell.innerHTML()).trim() === ''` → FALSE

NEVER assume two tables in the same app use the same render format. MCP-verify per table before
writing any `getColumnValue`, `getCheckboxState`, or helper that reads boolean-valued cells.
`getColumnByHeader()` for boolean columns MUST branch on table type — `textContent` returns empty
for both states on SVG tables, producing silently wrong assertions.
**Trigger**: Any page object or spec that reads boolean values from a table, grid, or list cell.
**Graduated from**: SP1 MCP discovery 2026-04-13 (SUBPLAN_HISTORY_01_MCP_FINDINGS §2) — Location
Management History uses Unicode ✔, Local Office History uses SVG lucide-check. Original plan
assumed same format for both; any `textContent`-based detection helper would have silently
returned empty for every SVG row → every boolean assertion false regardless of actual state.

---

## Related docs (Encore-specific, lookup from here)

| File | Purpose |
|---|---|
| `clients/encore/docs/REQUIREMENTS.md` | Functional requirements for Encore Navigator Cloud |
| `clients/encore/docs/MODULE_REGISTRY.md` | Module/page boundary definitions for Encore |
| `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` | Encore-specific additions to framework agent rules (§12 additions, Encore Jira ID conventions, Office 1604 hardcode notes) |
| `clients/encore/specs_planning/_internal/agent-mistakes.md` | Encore-specific agent mistake log (graduates to LR-ENC-NNN here when patterns repeat) |
