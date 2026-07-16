# SUBPLAN_LCD_02_ENFORCEMENT_HOLES — Close Bash/read/.md legwork holes

**Status**: DONE
**Executed**: 2026-07-16
**Priority**: P0
**Created**: 2026-07-13
**Identity**: OWNER
**Parent**: PLAN_LAZY_CEO_DELEGATOR.md
**Depends on**: SUBPLAN_LCD_01_CONTEXT_SURGERY.md
**Blocks**: SUBPLAN_LCD_03, SUBPLAN_LCD_04
**Runs-after**: LCD_01
**Collides-with**: LCD_01 (CLAUDE.md pointers), LCD_03 (primer), SUBPLAN_PARITY_BUGFIXES (hooks)
**Model**: claude-opus-4-6
**PermissionMode**: default (PROTECTED files need owner go + SELF_GRANT)
**RiskAcknowledged**: HIGH — touches active enforcement hooks; false-positive nudges could slow legitimate CEO work

---

## Objective

Address the PRIMARY cause of delegation regression (delegation-audit-B): Bash, reads-at-scale, verification, RCA, and `.md` drafting are completely ungated (`delegation-gate.mjs:128-130`). Add a structural speed-bump (WARN-only nudge, never DENY) that makes inline legwork visible and countable without crippling legitimate CEO peeks. Close confirmed arena holes: AH-01 (SELF_GRANT via Bash), AH-09 (`.md` broad-write), AH-20 (doctrine writable).

---

## Preconditions

- `delegation-gate.mjs:128-130` still contains the Bash no-gate comment
- `delegation-gate.mjs:117-118` still contains `if (n.endsWith(".md")) return true`
- LCD_01 landed (worker landing zones exist for compressed pointers to reference)

---

## Step-by-Step

### Phase 1 — Create delegation-nudge hook (PROTECTED — settings.json registration)

**⛔ GATE**: DESCRIBE only. Do NOT execute until Rutvik gives explicit in-chat "go" + SELF_GRANT ceremony. Required backup before modifying `~/.claude/settings.json`: `cp ~/.claude/settings.json ~/.claude/settings.json.bak`

1. Create `~/.claude/hooks/delegation-nudge.mjs`:
   - Type: PreToolUse on `Bash`
   - Fires when: `config.GATE === "on"` AND cwd is the gated repo
   - WARN patterns (delegable legwork): `npx playwright`, `npm test`, `npm run (test|lint|check)`, `playwright-cli`, commands >200 chars with repo source paths, pipe chains with 2+ `grep`/`rg`, `rg -r`/`grep -r` with >50 char patterns
   - EXEMPT patterns (CEO peek): single `cat`/`head`/`grep` ≤1 file, `git log`/`diff`/`status`, `scorecard.mjs`, `copilot-worker.sh` (the dispatch), `ls`/`dir`, `echo`, hook/delegation file inspection
   - Action on WARN: emit `permissionDecision: "allow"` + `permissionDecisionReason` with nudge text
   - Session counter: increment in `C:SERSUTVI.CLAUDESTATESESSION-BASH-NUDGES.JSON` (keyed by session_id)
   - At count ≥3: escalated nudge text referencing self_incidents.log + Receipt audit
   - Counter RESETS on dispatch detection (Bash containing `copilot-worker.sh --ticket`)

2. Register in `~/.claude/settings.json` (or `.local.json`): add PreToolUse entry for Bash → `delegation-nudge.mjs`

### Phase 2 — Narrow `.md` gate (PROTECTED — delegation-gate.mjs change)

**⛔ GATE**: DESCRIBE only. Do NOT execute until Rutvik gives explicit in-chat "go" + SELF_GRANT ceremony. Required backup before modifying: `cp ~/.claude/hooks/delegation-gate.mjs ~/.claude/hooks/delegation-gate.mjs.bak`

3. In `delegation-gate.mjs:117-118`, replace blanket `.md` allow with scope-aware logic:
   ```javascript
   // CEO surfaces: plans/, .claude/, ~/.claude/, ~/.copilot/ — always allowed
   // Worker surfaces: clients/*/tests/, clients/*/src/ — WARN (not deny)
   // Protected .md: already caught by line 117 isProtected check
   function isAllowedMd(normalizedPath) {
     if (isProtected(normalizedPath)) return false; // existing check
     const workerSurfaces = /clients\/[^/]+\/(tests|src)\//;
     if (workerSurfaces.test(normalizedPath)) {
       // Emit advisory: "This .md is in a worker surface — consider ticketing"
       return true; // still allow, but logged
     }
     return true;
   }
   ```

### Phase 3 — Close AH-01 (SELF_GRANT mint via Bash)

**⛔ GATE**: Describes a change to `~/.claude/hooks/delegation-gate.mjs`. Backup required; do NOT self-apply.

4. In `delegation-gate.mjs`, add a check in the grant-creation path: require that the justification references a real ticket ID format (e.g., `TICKET-\d+` or plan filename). Reject grants with generic 3-word justifications. This does NOT change the SELF_GRANT mechanism — it tightens the validation.

### Phase 4 — Close AH-20 (doctrine .md writable without grant)

**⛔ GATE**: Describes a change to `~/.claude/hooks/delegation-gate.mjs`. Backup required; do NOT self-apply.

5. Add to the PROTECTED list in `delegation-gate.mjs:59-68`:
   - `.claude/rules/**` (framework rules)
   - `.claude/skills/**/SKILL.md` (skill definitions)
   - `docs/read_only_docs/**` (read-only docs)
   This makes doctrine changes require explicit grant, matching their "read-only" intent.

### Phase 5 — Verification

6. Test nudge fires: simulate a `npx playwright test` Bash command → confirm `permissionDecisionReason` contains "delegation-nudge" text.
7. Test CEO peek passes silently: simulate `cat delegation-gate.mjs` → confirm no nudge.
8. Test `.md` narrowing: attempt write to `clients/encore/tests/foo.md` → confirm advisory logged.
9. Test SELF_GRANT tightening: attempt grant with justification "aaa bbb ccc" → confirm rejection.
10. Verify existing pipeline not broken: `npm run check:tc-parity` → passes (no false-positive denials on worker Edit/Write operations through the existing gate path).

---

## Verification Artifact

- Screenshot/log of nudge firing on delegable Bash command
- Screenshot/log of silent pass on CEO peek
- `npm run check:tc-parity` exit 0

---

## Rollback

- Delete `~/.claude/hooks/delegation-nudge.mjs` (new file — no git checkout needed, just delete)
- Restore `~/.claude/settings.json` from backup: `cp ~/.claude/settings.json.bak ~/.claude/settings.json` — **`git checkout` does NOT work** for `~/.claude/` files
- Restore `~/.claude/hooks/delegation-gate.mjs` from backup: `cp ~/.claude/hooks/delegation-gate.mjs.bak ~/.claude/hooks/delegation-gate.mjs` — **`git checkout` does NOT work** for `~/.claude/` files

---

### Execution Summary

**Executed 2026-07-16** — council-executed (copilot opus-4.6 + gpt-5.5), Claude-side Opus staging build, owner-authorized apply (Rutvik in-chat "I allow u to do it", 2026-07-16).

**Deliverables landed:**
1. **Phase 1 — delegation-nudge.mjs**: built by copilot opus-4.6 over 3 attempts (R1 credit-cap death at 60cr; R2 completed the 10-case battery at 100cr; R3 fixed the install-location telemetry default — `__dirname`-derived REPO_ROOT breaks when the hook moves from repo staging to `~/.claude/hooks/`; now cwd-derived at WARN time). Final battery 11/11 — re-run independently by the dispatcher (`.claude/state/ua-worker/lcd02-nudge-0716-artifacts/run-tests.verify.txt`). Cross-provider adversarial review (gpt-5.5, run lcd02-nudge-review-0716): **GREEN — installable as-is** (`.claude/state/ua-worker/lcd02-nudge-review-0716-artifacts/verdict.md`). Installed at `~/.claude/hooks/delegation-nudge.mjs`, registered in settings.json (PreToolUse 9→10, backup `settings.json.bak-lcd02`).
2. **Phases 2+3+4 — delegation-gate.mjs v5**: .md worker-surface advisory (WARN-only), SELF_GRANT ticket/plan-anchor validation, doctrine paths (`.claude/rules/`, `docs/read_only_docs/`, `.claude/skills/**/SKILL.md`) added to PROTECTED. Built by Claude-side Opus subagent in scratchpad staging with 19/19 offline probes; installed via the owner-authorized APPLY ceremony.
3. **Folded riders (dispatcher-approved)**: PBUG-08 gate-fires telemetry (live — CSV verdicts landing in `.claude/state/gate-fires.log`), PBUG-09 identity-last fix, /assistants master-switch wiring (OFF = Claude-solo harness, ON = CEO harness).

**Verification results (plan Phase 5, items 6–10):**
1. Item 6 (nudge fires): live probe on the INSTALLED hook → allow + `delegation-nudge [1 this session]…` + CSV announce in `.claude/state/gate-fires.log`; additionally observed firing in-harness on the dispatcher's own `npm run` Bash call (session 92727b65).
2. Item 7 (CEO peek silent): single-file `cat` probe → allow, no reason emitted.
3. Item 8 (.md advisory): Edit probe on `clients/encore/tests/foo.md` → allow + worker-surface advisory + announce telemetry.
4. Item 9 (grant tightening): grant with anchor-less justification → deny citing missing TICKET/PLAN/SUBPLAN anchor.
5. Item 10 (pipeline unbroken): `npm run check:tc-parity` → exit 0, PASS.
6. Master-switch battery: 8/8 — assistants OFF → source edit allowed; ON → denied; PROTECTED (gate file itself) denied in BOTH modes; real assistant-state restored to ON after probing.

**Deviations:**
- APPLY-LCD02.cmd shipped with LF line-endings + a cmd parser defect in its Step-3 block; steps 3–5 were completed manually 1:1 with the reviewed script (PowerShell), every placed hook `node --check` clean. Live hooks were verified untouched before the retry.
- The telemetry-default defect was FOUND by live install verification after a GREEN review — the reviewer had flagged it as advisory ADV-2; dispatcher initially mis-dispositioned. Lesson recorded in dispatcher-lessons (install-location vs `__dirname`).
- ADVISORY backlog (non-blocking, for future hardening): WARN regexes are case-sensitive; the gate emits an informational allow-note when assistants=OFF (cosmetic).

**Documentation changes:** none-needed — hook file headers carry Sev class + graduating incident per LR-069; the skill/rule layer already documents the switch semantic (`.claude/skills/assistants/SKILL.md`, rewritten 2026-07-16).

**Test pass confirmation:** 11/11 nudge battery + 8/8 live master-switch probes + `check:tc-parity` exit 0 — all 2026-07-16.
