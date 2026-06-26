# PLAN — Identity Enforcement: Make Pipeline Roles Structurally Adopted, Not Voluntary

**Status**: DONE
**Executed**: 2026-06-25
**Priority**: High
**Created**: 2026-06-24
**Owner identity for this plan**: OWNER (framework/hook/skill changes — all OWNER-owned paths)
**Sibling**: `plans/pending/PLAN_ENCORE_AGENT_DOCS_RECOVER_REFRESH.md` (owns the two missing agent-only docs; no execution dependency)

---

## Context — why this exists

Identities (HUNTER/GIVER/BUILDER/HEALER/WATCHDOG/GARDENER) are the **carriers** of the
pipeline's quality gates: adopting GIVER is what loads GIVER's ~9 HARD STOPs (FCC taxonomy,
affordance probe, TDW 100% walk, Jira-first enrichment, positive-control, empty-surface,
TC↔plan sync, post-complete XLSX rebuild). **Skip the identity → silently skip every gate.**

Today, adoption is **voluntary prose**. Verified against the live code:

1. `auto-calls: identity` frontmatter is **inert metadata** — no hook consumes it.
2. `**Identity**: GIVER. Auto-loaded via Identity Gate` (coverage/ultracoverage/planning) is a
   **false claim** — nothing structurally loads it. It loads only if Claude *volunteers* to invoke
   `/identity`, which fails mid-orchestration (the reported symptom).
3. The one structural backstop — the PreToolUse write-gate
   ([`.claude/hooks/lib/check-identity-switch.mjs:122`](.claude/hooks/lib/check-identity-switch.mjs)) —
   is **OWNER-blind**: `canWrite("OWNER", …)` returns `true` unconditionally
   ([`scripts/identity-ownership.mjs:294`](scripts/identity-ownership.mjs), the deliberate LR-043
   short-circuit). So OWNER writes test-cases/inventories/catalogs/XLSX freely; the gate never objects.
4. The Stop-hook catches only **banner drift** (claiming `[GIVER]` without loading it). Staying
   silently OWNER and never claiming a banner → no drift → clean exit.

**Sharper finding (reframes the fix):** `/coverage` and `/ultracoverage` write **plan files**
(`plans/**`, OWNER-owned). Their "Identity: GIVER" is a *mindset* label, not file ownership — the
authoring legitimately runs as OWNER. **The real damage is at `/execute` time**, when the subplan's
GIVER phase writes the actual GIVER-owned artifacts as OWNER, HARD STOPs unloaded. This is the user's
exact example: a multi-identity subplan "blasted through as OWNER."

**Two gaps, one root cause** (no forcing function; write-gate OWNER-blind):
- **Gap A (skill/authoring):** invoking a role-skill doesn't load the role. (Lower-stakes — authoring
  writes OWNER-owned plan files; enforceable by prose checklist.)
- **Gap B (execution):** a subplan declaring `GIVER→BUILDER→AUDIT by phase` never *switches* per phase;
  [`.claude/skills/execute/SKILL.md:61`](.claude/skills/execute/SKILL.md) Phase 0.1 is a **static** one-time
  pre-check, not a live per-phase gate. **(High-stakes — this writes the real artifacts.)**

**Intended outcome:** identity adoption becomes **structural** — the framework cannot produce
pipeline artifacts as OWNER-without-HARD-STOPs **no matter how it's entered** (direct skill, `/execute`,
`/chain`, ad-hoc) — while preserving the LR-043 reframe (OWNER stays unrestricted for framework work).

---

## Design — layered, leverage-ordered

### Layer 0 (PLANNING-TIME) — duty-coverage gate (the "did the plan cover every HARD STOP" check)
Today the framework enforces *what each role delivers* (LR-048 Per-Identity Satisfaction Matrix +
closure-check C6 → file exists) but **not** *that each role's HARD STOPs governed the work*. Duties
were assumed-via-skill-template, never verified per-plan against the live agent file. Close it:

- At `/planning` Step 3 (and `/coverage`/`/ultracoverage` authoring), for each pipeline identity the
  plan's phases invoke, **read that identity's agent file** (`.claude/agents/<ROLE>.md`), extract its
  HARD STOPs, and verify the plan body reflects each applicable one (or explicitly marks it
  out-of-scope with a reason). A HARD STOP neither reflected nor excused = **HALT** (same gate posture
  as the existing LR-041 Model/Thinking validator — which proves the framework already hard-gates
  *some* fields; this extends it to duties).
- **No new script (slop-reduced)**: fold this into the **existing `/planning` Step 3 HALT gate** (which
  already greps-and-HALTs on Model/Thinking/PermissionMode). Add a duty-coverage sub-check there that
  lists each phase-identity's HARD STOP headers and flags ones with no plan-body disposition — advisory
  list the author resolves, not a brittle fuzzy-matcher. Reuses the gate that already exists.

### Layer 1 (LOAD-BEARING) — pipeline-artifact write-gate
Extend the existing PreToolUse hook so that, **before** the OWNER allow short-circuit, it asks the
question it never asks today: *is this OWNER about to write pipeline-artifact territory inside an
execution context?*

```
DENY when ALL of:
  • ground-truth identity == OWNER
  • execution context is active   (inside /execute of a plan file — primary signal)
  • target path is pipeline-artifact territory
        = some PIPELINE role R has CREATE/RW for it per OWNERSHIP_ROWS
          (test-cases→GIVER, test-plans→GIVER, field-inventories→GIVER, catalogs→GIVER,
           *.spec.ts→BUILDER, selectors→GIVER/BUILDER, REQUIREMENTS.md→HUNTER, …)
  • path is NOT OWNER framework territory (plans/**, scripts/**, .claude/**, docs/**, website/**)
Message: "[IDENTITY-GATE] <path> is <ROLE>-owned pipeline territory. You are OWNER — its HARD STOPs
          are NOT loaded. Run /identity <ROLE> (loads the agent file + emits the Constraint Extract)
          before writing. Override = one-shot break-glass."
```

- **Derive `<ROLE>` from existing data** — invert `OWNERSHIP_ROWS`: the pipeline identity whose grant
  for the matched §2 row is `CREATE`/`RW`. No new ownership table.
- **LR-043-safe by construction** — framework paths resolve to OWNER as owner ⇒ never gated. The
  `canWrite` OWNER short-circuit is **untouched**; the new branch lives in the *hook*, gated on
  pipeline-artifact territory + execution context, not in `canWrite`.
- **On catch: HALT, no silent auto-switch** — forces `/identity <ROLE>`, which actually loads the
  HARD STOPs (matches the 2026-04-23 "preserve audit trail" directive; same posture as Phase 0.1).
- **Override** — reuse the existing `[OVERRIDE-REQUEST]` + auth-phrase handshake already in the hook.
- **Rollout knob** — new `.claude/identity-gate-config.json` `{ "mode": "off" | "announce" | "deny" }`,
  ramped exactly like `closure-config.json`'s `c6_mode`/`test_status_mode`. Land in `announce`
  (warn + record, never block) → flip to `deny` after a clean window.
- **Fail-open** — any parse/lookup error → allow (the hook's existing posture).

### Layer 2 — per-phase identity switching in `/execute`
When a subplan declares per-phase identities, each phase transition **invokes `/identity <role>`**
as its first action. Layer 1 *enforces* it (a Phase-1 write to GIVER paths now physically requires
GIVER). Phase 0.1 stays as the static authoring-time pre-check; Layer 1 is the runtime enforcement
it always lacked. This closes Gap B — the user's example.

### Layer 3 — honest skill prose (stop lying about "Auto-loaded")
- `/coverage`, `/ultracoverage`, `/planning`: replace `**Identity**: <ROLE>. Auto-loaded via Identity
  Gate` with the truth — *authoring runs as OWNER (writes OWNER-owned plan files); apply `<ROLE>`'s
  HARD-STOP checklist when deciding the case set; **structural identity enforcement fires at `/execute`
  time** when the role phase writes the artifacts.* Keep the role's judgment checklist explicit.
- `CLAUDE.md`: correct the false claim "every non-leaf skill auto-calls `/identity` via Identity Gate
  as its first step" → describe the actual mechanism (hook-enforced at write-time on pipeline artifacts).

### Layer 4 — detective net (catches misses during the `announce` ramp and after)
`/final-q` + `/audit` read a session-end signal the gate persists (same pattern as LR-060's
execution-completion warnings): *did any pipeline-artifact write happen as OWNER inside `/execute`?*
If yes (and gate is `announce`, not yet `deny`), floor the verdict to YELLOW. This makes the ramp
measurable and keeps a net even when `deny` is off.

### Layer 5 — agent-file freshness (the identities must be *correct*, not just *adopted*)
Enforcement (Layers 0–4) is worthless if the role file it loads is stale. A line-by-line audit of all
six `.claude/agents/*.md` against the live repo (2026-06-24) found the role files **well-maintained,
not broadly expired** — every HARD STOP #0 `npm run sync:mistakes` + `validate:sync`/`check:tc-parity`/
`xlsx:build`/`planner:post-complete`/`lint:testcases`/`typecheck` exist in `package.json` — but with a
handful of real stale lines (and the staleness-auditor is itself stale):

| File:line | Stale | Correct | Sev |
|---|---|---|---|
| [`MAINTAINER.md:31`](.claude/agents/MAINTAINER.md) | dead-file sweep scans `clients/${ACTIVE_CLIENT}/{src,specs}/` | `{src,tests}/` (POM restructure 2026-06-05 renamed `specs/`→`tests/`) — sweep currently scans a non-existent dir, silently missing specs | **MED** |
| [`AUDIT.md:3`](.claude/agents/AUDIT.md) | `description` "6 modes …, FCC Completeness" omits the Identity-Drift mode in the body table | "7 modes" incl. Identity-Drift | **MED** |
| [`AUDIT.md:32`](.claude/agents/AUDIT.md) | Identity-Drift criterion "no `tests/`" | inverted post-2026-06-05 — `clients/${ACTIVE_CLIENT}/tests/` IS the specs home; the stale token to flag is bare-root `specs/` | **MED** |
| [`PLANNER.md:4`](.claude/agents/PLANNER.md) (+ consistency) | `tools:` lists `TodoWrite` only | align all 6 files on the `TaskCreate/TaskUpdate/TaskList` triplet (legacy `TodoWrite` alias harmless but inconsistent) | **LOW** |
| `REQUIREMENTS.md:18-19` / `PLANNER.md:15-16` | reference `clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS (absent — sibling plan owns recovery)` + `MODULE_REGISTRY.md` as live inputs | **→ owned by sibling plan** `PLAN_ENCORE_AGENT_DOCS_RECOVER_REFRESH.md` (files confirmed absent-on-disk but recoverable) | **→ sibling** |
| [`HEALER.md:47`](.claude/agents/HEALER.md) | `Manual`→`Pending Automation` status rename not applied to old test-case MDs | retro-migrate or scope the rename to new artifacts | **LOW** |

Two fixes (slop-reduced — no new script):
1. **Correct the 2 VERIFIED-functional stale lines** — `MAINTAINER.md:31` (`{src,specs}`→`{src,tests}`, confirmed: `clients/encore/specs` does not exist, `tests/` does) and `AUDIT.md:3`+`:32` (6→7 modes; fix the inverted `tests/` staleness criterion). The missing `clients/encore/docs/REQUIREMENTS (absent — sibling plan owns recovery)` + `MODULE_REGISTRY.md` → **handled by the sibling plan** `PLAN_ENCORE_AGENT_DOCS_RECOVER_REFRESH.md` (recover + audit + refresh); out of scope here. **Skip** the cosmetic edits (TodoWrite→triplet normalize, HEALER status-rename) — not required by the goal.
2. **Auto-run the freshness check via the EXISTING wired checker** — `npm run validate:sync` (`scripts/validate-agent-sync.ts`) already validates `.claude/agents/*.md` and already runs inside `pipeline:validate` + `pipeline:preflight`. **Extend it** (or the sibling `verify:no-stale-refs` already in `pipeline:validate`) to also catch the path-staleness class (`specs/`-style stale tokens) — instead of a new standalone script. And **fix WATCHDOG's Identity-Drift mode criteria** (the `tests/` inversion) so the manual `/audit identity` mode isn't lying either. Zero new wiring — it rides a gate that already runs.

---

## Concrete changes (files)

| File | Change |
|---|---|
| [`scripts/identity-ownership.mjs`](scripts/identity-ownership.mjs) | Add + export `ownerRoleFor(path)` → primary pipeline CREATE/RW role for a path (inverts `OWNERSHIP_ROWS`), and `isPipelineArtifact(path)` (true iff a pipeline role owns it AND it's not OWNER-catchall territory). Pure derivation from existing rows. |
| [`.claude/hooks/lib/check-identity-switch.mjs`](.claude/hooks/lib/check-identity-switch.mjs) | In `handlePreToolUse`, **before** the `canWrite` allow: add the Layer-1 branch — detect `/execute` context (reuse the todo-gate's transcript-walk: last `Skill=execute` with no subsequent `final-q`), call `isPipelineArtifact`/`ownerRoleFor`, honor `identity-gate-config.json` mode (`off`→skip, `announce`→allow+persist warning, `deny`→deny unless override), emit the role-specific message. Fail-open. |
| `.claude/identity-gate-config.json` **(NEW)** | `{ "mode": "announce" }`. The ramp knob. |
| [`scripts/check-identity-ownership.mjs`](scripts/check-identity-ownership.mjs) | Extend the parity test to assert `ownerRoleFor` agrees with the §2 markdown CREATE/RW column for every artifact row (drift guard, mirrors existing parity discipline). |
| [`.claude/skills/execute/SKILL.md`](.claude/skills/execute/SKILL.md) | Add the Layer-2 per-phase `/identity <role>` switch at phase boundaries; note Layer-1 runtime enforcement; keep Phase 0.1 as the static pre-check. |
| [`.claude/skills/coverage/SKILL.md`](.claude/skills/coverage/SKILL.md), [`.claude/skills/ultracoverage/SKILL.md`](.claude/skills/ultracoverage/SKILL.md), [`.claude/skills/planning/SKILL.md`](.claude/skills/planning/SKILL.md) | Layer-3 honest prose: authoring=OWNER + role HARD-STOP checklist + "enforcement at execution". |
| [`.claude/skills/final-q/SKILL.md`](.claude/skills/final-q/SKILL.md) | Layer-4 detective check: read gate-announce warnings, floor verdict. |
| [`.claude/rules/hooks-identity.md`](.claude/rules/hooks-identity.md) | **No new LR (slop-reduced) — UPDATE existing LR-043 §A** to document the new scoped gate. **Correctness-critical framing**: the `canWrite()` OWNER short-circuit STAYS (LR-043 §A's stated invariant remains true); the new gate is an *additional hook-level check* that fires only for pipeline-artifact paths inside `/execute`. It does NOT re-introduce blanket OWNER access-control — it enforces context-loading ("adopt the role before writing the role's artifacts"), which IS what LR-043 says identity is for. Rule text and hook code must be edited together so they never contradict (LR-020). |
| [`CLAUDE.md`](CLAUDE.md) | Correct the "every non-leaf skill auto-calls /identity" claim to match reality. |
| `pipeline/` hook tests | Add cases for the Layer-1 branch (deny/announce/allow/override × pipeline-artifact vs framework path × in/out of /execute). |
| [`.claude/skills/planning/SKILL.md`](.claude/skills/planning/SKILL.md) Step 3 | **Layer 0 (no new script — slop-reduced)** — extend the EXISTING Step 3 HALT gate with a duty-coverage sub-check: list each phase-identity's HARD STOP headers from `.claude/agents/<ROLE>.md`, flag any with no plan-body disposition. |
| [`.claude/agents/MAINTAINER.md`](.claude/agents/MAINTAINER.md) | **Layer 5** fix (VERIFIED, surgical) — change ONLY the `specs` token: `{src,specs}/` → `{src,tests}/` (step 8 dead-file sweep). The rest of that line is verified correct — `src/{common,utils,data,framework-contracts}/` all exist; `scripts/` exists. Touch nothing else on the line. |
| [`.claude/agents/AUDIT.md`](.claude/agents/AUDIT.md) | **Layer 5** fix (VERIFIED) — `description` 6→7 modes incl. Identity-Drift; fix the Identity-Drift `tests/`-inversion criterion. |
| `scripts/validate-agent-sync.ts` OR `verify:no-stale-refs` (EXISTING — extend) | **Layer 5 (no new script)** — add an agent-file path-staleness scan to the checker that ALREADY validates `.claude/agents/*.md` and ALREADY runs in `pipeline:validate`/`pipeline:preflight`. **At implementation: READ both `validate-agent-sync.ts` and the `verify:no-stale-refs` script first and put the scan in whichever already does token-staleness — do not assume.** Zero new wiring. |
| **→ See sibling plan** — `clients/encore/docs/REQUIREMENTS (absent — sibling plan owns recovery)` + `MODULE_REGISTRY.md` | Recover + audit + refresh of these two agent-only docs is its **own plan** (`PLAN_ENCORE_AGENT_DOCS_RECOVER_REFRESH.md`) — out of scope here. |

---

## Verification (end-to-end)

1. **Path→role derivation** — `node scripts/identity-ownership.mjs --owner-role clients/encore/specs_planning/test-cases/X` → `GIVER`; `… plans/pending/X` → `OWNER`/none (framework, not gated). (Illustrative `X` = any file under that dir; extensions dropped so the closure C3 path-check skips these examples.)
2. **Parity** — `node scripts/check-identity-ownership.mjs` exits 0 (markdown §2 ↔ machine mirror ↔ `ownerRoleFor`).
3. **Hook simulation** (feed a synthetic transcript to `check-identity-switch.mjs`):
   - OWNER + `/execute` active + Write to `…/test-cases/X` → **deny** in `deny`, **allow+warn** in `announce`, **allow** in `off`.
   - OWNER + `/execute` active + Write to `scripts/foo.mjs` → **allow** in all modes (framework territory — LR-043 safe).
   - OWNER + no `/execute` + Write to `…/test-cases/X` → allow (ad-hoc OWNER quick-edit preserved).
   - GIVER + Write to `…/test-cases/X` → allow (role adopted).
   - deny + `[OVERRIDE-REQUEST]` + "override approved" → allow (handshake intact).
4. **Live** — run a coverage subplan execution; confirm the GIVER-phase write HALTs until `/identity GIVER`, and that the Constraint Extract (HARD STOPs) is emitted.
5. **Hook-test suite** green; `npm run typecheck` clean.

---

## Correctness verification (evidence-backed — every CRUD claim proven, none assumed, 2026-06-24)

Each fix below was confirmed with a command BEFORE being committed to the plan — so the executor inherits proven facts, not guesses:

- **`MAINTAINER.md` `specs`→`tests`** — `ls` proved `clients/encore/specs` does NOT exist and `clients/encore/tests` DOES (specs live there). The other paths on that line — `src/{common,utils,data,framework-contracts}/` + `scripts/` — were each `ls`-confirmed to exist → fix is surgical (one token).
- **`AUDIT.md` 6→7 modes + `tests/`-inversion** — confirmed by reading the file: `description` (line 3) names 6 modes incl. FCC-Completeness but omits the Identity-Drift row present in the body table (line 32); the Identity-Drift criterion "no `tests/`" is inverted post-POM-restructure.
- **`tools:` line — DROP confirmed safe (NOT a functional gap)** — `grep ^tools:` proved all 5 task-using agents (PLANNER/GENERATOR/HEALER/REQUIREMENTS/AUDIT) already carry the full `TaskCreate/TaskUpdate/TaskList` triplet; `TodoWrite` is a harmless legacy alias beside it; MAINTAINER intentionally has none. No agent is missing working task tools → cosmetic, correctly dropped.
- **`docs/REQUIREMENTS (absent — sibling plan owns recovery)` + `MODULE_REGISTRY.md`** — `ls` proved both absent on disk; git history proved them recoverable + gitignored-by-design. Handed to the sibling plan.
- **All pipeline scripts** (`sync:mistakes`, `validate:sync`, `check:tc-parity`, `xlsx:build`, `planner:post-complete`, `lint:testcases`, `typecheck`) + `validate:sync` covering `.claude/agents/*.md` and being wired into `pipeline:validate` — all confirmed present in `package.json` (no command-rot; HARD STOP #0 across all agents is valid).

Any fact NOT yet command-verified is explicitly marked "confirm at implementation, don't assume" in the change rows above (the freshness-checker home; the LR-043 §A rule↔code co-edit).

## Non-goals / guardrails (do not revive LR-043)
- **Do NOT** remove or weaken the `canWrite` OWNER short-circuit — Layer 1 lives in the hook, scoped to
  pipeline-artifact territory + execution context.
- **Do NOT** gate OWNER writes to framework paths (`plans/`, `scripts/`, `.claude/`, `docs/`, `website/`).
- **Do NOT** gate the authoring skills' plan-file writes (they're OWNER-owned by design) — authoring is
  governed by the Layer-3 prose checklist, not the hook.
- Ship `announce` first; flip to `deny` only after a clean window (knob, not a big-bang).

---

## Rollout sequence
1. **Layer 5 fixes first** (cheap, no risk) — correct the stale agent-file lines so the
   identities loaded by every later layer are *correct*. Add the freshness auto-check.
2. **Layer 0** — extend the existing `/planning` Step 3 HALT gate with the duty-coverage sub-check (no new script).
3. Land **Layer 1** + helpers + parity + tests in **`announce`** mode (zero behavior change; warnings only).
4. Land **Layer 2** (`/execute` per-phase) + **Layer 3** (honest prose) + **Layer 4** (`/final-q` net) +
   LR-043 §A extension (no new rule) + CLAUDE.md correction.
5. Observe `/final-q` warnings across a few real runs; fix any false-positive territory classification.
6. Flip knob to **`deny`**. Identity adoption is now structural at every entry point, the role files are
   fresh, and every plan proves it covered each role's duties — no corners.

---

## Execution Summary

**Executed**: 2026-06-25 · **By**: OWNER (`/execute`, interactive — user chose "no chain, just /execute") · **Landed in `announce` mode** (rollout steps 1–4 complete; steps 5–6 = observe-then-flip-to-`deny` are the documented future ramp, tracked in `.claude/identity-gate-config.json` `ramp_complete: false`).

### Layers delivered (all 6 + LR-043 + CLAUDE.md), in the plan's mandated rollout order

| Layer | Change | File(s) | Verification |
|---|---|---|---|
| **5a** | Dead-file sweep `{src,specs}/`→`{src,tests}/` (POM rename) | `.claude/agents/MAINTAINER.md` | `ls` proved `clients/encore/specs` absent, `tests` present |
| **5b** | AUDIT description 6→7 modes (+Identity-Drift); fixed the inverted `tests/` Identity-Drift criterion → flag bare-root `specs/` | `.claude/agents/AUDIT.md` | grep; agent-registry auto-derives |
| **5c** | Freshness check extended — brace-shorthand `{…src…specs…}` token (the `MAINTAINER.md` drift class) on the EXISTING wired guard (`pipeline:validate`), which already scans `.claude/agents/` | `scripts/verify-no-stale-live-refs.mjs` | token adds **0** new hits post-5a; precise (excludes the `.claude/rules/{specs,…}` glob) |
| **0** | Duty-coverage sub-check folded into the existing `/planning` Step 3 HALT gate (read phase-identity HARD STOPs, flag undisposed) — no new script | `.claude/skills/planning/SKILL.md` | prose gate, mirrors LR-041 posture |
| **1a** | `ownerRoleFor(path)` + `isPipelineArtifact(path)` (pure inversion of `OWNERSHIP_ROWS`) + CLI flags | `scripts/identity-ownership.mjs` (+2 exports, 0 removed) | CLI: test-cases→GIVER, spec.ts→BUILDER, REQUIREMENTS→HUNTER, plans/scripts→none/false, shared logs→false |
| **1b** | Layer-1 OWNER pipeline-artifact write-gate BEFORE the `canWrite` short-circuit (execute-context + ramp mode + announce-persist + deny + override); fail-open | `.claude/hooks/lib/check-identity-switch.mjs` | 19/19 fixtures; end-to-end announce persist proven |
| **1c** | Ramp knob `{ "mode": "announce" }` (mirrors `closure-config.json`) | `.claude/identity-gate-config.json` **(NEW)** | valid JSON, mode=announce |
| **1d** | Parity test extended: `ownerRoleFor`/`isPipelineArtifact` consistency vs `OWNERSHIP_ROWS` (drift guard) | `scripts/check-identity-ownership.mjs` | **0** `derivation:` findings |
| **1e** | 7 Layer-1 fixtures (deny/announce/off × pipeline-artifact vs framework × in/out `/execute` + GIVER-adopted + override) | `.claude/hooks/lib/test-identity-switch-fixtures.mjs` | `ALL PASS — 19 fixtures` |
| **2** | Per-phase `/identity <role>` switch at phase boundaries (Layer-1 enforces; Phase 0.1 stays static) | `.claude/skills/execute/SKILL.md` | prose |
| **3** | Honest prose (authoring=OWNER + GIVER HARD-STOP checklist + enforcement-at-`/execute`); planning already honestly OWNER | `.claude/skills/coverage/SKILL.md`, `.claude/skills/ultracoverage/SKILL.md` | on disk (grep-confirmed) — see Deferred |
| **4** | Detective check reads `identity-gate-warnings-<sid>.json`, floors YELLOW (mirrors LR-060) | `.claude/skills/final-q/SKILL.md` | warnings file written by 1b, format verified |
| **LR-043** | New §A.1 documents the scoped gate — `canWrite` OWNER short-circuit STAYS; Layer 1 is an additional hook-level context-loading check (LR-020 rule↔code co-edit) | `.claude/rules/hooks-identity.md` | prose |
| **CLAUDE.md** | Corrected the false "every non-leaf skill auto-calls `/identity`" claim → write-time hook enforcement | `CLAUDE.md` | prose |

### Verification (end-to-end, evidence-backed)
1. **Path→role derivation** — `node scripts/identity-ownership.mjs --owner-role <path>` resolves a test-cases path → `GIVER`, a spec path → `BUILDER`, a REQUIREMENTS path → `HUNTER`, a `plans/`-tree path → `none`; `--is-artifact` returns true for role deliverables and **false** for `plans/`, `scripts/`, and the shared ceremony logs (agent-mistakes / agent-activity-log).
2. **Hook simulation** — 19/19 fixtures GREEN: OWNER+`/execute`+test-cases → **deny** (deny) / **allow+persist** (announce) / **allow** (off); OWNER+`/execute`+`scripts/` → **allow** (all modes, LR-043-safe); OWNER+no-`/execute`+test-cases → **allow**; GIVER+test-cases → **allow**; deny+override-handshake → **allow**.
3. **End-to-end announce** — Layer 1 wrote `identity-gate-warnings-<sid>.json` `{path, role:GIVER, mode:announce}` (the file Layer 4 reads).
4. `npm run validate:sync` → exit 0. `npm run typecheck` → exit 0. `node --check` clean on all 5 modified `.mjs`. identity-ownership exports: 10 (8 + 2 new), 0 removed → importers unaffected.

### Non-goals honored (LR-043 not revived)
- `canWrite()` OWNER short-circuit **untouched** (verified: still `return true` for OWNER; import sanity green). Layer 1 lives in the hook, scoped to pipeline-artifact territory + execution context.
- OWNER framework writes (`plans/`, `scripts/`, `.claude/`, `docs/`, `website/`) never gated (fixture L4 + derivation). Authoring skills' plan-file writes never gated (`plans/**`→false). Shipped `announce` first (knob, not big-bang).

### Deviations from the plan's literal text (intent-faithful; pre-surfaced)
1. **Layer-1 territory criterion widened+narrowed.** The plan's prose said "pipeline role has CREATE/RW", but its own example list includes `selectors` (ADD) and `REQUIREMENTS.md` (HUNTER UPDATE) — neither CREATE/RW — and literal "CREATE/RW" would gate OWNER's mandated `agent-mistakes.md` ceremony append (WATCHDOG=RW). Implemented the **intent**: `isPipelineArtifact` = some pipeline role has a STRONG write (CREATE/RW/UPDATE/ADD/FIX/REFACTOR) **AND** OWNER's grant ≠ APPEND (excludes the two shared ceremony logs). Validated by derivation CLI. The `announce`-first ramp explicitly budgets for territory refinement (step 5), so blast radius is warn-only.
2. **Layer-5 freshness-checker home.** Plan said "`validate-agent-sync.ts` OR `verify:no-stale-refs`". Read both (per the plan's "do not assume"): chose `verify-no-stale-live-refs.mjs` because it ALREADY scans `.claude/agents/` and is the POM `specs/`→`tests/` guard, whereas `validate-agent-sync.ts`'s `STALE_SCAN_DIRS` does NOT include `.claude/agents/`. One brace-shorthand token added; rides the already-wired `pipeline:validate`.

### Deferred / flagged (pre-existing, NOT introduced by this plan; all via Phase-2.5 SPAWN — the LR-060-sanctioned use of a chip for out-of-scope NON-test hygiene, never red tests)
- **§2↔mirror parity drift — RESOLVED this session.** `check-identity-ownership.mjs` was red because §2 had an `rca-*.md` row the `OWNERSHIP_ROWS` mirror lacked (HEAD identically red). The mirror row was added; the script now exits 0 — markdown↔mirror parity AND the new Layer-1d derivation guard both clean (`ownerRoleFor(rca-*)`→HEALER, `isPipelineArtifact`→true). A spawned chip tracked the fix.
- **`.gitignore` over-match — spawned repo-hygiene follow-up (non-test).** `.gitignore:71`'s broad `coverage/` rule over-matches the `.claude/skills/coverage/` dir, silently ignoring the `/coverage` skill (contradicts the file's own "Tracked for collaborators: `.claude/skills/`" comment); both `/coverage` + `/ultracoverage` are new (2026-06-24) and uncommitted at HEAD. My Layer-3 prose edits are correct on disk but cannot be committed until the gitignore is scoped + the skills added — the user's call, not an identity-enforcement edit. **Layer-3 deliverable met at the file level.**
- **6 pre-existing `verify-no-stale-live-refs` hits** (navigation self-doc, 2 pending plans, `sp00-fixme-path` test fixtures) — HEAD identically red; my brace token added 0. Mostly legitimate "was X pre-restructure" self-documentation / deliberate test fixtures. Out of this plan's scope.

### Sibling
- `PLAN_ENCORE_AGENT_DOCS_RECOVER_REFRESH.md` owns the two missing agent-only docs (`clients/encore/docs/REQUIREMENTS (absent — sibling plan owns recovery)` + `MODULE_REGISTRY.md`) — no execution dependency; untouched here per plan scope.
