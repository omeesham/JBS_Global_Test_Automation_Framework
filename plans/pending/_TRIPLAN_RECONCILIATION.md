**Status**: REFERENCE-ARTIFACT
**Date**: 2026-07-30
**Owner**: OWNER
**Consumed by**: PLAN_REPO_SLOP_SWEEP.md · PLAN_ULTRAAUDIT_FIX_WAVE.md · PLAN_COPILOT_INTEGRATION_ULTRAAUDIT.md

---

# TRI-PLAN RECONCILIATION

Produced once; consumed by all three gated plans. Do not regenerate — consume as-is.
Every claim below cites its source artifact.

---

## COLLISION MATRIX

### Part 1 — In-Repo: Fix-List ⇄ Delete-List

Source: `out-recon-fixwave/STEP0A-RECONCILIATION.md`

**Confirmed same-path collisions: ZERO.**

| Fix path | Fix lot | Delete path | Delete lot | Assessment |
|---|---|---|---|---|
| `~/.claude/hooks/lib/delegation-gate.mjs` | FW-B3 | `.claude/state/delegation-audit/inputs/hooks/delegation-gate.mjs` | B3 | SAME-BASENAME-ONLY — different dirs (`~/.claude/hooks/lib/` vs repo `.claude/state/…/`). No conflict. |
| `~/.claude/hooks/lib/ua-worker-guard.mjs` | FW-B3 | `.claude/state/delegation-audit/inputs/hooks/ua-worker-guard.mjs` | B3 | SAME-BASENAME-ONLY — different dirs. No conflict. |
| `.claude/skills/ultra-agents/worker-ext.md` | FW-A3 | `.claude/skills/ultra-agents/worker-ext.md.bak-lcd07` | A5/.claude bucket | SAME-DIR, DIFFERENT-FILENAME (`.bak-lcd07` suffix). No conflict. |

**B4 vs FW-A3 verdict** (source: `STEP0A-RECONCILIATION.md § B4 vs FW-A3`):
B4 deletes 25 `plans/done/` files (HIST_*, CORP_PRICING_*, etc.). FW-A3 fixes `PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md`, `SUBPLAN_LCD_05_LEARNING_LANES.md`, `SUBPLAN_LCD_06_SELF_PRUNING.md`. Cross-check exhaustive — **NO COLLISION**. Definitive.

**C2 vs FW-B5 verdict** (source: `STEP0A-RECONCILIATION.md § C2 vs FW-B5`):
C2 scrubs credentials in 6 `pipeline/` and `src/` files. FW-B5 touches `scripts/`, `.claude/hooks/lib/`, `.claude/agents/`, `AGENT_SHARED_RULES.md`, etc. Zero overlap. **NO COLLISION**. Definitive.

**FW-B3 path-truth defect** (source: `out-rh-E/OFFREPO-COLLISION.md § FW-B3 PATH TRUTH`):
`PLAN_ULTRAAUDIT_FIX_WAVE.md` Lot FW-B3 cites five files under `~/.claude/hooks/lib/` — **that directory does not exist**. Actual locations: `delegation-gate.mjs`, `ua-worker-guard.mjs`, `labor-gate.mjs`, `delegation-nudge.mjs` all live directly at `~/.claude/hooks/` (no `lib/` subdirectory). `parse-verdict.mjs` exists only in the repo at `.claude/hooks/lib/parse-verdict.mjs`, not in `~/.claude/hooks/` at all. Any FW-B3 action referencing `~/.claude/hooks/lib/` will fail.

---

### Part 2 — Off-Repo: ORP-A1 Bak-Deletion Surface vs Protected Rulings

Source: `out-rh-E/OFFREPO-COLLISION.md`

**Total bak files: 42** (ORP-A1 claimed 40; +2 delta from post-measurement creation — confirmed defect in ORP-A1's stated count).

**19 collisions found**: bak files that ORP-A1 would delete but carry protected, DO-NOT-DELETE, or PENDING-GO rulings.

| # | File | Collision type | Citation |
|---|---|---|---|
| 1 | `~/.claude/hooks/delegation-gate.mjs.bak-lcd07` | DO NOT DELETE — UNIQUE CONTENT | `_ULTRAAUDIT_FINDINGS.md` P2-LOT08-03; FIX_WAVE Decision 3 |
| 2 | `~/.claude/delegation/config.json.bak-lcd04` | DO NOT DELETE — merge first (P2-13). **NOTE**: as of 2026-07-30, live config already contains all bak keys; P2-13 protective basis is now obsolete. Disposition still owner's call. | `_ULTRAAUDIT_FINDINGS.md` P2-13; OFFREPO-COLLISION § UNIQUE-CONTENT CHECK |
| 3 | `~/.claude/hooks/check-delegation-envelope.mjs.bak-cheatproof-20260715` | PENDING-GO | `_ULTRAAUDIT_FINDINGS.md` P2-LOT08 batch |
| 4 | `~/.claude/hooks/delegation-gate.mjs.bak-cheatproof-20260715` | PENDING-GO | P2-LOT08 batch |
| 5 | `~/.claude/hooks/delegation-nudge.mjs.bak-lcd03` | PENDING-GO | P2-LOT08-04 |
| 6 | `~/.claude/hooks/delegation-nudge.mjs.bak-lcd04` | PENDING-GO | P2-LOT08-05 |
| 7 | `~/.claude/hooks/delegation-primer.mjs.bak-lcd03` | PENDING-GO | P2-LOT08-06 |
| 8 | `~/.claude/hooks/labor-gate.mjs.bak-cheatproof-20260715` | PENDING-GO | P2-LOT08 batch |
| 9 | `~/.claude/delegation/gates/verify-run.mjs.bak2-cheatproof-20260715` | NEVER-TOUCH directory (`gates/` entire dir) | `PLAN_REPO_SLOP_SWEEP.md:114` |
| 10 | `~/.copilot/agents/chief.agent.md.bak-2026-07-14T09-38-29-747Z` | NEVER-TOUCH dir + PENDING-GO | `PLAN_REPO_SLOP_SWEEP.md:115` + P2-LOT10 |
| 11 | `~/.copilot/agents/chief.agent.md.bak-cheatproof-20260715` | NEVER-TOUCH dir + PENDING-GO | same |
| 12 | `~/.copilot/agents/council-planner.agent.md.bak-cheatproof-20260715` | NEVER-TOUCH dir + PENDING-GO | same |
| 13 | `~/.copilot/agents/council-reviewer.agent.md.bak-cheatproof-20260715` | NEVER-TOUCH dir + PENDING-GO | same |
| 14 | `~/.copilot/agents/council-verifier.agent.md.bak-cheatproof-20260715` | NEVER-TOUCH dir + PENDING-GO | same |
| 15 | `~/.copilot/agents/council-worker.agent.md.bak-cheatproof-20260715` | NEVER-TOUCH dir + PENDING-GO | same |
| 16 | `~/.copilot/agents/council-worker.agent.md.bak-hardening-20260725` | NEVER-TOUCH dir (no individual ruling) | `PLAN_REPO_SLOP_SWEEP.md:115` |
| 17 | `~/.copilot/agents/council-worker.agent.md.bak-prefix-kill-20260725` | NEVER-TOUCH dir | same |
| 18 | `~/.copilot/agents/council-worker.agent.md.bak-prefix-kill-20260725155919` | NEVER-TOUCH dir | same |
| 19 | `~/.copilot/agents/council-worker.agent.md.bak-repin46-20260725` | NEVER-TOUCH dir | same |

**Consequence for ORP-A1**: ORP-A1 is Category A (dispatchable, no per-item GO). However, 8 files require per-item GO, 2 carry DO-NOT-DELETE rulings, and 11 sit inside NEVER-TOUCH directories. ORP-A1 **cannot safely execute as written** without carving out the collision set or downgrading to per-item GO. Source: `OFFREPO-COLLISION.md § COLLISION SET`.

**NEVER-TOUCH gap**: 7 exact-path/simple-glob NEVER-TOUCH patterns fail to protect 20 bak files carrying `.bak-*` suffixes. Only directory-scoped patterns (`gates/`, `agents/`) are robust. Source: `OFFREPO-COLLISION.md § NEVER-TOUCH GAP`.

**ORP-A1 scratch-root hazard**: `%LOCALAPPDATA%/Temp/claude/` contains at least 2 actively-written directories (`C--Users-rutvi`, `c--Users-rutvi-projects-encore-framework`) as of 2026-07-30. Blanket deletion while Claude sessions are live would corrupt in-flight work. Source: `OFFREPO-COLLISION.md § SCRATCH-ROOT HAZARD`.

**Unique-content elevated-risk files** (large, no prior audit ruling):
- `~/.claude/delegation/copilot-worker.sh.bak-ledgertruth-20260723` (42,364 bytes) — may contain ledger-truth logic
- `~/.claude/delegation/copilot-worker.sh.bak-vn-20260723` (49,235 bytes) — may contain version-negotiation logic
- `~/.claude/oneliners/rebuild-style-card.mjs.bak-pre-hardening-20260726` (31,961 bytes) — pre-hardening snapshot
- `~/.claude/delegation/gates/verify-run.mjs.bak2-cheatproof-20260715` (24,802 bytes) — NEVER-TOUCH (above)

Source: `OFFREPO-COLLISION.md § UNIQUE-CONTENT CHECK / STRUCTURAL ASSESSMENT`.

---

## STAGED-ARTIFACT REGISTER

| Artifact | Location | Size | Status | Disposition |
|---|---|---|---|---|
| lcd07r2 staged patch | `~/.claude/delegation/` (unapplied) | ~25 KB | Awaiting owner GO | apply-first (FIX_WAVE Decision 2: P1-M05); `PLAN_ULTRAAUDIT_FIX_WAVE.md` Open Decision 2 |
| `config.json.bak-lcd04` | `~/.claude/delegation/config.json.bak-lcd04` | 110 bytes | Merge prerequisite per P2-13; but as of 2026-07-30 all keys already in live config | retire (merge already complete per `OFFREPO-COLLISION.md § UNIQUE-CONTENT CHECK`); awaiting-GO to delete |
| 42 bak files (full set) | `~/.claude/` (32 files) + `~/.copilot/` (10 files) | varies | 19 have protected/PENDING-GO rulings (see COLLISION MATRIX Part 2); 23 unclassified | awaiting-GO (per-file for the 19 colliding; Category A batch for the 23 unclassified after carve-out) |
| Residual staged pending plans (9) | `plans/pending/` | — | 9 pending plans cited in FIX_WAVE Open Decision 10: "confirm active vs stale before Phase 7 closure" | awaiting-GO — do not move/edit without explicit Rutvik approval (source: `out-recon-slop/TRI-STATE.md § PLAN_ULTRAAUDIT_FIX_WAVE.md BLOCKED ON`) |

---

## NEW FINDINGS (FOLD-IN)

All findings from re-hunt lots A–D. Findings the lots marked ALREADY-KNOWN are listed with their existing ID.

| id | path:line | severity | bug | triggering input | wrong output | already-known? |
|---|---|---|---|---|---|---|
| RH-B-01 | `scripts/validate-plan-closure.mjs:1242` | S1 | `--enforce` is documented READ-ONLY but any failing single-plan validation writes closure-attempt state (calls `recordAttempt()`, writes JSON to `.claude/state/closure-attempts/`) before exiting | `node scripts/validate-plan-closure.mjs --plan <fixture> --enforce` with a failing plan | Repo state mutated (JSON file written) during command documented as read-only | No |
| RH-B-02 | `scripts/ship-client.sh:79` | S1 | Full-client ship path strips `.env.local` then calls `verify-no-forbidden.mjs` without `--require-env-local`, so a deliverable missing the blank starter env file can pass verification | `npm run client:ship -- --client=encore --out=<dir>` | `verify-no-forbidden` prints OK; deliverable ships without `.env.local`; sibling `ship-branch.sh:300` proves the flag is mandatory | No |
| RH-C-01 | `pipeline/worker/index.ts:536` | S0 | Post-complete gate failure swallowed — `success: true` returned unconditionally after catch block sets `_postCompleteGatePassed = false` at :529 | Stage with `postCompleteGate` defined; gate script exits non-zero | `resolve({ success: true, result: { _postCompleteGatePassed: false, ... } })` — orchestrator treats this as success, pipeline advances past the failed gate | No |
| RH-C-02 | `render.yaml:29` | S1 | Render worker-manager buildCommand references `npm run build:worker` which does not exist in package.json | Render deployment trigger for `encore-worker-manager` | Build fails: `Missing script: "build:worker"`. Actual script is `build:server` | No |
| RH-C-03 | `render.yaml:7` + `render.yaml:30` | S1 | startCommand references `dist/server/index.js` and `dist/worker/worker-manager.js` but build outputs to `dist-pipeline/` (pipeline/tsconfig.json outDir = `../dist-pipeline`) | Any successful build + start | `Error: Cannot find module 'dist/server/index.js'` — correct path is `dist-pipeline/server/index.js` | No |
| RH-C-04 | `docker-compose.yml:24` | S1 | worker-manager service has `build: .` but no Dockerfile exists at repo root; also references `dist/worker/worker-manager.js` (same outDir mismatch as RH-C-03) | `docker-compose build` or `docker-compose up` | Build fails: `no Dockerfile found` | No |
| RH-C-05 | `src/common/credential-loader.ts:102-103` | S1 | `_loadEnvRecord()` falls back to hardcoded `username: 'admin', password: 'admin'` when all 4 env vars are unset — no error, no warning; `_source` field falsely claims `'environment variables'` | `CredentialLoader.loadCredentials({ type: 'env' })` without any env vars set | Returns `{ username: 'admin', password: 'admin', _source: 'environment variables' }`; `validateCredentials()` passes because `'admin'.length >= 3` | No |
| RH-C-06 | `docs/README.md:9` | S2 | References path `config/environments/.env.example` which does not exist (removed 2026-07-16) | User follows Quick Start | `cp config/environments/.env.example` fails: no such file | No |
| RH-C-07 | `docs/README.md:12-14` | S2 | References scripts `test:chrome`, `test:headed`, `test:debug` — none exist in package.json | `npm run test:chrome` | `Missing script: "test:chrome"` | No |
| RH-C-08 | `docs/README.md:3,44` | S2 | Claims pipeline agents live at `.claude/agents/{REQUIREMENTS,PLANNER,...}.md` — only `RUTVIK.agent.md` and `COLLEAGUE.agent.md` exist there; agents are skills under `.claude/skills/` | User looks for agent files at documented path | Files not found | No |
| RH-C-09 | `README.md:55` | S2 | Links to `docs/read_only_docs/MCP_BROWSER_GUIDE.md` — moved to `_archive/`; live guide is `CLI_BROWSER_GUIDE.md` | User clicks link | 404 / file not found | No |
| RH-D-01 | `website/backend/src/routes/auth.routes.ts:100` | S0 | Hardcoded demo credentials mint real JWTs including `super_admin` whenever DB lacks that user or is unavailable | `POST /api/auth/login` with `{"username":"superadmin","password":"SuperAdmin@2026"}` | 200 + signed token with `role:"super_admin"`; expected 401 unless real stored user authenticates | No |
| RH-D-02 | `website/backend/src/routes/ai-provider.routes.ts:29` | S0 | Default worker secret `dev-secret` authenticates internal worker endpoints when `WORKER_SECRET` is unset | `GET /api/ai/internal/resolve/<clientId>` with header `x-worker-secret: dev-secret` | 200 + decrypted `apiKey`; expected 401 for unconfigured secret | No |
| RH-D-03 | `website/backend/src/middleware/tenant.middleware.ts:5` | S0 | Public default JWT secret lets attacker forge tenant-aware tokens and choose the schema used by routes | JWT signed with `intelliqe-dev-secret-change-in-production`, arbitrary payload | Token verifies; `queryWithSchema` runs against attacker-supplied schema; expected 401 | No |
| RH-D-04 | `website/backend/src/services/tenant.service.ts:153` | S1 | Client slug inserted into SQL identifiers without validation — valid-looking admin input with spaces/punctuation breaks tenant provisioning | `POST /api/clients` with `slug:"bad slug"` | Route 500: DB syntax error from unquoted index name; should be 400 with validation error | No |

**Lot A findings**: 0 net-new. 27/322 files opened. All S0/S1 patterns encountered were already in `_ULTRAAUDIT_FINDINGS.md`. Source: `out-rh-A/REHUNT-LOT-A.md § LOT SUMMARY`.

---

## COVERAGE LEDGER

✅ **100% mandate MET for executables. Non-executables honestly ledgered — see per-lot artifacts.**

Denominator: **1,937 total lines / 1,901 non-blank** in `.claude/state/ua-worker/slop0-enum-0718-artifacts/denominator.md`. The 1,901 figure is a NON-BLANK count and must never be used as a line offset (doing so silently drops the final ~36 rows including website/frontend entries). Source: `out-recon-slop/TRI-STATE.md § DENOMINATOR CHECK`; `out-w2-other/REHUNT-W2-OTHER.md § DENOMINATOR RECOVERED`.

| Bucket | Wave 1 artifact | Wave 2 artifact | Executable result | Non-executable handling |
|---|---|---|---|---|
| `.claude` | `out-rh-A/REHUNT-LOT-A.md` | `out-w2-claude/REHUNT-W2-CLAUDE.md` | **56/56 executables** | Ledgered per file with reasons |
| `scripts / config / test` | `out-rh-B/REHUNT-LOT-B.md` | `out-w2-scripts/REHUNT-W2-SCRIPTS.md` | **117/117 executables** | Ledgered per file with reasons |
| `pipeline / src / root / docs` | `out-rh-C/REHUNT-LOT-C.md` | `out-w2-pipeline/REHUNT-W2-PIPELINE.md` | **51/51 executables** | Ledgered per file with reasons |
| `other` (`.playwright-cli`, `.ci`, `.githooks`, non-website) | `out-rh-D/REHUNT-LOT-D.md` | `out-w2-other/REHUNT-W2-OTHER.md` | **37/37 non-website executables** | Ledgered per file with reasons |
| **Combined** | | | **261/261 executables** | All non-executables ledgered |

**Notes:**
- 33 previously-missed denominator rows (lines 1902–1937) were recovered by wave 2; 32 are `website/` classification-only entries. Source: `out-w2-other/REHUNT-W2-OTHER.md § MISSED ROWS`.
- `website/` executables (3 S0 credential findings) are tracked but NOT claimed clean — owner ruled `website/` stale-but-retained and untouchable (see `## OWNER RULINGS`).
- Non-executables (config JSONs, markdown, plaintext, images, etc.) are ledgered with per-file reasons in each lot artifact and are NOT claimed clean; they are classification-only, not coverage-claimed.

---

## R-PHASE WAVE — 2026-07-30 (read-only council, 9 dispatches)

This wave ran under a decision-authority rule set by the owner: **workers read without limit, propose
in text, and change nothing; every create/update/delete is decided by the dispatcher or by the owner.**
Contract: `.claude/state/ua-worker/chips/q123/SHARED-R-PHASE-CONTRACT.md`.

### CORRECTED NUMBERS — supersedes every earlier open-count in this file

Machine reconciliation of the findings index against all 59 `out-*/` worker reports
(`out-r4-group/R4-OPEN-WORKLIST.md`):

| bucket | count |
|---|---|
| OPEN | **260** |
| APPLIED (formal status table, high confidence) | 22 |
| APPLIED (in an `*APPLIED*.md`, no formal table row — medium confidence) | 16 |
| UNRESOLVED (attempted, not completed) | 7 |
| NON-ACTIONABLE (refuted / keep) | 6 |
| REFUSED (reason preserved — must NOT re-enter the work pool) | 4 |
| DEFERRED | 1 |
| **total** | **316** (arithmetic balances) |

An earlier chat statement of "~106 remaining" was **wrong**. Applied-set trustworthiness was sampled:
10 findings re-checked against the real tree → 7 CONFIRMED, 3 inconclusive-by-grep, **zero false
APPLIED claims**. One of the three inconclusive (P2-LOT11-09, override ordering) is separately
confirmed applied — the dispatcher read the code and ran the 25/25 fixture suite directly.

⚠ **Denominator caveat, unresolved**: this reconciliation totals 316, but a raw row count of the index
returns 332. 16 rows were excluded as summary/`.bak` false hits. The exclusion list has not been
independently audited.

### NEW FINDING — credential copies outside their intended location (S1, verified by dispatcher)

`out-r1b-eviddir` found, and the dispatcher independently confirmed, three real credential files
duplicated inside a 988 MB worker-output directory `.claude/state/ua-worker/out/env-evidence-20260728/`:

| path | bytes |
|---|---|
| `.env.local.backup` | 1283 |
| `encore-copy/.env.local` | 1283 |
| `encore-copy/.env.e2e` | 852 |

**Never committed** — `git ls-files` on that tree is empty. But the only thing preventing a commit is
an entry in **`.git/info/exclude:9`**, which is a *local, per-clone, untracked* ignore file — not the
repo's shared `.gitignore`. On any other clone, or if that entry were removed, these become
committable. Owner decision required; deletion is the safe direction (fewer credential copies), and the
directory is fully reproducible by re-running its ticket. **Do not rotate — scrub/remove per standing
doctrine.**

### ⛔ OVERTURNED — the self-cleaner "READY FOR GO" is WITHDRAWN (settled 2026-07-30)

The author's seat **CONCEDED** the race (`out-c1-defend-race/C1-RACE-DEFENCE.md`). The earlier
READY-FOR-GO entry in this file is **withdrawn**. Do not register the sweeper.

The conceded interleaving, with `sweep.mjs` line numbers:

```
T1  A: openSync(lock,'wx') succeeds — file created EMPTY, A holds the fd      :102
T2  B: openSync(lock,'wx') throws EEXIST                                       :102
T3  B: parseLockRecord() reads 0 bytes → returns null                          :62-63
T4  B: isLockValid(null) → !record → false  (B concludes the lock is stale)    :72
T5  B: unlinkSync(lock) — A's fd is now orphaned                               :109
T6  B: openSync(lock,'wx') succeeds (POSIX freed the name)                     :110
T7  B: writeSync(record) — B's record is the one on disk                       :114
T8  A: writeSync(record) — writes into the orphaned inode, invisible           :114
T9  BOTH spawn detached children → DUPLICATE CONCURRENT SWEEPERS
```

**Why six adversarial rounds missed it**: on Windows, `unlinkSync` at T5 leaves the name occupied
until A's fd closes, so B's T6 `openSync` fails `EACCES` and B exits. The race is **accidentally closed
by Windows delete semantics, not by the design** — so it cannot reproduce on this machine, which is
where every round was reviewed. The code is still wrong.

Author's own recommendation: **hold, do not register.** Inert today; a file-moving hazard the moment
any rule promotes past announce. Fix = write the lock record so the file is never observable in a
created-but-empty state.

### (superseded) CHALLENGED — the self-cleaner "READY FOR GO" is disputed

An independent cross-vendor read (`out-r3-ctrl/R3-CONTROL-DECISIONS.md`, Decision 1) states the
self-cleaner's **initial lock acquisition still carries an empty-lock race**, after the six adversarial
rounds that produced this file's READY-FOR-GO entry. Treat that entry as **NOT settled** until the
author defends or concedes. Not yet dispatched.

R3 also disputes two other recorded recommendations:
- **HARD_STOP narrowing is cosmetic on its own** — because `canWrite()` short-circuits OWNER *before*
  the list is consulted, narrowing the list to `.env*` protects nothing unless `.env*` is checked
  ahead of the short-circuit.
- **The 245ms identity gate is optimisable** — R3 claims sub-200ms is reachable, so optimise before
  qualifying the cap (stronger than this file's earlier "bounded attempt, then platform-qualify").

### Fight resolved — the three-file annotation slice

Cross-vendor review returned REJECT on 2 defects; the author **conceded both with evidence** and
proposed exact corrections; the dispatcher approved both and dispatched a zero-discretion apply.
- Sampling instruction in `critic-prompt.md` was **unsatisfiable** (quota `ceil(n*0.1)` as a ceiling vs.
  a per-group minimum — 3 entries across 3 groups demanded both 1 and 3). Fixed by restating the quota
  as a floor.
- The comment added to `ship-branch.sh` **named the wrong file**: `DENY_GLOBS` is defined at
  `scripts/lib/forbidden-patterns.mjs:21` and merely imported by `verify-no-forbidden.mjs:32`.

Both corrections were applied by a zero-discretion U-phase dispatch and **byte-verified by the
dispatcher**: `bash -n` clean, ship path comment-only, `rotation.ts` untouched, no third file.

### ⛔ CLOSURE MEASUREMENT — 2026-07-30 (`out-recon2/RECON2-STATE.md`). NONE OF THE THREE CAN CLOSE.

Fable's closure requirement executed: reconciliation re-run with **both** halves machine-produced.

**Numerator is clean.** Every previously-APPLIED finding with a mechanically checkable condition was
re-verified against the real tree. **`NOT-FOUND: none` — zero.** Nothing this wave believes it applied is
missing from disk. The applied set is not overstated.

**Corrected split of the 260 OPEN** (supersedes the dispatcher's earlier ~92/~125 estimate):

| bucket | count |
|---|---|
| **DISPATCHER** (in-repo, no owner approval) | **~156** |
| **OWNER** (off-repo `~/.claude`/`~/.copilot`, protected surfaces, deletions) | **~97** |
| REFUSED (reasons preserved) | 4 |
| UNRESOLVABLE (FW3 root causes — need redesign, not retry) | 3 |

More is the dispatcher's than previously stated, not less.

#### ⚠ INFLOW EXCEEDS OUTFLOW 3:1 — the tap is not closed

`git ls-files --others --exclude-standard` counts **117 new debris files** since enumeration: 88 at repo
root (`100`, `accept-denom.mjs`, `test-regex.mjs`, worker litter `part-a-v2.js`/`part-b-*.js`/`part-c*.js`,
`grep.exe.stackdump`), 29 under `clients/encore/` (diagnostic PNGs, review artifacts, `diag.js`,
`playwright-report-graft-green/`), including a **path bug** producing a nested
`clients/encore/clients/encore/` tree.

**117 new files vs 38 findings applied.** Fable's Q4 warning is now a measured fact: a sweep whose inflow
exceeds its outflow has not succeeded. Closing the tap outranks grinding the remaining backlog.

#### Per-plan blockers

- **PLAN_REPO_SLOP_SWEEP** — 260 of 316 open; negative inflow ratio; off-repo findings need the Q2 split
  filed before its scope can be claimed complete.
- **PLAN_ULTRAAUDIT_FIX_WAVE** — waves 1+2 accepted but **uncommitted**; wave 3 **rejected** and its
  changes still dirty in the same tree, mixed with unrelated cross-session work; batches 4–5 are
  source-only while the running copies stay vulnerable.
- **PLAN_COPILOT_INTEGRATION_ULTRAAUDIT** — **this plan file is gitignored, so the closure gate cannot
  validate it at all.** Structural, and newly discovered.

#### The six unblockers (owner-gated except where noted)

1. Commit the accepted work with a **curated, path-explicit** file list — never `git add -A` on this tree.
2. File the off-repo successor plan and transfer ~86 findings **by ID** (Fable Q2, four conditions).
3. Clear the 117-file inflow, or record provenance for what stays.
4. Remediate FW3 (redesign exists) or descope it with a named recipient.
5. **Install the labor-gate fix** to `~/.claude/hooks/labor-gate.mjs` — until then both bypasses are live.
6. Work down or descope the remaining OPEN findings (~156 are dispatcher-side).

### TELEMETRY WIRED — loop-closer applied (batch 4), plus two discoveries

**Applied** (`out-u5-telemetry/U5-APPLIED.md`): shared `fireTelemetry(gate, verdict, target)` appended to
`.claude/hooks/lib/hook-utils.mjs`, wired into the three fully-dark gates. Fail-open by construction —
the whole body is `try { … } catch { /* swallow */ }`, so a telemetry failure can never become a denied
write; the state dir resolves module-relative, not cwd-relative.

Dispatcher-verified: all edited files pass `node --check`; identity fixtures **25/25**, todo fixtures
**10/10**; and **LIVE FIRE confirmed** — `u5-live-fire-test, 2026-07-30T14:54:22.399Z, announce,
u5-verify-session` is present in `gate-fires.log`. A helper that never fired would have been unproven.

⚠ **Dispatcher ticket error, caught by the worker**: the ticket named
`.claude/hooks/lib/labor-gate.mjs`, which **does not exist**. The real repo source is
`.claude/skills/ultra-agents/setup/hooks/labor-gate.mjs`; the *installed* copy is `~/.claude/hooks/labor-gate.mjs`
(off-repo). The worker located the source, edited it, correctly declined to touch the installed copy,
and disclosed the gap. **Consequence: the source fix is inert until installed — that install is an
owner action.** Third bare-path misresolution this wave.

#### DISCOVERY — the telemetry log is 78% one component's noise

`gate-fires.log` is **16.2 MB / 148,425 lines**. Top emitters:

| emitter | lines |
|---|---|
| `selfclean-P1-walk-dumps` | **115,334** |
| `check-recurrence-trial` | 22,318 |
| `selfclean-P10-state-churn` | 2,329 |
| `check-worker-fabrication` | 1,871 |
| `mistake-ledger-gate` | 1,829 |
| `delegation-nudge` | 1,778 |

The self-cleaner emits **one line per FILE EXAMINED**, not per verdict — e.g.
`selfclean-P1-walk-dumps, …, announce, .playwright-cli/page-….yml`. All 115k lines landed today between
08:45Z and 12:04Z, i.e. during its dry-run review rounds, **while it is not registered** (`settings.json`
contains zero `selfclean` entries — re-confirmed).

**This is a second, independent reason to HOLD the self-cleaner**, on top of the conceded duplicate-
sweeper race: registering it would continuously flood the very log Fable's ruling requires the ramp
criteria to be computed from. A demotion review over this log must filter 78% noise before it can count
anything. Per-file emission at announce level is itself a defect worth its own finding.

### VERIFIED GATE BYPASSES — both in `labor-gate.mjs`, both real (`out-rI-hooklibs/`)

**BYPASS 1 — identity scan direction (P2-LOT03-09). VERIFIED.**
`labor-gate.mjs:374` iterates `msg.content` **forward**, so the *earliest* identity call in a message
decides. `delegation-gate.mjs:265` was fixed to iterate **reverse** with an explicit `// PBUG-09` comment
so the *last* identity decides — **the fix was never propagated to labor-gate**. Both scan transcript
lines backward correctly; the defect is the inner content loop.

**BYPASS 2 — pipeline first-command only (P2-LOT03-17). VERIFIED.**
`labor-gate.mjs:265-282` — `segmentHasSpecExecution()` calls `splitPipeline(segment)` then inspects only
`pipelineParts[0]`. A gated command placed later in a pipeline is never classified and passes.

**Both live on the same file, and per the note above the running gate is the installed off-repo copy.**
Per Fable's carve-out, a live security control that silently does not work is an incident rather than a
backlog row: fix the repo source now, and the install is an owner action.

#### FIXED IN SOURCE — batch 5 (`out-u6-laborgate/U6-APPLIED.md`), with exploit proofs

Applied to `.claude/skills/ultra-agents/setup/hooks/labor-gate.mjs` (+18/−7, one file, `node --check`
clean). Each fix carries a demonstrated shape that previously passed and now does not:

- **FIX 1 (identity)** — a message whose `content` holds `[identity builder, …, identity OWNER]`. The
  true identity is OWNER (the last call). *Before*: the forward scan hits `builder` first,
  `PIPELINE_IDENTITIES.has("builder")` is true, the caller is treated as a pipeline worker → **ALLOW**.
  *After*: the reverse scan hits `OWNER` → **DENY**. Mirrors `delegation-gate.mjs`'s PBUG-09 fix.
- **FIX 2 (pipeline)** — `echo dummy | npx playwright test some.spec.ts`. *Before*: only
  `pipelineParts[0]` (`echo dummy`) was inspected → **ALLOW**. *After*: every part is classified,
  `npx playwright test …` is caught → **DENY**. Also newly caught: `true | npx playwright test`,
  `cat /dev/null | playwright-cli navigate …`.

**Severity note**: FIX 2 means *any* gated command could be walked past the gate by prefixing it with a
trivial pipe segment. That is a one-token bypass of the labor gate, not a subtle edge case.

⚠ **THE RUNNING GATE IS STILL VULNERABLE.** Only the repo source is fixed. The executing copy is
`~/.claude/hooks/labor-gate.mjs`, outside this repo and untouched by design. **Installing it is an owner
action and is the step that actually closes both bypasses.**

### FABLE RULINGS — 2026-07-30 wave (binding on executors)

Consulted per the owner's standing instruction. It **corrected the dispatcher's premise on Q1** (see the
corrected gate-posture section below) before ruling.

**Q1 — the guardrail layer.** Not theater; a young lifecycle with one belt off the flywheel. Decisions:
1. **Wire the shared `fireTelemetry()` helper into every dark gate lib — the highest-leverage single
   finding in the wave.** Dark telemetry makes every "N clean sessions, zero false positives" criterion
   *unfalsifiable*: silence from an uninstrumented gate is not evidence.
2. **No bulk promotion.** Rewrite each ramp criterion as a machine-computable query over
   `gate-fires.log`. `doctrine_ledger` promoted because its criterion was a countable number; vibe
   criteria counted by nobody stall forever.
3. Pull the identity-gate knob into the enforced config with a **dated** target, or promote it now — it
   has had five weeks of the observation it asked for.
4. **Delete `uplink_mode`** — a confirmed silent no-op. "A control that advertises enforcement it cannot
   perform is worse than no control."
5. Let `check-ramp-expiry.mjs` force the binary at each August deadline: promote, extend-with-written-
   justification, or delete. **"Announce is a transit state with a 30-day visa, never a residence."**

**Q2 — the ~92 off-repo findings: SPLIT them out.** The principled line is **verification domain, not
effort**: a plan may only contain work its own closure gate can attest, and the repo's closure machinery
cannot attest `~/.claude` state. Keeping them means self-asserted DONE for a third of the wave — the
exact false-green class this quarter was spent exterminating. Honest **iff all four hold**:
1. All ~92 transfer **by finding-ID**, zero silently dropped, successor denominator = the same
   re-runnable reconciliation, not a hand-copied list.
2. The successor plan is filed **in the same motion** as the descope, before any parent flips DONE.
3. Parent closure text names and links the split — the trail shows a transfer, not a disappearance.
4. The successor gets an owner-cadence (these need per-item approval; batching them into a repo wave
   guarantees rubber-stamping or stall).

**Carve-outs**: the non-functional security gate (operator-precedence bug) does **not** wait for plan
lifecycle — a live security control that silently doesn't work is an incident, not a backlog row. The
~20 backup deletions go **last**, after the surface is stable — deletion on the owner's machine is the
one irreversible class.

**Q3 — reject the prompt dedupe as specified.** Principle: **in prompts, position is semantics — DRY the
authority, never the salience.** DRY works in code because the runtime treats copies identically; a
prompt's runtime is *attention*. Replacing an early prominent rule with a pointer to a later complete one
demotes a constitutional rule to reference material — "a hard stop contingent on the model electing to
follow a link is not a hard stop." Fix the drift **downhill instead**: shared file stays canon for
content; propagate the fuller canonical text **into** the six HARD STOPS blocks, preserving deliberate
role-scoping, tagging each with its canonical rule ID.

**Decision rule for the remaining ~30 PROMPT proposals — two questions each:**
1. *Does position/prominence do behavioural work?* Top-of-prompt / HARD STOPS / checklist-at-the-
   decision-point = **yes**. Reference tables, examples, background = **no** → dedupe freely.
2. *Which way does the merge flow?* Canon → instantiation (completing the prominent copy) = **accept**.
   Instantiation → pointer (deleting an early copy for a later reference) = **reject as
   prompt-weakening**, regardless of token savings.

**Q4 — unasked, and the most important: this wave measures STOCK; nothing in it closes the tap.**
Fresh debris is accumulating *while the sweep runs* (`100`, `part-a-v2.js`/`part-b-*.js`/`part-c2.js`
worker litter, `grep.exe.stackdump`, `out-e2e/ out-lots/ out-merge/`, a nested `clients/encore/clients/`
path bug, stray PNGs). And three mega-audit plans coexisting in `pending/` **is itself the recurrence** —
by §3.5 doctrine, wave 3 existing convicts waves 1–2. Consequences:
- The loop-closing findings (telemetry wiring, ramp adherence, machine-computable criteria) are **not 3
  of 260** — they decide whether this is the last wave or the third of N. **Sequence them first.**
- Wave closure must be **re-run the reconciliation → 0 open** (machine denominator *and* numerator), not
  a hand-ticked list.
- **Dispatcher warning**: 260 sequential approvals through one person is a rubber-stamp gradient; by the
  end of the wave the weakest gate in the system is the dispatcher. Accept by category, sample-deep-
  verify, re-run the grep behind every claim.

### APPLIED VIA DECISION — batch 1 (9 proposals, dispatcher-approved, verified)

The four proposal lots were collated into `out-consolidate/DECISION-SHEET.md`: **137 proposal rows**
grouped by risk class (PROSE / PROMPT / DEAD-CODE / LOGIC / CONFIG / CLOSED-RECORD). The dispatcher
approves by row number; a zero-discretion U-phase applies the approved list verbatim.

**Batch 1 — approved and applied** (`out-u2-deadcode/U2-APPLIED.md`):

| row | id | file | change |
|---|---|---|---|
| 37 | P25-M18 | `validate-plan-closure.mjs:693` | NUL `\x00` → `\x01` in PLACEHOLDER (a sentinel — replaced, not removed) |
| 30 | P25-M15 | `validate-plan-closure.mjs:202-206` | delete dead `isInFencedCodeBlock` |
| 31/32 | P25-M16a/b | `validate-plan-closure.mjs:27,28` | drop unused `statSync` / `extname` imports |
| 33/34/35 | P25-M16c/d/e | `validate-plan-closure.mjs:40,41,573` | delete `SCHEMA_PATH`, `LANDED_AT_PATH`, `ACCEPTANCE_HEADINGS` |
| 16 | P2-LOT16-03 | `ticket-doctrine-from-scope.mjs:246` | drop deprecated `_repoRoot` param + JSDoc |
| 28 | P25-M14 | `plans-reindex.mjs:383-396` | delete dead `sortPending` |

**Five of the nine anchors were STALE** — the cited line was wrong and the actual line was used. That is
the norm on this index, not the exception.

**Verification (dispatcher-run, not worker-claimed):** NUL confirmed gone from the byte buffer; all
three files pass `node --check`; the gate **executes** — `--dry-run` on a real plan returns
`[PASS] … EXIT=0`; and its own suite returns **`Self-test: 28 passed, 0 failed, 28 total`, exit 0**.
Diff is confined to the three files (`-15`, `+1/-2`, `+5/-14`). Worker reported no objections.

Ordering mattered and was part of the approval: the NUL fix had to land first, because while the NUL
was present the file classified as binary to line-based tooling.

**Batch 2 — approved and applied** (`out-u3-annotations/U3-APPLIED.md`): rows 4, 5, 8, 9, 11, 15 —
six annotations on `plans/done/` records (`SUBPLAN_LCD_05`, `SUBPLAN_LCD_06`, `PLAN_CHAIN_PER_SESSION_ORCHESTRATION` ×4).

Verified by the dispatcher: **every original sentence survives verbatim** — the annotation is appended
inline (`*(Annotation 2026-07-30: …)*`), never a rewrite; one is a new blockquote line. No `Status:` or
`**Executed**:` line changed; `validate-plan-closure.mjs` still returns `[PASS]` on the edited plan.
Diff confined to the three files.

**Refusals honoured, not overridden**: rows 3 (needs a new lint mechanism — belongs in its own plan),
7 (the finding itself says no action), 10 (already in that plan's Execution Summary). Row 12 —
trimming a 2,816-line raw transcript out of a closed plan — is reserved for the owner.

**Held pending the Fable consultation**: the ~30 PROMPT-class rows (text consumed by agents at
runtime). Deduplicating them is exactly what that consultation's question 3 decides, so approving them
first would pre-empt the answer.

### CORRECTION TO A BINDING RULE — LR-069 §3.4's own KNOWN-GAP note is wrong

`.claude/rules/guardrail-policy.md` §3.4 carries a ⚠ KNOWN-GAP stating that only `check-md-first.mjs`
and `check-mistake-ledger.mjs` emit fire telemetry and "the other ≥8 deny/announce gate libs are DARK
— they never append to `gate-fires.log`".

A per-file verification (`out-rJ-telemetry/RJ-TELEMETRY-PROPOSALS.md`, grepped rather than assumed)
shows that is **not accurate**:

| state | gates |
|---|---|
| **FULLY LIT** (deny + announce) | `check-md-first`, `check-mistake-ledger`, **`check-identity-switch`**, **`delegation-nudge`** |
| **DENY-ONLY** (emits on deny, silent on announce) | `check-plan-closure`, `check-no-verify`, `check-graft-ship`, `check-browsertool`, `check-bug-baseline`, `check-jargon`, `check-todo-injection` |
| **FULLY DARK** (no telemetry at all) | `check-rca-verdict`, `check-execution-completion`, `labor-gate` |

So the real blind spot is **narrower and differently shaped** than documented: announce-mode verdicts on
seven gates, plus everything on three. A deny-gate with genuine fires does show them, which means the
§3.4 demotion review is less likely to wrongly retire a live deny-gate than the note warns — but an
`announce`-mode gate can still look dead. Given the knob inventory below, that matters: nearly every
ramp knob is sitting at `announce`.

**The rule's note should be corrected as part of this wave.** Recorded here, not yet applied.

⚠ **Soft spot in that same report**: its `## HOT-PATH COST` section is reasoned, not measured — it cites
`appendFileSync` being "<1ms per call" as a well-established benchmark rather than timing the real hook.
The conclusion is very likely right, but it does not satisfy the measured-evidence bar and must not be
cited as a measurement.

### LIVE GATE POSTURE — ⚠ CORRECTED 2026-07-30, my earlier reading was WRONG

**Retracted claim**: an earlier version of this section (and a chat report) said "almost the entire
guardrail system is observing rather than enforcing… only one knob ever promoted… sitting in announce
for months." **That is false on three counts.** It came from reading a worker's reformatted inventory
table instead of the raw config — the table's "ramp_target" column showed the target *state* (`deny`),
while the real `*_ramp_target` field holds a **date**. I propagated a systemic conclusion from a
secondary summary without opening the file. Corrected below from `.claude/guardrail-config.json` and
`.claude/identity-gate-config.json` directly.

**What is actually true (verified, today = 2026-07-30):**

- **Ramp targets are DATES, and every one is still in the future**: 08-09 (`md_first`,
  `mistake_ledger`), 08-10 (`stall_guard`), 08-11 (`depth_gate`, `reject_oracle`, `toothless_surface`,
  `uplink`), 08-12 (`reviewer_skill_compliance`), 08-21 (`unresolved_probe`), 08-22
  (`doctrine_ledger`), 08-24 (`recurrence_trial`, `interaction_coverage`), 08-29
  (`fixture_provenance`). Nothing is overdue.
- **Ramp starts run 2026-07-10 → 2026-07-30** — three weeks, not months. One landed *today*.
- **Multiple gates are enforcing**, not one: `doctrine_ledger_mode` = `deny` with
  `ramp_complete: true` (promoted 07-23 when its machine-checkable criterion hit 66/66),
  `tc_fieldinventory_mode` = `deny` (born enforcing), plus `coverage_mode` = `deny` in
  `closure-config.json`.
- **The lifecycle is machine-enforced**: `scripts/check-ramp-expiry.mjs` (7.3 KB) caps ramp spans,
  fails on overdue announce, and requires a written justification to move a target later.

**So the layer is a young, managed lifecycle — not theater.** The pattern worth learning from:
`doctrine_ledger` promoted precisely because its criterion was a machine-countable number. Criteria
phrased as "N clean sessions with zero false positives" have no counter and cannot promote themselves.

**The genuinely stalled knob is the one OUTSIDE that machinery**: `.claude/identity-gate-config.json`
has `ramp_started: 2026-06-25` and **`ramp_target: "deny"` — a state, not a date**. Five weeks old, no
deadline, and it lives in a file `check-ramp-expiry.mjs` does not read. Enforcement works where it is
wired; the stalled knob is the unwired one.

**Confirmed dead control**: `uplink_mode` is a documented silent no-op — its own
`_uplink_mode_KNOWN_GAP` states the wrapper hardcodes the literal `announce` and no `enforce` code path
exists, so flipping it does nothing. Its own note says "if still unused later it gets removed anyway."

No proposal in that lot flips a knob — correctly, since a ramp promotion is a behaviour change, never a
cleanup.

### FW3 ROOT CAUSE — a TOCTOU in `readState()` that reaches past fix wave 3

`out-r5-fw3redesign/R5-FW3-REDESIGN.md` ran the LR-069 §3.5 prior-fix trial and returned
**CONVICTED (`scoped-wrong`)**. It is a materially better diagnosis than the review's:

- **FW3-01** — the wave applied a *uniform* "state-op fails → pause the chain" policy to 8 sites. At
  `chain-orchestrator.sh:287` that write happens **after** the `nohup claude -p … &` spawn, so pausing
  records `paused` while the child is alive; the child's Stop hook then sees `.status != running` and
  exits, losing the verdict. A post-spawn advisory write was treated like a pre-spawn critical read.
- **FW3-02** — **line 111 was never guarded at all.** The wave fixed 8 sites and missed the 9th, leaving
  the pre-existing `|| echo 'unknown'` fallback in place. So this is not "the new check misbehaves", it
  is "the new check was never applied to the most dangerous site".
- **The underlying mechanism** (this is the part worth keeping): `cs_get` → `chain-state.mjs`
  `readState()` at `:19-22` does `existsSync(file)` then `readFileSync(file)`. A concurrent `cs_set`
  writes tmp + `renameSync`. On this repo's Windows/NTFS runtime that rename has a metadata window in
  which `readFileSync` throws `ENOENT`/`EPERM`, crashing the Node helper with exit 1. **Any** state read
  can hit this, not just the chain orchestrator — treat it as a shared-infrastructure defect.

Proposals only; nothing applied. Proven mechanically — the three fix-wave-3 files stamp `14:35:32`
while the run window was `19:05:12–19:12:34`.

---

## FIXES APPLIED

All fixes are in the working tree, unstaged, not committed. Sources: fix-wave FIXWAVE*-APPLIED.md and review CONFIRM-*/FINAL-* artifacts in the chips directory.

> **⚠ THE WORKING TREE IS NOT A COMMIT-READY UNIT (verified 2026-07-30).** `git diff --name-only`
> returns 46 files, and it is tempting to read that as "the accepted fix-wave output". It is not.
> The 46 are a **mixture** of at least three kinds of change:
> 1. **Accepted** fix-wave 1 + 2 output (reviewed ACCEPT).
> 2. **Rejected** fix-wave 3 output — `pipeline/scripts/healer-post-complete.ts`,
>    `pipeline/server/db/queries.ts`, `.claude/hooks/chain-orchestrator.sh` are all present and dirty
>    despite the REJECT verdict above.
> 3. **Unrelated work from concurrent sessions** — e.g. `SUBPLAN_CORP_PRICING_NM2271/2272/2273`,
>    `SUBPLAN_OPI_G_MIGRATE_CORP_PRICING.md`, `daily-status-bank.json`, and skill/fixture edits that
>    were already dirty at this session's start.
>
> Therefore **`git add -A && git commit` on this tree is unsafe**: it would commit a rejected fix wave
> and unrelated cross-session work under a fix-wave message. Any commit here requires a curated,
> path-explicit file list, decided per file. The chief-of-staff decomposition recommended committing
> all 46 as "accepted work"; that recommendation rested on its own disclosed-but-unverified assumption
> and is **REFUTED** by the file list above.

| Wave | Files changed | Defects closed | Review verdict | Hops |
|---|---|---|---|---|
| **Fix wave 1** | `pipeline/worker/index.ts`, `pipeline/orchestrator/orchestrator.ts`, `scripts/ship-client.sh`, `scripts/validate-plan-closure.mjs` | S0: post-complete gate returning `success: true` on failure; orchestrator success-fallback routing; failed gate terminating as `completed`; spoofable gate field read from agent stdout; scalar-stdout crash | **ACCEPT** (`out-review3/CONFIRM-HOP5.md`) | 5 hops (2 REJECTs → dispatcher redesign → 2 confirm rounds) |
| **Fix wave 2** | `scripts/setup/setup.sh`, `scripts/setup/setup.bat`, `scripts/pipeline-orchestrator.ts`, `scripts/task-context-builder.ts`, `scripts/ship-client.ps1` | S0/S1: both setup scripts exiting success on failed steps; missing Claude CLI treated as successful dry-run; `--json` swallowed as positional; PowerShell ship path missing env template and `--require-env-local`; three `runSingleStage()` callers swallowing failures | **ACCEPT** (`out-review-fw2c/FINAL-FW2.md`) | 4 hops (3 REJECTs → final accept) |
| **Fix wave 3** | `pipeline/scripts/healer-post-complete.ts`, `pipeline/server/db/queries.ts`, `.claude/hooks/chain-orchestrator.sh` | Require path resolving to nonexistent module; invalid SQL when `clientId` absent; 9 discarded `cs_get`/`cs_set` exit codes | **REJECT** (`out-review-fw3/REVIEW-FW3.md`, cross-family, corrected 2026-07-30) — **2 defects UNREMEDIATED**, both in `chain-orchestrator.sh`: **FW3-01** (`:281-288` — `cs_set` of the child pid returns non-zero after the spawn succeeds, so the chain records `status=paused / state-write-failed` while the child keeps running; that child's Stop hook then exits early because `.status` is no longer `running`, and its verdict is never recorded). **FW3-02** (`:111,128-129` — `cs_get` of the queue file fails despite a valid `currentIndex`, yielding `current_file=unknown`; the ownership check returns `no` and the hook exits 0 without pausing, leaving the chain stuck in `running`). | 2 (applied → REJECTED; needs redesign) |

Sources: `out-fixwave1/FIXWAVE1-APPLIED.md`, `out-fixwave2/FIXWAVE2-APPLIED.md`, `out-fixwave3/FIXWAVE3-APPLIED.md`, `out-review3/CONFIRM-HOP5.md`, `out-review-fw2c/FINAL-FW2.md`.

---

## KNOWN DEBT — NOT FIXED

These findings exist in the working tree or codebase and were explicitly NOT fixed. Reasons are stated. A future session must not assume these are clean.

| Finding | Path:line | Severity | Reason not fixed |
|---|---|---|---|
| Rule-hierarchy inversion in requirements-agent context | `config/context-builder-prompts.json:5` | S2 | Owner judgment call — deliberately not auto-fixed. Needs per-item GO to change. |
| Hardcoded `admin`/`admin` fallback with false `_source` claim | `src/common/credential-loader.ts:102-103` | S1 | Belongs to slop-sweep Lot C2; needs per-item owner GO before any credential-touching change. Source: `out-rh-C/REHUNT-LOT-C.md` finding RH-C-05. |
| Three credential S0s in website backend | `website/backend/src/routes/auth.routes.ts:100`, `website/backend/src/routes/ai-provider.routes.ts:29`, `website/backend/src/middleware/tenant.middleware.ts:5` | S0 | Owner ruled `website/` stale-but-retained and untouchable. Recorded as accepted debt, not fixed. Source: `out-rh-D/REHUNT-LOT-D.md` findings RH-D-01/02/03. |
| `render.yaml` / `docker-compose.yml` reference nonexistent build scripts | `render.yaml:7,29,30`, `docker-compose.yml:24` | S1 | Tracked as RH-C-02/03/04; `website/` and render infra are owner-ruled untouchable. FIX_WAVE Open Decision 9 covers this. Not fixed this sweep. Source: `out-rh-C/REHUNT-LOT-C.md`. |

---

## OWNER RULINGS

Binding decisions made by the owner. Executors must not override these without explicit new GO.

| Ruling | Scope | Binding since | Source |
|---|---|---|---|
| `website/` is stale-but-retained and **untouchable** | All `website/` subtree files including backend S0s | 2026-07-29 | `out-recon-slop/TRI-STATE.md § OWNER DECISIONS`; SLOP_SWEEP decision (c) |
| `plans/done/` stays — **640 files retained**, Lot B5 removed from queue | All 640 `plans/done/` files | 2026-07-29 | `out-recon-slop/TRI-STATE.md § OWNER DECISIONS`; SLOP_SWEEP decision (b) |
| Coverage: **continue to depth** | All four coverage buckets | 2026-07-30 | Context pack — explicit owner GO |
| 19 protected bak files: **archive, do not delete** | See COLLISION MATRIX Part 2 for the full 19-row set | 2026-07-30 | `out-rh-E/OFFREPO-COLLISION.md § COLLISION SET`; `out-goready/GO-READY-BATCHES.md § BATCH B-BAK-PROTECTED` |

---

## FABLE RULINGS — the three delegated decisions (2026-07-30)

Rutvik's standing directive names fable as the tiebreaker for judgment forks. UA-1 / UA-2 / UA-3 sat
UNANSWERED in `PLAN_COPILOT_INTEGRATION_ULTRAAUDIT` and blocked Phase 5. Consulted with the ledger's
real numbers; verdicts below are **binding on executors** and were reached without touching the repo.

### UA-2 — fix-wave autonomy → **AUTO-APPLY Categories A and B**

Per-item owner approval is rejected: 12 of 13 defects so far were caught by the cross-provider review,
not the author, so the review loop is the demonstrated filter. 35 owner interrupts would produce
approval fatigue — weaker protection than the one deep review of the consolidated unstaged diff he
gets anyway, since nothing commits.

Apply mechanically, per finding:

1. **Cat A** — auto-apply iff the round ends PASS, or CONCEDE → refix → re-PASS.
2. **Cat B** — auto-apply iff rule 1 AND the wave battery is green AND **≥1 battery probe with a valid
   payload actually exercises the changed behaviour** (trips the changed gate/branch — absence of a
   deny proves nothing). No covering probe → write the probe as part of the fix. Cannot write one →
   OWNER QUEUE.
3. Any Cat B round ending in **sustained-DEFEND** (author overrules reviewer) → OWNER QUEUE. Two seats
   cannot break their own tie, and the 12/13 prior says the reviewer is usually right.
4. C / D / protected-surface → owner, always. Unchanged.

### UA-3 — efficacy floor → **FULL BATTERY BOTH SIDES**

All ~135 probes pre AND post. No sampling, no after-only. "Zero pre-green→post-red" is a delta claim
and a delta needs two endpoints; after-only cannot tell "the fix broke it" from "it was already red",
which is lying by construction against the plan's own acceptance criterion. The pre-pass also
inventories already-red probes so they are reported honestly instead of silently absorbed.

- Pre-side E2E dispatch **may** be satisfied by an existing tee'd green E2E artifact from the same HEAD
  with no intervening change to runtime or shipped paths. Otherwise run it.
- Post-side E2E: always run fresh, never skippable.
- Do **not** pre-emptively checkpoint the battery per lot. On any green→red, bisect by lot (~6 runs
  worst case) — attribution cost is paid only on failure.

### UA-1 + Phase 6 — **apply LCD_07 before the pre-battery; do NOT write the pruning doctrine**

Sequencing: LCD_07 lands inside the baseline, so one pre-pass does double duty — validates the patch
and baselines the wave. Folding it into the wave destroys attribution; parking it invalidates the
wave's verification the moment it lands. **Caveat that applies here: LCD_07 is staged under
`~/.claude/delegation/`, which is protected control surface — so by the standing rule it waits for
Rutvik regardless of this sequencing preference. It is on his menu, not in the executor's hands.**

Phase 6, verbatim posture: the generalized doctrine is the artifact that reads well and rots. Phase 6
already demonstrated this — asked for doctrine, it produced one concrete script, and that is the
correct output shape. Replace it with:

- **(a)** a one-page machine-readable **registry** of every accumulating surface — surface, pruner-or-NONE,
  and the incident that justified it. The registry IS the denominator; without it "prune when it hurts"
  is discovered by pain, which is how slop accumulates in the first place.
- **(b)** one concrete pruner per surface, each with its own trigger and test, built only on evidence.

Trigger for building a pruner: **the surface was implicated in a real defect/RCA, or it blocked a
battery run.** Never a size or age threshold someone invented — invented thresholds are the next defect.

Sequence: Phase 5 fix wave first (it gates everything); the registry after, it is cheap.

> **Scope amendment — needs Rutvik, not fable.** Renegotiating Phase 6's acceptance criterion from
> "pruning-policy v2 doctrine" to "registry + evidence-triggered pruners" changes what the plan
> promises. Fable was explicit that this goes to the owner as one batched line rather than being
> absorbed silently. It is on the decision menu.

---

## C3 PENDING-PLAN TRIAGE

Source: `out-c3/C3-PENDING-PLAN-TRIAGE.md`. Classification only — nothing was moved, edited, or deleted.

**137 files in `plans/pending/`** classified into four buckets:

| Bucket | Count |
|---|---|
| keep-as-is (active, still valid) | 87 |
| needs refining (stale or incomplete) | 31 |
| vision worth salvaging (good idea, never started) | 11 |
| useless (orphaned, no value) | 8 |
| **TOTAL** | **137** |

**Anomalies (4):**
1. `PLAN_ULTRA_AGENTS_COPILOT_WORKER.md` — Status `DONE (2026-06-22)` but still in `pending/`; should be in `plans/done/` per LR-027.
2. `SUBPLAN_REPO_08_RENAME_JBS.md` — declared parent `MASTER_REPO_CLEANUP` does not exist anywhere on disk.
3. 3 plans cite deleted `scripts/verify-vendor-fresh.mjs` as an operational dependency: `PLAN_PUSH_NOTES_LATEST_TO_DELIVERABLES_TEST.md`, `PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md`, `PLAN_SHIP_TO_ENCORE_DELIVERABLES_TEST.md`.
4. 8 subplans whose parent is in `plans/done/` (orphaned children) — see `C3-PENDING-PLAN-TRIAGE.md § ANOMALY 4` for full list.

---

## GO-READY BATCHES

Source: `out-goready/GO-READY-BATCHES.md`. 6 batches prepared, awaiting owner GO.

| Batch | Items | Size | Reversible? | Action |
|---|---|---|---|---|
| **GO B-BAK-PROTECTED** | 19 | 170 KB | Yes (archive move) | Archive 19 protected bak files |
| **GO B-BAK-REST** | 23 | 207 KB | Yes (archive move) | Archive 23 unclassified bak files |
| **GO B-CATA-REPO** | 282 proceed + 5 HOLD | ~623 MB | Mixed (tracked=git-reversible; 2,322 untracked=IRREVERSIBLE) | Delete in-repo Cat-A debris (A1-A5) |
| **GO B-ORP-TEMP** | 7 stale dirs | ~500 MB | IRREVERSIBLE | Delete stale temp scratch dirs — COLD WINDOW ONLY (no Claude/Copilot processes running) |
| **GO B-D3** | 2 items | ~673 MB | git-reversible | Remove stale worktree + `jest.config.ts` |
| **GO B-D1** | 4 files (scrub) | 0 net | git-reversible | Replace credentials with `[REDACTED]` |

**Live-job hazard**: `B-ORP-TEMP` must not run while any Claude/Copilot process is running. 13 `claude` + 7 `copilot` processes were active at measurement time (2026-07-30 ~11:35 IST). Source: `out-goready/GO-READY-BATCHES.md § LIVE-JOB HAZARD`.

---

## CONFIRMED BY DISPATCHER

The following facts were independently verified by the dispatcher against disk (2026-07-30) and are stated here as CONFIRMED:

1. **CONFIRMED**: `~/.claude/hooks/lib/` does NOT exist. The repo-local `.claude/hooks/lib/` DOES exist with 23 files (12 of them `check-*.mjs`). Source: `OFFREPO-COLLISION.md § FW-B3 PATH TRUTH`.
2. **CONFIRMED**: 42 bak files across `~/.claude` and `~/.copilot` — not the 40 the plan claimed (+2 delta from post-measurement creation). Source: `OFFREPO-COLLISION.md § BAK INVENTORY / Count reconciliation`.
3. **CONFIRMED**: `PLAN_REPO_SLOP_SWEEP.md:114-115` lists `~/.claude/delegation/gates/` and `~/.copilot/agents/` as NEVER-TOUCH. 11 of the 19 collisions sit inside them (1 in `gates/`, 10 in `agents/`). Source: `OFFREPO-COLLISION.md § COLLISION SET`.
4. **CONFIRMED**: `pipeline/worker/index.ts:525-536` — gate failure recorded at :529 (`_postCompleteGatePassed = false`), then `resolve({success: true})` at :536. S0 confirmed. Source: `out-rh-C/REHUNT-LOT-C.md`, finding RH-C-01.
5. **CONFIRMED**: `scripts/validate-plan-closure.mjs:4` documents `--enforce` as READ-ONLY. `:1242` calls `recordAttempt()` which writes a JSON file on every FAIL — state mutation during a documented read-only command. S1 confirmed. Source: `out-rh-B/REHUNT-LOT-B.md`, finding RH-B-01.
6. **CONFIRMED**: Denominator file `.claude/state/ua-worker/slop0-enum-0718-artifacts/denominator.md` exists (251,377 bytes, mtime 2026-07-18). Measured line count: 1,901. Entry count: 1,853 (48-line surplus is headers/separators/blanks, consistent). **Stale as of 2026-07-30** — commits have landed since 2026-07-18. Re-run enumerator and diff before certifying any sweep complete. Source: `out-recon-slop/TRI-STATE.md § DENOMINATOR CHECK`.
7. **CONFIRMED**: The 1,901 figure is a NON-BLANK count; the plan's "1,901 non-blank" annotation is correct and must not be used as a line offset (doing so silently drops the final ~36 rows, including website/frontend entries such as `src/data/jiraconfig.txt`). Source: `PLAN_REPO_SLOP_SWEEP.md:22` (staleness note) + `TRI-STATE.md § DENOMINATOR CHECK`.

---

## OPEN OWNER DECISIONS

Consolidated from all three plans. An unanswered decision means that lot waits — it does not proceed on a guess.

### ✅ READY FOR GO — Lot C1 self-cleaner (6 rounds, cross-provider ACCEPT, 2026-07-30)

Built, adversarially reviewed, and repaired across six rounds. Final verdict from the cross-provider
reviewer: **ACCEPT, zero defects, READY TO REGISTER: YES.**

What each round caught (every one found something the previous had missed):

| round | finding |
|---|---|
| 1 build | — |
| 2 review | fixture-suite claim covered 1 of 5 files; timing unproven; root-scratch wildcards matched nothing observed |
| 3 defence | fixture failures proven PRE-EXISTING by stash/run/restore; wildcards narrowed to observed dirs only |
| 4 dispatcher | budget defended as "met on Linux" — **this machine is Windows**; stale path measured ~16 s, blocking |
| 4 fix | detached self-respawn → stale path 12,000 ms → 144 ms |
| 5 review | **S0** — two sessions 25 ms apart spawned two file-moving sweepers over one quarantine |
| 5 fix | atomic `openSync('wx')` single-flight lock, PID-liveness reclaim, no invented timeout |
| 6 review | **wedge** — an empty `sweep.lock` stuck the sweeper permanently; reviewer built it and proved it |
| 6 fix | complete-or-absent lock record (PID + process start time) via temp-file + atomic rename |
| 6 close | ACCEPT — all 5 lock-write sites audited, both new writes confirmed temp+rename |

**Posture on landing**: every rule in `announce`, nothing quarantined, never-sweep list covers
`website/`, chain-sessions, memory, `*.bak*` and all tracked files. Latest announce sweep reports
~1248 items / ~165 MB — nothing moved, but that is the population a future promotion would act on.

**The one remaining action is the owner's**: registering the hook. **The worker's proposed
registration line in its own `## ASK` is the WRONG SHAPE for this repo** (it proposed a flat object
with an `"event"` key; `.claude/settings.json` uses matcher-blocks). Dispatcher-verified correct form —
append to the `hooks` array inside the existing `SessionStart` matcher block, beside
`chain-pause-notice.sh`:

```json
{ "type": "command", "command": "bash .claude/hooks/selfclean-sweep.sh" }
```

Until that line is added the hook is inert — the files sit on disk and nothing invokes them.

---

### ⚠ STANDING BUDGET VIOLATION — the identity PreToolUse gate is ~45ms over cap (surfaced 2026-07-30, q123)

LR-069 §3.4 caps PreToolUse at **≤200ms** and states plainly: *"a gate that exceeds its layer's budget
moves DOWN a layer; it does not ship over-budget."*

Measured on the **real wrapper path** — `$stdin | bash .claude/hooks/identity-switch-gate.sh`, allow-path
OWNER edit — not on node in isolation (measuring node directly was the error that hid this all session):

| tree state | N | median |
|---|---:|---:|
| pre-refactor (stashed to committed HEAD, no `hook-utils.mjs`) | 10 | **245 ms** |
| post-refactor (current, with the shared import) | 10 | **249 ms** |

**Delta +4 ms — noise.** Verdict: **PRE-EXISTING.** The q123 extraction did not cause this; the gate was
already ~45 ms over cap and has been for some time. Every earlier timing claim in this session that
cited `node --check` or a direct import measured the wrong thing and understated the real cost.

**Disposition is the owner's, not an executor's** — §3.4's remedy is to move the gate down a layer, and
that changes *when* identity is enforced (write-time versus commit-time), which is a policy call.
Options: (a) move it down a layer per §3.4 as written; (b) profile and optimise the wrapper to fit the
cap — the ~245 ms is dominated by shell + Node startup on Windows Git Bash, so this may not be
reachable; (c) raise or platform-qualify the cap, acknowledging the number was set without a Windows
measurement. *Recommendation: (b) first as a bounded investigation, then (c) if 200 ms is simply not
achievable through a bash wrapper on this platform — but do not leave it silently over-budget, which is
the state it has been in.*

---

### ⚠ DESIGN CONTRADICTION — OWNER can write every HARD_STOP file (surfaced 2026-07-30, q123)

Finding **P2-LOT15-04** asked for the `HARD_STOP` check to move *before* the OWNER short-circuit in
`canWrite()` (`scripts/identity-ownership.mjs:297-300`). The worker **REFUSED** it, correctly, because
LR-043 §A says OWNER bypasses §2 entirely. But the finding was also right that a hole exists. **Both
sources are internally consistent and they contradict each other**, so no executor can resolve this —
it is an owner decision.

Dispatcher-verified by executing the module (not by reading it):

| path | `canWrite("OWNER", …)` | `canWrite("GIVER", …)` | `ownershipFor` |
|---|---|---|---|
| `clients/encore/.env.local` | **true** | false | `HARD_STOP` |
| `package.json` | **true** | false | `HARD_STOP` |
| `tsconfig.json` | **true** | false | `HARD_STOP` |

The two authorities in conflict:
- `scripts/identity-ownership.mjs:24-26` — *"the universal HARD STOPS list — `.env*`,
  `playwright.config.*`, `package.json`, `tsconfig.json`, `.ci/*`. **No identity writes these; only
  humans.**"*; `:235` — *"HARD_STOPS → 'HARD_STOP' (**never writable by any identity**)"*; `:252`
  reason string — *"Human-controlled file — no identity writes"*.
- `.claude/rules/hooks-identity.md` LR-043 §A — *"OWNER is short-circuited in `canWrite()` to allow
  **all** writes; the §2 write-gate applies only to pipeline identities."*

**Why it matters**: OWNER is Claude's DEFAULT identity. So by default the agent can write exactly the
files the list names as human-only — including `.env*` and `package.json`. The pipeline identities are
correctly blocked; only the default one is not.

**Not resolvable below the owner** — closing it either way changes a load-bearing 2026-04-23
remediation. Note that the OWNER short-circuit was itself introduced *because* an over-broad gate
sabotaged its own author's session, so tightening it carelessly re-opens that incident.

Options: (a) make HARD_STOPS genuinely universal — check them before the OWNER short-circuit, accepting
that Claude then cannot edit `package.json` without an override handshake; (b) keep OWNER's bypass and
correct the code comments so they stop claiming universality they do not have; (c) narrow HARD_STOPS to
the subset that must bind everyone (`.env*`) and leave the rest identity-scoped.
*Recommendation: (c) — it protects the files that actually carry secrets without re-creating the gate
that broke its own author.*

### SLOP_SWEEP Decisions (a)–(e) + sub-decision

| # | Decision | Status |
|---|---|---|
| (a) | Atlassian key scrub — HEAD-only, no rotation | ✅ RESOLVED + DONE (2026-07-19, commit `2a37d1bf`) |
| (a) sub-decision | Test passwords in `plans/done/PLAN_23/27/31/34*.md` — HEAD-only scrub or leave? | **OPEN** |
| (b) | `plans/done/` archival (640 files, 64 RELOCATE flags) | ✅ RESOLVED (2026-07-29) — all 640 stay; Lot B5 removed from queue |
| (c) | `website/` frontend sub-tree disposition | ✅ RESOLVED (2026-07-29) — keep; `website/` off DELETE list; Lot D2 (`jiraconfig.txt`) still applies |
| (d) | Self-cleaner build timing | ✅ RESOLVED (2026-07-29) — now; Lot C1 proceeds as part of this sweep |
| (e) | Upgrade ULTRAAUDIT first | ✅ RESOLVED (2026-07-19) — YES, upgrade-first; baked as STEP 0 |

Source: `out-recon-slop/TRI-STATE.md § OWNER DECISIONS (VERBATIM)`; `PLAN_REPO_SLOP_SWEEP.md:533-551`.

### FIX_WAVE Open Owner Decisions 1–10 + ps1-liveness

Source: `out-recon-slop/TRI-STATE.md § PLAN_ULTRAAUDIT_FIX_WAVE.md BLOCKED ON`; `PLAN_ULTRAAUDIT_FIX_WAVE.md:150-159`.

| # | Decision | Impact | Status |
|---|---|---|---|
| 1 | `routing-policy.json` grant-broker tier (P1-M03) | Blocks `PLAN_LAZY_CEO_DELEGATOR` | **OPEN** |
| 2 | lcd07 staged patch (~25 KB, P1-M05) — apply-first or park until after audit? | Applies to `~/.claude/delegation/`; see STAGED-ARTIFACT REGISTER | **OPEN** |
| 3 | Hook bak files — `delegation-gate.mjs.bak-lcd07` confirmed NOT deletable (unique content per P2-LOT08-03); 6 remaining need archive-vs-delete ruling | Blocks ORP-A1 execution for the 8 hook bak files | **OPEN** |
| 4 | Agent bak files — quarantine confirmed; await GO to delete | Blocks ORP-A1 execution for the 10 `~/.copilot/agents/` bak files | **OPEN** |
| 5 | `delegation-temp/SKILL.md` graduation — await GO | | **OPEN** |
| 6 | `PLAN_AUDIT_COPILOT.md` trim — prune-check + GO needed | | **OPEN** |
| 7 | Stale ship-plan references — 3 pending plans cite deleted `verify-vendor-fresh.mjs` (C3 anomaly 3: `PLAN_PUSH_NOTES_LATEST_TO_DELIVERABLES_TEST.md`, `PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md`, `PLAN_SHIP_TO_ENCORE_DELIVERABLES_TEST.md`) | | **OPEN** |
| 8 | Orphaned untracked PNGs — git-clean nod required | | **OPEN** |
| 9 | `docker-compose` / `render` / `jest` vestiges + gitignored scratch dirs | | **OPEN** |
| 10 | 9 residual staged pending plans — confirm active vs stale before Phase 7 closure | See STAGED-ARTIFACT REGISTER | **OPEN** |
| ps1-liveness | Was `scripts/ship-client.ps1` live or dead code? | Answered during Fix Wave 2 Hop 2 | ✅ **RESOLVED** — liveness confirmed via `plans/pending/PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md:153,203,229-240`; fix applied in Fix Wave 2. Source: `out-fixwave2/DEFENCE-FW2-HOP2.md` |

### ULTRAAUDIT Pending Decisions (3)

Source: `out-recon-slop/TRI-STATE.md § PLAN_COPILOT_INTEGRATION_ULTRAAUDIT.md BLOCKED ON`; `PLAN_COPILOT_INTEGRATION_ULTRAAUDIT.md:133-137`.

| # | Decision |
|---|---|
| UA-1 | LCD_07 apply — park until after audit (recommendation), or apply first? |
| UA-2 | Fix-wave autonomy — A/B auto-apply on council green, or every fix waits for per-item yes? |
| UA-3 | Budget posture — cap-per-phase check-ins, or run phases 0–4 uninterrupted then check in before fix wave? |

---

*Produced by TICKET-triplan-consolidate, 2026-07-30. Updated by TICKET-artifact-final, 2026-07-30 — STEP 0 completion state. All facts trace to named source artifacts in `.claude/state/ua-worker/chips/q123/`. Where two sources conflict, both values are reported.*

---

## ⚠ APPROVAL DEFECT — BATCH 6 APPLIED HALF A FINDING (2026-07-30, dispatcher-verified)

Batch 6 (`q123-u7-mixed`, exit 0, 257s) applied 6 rows across 5 files. All 6 verified on disk by the
dispatcher: `git diff --numstat` matches the report exactly, `npx tsc --noEmit` on tavily-mcp exits **0**,
and the only surviving `MAX_ROTATIONS` reference repo-wide is the findings-index row that *describes* the
rename (`_ULTRAAUDIT_FINDINGS.md:306`) — zero code references. Row 44 confirmed **not** applied: the
`.env.keys` parser at `src/index.ts:18-35` is still the generic `indexOf("=")` form, unpinned.

**One row was approved wrongly — and the fault is the dispatcher's, not the worker's.**

`P2-LOT18-01` (`_ULTRAAUDIT_FINDINGS.md:303`) states a **two-part** fix:

> `COMPACT: remove test-client.ts from tsconfig include; create tsconfig.test.json`

The R-phase proposal (`out-rMN-src-context/RMN-PROPOSALS.md:54-65`) carried only the first clause. It was
approved as row 39 and applied correctly:

```diff
-  "include": ["src/**/*.ts", "test-client.ts"],
+  "include": ["src/**/*.ts"],
```

Machine state after the change:

| fact | instrument | result |
|---|---|---|
| `test-client.ts` exists | `ls` | present |
| `test-client.ts` tracked | `git ls-files` | tracked |
| typechecks clean standalone | `npx tsc --noEmit --strict test-client.ts` | exit 0 |
| referenced by a package script | `package.json` | no |
| covered by any tsconfig | — | **none** |

So the applied half converted a `shipped-dead-file` fix into a **pure typecheck-coverage loss**: the file
that exists to exercise the MCP server is now unchecked — and `src/index.ts` was modified in the same
batch (row 43, `.max(20)`). The one harness that would catch an interface break was dropped from coverage
in the same commit that changed the interface.

**Why it passed review.** The applied half is correct in isolation. The diff is right, the typecheck is
green, the worker's report is honest and complete. Nothing in the proposal, the diff, or the verification
reveals the gap — only the original finding row does. A green typecheck after an exclusion proves nothing:
a file removed from checking always passes.

**Not reverted.** The finding's `shipped-dead-file` concern is real — `test-client.ts` should not emit into
`dist/`. The correct resolution is the missing half, dispatched as `TICKET-u8-tsconfig` (`q123-u8-tsconfig`):
create `tsconfig.test.json` extending the base with `noEmit: true` and `test-client.ts` in scope, so the
file is checked without being shipped. That ticket requires a `--listFiles` proof that the new config
actually covers `test-client.ts` — a config checking zero files would also exit 0.

**Rule extracted** (saved to auto-memory as `feedback_proposal_may_truncate_the_finding.md`): a proposal is
a *restatement* of a finding and restatement can drop a clause. Diff the proposal against the finding row
before approving. A `;` or "and" in the finding text means two actions. Treat "remove X from the
build/include/registry" as presumptively half a fix, and ask what preserves the coverage the removal
deletes.

### Rows 23, 41, 42, 43, 76 — verified sound

- **Row 23** (`scripts/xlsx-lint-rules.mjs`) — the removed line claimed `export_test_cases/to-xlsx.ts`
  reached these rules by **dynamic import**. Checked: `to-xlsx.ts` exists and is tracked, but its imports
  (`:45-57`) contain no such import, and its own comment at `:727-733` states it shells out — *"Run as a
  subprocess to cross the CJS (ts-node) → ESM (.mjs) boundary cleanly"*. The line was factually wrong
  about the mechanism and sat under a header reading "Imported by". Removal correct; the dependency
  remains documented one hop up via `scripts/xlsx-vocab-lint.mjs`, which is still listed.
- **Row 76** (`docs/read_only_docs/AGENT_SHARED_RULES.md:2`) — count dropped rather than corrected, as the
  dispatcher directed. Date, §-flattening history and the Navigation-first note all preserved. The
  proposal's suggested value (868) was wrong; measured 867. Neither number was written.
- **Rows 41/42/43** — behaviour-preserving extraction, complete rename, and the `.max(20)` bound applied to
  the array branch only (the string branch is not an array). ⚠ The "documented cap = 20" confirmation is
  **circular**: the only cited source is the `.describe()` string on the same line being edited. The change
  enforces the repo's own documented contract, which is the conservative reading, but it is not
  independent evidence of Tavily's real limit.

*Appended 2026-07-30 after dispatcher verification of `q123-u7-mixed`.*

---

## ⛔ LIVE GATE INSTALLED — AND THE PIPELINE BYPASS IS STILL OPEN (2026-07-30, owner-authorized)

Owner authorized installing the fixed labor-gate to the live hook path. Done, with a full before/after
measurement. **The install closed one of the two bypasses. The other is still open, and the prior
ticket's proof that it was closed was wrong.**

### The install

| step | evidence |
|---|---|
| Live gate mode | `~/.claude/delegation/labor-gate-config.json` → `"mode": "deny"` — enforcing, not announce |
| Drift check before overwriting | `diff` installed vs repo source = 38 lines, **all** of them the repo source being ahead. Zero local drift; nothing regressed |
| Backup | two copies — `~/.claude/delegation/labor-gate.mjs.pre-install-2026-07-30.bak` + scratchpad |
| Pre-install sha256 | `93b7bc55156039e7b9148461ba3abc06eefea148add743c6f6026cc5cd97b8cc` |
| Post-install sha256 | `bf86f88e5a26c831180f31a5fe5f81ca4ae8481d87847ad4d2cafec1f3b037d6` — byte-identical to the repo source |
| New code confirmed live | `gate-fires.log` gained `labor-gate, 2026-07-30T17:02:47.495Z, deny, gate-install-probe`. `fireTelemetry` exists **only** in the new version, so its firing proves the new file is executing |

### The measurement that refutes the prior ticket

File-based payload probes (per `feedback_file_based_probes_only`), driven against the live hook:

| # | command | before install | after install |
|---|---|---|---|
| 1 | `npx playwright test some.spec.ts` | deny | deny |
| 2 | `true \| npx playwright test some.spec.ts` | deny | **deny** ← the u6 loop fix genuinely works |
| 3 | `echo dummy \| npx playwright test some.spec.ts` | allow | **allow** ← BYPASS STILL OPEN |
| 4 | `cat /dev/null \| playwright-cli navigate https://example.com` | allow | **allow** ← BYPASS STILL OPEN |
| 5 | heredoc writing `ticket.md`, body naming a gated command | allow | allow (correct — this is data) |
| 6 | `git status --porcelain` | allow | allow |
| 7 | `echo hello \| grep hello` | allow | allow |

Row 2 is the discriminator. A **non**-data prefix (`true`) is denied, so `segmentHasSpecExecution()`'s
all-parts loop — the u6 fix — is correct and firing. A **data** prefix (`echo`, `cat`) is allowed. The
bypass therefore never reaches the function u6 fixed.

### Root cause — `checkCommand()` line 311, not `segmentHasSpecExecution()`

```javascript
// If the leading program is a data command (cat, echo, grep, etc.), skip entirely
if (isDataWritingSegment(segment)) continue;
```

`isDataWritingSegment()` runs `getLeadingProgram()` on the **whole segment**. For
`echo dummy | npx playwright test x.spec.ts` that is `echo` ∈ `DATA_COMMANDS`
(`cat, echo, printf, grep, sed, awk, tee` — line 34), so the entire segment is `continue`d before any
pipeline classification happens. **Seven laundering prefixes, each a working bypass.**

The skip is not itself wrong — row 5 proves it protects legitimate heredoc ticket-writing, which must
keep passing. The defect is that it judges a pipeline by its first word. Correct fix: a segment is data
only when **no part** of it is a gated command.

⚠ **This is the second time a fix in this file was reported proven and was not.** The prior report
demonstrated the change in the function it edited; it never drove the actual bypass string end-to-end.
Dispatched as `TICKET-u9-gatefix` with the diagnosis, a mandatory 7-row before/after verdict table, and
a break-your-own-fix pass over all seven prefixes. The dispatcher re-runs every row independently.

**Live posture right now**: identity reverse-scan fix is live; telemetry is live; the pipe-with-data-prefix
bypass is live and exploitable. The gate is strictly better than before the install and still not sound.

### P2-LOT18-01 completed — the truncated finding is now whole

`TICKET-u8-tsconfig` created `.claude/skills/ultra-agents/tavily-mcp/tsconfig.test.json`
(`extends` the base, `noEmit: true`, includes `src/**/*.ts` + `test-client.ts`). Dispatcher-verified
independently: `tsc -p tsconfig.test.json --listFiles` lists `test-client.ts`, exit 0. The file is
typechecked again and still does not emit into `dist/` — both halves of the finding now hold.

### Owner decisions received 2026-07-30

| # | decision | disposition |
|---|---|---|
| 1 | Install the fixed gate | **YES, now** — done above; the fix turned out incomplete, u9 dispatched |
| 2 | Split the ~86 off-repo findings to a successor plan | **YES, split** — blocked on `join260` producing the by-ID transfer list (Fable Q2 condition 1: successor denominator must be re-runnable, never hand-copied) |
| 3 | Debris deletion | **Prepare, do not execute.** All real deletions held to the very end of the whole effort, approved by the owner in one motion. Nothing moved, nothing archived, nothing deleted |
| 4 | Commits | **No push this session.** Local commits are the dispatcher's checkpoints; the tree still mixes accepted FW1+2, rejected FW3, and cross-session work, so any checkpoint must be a curated path-explicit list — never `git add -A` |

*Appended 2026-07-30 after the live gate install and its refutation.*

---

## GATE ROUND 3 — u9 VERIFIED, TWO SHAPES SURVIVE, RESTRUCTURE DISPATCHED (2026-07-30)

### u9 independently verified — the seven prefixes are genuinely closed

u9 made `isDataWritingSegment()` pipeline-aware: a segment led by a data command is only data if **no**
pipeline part is gated. It also removed the now-dead `DATA_COMMANDS` branch inside
`segmentHasSpecExecution()`.

The dispatcher did not accept the worker's verdict table. A 26-case harness was built and run
independently — `.claude/state/ua-worker/chips/q123/gate-probe/probe.mjs` + `cases.json`, each payload
written to a real file and fed to the gate on stdin (per `feedback_file_based_probes_only`).

Result: **24 passed, 2 failed.** All seven `DATA_COMMANDS` prefixes now deny, in leading and mid-pipe
position, against both spec runs and browser walks. Every legitimate-traffic row still allows. The
worker's claims reproduced exactly — its report was honest and its fix is real.

### Two survivors the worker did not test

```
echo x | bash -c "npx playwright test x.spec.ts"        -> allow
cat /dev/null | sh -c "npx playwright test x.spec.ts"   -> allow
```

**Root cause — ordering, not pattern coverage.** `checkCommand()` classifies at the **segment** level
while the unit that actually executes is the **pipeline part**:

- the data-command skip runs on the whole segment, **first**
- the shell-`c` unwrap + recursion also runs on the whole segment, so it never fires when the segment
  merely *contains* a wrapper rather than starting with one
- only `segmentHasSpecExecution()` inspects parts, and it applies two predicates, neither of which
  unwraps a shell wrapper

A revealing accident: `echo x | bash -c "echo y | npx playwright test z.spec.ts"` **does** deny — solely
because `splitPipeline()` is not quote-aware and splits inside the quoted payload, exposing the gated
command by luck. Quoting behaviour is currently load-bearing by coincidence, not by design.

### Live gate re-installed at the u9 level

Installed (sha256 `ebec99b2a4abb01afbeb597d4b074f8a28febea88737e594a46b24bb05069ec1`, identical to repo
source) and re-verified with the same harness against the **installed** copy: 24/26, same two survivors.
Strictly better than the pre-install state, which had all nine shapes open. Backups from the first
install remain valid.

### Round 4 dispatched as a RESTRUCTURE, not a third patch

LR-069 §3.5 — recurrence convicts the prior fix. u6 and u9 are both **shape recognisers**: each learned
one bypass string and taught the gate to refuse that string. A third patch teaching it `bash -c` would
repeat the mistake a third time.

`TICKET-u10-gatefloor` therefore mandates a control-flow restructure: every pipeline part classified by
the same full logic including shell-`c` recursion, with the **data skip moved to last**. A skip that runs
before classification can always be induced — that ordering is the defect, and the two surviving strings
are only its current symptoms. The ticket requires a prior-fix trial for u6 and u9, a bounded recursion
depth, the 26-case harness at 0 failures, ≥6 new adversarial cases from the worker, explicit no-over-fire
evidence on legitimate traffic, and the §3.4 ≤200ms PreToolUse budget. It explicitly fails a change that
closes the two strings without fixing the ordering, even if the harness goes green.

The harness is now durable at `.claude/state/ua-worker/chips/q123/gate-probe/` so every future round is
measured against the same bar rather than a fresh set of remembered strings.

*Appended 2026-07-30 after independent verification of u9.*
