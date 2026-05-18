---
title: Plan-Closure Gate + Strict-Line Enforcement (v5 — post-final-review, red-flags removed)
target_file_at_execution: plans/pending/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md
Status: PENDING-DRAFT
Priority: high
Created: 2026-05-18
Identity: OWNER
Model: claude-opus-4-7
Thinking: max
PermissionMode: auto
RiskAcknowledged: false
BrowserTool: none
Justification: max — multi-rule judgment + 52 audit-corrected design defects + authorization-surface integrity as first-class concern
closure_meta: true
---

## Context

An external AI auditor declared that `plans/done/PLAN_FIX_CLI_HALLUCINATION_AND_SSL_A_BLOCKER.md` (closed 2026-05-18) prevented only its exact failure modes (manufactured-blocker prose + `playwright-cli` vs `npx playwright` hallucination) and left the broader loophole class intact. v1 was rejected with 10 blockers. v2 was rejected with 15 + 4. v3 was rejected with **10 V-items + 4 NB-items** by a third reviewer who proved each claim against repo state. I cross-verified each claim independently â€” every v3-defense argument was either insufficient or wrong. v4 fixed those 14; v5 fixes 8 additional final-review findings. Per Supreme Override Principle (`feedback_override_cannot_convert_missing_to_evidence.md`), no override exists for "I'm tired of revising" â€” the gate either holds or it doesn't.

**v5 incorporates 52 concrete audit items**: v1 10 + v2 15 blockers + v2 4 non-blockers + v2 self-audit 5 + reviewer R2-R5 4 + v3-reviewer 14 + v4 final-review 8 = 52. R1 is methodological-only and recorded in Quality gates.

Empirical evidence (verified 2026-05-18, re-verified for v5):
- [SP-A:113,116,131](plans/done/SUBPLAN_DQU_V6_PILOT_SSL_A.md:113) uses YAML evidence keys with placeholder values.
- [SP-A:267](plans/done/SUBPLAN_DQU_V6_PILOT_SSL_A.md:267) contains `BLOCKED-BY-FIXME-DESIGN`, `PROBABLE-FAIL-*`, `surface-exists: divergent`; plan is `Status: DONE`.
- [plans-reindex.mjs:65-72](scripts/plans-reindex.mjs:65) `parseField` handles BOTH `**Label**:` AND `Label:` forms via regex `(?:\\*\\*)?${label}(?:\\*\\*)?`. v4 reuses for Status, Parent, Depends on (B9).
- [.gitignore:125-141](.gitignore:125) â€” `.claude/state/*.json` ignored, but `.claude/closure-overrides.json` is NOT (lives at root of `.claude/`, tracked).
- [verify-no-forbidden.mjs:280](scripts/verify-no-forbidden.mjs:280) literal: `if (rel.startsWith('plans/pending/')) continue;` â€” staged pending plans currently exempt from forbidden-token scan; v4 overrides this skip in closure-gate flow (NB3 carried).
- Grep across `plans/done/`: â‰ˆ22 plans use `## Execution Summary`, â‰ˆ18 use `### Execution Summary`. C2 accepts both.
- [.claude/settings.json:31,44](.claude/settings.json:31) Edit matcher block at line 31, separate Bash matcher block at line 44 (`Bash|mcp__Claude_in_Chrome__.*`). v4 wires closure-gate into BOTH with PowerShell-aware regex (B1).
- Project shell is **PowerShell** (Windows env per system prompt). Claude settings currently invoke `bash` hook wrappers, so the Bash-mode hook must defend against commands containing both POSIX-style and PowerShell-style writers (B1).

## Supreme Override Principle (load-bearing â€” applies to all phases)

**An override cannot convert missing evidence into evidence.** (`feedback_override_cannot_convert_missing_to_evidence.md`)

The override surface authorizes honest *classification* of evidence already gathered (e.g., `BLOCKED-BY-FIXME-DESIGN` reflecting real Playwright `test.fixme(true,...)` semantics). It does NOT authorize:
- Citing artifact paths that don't exist (C3).
- "Deferred to SP-D" without a grep-matching item in SP-D (C4).
- Circular Aâ†”B both-DONE mutual exoneration (C4).
- Rescoping strict lines via APPEND/SPAWN/DO-NOW (C5).
- Empty Execution Summary (C2).

**Only C1 (forbidden incompleteness tokens used as honest classification) is overridable.** C2/C3/C4/C5 are NOT OVERRIDABLE.

**Override mechanism is file-only.** Per Q3 lock: the user, not the executing agent, edits `.claude/closure-overrides.json` (tracked) directly and commits, then the agent re-attempts the Status flip. No chat handshake; no `[CLOSURE-OVERRIDE-REQUEST]` token; agent writes to override file are denied across BOTH Edit/Write AND Bash matchers (R2).

## v3 -> v4 Corrections (NON-NORMATIVE AUDIT TRAIL — superseded by v5 where F-items disagree)

### v3 Blockers (10 â€” all verified mismatches against v3 plan body)

| # | v3 defect | v4 fix |
|---|---|---|
| V1 | Bash lock regex bash-only — misses PowerShell writers and `node -e` file writes. | Bash-mode hook hard-denies any command mentioning lock paths unless it starts with a fixed read-only inspection command (`cat`, `type`, `Get-Content`, `git show`, `git cat-file`, `git diff`, `git log`, `git status`, `ls`, `dir`, `Test-Path`) and contains no redirect or pipe. Generic `node ...` is not allowlisted for lock paths. |
| V2 | Author whitelist (`.claude/closure-overrides-authors.txt`) forgeable â€” `git config user.email` is local-mutable; not cryptographic authority. | Downgrade language throughout: "best-effort attribution, not cryptographic proof". Hard authority requires GPG-signed commits â€” added as OPTIONAL hardening in Â§Authorization Surface Integrity. The text-file whitelist is a deterrent + audit trail, not a gate. Plan acknowledges this limit explicitly so future agents don't over-trust it. |
| V3 | Pre-commit validator uses `git show HEAD:` (previous commit content), not `git show :path` (staged blob). Pre-commit must see what's about to land. | `scripts/validate-overrides.mjs` pre-commit mode uses `git show :.claude/closure-overrides.json` (staged blob). Hook PreToolUse continues to use projected post-edit body (already correct). PostToolUse / pre-push verification adds `git show :path` as the canonical source. HEAD-only check is retained for retro audits of already-committed content. |
| V4 | Bootstrap chicken-and-egg: validator loads overrides from HEAD, but this plan's first commit creates the override file. HEAD has no entry, so plan body can't be authorized at first landing. | Phase 0 adds explicit **2-commit bootstrap**: (a) Commit 1 â€” seed `.claude/closure-overrides.json` (with this plan's basename in `meta_plans[]`), `.schema.json`, `closure-overrides-authors.txt`, `closure-gate-landed-at.txt`. Hook is NOT yet wired. (b) Commit 2 â€” wire hook in `.claude/settings.json`, land validator, land rule file. Subsequent plan-body landing references HEAD that already contains its own authorization. No bootstrap_mode flag needed; the discipline is "seed before wire". |
| V5 | Fail-OPEN allows the bypass it tries to prevent: one fail-OPEN on a plan-path is sufficient to flip Status. v3 R4 allowed 3 before escalation. | Path-classification-aware fail-policy: (a) Path classification runs BEFORE the validator call. (b) If target is a plan-path (`plans/**/*.md`) or lock-path â†’ **fail-CLOSED** on any error. No grace allowed. (c) Fail-OPEN only on unrelated paths (which the gate doesn't care about). (d) Counter retained for diagnostic visibility only, no longer a "grace budget". |
| V6 | `--enforce` writes manifest on PASS, but final-q + pipeline:validate + audit-skill invoke `--enforce`. Each call would write a manifest. | Split flags: `--enforce` is **READ-ONLY validation** (used by final-q, pipeline, audit, retro). Manifest writes require explicit `--write-manifest` flag, used ONLY by closure ceremony in /execute Phase 3.5 right before `git mv` to done/. Pipeline + final-q never write manifests. |
| V7 | Manifest authority forgeable: agent can compute hashes and hand-write a manifest. plan_sha256 alone is detection-of-staleness, not proof-of-validation. | Acknowledged: manifest is **audit evidence, not hard proof**. Plan explicitly says so. Added: `validator_invocation_id` field (timestamp + random-128 + plan_sha256) recorded in BOTH manifest AND `.claude/state/closure-attempts/<plan>-<date>.json` log. The invocation id is cross-checked when the local closure-attempts log exists. Because `.claude/state/` is runtime-local and ignored, missing invocation logs are a YELLOW warning, not a layout FAIL. Hard cryptographic proof is deferred to optional GPG-signing hardening. |
| V8 | D23 command not runnable: inline comments after `&& \` break bash continuation (`\` escapes space, not newline). | D23 is now a runnable script at `scripts/test-fixtures/plan-closure/verify-v5-landing.sh`. Plan body contains the COMMANDS but no inline comments inside the chain; comments are on separate lines above each check. Final verdict line `echo "ALL GREEN â€” plan-closure-gate v5 landed"` runs only if all preceding `&&` checks pass. |
| V9 | C4 Parent parsing only handles `**Parent**:` markdown-bold; YAML `Parent:` form is supported elsewhere (plans-reindex `parseField`). | C4 step 2 reuses `parseField(header, 'Parent') \|\| parseField(header, 'Parent audit') \|\| parseField(header, 'Parent plan')` â€” byte-exact match to [plans-reindex.mjs:273](scripts/plans-reindex.mjs:273). Both forms accepted. C5 lock detection on Status uses same parseField. |
| V10 | `closure-gate-landed-at.txt` grandfathering uses plan CREATION timestamp â€” old plan edited after landing still grandfathered. | Layout uses LAST-CHANGE timestamp: `git log -1 --format=%at <plan>` (last commit touch). If last-commit timestamp is AFTER landed-at AND no manifest â†’ FAIL (not grandfathered). Pre-landing plans that have been re-edited post-landing must produce a manifest. Original creation timestamp ignored. |

### v3 Non-blockers (4 â€” all verified)

| # | v3 defect | v4 fix |
|---|---|---|
| NV1 | LOCK_PATH_RX in Bash hook only matches forward slash â€” PowerShell paths use backslash. | `LOCK_PATH_RX = /\.claude[\/\\]closure-overrides(?:\.schema)?\.json|\.claude[\/\\]closure-overrides-authors\.txt|\.claude[\/\\]closure-gate-landed-at\.txt/`. Both separators accepted. Same fix applied to C3 cited-path regex (already had `[\/\\]` per v3 B10 â€” confirmed). |
| NV2 | `validate-plan-layout --check` removes `.tmp` manifests >24h old â€” but --check is supposed to be READ-ONLY. | Cleanup moved to separate `--cleanup-tmp-manifests` mode, user-invoked. `--check` strictly read-only. Stale `.tmp` files report as YELLOW warning, never auto-removed. |
| NV3 | grep-based D23 checks prove strings exist, not behavior. | D23 verification script clearly labels each line: `# SMOKE` (grep-only) or `# BEHAVIOR` (runs self-test). Authoritative checks are the `--self-test` invocations; greps are surface-confirming smoke. Final verdict requires all BEHAVIOR checks pass, smoke greps documented but not load-bearing. |
| NV4 | Phase 8 fixture count drifted repeatedly. | Superseded by v5 F7: 25 plan-body `.md` fixtures + 3 helper files = 28 total fixture files. |

## v2 -> v3 Corrections (NON-NORMATIVE AUDIT TRAIL — retained only to show provenance)

### Auditor blockers (15 â€” all verified mismatches against v2 plan body)

| # | v2 defect | v3 fix |
|---|---|---|
| B1 | Override lock denied AFTER plan-path filter â†’ `.claude/closure-overrides.json` writes bypass (file not under `plans/`) | Hook order: (1) Read input â†’ (2) **Lock-paths check FIRST** â†’ (3) plan-path filter â†’ (4) projection â†’ (5) validator. Lock-paths DENY runs before any path filter. |
| B2 | C1 path-exemption included "fixtures" generically â†’ bad fixtures wouldn't trip the scanner | Exempt only fixture HELPER files (`scripts/test-fixtures/plan-closure/_*` underscore-prefix + non-`.md` files). Fixture plan bodies (`.md` in fixtures dir) are NOT exempt â€” they must FAIL. |
| B3 | C1/C3 dropped inline-backtick matches â†’ `` `BLOCKED-BY-FIXME-DESIGN` `` bypass | For plan files (`plans/{pending,done}/*.md`): drop fenced-code (```/~~~), blockquotes (`> `), `e.g.`/`example` lines, section headers (`^#{1,6}\s`) â€” **but NOT inline backticks**. Inline-code matches ARE scanned. (Rule-definition files in path-exempt set are exempt entirely.) |
| B4 | C1 dropped `surface-exists: divergent` if nearby `override:` / `user-approved:` â†’ plan body self-authorizes | Filter removed entirely. Only `.claude/closure-overrides.json` may override C1. |
| B5 | `pipeline:validate` wired to `plans:validate-layout` would break on existing manifest-less plans | Split: `validate-plan-layout --check` (READ-ONLY, used by `pipeline:validate`) tolerates pre-existing manifest-less plans created BEFORE the `.claude/closure-gate-landed-at.txt` timestamp; `--enforce-all` (manual) fails on any. Pre-gate-land plans get a YELLOW warning, not a failure. |
| B6 | Manifest lacked `plan_sha256` â†’ pass once, edit body, manifest still valid | Manifest schema adds `plan_sha256` (SHA-256 of plan body at PASS time) + `validator_version` + `validator_config_sha256` + `validator_self_hash`. Layout verifies current plan body SHA matches manifest. |
| B7 | Layout treated any manifest as authoritative â†’ forgeable | Layout MUST validate schema (`additionalProperties: false`), verify `plan_sha256` matches current body, and re-verify artifact SHA-256 for files that still exist. Malformed/mismatched â†’ FAIL. |
| B8 | C2 required `### Execution Summary` â†’ â‰ˆ22 of â‰ˆ40 sampled plans use `##` form | C2 accepts heading levels `##` through `####`; parses section until next heading of same-or-higher level. |
| B9 | C2 "cited artifact path" excluded code-refactor plans citing `.ts`/`.mjs`/`.md` | C2 uses a broader "cited file path" regex (extension set includes `.ts\|.tsx\|.js\|.mjs\|.cjs\|.sh\|.bash\|.md\|.json\|.yml\|.yaml\|.html\|.css\|.go\|.rs\|.py` + the artifact set). Distinct from C3's narrower artifact-path regex. |
| B10 | C3 dropped all absolute paths unverified | C3 absolute-path handling: try `path.relative(REPO_ROOT, absPath)`. Result starts with `..` â†’ external (drop, report as `external-path` warning). Else â†’ normalize to repo-relative, verify existence. |
| B11 | C3 extension set missed `.log\|.txt\|.har\|.xml\|.md\|.csv` (SP-A cites `.md` and console logs) | C3 extension set extended: `png\|jpg\|jpeg\|mp4\|webm\|zip\|json\|trace\|yml\|yaml\|html\|svg\|gif\|pdf\|log\|txt\|har\|xml\|md\|csv\|diff\|patch`. |
| B12 | C4 "SP-D" resolved non-deterministically | Three-tier resolution: (1) full filename (`SUBPLAN_X.md` / `PLAN_X.md`) â†’ direct lookup. (2) Shorthand (`SP-D`) â†’ parent-aware sibling: parse current plan's `**Parent**:` field, look for siblings matching `SUBPLAN_*_<letter>.md` or `*_PILOT_*_<letter>.md` under same parent dir. (3) Ambiguous â†’ FAIL with "use full filename". |
| B13 | C4 topic-token heuristic ("last 5â€“10 words") matched filler ("per scope") | Required structured handoff form (recommended now, enforced after 30-day migration window): `handoff-target: <full-filename>`, `handoff-topic: <one-line>`, `recipient-required-token: <unique-id>`. Recipient MUST grep-contain the verbatim token. Prose handoff falls back to last-5-words heuristic with WARNING flag during migration; FAIL after window. |
| B14 | C5 regex `all-?\d+` missed `all 11` (SP-A:269 form) | Use `\b(zero\|every\|all\s+\d+\|all-\d+\|all\d+\|100%\|no exceptions\|exhaustive\|complete)\b`. |
| B15 | Plan relied on `git show HEAD:`, `git diff`, `git show :path` with no error handling â€” reviewer attests `fatal: detected dubious ownership` fires in this environment | Every git invocation wrapped in error handler; any non-zero exit OR known error pattern (`dubious ownership`, `bad object`, `not a git repository`) â†’ validator exits 1 with diagnostic + remediation (`git config --global --add safe.directory <abs-path>`). Treated as validator failure, never silent pass. |

### Auditor non-blockers (4 â€” all verified)

| # | v2 defect | v3 fix |
|---|---|---|
| NB1 | `validate-plan-layout` wrote manifests during pipeline:validate | `--check` mode is READ-ONLY. Manifest writes happen ONLY in `validate-plan-closure --plan --enforce` PASS path. Pipeline uses `--check`. |
| NB2 | Override schema permitted unknown keys â†’ `closure_circular_ok` could sneak in | Schema declares `"additionalProperties": false` at root + every object. Validator rejects unknown keys at load time. |
| NB3 | [verify-no-forbidden.mjs:280](scripts/verify-no-forbidden.mjs:280) `if (rel.startsWith('plans/pending/')) continue;` exempts staged pending plans | Phase 4 modifies `verify-no-forbidden.mjs`: replace the blanket pending-skip with a closure-gate-aware exception. For staged plans with `Status: DONE` (either form) â†’ run validator. For staged pending plans WITHOUT DONE â†’ keep current skip (plan authors legitimately reference markers). |
| NB4 | Phase 7 expected-output overclaimed "SP-A appears under C1 with OVERRIDABLE label" | Updated wording: "SP-A surfaces under C1 (OVERRIDABLE â€” `BLOCKED-BY-FIXME-DESIGN`, `surface-exists: divergent`, etc.) AND C5 (NOT OVERRIDABLE â€” strict line `CLOSURE-4 has one row per 6 fixme'd TCs + evidence per class` vs deviation #1 `isolated-grep gate produces clean PASS/FAIL` axis-match). User remediates C5 by reopening or rewriting; only C1 path is overridable." |

### My audit misses (5 â€” all verified)

| # | Miss | v3 fix |
|---|---|---|
| M1 | No validator-version migration story when regex set bumps | Manifest carries `validator_version` + `validator_config_sha256` + `validator_self_hash`. Layout `--check` tolerates patch-version drift. Minor/major bump â†’ re-validation required. Migration tool: `npm run plans:validate-closure:revalidate-all` rewrites manifests under new validator. User-invoked, not auto. |
| M2 | Closure-attempts state keyed on `session_id` â†’ /final-q in different session can't find | Replace with `.claude/state/closure-attempts/<plan-basename>-<YYYY-MM-DD>.json`. /final-q reads all files dated within last 6 hours matching active plans. |
| M3 | Path-exemption by literal filename brittle (rename â†’ exemption breaks) | Exempt via frontmatter `closure_meta: true` MARKER. **Anti-forge** (R3): marker is only honored if the plan's basename is ALSO listed in `.claude/closure-overrides.json` under a `meta_plans: []` array. Double-keyed authorization (marker + user-file). |
| M4 | Manifest written at PASS but not git-staged atomically â†’ orphan manifest if commit fails | Validator writes `plans/_closure_manifests/<plan>.manifest.json.tmp` (with `provisional: true` field) first. PASS â†’ rename `.tmp` â†’ `.json`. Layout `--check` ignores `.tmp` files entirely. Superseded by v4/v5: cleanup moved to explicit `--cleanup-tmp-manifests`; layout `--check` is read-only. Status-flip Edit and final manifest write happen in the same commit (user-side discipline; validator can't guarantee commit-time atomicity beyond what git allows). |
| M5 | LR-055 asserted without grepping latest LR-NNN | Execution-phase 0 (mandatory before authoring `.claude/rules/plan-closure.md`): `grep -hoE "LR-([0-9]+)" .claude/rules/*.md docs/read_only_docs/LEARNED_RULES.md \| sort -u`. Take MAX. If â‰¥ 55, use MAX+1. Document the actual number in plan body + rule file before commit. |

### Reviewer / second-audit additions (NON-NORMATIVE AUDIT TRAIL — superseded by v5 normative sections)

| # | Concern | v3 fix |
|---|---|---|
| R1 | Reviewer methodology thin (only B15 upgrade, no independent count re-verify) | Recorded in Quality gates Â§; no plan-body change. v3 closure-ceremony cross-checks every count cited in this plan against artifacts independently. |
| R2 | Override-file lock at Edit/Write matcher does not cover Bash writes (`echo ... > .claude/closure-overrides.json && git add && git commit`) | Closure-gate hook ALSO registers under Bash PreToolUse matcher. Bash hook scans `command` for redirect/write-operator patterns to lock-paths: `/(>\s*\|>>\s*\|tee\s+\|sed\s.*-i\b\|mv\s+\|cp\s+\|cat\s+>)/` + `/.claude\/closure-overrides(?:\.schema)?\.json/`. Match â†’ DENY. Belt-and-suspenders: `scripts/validate-overrides.mjs` (pre-commit) verifies HEAD content matches a user-author-only signing rule (commit author must be in an authorized identity list at `.claude/closure-overrides-authors.txt`, tracked). |
| R3 | Marker-based exemption (M3) attackable â€” agent adds marker to own bad plan | Marker is opt-in; authorization is in `meta_plans: []` array in `.claude/closure-overrides.json` (user-edited only). Marker without listing â†’ NOT exempt. Listing without marker â†’ NOT exempt. Both required. |
| R4 | Fail-OPEN policy itself forgeable (craft exception -> bypass). | Superseded by v5/V5: fail-CLOSED immediately for plan paths and lock paths; fail-OPEN only for unrelated paths after path classification. |
| R5 | "Forgeable AUTHORIZATION surface" class missed alongside forgeable artifact authority | New Â§"Authorization Surface Integrity" below enumerates every authorization surface + attack vector + gate. First-class concern, not implementation detail. |

## Authorization Surface Integrity (NEW â€” R5)

Every gate has surfaces that authorize bypass. If any surface is forgeable, the gate is forgeable. This v5 section is normative; earlier v2/v3/v4 tables are audit history only.

| Surface | What it authorizes | Attack vector | v5 defense |
|---|---|---|---|
| `.claude/closure-overrides.json` (tracked) | C1 token-class exceptions per plan; `meta_plans[]` for marker exemption | Agent writes or self-seeds authorization | User/manual seed required for bootstrap; Edit/Write lock; Bash hard-deny on lock-path mention except narrow read-only inspection; schema lint; staged-blob validation; author whitelist is best-effort attribution only, not proof. |
| `.claude/closure-overrides.schema.json` (tracked) | Schema shape itself | Bash write to widen schema | Bash matcher lock; pre-commit verify schema-hash matches a known-good list |
| Path-exemption set (in validator) | Files where C1 doesn't fire | Literal filename brittleness (M3); compile-time list | Frontmatter marker (`closure_meta: true`) + `meta_plans[]` listing (R3); regex-based path patterns also stable across rename |
| Manifest sidecar (`plans/_closure_manifests/*.json`) | Audit evidence that a validator run produced a closure stamp | Hand-write fake manifest; stale after body edit; orphan after failed commit | Schema validation, current `plan_sha256`, validator version/config/self hashes, artifact hashes when present. Invocation-id log is local corroboration only: missing log is YELLOW, not layout FAIL. Manifest is not cryptographic proof. |
| LR-043 Â§A handshake (existing) | One-shot edit override for identity gate | Phrase reuse for closure | Distinct phrases were attempted in v1 (rejected by Q3 lock); v3 chat-handshake DOES NOT EXIST for closure â†’ no surface to forge |
| Fail policy | Hook behavior on validator/runtime error | Craft input -> exception -> write through | Fail-CLOSED for plan paths and lock paths immediately; fail-OPEN only for unrelated paths after path classification. Any in-scope fail-closed event is RED in final-q. |
| `meta_plans[]` listing in override file | Marker honor (M3) | Adding self to listing | Same as overrides file: user-author commit, no Bash bypass, schema-validated |

## Plan agent show-stopper guards (carried, where still applicable)

| # | Gap | Status in v3 |
|---|---|---|
| A1 | C1 over-fires on rule files + this plan | Marker exemption is allowed only when `closure_meta: true` is paired with a user/manual `meta_plans[]` seed already present in HEAD. The executing agent must not self-add its own basename. |
| A2 | Circular handoff | C4 step 4 + Supreme Override Principle: NOT OVERRIDABLE. No `closure_circular_ok` field (NB2 enforces). |
| A3 | Retro scan breaks when artifact cleaned | Tracked manifest with artifact SHA-256 (B6, B7). |
| A4 | Multi-edit Status flip | Hook projection: read disk body, apply oldâ†’new, validate simulated body. |
| A5 | Single Write replaces whole file | Projection covers all tool types. |
| A6 | LR-043 Â§A handshake collision | N/A (no chat handshake in v3). |
| A7 | Override file location | `.claude/closure-overrides.json` (tracked under `.claude/` NOT `state/`); Bash + Edit lock (R2). |
| B5 | Forgeable `Executed: YYYY-MM-DD` | C2 requires Execution Summary â‰¥ 10 content lines + â‰¥1 cited file path (broadened per B9). |


## v4 Final-Review Patch (8 items — v5 normative corrections; load-bearing)

| # | v4 defect | v5 fix |
|---|---|---|
| F1 | Count math said 42, but listed 52 items. | Count corrected to 52 and closure strict line updated. If later de-duplicated, a de-dupe table is required. |
| F2 | Bootstrap still allowed agent self-authorization by creating `meta_plans[]`. | Commit-A is explicitly USER/MANUAL seed. The executing plan agent may not add its own basename to `meta_plans[]`. |
| F3 | The plan cited its future manifest before the manifest exists, creating a C3 stalemate. | Future manifest path is described as computed output, not required pre-existing evidence. D23 checks manifest only after `--write-manifest`. |
| F4 | `validator_invocation_id` depended on ignored `.claude/state/` logs. | Invocation log cross-check is local audit evidence. Missing logs are YELLOW, not layout FAIL. Plan hash + manifest schema remain durable checks. |
| F5 | Historical v2/v3 tables contained stale implementation details. | Historical sections are labeled NON-NORMATIVE; only v5 sections are normative. |
| F6 | Bash read-only allowlist accepted generic Node command shapes. | Generic Node commands are not allowlisted for lock paths. Only fixed read commands are allowed. |
| F7 | Fixture counts conflicted. | Count fixed to 25 plan-body `.md` fixtures + 3 helpers = 28 files. |
| F8 | Bash matcher also covers MCP Chrome tools. | Bash-mode hook must no-op unless `tool_name === "Bash"`. |
## Deliverables

### Phase 0 â€” Pre-execution preconditions (NEW, all checked BEFORE Phase 1)

1. **LR-055 collision check (M5)**: `grep -hoE "LR-[0-9]+" .claude/rules/*.md docs/read_only_docs/LEARNED_RULES.md | sort -u | tail -5`. Take MAX. If â‰¥ 55, this plan's new rule number = MAX+1 (call it LR-N hereafter). All Phase 9 references update.
2. **Git safety check (B15)**: `git status` exits 0. If "dubious ownership" or other error â†’ HALT, ask user to run `git config --global --add safe.directory "$(pwd)"`.
3. **V4 BOOTSTRAP â€” 2-commit landing sequence (V4 fix)**: solves chicken-and-egg where this plan needs `meta_plans[]` entry in HEAD but HEAD has no override file.
   - **Commit-A "USER-SEED"** (hook NOT yet wired; must be created by the user or by a separately authorized manual bootstrap, not by the executing plan agent):
     - User/manual step creates `.claude/closure-overrides.json` with `{"version":1,"overrides":[],"meta_plans":["PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md"]}`.
     - Create `.claude/closure-overrides.schema.json` (full schema, `additionalProperties:false`).
     - Create `.claude/closure-overrides-authors.txt` with the authorized user's git email (V2 caveat: best-effort attribution only).
     - Create `.claude/closure-gate-landed-at.txt` with current ISO timestamp.
     - Commit msg: `chore(closure-gate): seed override scaffolding (commit-A of 2 â€” hook not yet active)`.
   - **Commit-B "WIRE"** (hook activates):
     - Wire `plan-closure-gate.sh --edit-mode` and `--bash-mode` in `.claude/settings.json`.
     - Land `scripts/validate-plan-closure.mjs`, `scripts/validate-overrides.mjs`, `scripts/validate-plan-layout.mjs`.
     - Land `.claude/hooks/lib/check-plan-closure.mjs` + `.claude/hooks/plan-closure-gate.sh`.
     - Land `.claude/rules/plan-closure.md` (rule body).
     - Land the plan body at `plans/pending/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md`.
     - Commit msg: `feat(closure-gate): wire enforcement (commit-B of 2 â€” hook now active per LR-N)`.
   - After Commit-B: subsequent attempts to flip this plan's Status to DONE â†’ validator reads HEAD which already contains `meta_plans[]` listing â†’ C1 exemption granted, validator proceeds to C2â€“C5 against real plan body.

### Phase 1 â€” Validator `scripts/validate-plan-closure.mjs` (NEW)

Modes (V6 fix â€” `--enforce` is now READ-ONLY; manifest writes need explicit flag):
- `--plan <path> --enforce` â€” single, exit non-zero on FAIL. **READ-ONLY** â€” no manifest write. Used by /final-q, pipeline:validate, /audit, retro scans.
- `--plan <path> --enforce --write-manifest` â€” single + manifest emission. **CLOSURE-CEREMONY ONLY** â€” invoked by /execute Phase 3.5 immediately before `git mv` to done/.
- `--plan <path> --report-only` â€” single, always exit 0, emit findings. Read-only.
- `--changed --enforce` â€” validate plans changed in current commit set; exit non-zero on FAIL. Read-only.
- `--all --report-only` â€” batch retro; always exit 0. Read-only.
- `--staged --enforce` â€” pre-commit blob mode (Phase 4). Reads `git show :<path>` for each staged plan. Read-only.
- `--content-from-stdin --plan <path>` â€” hook mode. Read-only.
- `--json` â€” structured findings to stdout (any mode).
- `--self-test` â€” synthetic fixtures (Phase 8).
- `--all --enforce --rewrite-manifests` â€” manual migration tool (Phase 11). User-invoked only; --write-manifest implicit.

**Status: DONE detection (V9 fix â€” reuse parseField)** â€” match via `parseField(header, 'Status') === 'DONE'`, byte-exact reuse of [plans-reindex.mjs:65-72](scripts/plans-reindex.mjs:65) which handles BOTH `**Status**: DONE` (markdown bold) and `Status: DONE` (YAML frontmatter) via `(?:\\*\\*)?${label}(?:\\*\\*)?`. Same pattern applied to all other field reads (Parent, Executed, Depends on).

Five checks:

**C1 â€” Forbidden incompleteness tokens (OVERRIDABLE per file only):**

```js
const CLOSURE_FORBIDDEN_C1 = [
  /(?<![A-Za-z])NOT-WALKED(?![A-Za-z])/,
  /(?<![A-Za-z])NOT WALKED(?![A-Za-z])/i,
  /(?<![A-Za-z])PROBABLE-(?:FAIL|PASS|SKIP)-(?:APP|FRAMEWORK|TEST)(?![A-Za-z])/,
  /(?<![A-Za-z])BLOCKED-BY-FIXME-DESIGN(?![A-Za-z])/,
  /\bsurface-exists\s*:\s*divergent\b/i,
  // YAML-evidence-value form (SP-A pattern at line 113, 116, 131)
  /^\s*(?:dom-snippet|dom-screenshot-path|observed-live|network-capture-row|repro-steps|why-gap|proposed-TC-title|proposed-TC-assertion|evidence|verbatim)\s*:\s*"?\(?(?:not captured|n\/a|N\/A|NOT[\s-]?WALKED|not exercised|not walked|partial|deferred|TBD|TODO|placeholder)\)?"?\s*$/im,
  // Bullet / pipe-table form
  /(?:^|\n)\s*[-*|]\s.{0,120}\bnot captured\b(?![A-Za-z-])/i,
  /(?:^|\n)\s*[-*|]\s.{0,120}\bnot exercised\b(?![A-Za-z-])/i,
];
```

**Per-line filters for plan files** (B3 fix â€” inline backticks NO LONGER drop matches):
1. Fenced code block (```` ``` ```` / `~~~`) â†’ drop (block-level only).
2. Blockquote (`> `) â†’ drop.
3. Section header (`^#{1,6}\s`) â†’ drop (defining the token).
4. `e.g.` / `example` / `for example` in same line â†’ drop.
5. **B4 fix**: NO filter on `override:` / `user-approved:`. Only the override file authorizes.
6. **B3 fix**: inline backticks (`` `â€¦` ``) DO NOT cause drop. Plan authors who quote a forbidden token via inline code DO have it scanned.

**Path-exemption set (MARKER-based per M3 + R3)**:
- Frontmatter `closure_meta: true` AND basename âˆˆ `.claude/closure-overrides.json` `meta_plans: []` â†’ exempt.
- Default rule-pack/spec/skill files (regex on dir, not literal name): `.claude/rules/plan-closure.md`, `.claude/skills/audit/SKILL.md`, `clients/*/specs_planning/_internal/agent-mistakes.md`.
- **B2 fix**: fixtures dir exempted only for helper files (`scripts/test-fixtures/plan-closure/_*` underscore-prefix + non-`.md`). Fixture plan bodies are NOT exempt.

**Override lookup** (per file, never chat-handshake): source depends on caller (V3 fix):
- Hook mode (`--content-from-stdin`): load via `git show HEAD:.claude/closure-overrides.json` (HEAD is canonical authorization).
- Pre-commit mode (`--staged`): load via `git show :.claude/closure-overrides.json` (STAGED blob â€” the version about to land).
- Retro mode (`--all`/`--report-only`): load via `git show HEAD:` (read-only audit).
Match `{plan: <basename>, tokens: [<matched>], path_match: "exact", expires_at > now}` â†’ drop. No match â†’ FAIL.

**C2 â€” LR-027 skeleton (NOT OVERRIDABLE)** (B8 + B9 fixes):
- Both `**Executed**:` and YAML `Executed:` accepted.
- Heading: `## Execution Summary` OR `### Execution Summary` OR `#### Execution Summary`. Parse body until next heading of same-or-higher level.
- Body â‰¥ 10 non-whitespace content lines.
- â‰¥ 1 cited file path inside the section. Path uses the broader C2-regex (extension set includes `.ts\|.tsx\|.js\|.mjs\|.cjs\|.sh\|.bash\|.md\|.json\|.yml\|.yaml\|.html\|.css\|.go\|.rs\|.py` AND the C3 artifact extensions).

**C3 â€” Cited artifact paths exist (NOT OVERRIDABLE)** (B10 + B11 fixes):

```js
const CITED_PATH_RX_PLAIN = /(?<![A-Za-z0-9_])((?:\.[a-zA-Z]|[a-zA-Z0-9_-])(?:[a-zA-Z0-9_.-]|[\/\\])+\.(?:png|jpg|jpeg|mp4|webm|zip|json|trace|yml|yaml|html|svg|gif|pdf|log|txt|har|xml|md|csv|diff|patch))(?![A-Za-z0-9_])/g;
const CITED_PATH_RX_MD = /\[[^\]]*\]\(([^)]+\.(?:png|jpg|jpeg|mp4|webm|zip|json|trace|yml|yaml|html|svg|gif|pdf|log|txt|har|xml|md|csv|diff|patch))\)/g;
```

Post-filter:
1. **B10 fix**: For absolute paths (`/^([A-Z]:[\\\/]|\/)/`): compute `path.relative(REPO_ROOT, absPath)`. If result starts with `..` â†’ external, emit warning AND drop. Else â†’ normalize to repo-relative, proceed.
2. URL prefix (`^https?://`) â†’ drop.
3. Bare filename (no `/`) â†’ drop.
4. Under `node_modules/`, `dist/`, `build/`, `coverage/` â†’ drop.
5. Inside fenced code block â†’ drop. **(Inline backticks NOT dropped â€” B3 carry-through.)**
6. Line contains `e.g.` / `hypothetical` / `would be` / `<placeholder>` / `<TBD>` â†’ drop.
7. Path contains `<` / `>` / `{` / `}` â†’ drop (template).
8. Ancestor heading `## Example` / `## Templates` / `## Hypothetical` â†’ drop.
9. Line starts with `> ` â†’ drop.

Existence check: `fs.existsSync(path.join(REPO_ROOT, normalized))`. Missing â†’ consult tracked manifest `plans/_closure_manifests/<plan>.manifest.json` for matching path + SHA-256. Match â†’ accept. No manifest match â†’ FAIL.

**C4 â€” Phantom + circular handoff (NOT OVERRIDABLE)** (B12 + B13 fixes):

Resolve handoff targets via THREE-TIER (B12 + V9 fix):
1. Full filename in body (`SUBPLAN_X.md`/`PLAN_X.md`) â†’ direct lookup.
2. Shorthand (`SP-D` / `SP-X`) â†’ parent-aware sibling: parse current plan's Parent field via `parseField(header, 'Parent') || parseField(header, 'Parent audit') || parseField(header, 'Parent plan')` â€” byte-exact reuse of [plans-reindex.mjs:273](scripts/plans-reindex.mjs:273), supports both `**Parent**:` and YAML `Parent:` forms. Look for siblings matching `*_<letter>.md` under same parent dir. Multiple matches â†’ ambiguous â†’ FAIL with "use full filename".
3. Neither resolves uniquely â†’ FAIL.

**Structured handoff (B13)** â€” recommended now, required after 2026-06-18 (30 days):
```
handoff-target: SUBPLAN_DQU_V6_PILOT_SSL_D.md
handoff-topic: TC-020 unfixme cycle for SI delete-flow
recipient-required-token: TC-020-UNFIXME-SI-DELETE
```
Recipient file MUST grep-contain the verbatim `recipient-required-token`. Migration: prose-form handoffs (e.g., "deferred to SP-D per scope") fall back to last-5-words heuristic AND emit `WARN: structured-handoff-required-after-2026-06-18`. After window: prose form = FAIL.

Circular check: read recipient's Status field (both forms). If recipient also DONE AND mutually references donor â†’ FAIL ("mutual exoneration"). NO override (Supreme Principle).

**C5 â€” Strict-line vs deviation axis-match (NOT OVERRIDABLE)** (B14 fix):

Phase A â€” find strict-line claims:
- Locate `## Acceptance` / `## Closure` / `### Acceptance Criteria` / `**Acceptance**:` / `**Coverage**:` headers + lines containing `**PARENT-STRICT-LINE**`.
- Scan STRICT tokens: `\b(zero|every|all\s+\d+|all-\d+|all\d+|100%|no exceptions|exhaustive|complete)\b` â€” on lines starting with `[-*|]`.
- Extract AXIS (2-word noun window).

Phase B â€” find deviation entries: same as v2.
Phase C â€” match: â‰¥ 2 token overlap â†’ FAIL.

### Phase 2 â€” PreToolUse hook `.claude/hooks/plan-closure-gate.sh` + `.claude/hooks/lib/check-plan-closure.mjs` (NEW)

Behavior on `Edit|Write|NotebookEdit|MultiEdit`:

1. Read tool_input from stdin JSON.
2. **B1 + V1 fix â€” LOCK-PATHS CHECK FIRST** (before any path filter): if target matches `LOCK_PATH_RX` (see below, V1+NV1 backslash-aware) â†’ DENY with user-only-edit message.
3. Identify target path. If not under `plans/{pending,done}/*.md`, exit 0 (allow). **(V5 boundary â€” fail-OPEN only allowed beyond this point if path is unrelated.)**
4. Project post-edit body (Edit/Write/MultiEdit/NotebookEdit semantics per v2 A4/A5).
5. Detect Status: DONE via parseField (V9). If not DONE â†’ exit 0.
6. Pipe projected body to `node scripts/validate-plan-closure.mjs --plan <path> --content-from-stdin --json`.
7. Validator exit 0 â†’ allow. Exit 1 â†’ DENY with structured `permissionDecision` + per-check evidence + remediation (file-edit instructions for C1; "NOT OVERRIDABLE â€” remediate by X" for C2-C5).
8. **NO chat-handshake override** (Q3 lock + Supreme Override Principle).
9. **V5 fail-CLOSED for in-scope paths** (replaces R4 fail-OPEN-grace): any validator exception while target is a plan-path OR lock-path â†’ DENY with "validator-error fail-closed" message. Fail-OPEN allow ONLY if target is outside both classes (path classification at step 2/3 already established scope). Counter at `.claude/state/closure-fail-closed-counter-<plan-basename>.json` (renamed from -open-) logs each fail-closed event for diagnostic visibility; /final-q reads it and forces RED if non-zero. No grace budget; no "first 3 free".
10. **Record blocked attempts (M2)**: append to `.claude/state/closure-attempts/<plan-basename>-<YYYY-MM-DD>.json` (date-anchored, NOT session-anchored).

**Bash matcher coverage (R2 + V1 + NV1 fix)** â€” Bash-mode hook is HARD-DENY on lock-path mention with READ-ONLY ALLOWLIST:
- First, read `tool_name`; if `tool_name !== "Bash"`, return ALLOW/no-op. This prevents the shared `Bash|mcp__Claude_in_Chrome__.*` matcher from applying Bash parsing to MCP payloads.
```js
const LOCK_PATH_RX = /\.claude[\/\\]closure-overrides(?:\.schema)?\.json|\.claude[\/\\]closure-overrides-authors\.txt|\.claude[\/\\]closure-gate-landed-at\.txt|plans[\/\\]_closure_manifests[\/\\][^\s'"]+\.manifest\.json/i;

// Read-only allowlist: must START with one of these AND contain NO write/redirect operators.
const READ_ONLY_PREFIX_RX = /^\s*(cat\s|type\s|Get-Content\s|git\s+show\s|git\s+cat-file\s|git\s+diff\s|git\s+log\s|git\s+status\b|ls\s|dir\s|Test-Path\s)/i;

const WRITE_OP_RX = /(>\s|>>\s|\|\s*tee\b|Tee-Object|Set-Content|Add-Content|Out-File|New-Item|Move-Item|Copy-Item|mv\s|cp\s|sed\s+.*-i\b|cat\s+>|cat\s+>>|\[(?:IO|System\.IO)\.File\]::Write|fs\.writeFile|fs\.appendFile|require\(.fs.\)\.write)/i;

if (LOCK_PATH_RX.test(cmd)) {
  if (READ_ONLY_PREFIX_RX.test(cmd) && !WRITE_OP_RX.test(cmd)) return ALLOW;
  return DENY;  // any mention of lock path without read-only prefix = deny, regardless of detected write op
}
```
Hard-deny posture catches PowerShell writers (Set-Content/Out-File/etc.), node -e writes, heredocs, and any future writer pattern. Read-only allowlist preserves legitimate inspection (cat, git show, etc.).

**Belt-and-suspenders (V3 fix)**: pre-commit hook `scripts/validate-overrides.mjs` validates **STAGED blob** via `git show :.claude/closure-overrides.json` (not HEAD â€” pre-commit is about what's about to land). Schema-lints staged content + author check (V2 caveat: best-effort attribution, not crypto). Post-push retro audit uses HEAD.

Hook wiring (`.claude/settings.json` PreToolUse) â€” **landed in Commit-B per V4 bootstrap**:
- Edit matcher block (line 31): add `bash .claude/hooks/plan-closure-gate.sh --edit-mode`.
- Bash matcher block (line 44): add `bash .claude/hooks/plan-closure-gate.sh --bash-mode`.

### Phase 3 â€” Override file, schema, authors, manifest (TRACKED)

NEW tracked files:

**`.claude/closure-overrides.json`**:
```json
{
  "$schema": "./closure-overrides.schema.json",
  "version": 1,
  "overrides": [],
  "meta_plans": [
    "PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md"
  ]
}
```

**`.claude/closure-overrides.schema.json`** â€” JSON Schema:
- `"additionalProperties": false` at root + every nested object (NB2).
- `plan`: pattern `^[A-Z0-9_-]+\.md$` (no wildcards).
- `path_match`: const `"exact"`.
- `tokens`: array, maxItems 2, items pattern explicit allow-list (no `*`).
- `expires_at`: format `date-time`, REQUIRED.
- `reason`: minLength 40.
- `granted_at`: format `date-time`, REQUIRED.
- `meta_plans[]`: array of plan basenames (M3 + R3 â€” exempt only if BOTH `closure_meta: true` AND listed).
- **NO `closure_circular_ok` field**. Schema rejects it via `additionalProperties: false`.

**`.claude/closure-overrides-authors.txt`** (NEW, tracked, one email per line) â€” pre-commit verifies commit author email is in this list for any change to `.claude/closure-overrides*`.

**`scripts/validate-overrides.mjs`** â€” schema lint + pre-commit author check. Self-test mode.

**`plans/_closure_manifests/<plan>.manifest.json`** (TRACKED) â€” **audit evidence, not hard cryptographic proof** (V7 acknowledgment):
```json
{
  "plan": "SUBPLAN_X.md",
  "plan_basename": "SUBPLAN_X.md",
  "plan_sha256": "<sha-256 of plan body at PASS time>",
  "passed_at": "2026-05-XX...",
  "validator_version": "1.0",
  "validator_config_sha256": "<sha-256 of validator regex sets>",
  "validator_self_hash": "<sha-256 of validate-plan-closure.mjs>",
  "validator_invocation_id": "<timestamp-nanos>-<random-128-hex>-<plan_sha256-first-16>",
  "artifacts": [{"path": "test-results/walk/.../01.png", "sha256": "..."}, ...],
  "provisional": false
}
```

**`validator_invocation_id` (V7)**: Generated only inside `validate-plan-closure --plan --enforce --write-manifest`. SAME id is appended to `.claude/state/closure-attempts/<plan-basename>-<YYYY-MM-DD>.json` when that runtime-local log exists. Layout may cross-check the id when local logs exist; mismatch is FAIL. Missing logs are YELLOW only because `.claude/state/` is runtime-local and ignored. Hard cryptographic proof is deferred to optional GPG-signing hardening.

**`plans/_closure_manifests/<plan>.manifest.json.tmp`** (M4) â€” provisional manifest, written BEFORE rename to `.json`. Layout `--check` ignores `.tmp` files. Cleanup is SEPARATE (NV2 fix): user-invoked `--cleanup-tmp-manifests` mode removes `.tmp` > 24h. `--check` strictly read-only, never deletes; emits YELLOW warning for stale `.tmp`.

**`.claude/closure-gate-landed-at.txt`** (B5 + V10 fix) â€” single ISO-8601 line: the timestamp at which this gate is considered "landed". Layout `--check` enforces manifest presence using **last-change timestamp** (`git log -1 --format=%at <plan>`). Plans whose LAST commit â‰¥ landed-at AND no manifest â†’ FAIL. Plans whose LAST commit < landed-at â†’ grandfathered (YELLOW warning, not error). Original creation timestamp NOT used â€” prevents the "old plan re-edited post-landing slips through" bypass.

### Phase 4 â€” Pre-push hook (`scripts/verify-no-forbidden.mjs` EXTEND)

Per fix #9 + NB3:
- Read full staged blob via `git show :<path>` for every staged plan under `plans/{pending,done}/*.md`.
- Detect Status: DONE in EITHER form via `hasStatusDoneAnyForm()`.
- **NB3 fix**: at line 280 area, replace the blanket `if (rel.startsWith('plans/pending/')) continue;` with closure-gate-aware logic â€” if staged plan has DONE in any form, run validator regardless of pending/ location. Otherwise keep the existing skip behavior for plans without DONE.
- Also extend `BANNED_PATH_EXEMPT` with C1 marker-based exemption (M3 + R3).
- Add `CLOSURE_FORBIDDEN_C1` array as fallback even without DONE (catches removed-Status-field but kept-tokens case).
- Wrap all git invocations with B15 error-handler.

### Phase 5 â€” Skill updates

**`.claude/skills/final-q/SKILL.md` Step 4.5** â€” ADD (V6 fix: --enforce is READ-ONLY now, no manifest write):
- Per active plan, run `node scripts/validate-plan-closure.mjs --plan <file> --enforce --json` + emit `ran '<cmd>' â†’ output: 'status: PASS|FAIL'`. **No manifest written by this call.**
- Read all `.claude/state/closure-attempts/<plan>-<YYYY-MM-DD>.json` within 6h.
- Read `.claude/state/closure-fail-closed-counter-<plan>-<date>.json` (V5). Non-zero â†’ RED floor (any fail-closed event is RED; no grace).
- Run `node scripts/validate-plan-layout.mjs --check`. Non-zero â†’ RED floor.

**`.claude/skills/audit/SKILL.md` Â§REVIEW Step 2.7** â€” EXTEND manufactured-blocker grep with `CLOSURE_FORBIDDEN_C1` + YAML-evidence regex. Auto-RED on (b) hits. Calls `validate-plan-closure --enforce` (READ-ONLY) â€” no side effects.

**`.claude/skills/execute/SKILL.md` Phase 3.5** â€” Precondition (V6 fix): `node scripts/validate-plan-closure.mjs --plan <file> --enforce --write-manifest` PASS before `git mv`. **`--write-manifest` flag is the manifest-emission gate â€” used ONLY here.** C2/C3/C4/C5 fail â†’ remediate, NOT override. The Status flip + manifest write + `git mv` happen in one commit per M4.

### Phase 6 â€” npm scripts (`package.json` after line 92)

```json
"plans:validate-closure": "node scripts/validate-plan-closure.mjs --enforce --plan",
"plans:validate-closure:write-manifest": "node scripts/validate-plan-closure.mjs --enforce --write-manifest --plan",
"plans:validate-closure:retro": "node scripts/validate-plan-closure.mjs --all --report-only",
"plans:validate-closure:changed": "node scripts/validate-plan-closure.mjs --changed --enforce",
"plans:validate-closure:revalidate-all": "node scripts/validate-plan-closure.mjs --all --enforce --rewrite-manifests",
"plans:validate-overrides": "node scripts/validate-overrides.mjs",
"plans:validate-layout": "node scripts/validate-plan-layout.mjs --check",
"plans:validate-layout:enforce-all": "node scripts/validate-plan-layout.mjs --enforce-all",
"plans:validate-layout:cleanup-tmp": "node scripts/validate-plan-layout.mjs --cleanup-tmp-manifests",
```

Extend `pipeline:validate` (line 58):
```
"pipeline:validate": "... && npm run plans:validate-overrides && npm run plans:validate-closure:changed && npm run plans:validate-layout"
```

(`:retro` / `:revalidate-all` / `:enforce-all` / `:cleanup-tmp` / `:write-manifest` are NOT in pipeline â€” user-invoked only. `:write-manifest` is invoked by /execute Phase 3.5 closure ceremony; nothing else.)

### Phase 7 â€” Retroactive scan (report-only)

`npm run plans:validate-closure:retro` writes `.claude/state/closure-audits/_closure_audit_<YYYY-MM-DD>.md`. Always exit 0.

**NB4 fix â€” corrected expected output**: SP-A surfaces under both C1 (OVERRIDABLE â€” `BLOCKED-BY-FIXME-DESIGN`, `surface-exists: divergent`, YAML evidence placeholders) AND C5 (NOT OVERRIDABLE â€” `CLOSURE-4 has one row per 6 fixme'd TCs + evidence per class` strict line at SP-A:270 vs deviation #1 "isolated-grep gate produces clean PASS/FAIL" â†’ `BLOCKED-BY-FIXME-DESIGN` at SP-A:291). C3 may also fire depending on path-existence at scan time. User remediation: address C5 first (NOT OVERRIDABLE â€” reopen, complete, or rewrite strict line with prior user authorization); C1 entries can be authorized via override file once C5 is resolved.

### Phase 8 â€” D23 fixtures `scripts/test-fixtures/plan-closure/` (EXPANDED)

**28 fixture files total: 25 plan-body `.md` fixtures + 3 helpers** (v5 F7). Helpers are exempt via underscore-prefix; plan-body fixtures are not exempt.

Helpers (exempt via underscore-prefix per B2): `_overrides.json`, `_authors.txt`, `_helpers.mjs`.

Plan-body fixtures (NOT exempt — must trigger gate as expected) — base 20 files:
1. `good-plan-markdown-status.md` â€” PASS.
2. `good-plan-yaml-status.md` â€” PASS.
3. `bad-c1-not-walked-bullet.md` â€” FAIL C1.
4. `bad-c1-yaml-evidence.md` (reproduces SP-A:113,116,131 pattern) â€” FAIL C1 multi-match.
5. `bad-c1-inline-code.md` (B3 â€” agent quotes ``BLOCKED-BY-FIXME-DESIGN`` via backticks) â€” FAIL C1 (must catch despite inline form).
6. `bad-c1-with-override-fixture.md` â€” FAIL via _overrides.json; PASS with override authorized.
7. `bad-c2-empty-summary.md` â€” FAIL C2.
8. `bad-c2-h2-summary.md` (B8 â€” `## Execution Summary` form) â€” PASS C2 (heading accepted).
9. `bad-c3-missing-plain.md` â€” FAIL C3.
10. `bad-c3-missing-md-link.md` â€” FAIL C3 (markdown link form).
11. `bad-c3-windows-backslash.md` â€” FAIL C3 (path normalized then verified missing).
12. `bad-c3-absolute-path.md` (B10 â€” `C:\Users\â€¦\foo.png` under repo) â€” normalize + verify; missing â†’ FAIL.
13. `bad-c3-with-manifest.md` â€” PASS via tracked manifest SHA-256 match.
14. `bad-c4-phantom-recipient.md` â€” FAIL C4 (recipient doesn't exist).
15. `bad-c4-shorthand-ambiguous.md` (B12) â€” FAIL C4 (SP-D resolves to multiple siblings).
16. `bad-c4-prose-handoff.md` (B13 migration) â€” WARN now, FAIL after 2026-06-18.
17. `bad-c4-circular.md` â€” FAIL C4 (no override path).
18. `bad-c5-all-eleven-spaced.md` (B14 â€” "all 11" with space) â€” FAIL C5.
19. `bad-c5-yaml-strict.md` â€” FAIL C5.
20. `sp-a-reproductive.md` â€” surfaces C1 + C5 (NB4); FAIL multi-check.

**V4/v5 additions to fixture set** (5 new plan-body fixtures — total plan-body `.md` fixtures now 25; total files including helpers now 28):
21. `bad-v1-powershell-set-content.md` (V1 â€” fixture supplying a Bash command like `Set-Content .claude/closure-overrides.json '...'`) â€” hook self-test asserts DENY.
22. `bad-v1-node-fs-write.md` (V1 â€” `node -e "require('fs').writeFileSync('.claude/closure-overrides.json', ...)"`) â€” DENY.
23. `bad-v3-pre-commit-head-vs-staged.md` (V3 â€” fixture where HEAD-override allows but STAGED-override differs) â€” pre-commit mode catches via staged blob.
24. `bad-v6-final-q-no-manifest-write.md` (V6 â€” fixture asserting `--enforce` produces no manifest, no .tmp file) â€” self-test confirms zero file writes.
25. `bad-v10-grandfather-post-edit.md` (V10 â€” pre-landing plan re-edited post-landing) â€” layout FAILS, not grandfathered.

Self-tests (authoritative per NV3 â€” D23 greps are smoke only):
- `validate-plan-closure --self-test` exit 0 â€” every fixture matches expected verdict.
- `check-plan-closure --self-test` exit 0 â€” hook DENY/ALLOW matches fixture expectation including V1 PowerShell/node cases.
- `validate-overrides --self-test` exit 0 â€” schema rejects wildcards / missing expiry / < 40-char reason / `closure_circular_ok` (additionalProperties: false); staged-blob source asserted for pre-commit (V3).
- `validate-plan-layout --self-test` exit 0 â€” synthetic plans/done tree under fixtures; V10 last-change grandfathering verified.

### Phase 9 â€” Rule pack `.claude/rules/plan-closure.md` (LR-N per M5)

Path-scoped: `paths: plans/**/*.md`.

Body skeleton (LR-N number resolved at Phase 0 step 1; e.g., LR-055 if no collision):

```markdown
# Plan Closure Discipline

## LR-N: Status: DONE is machine-gated â€” never flip without close-gate PASS

Status: DONE on any plan in plans/{pending,done}/*.md â€” markdown
form OR YAML frontmatter form â€” requires validate-plan-closure
PASS or matching .claude/closure-overrides.json entry.

Five checks (C1â€“C5). C1 OVERRIDABLE per token-per-plan via file.
C2/C3/C4/C5 NOT OVERRIDABLE â€” remediate.

Supreme principle: An override cannot convert missing evidence
into evidence (feedback_override_cannot_convert_missing_to_evidence.md).

Trigger: every Edit/Write/NotebookEdit/MultiEdit/Bash whose
projected post-state writes to a plan file OR to override/schema/
authors files. Enforced by .claude/hooks/plan-closure-gate.sh
(Edit + Bash matchers) + scripts/verify-no-forbidden.mjs
(pre-commit blob) + scripts/validate-plan-layout.mjs (fleet check).

Override mechanism (FILE-ONLY): user edits .claude/closure-overrides.json
adding a new entry; commits (commit author SHOULD be in
.claude/closure-overrides-authors.txt â€” best-effort attribution
per V2, not cryptographic proof); re-attempts. No chat handshake;
agent has no override request mechanism.

Bootstrap (V4): gate lands in 2 commits â€” commit-A seeds override
files (hook NOT yet wired), commit-B wires hook + validator + rule.
After commit-B, HEAD contains override file with this plan's
meta_plans[] entry, so plan body can be authorized.

Fail policy (V5): fail-CLOSED for plan-paths and lock-paths (any
validator exception while target is in-scope â†’ DENY). Fail-OPEN
only for unrelated paths. No grace budget. Counter at
.claude/state/closure-fail-closed-counter-*.json for diagnostic.

Authorization surfaces (R5 + V-corrections):
- override file (Edit/Write lock + PowerShell-aware Bash hard-deny + best-effort author attribution + HEAD/staged-blob auth)
- schema file (lock + author attribution)
- authors file (lock + author attribution â€” best-effort, not crypto)
- landed-at file (lock + author attribution)
- marker exemption (closure_meta: true + meta_plans[] listing â€” double-keyed per R3)
- manifests (plan_sha256 + validator-version + validator_invocation_id cross-checked against closure-attempts log per V7 â€” audit evidence not hard proof)
- fail policy (fail-CLOSED for in-scope paths per V5; fail-OPEN only out-of-scope; diagnostic counter)

Optional hardening (NOT required by v4): GPG-signed commits to lock-path files
would convert author attribution from best-effort to cryptographic. Future work.

Graduated from: 2026-05-18 auditor verdict on
plans/done/PLAN_FIX_CLI_HALLUCINATION_AND_SSL_A_BLOCKER.md (v1
covered only the exact failure mode). v2 was rejected with 19
new defects. v3 was rejected with 14 v3-blockers. v4 covers the
broader loophole class including authorization-surface integrity
as a first-class concern and acknowledges crypto-proof limits.
```

### Phase 10 â€” Fleet validator `scripts/validate-plan-layout.mjs` (NEW)

`--check` mode (READ-ONLY per NB1 + NV2 â€” NO writes, NO cleanups):

For every `.md` in `plans/done/`:
1. Parse Status via parseField (V9). Non-DONE â†’ FAIL ("DONE-folder contains non-DONE plan").
2. Check the computed tracked manifest path for the plan basename. If the manifest exists:
   - **B7 fix**: validate schema. Malformed â†’ FAIL.
   - Verify `plan_sha256` matches current plan body SHA. Mismatch â†’ FAIL ("manifest stale; re-run validator").
   - **M1 fix**: verify `validator_version` â‰¥ MIN_TOLERATED_VERSION. Lower â†’ FAIL ("re-run validator under new version").
   - **V7 fix**: if local `.claude/state/closure-attempts/<plan>-*.json` logs exist, verify `validator_invocation_id` against them. Mismatch is FAIL. Missing local logs are YELLOW only, because `.claude/state/` is ignored and absent in fresh clones/CI.
   - For artifacts that exist on disk: re-verify SHA-256. Mismatch â†’ FAIL ("artifact tampered").
3. **V10 fix**: if no manifest, compute LAST-CHANGE timestamp via `git log -1 --format=%at <plan>`. If last-change < `.claude/closure-gate-landed-at.txt` â†’ emit YELLOW warning (grandfathered). If last-change â‰¥ landed-at â†’ FAIL ("plan re-edited post-landing must produce manifest").
4. Stale `.tmp` manifests (>24h): emit YELLOW warning, do NOT auto-remove (NV2 â€” separate `--cleanup-tmp-manifests` mode).

For `plans/pending/`:
1. Status DONE â†’ FAIL ("DONE-in-pending â€” move or revert").
2. `TEMPLATE-DRAFT` / `PENDING-DRAFT` accepted.

`--enforce-all` mode: same checks, but ignores `closure-gate-landed-at.txt` (all plans must have manifest). User-invoked, not in pipeline. Still READ-ONLY.

`--cleanup-tmp-manifests` mode (NV2): removes `plans/_closure_manifests/*.json.tmp` older than 24h. User-invoked separately. Not part of pipeline.

**NB1 + V6 fix**: NEITHER mode writes manifests. Manifest writes happen ONLY in `validate-plan-closure --plan --enforce --write-manifest` PASS path, invoked solely by /execute Phase 3.5.

### Phase 11 â€” Validator-version migration tool (M1)

`scripts/validate-plan-closure.mjs --all --enforce --rewrite-manifests` (manual, user-invoked):
- For every plan in `plans/done/`, run validator under current version.
- PASS â†’ rewrite manifest with new `validator_version` + `validator_config_sha256` + `validator_self_hash`.
- FAIL â†’ emit finding, do NOT rewrite (preserves stale-manifest-still-evidence-of-prior-pass).
- User reviews findings + commits rewritten manifests.
- This is the migration mechanism when validator regex set bumps.

## Critical files to create or modify

| Status | Path | Role |
|---|---|---|
| NEW | `scripts/validate-plan-closure.mjs` | Validator |
| NEW | `scripts/validate-overrides.mjs` | Override-file lint + author-check |
| NEW | `scripts/validate-plan-layout.mjs` | Fleet validator (Phase 10) |
| NEW | `.claude/hooks/lib/check-plan-closure.mjs` | Hook lib (Edit + Bash) |
| NEW | `.claude/hooks/plan-closure-gate.sh` | Hook wrapper |
| NEW | `.claude/closure-overrides.json` (TRACKED, with `meta_plans[]`) | Override file |
| NEW | `.claude/closure-overrides.schema.json` (TRACKED, `additionalProperties:false`) | Schema |
| NEW | `.claude/closure-overrides-authors.txt` (TRACKED) | Author whitelist (R2) |
| NEW | `.claude/closure-gate-landed-at.txt` (TRACKED) | Grandfather timestamp (B5) |
| NEW | `.claude/rules/plan-closure.md` | LR-N path-scoped rule |
| NEW dir | `.claude/state/closure-audits/` | Retro report dest |
| NEW dir | `.claude/state/closure-attempts/` | Date-anchored attempts (M2) |
| NEW dir | `plans/_closure_manifests/` (TRACKED) | Manifest sidecars |
| NEW dir | `scripts/test-fixtures/plan-closure/` | 28 fixture files total (25 plan-body + 3 helpers) per NV4/v5 recount |
| NEW | `scripts/test-fixtures/plan-closure/verify-v5-landing.sh` | Runnable D23 script (V8 â€” replaces inline `&& \ # comment` chain) |
| MODIFY | `.claude/settings.json` line 31, 44, 6 | Add closure-gate to BOTH Edit + Bash PreToolUse + 9 allow entries |
| MODIFY | `package.json` line 92, 58 | 9 npm scripts (added :write-manifest + :cleanup-tmp per V6+NV2); pipeline:validate adds :overrides + :changed + :layout |
| MODIFY | `scripts/verify-no-forbidden.mjs` line 280 | Replace pending-skip with closure-gate-aware logic (NB3); add `CLOSURE_FORBIDDEN_C1` array + full-staged-blob delegation; B15 git error handler |
| MODIFY | `.claude/skills/final-q/SKILL.md` Step 4.5 | Closure + layout + fail-OPEN-counter reads; force RED on FAIL |
| MODIFY | `.claude/skills/audit/SKILL.md` Â§REVIEW 2.7 | C1 YAML scan; auto-DROP phantom rows |
| MODIFY | `.claude/skills/execute/SKILL.md` Phase 3.5 | Precondition gate before mv |

**NOT modified** (deliberate):
- `.gitignore` is NOT extended for `plans/_closure_manifests/*.json` (manifests tracked).
- `.gitignore` is NOT extended for `.claude/closure-overrides.json` (file tracked).

## Reused existing functions / patterns

- Hook harness pattern: clone [check-todo-injection.mjs:116-146](.claude/hooks/lib/check-todo-injection.mjs:116) (`extractWriteContent`) + `:109-114` (path-scoping).
- Fail-OPEN + hook-failures log: [check-todo-injection.mjs:165](.claude/hooks/lib/check-todo-injection.mjs:165) â€” extended with counter (R4).
- Banned phrases + path-scoping: [verify-no-forbidden.mjs:99-119](scripts/verify-no-forbidden.mjs:99) â€” extend with `CLOSURE_FORBIDDEN_C1`.
- Self-test framework: [check-todo-injection.mjs:150](.claude/hooks/lib/check-todo-injection.mjs:150).
- HEAD-only authority: `git show HEAD:<path>` (wrapped with B15 error handler).
- Status field parsing: [plans-reindex.mjs:268](scripts/plans-reindex.mjs:268) â€” reuse `parseField(header, 'Status')`.

## Out of scope

- Deep-semantic claim-vs-reality parser (cross-counting claims like "6 explored gaps" vs body claims).
- Retroactive Status auto-fix (Phase 7 reports only).
- Stop-hook reintroduction (deleted 2026-04-23 per LR-042 Â§A; PreToolUse + layout cover defense).
- Override-file CLI / chat UI.
- Changing existing LR-027/LR-040/LR-046 wording.
- Broadening override to C2/C3/C4/C5 (forbidden by Supreme Override Principle).
- AI-Council auto-audit loopback.

## TodoWrite Tagging Contract (execution session)

11-phase plan touching 20+ files. `/execute` MUST tag every todo (`[/skill:matchtype]` / `LR-NNN(reason)` / `[manual](reason)` / `[ceremony]`); enumerate 7 ceremony obligations; tag with LR-N once authored.

## Quality gates

1. **Adversarial audit v1** â€” DONE (Plan agent 8 show-stoppers fixed).
2. **Auditor v1 review** â€” DONE (10 blockers fixed in v2).
3. **Auditor v2 review** â€” DONE (15 blockers + 4 non-blockers fixed in v3).
4. **My audit of v2** â€” DONE (5 misses M1-M5 fixed in v3).
5. **Reviewer endorsement** â€” RECORDED (B15 upgrade accepted on attestation; R1 methodological-only).
6. **My audit of reviewer** â€” DONE (R2-R5 fixed in v3; R1 noted).
7. **Auditor v3 review** â€” DONE (10 V-blockers + 4 NV-non-blockers fixed in v4 â€” repo state independently re-verified before each acceptance: `.gitignore`, `parseField`, settings.json:31/44, PowerShell shell, etc.).
8. **Supreme Override Principle gate** â€” applied throughout. v4 adds: no override for "I'm tired of revising" â€” gate either holds or it doesn't.
9. **Authorization-surface gate** â€” R5 first-class Â§"Authorization Surface Integrity" added (v3); v4 adds V2 acknowledgment that author whitelist is best-effort attribution not crypto authority.
10. **Post-execution audit** â€” every Phase 0-11 deliverable must be present on disk; self-justified skips REQUIRE user override.
11. **`/reflect` + LR-028 row** â€” activity-log row at session end with LR-037 timestamp â‰¥ touched-file mtimes.

## Verification (D23 â€” runnable script, V8 fix)

D23 is now a runnable script at `scripts/test-fixtures/plan-closure/verify-v5-landing.sh`. Inline `&& \ # comment` form was broken (V8 â€” `\` escapes the space before `#`, not the newline). Script body â€” comments live on SEPARATE lines, never inside the `&&` chain:

```bash
#!/usr/bin/env bash
set -euo pipefail

# === BEHAVIOR â€” authoritative self-tests (NV3) ===
node scripts/validate-plan-closure.mjs --self-test 2>&1 | tail -3
node .claude/hooks/lib/check-plan-closure.mjs --self-test 2>&1 | tail -3
node scripts/validate-overrides.mjs --self-test 2>&1 | tail -3
node scripts/validate-plan-layout.mjs --self-test 2>&1 | tail -3

# === SMOKE â€” grep checks (string-presence only, not behavior) ===
# B1 (Lock-paths first)
grep -q "Lock-paths check FIRST" .claude/hooks/lib/check-plan-closure.mjs
# B2 (no blanket fixture exemption)
! grep -q "fixtures\"$" scripts/validate-plan-closure.mjs
# B3 (inline-backtick filter removed from rule)
! grep -q "Inside inline backticks â†’ drop" .claude/rules/plan-closure.md
# B4 (no override:/user-approved: filter)
! grep -q "user-approved:.*override:" scripts/validate-plan-closure.mjs
# B5+V10 (landed-at + last-change)
grep -q "closure-gate-landed-at" scripts/validate-plan-layout.mjs
grep -q "git log -1 --format=%at" scripts/validate-plan-layout.mjs
# B6 (plan_sha256)
test -f plans/_closure_manifests/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md.manifest.json && grep -q "plan_sha256" plans/_closure_manifests/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md.manifest.json
# B7 (plan_sha256 verification in layout)
grep -q "plan_sha256 matches" scripts/validate-plan-layout.mjs
# B8 (## through #### Execution Summary)
grep -qE '#{2,4}\\\\s\\+Execution Summary' scripts/validate-plan-closure.mjs
# B10 (path.relative)
grep -q "path.relative" scripts/validate-plan-closure.mjs
# B11 (extension set extended)
grep -qE '\\.log\\|\\.txt\\|\\.har\\|\\.xml' scripts/validate-plan-closure.mjs
# B12+V9 (parent-aware sibling + parseField)
grep -q "parent-aware sibling" scripts/validate-plan-closure.mjs
grep -q "parseField" scripts/validate-plan-closure.mjs
# B13 (recipient-required-token)
grep -q "recipient-required-token" scripts/validate-plan-closure.mjs
# B14 (all\\s+\\d+ regex)
grep -qE 'all\\\\s\\+\\\\d\\+' scripts/validate-plan-closure.mjs
# B15 (dubious ownership handler)
grep -q "dubious ownership" scripts/validate-plan-closure.mjs
# NB1 (no manifest writes in layout)
! grep -qE "writeFileSync.*manifest" scripts/validate-plan-layout.mjs
# NB2 (additionalProperties false)
grep -q '"additionalProperties": false' .claude/closure-overrides.schema.json
# NB3 (skip removed/qualified)
! grep -q "rel.startsWith..plans/pending/.. continue" scripts/verify-no-forbidden.mjs
# M1 (validator_version)
test -f plans/_closure_manifests/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md.manifest.json && grep -q "validator_version" plans/_closure_manifests/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md.manifest.json
# M2 (closure-attempts dir exists)
test -d .claude/state/closure-attempts
# M3 (closure_meta in schema)
grep -q "closure_meta" .claude/closure-overrides.schema.json
# M4 (own-dogfood manifest exists after --write-manifest)
test -f plans/_closure_manifests/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md.manifest.json
# M5 (LR-N populated)
grep -qE "LR-[0-9]+" .claude/rules/plan-closure.md
# R2 (Bash mode wired + MCP no-op guard)
grep -q "plan-closure-gate.sh --bash-mode" .claude/settings.json
grep -q "tool_name.*Bash" .claude/hooks/lib/check-plan-closure.mjs
# R3 (meta_plans in schema)
grep -q "meta_plans" .claude/closure-overrides.schema.json
# R4+V5 (fail-closed counter â€” RENAMED from fail-open)
grep -q "closure-fail-closed-counter" scripts/validate-plan-closure.mjs
# R5 (authorization surface section)
grep -q "Authorization Surface" .claude/rules/plan-closure.md

# === V4 BLOCKER FIXES ===
# V1 (PowerShell writers in regex)
grep -qE "Set-Content|Out-File|Add-Content|Tee-Object" .claude/hooks/lib/check-plan-closure.mjs
# V1 (node fs writers)
grep -qE "fs\\\\.writeFile|fs\\\\.appendFile" .claude/hooks/lib/check-plan-closure.mjs
# V1 (read-only allowlist)
grep -q "READ_ONLY_PREFIX_RX" .claude/hooks/lib/check-plan-closure.mjs
# V2 (best-effort attribution acknowledgment)
grep -q "best-effort attribution" .claude/rules/plan-closure.md
# V3 (staged blob for pre-commit)
grep -q "git show :.claude/closure-overrides.json" scripts/validate-overrides.mjs
# V4 (2-commit bootstrap mentioned in plan/rule)
grep -qE "commit-A|commit-B|bootstrap" .claude/rules/plan-closure.md
# V5 (fail-CLOSED for plan-paths, not fail-open)
grep -q "fail-CLOSED" .claude/hooks/lib/check-plan-closure.mjs
! grep -q "first 3 free" .claude/hooks/lib/check-plan-closure.mjs
# V6 (--write-manifest separate flag)
grep -q "write-manifest" scripts/validate-plan-closure.mjs
grep -q "plans:validate-closure:write-manifest" package.json
# V7 (validator_invocation_id)
test -f plans/_closure_manifests/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md.manifest.json && grep -q "validator_invocation_id" plans/_closure_manifests/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md.manifest.json
grep -q "validator_invocation_id" scripts/validate-plan-layout.mjs
# V8 (this script exists, runnable)
test -x scripts/test-fixtures/plan-closure/verify-v5-landing.sh
# V9 (Parent parseField reused)
grep -q "parseField.*Parent" scripts/validate-plan-closure.mjs
# V10 (last-change timestamp, not creation)
grep -q "git log -1 --format=%at" scripts/validate-plan-layout.mjs
# NV1 (backslash in lock-path regex)
grep -qE '\\\\[\\\\/\\\\\\\\\\\\]closure-overrides' .claude/hooks/lib/check-plan-closure.mjs
# NV2 (separate cleanup mode)
grep -q "cleanup-tmp-manifests" scripts/validate-plan-layout.mjs
# NV3 (BEHAVIOR vs SMOKE comments)
grep -q "BEHAVIOR" scripts/test-fixtures/plan-closure/verify-v5-landing.sh
# NV4/v5 fixture count (25 plan-body .md fixtures + 3 helpers)
test "$(ls scripts/test-fixtures/plan-closure/*.md | wc -l)" -eq 25
test -f scripts/test-fixtures/plan-closure/_overrides.json
test -f scripts/test-fixtures/plan-closure/_authors.txt
test -f scripts/test-fixtures/plan-closure/_helpers.mjs

echo "ALL GREEN â€” plan-closure-gate v5 landed, all 52 corrections verified"
```

The `!` negations are load-bearing: assert prior-version defects ABSENT. Behavior self-tests (top 4 lines) are authoritative per NV3; grep smoke checks confirm string presence but not behavior.

## Closure ceremony

1. Status: PENDING â†’ DONE (YAML form in this plan).
2. Executed: 2026-05-XX.
3. ### Execution Summary with phase-by-phase deliverable table + LR-027 obligations + D23 output + sample retro excerpt + LR-020 plan-claim verification + plan-deviations log.
4. **Eat own dogfood (V6 mode)**: `node scripts/validate-plan-closure.mjs --plan plans/pending/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md --enforce --write-manifest` PASS. This plan's `closure_meta: true` + `meta_plans[]` listing covers C1 self-references. The `--write-manifest` flag is the ONLY way manifests get written â€” this closure is the sole invocation site.
5. Validator emits the tracked manifest sidecar computed from this plan basename (with plan_sha256 + validator_invocation_id matching closure-attempts log entry).
6. `git mv plans/pending/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md plans/done/` + `git add plans/_closure_manifests/...manifest.json` + commit (M4 atomicity at git level).
7. `npm run plans:reindex`.
8. `npm run plans:validate-layout --check` â†’ exit 0 (V10: last-change â‰¥ landed-at AND manifest exists â†’ PASS).
9. LR-028 activity-log row.
10. `/final-q` v2 evidence emission â†’ GREEN.

LR-046 verdict floor: rescoping any strict line without prior user authorization â†’ automatic RED. Strict lines: "every Phase 0â€“11 deliverable present", "every fixture matches expected verdict", "C2/C3/C4/C5 NOT OVERRIDABLE", "NO chat-handshake override exists", "authorization surfaces enumerated and gated", "all 52 corrections (v1+v2+v3-self+reviewer R+v3-reviewer V/NV+v4-final-review) verified-clean".

## Plan-location note

Scratch file at `C:\Users\rutvi\.claude\plans\bright-nibbling-mitten.md` is plan-mode authoring only. First execution step: move content to `plans/pending/PLAN_CLOSURE_GATE_AND_STRICT_LINE_ENFORCEMENT.md` (per `feedback_save_plan_location.md`).

## v5 audit verdict (this revision)

Reviewer v3 audit: **10 blockers + 4 non-blockers, all VERIFIED VALID against repo state.**

Cross-verified before accepting each finding (auditor's "do not take a single word for granted" mandate, applied symmetrically):
- `.claude/settings.json:31` Edit matcher, `:44` Bash matcher â€” separate blocks. v3 only wired Edit's regex behavior into Bash; missed PowerShell entirely. **V1 VALID.**
- `git config user.email` is locally writable; whitelist file is plaintext. **V2 VALID.**
- `git show HEAD:` is previous commit; pre-commit must use `git show :`. **V3 VALID.**
- On first commit landing, HEAD lacks the override file; v3 had no bootstrap path. **V4 VALID.**
- One fail-OPEN on a plan-path is sufficient to flip Status; v3's "3-event grace" budget was a free bypass. **V5 VALID.**
- v3 had `--enforce` writing manifests AND multiple callers (final-q, pipeline, audit). **V6 VALID.**
- v3 manifest had hashes but no cross-reference; an agent that can compute hashes can hand-write a manifest. **V7 VALID.**
- v3 D23 used `&& \                # comment` form â€” `\` escapes space, not newline; comment becomes part of logical line, breaks. **V8 VALID.**
- `plans-reindex.mjs:65-72` parseField supports `(?:\\*\\*)?${label}(?:\\*\\*)?` â€” both Status and Parent forms; v3 only used `**Parent**:`. **V9 VALID.**
- `git log -1 --format=%at <plan>` gives last-change; creation timestamp lets post-landing edits grandfather. **V10 VALID.**

All 4 non-blockers (backslash separator, --check cleanup, smoke-vs-behavior, fixture miscount) similarly verified.

**Verdict: weapons laid down.** v3 is "mostly strong with remaining authorization-surface holes" â€” auditor's framing is correct. v5 closes the 14 v3-review holes plus the 8 final-review holes. No defense of v3 was sustainable on the merits.

Per Supreme Override Principle (`feedback_override_cannot_convert_missing_to_evidence.md`): the override surface authorizes honest classification of gathered evidence, never converts missing evidence into evidence. Defending v3 on "looks comprehensive" would be exactly the laundering move forbidden by that principle. The reviewer's evidence was concrete; v4 incorporates it.

