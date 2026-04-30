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

### LR-ENC-001: Encore baseline truth source — old-site Navigator UI (navigator2.training.psav.com)

**Encore baseline truth source**: `https://navigator2.training.psav.com/#/` (old Navigator UI, tabs embedded in one URL).
**Encore observed app**: `https://cloudapps-e2e.encoreglobal.com/navigator/` (new Navigator Cloud).
**Credentials**: shared — same Microsoft SSO + TOTP per `config/environments/.env.development` (proven by SP-OSB-01 — CiC inherits the user's live Chrome session, no re-login needed).
**Baseline artifact directory**: `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`.

**Authority**: for any behavior uncertainty on Encore, old site decides (per LR-045 + ALL-024 truth hierarchy).

**Selector parity**: **ZERO** — old site has 0 `data-testid` attributes; uses `name=`/`id=` instead (SP-OSB-01 §2 — `input[name="OracleProductCode"]`, `#ldwid`, `#SkipBillingId`, etc.). Framework: Angular Reactive Forms + PrimeNG + Bootstrap 3 (Glyphicon). This means baseline is **observation-only** — you visit to understand intent, you do NOT reuse selectors, you do NOT run specs against baseline. Automation stays on new site.

**Architectural divergence** (SP-OSB-01 §3):
- Old site: ONE URL at `/setup/locationdetail/1604` with embedded top-level tabs (Basic Information + Location Management History) and embedded sub-tabs (Local Information, Currency, Pricing, etc.).
- New site: TWO URLs — `/settings/location` (Location Settings) + `/settings/local-office` (separate Local Office Settings with ECT Settings).
- Absent on baseline: **ECT Settings tab**, **`/settings/local-office` page as separate URL**, **Enable Multiday Pricing** toggle, **Merchant Currency audit column**, **Benefits Multiplier / Historical Subrental / Labor Cost**. For these: record `baselineScope: baseline-absent` on queue entry + escalate via `/encore-questions` (ALL-078), do NOT HALT.

**Baseline artifact format**: free-form per-session observation log, 5-7 sections, frontmatter + narrative evidence. NOT a strict field-inventory schema (the `field-inventory-spec.md` is a starting point for shape, but baseline artifacts legitimately deviate — see `OSB-ACCESS-VERIFY-2026-04-24.md` for reference).

**Test entity**: office 1604 ("The Parker Palm Springs") — same as new-site per REQUIREMENTS.md.

**Boolean render format on baseline LM History** (LR-036 extension): old-site LM History uses Bootstrap 3 **Glyphicon** font icons (`<span class="glyphicon glyphicon-ok">`) — `textContent` returns empty for TRUE cells (distinct from new-site LM History Unicode `✔` and new-site LOS History SVG `lucide-check`). Three total render formats in scope. Baseline is observation-only, so programmatic readers are not required — but if a future session reads baseline tables, LR-036 detection logic needs the Glyphicon case.

**Trigger**: every Requirements (HUNTER) / Planner (GIVER) / Generator (BUILDER) / `/encore-questions` session authoring or verifying Encore behavior. Phase 1a of Requirements (REQ-014), Phase 0 bullet of TC-generation subplans (ALL-078), Phase 5 Tier A of `/encore-questions` — all consult this rule.

**Graduated from**: PLAN_OLD_SITE_TRUTH_BASELINE + SP-OSB-01/02/03 (2026-04-24). User directive 2026-04-23: "best way to find answers - https://navigator2.training.psav.com/#/ (not yet active, but same account, same selectors, etc... just old UI) ... we run to old website whose features are working fine, if we find issues in e2e, go to old, if we dont find ans there (bug/question unanswered) then ASK the encore guys."

Cross-refs: LR-045 (framework rule), ALL-024 (truth hierarchy), ALL-078 (HALT gate + escalation path), REQ-014 (Phase 1a artifact), PLN-049 (Baseline_Artifact frontmatter linkage).

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

---

## Temporary credentials (2026-04-30 — REMOVE WHEN AUTO-USER WORKS)

**Status**: ACTIVE — Rutvik's personal account is in `.env.development.local` while the automation user `s-prd-clickauto@psav.com` is broken.

**Search marker**: `TEMP_RUTVIK_EXPERIMENT` (grep this from anywhere to find every reference).

**Backed by**: EXP-AUTH-STATE-SHARED — shared `storageState` at `.auth/encore-state.json` so 2+ parallel workers avoid simultaneous MFA conflicts on Rutvik's account. Files: `clients/encore/tests/setup/auth-storage.ts`, `auth.setup.ts`, modified `playwright.config.ts` + `fixtures.ts`.

**Removal trigger**: Encore IT confirms the automation user is provisioned + working in dev/staging.

**Removal checklist** (run when trigger fires):
1. `grep -r 'TEMP_RUTVIK_EXPERIMENT' .` — enumerate every reference.
2. Replace `NAVIGATOR_USERNAME` / `NAVIGATOR_PASSWORD` / `NAVIGATOR_MFA_SECRET` in `clients/encore/config/environments/.env.development.local` with auto-user creds (or delete the file entirely if creds move back to `.env.development`).
3. Delete this subsection.
4. `rm .auth/encore-state.json` — forces a fresh login under the new account.
5. Decide whether to keep the EXP-AUTH-STATE-SHARED scaffolding (auth.setup.ts + auth-storage.ts + storageState wiring) for parallel-run benefits, or revert it via the cleanup procedure in `~/.claude/plans/we-have-to-experiment-smooth-anchor.md`.

**Why this lives here**: `CLAUDE.md` is auto-loaded into Claude's context for any Encore task — this guarantees the "remove when auto-user works" trigger is visible without anyone having to grep first.

---

## CI User Provisioning Checklist

When a new MFA-less CI user is provisioned, run these steps in order:

1. **Receive credentials** — username + password from M365 admin / Encore IT.
2. **Disable MFA on the user** — M365 Admin → Users → [new user] → Authentication methods → remove existing MFA registration, OR set per-user MFA policy to Disabled.
3. **Add GitHub secrets** — repo Settings → Secrets and variables → Actions:
   - `NAVIGATOR_USERNAME` = the new user's UPN.
   - `NAVIGATOR_PASSWORD` = the new user's password.
   - `BASE_URL` = Encore env URL.
   - **DO NOT** add `NAVIGATOR_MFA_SECRET`. Its absence is the contract.
4. **Trigger workflow** — `gh workflow run playwright-tests.yml` or "Run workflow" in GitHub UI.
5. **Verify green** — auth log line `[INFO] MFA not required` appears; suite completes; HTML report artifact downloaded.
