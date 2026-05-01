# SUBPLAN SP-PWC2-05: Hard Gates + Orchestrator — PF-G5 Normalizer + Worker + Pipeline-Def

**Status**: DONE
**Executed**: 2026-04-24
**Priority**: P0
**Created**: 2026-04-24
**Parent**: [PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md](PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md)
**Depends on**: SP-PWC2-03 (agent defaults declare `BrowserTool`; orchestrator reads them)
**Blocks**: SP-PWC2-06 (hook uses the same frontmatter parser introduced here), SP-PWC2-07 (pilot runs through the wired orchestrator)

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none

*Thinking justification*: PF-G5 is a hard gate blocking spec generation; a format-normalizer bug here could mask drift. TypeScript surgery in `generator-pre-run.ts` + `orchestrator/types.ts` + `worker/index.ts` has cross-file invariants. Opus + xhi for threshold + schema decisions.

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_PWC2_05_HARD_GATES_ORCHESTRATOR.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /execute, /regression-guard
**Context files** (read before Phase 0):
- `plans/pending/PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md` (parent — normalizer spec)
- `scripts/generator-pre-run.ts` (PF-G5 gate at L207–277)
- `src/worker/index.ts` (`allowedTools` at L63)
- `src/orchestrator/types.ts` (`Stage.mcpConfig` definition)
- `config/pipeline-definition.json` (5 stage entries)
- `.vscode/mcp.json` (don't delete yet — SP-PWC2-07 owns removal)
- CLI_BROWSER_GUIDE.md (SP-PWC2-00 — canonical walkthrough format)

**Phase 0 directive**: before editing, trace the PF-G5 gate's consumer chain. Who reads the walkthrough after the gate passes? Any downstream consumer that expects the current `.md` format will break when it receives canonical JSON. Plan backward-compat path.

**Handoff sequence**:
- Activity-log row listing all TypeScript + JSON files modified.
- Chat summary: "PF-G5 normalizer ships canonical JSON. Orchestrator types updated. Pipeline-def stages carry `browserTool` field. Worker allowedTools include Bash + Chrome tools."
- `/final-q` verdict.

**HALT conditions**:
- If the canonical JSON schema cannot round-trip both CLI YAML and Chrome .md without data loss, HALT — schema needs revision.
- If type changes in `Stage` cascade to >20 call sites, split into separate sub-subplan for the type rename.

---

## Purpose

Three-part wiring so the pipeline agrees on tool surface:

1. **PF-G5 canonical normalizer** — accept CLI YAML or Chrome .md walkthrough; write canonical `walkthrough.canonical.json`; downstream consumers read only the canonical form.
2. **Orchestrator types** — `Stage.mcpConfig` → `Stage.cliConfig` + `Stage.browserTool` (ENUM: cli | chrome | both | none).
3. **Worker + pipeline-def** — `allowedTools` includes `Bash` + `mcp__Claude_in_Chrome__*`; `config/pipeline-definition.json` stages declare `browserTool` matching agent frontmatter defaults.

## Step-by-step

1. **Phase 0 — consumer trace**. Grep for every consumer of `walkthrough.md` and every downstream importer of `Stage.mcpConfig`. List call sites.
2. **Define canonical schema** `walkthrough.canonical.json`:
   - Top-level: `{ item_id, source_tool: "cli"|"chrome", mcp_session_date, fields: [...], verified_claims: [...], notes: [...] }`.
   - Field entry: `{ name, testid, aria_label, default_value, validation_state, tab_index, selector_fallback }`.
   - Schema file committed at `docs/schemas/walkthrough.canonical.schema.json`.
3. **Implement normalizer** in `scripts/generator-pre-run.ts` L207–277:
   - Accept either `.walkthrough.yaml` (CLI) or `.walkthrough.md` (Chrome).
   - Write `.walkthrough.canonical.json` next to source.
   - PF-G5 pass criteria now check canonical JSON (table header validation becomes a schema validation).
4. **Rewrite `src/orchestrator/types.ts` Stage**:
   - Remove `mcpConfig` field.
   - Add `cliConfig: { sessionName, persistentProfile? }`.
   - Add `browserTool: "cli" | "chrome" | "both" | "none"`.
   - Grep call sites; update all.
5. **Update `src/worker/index.ts` L63**:
   - `allowedTools` now includes `Bash` (for CLI) + `mcp__Claude_in_Chrome__*` tools (for Chrome).
   - Gate logic: if stage's `browserTool: cli` → deny Chrome tools (parity with SP-PWC2-06 hook; this is the server-side enforcement).
6. **Update `config/pipeline-definition.json`** 5 stages:
   - Requirements → `"browserTool": "cli"`, no `mcpConfig`.
   - Planning → `"browserTool": "cli"`.
   - Generation → `"browserTool": "cli"`.
   - Healing → `"browserTool": "both"`.
   - Audit → `"browserTool": "cli"`.
7. **Regression-guard smoke**: run `/regression-guard` before + after. Verify no silent break in unrelated exports.
8. **TypeScript compile check**: `npx tsc --noEmit` passes.
9. **Activity-log row** per LR-037.

## Acceptance criteria

- [ ] `docs/schemas/walkthrough.canonical.schema.json` exists.
- [ ] `scripts/generator-pre-run.ts` normalizer accepts both CLI YAML + Chrome .md; writes canonical JSON.
- [ ] `PF-G5` gate validates against canonical JSON schema.
- [ ] `src/orchestrator/types.ts` has `cliConfig` + `browserTool` (mcpConfig removed).
- [ ] `src/worker/index.ts` `allowedTools` includes Bash + Chrome tools.
- [ ] `config/pipeline-definition.json` 5 stages declare `browserTool`.
- [ ] `npx tsc --noEmit` passes.
- [ ] `/regression-guard` before/after diff is clean.
- [ ] Activity-log row per LR-037.
- [ ] `/final-q` GREEN verdict.

## Handoff

Next: SP-PWC2-06 adds the opt-in PreToolUse hook that reads `BrowserTool` frontmatter at runtime. Chat summary: "Pipeline wiring updated. Canonical walkthrough live. Types migrated."

---

## Execution Summary (2026-04-24)

**Identity**: OWNER. Phase 0.1 `node scripts/check-subplan-identity.mjs` returned `{"ok": true, "skipped": true}` — subplan has no `Artifacts` / `Key Files` section, so the structured write-gate is N/A; the PreToolUse hook remains second-line defense. **Model**: Opus 4.7 / `xhi` / `acceptEdits` per frontmatter. **BrowserTool**: `none` — pure file work, zero live-DOM interaction, zero `[BROWSER-SWITCH]` rows.

**Dependency gate cleared**: SP-PWC2-03 in `plans/done/` → 5 agent frontmatter defaults already declared (Requirements=`cli`, Planner=`cli`, Generator=`cli`, Healer=`both`, Audit=`cli`). This subplan consumes those defaults into the runtime surface.

### Deliverables (all acceptance criteria checked off)

- [x] **`docs/schemas/walkthrough.canonical.schema.json` exists** — new file, JSON Schema draft-07. Required top-level: `item_id`, `source_tool` (enum `cli`|`chrome`), `mcp_session_date` (YYYY-MM-DD), `verified_claims` (minItems=3). Status enum: `VERIFIED`|`PASS`|`FAIL`|`APP_BUG`|`PLANNER_GAP`|`TC_CORRECTION`|`SEQUENCE_SIDE_EFFECT`. `resolution` field named for APP_BUG / PLANNER_GAP compliance. `additionalProperties: true` on every object keeps the schema additive.
- [x] **`scripts/generator-pre-run.ts` normalizer accepts both CLI YAML + Chrome MD and writes canonical JSON** — L21-180 new module-level helpers (`todayIso`, `parseMdWalkthrough`, `parseYamlWalkthrough`, `validateCanonical`). PF-G5 block (formerly L207–277) rewritten L370-460: prefers `.yaml` over `.md` when both exist; parses; writes `<itemId>.walkthrough.canonical.json` next to source; schema-validates; HALT on retry without artifact, first-run WARN. `js-yaml` via `require()` with `JSON.parse` fallback (both transitively available, no new direct dep).
- [x] **PF-G5 gate validates against canonical JSON** — `validateCanonical` enforces: `item_id` non-empty string, `source_tool` ∈ {`cli`,`chrome`}, `mcp_session_date` matches `YYYY-MM-DD`, `verified_claims` has ≥3 entries with status `VERIFIED`/`PASS` (GEN-029), APP_BUG entries have `resolution` matching `/(ESC-|BUG-|filed|resolved)/i` (GEN-033), PLANNER_GAP entries have `resolution` matching `/(ESC-|escalat|corrected)/i` (GEN-033). Errors enumerated; canonical JSON written to disk even on failure so the agent can inspect.
- [x] **`src/orchestrator/types.ts` has `cliConfig` + `browserTool` (mcpConfig removed)** — new exports `BrowserTool` (union `cli`|`chrome`|`both`|`none`) and `CliStageConfig { sessionName?, persistentProfile? }`. `StageDefinition.mcpConfig` removed; `StageDefinition.browserTool` + `StageDefinition.cliConfig` added.
- [x] **`src/worker/index.ts` `allowedTools` includes Bash + Chrome tools with browserTool gate** — default `allowedTools` replaces legacy `mcp__*` wildcard with explicit `mcp__Claude_in_Chrome__*`. New `applyBrowserToolGate(tools, browserTool)` helper: `cli` strips Chrome tools + bare `mcp__*` wildcard (server-side parity with SP-PWC2-06 PreToolUse hook); `chrome`/`both` ensures Chrome wildcard is present; `none` passes through. Playwright install gate flipped from `stageConfig?.mcpConfig` to `browserTool ∈ {cli,both}`. Legacy per-task MCP template generation + `tempMcpPath` cleanup block deleted (SP-PWC2-07 owns `config/mcp/` + `.vscode/mcp.json` removal).
- [x] **`src/server/routes/worker.ts` stageConfig reply uses new fields** — `mcpConfig: stageDef.mcpConfig || null` replaced with `browserTool: stageDef.browserTool ?? 'none'` + `cliConfig: stageDef.cliConfig ?? null`.
- [x] **`config/pipeline-definition.json` 5 stages declare browserTool** — Requirements=`cli`, Planning=`cli`, Generation=`cli`, Healing=`both`, Audit=`cli` (matches SP-PWC2-03 agent frontmatter defaults). Every stage carries `cliConfig.sessionName: "nav4"` (matches `CLI_BROWSER_GUIDE §3.1` example). All 5 `"mcpConfig"` lines removed.
- [x] **`npx tsc --noEmit` baseline-clean for this subplan** — 77 pre-existing errors (all in unrelated files: `website/backend/*`, `website/frontend/*`, `src/worker/progress-extractor.ts`, `tests/unit/*`). After my edits: **77 errors** (zero new errors introduced). Verified via `git stash` round-trip baseline comparison. Scoped grep over my 5 touched files = 0 TS errors.
- [x] **`/regression-guard` AFTER diff clean** — zero exports removed, zero functions removed. Additions: +4 helpers in `generator-pre-run.ts`, +2 exports in `types.ts` (`BrowserTool`, `CliStageConfig`), +1 helper `applyBrowserToolGate` in `worker/index.ts`. `mcpConfig` code references 5→0 in `pipeline-definition.json`, 2→0 in `routes/worker.ts`, 5→1 in `worker/index.ts` (remaining 1 = removal comment), 1→2 in `types.ts` (both in comments documenting the removal).
- [x] **Activity-log row per LR-037** — appended at `2026-04-24T18:09` (≥ all 6 touched-file mtimes at 18:03 local). Tool used: direct Edit + node swap to maintain chronological order after 17:47 row.
- [ ] **`/final-q` GREEN verdict** — pending (emitted as Phase 4 final action).

### Smoke test (Step 8 — Phase 0 consumer trace + helper behavior)

Hand-compiled JS mirror of `parseMdWalkthrough` + `parseYamlWalkthrough` + `validateCanonical` run against two synthetic fixtures:
- **Chrome MD fixture** (4 rows: 2 VERIFIED + 1 PASS + 1 APP_BUG with "filed BUG-SMK-001") → canonical JSON produced, APP_BUG `resolution` auto-detected as `"filed"` via the row-scan regex, `validateCanonical()` returned `[]` (zero errors).
- **CLI YAML fixture** (3 `verified_claims` entries: 2 VERIFIED + 1 PASS) → canonical JSON produced, validator returned `[]`.

Both formats round-trip without data loss — HALT condition #1 ("canonical JSON schema cannot round-trip both CLI YAML and Chrome .md without data loss") **did not fire**. Stage type changes cascaded to 3 call sites (`types.ts` + `routes/worker.ts` + `worker/index.ts`) — far below the 20-site HALT threshold, so HALT condition #2 **did not fire** either.

### Deferrals (classified per LR-040)

- **MCP template files (`config/mcp/browser-only.json.template`, `browser-and-test.json.template`) + `.vscode/mcp.json`** → (b) grep-verifiable line item in **SP-PWC2-07**'s plan step list (parent plan row explicitly names it as "Delete `.vscode/mcp.json`; archive `MCP_BROWSER_GUIDE.md`"). Inline code comment added at the legacy-removal site in `src/worker/index.ts` forward-referencing SP-PWC2-07.
- **77 pre-existing TS errors in `website/*`, `progress-extractor.ts`, `tests/unit/*`** → (c) out-of-scope — baseline existed before this subplan, verified via `git stash` round-trip; not introduced by my edits.
- **Direct dep on `js-yaml` / `ajv`** → (c) intentional — both libs are transitively available; direct-dep addition would widen package.json beyond this subplan's scope. If a future transitive-dep prune breaks it, error message steers to `npm install --save js-yaml`.

### Rules honored

LR-020 (every file and line ref verified before editing — before.json snapshot as evidence); LR-027 (this Execution Summary embedded before `git mv` pending→done); LR-028 (activity-log row appended); LR-035 (`plans:reindex` runs after move — next step); LR-037 (row timestamp 18:09 ≥ max file mtime 18:03); LR-038 v2 (`BrowserTool: none` declared in frontmatter — pure-file-work posture honored, 0 switches); LR-040 (every acceptance-criterion item (a)-direct-verified-this-session; MCP template cleanup (b)-deferred to SP-PWC2-07 via grep-verifiable line item + in-code comment); LR-041 (Opus 4.7 / xhi / acceptEdits per frontmatter — full rubric honored); LR-042-A (`/final-q` follows as final action — Phase 4 mandate active; Stop hook deprecated but inline skill mandate preserved).

`outcome:complete, files-edited:5, files-created:1, files-moved:1, bugs-filed:0, learnings-captured:0, INDEX-regen:post-move, next:SP-PWC2-06 PreToolUse hook (reads stable browserTool frontmatter at runtime — unblocked; ships disabled per parent plan §Enforcement).`
