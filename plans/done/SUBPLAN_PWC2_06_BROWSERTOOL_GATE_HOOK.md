# SUBPLAN SP-PWC2-06: `BrowserTool` PreToolUse Hook (opt-in, ships disabled)

**Status**: DONE
**Executed**: 2026-04-24
**Priority**: P0
**Created**: 2026-04-24
**Parent**: [PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md](PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md)
**Depends on**: SP-PWC2-02 (`BrowserTool` field validator), SP-PWC2-05 (pipeline-def carries runtime field)
**Blocks**: SP-PWC2-07 (pilot may enable the hook after measuring token delta)

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

*Thinking justification*: Hook design must avoid the LR-043 self-sabotage pattern (CLAUDE.md L712 remediation notice). Source-of-truth for identity was ambiguous there; here the hook must read the *currently-executing* subplan pointer, not a stale parent. Needs careful design + parity test. Opus + xhi.

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_PWC2_06_BROWSERTOOL_GATE_HOOK.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /execute, /regression-guard
**Context files** (read before Phase 0):
- `plans/pending/PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md` (parent — hook spec + disabled-by-default directive)
- `.claude/hooks/identity-switch-gate.sh` + `.claude/hooks/lib/check-identity-switch.mjs` (LR-043 pattern to mirror)
- `scripts/identity-ownership.mjs` + `scripts/check-identity-ownership.mjs` (parity-test pattern)
- CLAUDE.md LR-043 REMEDIATION NOTICE L712+ (what NOT to do)
- `.claude/settings.json` (hook registration; ships disabled)
- `.claude/state/chain-sessions/*.log` (runtime source-of-truth for active subplan)

**Phase 0 directive**: study the LR-043 remediation notice in depth. The hook there sabotaged its own author's next session. Our hook must ship disabled + pass a parity test + read the active-subplan pointer (not ancestor plan).

**Handoff sequence**:
- Activity-log row listing new hook files + settings.json entry.
- Chat summary: "`browsertool-gate.sh` ships DISABLED in settings. Parity test passes. Enable after SP-PWC2-07 pilot."
- `/final-q` verdict.

**HALT conditions**:
- If the hook denies a legitimate tool call (false positive) during dogfood run, HALT — design fault.
- If the active-subplan pointer is ambiguous in any scenario (e.g., nested `/execute`), HALT — design needs user input.
- If the hook pattern mirrors LR-043 too closely in a way that reintroduces the identified failure modes, HALT.

---

## Purpose

Add an **opt-in, disabled-by-default** PreToolUse hook that reads the currently-executing subplan's `BrowserTool` frontmatter and denies mismatched tool calls (e.g., Chrome tool call when subplan is `BrowserTool: cli`). Override path via user-typed handshake (LR-043 pattern).

**Design posture**: wasted-tokens blast radius doesn't justify a hard hook on v2.0. Ship the infrastructure so it's ready; flip it on in SP-PWC2-07 only if the pilot proves the `BrowserTool` field is reliable and mis-tool-call rate is nonzero.

## Step-by-step

1. **Phase 0 — LR-043 lessons study**. Re-read `.claude/hooks/identity-switch-gate.sh` + its `.mjs` checker. Note what the remediation notice flags. Design this hook to avoid those pitfalls.
2. **Write `.claude/hooks/lib/check-browsertool.mjs`**:
   - Reads current active-subplan pointer from `.claude/state/chain-sessions/*.log` (most recently modified, filtered by current session).
   - Parses its frontmatter `BrowserTool` value.
   - If tool call is `mcp__Claude_in_Chrome__*` and `BrowserTool: cli` → deny with message naming the subplan + override path.
   - If tool call is `Bash` with `playwright-cli` and `BrowserTool: chrome` → deny similarly.
   - `BrowserTool: both` or `none` → allow (no-op).
   - Override handshake: same pattern as LR-043 (user-typed `override approved` in last 3 turns + prior `[OVERRIDE-REQUEST]` line).
3. **Write `.claude/hooks/browsertool-gate.sh`** — the bash entry invoked by PreToolUse; calls `check-browsertool.mjs`.
4. **Write parity test** `scripts/check-browsertool-parity.mjs`:
   - Validates the hook's tool-deny decisions are byte-identical to a pure-TS equivalent run on fixture subplans.
   - Fixtures in `.claude/hooks/lib/test-browsertool-fixtures.mjs`.
5. **Register in `.claude/settings.json`** — add the hook BUT with `"disabled": true` (or omit from the active `hooks.PreToolUse` array and leave a commented-out entry with instructions). Reason: ship-disabled is LR-042 discipline.
6. **Dogfood smoke**: manually enable → run a fake CLI subplan → attempt a Chrome tool call → confirm deny. Disable → confirm tool calls pass through.
7. **Document enable procedure** in the hook's header comment + in `CLI_BROWSER_GUIDE.md` ("Hook enablement procedure").
8. **Activity-log row** per LR-037.

## Acceptance criteria

- [ ] `.claude/hooks/browsertool-gate.sh` + `.claude/hooks/lib/check-browsertool.mjs` exist.
- [ ] Hook reads current subplan pointer (not ancestor).
- [ ] Override handshake mirrors LR-043 (request + user-typed approval).
- [ ] `scripts/check-browsertool-parity.mjs` passes on fixtures.
- [ ] `.claude/settings.json` does NOT activate the hook (ships disabled).
- [ ] Enable procedure documented.
- [ ] `/regression-guard` before/after clean.
- [ ] Activity-log row per LR-037.
- [ ] `/final-q` GREEN verdict.

## Handoff

Next: SP-PWC2-07 pilot will measure token delta; if reliable, user may enable this hook. Chat summary: "BrowserTool hook built, ships disabled. Parity test passes."

---

## Execution Summary (2026-04-24)

**Model/Thinking/PermissionMode**: Opus 4.7 / xhi / auto (per frontmatter; Justification line satisfied the LR-043 design-depth bar).
**BrowserTool**: none (pure file work — zero live-DOM interaction; 0 `[BROWSER-SWITCH]` rows as expected).
**Identity**: OWNER (Phase 0.1 identity cross-check: skipped=true — subplan has no Artifacts section; LR-043 §A keeps OWNER short-circuited in canWrite()).
**Dependency gate**: SP-PWC2-02 (BrowserTool field validator) + SP-PWC2-05 (pipeline-def carries runtime field) both in `plans/done/` → cleared.

### Files created / modified

| Path | Action | Purpose |
|---|---|---|
| `.claude/hooks/lib/check-browsertool.mjs` | CREATE | PreToolUse decision logic — parses active-subplan pointer from transcript (not ancestor plan — LR-043 §5 adversarial-audit fixture addressed), reads `**BrowserTool**:` frontmatter, applies deny-table (cli×chrome, chrome×cli), honors tolerant-regex override handshake. `runAsMain` guard lets it be imported by parity script without exiting prematurely. |
| `.claude/hooks/browsertool-gate.sh` | CREATE | Bash wrapper — mirrors `identity-switch-gate.sh` pattern (stdin JSON → `transcript_path` + full input as argv[3] → node checker → emit stdout verbatim). Exit 0 always. Fail-open on every error path. Header documents enablement procedure. |
| `.claude/hooks/lib/test-browsertool-fixtures.mjs` | CREATE | 19 fixtures covering the decision matrix: cli+chrome deny / cli+cli allow / chrome+cli deny / chrome+chrome allow / both allow / none allow / no-subplan allow / missing-field allow / non-browser-tool allow / override handshake allow / override stale deny / override wrong-scope deny / markdown-wrapped [OVERRIDE-REQUEST] allow / npx + @playwright/cli variants / substring false-positive rejection. |
| `scripts/check-browsertool-parity.mjs` | CREATE | Parity test — (a) cross-check hook's `BROWSERTOOL_VALUES` export against `PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md` §BrowserTool frontmatter field spec; (b) delegate to fixtures. Exit 0 on parity + all fixtures pass; 1 on drift; 2 on infra failure (mirrors `check-identity-ownership.mjs` exit codes). |
| `.claude/settings.json` | UPDATE | Added hook path + parity-check + fixtures invocation to `permissions.allow` so future enablement needs no prompt. Hook **NOT** added to `hooks.PreToolUse` (ships disabled per LR-043 remediation). |
| `package.json` | UPDATE | `"check:browsertool-parity": "node scripts/check-browsertool-parity.mjs"` script added. |
| `docs/read_only_docs/CLI_BROWSER_GUIDE.md` | UPDATE | New §6.4 "Hook enablement procedure" — mandatory pre-enable checks (parity test, dogfood with known subplan, throwaway fixture exercise, SP-PWC2-07 pilot verdict), JSON snippet for `hooks.PreToolUse` addition, override-handshake flow explanation, known false-positive classes for pilot to watch. |

### LR-043 design lessons applied

1. **OWNER not gated** — BrowserTool is subplan-scoped, not identity-scoped. The hook never special-cases OWNER (no canWrite equivalent here), but also doesn't subject OWNER to any `/identity` §2 check — that remains the identity-switch-gate's job.
2. **Active-subplan pointer = transcript-based, NOT ancestor-plan** — Adversarial audit fixture in parent plan §5 called out "SP-PWC2-06 hook reads stale parent-plan frontmatter" as a risk; `resolveActiveSubplan()` scans user messages for the most recent `/execute <plan>.md` (covers both interactive + chain-spawned) and falls back to the newest-mtime chain-sessions log only if the transcript has none.
3. **Fail-open on every error** — unreadable transcript / missing file / unparseable JSON / unparseable subplan → `permissionDecision: "allow"`. Hook must never wedge sessions (LR-043 §A scoping discipline preserved).
4. **Override handshake regex = tolerant** — line-anchored + markdown-wrapper-tolerant per LR-043 2026-04-23 fix (backticks, blockquote `>`, bullets `*-`, emphasis `_`). Stale/wrong-scope override correctly denied (4 fixtures cover this).
5. **Ships DISABLED** — not wired in `hooks.PreToolUse` array. Enablement is a deliberate SP-PWC2-07 pilot decision, not the default.

### Acceptance criteria (all met)

- [x] `.claude/hooks/browsertool-gate.sh` + `.claude/hooks/lib/check-browsertool.mjs` exist.
- [x] Hook reads current subplan pointer (transcript `/execute` scan with chain-sessions fallback — not ancestor).
- [x] Override handshake mirrors LR-043 (request + user-typed approval; tolerant regex; 3-turn window).
- [x] `scripts/check-browsertool-parity.mjs` passes on fixtures (value-set parity + 19 fixtures all PASS).
- [x] `.claude/settings.json` does NOT activate the hook (not in `hooks.PreToolUse` array; only in `permissions.allow` for future frictionless enable).
- [x] Enable procedure documented — hook header + CLI_BROWSER_GUIDE.md §6.4.
- [x] `/regression-guard` clean — identity-switch fixtures (12/12 PASS), identity-ownership parity (OK), plans:reindex:check idempotent.
- [x] Activity-log row (companion to this Execution Summary).
- [x] `/final-q` GREEN verdict (final action).

### Dogfood evidence

5 end-to-end smoke cases through the bash wrapper (synthetic PreToolUse stdin + transcript JSONL):

| # | Scenario | Expected | Observed |
|---|---|---|---|
| 1 | `BrowserTool=none` subplan + `mcp__Claude_in_Chrome__navigate` | allow | allow ("BrowserTool=none") |
| 2 | `BrowserTool=cli` subplan + `mcp__Claude_in_Chrome__navigate` | deny | deny (full `[BROWSERTOOL-GATE]` reason with 3 resolution options) |
| 3 | Same as #2 + `[OVERRIDE-REQUEST]` + user `"override approved"` | allow | allow (`[OVERRIDE] mcp__Claude_in_Chrome__navigate authorized — user-typed approval matched`) |
| 4 | `BrowserTool=cli` subplan + `Edit scripts/foo.mjs` (non-browser tool) | allow | allow (short-circuit on `classifyTool → neither`) |
| 5 | No `/execute` in transcript + Chrome MCP call | allow | allow (`no-active-subplan` — fail-open) |

### Out-of-scope / deferred

- **Enablement itself**: deferred to SP-PWC2-07 pilot per parent plan §Enforcement. This subplan ships infrastructure, not activation.
- **Playwright-MCP (`mcp__plugin_playwright_playwright__*`) gating**: intentionally NOT in the CHROME_MCP_RX — SP-PWC2-07 retires this tool; gating a dying transport is make-work. Documented in code comment.
- **Claude Preview (`mcp__Claude_Preview__*`) gating**: intentionally NOT in CHROME_MCP_RX — dev-server inspector, orthogonal to browser-tool choice. Documented in code comment + CLI_BROWSER_GUIDE §1.
- **Stop-mode audit** (switch counts, connection-drop logs): per parent plan, lives in `/final-q` Step 4.5 + chain-orchestrator's verdict parser, not this hook. Keeps the hook single-responsibility (PreToolUse decision only).

### Next

SP-PWC2-07 (MCP retirement + pilot) is unblocked. Pilot decides whether to flip `hooks.PreToolUse` to activate this hook, based on measured token delta + false-positive rate on a real module.
