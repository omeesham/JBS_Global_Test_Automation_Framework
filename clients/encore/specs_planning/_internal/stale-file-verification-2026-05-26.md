---
title: Stale-file VERIFICATION ledger (per-candidate audit)
created: 2026-05-26
author: Opus verification subagent (read-only)
scope: 24 candidate paths from `stale-file-sweep-2026-05-26.md`, validated against live consumers
authority: READ-ONLY verification; no deletions, no .gitignore mutations performed
parent: clients/encore/specs_planning/_internal/stale-file-sweep-2026-05-26.md
---

# Stale-file VERIFICATION — 2026-05-26

> **Method per candidate**: (1) `ls -la` + `git ls-files <path>` for existence/tracked-status, (2) repo-wide `grep` for basename + full path across `.ts/.mjs/.js/.md/.json/.sh/.yml/package.json/tsconfig*.json/.githooks/`, (3) `git log --oneline -5 -- <path>` for history, (4) verdict (VERIFIED-DEAD | STILL-USED | AMBIGUOUS | SECURITY-CONCERN).

---

## Group A — scripts/ candidates

| File | Tracked? | Refs (live code) | Last commit | Verdict | Rationale |
|---|---|---|---|---|---|
| `scripts/sweep-li-rule1.mjs` | yes | **0 live** — only `plans/done/SUBPLAN_DQU_05B_STRICT_PLAN_LINE_REMEDIATION.md:190,237` (historical) + `SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md:193,229` (historical) | `167ed4d` (2026-04-21 baseline snapshot only) | **VERIFIED-DEAD** | Hard-codes path to `locations_local_information_test_cases.md`; one-off lint sweep idempotent script; not in `package.json`, no `.githooks/` invocation. SUBPLAN_05B closure note ("kept on disk; idempotent, can be re-run if drift recurs") is intent, not invocation — no scheduled job or hook references it. |
| `scripts/sweep-li-rule2.mjs` | yes | **0 live** — same historical refs as rule1 | `167ed4d` | **VERIFIED-DEAD** | Same shape, same hard-coded LI path, same one-off lint pass — never re-invoked since 2026-04-28 author session. |
| `scripts/sweep-li-rule2-extended.mjs` | yes | **0 live** — same historical refs | `167ed4d` | **VERIFIED-DEAD** | Same shape. |
| `scripts/_disposition-pass-2026-05-12.mjs` | yes | **0** — zero hits anywhere (no plans, no code, no hooks) | `f99eed7` (2026-05-26 most recent edit) | **VERIFIED-DEAD** | File comments self-declare "One-off disposition pass per PLAN_DQU_COVERAGE_REMEDIATION v5 step 2.5" — declared one-off. Parent plan PLAN_DQU_COVERAGE_REMEDIATION already executed; no current consumer. |
| `scripts/probes/li-cascade-force-precondition-2026-05-14.raw.json` | yes | **0** — zero hits anywhere | `f99eed7` | **VERIFIED-DEAD** | Probe artifact from closed LI cascade investigation (2026-05-14). |
| `scripts/probes/li-cascade-save-probe-2026-05-14.raw.json` | yes | **0** — zero hits anywhere | `f99eed7` | **VERIFIED-DEAD** | Same as above. |
| `scripts/patch-csv-export-bold-optional.mjs` | yes | **0 live** — `plans/pending/PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md:368,447` explicitly lists for `git rm` + `SUBPLAN_DQU_05B:237` historical | `167ed4d` | **VERIFIED-DEAD** | Already in active migration's Phase D delete list. CSV→XLSX migration kills the CSV export, so the bold-optional patch is obsolete. |

### Group A grep glob expansion: `scripts/probes/li-cascade-*.raw.json`

Both probe files surfaced. No additional matches in `scripts/probes/` beyond the 2 expected files. Probes dir contains ONLY these 2 files.

---

## Group B — pipeline/tests/hooks/fixtures

**Complete dir listing** (7 files total — 3 `.jsonl` + 4 `.json`):

| File | Tracked? | Refs (live code) | Last commit | Verdict | Rationale |
|---|---|---|---|---|---|
| `transcript-in-execute.jsonl` | yes | Referenced by `v12-no-todo-marker-active.json:3` (sibling fixture's `transcript_path` field) | `bbed318` | **AMBIGUOUS** | Sibling JSON references the path string, but the consuming hook `.claude/hooks/lib/check-todo-injection.mjs` uses `runSelfTest()` with inline synthetic data — does NOT `fs.readFileSync` of these fixtures. Per `plans/done/PLAN_TASKLIST_SHAPE_FIX.md:108` ("self-test uses inline data and never `fs.readFileSync` of this file") — fixtures are illustrative reference payloads, not test inputs. |
| `transcript-in-execute-with-todo.jsonl` | yes | Referenced by `v13-capture-payload.json:3`, `v13-todo-tagged-then-edit.json:3`, `v14-tasklist-capture-payload.json:3` (transcript_path strings) | `bbed318` | **AMBIGUOUS** | Same shape as above — referenced by sibling fixtures, but never consumed by code. |
| `transcript-not-in-execute.jsonl` | yes | **0** — zero refs anywhere | `bbed318` | **VERIFIED-DEAD** | Not even cross-referenced from sibling JSON fixtures. |
| `v12-no-todo-marker-active.json` | yes | **0 live code** — only documented in `plans/done/SUBPLAN_CCE_02B_TODO_INJECTION_ENFORCEMENT.md:99` (historical authoring note) | `bbed318` | **AMBIGUOUS** | Documented as illustrative fixture for `--validate` mode; hook self-test uses inline data. Could be useful as developer reference, but no automated consumer. |
| `v13-capture-payload.json` | yes | **0 live code** — `plans/done/PLAN_TASKCREATE_HOOK_FIX.md:127` mentions as parity reference for v14 | `bbed318` | **AMBIGUOUS** | Same as v12. Per PLAN_TASKCREATE_HOOK_FIX:127, kept "for parity" with v14 — illustrative, not consumed. |
| `v13-todo-tagged-then-edit.json` | yes | **0 live code** — only `SUBPLAN_CCE_02B:100` historical | `bbed318` | **AMBIGUOUS** | Same. |
| `v14-tasklist-capture-payload.json` | **no (untracked)** | **0 live code** — `plans/done/PLAN_TASKCREATE_HOOK_FIX.md:127,155,207` + `PLAN_TASKLIST_SHAPE_FIX.md:44,90,108,193` (illustrative + shape docs) | n/a (untracked, just created/edited 2026-05-26 20:08) | **AMBIGUOUS — RECENTLY EDITED** | The fixture was REWRITTEN today (2026-05-26) per PLAN_TASKLIST_SHAPE_FIX. Active maintenance signal — recent edit, current/pending plan referenced it. NOT verified-dead. |

### Group B summary

- **0 fixtures are STILL-USED by automated code** (hook's `runSelfTest` is inline, never reads files).
- **6 fixtures are AMBIGUOUS — illustrative reference docs**, recently maintained in some cases (v14 was edited today).
- **1 fixture is VERIFIED-DEAD** (`transcript-not-in-execute.jsonl` — not even cross-referenced by sibling JSONs).

**Recommendation**: needs USER DIRECTION. Either (a) the fixtures are kept as documentation parity-checks (keep + add `--self-test-with-fixtures` mode to actually consume them), or (b) acknowledge they are reference-only and either move them to `docs/` or delete them. The recent edit of v14 (today!) per `PLAN_TASKLIST_SHAPE_FIX.md` suggests active intent to maintain them as the canonical fixture shapes — favoring (a).

---

## Group C — root cruft

| File | Tracked? | Refs (live code) | Last commit | Verdict | Rationale |
|---|---|---|---|---|---|
| `30` (literal filename, 0 bytes) | yes | **0** — grep hits in `plans/INDEX.md:123` (table row number "30"), `SUBPLAN_PARITY_W1_01:?`, `W2_07:?`, `W2_06:?`, `W1_03:?` are all numeric content (line numbers, table rows, "30 days") — NOT references to a file named `30` | `167ed4d` (baseline snapshot) | **VERIFIED-DEAD** | Empty (0 bytes); tracked; only added in `167ed4d` (2026-04-21 baseline snapshot); accident — likely `head -30 > 30` redirect mistake. Safe to delete. |
| `v0-baseline-loc-settings.yml` | **no (untracked)** | **0** | n/a | **VERIFIED-DEAD** | Playwright CLI YAML accessibility snapshot misplaced at root (2026-05-21 mtime); same shape as `.playwright-cli/page-*.yml`. Untracked, no consumers. |
| `v0-page.png` | **no (untracked, gitignored `/*.png`)** | **0** | n/a | **VERIFIED-DEAD** | Same source as v0-baseline. Already covered by `.gitignore` line 155 `/*.png`. |
| `v0-notes-tab.png` | **no (untracked, gitignored)** | **0** | n/a | **VERIFIED-DEAD** | Same. |
| `grep.exe.stackdump` | yes (already staged D) | **0** | n/a | **VERIFIED-DEAD** | Windows crash dump; already staged for deletion in current dirty tree. |
| `sb-basicinfo.yml` | yes | **0 live** — `plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md:102` + `SUBPLAN_RCD_C:151,201` (cleanup plans only) | `d4e5e0e` | **VERIFIED-DEAD** | Apr 20 mtime; already in active cleanup plan SUBPLAN_RCD_C Phase 5. |
| `sb2.yml`, `sb3.yml`, `sb4.yml`, `sb5.yml`, `sb6.yml` | yes (each) | same — cleanup-plan-only | `d4e5e0e` (initial bundle) | **VERIFIED-DEAD** (×5) | Same — all 5 are Apr 20 scratch CLI dumps. |
| `snap-save-test.yml` | yes | same — cleanup-plan-only | `d4e5e0e` | **VERIFIED-DEAD** | Same. |
| `alert-state.png` | **no (untracked)** | **0 live** — `PLAN_ROOT_CLIENT_DEDUPE.md:103` only | n/a | **VERIFIED-DEAD** | Apr 24 screenshot, no consumers. |
| `li-cascade-probe-2026-04-28.json` | yes | **0 live** — `PLAN_ROOT_CLIENT_DEDUPE.md:104` + `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md:237` + `plans/done/PLAN_FIND_BUGS_LI_FOLLOWUP.md:252` (historical evidence citation) | `167ed4d` | **AMBIGUOUS** | `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` (PENDING) cites this probe as supporting evidence for an unfiled QA bug ("Same broken-cascade pattern as LI-002 — 3 of 11 LI parent-children groups affected. Cascade probe across all 11 groups documented in `li-cascade-probe-2026-04-28.json`."). If the bug is escalated, this probe is the evidence vehicle. Cleanup plan SUBPLAN_RCD_C Phase 5 lists it for deletion, but a still-PENDING QA bug plan references it as evidence. **Needs user direction** — delete probe + accept loss of evidence trail, OR migrate evidence into a permanent location first. |
| `li-inventory-2026-04-28.json` | yes | **0 live** — `PLAN_ROOT_CLIENT_DEDUPE.md:104` + `plans/done/PLAN_FIND_BUGS_LI_FOLLOWUP.md:251` historical only | `167ed4d` | **VERIFIED-DEAD** | Only cited by a done plan as historical evidence; the cleanup plan already enumerates it for deletion. |
| `cli and mcp in our repo.md` | yes | **0 live** — only `plans/done/PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md:91,181` (the very plan that decommissioned MCP) + cleanup plans | `87f80cc` | **VERIFIED-DEAD** | Stale comparison doc from pre-CLI-switch era. Per `PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md` (DONE) the framework completed the MCP→CLI switch — the doc is a historical artifact. |
| `clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.csv` | **no (untracked, gitignored by `clients/*/specs_planning/` line 185)** | **0** — grep hits at `clients/encore/exports/` are DIFFERENT path; `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md:115` lists 11 deliverable CSVs (under `clients/encore/test_cases_csv/`), not the stray under `specs_planning/.../locations/` | n/a | **VERIFIED-DEAD** | Stray CSV in MD source dir; gitignored so deletion is a no-op for git. Safe to remove. |

---

## Group D — git status `D` entries (already staged for deletion)

| File | Tracked? | Refs | Last commit | Verdict | Rationale |
|---|---|---|---|---|---|
| `reports/.gitkeep` | yes (staged D) | `.gitignore:39 !reports/.gitkeep` (un-ignore rule), `SUBPLAN_RCD_C:138` (cleanup) | n/a | **VERIFIED-DEAD** (with caveat) | `.gitignore:38 reports/*` + `:39 !reports/.gitkeep` means the un-ignore rule for `.gitkeep` becomes ORPHAN after deletion. **Recommend pairing the delete with `.gitignore` line 39 removal in the same commit** (already covered by SUBPLAN_RCD_C). Otherwise harmless leftover (just an unused exception rule). |
| `reports/client-deliverable-ready-2026-04-21.md` | yes (staged D) | `plans/done/PLAN_AAA_CLIENT_DELIVERABLE_REMAINING.md:289` (historical authoring) | n/a | **VERIFIED-DEAD** | Internal validation report dated 2026-04-21; client-deliverable rebuild plan already closed; report is point-in-time history. SUBPLAN_RCD_C covers. |
| `.reports/shared-setup-audit.json` | yes (staged D) | 4 historical refs — `PLAN_SHARED_SETUP_DQU.md:132`, `SUBPLAN_SHARED_SETUP_DQU_BUILDER.md:49,221`, `SUBPLAN_SHARED_SETUP_DQU_GIVER.md:131,170,200` — all in `plans/done/` | n/a | **VERIFIED-DEAD** | Suite-run baseline JSON output from a closed audit cycle; no current consumer. Regenerable via `npx playwright test --grep "@shared-setup" --reporter=json` (per the GIVER subplan line 131). |
| `.playwright-cli/page-2026-04-24T15-52-15-430Z.yml` (spot 1) | yes (staged D) | **0** | n/a | **VERIFIED-DEAD** | DOM snapshot YAML from April catalog walks; gitignore line 213 covers `.playwright-cli/page-*.yml` going forward. |
| `.playwright-cli/page-2026-04-29T14-30-05-215Z.yml` (spot 2 — random) | yes (staged D) | **0** | n/a | **VERIFIED-DEAD** | Same shape. |
| `.playwright-cli/storage-state-2026-05-18T07-03-57-805Z.json` (spot 3 — storage state) | yes (staged D) | `plans/done/SUBPLAN_DQU_V6_PILOT_SSL_A.md:356` (auth-refresh state note — historical) + `SUBPLAN_DQU_V6_PILOT_SSL_B.md` | n/a | **SECURITY-CONCERN — STAGED DELETE IS CORRECT** | `git show HEAD:` reveals file contains **active Microsoft Entra OAuth tokens**: `esctx-Ady6hmcUEtk` cookie with full bearer-token-shape value `AQABCQEAAAAdDD7nC9b5...`, plus `x-ms-gateway-slice`, `stsservicecookie`, `AADSSO` Azure AD session cookies. This file SHOULD be deleted (correctly staged D). Total 134 `.playwright-cli/*` files staged for deletion — spot-check confirms storage-state JSONs in that set are credential carriers and the deletion is the right move. |

---

## SECURITY-CONCERN section

1. **`.playwright-cli/storage-state-2026-05-18T07-03-57-805Z.json`** (already staged D, 9.7K, tracked) — Contains live Microsoft Entra session cookies (`esctx-*`, `AADSSO`, `x-ms-gateway-slice`). The current staged-delete is the correct action. **Do NOT revert.** Next commit will fully expunge from HEAD; consider `git filter-repo` or BFG if historical commits need scrubbing (out of scope here — but tracking secret was committed in the past, so the secret in old commits is still discoverable).
2. **`.playwright-cli/` `.gitignore` gap (root)** — Root `.gitignore:213` covers only `*.yml` + `*.log` in `.playwright-cli/`; `storage-state-*.json` and `page-*.png` NOT covered. This is why 134 files accumulated tracked-then-staged-D. **Recommended .gitignore additions** (see end of file).
3. **Out-of-scope reference — `clients/encore/.playwright-cli/inject-auth.js`** (from parent sweep §C, not in this verification scope) — sweep already flagged as IMMEDIATE-DELETE due to Entra session cookies in plaintext. Re-asserting here for completeness — but verification of THAT file was not in the 24-file scope of this audit.

---

## AMBIGUOUS section — items needing user direction

1. **`pipeline/tests/hooks/fixtures/` — 6 of 7 fixtures (excluding `transcript-not-in-execute.jsonl`)**
   - The hook (`.claude/hooks/lib/check-todo-injection.mjs`) uses inline `runSelfTest()` data; never reads these files.
   - However `v14-tasklist-capture-payload.json` was **EDITED TODAY** (2026-05-26 20:08) per `PLAN_TASKLIST_SHAPE_FIX.md` — active maintenance signal.
   - Question for user: are these fixtures (a) kept as canonical illustrative shapes for hook payload structure (then add `--self-test-with-fixtures` mode so the hook actually consumes them and they stop being "dead"), or (b) acknowledged as documentation artifacts not consumed by code (then they could move under `docs/internal/hook-fixtures/` instead of `pipeline/tests/`)? Or (c) delete entirely if the inline `runSelfTest` is enough.
2. **`li-cascade-probe-2026-04-28.json`** (root, tracked)
   - Cited as evidence in PENDING plan `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md:237` — "Cascade probe across all 11 groups documented in `li-cascade-probe-2026-04-28.json`".
   - The cleanup plan (SUBPLAN_RCD_C Phase 5) deletes it.
   - Question for user: delete the probe and let the cleanup commit happen, OR migrate the probe's evidence value into `clients/encore/specs_planning/_internal/li-cascade-evidence-2026-04-28.md` (permanent narrative + table) first, THEN delete the raw JSON? Probably the second — preserves the audit trail.

---

## Verdict summary

- **VERIFIED-DEAD**: 21 paths
  - All 7 Group A scripts/probes
  - 1 of 7 Group B fixtures (`transcript-not-in-execute.jsonl`)
  - 12 of 13 Group C root cruft (including `30`, all 6 `sb*.yml`, `snap-save-test.yml`, `alert-state.png`, `v0-*`, `cli and mcp...md`, `li-inventory-...json`, stray CSV; excludes `li-cascade-probe-2026-04-28.json` which is AMBIGUOUS)
  - 5 of 6 Group D entries (`reports/.gitkeep` with `.gitignore` caveat, `reports/client-deliverable-ready-2026-04-21.md`, `.reports/shared-setup-audit.json`, plus 2 spot-checked playwright-cli YAML/PNG)
- **STILL-USED**: 0 paths. None of the candidates have live code consumers.
- **AMBIGUOUS**: 7 paths (6 hook fixtures + 1 li-cascade probe) — see section above for user-direction asks.
- **SECURITY-CONCERN**: 1 path — `.playwright-cli/storage-state-2026-05-18T07-03-57-805Z.json`. **Staged-delete is correct; do not revert.**

---

## Recommended .gitignore additions (post-cleanup)

To prevent re-accumulation:

```
# root .gitignore additions (around line 213)
.playwright-cli/storage-state-*.json
.playwright-cli/page-*.png

# clients/encore/.gitignore — add (currently NO .playwright-cli rule):
.playwright-cli/
.playwright-mcp/

# root .gitignore — REMOVE line 39 (!reports/.gitkeep) when reports/.gitkeep gets deleted (or it becomes a dead exception rule pointing at a non-existent file)
```

The first three are SHIPPING-SAFETY additions (prevent client deliverable from carrying agent walk artifacts / auth cookies). The fourth is hygiene (orphaned ignore exception). All four are independent of the deletion decisions in this ledger.

---

## What's safe to delete RIGHT NOW (no user blockers)

If user wants minimum-risk auto-delete:

1. All 7 Group A scripts (`scripts/sweep-li-rule1.mjs`, `sweep-li-rule2.mjs`, `sweep-li-rule2-extended.mjs`, `_disposition-pass-2026-05-12.mjs`, `patch-csv-export-bold-optional.mjs`, both `scripts/probes/li-cascade-*.raw.json`)
2. `transcript-not-in-execute.jsonl` (the one VERIFIED-DEAD hook fixture)
3. The 12 verified-dead Group C entries (`30`, `sb*.yml` x6, `snap-save-test.yml`, `alert-state.png`, `v0-*` x3, `cli and mcp in our repo.md`, `li-inventory-2026-04-28.json`, stray CSV)
4. All 134 `.playwright-cli/page-*.yml/png` + storage-state staged-D entries (just let the next commit ship them)
5. `reports/.gitkeep`, `reports/client-deliverable-ready-2026-04-21.md`, `.reports/shared-setup-audit.json`

Total auto-safe: 19 paths + 134 staged playwright-cli files = **153 deletions**.

What requires user direction (7 paths):
- 6 hook fixtures (v12, v13×2, v14, transcript-in-execute, transcript-in-execute-with-todo)
- 1 `li-cascade-probe-2026-04-28.json` (pending-plan evidence value)
