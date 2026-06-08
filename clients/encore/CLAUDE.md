# Encore — Client-Specific Rules

**Client**: Encore (Navigator Cloud — `cloudapps-e2e.encoreglobal.com`)
**Stack**: Angular + Radix UI + Microsoft SSO
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
- **Base URL**: `cloudapps-e2e.encoreglobal.com` (E2E environment; see `clients/encore/.env.local`)
- **Test office**: 1604 (hardcoded in many TCs)
- **Auth**: Microsoft SSO; credentials in `clients/encore/.env.local` (gitignored; CI uses GitHub Secrets)
- **Module registry**: `clients/encore/docs/MODULE_REGISTRY.md` (agent-only — gitignored per root `.gitignore:185`, never ships)
- **Requirements**: `clients/encore/docs/REQUIREMENTS.md` (agent-only — gitignored per root `.gitignore:184`, never ships)
- **Encore-specific agent rules** (ALL-* additions): `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md`
- **Jira prefix**: `NM-NNNN` (e.g., NM-1264 — Delivery ≥ Prep cross-field validation)

---

## Client-Specific Learned Rules

### LR-ENC-001: Encore baseline truth source — old-site Navigator UI (navigator2.training.psav.com)

**Encore baseline truth source**: `https://navigator2.training.psav.com/#/` (old Navigator UI, tabs embedded in one URL).
**Encore observed app**: `https://cloudapps-e2e.encoreglobal.com/navigator/` (new Navigator Cloud).
**Credentials**: shared — same Microsoft SSO per `clients/encore/.env.local` (proven by SP-OSB-01 — CiC inherits the user's live Chrome session, no re-login needed).
**Baseline artifact directory**: `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`.

> Note: `nav4` is not an env in this framework. Any historical reference to "nav4" is a stale label that meant the e2e env (cloudapps-e2e.encoreglobal.com). PLAN_55 (2026-05-19) purged live references; historical references in done plans are audit trail.

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

### LR-ENC-002: FCC parity is structural — never lazy-defer MD/XLSX/test-plan updates

When any subplan produces, modifies, or deletes a `clients/encore/tests/**/*.spec.ts` test case (FCC or non-FCC), the parity contract is structural — enforced by three defense layers:

1. **Per-agent HARD STOPS** — BUILDER HARD STOP #11 ("NO SPEC WITHOUT GIVER ARTIFACTS"), HEALER HARD STOP #6 ("NO SPEC EDIT WITHOUT MD SYNC"), AUDIT Workflow step 1.5 (parity pre-check before every audit), PLANNER HARD STOP #8 (FCC clause) + HARD STOP #10 (XLSX sheet count check). Agents HALT on missing MD/test-plan/XLSX.
2. **Pre-commit hook gates A/B/C** in `.githooks/pre-commit` — commits HALT on parity gaps (Gate A: `check:tc-parity`), backdated activity-log rows (Gate B: `validate-activity-log.mjs`), or plan closure without Execution Summary (Gate C: `validate-plan-closure.mjs --staged --enforce`).
3. **LR-048 v2 Per-Identity Satisfaction Matrix** — subplans cannot leave artifact obligations unscoped at authoring time. Silence ≠ "no work"; every cell must be explicitly named or marked `(none)`.

If you ever feel like "I'll do the MD/XLSX later in a follow-up subplan" — that's the FCC fuckup pattern. STOP. Author the parity work IN the current subplan, OR explicitly mark it `(none)` in the LR-048 v2 matrix with a one-line justification. Pre-commit Gate A will refuse the commit either way; the matrix is the upstream prevention.

**Trigger**: every subplan touching Encore spec / test-case / test-plan / XLSX artifacts.

**Graduated from**: SUBPLAN_NOTES_FCC_PILOT (2026-05-21) + SUBPLAN_SSL_FCC_PILOT (2026-05-21) closure-gate gap (40 FCC TCs landed without GIVER MD/CSV/test-plan artifacts) → PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT retroactive cleanup → PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE (2026-05-25) structural prevention → PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION (2026-05-27) flipped deliverable format from per-module CSVs to a single multi-sheet workbook.

**Cross-refs**: ALL-071 (framework parity rule); LR-027 (execution summary); LR-040 (closure-gate); LR-048 v2 (subplan matrix); BUILDER HARD STOP #11; PLANNER HARD STOP #8/#10; HEALER HARD STOP #6; AUDIT Workflow step 1.5 + Identity-Drift mode; GEN-044 + PLN-050 agent-mistakes entries.

### LR-ENC-003: The `.env.e2e` file is GitHub-Actions-only; local/agent spec runs use `.env.local`

Both files target the same e2e server (`cloudapps-e2e.encoreglobal.com`) — the difference is the config file. `.env.local` (gitignored) carries credentials + dev tuning; `.env.e2e` (tracked) carries prod-CI tuning and **NO** credentials (CI injects `NAVIGATOR_*`/`BASE_URL` from GitHub Secrets).

Env selection defaults to `local` (set inline in `playwright.config.ts` + `src/setup/global-setup.ts`); CI sets `CI_ENV=e2e`. A guard in `src/setup/global-setup.ts` THROWS if `CI_ENV=e2e` without `CI` — so a local run can never execute against the e2e config file.

**Trigger**: any agent running specs locally — never set `CI_ENV=e2e` for a local run; just `npm test` (loads `.env.local`).

**Graduated from**: env-hygiene fix 2026-05-28 — local runs silently loaded `.env.e2e` (selector defaulted to `e2e`), and credentials were committed in `.env.e2e` yet consumed only locally (CI uses Secrets).

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
Check `clients/encore/docs/REQUIREMENTS.md`, `clients/encore/docs/MODULE_REGISTRY.md`, and `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` for page boundaries before creating any new page object.
Directory structure mirrors the app navigation hierarchy: `clients/encore/tests/{module}/` + `clients/encore/src/pages/{module}/` + `clients/encore/src/selectors/{module}/` + `clients/encore/src/data/{module}/` (modules: `locations`, `local-office`, `corporate-pricing`). (Post-2026-06-05 POM restructure: `specs/`→`tests/`, `src/data/testdata/`→`src/data/`.)
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
| `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` | Encore-specific additions to framework agent rules (§12 additions, Encore Jira ID conventions, Office 1604 hardcode notes). Paired with `docs/REQUIREMENTS.md` (functional spec) + `docs/MODULE_REGISTRY.md` (module→directory map) — all three live agent-only (gitignored, never ship). |
| `clients/encore/specs_planning/_internal/agent-mistakes.md` | Encore-specific agent mistake log (graduates to LR-ENC-NNN here when patterns repeat) |

---

## Automation User Provisioning Checklist

When a new automation user is provisioned, run these steps in order:

1. **Receive credentials** — username + password from M365 admin / Encore IT.
2. **Verify the user has no second-factor authentication configured** — M365 Admin → Users → [new user] → Authentication methods.
3. **Add GitHub secrets** — repo Settings → Secrets and variables → Actions:
   - `NAVIGATOR_USERNAME` = the new user's UPN.
   - `NAVIGATOR_PASSWORD` = the new user's password.
   - `BASE_URL` = Encore env URL.
4. **Trigger workflow** — `gh workflow run playwright-tests.yml` or "Run workflow" in GitHub UI.
5. **Verify green** — auth log shows login completes; suite completes; HTML report artifact downloaded.

## When encore needs fresh login session

Always use this file to read the creds and login without hallucinating and waiting for user to log you in, this works on e2e and nav2 envs. Creds live in `clients/encore/.env.local` (client root, gitignored — each collaborator creates their own per docs/SETUP.md Step 2). Read it.