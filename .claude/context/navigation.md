# Agent Navigation — First-Step Lookup (Universal, Framework-Level)

**Every agent reads this FIRST at session start. Before any `grep`, before any MCP, before any exploration.**

This file answers two questions:
1. **Has this area been explored before?** → skip rediscovery, read the findings.
2. **How do I efficiently solve problem X?** → routing table maps problem → file.

Stale map = repeated mistakes. Every agent owns keeping this current (see §Maintenance below).

---

## §A. First-Step Decision Tree (BEFORE any exploration)

1. Identify the **surface** your task touches (module + page + tab + feature).
2. Search §C Exploration Registry for that surface.
3. **Decision**:
   - ✅ **FOUND in registry** → read the listed findings file(s). Use documented knowledge. Skip rediscovery. Only re-explore if the registry's "Last updated" date is stale vs. your expected app state AND you need fresh data.
   - ❌ **NOT in registry** → you are the first explorer. Proceed with live MCP or code inspection. At session end (in `/reflect`), **add a registry entry** so the next agent benefits.

**Why this matters**: re-exploration burns tokens and drifts from documented findings. Wasted tokens and inconsistent source-of-truth hurt every downstream agent.

---

## §B. Routing Table — "I need to..." → "Read this first"

Paths use `${ACTIVE_CLIENT}` placeholder. For Encore: `${ACTIVE_CLIENT}` = `encore`.

| "I need to..." | Read first | Rule / Trigger |
|---|---|---|
| Drive an Angular input (type, fill, validate) | `clients/${ACTIVE_CLIENT}/src/pages/{module}/{page}.page.ts` → `fillAndTab` / `clearAndTab` / `fillWithValidation` | GEN-008; ALL-073 |
| Toggle a Radix UI checkbox | same page object → `setRadixCheckbox(key, bool)` / `checkCheckbox` / `uncheckCheckbox` | — |
| Click Save + confirm the "Save Changes" dialog | same page object → `clickSaveAndConfirm(key, dlg, confirm)` / `clickSaveWithDialog` | LR-012 |
| Confirm a dialog when `getByRole('alertdialog')` / `getByRole('button',{name})` returns 0 matches (but the dialog is visibly on screen) | The dialog is `<div role="alertdialog">` excluded from Playwright's a11y-role engine (shadow/portal-nested) AND its buttons carry no computed accessible name. Target via the CSS attribute selector `[role="alertdialog"]` + TEXT buttons (`[role="alertdialog"] button:text-is("Save")`). The base `confirmSaveDialogIfPresent` (getByRole-based) silently no-ops here. First hit: Corporate Pricing Override `/pg-override` save dialog (W15-A 2026-06-09 — `corporate-pricing-override.page.ts` `saveAndConfirm`/`clickSaveAndCancel`). | (Override-specific; CLI-verified) |
| Cover a read-only / disabled field that secretly opens a search/lookup dialog (launcher), or a dialog shared by several launchers | **LR-057**: affordance-probe is mandatory before classifying any field static/read-only — click-probe the control + its `<label>` + its row/container; record an `affordance:` token in the inventory. Coverage is dedup'd **per-LAUNCHER, never per-dialog** — each launcher needs its own select→field-update(→persist) proof. Drive a launcher whose label's `for=` points at a disabled input via `dispatchEvent('click')` (a plain `.click()` is blocked). Precedent: Pay To Address → "Pay To List" dialog (`clients/${ACTIVE_CLIENT}/src/pages/locations/location-left-panel-basic-information.page.ts` `openPayToDialog`/`selectPayToById`, ID-anchored restore) + Master Bill To per-launcher gap (`location-account-address.page.ts`). | LR-057; Sweep 12 `UNPROBED-AFFORDANCE` |
| Author / modify a network listener that asserts save behavior (`page.on('request', ...)`, `waitForRequest`, `waitForResponse`) | Filter on the backend API endpoint (e.g., `req.url().includes('/navigator/api/')`) — NEVER substring-match the page URL (`/settings/location`). Next.js App-Router fires server-component-render POSTs to the page URL for 0-8s after `page.reload()`; a page-URL filter captures these as false-positive saves. | LR-056; ALL-086 |
| Wait for Save enabled / disabled (Angular dirty race) | same page object → `waitForSaveEnabled` / `waitForSaveDisabled` | LR-026 |
| Dismiss "Unsaved changes" alertdialog | same page object → `dismissAlertDialogIfVisible()` | LR-026 |
| Sort a Radix table column (large-option retry) | `clients/${ACTIVE_CLIENT}/src/pages/locations/location-management-history.page.ts` → `clickSortColumn` | LR-025 |
| Activate a Radix UI tab (top-tab or sub-tab) via direct JS in MCP/Chrome | Use Playwright's `.click()` OR dispatch FULL pointer event sequence (`pointerdown`+`pointerup`+`click`) on the `button[role="tab"]`. Plain raw-JS `.click()` alone does NOT flip `aria-selected="true"` — Radix listens for the full event sequence. **MCP/Chrome JS helper**: `nt.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true,...})); nt.dispatchEvent(new PointerEvent('pointerup', {bubbles:true,...})); nt.click()`. Playwright `.click()` already does this. Reproduced 2026-05-11 on Location Settings sub-tabs (Notes, Basic Info, Location Management History). | (no LR yet — pattern-quality, file Phase 1a finding) |
| Wait for page/data ready in Angular SPA | any page object → `waitForAngularStable()` (NEVER `networkidle`) | LR-023 |
| Find a testid / selector | `clients/${ACTIVE_CLIENT}/src/selectors/{module}/{page}.ts`; naming `{module}-{section}-{kind}-{field}` | LR-017 |
| Know a field's baseline / invalid / default value | `clients/${ACTIVE_CLIENT}/src/data/{module}/{page}.ts` | — |
| Understand history schema (LO 42-col, LM 87-col) | `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` §1 §2 | — |
| Understand history boolean encoding per table | LR-036 (Unicode vs SVG `lucide-check`); MCP findings §2 | LR-036 |
| Understand async cross-field validation | LR-010; page object `expectInvalid` / `expectValid` polling helpers | LR-010 |
| Understand date-offset validation constraints | LR-008; NM-1264 (Delivery ≥ Prep) | LR-008 |
| Understand Angular form dirty state persistence across saves | LR-026; defensive handling patterns in page objects | LR-026 |
| File a bug | LR-034 protocol → `clients/${ACTIVE_CLIENT}/reports/bugs/BUG-{MODULE}-{SUBMODULE}-{NNN}.json` (dedup first; codes from `export_test_cases/module-codes.json` — 3-segment grammar since 2026-06-11, legacy IDs resolve via its `bugGrammar.formerIds`) | LR-034 |
| Understand module boundary (LOS ≠ LS) | `clients/${ACTIVE_CLIENT}/docs/MODULE_REGISTRY.md`; `REQUIREMENTS.md` | LR-017, MOD-001 |
| Look up a framework rule `LR-NNN` | path-scoped: `.claude/rules/<topic>.md` (angular, specs, hooks-identity, browser-tool, pipeline, baseline, data, inventory) — auto-loads on matching file edits. Cross-cutting: `docs/read_only_docs/LEARNED_RULES.md`. | — |
| Look up a client rule `LR-ENC-NNN` | `clients/${ACTIVE_CLIENT}/CLAUDE.md` | — |
| Client-specific agent rules (Encore) | `clients/encore/CLAUDE.md` | — |
| Look up an agent-mistake by type | `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` — ALL-* shared, GEN-* generator, HLR-* healer, AUD-* audit, PLN-* planner, HUNTER, GIVER | ALL-072 |
| See every spec for a module | `clients/${ACTIVE_CLIENT}/tests/{module}/` | — |
| See the plan queue | `plans/pending/` (current) + `plans/done/` (history); `plans/INDEX.md` auto-regenerated | LR-035 |
| Invoke/resume/stop autonomous chain execution | `/chain` (start), `/chain resume`, `/chain status`, `/chain stop`, `/chain skip`, `/chain reset`; state lives at `.claude/state/chain.json` | `.claude/skills/chain/SKILL.md`; LR-041 |
| Pick Model + Thinking + PermissionMode for a new subplan | `plans/done/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md` §Model + Thinking Selection Rubric (D17) | LR-041 |
| Flip `**Status**: PENDING → DONE` on a plan that cites its OWN pending/-location path (or any backward self-reference) | Pre-mv: grep plan body for `plans/pending/<SELF>.md`, rewrite prose hits to `plans/done/<SELF>.md` + `(e.g.)` exemption. Post-mv (if caught late): temporarily revert Status to PENDING (hook skips C-check for PENDING) → fix all citations → restore Status to DONE → `validate-plan-closure --enforce --write-manifest`. See [feedback_closure_gate_verify_paths_first.md](../../../../.claude/projects/C--Users-RutvikKhorasiya-projects-encore-framework/memory/feedback_closure_gate_verify_paths_first.md) §Inward-self-reference sub-pattern + ALL-087 chicken-egg workaround. | LR-055; ALL-083; ALL-087 |
| Edit / annotate an **already-DONE** plan in `plans/done/` and the closure hook DENIES it citing C3/C6 on paths you never touched | The hook re-validates the WHOLE file's projected post-state (fail-CLOSED) on ANY edit while Status=DONE, so pre-existing rot blocks your edit. **Incremental Edits don't help** (each intermediate state still fails). Diagnose first: `cat <plan> \| node scripts/validate-plan-closure.mjs --content-from-stdin --plan <plan>`. Then per failing path: **(1) moved** (POM rename `specs/`→`tests/`, `src/data/testdata/`→`src/data/`) → repath the matrix/body cite; **(2) cleaned-but-real** (gitignored `specs_planning/_internal/*` artifacts GC'd from the tree) → `git log --all --oneline -- <path>` to find the blob, then `git show <commit>:<path> > <path>` to RESTORE it (don't fake/skip — they're the real audit trail, often in a `global-mirror` snapshot); **(3) gitignored-absent docs** (MODULE_REGISTRY/REQUIREMENTS) → neutralize the cite (drop the `.md` so C3's regex skips it). Once only ONE failure remains, a single targeted Edit's post-state passes → hook allows it; for multiple, full-file `Write` is the only atomic path. `git diff` after to prove only intended lines changed. | LR-055; LR-037; POM-restructure 2026-06-05 |
| Find MCP catalog (root→column mappings) | `clients/${ACTIVE_CLIENT}/specs_planning/catalogs/hist-root-map-*.md` | — |
| Author or consume a field-inventory artifact (per-module DOM walk) | `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventory-spec.md` (format) + `_internal/field-inventories/_TEMPLATE.md` (skeleton) + per-module `_internal/field-inventories/<module>-<YYYY-MM-DD>.md` | AAE-D9; ALL-077; LR-014/015/038/040 |
| Generate test cases / coverage for a module (field FCC + grid/surface behavior cases) | Methodology = `docs/read_only_docs/CASE_GENERATION_STANDARD.md` (two-axis: field families × 7 surface families, ISTQB+pairwise methods, depth L0-L3) + Encore templates `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-case-generation.md` (§2 field + §3 surface). Skills: `/coverage` → `SUBPLAN_<MODULE>_COVERAGE_QUICK.md` (field FCC + L1 surface must-asserts; **default** for unqualified "create test cases"); `/ultracoverage` → `SUBPLAN_<MODULE>_COVERAGE_DEEP.md` (auto-calls /coverage; L2/L3 exhaustive, depth-chunked). SBC TCs ride `check:tc-parity` (no new script). | LR-065; LR-062; LR-064; LR-057 |
| Author a restructure plan (rebuild / migrate / vendor / split / multi-tenant / deliverable / promote / consolidate) | `.claude/rules/pipeline.md` LR-050 — MUST enumerate stale-slop cleanup IN-SCOPE; never defer to "discover later" subplans. Taxonomy reference: [PLAN_ROOT_CLIENT_DEDUPE.md](../../plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md). | LR-050 |
| Look up identity-switch protocol (mid-session) | [feedback_identity_switch_protocol.md](../../../../.claude/projects/C--Users-RutvikKhorasiya-projects-encore-framework/memory/feedback_identity_switch_protocol.md) — clean re-load, no override | ALL-077; /identity Step 6 |
| Unblock a pipeline-identity §2 write (HUNTER/GIVER/… `[IDENTITY-GATE] cannot access` on a path) | The hook reads the **machine mirror** `scripts/identity-ownership.mjs` (`OWNERSHIP_ROWS`), NOT the markdown — editing `AGENT_SHARED_RULES.md` §2 alone does NOT unblock. Add the row to BOTH (same pattern + order; `node scripts/check-identity-ownership.mjs` gates parity). Fastest path when the write is legitimately the non-pipeline owner's: switch to OWNER (short-circuits §2 per LR-043). Canonical HUNTER artifacts (`old-site-baseline/<module>-*`, `walk-evidence-*`) now have rows (added 2026-06-05). | LR-043; ALL-077 |
| Save a Playwright-CLI accessibility snapshot to disk | `playwright-cli -s=<sess> snapshot --filename <file>` — the flag is `--filename`, NOT `-o` (the `REQUIREMENTS.md` `snapshot -o` example is stale; LR-054 = consult the real CLI). Snapshot AFTER Angular renders — a near-empty first snapshot = captured too early (LRN-002), re-snapshot. Playwright AX snapshots pierce shadow DOM; `document.querySelector` in `eval` does NOT (use a recursive shadowRoot walk). | LR-054; LRN-002; LRN-017 |
| Get authenticated test session | `clients/${ACTIVE_CLIENT}/.env.local` (creds; CI uses `.env.e2e` + Secrets) + `authenticatedSession` fixture in `clients/${ACTIVE_CLIENT}/src/fixtures/pages.fixture.ts` | LR-ENC-003 |
| Establish baseline truth for TC authoring (Encore) | `https://navigator2.training.psav.com/#/setup/locationdetail/1604` (old UI) + `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md` + `OSB-ACCESS-VERIFY-2026-04-24.md` as reference artifact. Old site = baseline truth; new site = observed truth; divergence = signal. Observation-only (zero selector parity — old UI uses `name=`/`id=`, not `data-testid`). Baseline-absent (ECT, EnableMultidayPricing, Merchant Currency column) → `/encore-questions` escalation, not HALT. | LR-ENC-001, LR-045, ALL-024, ALL-078, REQ-014, PLN-049 |
| Browser tool guide — CLI vs Chrome selection matrix | `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (V2 — LR-038 v2; MCP_BROWSER_GUIDE.md archived to `docs/read_only_docs/_archive/`) | LR-038 |
| Shared rules for ALL agents | `docs/read_only_docs/AGENT_SHARED_RULES.md` | R01–R22 |
| Know what must NEVER ship in client source — BEFORE writing it, or why a write/commit/ship was blocked by the jargon gate | Token sets live in `scripts/lib/forbidden-patterns.mjs` (single source of truth): `MARKER_GREP_CLIENT_ONLY` (hard tokens: `PLAN_`/`SUBPLAN_`/`SP-`/identities/`agent-*`/`specs_planning`/`.claude/`) + `SOURCE_COMMENT_JARGON` (`LR-###`/`§`/`Doctrine N`/`doctrine item N`/`Wave-1.5`/`WV15`/`W15-`/`Q-WV`/`CPR-Q`/`EDGE_P`/`walk-evidence`/`field-inventor`/`rejection-affordance`/`rca-*.md`/`_internal/`). Enforced at 3 layers reading that one module: **write-time** PreToolUse hook `.claude/hooks/jargon-gate.sh` (DENIES the Edit into a shippable file — LR-058), **commit-time** `verify-no-forbidden.mjs --staged-diff`, **ship-time** `--target`. **KEEP** (excluded): `NM-####`, `@fcc` tags + describe-title `FCC`, `field-case-runner.ts`, `oracle`/`recon`, `Path [C-Z]`, `F11`. Rule: `.claude/rules/deliverable.md`. Comment-scrub 2026-06-10; write-time gate + gap-pattern close 2026-06-11. | LR-049, LR-058 |
| Work a corporate-only surface (Commission, Labor) or find data empty/absent on office 1604 | Corporate-only data lives on **office 1101** ("Corporate Office"), not 1604. Commission needs Navigator Contracts role; Labor = NM-1881. Currency/pricing variety = 1605 (not 1101). KT: `clients/encore/specs_planning/_internal/intake/commission-hunter-2026-06-26.md` | LR-ENC-005 |
| Push ad-hoc scoped deliverables to encore-mock (`RutviK-JBS/encore_deliverables_test`) | **Per-ticket delivery branches retired 2026-08-13 — only `main` ships via owner's `/push-encore-deliverables`.** For ad-hoc scoped shipments: `scripts/ship-branch.sh --branch=X --modules=<MOD> --surface='<glob>' [--push]` (DRY-RUN default). Named collection presets still work (notes/ssl/legal/account-address/corporate-pricing/auto-addon/left-panel-basic-info/locations). Flow: `git archive HEAD clients/encore/ \| tar -x --strip-components=2` → trim `tests/` to surface + `auth.setup.ts` → `node scripts/xlsx-trim.mjs <wb> --modules=<MOD\|MOD.SUB>` → throwaway `git init` → commit → CLEAN re-extract into fresh temp dir → `node scripts/verify-no-forbidden.mjs --target=<extract>` HARD-GATES push → `git push --force-with-lease`. | agent-mistakes D1+D2; LR-049; LR-050 |

---

## §C. Exploration Registry — What's been mapped

Full registry (table + schema) lives in [.claude/context/exploration-registry.md](.claude/context/exploration-registry.md).
Agents: after first-exploring a surface, append a row there (per §E maintenance triggers below).
To look up whether a surface was already explored, open that file directly.

## §D. Stuck Protocol (2+ failed attempts on the same problem)

1. **STOP re-exploring.** You are burning tokens repeating what the repo already knows.
2. **Re-check §B Routing Table** above — did you miss the right entry?
3. `grep -rn "<testid-or-symptom>" clients/${ACTIVE_CLIENT}/src/pages/ clients/${ACTIVE_CLIENT}/src/selectors/` — 95% of proven patterns live here.
4. `grep "<symptom>" clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` — someone hit this before; the rule ID will tell you what to do.
5. Ask the user ONE specific question — include: what you tried, what failed, what file you consulted. Don't burn more tokens on exploration.

---

## §E. Maintenance (keep this file alive)

**Triggers for updating this file** (agents MUST do this in `/reflect`):
- Created a new findings file, catalog, or discovery artifact → add row to §C Exploration Registry.
- Re-discovered a pattern that HAS a helper but wasn't listed → add row to §B Routing Table.
- Found that a registry entry is stale (app changed, docs moved) → update "Last updated" column + the linked file.
- Caught yourself re-exploring → add an §D Stuck Protocol lesson OR a §B row that would have prevented it.

**Ownership**: every agent. No gatekeeping. Treat like `agent-mistakes.md`: append-only, evidence-first.

**Review cadence**: `/compile-learnings` (weekly) scans this file for routing entries that duplicate `agent-mistakes.md` rules and consolidates.

**Liveness sweep (weekly, at `/compile-learnings`)**: for each §C row, verify all Findings file(s) paths exist on disk; update `Last updated` if the surface has changed; mark rows STALE if all listed paths are gone. **Size budget**: §C ≤ 40 rows; §B ≤ 50 rows — when either cap is reached, archive the oldest fully-complete rows to a companion file rather than growing unbounded.
