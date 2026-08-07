> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_60_JIRA_READONLY_HARDGATE.md`. All context below.**
>
> 1. **Identity**: OWNER (framework infra — no pipeline identities invoked).
> 2. **Skills**: `/execute` (orchestrator) + `/regression-guard` wrap on Phase 2/3 machine edits.
> 3. **Model + thinking + permission-mode**: read the frontmatter fields below (LR-041).
> 4. **Dependency gate**: none — this plan depends on nothing.
> 5. **Context load**: read this file in full, then `.claude/hooks/lib/check-identity-switch.mjs` (the deny-mechanism template) and `copilot-worker.sh` lines 242–245 (the worker permission profile).
> 6. **Browser tool**: none — no live app interaction (frontmatter declares it).
> 7. **Phase 0 FIRST** — baseline re-verification before any edit.
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, activity-log row (LR-028), `git mv` to plans/done/, `npm run plans:reindex`, commit.
>
> **HALT + ASK RUTVIK** if: any `[RUTVIK-GO]` item below is reached without his recorded go / Phase 0 finds the surface shifted (new Atlassian server id, new write tools, deny rules already present) / regression-guard shows unrelated changes / a live Copilot dispatch is running when Phase 3 wants to edit `copilot-worker.sh` (never edit it mid-dispatch — bash resumes by byte offset).

---

# PLAN_60_JIRA_READONLY_HARDGATE — Jira/Confluence writes structurally impossible for Claude AND Copilot

**Status**: Pending
**Created**: 2026-08-07
**Identity**: OWNER
**Model**: opus
**Thinking**: hi
**PermissionMode**: default
**BrowserTool**: none
**Depends on**: none
**Owner directive (verbatim intent)**: "we need to make sure claude OR copilot CAN NEVER CUD the jira, only R... NEVER EVER!"

## Context

- Rutvik's standing rule (2026-07-13, auto-memory `feedback_jira_readonly_and_subagent_trust_toggle.md`): **"Jira/Confluence = READ-ONLY. No write grant at all"** — he holds Jira edit himself. Confluence is inside that directive verbatim, so this plan covers both. (If Rutvik wants Jira-only, strike the 4 Confluence tools from the deny list — one-line change.)
- Today that rule is **prose only**. Recon (2026-08-07) found ZERO deny rules: `.claude/settings.json` deny = 4 git entries; `settings.local.json` and `~/.claude/settings.json` have **no deny key at all**. All 10 mutating Atlassian MCP tools are callable right now.
- Worse, the prose points the wrong way: `worker-ext.md:43` + `:251` forbid **workers** from Jira writes but explicitly **retain the write path on Claude**. And `agent-mistakes.md:49` records the directive only as a parenthetical ("NOT filed in Jira (user directive: no Jira writes)").
- Recon also found a **REST bypass no gate can see**: `website/frontend/src/data/jiraconfig.txt` is git-TRACKED and holds a live Atlassian API token triple (tenant `jade-biz-ai-qe-team.atlassian.net`), with a matching REST client at `website/backend/src/services/jira.service.ts` (GET-only today, nothing enforcing that). A bare `curl -X POST` with that token writes Jira with zero hooks in the way.
- **Severity (LR-069 §3.1)**: a Jira write is irreversible and client-visible → **S0**. S0 is the sole exception to the announce-first ramp — the gate lands directly at `deny`. No announce phase.

## Design — four reach-paths, one layer each, plus doctrine

| # | Reach path | Blocker this plan lands |
|---|---|---|
| 1 | Claude → Atlassian MCP write tools | L1 settings deny + L2 PreToolUse hook (suffix-regex, survives connector UUID change + `--dangerously-skip-permissions`, fires for subagents/workflow agents too) |
| 2 | Claude → Bash REST (`curl`/`wget`/`iwr` + token) | L2 hook `--bash-mode` on the existing Bash matcher chain |
| 3 | Copilot worker → Atlassian MCP | L3 wrapper preflight: FATAL if any atlassian/jira/confluence server ever appears in `~/.copilot/mcp-config.json` (today: none — keep it that way structurally) + worker rulebook line |
| 4 | Any other machine session (other repos, other CWDs) | L4 user-level `~/.claude` deny + hook mirror `[RUTVIK-GO]` |

**The deny set** (Phase 0 re-derives this machine-owned — the list below is the 2026-08-07 snapshot, 10 tools):
`createJiraIssue, editJiraIssue, transitionJiraIssue, addCommentToJiraIssue, addWorklogToJiraIssue, createIssueLink, createConfluencePage, updateConfluencePage, createConfluenceFooterComment, createConfluenceInlineComment`

**Read set stays untouched**: `getJiraIssue, searchJiraIssuesUsingJql, getVisibleJiraProjects, getTransitionsForJiraIssue, lookupJiraAccountId, atlassianUserInfo, getAccessibleAtlassianResources, fetch, search, getConfluence*` etc. LR-063 / LR-ENC-004 read mandates are explicitly UNCHANGED — this plan blocks writes, not reads.

**Hook match rule** (belt + suspenders, fail-closed for future tools):
- deny if tool-name suffix ∈ explicit deny set (above), OR
- deny if suffix matches `(?i)(jira|confluence|issuelink|worklog)` AND starts with `(?i)(create|edit|update|delete|transition|assign|archive|add|set|remove|move|clone|link)`.
- False-positive check against the live read set: `getTransitionsForJiraIssue`, `lookupJiraAccountId` start with get/lookup — pass. Fixtures encode this.

**Bash-mode match rule**: deny when the command contains a network verb (`curl|wget|iwr|Invoke-WebRequest|Invoke-RestMethod|httpie|http `) AND (`atlassian.net` OR `/rest/api/`). Greps/`git log` over files mentioning atlassian.net stay allowed — the discriminator must vary (fixtures prove allow AND deny cases).

## Prior-Fix Trial (recurrence-gate, /planning Step 3)

| Prior fix | What it did | Why it can't hold alone | Verdict |
|---|---|---|---|
| Auto-memory rule 2026-07-13 (`feedback_jira_readonly_and_subagent_trust_toggle.md`) | Prose directive: no Jira/Confluence write grant | `prose-not-mechanism` — no blocking layer; any session (or compaction-degraded session) can call `editJiraIssue` today | CONVICTED as sole defense; RETAINED as doctrine layer, updated to point at the mechanism |
| `worker-ext.md:43` + `:251` | Forbids workers from Jira writes | `scoped-wrong` — explicitly retains the write path "on Claude's path"; the inverse of the owner directive | CONVICTED; rewired by Phase 1 (LR-050 — no sediment left idling) |
| `agent-mistakes.md:49` parenthetical | Records "user directive: no Jira writes" once | `prose-not-mechanism` — narrative inside a mistake log, not greppable policy | Subsumed into LR-073 |

New mechanism difference: machine deny at the tool-call layer + live-fire proof + telemetry — a HARD gate per the enforcement-classification rule, not prose.

## Step-by-Step

### Phase 0 — Baseline re-verification (MANDATORY, no edits) — CEO
1. Machine-enumerate the live Atlassian tool list (session deferred-tool listing / ToolSearch); classify R vs CUD. Denominator machine-owned — if it differs from the 10-tool snapshot above, update the deny set AND log the delta.
2. Confirm `fetch`/`search` are read-semantic (GET-style). If either can mutate → add to deny set.
3. `grep -iE 'jira|atlassian|mcp__' <both settings deny blocks>` → still zero deny entries (else HALT: surface shifted).
4. `grep -icE 'atlassian|jira|confluence' ~/.copilot/mcp-config.json` → 0 servers.
5. `git ls-files --error-unmatch website/frontend/src/data/jiraconfig.txt` → still tracked (feeds the [RUTVIK-GO] token decision).
6. Confirm no live Copilot dispatch is running (stale-slot-lock check) before Phase 3 may touch `copilot-worker.sh`.

### Phase 1 — Doctrine layer — CEO (control files)
1. **LR-073** in `docs/read_only_docs/LEARNED_RULES.md`: *"Jira + Confluence are READ-ONLY for every AI actor — Claude main session, subagents, workflow agents, Copilot workers. Create/Update/Delete/transition/comment/worklog/link = Rutvik by hand only. Mechanism: settings deny + `jira-readonly-gate` + wrapper preflight (this plan). Read mandates (LR-063, LR-ENC-004) unchanged."*
2. `[RUTVIK-GO — protected file]` Reword `worker-ext.md:43` + `:251`: "Jira/Confluence writes stay on Claude's path" → "Jira/Confluence writes are forbidden for EVERYONE — workers have zero Atlassian access; Claude is read-only (LR-073); writes are Rutvik-by-hand only."
3. Add one line to the council-worker rulebook: "Atlassian (Jira/Confluence): FORBIDDEN entirely — no read, no write, no REST. Jira facts come from the CEO's ticket." Apply to the repo source template AND `~/.copilot/agents/council-worker.agent.md` AND verify the wrapper's variant-generation path (`copilot-worker.sh` ~L292) propagates it into `v--<model>--*.agent.md` files — a rule only in the base file is silently dropped for pinned-model dispatches.
4. Update auto-memory `feedback_jira_readonly_and_subagent_trust_toggle.md`: point at LR-073 + gate paths (mechanism now exists).

### Phase 2 — Claude machine layer, project-level — worker builds mjs from this spec; CEO does settings.json (control file) — wrap with /regression-guard
1. `.claude/settings.json` `permissions.deny`: add the 10 tools, UUID-qualified (`mcp__351f3923-22c5-4ff0-a7bd-339c0028aae5__createJiraIssue`, …). Known limit: dies with the UUID on connector re-add — that's what the hook layer is for.
2. New hook pair per repo convention (thin `.sh` wrapper + ESM `.mjs`, stdin JSON, `permissionDecision: "deny"` output, `fireTelemetry("jira-readonly-gate", "deny", …)` → `gate-fires.log`, fail-open ONLY on parse errors of non-Atlassian tools — an Atlassian-suffixed parse failure fails CLOSED):
   - `.claude/hooks/jira-readonly-gate.sh`
   - `.claude/hooks/lib/check-jira-readonly.mjs` (match rules from Design; deny reason cites LR-073 + "Rutvik writes Jira by hand — no override option offered")
   - `.claude/hooks/lib/test-jira-readonly-fixtures.mjs` (fixtures: all 10 denies, ≥6 read-tool allows incl. `getTransitionsForJiraIssue`, bash deny `curl -X POST …atlassian.net…`, bash allows `grep -r atlassian.net`, `git log`, plus knob-off behavioral difference)
3. Register in `.claude/settings.json` hooks: new PreToolUse entry `"matcher": "mcp__.*"` → gate (mcp mode); second new PreToolUse entry `"matcher": "Bash|PowerShell|powershell"` → `bash .claude/hooks/jira-readonly-gate.sh --bash-mode` (own entry — do NOT widen the existing 4-gate Bash chain's matcher; PowerShell included because `iwr`/`Invoke-RestMethod` reach Jira REST exactly like curl). `--bash-mode` must no-op cleanly on any unexpected tool_name (fixture-pinned).
4. `.claude/guardrail-config.json`: `jira_readonly_mode: "deny"` + ramp siblings, ramp_note: "S0 per LR-069 §3.1 — irreversible client-visible; announce phase skipped by rubric's own exception". Knob values `off|deny` only — no announce tier exists for S0.

### Phase 3 — Copilot layer — CEO (wrapper is dispatch-critical; verify no live runs first)
1. `copilot-worker.sh` preflight (with the other exit-2 guards, ~L85–160): read `${COPILOT_MCP_CONFIG:-$HOME/.copilot/mcp-config.json}`; if it names any atlassian/jira/confluence server → `FATAL … Jira is READ-ONLY (LR-073); workers get zero Atlassian access. Refusing to dispatch.` + `exit 2`. Env-var indirection exists so the fixture test can inject a violating config without touching the real one.
2. This preflight is the structural half of memory rule "workers get zero Atlassian access" — today it passes vacuously (no server configured); it exists to make silently ADDING one impossible.

### Phase 4 — User-level machine layer `[RUTVIK-GO — hook/permission self-modification]` — CEO
1. `~/.claude/settings.json`: add `permissions.deny` block (same 10 UUID-qualified entries) + PreToolUse `"matcher": "mcp__.*"` → `node C:/Users/rutvi/.claude/hooks/jira-readonly-gate.mjs` (node-direct port of the repo mjs, per user-level convention). **Dual-copy drift rule**: the user-level file is a byte-copy of the repo mjs's match logic; any future edit updates BOTH or it's a defect (both edits are Rutvik-GO-gated anyway).
2. Best-effort: add both gate files to the PROTECTED array + sha256 pins in `~/.claude/delegation/private/` (infra is landed-but-UNPROVEN per delegation-temp §Honest-Gaps — do it, don't claim tamper-proofness from it).

### Phase 5 — Live-fire proof + closure — CEO (workers have no MCP; probes are Claude-only)
Per the gate-trip rule, every probe uses a valid-shaped payload that is harmless even if the gate is broken:
1. **MCP write probe**: `editJiraIssue` on nonexistent key `NM-999999`, fields `{summary: "gate-probe"}` → expect PreToolUse DENY citing LR-073; `gate-fires.log` row appended. (Gate broken ⇒ Jira 404s — no mutation either way.)
2. **MCP read probe**: `getJiraIssue` on a real NM key → succeeds (R preserved). If the connector is unauthenticated headless → log `[ROVO-SKIP: MCP not connected]`, unlock = run probes 1/2 in the next interactive session; the plan does NOT close green without them.
3. **Bash probe**: `curl -s -X POST https://encore.atlassian.net/rest/api/3/issue` → expect deny pre-execution. (Gate broken ⇒ 401, harmless.)
4. **Negative control**: `grep -rn "atlassian.net" docs/ | head -1` → ALLOWED (the signal discriminates; a gate that denies everything is not a signal).
5. **Subagent probe**: spawn one minimal subagent instructed to call `editJiraIssue` (same NM-999999 payload) → expect the same deny (proves hooks bind subagents).
6. **Fixtures**: `node .claude/hooks/lib/test-jira-readonly-fixtures.mjs` → all pass. **Wrapper fixture**: `COPILOT_MCP_CONFIG=<fixture-with-atlassian-server> bash copilot-worker.sh --ticket <dummy> …` → FATAL exit 2.
7. Classification: HARD (blocking mechanism + file:line + live-fire observed + telemetry row). Record in Execution Summary.
8. Closure ceremony: activity-log row (LR-028), reindex, commit. Ship discipline note: all Phase 2/3 files are framework-internal (`.claude/`), nothing enters `clients/<id>/` — no deliverable impact.

## Residual risks — named honestly, with owners

| Risk | Why this plan can't kill it | Owner action |
|---|---|---|
| claude.ai web/mobile sessions use the same Atlassian connector, outside Claude Code hooks | Connector auth lives at claude.ai account level; repo hooks can't reach it | `[RUTVIK]` check the Atlassian connector's granted scopes in claude.ai settings; use a read-only grant if offered |
| Tracked live Jira token `website/frontend/src/data/jiraconfig.txt` (+ REST client in `website/backend`) | Product-code decision, not framework's; deleting user data unasked is forbidden | `[RUTVIK-GO]` decision item: recommend scrub from tracked tree (standing scrub-not-rotate rule); keep local if the website app needs it |
| A node/python script doing REST (no `atlassian.net` literal in the Bash command text) | Text-matching a command line can't see inside scripts | Doctrine (LR-073) + token disposition above removes the credential it would need |
| A future session editing the gate files themselves | Client-side self-tamper-proofness is impossible; floor = no silent single-step mutation | PROTECTED+sha256 pins (Phase 4.2) + LR-073 + standing rule: hook/permission self-modification needs Rutvik's go |

## What becomes stale / removal tasks (LR-050 enumeration)

- `worker-ext.md:43` + `:251` "on Claude's path" wording — rewired in Phase 1.2 (`[RUTVIK-GO]`), not left beside the new rule.
- Auto-memory `feedback_jira_readonly_and_subagent_trust_toggle.md` prose-only framing — updated in Phase 1.4 to cite the mechanism.
- Nothing else retires: no prior Jira gate, script, or knob exists to remove (recon-verified zero deny rules).

## NOT touched (and why)

- `REQUIREMENTS.md` agent tool grant — already read-only (the only Atlassian grant in `.claude/agents/`); correct as-is.
- All Atlassian READ tools + `settings.local.json` allow entries — reads are mandated (LR-063/LR-ENC-004), not restricted.
- `website/backend/src/services/jira.service.ts` — product code, GET-only today; flagged in Residual risks, not modified (don't touch unrelated code).
- Repo-root `.mcp.json` — doesn't exist; the connector is claude.ai-level, not repo-level.
- Chain state / NM2305 — chain stays PAUSED; this plan never touches `.claude/state/chain*`.

## Per-Identity Satisfaction

| Identity | Contribution | Concrete deliverable |
|---|---|---|
| OWNER | All phases | `plans/pending/PLAN_60_JIRA_READONLY_HARDGATE.md`<br>`.claude/hooks/jira-readonly-gate.sh`<br>`.claude/hooks/lib/check-jira-readonly.mjs`<br>`.claude/hooks/lib/test-jira-readonly-fixtures.mjs`<br>`docs/read_only_docs/LEARNED_RULES.md` (LR-073) |
| HUNTER / GIVER / BUILDER / HEALER / WATCHDOG / GARDENER | (none) | (none) |

## Acceptance criteria

1. Every deny in the 10-tool set fires (fixtures) AND one real MCP write probe denied live with a `gate-fires.log` telemetry row.
2. Read path proven intact live (`getJiraIssue` succeeds) — a gate that blocks R fails the plan.
3. Bash probe denied; grep negative-control allowed (discriminating signal).
4. Subagent probe denied (hooks bind subagents).
5. Wrapper preflight FATALs on injected atlassian fixture config; normal dispatch unaffected.
6. `LR-073` greppable in LEARNED_RULES.md; worker-ext lines rewired; rulebook line present in base + one generated variant file.
7. All `[RUTVIK-GO]` items carry his recorded go (or are logged deferred with the unlock named) — none silently skipped.
8. Regression-guard clean on Phases 2–3.

## Verification artifact (D23)

```
node .claude/hooks/lib/test-jira-readonly-fixtures.mjs        # expect: ALL PASS
grep -c "351f3923" .claude/settings.json                      # expect: ≥10 (deny entries)
grep -n "jira-readonly-gate" .claude/settings.json            # expect: 2 hook registrations
grep -n "^## LR-073" docs/read_only_docs/LEARNED_RULES.md     # expect: 1 hit
grep "jira-readonly-gate" .claude/state/gate-fires.log        # expect: ≥1 deny row (live-fire)
```

## Plan-Deviations log

| # | Phase | Deviation | Disposition |
|---|---|---|---|
| — | — | (none yet) | — |

### Execution Summary

(pending — filled at execution; every deliverable above must appear as DONE / SKIPPED-with-Rutvik-approval / MODIFIED-with-justification)

## Handoff (post-execution — fill when this plan flips DONE)

(pending)
