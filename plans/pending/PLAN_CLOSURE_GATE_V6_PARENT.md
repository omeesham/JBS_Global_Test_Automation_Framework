---
title: Plan-Closure Gate v6 — Chunked Redesign After v5 23-Defect Audit
Status: PENDING-DRAFT-v6
Priority: P0-EMERGENCY
Created: 2026-05-18
Identity: OWNER
Model: claude-opus-4-8
Thinking: max
PermissionMode: auto
RiskAcknowledged: true
BrowserTool: none
Justification: max — multiple security-contract failures in shipped v5 enforcement boundary; chunked redesign with PROMISE-PAIRED-TEST DISCIPLINE + Preservation Matrix discipline; 7 subplans + 1 parent
closure_meta: true
---

## Context — why v6 exists

v5 (`plans/done/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md`, 795 lines, 52 audit corrections) shipped in 3 commits (`717bf72` + `32398e2` + `6063b04`) and was closed with a self-graded GREEN `/final-q` verdict. Two external AI auditors then found 16 defects between them; self-review found 7 more. Total: **23 confirmed defects, 5 CRITICAL exploitable bypasses of the authorization surface**.

**Audit evidence (read-only source-of-truth)**: `C:\Users\RutvikKhorasiya\.claude\plans\dazzling-noodling-yeti.md` — session-plan that ran the audit, lists every defect with file:line evidence + plan-body citation showing the contract that was broken.

The v5 implementation failed because:
- 41 files in 3 commits in 1 session = too much surface to verify per-promise in one sitting.
- The "ALL GREEN" stamp in `verify-v5-landing.sh` was a **string-presence smoke test**, not behavior verification.
- Self-grading by the same session that shipped the work is structurally non-falsifiable (AUD-017).

**v6 inverts these failure modes**:
- 7 subplans + 1 parent (this file). Each subplan is sized for ONE session (≤6 hours authoring + paired-tests + audit).
- Linear dependency DAG (v6-A → v6-G). No chunk starts until prior chunk closes GREEN per external audit.
- PROMISE-PAIRED-TEST DISCIPLINE is a hard strict line: every MUST/REQUIRED/ENFORCED/FAIL/DENY in any v6 plan body has a paired self-test that fails-pre-implementation and passes-post.
- Preservation Matrix (below) tracks every inherited v5 design item + every new defect by chunk owner. No row may be orphaned at v6-G closure.

## v5 landing review — 23 defects

### Part A — first auditor (6 findings, 3 CRITICAL)

| # | Defect | Severity |
|---|---|---|
| A1 | Closure manifest for the gate's own plan never written ([validate-plan-closure.mjs:565-567](scripts/validate-plan-closure.mjs:565) EXEMPT path skips writeManifestFile) | CRITICAL |
| A2 | Hook wrapper fails open on missing mode / missing lib / node throw ([plan-closure-gate.sh:22+32+35+41](.claude/hooks/plan-closure-gate.sh:22) — every fail path `exit 0`, no deny JSON) | CRITICAL |
| A3 | `execSync` with shell-interpolated `${targetPath}` from tool_input ([check-plan-closure.mjs:225-228](.claude/hooks/lib/check-plan-closure.mjs:225)) | MEDIUM |
| A4 | Pre-commit hook does NOT invoke any of the 3 closure validators ([.githooks/pre-commit:36](.githooks/pre-commit:36)) | CRITICAL |
| A5 | Execution Summary says "2-commit V4 bootstrap" — reality is 3 commits | LOW |
| A6 | Auditor environment hits `dubious ownership`; remediation step not in `docs/SETUP.md` | LOW (env) |

### Part B — second auditor (10 findings, independent of Part A; 2 CRITICAL)

| # | Defect | Severity |
|---|---|---|
| B1 | `closure_meta` exemption skips ALL of C1-C5, not just C1 — plan §A1 line 143 + §V4 line 185 promised "C1 exemption granted, validator proceeds to C2–C5". Implementation at [validate-plan-closure.mjs:565-567](scripts/validate-plan-closure.mjs:565) early-returns EXEMPT skipping ALL checks | **CRITICAL** |
| B2 | `isExempt()` reads `closure-overrides.json` from disk, not HEAD/staged blob ([validate-plan-closure.mjs:528](scripts/validate-plan-closure.mjs:528)) — bypasses staged-blob authorization model promised in plan line 236-237 | **CRITICAL** |
| B3 | `runChanged` + `runStaged` silently convert git errors to empty array → PASS ([:683-686](scripts/validate-plan-closure.mjs:683) + [:764-767](scripts/validate-plan-closure.mjs:764)) — plan B15 line 94 promised "never silent pass" | HIGH |
| B4 | C4 structured handoff does not require `recipient-required-token` to be present ([:389-401](scripts/validate-plan-closure.mjs:389)) — plan B13 promised 3-line contract | HIGH |
| B5 | C4 shorthand sibling resolution is NOT parent-aware ([:310-326](scripts/validate-plan-closure.mjs:310)) — parses parent then ignores it | MEDIUM |
| B6 | Manifest validation only checks `plan_sha256` + `validator_version` ([validate-plan-layout.mjs:126-128](scripts/validate-plan-layout.mjs:126)) — plan B7 promised full schema + config_sha + self_hash + additionalProperties:false | HIGH |
| B7 | Fake manifest artifacts launder missing cited artifacts — [validate-plan-closure.mjs:270-273](scripts/validate-plan-closure.mjs:270) C3 passes any path in manifest.artifacts without existence/hash check; [validate-plan-layout.mjs:173-184](scripts/validate-plan-layout.mjs:173) only hashes "if exists" | HIGH |
| B8 | `validate-overrides.mjs` defines `loadSchema()` but never calls it ([validate-overrides.mjs:47-54](scripts/validate-overrides.mjs:47)) | MEDIUM |
| B9 | D23 "ALL GREEN" passes without proving any wrapper / hook / pre-commit / manifest behavior — [verify-v5-landing.sh](scripts/test-fixtures/plan-closure/verify-v5-landing.sh) line 10+ comment "string-presence only, not behavior" | MEDIUM |
| B10 | `plans:validate-closure:write-manifest` is exposed as a normal `npm run` command ([package.json:93](package.json:93)) — plan promised "closure-ceremony only, sole invocation site" | MEDIUM |

### Part C — self-found (7 findings beyond both auditors)

| # | Defect | Severity |
|---|---|---|
| C1 | `runChanged` validates working-tree body against HEAD-loaded overrides — source-of-truth mismatch | MEDIUM |
| C2 | Status detection falls back to `body.slice(0, 800)` when no `\n---` found — coincidental "Status: DONE" trips DONE | LOW |
| C3 | `recordAttempt` reads-modifies-writes JSON without locking — concurrent hook fires clobber attempts log | MEDIUM |
| C4 | `bodyAfterTarget = body.slice(body.indexOf(...))` returns last char when target string not found (indexOf returns -1) | LOW |
| C5 | Path-traversal not normalized in hook's `targetPath` — agent-controllable input crosses path classifier | LOW |
| C6 | `loadOverrides` silently returns `[]` on any error — bypass on JSON parse failure | MEDIUM |
| C7 | Schema file `.claude/closure-overrides.schema.json` is tracked but its own integrity is never enforced | LOW |

**Net**: 5 CRITICAL, 5 HIGH, 6 MEDIUM, 7 LOW. Three independent bypasses on the same authorization surface (B1, B2, A2).

## v6 redesign mandate

### STRICT LINE — PROMISE-PAIRED-TEST DISCIPLINE (LR-046, non-rescopable)

For every line in any v6 plan body (this parent or any subplan) that contains any of `MUST` / `REQUIRED` / `ENFORCED` / `FAIL` / `DENY`, the implementation phase MUST produce a self-test that fails-pre-implementation and passes-post-implementation. The verify-*.sh BEHAVIOR section becomes the contract that the implementation honored the design.

No `[OK]` / `ALL GREEN` declaration is valid if it relies on string-presence (grep for the word). All `[OK]` declarations must invoke the runtime and assert behavior shape (JSON output, exit code, observable side-effect).

v5 failed because the discipline was "check strings exist in files" instead of "check behavior matches plan-body promise". v6 inverts: BEHAVIOR > SMOKE.

### STRICT LINE — CHUNK-AT-A-TIME DISCIPLINE (LR-046, non-rescopable)

Subplans land linearly in the dependency order v6-A → v6-G. NO chunk may begin until the prior chunk is `Status: DONE` AND its manifest exists AND an external AI auditor has re-passed the chunk with GREEN verdict. If the auditor returns RED on a chunk, remediation happens within that same chunk (its plan body grows to cover the defect + paired test); the next chunk does NOT start.

### STRICT LINE — PRESERVATION MATRIX COMPLETENESS (LR-046, non-rescopable)

The Preservation Matrix (below) MUST be reproduced VERBATIM in this parent. At v6-G dogfood closure, EVERY row in the matrix MUST be ticked by exactly one chunk's Execution Summary. ANY untickable row = automatic RED on v6-G; v6 cannot close until the row is addressed (either by extending a chunk's scope or by adding an 8th chunk).

### STRICT LINE — PROMISE-PAIRED-TEST TABLE ≥N rows BEFORE /planning EXIT (LR-046, non-rescopable, added 2026-05-18)

Each subplan A–G has a PROMISE-PAIRED-TEST table that starts as an empty stub. The `/planning` session that authors each subplan MUST NOT exit Step 3 until the table contains ≥N rows, where N = the count of bullets in that subplan's `## Scope hint (from parent matrix)` section. Empty-table or partial-table exit = LR-046 strict-line violation, gate RED.

### STRICT LINE — EXTERNAL AUDITOR ON CLOSED PARENT (LR-046, non-rescopable, added 2026-05-18 to close AUD-017 gap)

v6-G writes the parent's Execution Summary and runs the parent's closure ceremony. AUD-017 forbids self-grading by the same session that produced the deliverable. Therefore: AFTER v6-G dogfood writes `plans/_closure_manifests/PLAN_CLOSURE_GATE_V6_PARENT.md.manifest.json` AND moves parent + 7 subplans to `done/`, an **external AI auditor in a fresh session** MUST review the closed parent + 7 closed subplans + manifest validity + Preservation Matrix completeness, and return a written GREEN verdict cited in v6-G's own Execution Summary. v6 is not "shipped" until that verdict lands. Without the verdict, v6 has the same structural self-grading flaw that produced 23 v5 defects.

## Subplan dependency DAG

```
v6-A (Foundation: overrides schema + validate-overrides + schema-hash)
  ↓
v6-B (Validator C1-C2: forbidden tokens + Execution Summary + isExempt HEAD-authority + closure_meta C1-only narrowing)
  ↓
v6-C (Validator C3-C5: cited artifacts + handoffs + strict-line vs deviation; manifest-fallback existence+hash; parent-aware shorthand; recipient-required-token enforcement)
  ↓
v6-D (Manifest + Layout: writeManifestFile incl. EXEMPT + full schema enforcement + artifact verification + no silent git errors + staged-blob authority for --changed)
  ↓
v6-E (Hook lib: execFileSync + path normalization + concurrency-locked attempts + handleEditMode/handleBashMode JSON contract self-tests)
  ↓
v6-F (Wrapper fail-CLOSED + .githooks/pre-commit wires 3 validators + verify-no-forbidden NB3 + package.json no public :write-manifest)
  ↓
v6-G (Rule .claude/rules/plan-closure.md + /execute Phase 3.5 + /audit integration + docs/SETUP.md safe.directory + 2-commit bootstrap dogfood on parent + manifest)
```

Linear chain, no parallelism. Each subplan closes (Status: DONE + manifest written) before the next starts.

## Chunk-to-defect coverage matrix

| Chunk | Subplan filename | Scope (1-line) | Defects resolved | Paired-test count target |
|---|---|---|---|---|
| v6-A | `SUBPLAN_CLOSURE_GATE_V6_A_OVERRIDES_FOUNDATION.md` | Override file + schema + author whitelist + validate-overrides.mjs (with loadSchema actually called + schema-hash integrity) | B8, C7 | 13+ assertions + 5 fixtures |
| v6-B | `SUBPLAN_CLOSURE_GATE_V6_B_VALIDATOR_C1_C2.md` | validate-plan-closure.mjs C1+C2 checks; isExempt via loadOverrides(mode); closure_meta exempts ONLY C1; Status detection requires frontmatter; loadOverrides errors are diagnostic | B1, B2, C2, C6 | 12+ fixtures |
| v6-C | `SUBPLAN_CLOSURE_GATE_V6_C_VALIDATOR_C3_C5.md` | C3+C4+C5; C3 manifest-fallback verifies existence+hash; C4 parent-aware shorthand + recipient-token enforcement + bodyAfterTarget guard; C5 strict-line vs deviation | B4, B5, B7(C3-half), C4 | 15+ fixtures |
| v6-D | `SUBPLAN_CLOSURE_GATE_V6_D_MANIFEST_LAYOUT.md` | Manifest write (PASS+EXEMPT both produce manifest); layout enforces ALL fields + missing/tampered=RED; runChanged/runStaged remove silent catches; --changed uses staged blob | A1, B3, B6, B7(layout-half), C1 | 10+ fixtures + layout assertions |
| v6-E | `SUBPLAN_CLOSURE_GATE_V6_E_HOOK_LIB.md` | check-plan-closure.mjs: execFileSync (no shell), path-resolve+symlink-reject, proper-lockfile on attempts, full handleEditMode/handleBashMode JSON contract self-tests | A3, B9(hook-half), C3, C5 | 15+ assertions incl. 8-10 end-to-end JSON contract tests |
| v6-F | `SUBPLAN_CLOSURE_GATE_V6_F_WRAPPER_PRECOMMIT_NPM.md` | plan-closure-gate.sh fail-CLOSED on all 3 paths; .githooks/pre-commit invokes 3 validators; verify-no-forbidden NB3; remove :write-manifest npm script | A2, A4, B10 | 2 new integration tests + pre-commit smoke |
| v6-G | `SUBPLAN_CLOSURE_GATE_V6_G_RULE_SKILL_CEREMONY.md` | LR-NNN rule body; /execute Phase 3.5; /audit integration; docs/SETUP.md; 2-commit bootstrap dogfood on parent (parent MUST pass C2-C5 before --write-manifest since B1's narrowed exemption is C1-only) | A5, A6, B9(verify-*-half) | Parent + 7 subplans all close with manifests |

## Preservation Matrix

### Layer 1: v5 design preservation (46 numbered audit corrections — none may be dropped)

The v5 plan body carries these audit corrections across v1→v4 review cycles. Each MUST flow into the corresponding chunk.

| v5 id | What it fixes | Owning chunk |
|---|---|---|
| B1 | C1 token false-positives in fenced/heading/quoted contexts | v6-B |
| B2 | Fixture dir exempt only for `_*`-prefix non-`.md` helpers | v6-A |
| B3 | Inline-backtick filter removed from rule | v6-G |
| B4 | No `user-approved:` / `override:` forgeable filters | v6-B |
| B5 | `pipeline:validate` tolerates pre-gate-land manifest-less plans (grandfathering) | v6-D |
| B6 | Manifest has `plan_sha256` + `validator_version` + `validator_config_sha256` + `validator_self_hash` | v6-D |
| B7 | Layout validates schema (additionalProperties:false), plan_sha256, artifact SHA-256 | v6-D |
| B8 | C2 heading accepts `##` through `####` levels | v6-B |
| B9 | C2 cited-path extension set broadened | v6-B |
| B10 | C3 path normalization | v6-C |
| B11 | C3 extension set extended (`.log`/`.txt`/`.har`/`.xml`/`.md`/`.csv`/`.diff`/`.patch`) | v6-C |
| B12 | C4 three-tier resolution: full-filename / parent-aware-shorthand / fail | v6-C |
| B13 | C4 structured handoff form (target+topic+recipient-required-token) | v6-C |
| B14 | C5 strict-token regex includes `all\s+\d+` / `all-\d+` / `all\d+` | v6-C |
| B15 | Every git invocation wrapped (dubious-ownership + bad-object + not-a-git-repo patterns) | v6-A + v6-B + v6-D |
| NB1 | `validate-plan-layout --check` is READ-ONLY (no manifest writes) | v6-D |
| NB2 | Override schema `additionalProperties: false` rejects unknown keys (no `closure_circular_ok`) | v6-A |
| NB3 | `verify-no-forbidden.mjs` pending-skip is closure-gate-aware (not blanket) | v6-F |
| M1 | Validator-version migration via `--rewrite-manifests` user tool | v6-D |
| M2 | Closure-attempts state keyed on `<plan>-<YYYY-MM-DD>.json` (not session_id) | v6-D + v6-E |
| M3 | Path-exemption via `closure_meta: true` MARKER (not literal filename) | v6-B |
| M4 | Status flip + manifest write + `git mv` in ONE commit (atomicity) | v6-G |
| M5 | LR-NNN collision check (`grep -hoE "LR-[0-9]+"` then MAX+1) | v6-G |
| R1 | Reviewer methodology cross-checks every cited count | v6-G |
| R2 | PowerShell-aware Bash hard-deny on lock-paths + read-only allowlist | v6-E + v6-F |
| R3 | Marker exemption ONLY when `closure_meta: true` AND basename ∈ `meta_plans[]` (double-keyed) | v6-A + v6-B |
| R4 | Fail-CLOSED policy (superseded fail-OPEN forgery surface) | v6-E + v6-F |
| R5 | Authorization Surface Integrity §R5 first-class concern (matrix in rule body) | v6-G |
| F1 | Count math corrected (52 not 42) + de-dupe discipline | v6-G |
| F2 | Bootstrap user/manual seed — agent MAY NOT self-add to `meta_plans[]` | v6-A + v6-G |
| F3 | Future-manifest path is computed output, not required pre-existing evidence | v6-D |
| F4 | Invocation-id cross-check is YELLOW on missing logs, not RED | v6-D |
| V1 | PowerShell writer regex (`Set-Content`/`Out-File`/`Tee-Object`/`Add-Content`) + node fs writers + `READ_ONLY_PREFIX_RX` allowlist | v6-E |
| V2 | Author whitelist is best-effort attribution caveat (not crypto proof) | v6-A + v6-G |
| V3 | Staged-blob (`git show :path`) for pre-commit (not HEAD) | v6-A + v6-F |
| V4 | 2-commit bootstrap (Commit-A seed, Commit-B wire) — solves chicken-and-egg | v6-G |
| V5 | Fail-CLOSED for plan-paths and lock-paths; fail-OPEN only out-of-scope; diagnostic counter | v6-E + v6-F |
| V6 | `--enforce` is READ-ONLY; manifest writes require `--write-manifest` (closure-ceremony only) | v6-D |
| V7 | `validator_invocation_id` cross-checked against `closure-attempts` log | v6-D |
| V8 | `verify-v5-landing.sh` BEHAVIOR section (renamed verify-v6-*.sh) | v6-G |
| V9 | Parent field parsing reuses `parseField` from plans-reindex.mjs | v6-C |
| V10 | Last-change timestamp (`git log -1 --format=%at`) for grandfathering | v6-D |
| NV1 | Backslash in lock-path regex (Windows path compatibility) | v6-E |
| NV2 | `--cleanup-tmp-manifests` separate mode (not auto in `--check`) | v6-D |
| NV3 | BEHAVIOR vs SMOKE comments in verify scripts (anti-string-presence-stamp) | v6-G |
| NV4 | 25 plan-body fixtures + 3 helper files (`_overrides.json`, `_authors.txt`, `_helpers.mjs`) | v6-B + v6-C |
| P7-RETRO | Retroactive scan tool `npm run plans:validate-closure:retro` writes `.claude/state/closure-audits/_closure_audit_<YYYY-MM-DD>.md` (v5 Phase 7 — was silently absent from v6 stubs; reinstated 2026-05-18) | v6-F |
| FQ-4.5 | `.claude/skills/final-q/SKILL.md` Step 4.5 — closure + layout + fail-OPEN-counter reads; force RED on validator FAIL (v5 Phase 5 — was silently absent from v6 stubs; reinstated 2026-05-18) | v6-G |

#### Supplemental Layer 1 — v5 corrections not in primary matrix above (reconciliation appended 2026-05-18)

v5 plan body §Context line 22 claimed "52 corrections" but the actual sum of numbered tables (v2 blockers 15 + v2 NB 4 + v2 self 5 + R 4 + v3 14 + v4 final 8) = 50; with R1 (methodology-only) = 51; v1's 10 corrections were rolled into v2 items at v2 authoring time (no separate numbered table). v6 author MUST track these 5 reconciliation rows + the 2 new rows above so the matrix totals ≥52.

| v5 id | What it fixes | v6 disposition |
|---|---|---|
| F5 | Historical v2/v3 tables labeled NON-NORMATIVE (documentation only) | Superseded by NV3 (BEHAVIOR>SMOKE labeling discipline). v6-G owns the labeling enforcement. |
| F6 | Bash read-only allowlist rejects generic node commands for lock paths | Absorbed by V1 (READ_ONLY_PREFIX_RX allowlist) + R2 (PowerShell-aware Bash hard-deny). v6-E owns. |
| F7 | Fixture counts: 25 plan-body .md + 3 helpers = 28 files | Absorbed by NV4 (same item, count clarification). v6-B + v6-C own. |
| F8 | Bash matcher no-op unless `tool_name === "Bash"` (MCP Chrome tools skip) | NEW Layer 1 row — v6-E (`handleBashMode` must early-return when `tool_name !== 'Bash'`). |
| R1 | Reviewer methodology cross-checks every cited count | Non-actionable (methodology not code). v6-G Quality gates section per v5 plan line ~119. |

**Row count (reconciled)**: 46 primary + 2 reinstated (P7-RETRO, FQ-4.5) + 5 supplemental (F5/F6/F7/F8/R1) = **53 rows** ≥ v5's claimed 52. No silent drops.

### Layer 2: 23-defect coverage (this session's findings — none may be dropped)

| Defect id | Severity | Owning chunk |
|---|---|---|
| A1 (manifest missing) | CRITICAL | v6-D |
| A2 (wrapper fail-open) | CRITICAL | v6-F |
| A3 (execSync shell template) | MEDIUM | v6-E |
| A4 (pre-commit unwired) | CRITICAL | v6-F |
| A5 (Execution Summary wrong) | LOW | v6-G |
| A6 (safe.directory undoc) | LOW | v6-G |
| B1 (closure_meta over-exempts) | CRITICAL | v6-B |
| B2 (isExempt reads disk) | CRITICAL | v6-B |
| B3 (silent git errors) | HIGH | v6-D |
| B4 (recipient-token not enforced) | HIGH | v6-C |
| B5 (shorthand not parent-aware) | MEDIUM | v6-C |
| B6 (manifest validation weak) | HIGH | v6-D |
| B7 (fake-artifact launder) | HIGH | **v6-C + v6-D (SPLIT — both halves required; C handles C3-fallback, D handles layout)** |
| B8 (validate-overrides schema unused) | MEDIUM | v6-A |
| B9 (D23 smoke-only) | MEDIUM | **v6-E (handleEditMode/handleBashMode tests) + v6-G (verify-v6-*.sh BEHAVIOR section) — SPLIT** |
| B10 (write-manifest npm exposed) | MEDIUM | v6-F |
| C1 (--changed working-tree vs HEAD) | MEDIUM | v6-D |
| C2 (Status no-frontmatter fallback) | LOW | v6-B |
| C3 (attempts log race) | MEDIUM | v6-E |
| C4 (bodyAfterTarget indexOf -1) | LOW | v6-C |
| C5 (targetPath path-traversal) | LOW | v6-E |
| C6 (loadOverrides silent errors) | MEDIUM | v6-B (explicit: `loadOverrides()` must distinguish file-not-found vs JSON-parse-error vs git-error; only file-not-found returns empty; others process.exit(1) per B15) |
| C7 (schema integrity) | LOW | v6-A (paired with B8 — single fix covers both via schema-hash known-good) |

**Row count**: 23. All assigned. No orphans.

### Layer 3: Cross-chunk integration contracts (shared types — must NOT diverge across chunks)

| Contract | Canonical definition (chunk) | Consumers |
|---|---|---|
| `parseField(header, label)` byte-exact reuse from [plans-reindex.mjs:55-73](scripts/plans-reindex.mjs:55) | v6-A (hard-assigned 2026-05-18 — no "first author" ambiguity) | A, B, C, D, E |
| `gitExec(cmd, opts)` wrapper with B15 error patterns | v6-A | A, B, D |
| `sha256(content)` helper | v6-A | A, B, D, E |
| `configHash()` regex-set fingerprint | v6-B (with C1+C5 regex sets) | B, D (layout verifies match) |
| `selfHash()` validator self-hash | v6-B | B, D (layout asserts presence) |
| Manifest schema shape (plan_sha256 + validator_version + validator_config_sha256 + validator_self_hash + validator_invocation_id + artifacts[] + status + provisional + plan_basename + passed_at) | v6-D | D, G (dogfood) |
| `closure-overrides.json` schema (version + overrides[] + meta_plans[] with `additionalProperties: false`) | v6-A | A, B (isExempt + C1 override loading) |
| Fixture frontmatter format (`expected_verdict: PASS|FAIL`, optional `expected_checks: C1,C2,...`) | v6-B (hard-assigned — first chunk authoring fixtures) | B, C, D, E |
| Lock-path regex (`closure-overrides(?:\.schema)?\.json` / `closure-overrides-authors\.txt` / `closure-gate-landed-at\.txt` / `plans/_closure_manifests/.../*.manifest.json`) | v6-E | E (Edit + Bash matchers) |
| `READ_ONLY_PREFIX_RX` allowlist (cat / type / Get-Content / git show / git diff / git log / git status / ls / dir / Test-Path) | v6-E | E |
| `WRITE_OP_RX` detection (PowerShell + node-fs + sed -i + redirect operators) | v6-E | E |
| C1 forbidden token list (NOT-WALKED, PROBABLE-*-*, BLOCKED-BY-FIXME-DESIGN, "surface-exists: divergent", placeholder-pattern, "not captured", "not exercised") | v6-B | B (C1 check), A (schema's ALLOWED_TOKENS list mirrors) |
| C5 strict-line token regex (`zero\|every\|all\s+\d+\|all-\d+\|all\d+\|100%\|no exceptions\|exhaustive\|complete`) | v6-C | C |
| LR-NNN rule numbering: must be MAX(grep "LR-[0-9]+" .claude/rules/*.md docs/read_only_docs/LEARNED_RULES.md) + 1 — v5 claimed LR-055; v6 may reuse or claim next free | v6-G | G (rule file authoring) |
| Subplan frontmatter LR-048 minimum: `Parent`, `Status`, `Priority`, `Identity`, `Model`, `Thinking`, `closure_meta` | this parent's authoring | All 7 subplans |

### Layer 4: Anti-pattern blocklist (what v6 MUST NOT reintroduce)

v5 plan body explicitly rejected these. Any v6 chunk that reintroduces them = matrix violation. Each bullet has a paired grep query — v6-G dogfood MUST run each query and assert the expected match count before manifest write:

- `closure_circular_ok` field in override schema (NB2 explicitly forbids)
  - Verify: `grep -nE 'closure_circular_ok' .claude/closure-overrides*.json scripts/validate-*.mjs` → expect 0 matches.
- Literal-filename path exemption (M3 — must be regex-based or marker-based)
  - Verify: `grep -nE "RULE_EXEMPT_PATHS\s*=" scripts/validate-plan-closure.mjs` → expect regex array, not literal-filename array.
- Session-id-keyed closure-attempts (M2 — must be `<plan>-<date>.json`)
  - Verify: `grep -nE "session_id" .claude/hooks/lib/check-plan-closure.mjs scripts/validate-plan-closure.mjs` → expect 0 matches that key attempts log on session_id.
- Blanket `plans/pending/` skip in `verify-no-forbidden.mjs` (NB3 — must be closure-gate-aware)
  - Verify: `grep -nE "startsWith\('plans/pending/'\)\s*\)\s*continue" scripts/verify-no-forbidden.mjs` → expect 0 matches (must be gated by closure-gate awareness).
- Manifest writes in `validate-plan-layout --check` (NB1 — layout is READ-ONLY)
  - Verify: `grep -nE "writeFileSync.*manifest|writeManifestFile" scripts/validate-plan-layout.mjs` → expect 0 matches.
- Chat-handshake override for closure (v3 reviewer rejected — file-only authorization)
  - Verify: `grep -nE "OVERRIDE-REQUEST|override approved" scripts/validate-plan-closure.mjs .claude/hooks/lib/check-plan-closure.mjs` → expect 0 matches.
- Distinct override phrase for closure separate from LR-043 §A (v1 reviewer rejected via Q3 lock)
  - Verify: `grep -rnE "CLOSURE-OVERRIDE-REQUEST" .claude/ scripts/` → expect 0 matches.
- Self-grading by the same session that produced the deliverable (AUD-017 — non-falsifiable)
  - Verify: parent + each subplan's Execution Summary cites an EXTERNAL auditor verdict file (e.g., `C:\Users\RutvikKhorasiya\.claude\plans\*audit*.md`). Manual audit at v6-G.
- String-presence-only "ALL GREEN" stamps (NV3 — every `[OK]` must be behavior-asserted)
  - Verify: `grep -nE '^[^#]*\[OK\]|ALL GREEN' scripts/test-fixtures/plan-closure/verify-v6-*.sh` → every match line must be inside a `# BEHAVIOR` comment block, not `# SMOKE`.
- closure_meta over-exemption (B1 — exempts ONLY C1, never C2-C5)
  - Verify: `grep -nA5 "isExempt|EXEMPT" scripts/validate-plan-closure.mjs` → exemption code path must only skip C1 forbidden-token application, NOT short-circuit C2/C3/C4/C5.
- Disk-read of `closure-overrides.json` in `isExempt()` (B2 — must use HEAD/staged authority)
  - Verify: `grep -nE "readFileSync.*OVERRIDES_PATH|readFileSync.*closure-overrides" scripts/validate-plan-closure.mjs` → expect 0 matches in isExempt; only in loadOverrides which routes via mode-aware HEAD/staged-blob.
- Wrapper fail-open on any error path (A2 — wrapper is universally fail-CLOSED)
  - Verify: `grep -nE "\|\|\s*true|exit 0" .claude/hooks/plan-closure-gate.sh` → expect 0 matches of `|| true` and 0 `exit 0` lines on failure paths (only on validated-allow path).
- Shell-template `execSync` in hook lib (A3 — must be `execFileSync` with args array)
  - Verify: `grep -nE "execSync\(.+\$\{" .claude/hooks/lib/check-plan-closure.mjs` → expect 0 matches (shell-interpolated execSync banned).

## Inherited v5 design (full body)

The 795-line v5 plan body at [plans/done/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md](plans/done/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md) is the design seed for v6. v6 inherits the design verbatim; the chunking + Preservation Matrix above are layered on top.

### Decision: REVERT v5 implementation before v6-A begins (user-authorized 2026-05-18)

User chose **Option 1 (revert)** during v6 preservation audit (`C:\Users\RutvikKhorasiya\.claude\plans\v4-was-executed-we-fluffy-pond.md`). Rationale: 5 CRITICAL bypasses in shipped v5 code make in-place patching too risky; revert-then-rewrite gives PROMISE-PAIRED-TEST discipline a clean canvas.

#### Pre-v6-A revert checklist (user-executed, NOT v6-A author's job)

The 3 v5 commits to revert (newest → oldest):

1. `6063b04` — fix(closure-gate): handle EXEMPT status in hook + expand closure_meta slice + close plan
2. `32398e2` — feat(closure-gate): wire plan-closure-gate v5 — C1-C5 checks, LR-055, 28 fixtures (Commit-B)
3. `717bf72` — chore(closure-gate): seed bootstrap files (Commit-A — hooks NOT yet wired)

Files that will return to pre-v5 state after revert (or be removed):

- `scripts/validate-plan-closure.mjs` (DELETE — created in v5)
- `scripts/validate-plan-layout.mjs` (DELETE — created in v5)
- `scripts/validate-overrides.mjs` (DELETE — created in v5)
- `.claude/hooks/plan-closure-gate.sh` (DELETE — created in v5)
- `.claude/hooks/lib/check-plan-closure.mjs` (DELETE — created in v5)
- `.claude/closure-overrides.json` + `.schema.json` + `-authors.txt` + `closure-gate-landed-at.txt` (DELETE — created in v5)
- `.claude/rules/plan-closure.md` (DELETE — LR-055 v5 body; v6-G re-authors)
- `plans/_closure_manifests/.gitkeep` (DELETE — created in v5)
- `scripts/test-fixtures/plan-closure/` (DELETE entire dir — 28 fixtures created in v5)
- `.claude/settings.json` (REVERT — hooks wired + 9 allow entries added in v5)
- `package.json` (REVERT — 9 npm scripts added in v5)
- `scripts/verify-no-forbidden.mjs` (REVERT — NB3 modification in v5)
- `.claude/skills/final-q/SKILL.md` (REVERT — Step 4.5 added in v5)
- `.claude/skills/audit/SKILL.md` (REVERT — REVIEW 2.7 extension in v5)
- `.claude/skills/execute/SKILL.md` (REVERT — Phase 3.5 precondition in v5)

Mechanism: user-executed `git revert 6063b04 32398e2 717bf72` (or interactive cherry-pick the inverse), then push. This is a one-shot operation OUTSIDE the v6 chunk chain — v6-A starts on a clean canvas.

**v6-A author MUST verify**: `git log --oneline -10` shows none of the 3 v5 commits AND none of the v5 files exist on disk. If revert has not happened, v6-A HALTs and asks user to complete the revert first.

## Acceptance — v6 closes when ALL of these are TRUE

- [ ] Each of 7 subplans has `Status: DONE` + closure manifest written.
- [ ] Each chunk's external auditor pass returned GREEN before next chunk began.
- [ ] Every row in Preservation Matrix Layer 1 (46 v5 corrections) ticked by ≥1 chunk's Execution Summary.
- [ ] Every row in Preservation Matrix Layer 2 (23 defects) ticked by exactly 1 chunk's Execution Summary (B7 + B9 split rows ticked by both).
- [ ] Every contract in Preservation Matrix Layer 3 has a canonical-definition file path + consumer chunks all reference it.
- [ ] Every anti-pattern in Preservation Matrix Layer 4 absent from final implementation (grep-verifiable).
- [ ] v6-G dogfood ceremony wrote `plans/_closure_manifests/PLAN_CLOSURE_GATE_V6_PARENT.md.manifest.json` with valid schema (B6 fix applied).
- [ ] Parent plan moved to `plans/done/` after dogfood.
- [ ] LR-NNN rule body authored at `.claude/rules/plan-closure.md` with authorization-surface integrity section + best-effort attribution caveat + BEHAVIOR>SMOKE language.
- [ ] No string-presence "ALL GREEN" stamps remain in any verify-*.sh.
- [ ] Each subplan A–G PROMISE-PAIRED-TEST table has ≥N rows where N = scope-hint bullet count (per PROMISE-PAIRED-TEST TABLE ≥N strict line above). `/planning` Step 3 enforces; v6-G dogfood re-verifies.
- [ ] External AI auditor (fresh session, not v6-G author) returned written GREEN verdict on closed parent + 7 closed subplans + manifest validity + Preservation Matrix completeness (per EXTERNAL AUDITOR ON CLOSED PARENT strict line above). Verdict file path cited in v6-G Execution Summary.
- [ ] Each Layer 4 anti-pattern grep query was executed at v6-G dogfood with expected match count = 0 (or behavior-asserted comment block for the NV3 case). Greps cited in v6-G Execution Summary.
- [ ] v5 implementation reverted before v6-A began (per "Decision: REVERT" section above). v6-A's Execution Summary cites `git log --oneline -10` confirming none of `6063b04` / `32398e2` / `717bf72` present at v6-A start.

## Out of scope (v6 author may pull into scope if needed)

- GPG-signed commits for lock-path files (v5 V2 caveat acknowledged, not implemented).
- Cryptographic proof of manifest authenticity (v5 V7 caveat — invocation-id is local audit evidence only).
- Path-traversal hardening beyond v6-E's path-resolve+symlink-reject.
- DoS protection on validator inputs.
- C5 axis-matching strength refinement.
- Schema-hash known-good list mechanism IF v6-A author defers to a later chunk.

## References

- Audit evidence (session-plan, lives outside repo): `C:\Users\RutvikKhorasiya\.claude\plans\dazzling-noodling-yeti.md`
- v5 plan body: [plans/done/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md](plans/done/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md)
- Subplans: `plans/pending/SUBPLAN_CLOSURE_GATE_V6_A_*.md` through `SUBPLAN_CLOSURE_GATE_V6_G_*.md`
- LR-046 (strict plan lines): `.claude/rules/pipeline.md`
- LR-048 (subplan structural minimum): `.claude/rules/pipeline.md`
- LR-035 (INDEX.md auto-gen): `docs/read_only_docs/LEARNED_RULES.md`
