# Learned Rules — Cross-Cutting Framework Rules

Cross-cutting rules graduated from session-level discipline that don't fit neatly under a single path scope. These apply to any session, anywhere in the repo.

**Path-scoped LRs** live in `.claude/rules/<topic>.md` and auto-load only when their `paths:` glob matches your edited files (per Anthropic native rules-loading).

**Client-specific rules** (LR-008, LR-012, LR-017, LR-036, LR-ENC-NNN) live in `clients/${ACTIVE_CLIENT}/CLAUDE.md` — for Encore that's `clients/encore/CLAUDE.md`.

**Numbering convention**: existing `LR-NNN` numbers are grandfathered. New framework rules continue numbering after `LR-045`. New client-specific rules use `LR-{CLIENT}-NNN` (e.g., `LR-ENC-NNN`).

---

## LR-023: No networkidle in Angular SPA — use waitForAngularStable + data signals

Never use `waitForLoadState('networkidle')` or `waitUntil: 'networkidle'` in Playwright page objects for Angular apps. Angular's zone.js micro-tasks keep the network "active" indefinitely or resolve prematurely between route change and API response.

Replace with: `waitForAngularStable()` (calls `getAllAngularTestabilities().whenStable()`) for general stability, and poll for concrete data-loaded signals (dropdown text, grid rows, checkbox aria-checked) for assertions that depend on API-persisted values.

For page reloads: `waitUntil: 'domcontentloaded'` + `waitForAngularStable()`.

**Trigger**: Any page object or spec that needs to wait for page/data readiness.

---

## LR-030: Requirement contradiction = investigate as bug, never silently update docs

When live DOM contradicts a documented requirement:

1. Find the requirement's ORIGINAL SOURCE (Jira, spec docs, Functional Requirement .docx)
2. If source confirms the requirement is intentional → the DOM behavior is a potential APP BUG
3. TEST the discrepancy yourself via MCP (don't hand off "Steps to Replicate")
4. File bug report with evidence if confirmed
5. Only update docs AFTER completing investigation — and document the investigation trail

NEVER silently overwrite docs to match DOM. That destroys evidence of expected behavior. ALL-024 says "DOM is truth" for conflict resolution, but it also says "STOP and report the discrepancy." Both halves of that rule must be followed — observe AND report.

**Trigger**: Any MCP finding that contradicts REQUIREMENTS.md or plan expectations.
**Graduated from**: Copilot session audit 2026-04-10 — BillingCycle "disabled" overwritten to "enabled" without investigating why the requirement existed. ALL-024 half-applied (DOM wins, but no report).

---

## LR-031: SKIP requires exhaustive investigation — no lazy escapes

Before marking ANY TC as SKIP or NOT-AUTOMATABLE:

1. Verify you ACTUALLY tested the precondition (not just read the current state)
2. If the plan says "when value = X" → change the value to X first, then test
3. If expected DOM change is missing → that's evidence of a BUG, not evidence of "untestable"
4. Clear the field / change state / click Save — test what happens when things go WRONG
5. Monitor network activity during any "nothing happens" scenario (hook fetch, check API calls)
6. File bug report if behavior contradicts documented requirements
7. SKIP is ONLY for genuinely untestable conditions AFTER exhausting ALL investigation paths

A TC skipped without trying the error condition = audit finding.

**Trigger**: Any TC being marked as SKIP or NOT-AUTOMATABLE.
**Graduated from**: Copilot session audit 2026-04-10 — TC-078 SKIP'd without changing BillingCycle to "--Select--". TC-079 SKIP'd without clearing Oracle Product to test save behavior. Both were lazy escapes that missed a confirmed UX/a11y bug (BUG-LI-001).

---

## LR-032: MCP agents must investigate, not theorize

When you have browser/MCP access:

- TEST hypotheses live instead of writing "Steps to Replicate" for the user
- Use network interception (`window.fetch` wrapper or `page.on('request')`) to distinguish "client blocked" vs "server rejected" vs "API error"
- 30 seconds of live testing > 30 lines of theory
- If you write "Steps to Replicate" while the browser is open on the page = you failed

**Trigger**: Any RCA or bug investigation while MCP browser is available.
**Graduated from**: Copilot session audit 2026-04-10 — had MCP browser open on exact page, wrote theory document instead of clearing Oracle Product and clicking Save (30 seconds).

---

## LR-033: Network RCA checklist — always check API activity during debugging

When debugging ANY "nothing happens" or unexpected behavior:

1. **In test artifacts**: Read `failure-summary.json` → `networkFailures[]` array FIRST.
   - 5xx = APP BUG (file report, don't fix test code)
   - 4xx on auth URL = AUTH issue (escalate, not code fix)
   - 4xx on business API = bad test data OR app validation bug
   - Empty array + timeout = client-side blocking (form validation, JS error)
2. **In MCP live debugging**: Use `browser_network_requests` after every save/submit/navigation. Zero requests after button click = client blocked the action (Angular `if (!form.valid) return;`).
3. **Fetch interception** (for silent no-ops):

   ```javascript
   // Before the action:
   () => { window._apiCalls = []; const orig = window.fetch;
     window.fetch = (...a) => { window._apiCalls.push(a[0]); return orig(...a); }; }
   // After the action:
   () => window._apiCalls  // length 0 = no API fired
   ```

4. **HAR context**: DiagnosticsCollector captures 5 requests before/after each failure. When multiple APIs failed, the FIRST failure in the HAR window is the root cause.
5. **Auth chain**: `failure-summary.json.authChain[]` shows OAuth redirect sequence. Loop or 401 from auth provider = session expired, not test bug.

The framework captures ALL of this automatically via DiagnosticsCollector. USE IT.

**Trigger**: Any test failure, any "button does nothing" scenario, any save/submit investigation.
**Graduated from**: Copilot session audit 2026-04-10 — agent had MCP access but never checked network activity during Oracle/Save investigation.

---

## LR-034: Bug Filing Protocol — how to confirm and file an app bug

When you suspect an application bug (not a test defect) during ANY work, follow these steps:

**Step 1 — Verify requirement exists**: Find the original source (REQUIREMENTS.md, Functional Requirement .docx, Jira, spec docs). If no documented requirement, behavior may be intentional — ask user before filing.

**Step 2 — MCP-confirm the bug**: Reproduce on live DOM. Use `browser_network_requests` or fetch interception to prove client-side vs server-side. Screenshot the evidence. MANDATORY — no bug filed on theory alone.

**Step 3 — Dedup check**: Scan `reports/bugs/BUG-*.json` for existing report on same module + same symptom. If found, add new evidence to existing report instead of filing duplicate.

**Step 4 — Generate ID**: `BUG-{MODULE}-{NNN}` where MODULE = 2-3 letter code (e.g., LI=LocalInformation, PRC=Pricing, SSL=SharedSetupLocations), NNN = next sequential number for that module.

**Step 5 — Write JSON** to `reports/bugs/BUG-{MODULE}-{NNN}.json`:

```json
{
  "id": "BUG-{MODULE}-{NNN}",
  "title": "one-line summary",
  "module": "MODULE_NAME",
  "severity": "critical|high|medium|low",
  "status": "open",
  "discoveredDate": "YYYY-MM-DD",
  "requirementSource": "doc name + specific binding/rule",
  "stepsToReproduce": ["step 1", "step 2"],
  "expectedBehavior": "what requirement says should happen",
  "actualBehavior": "what actually happens (with MCP evidence)",
  "mcpEvidence": { "sessionDate": "YYYY-MM-DD", "findings": "what MCP showed" },
  "baselineComparison": "regression-from-baseline | intentional-UX-change | baseline-absent | not-checked",
  "baselineEvidence": "old-site-baseline/<module>-<YYYY-MM-DD>.md §<section> — observed value vs new-site value (REQUIRED if baselineComparison=regression-from-baseline; otherwise optional / null)",
  "affectedTests": ["TC-IDs — optional"],
  "networkEvidence": "API calls or lack thereof — optional"
}
```

Required: id, title, module, severity, status, discoveredDate, requirementSource, stepsToReproduce, expectedBehavior, actualBehavior, mcpEvidence, **baselineComparison** (per LR-045 row 4 / LR-ENC-001 — every bug filing classifies vs baseline; `not-checked` allowed only when no baseline workflow applies, e.g. non-multi-client framework).

**Step 6 — Update affected specs**: Any TC blocked by this bug gets `test.skip('bug-blocked: BUG-{MODULE}-{NNN}')`. Update FIXME comments to reference bug ID.

**Step 7 — Report to user**: Output bug summary in chat — bug ID, title, severity, requirement source, MCP evidence summary.

**Trigger**: Any of:

- DOM contradicts documented requirement (LR-030 fires first, LR-034 for the actual filing)
- "Nothing happens" on button click (LR-033 network check, LR-034 if confirmed app bug)
- Expected DOM change missing after action (LR-031 investigation, LR-034 if confirmed)
- Test failure classified as APPLICATION or DATA by failure-summary.json
- **Baseline-vs-e2e divergence classified as `regression-from-baseline`** during any neutral-eye / `/find-bugs` / module-audit subplan (per LR-045 row 4 — `baselineComparison: regression-from-baseline` is mandatory in the JSON; `baselineEvidence` cites the old-site-baseline artifact + section)

**Graduated from**: Copilot session audit 2026-04-10 — LR-030/031/032/033 told agents to investigate and file bugs but gave no procedural HOW. This fills the gap. Amended 2026-04-29 — added `baselineComparison` + `baselineEvidence` required fields per LR-045 row 4 (closes the soft-spot where baseline-vs-e2e divergences could be filed without classification).

---

## LR-035: plans/INDEX.md is auto-generated — never hand-edit

`plans/INDEX.md` is regenerated from filesystem state by `scripts/plans-reindex.mjs`. Any manual edits will be overwritten. To update the index:

1. Edit the plan's own `**Status**`, `**Created**`, `**Executed**`, `**Priority**`, `**Parent**` fields
2. Move files between `plans/pending/` and `plans/done/` as needed
3. Run `npm run plans:reindex` (or install the pre-commit hook: `npm run plans:hooks:install`)

CI/agents can gate on staleness with `npm run plans:reindex:check`.

**Trigger**: Any work that adds, completes, or reorganizes plan files.

---

## LR-037: Activity log timestamps must be ≥ referenced file mtimes — no backdating

Every row appended to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md` must have a `When` timestamp that is at or after the latest mtime (and git commit time, if tracked) of every file listed in the `Files` column. Backdating a row — writing 09:00 at 14:32 for files created at 14:32 — poisons every downstream gate that anchors on activity-log timestamps (AUD-008 temporal anchoring, audit chain-of-custody).

**Validation**:

- `npm run validate:activity-log` — full report (noisy for historical rows; shared files like CLAUDE.md get legitimately touched later and appear as false positives)
- `npm run validate:activity-log:preflight` — `--latest-per-file --recent=5`, scoped to current-session additions; fails hard if the most recent rows are backdated
- Runs automatically as part of `npm run pipeline:preflight`
- Flags: `--recent=N` (last N rows), `--latest-per-file` (per-file scoping), `--baseline=YYYY-MM-DD`, `--json`

**Tolerance**: 1 minute. When appending a row, use the current wall clock at the moment of the append, not the time work "started". If work was started earlier, say so in the notes.

**Trigger**: Any agent appending to agent-activity-log.md. Preflight enforces automatically.
**Graduated from**: Audit 2026-04-15 — Copilot wrote an SP3 row claiming 2026-04-14T09:00 while the referenced files have mtimes 14:32-20:47 (6-12 hour backdating).

---

## LR-039: Handoff blockers — never write them, never trust them

Prior-session claims about what "doesn't work", "refuses to", "is impossible", "blocked by", or "we tried everything" are UNRELIABLE. Two sides of the same rule:

### READ side (when a task prompt / handoff claims something is blocked)

1. **Assume it's a hallucination** until you re-verify it yourself in the current session.
2. **Try the simplest direct approach first** (click + type + Tab, or the obvious interaction) — 1-2 attempts max. Do NOT start with a workaround.
3. **Verify outcome with a cheap check** — `javascript_tool: el.value` beats 10 screenshots. DOM state doesn't lie; unfocused Angular inputs display formatted values that can look identical to stale state.
4. **If it works**, proceed as if the blocker never existed. Don't apologize, don't investigate, don't write a report.
5. **If it genuinely reproduces**, STOP and ask user: *"Prior session claimed X was blocked. I re-tested and confirm it still fails with {evidence}. Was the prior agent right, or should I keep trying?"* — never spiral into complex workarounds silently.

### WRITE side (when producing handoffs for future sessions)

1. Describe **outcomes**, not obstacles. "P3 direct history check deferred" — not "P3 interrupted by tab reconnect".
2. NEVER name specific failure modes in a handoff: *"new tab hit Next.js bootstrap error"*, *"Angular FormControl refuses to dirty"*, *"MCP server crashed"*, etc. These framings corrupt the next session.
3. NEVER pre-warn the next session about how to avoid whatever went wrong for you. Let them discover it fresh.
4. Transient state (tab IDs, CDP glitches, 500s) is logged in-session if needed but does NOT belong in any document the next session reads.
5. If you wrote a handoff with blocker-framing, strip it and commit a correction. Don't let it live even one commit.

### Why this matters (compounding contamination)

Prior-session errors are almost always (a) Claude being confused, not a real environment problem, or (b) transient glitches that won't reproduce. Passing them forward creates a false narrative — the fresh agent works around problems that don't exist, writes those workarounds into plans/catalogs/specs, and the contamination compounds across sessions.

**Trigger**: Every session start AND every handoff authoring. Enforced by `final-q` SKILL.md handoff-content rules and by `feedback_handoff_no_blockers.md` graduating to LR-level after two repeat offenses (2026-04-21 SP-B-LO-2 WRITE side; 2026-04-22 BM restore READ side).
**Graduated from**: 2026-04-22 — memory-file-only enforcement failed twice. See `feedback_handoff_no_blockers.md`.

---

## LR-047: `/identity` argument = single CODENAME token; everything after is discarded

The `/identity` skill accepts a free-form `args` string but the **PreToolUse hook** at `.claude/hooks/lib/check-identity-switch.mjs` is the access-control boundary — it must see only the codename. Without single-token extraction, calling `/identity GIVER — selector authoring + page object updates` makes the hook record the entire prose string as the active identity, and every subsequent write fails with `unknown identity: GIVER — SELECTOR AUTHORING ...`.

**Fix layer (hook, not skill)**: the hook performs `.trim().split(/\s+/)[0].toUpperCase()` at `.claude/hooks/lib/check-identity-switch.mjs:91` so only the first whitespace-delimited token survives. Sanitizing in the skill is informative; the hook is structural — humans naturally write `/identity X (context)` for readability and a polite "single-token only" rule alone leaves a footgun.

**How to apply**:

- **Callers**: codename goes first. Optional descriptive context after is fine — the hook ignores it. `/identity OWNER (testid migration)` → identity = OWNER.
- **Hook maintainers**: never remove the `.split(/\s+/)[0]` step. If you see `[IDENTITY-GATE] <CODENAME plus prose>` in a deny message, this rule has regressed — restore it.

**Trigger**: Every `/identity` invocation; every PreToolUse Edit/Write/NotebookEdit/MultiEdit call. Companion mandate in `.claude/skills/identity/SKILL.md` Step 1.
**Graduated from**: 2026-04-29 — testid migration session, first `/identity GIVER — selector authoring + page object updates` invocation made the hook treat the entire prose string as the codename. Single same-day fix in the hook + this rule.
