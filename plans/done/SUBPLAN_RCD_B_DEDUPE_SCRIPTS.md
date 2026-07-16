# SUBPLAN_RCD_B_DEDUPE_SCRIPTS — dedupe root scripts/ archive helpers + strip dead allure scripts from root package.json

**Status**: DONE
**Executed**: 2026-07-16
**Priority**: P0
**Created**: 2026-05-07
**Identity**: OWNER
**Parent**: PLAN_ROOT_CLIENT_DEDUPE.md
**Depends on**: SUBPLAN_RCD_A_KILL_ROOT_PLAYWRIGHT_CONFIGS.md
**Blocks**: SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

After SUBPLAN_RCD_A delegates root `npm test` and `npm run test:daily` to `clients/encore`, the root archive-helper scripts (`scripts/archive-allure.js`, `archive-html.js`, `preserve-allure-history.js`, `ensure-report-dirs.js`) become dead — their callers (root `test:daily`, `allure:archive`, `reports:archive`, `reports:clean`, `clean`) either delegate or themselves get stripped. This subplan deletes those 4 root scripts and removes the dead allure-related scripts from root `package.json`. Comment-only drift between root and `clients/encore/scripts/` (root `archive-allure.js:8` lists `npm run allure:archive` as caller, client version doesn't) is the remaining slop signal.

`clients/encore/scripts/` already contains identical-functionality copies (`fs.cpSync`, `__dirname`-relative paths, same MAX_DAYS pruning logic). No data/script behavior is lost — root `clean` script behavior gets re-routed through delegation.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap)
- `/cleanup` (Phase 2 — dead script removal)
- `/final-q` (Phase 5 — exit per LR-042)

**Context files**:
- `plans/done/PLAN_ROOT_CLIENT_DEDUPE.md` (parent)
- `plans/done/SUBPLAN_RCD_A_KILL_ROOT_PLAYWRIGHT_CONFIGS.md` (predecessor — must be in `plans/done/` per Phase 0 gate)
- `.claude/rules/pipeline.md` (LR-027, LR-028, LR-046, LR-049, LR-050)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`
- `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate

1. Confirm `SUBPLAN_RCD_A_KILL_ROOT_PLAYWRIGHT_CONFIGS.md` is in `plans/done/` (status DONE). If still in `pending/` → HALT + ask user.
2. Read `.claude/context/navigation.md` (R00) — exploration registry.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter ALL-* / MIS-* on "delete script", "package.json".
4. LR scan.
5. **Browser-tool announcement**: `BrowserTool: none. Reason: pure file edits.`

---

## Phase 1 — Reference grep (zero-ref invariant before deletion)

For each of the 4 root scripts to delete, grep ALL non-package.json non-clients/encore-scripts files. Expected zero hits.

```bash
for f in archive-allure archive-html preserve-allure-history ensure-report-dirs; do
  echo "=== ${f}.js ==="
  grep -rEn "scripts/${f}|require\\(['\"]\\.{0,2}/scripts/${f}|node\\s+scripts/${f}" \
    --include="*.json" --include="*.ts" --include="*.js" --include="*.mjs" --include="*.sh" --include="*.yml" \
    --exclude-dir=node_modules --exclude-dir=plans --exclude-dir=clients \
    | grep -v "^package.json:" \
    || echo "(zero hits)"
done
```

Expected outcome: only `package.json` (root) hits, which Phase 3 strips. Anything else → HALT + investigate.

---

## Phase 2 — Delete 4 root scripts

```bash
git rm scripts/archive-allure.js
git rm scripts/archive-html.js
git rm scripts/preserve-allure-history.js
git rm scripts/ensure-report-dirs.js
```

---

## Phase 3 — Strip dead allure / report scripts from root `package.json`

Per Phase 1 grep, these scripts in root `package.json` invoke the now-deleted helpers OR delegate to client (post-A). Remove the standalone-at-root entries:

| Script (line range as of 2026-05-04) | Action | Reason |
|---|---|---|
| `allure:archive` (line 23) | DELETE | invokes deleted `scripts/archive-allure.js` |
| `allure:generate` (line 24) | DELETE | only called by the deleted `test:daily` chain (now delegated post-A) and by `report:pdf` (deleted in A) |
| `allure:history` (line 25) | DELETE | invokes deleted `scripts/preserve-allure-history.js` |
| `allure:open` (line 26) | DELETE | only called by `allure:report` (also deleted) |
| `allure:report` (line 27) | DELETE | only called from interactive use; client copy preserves the muscle memory via `npm run allure:report --prefix clients/encore` |
| `html:archive` (line 28) | DELETE | invokes deleted `scripts/archive-html.js` |
| `reports:archive` (line 29) | DELETE | invokes the deleted `allure:archive` + `html:archive` |
| `reports:clean` (line 30) | DELETE | invokes deleted `scripts/ensure-report-dirs.js` |
| `clean` (line 37) | EDIT | `&& node scripts/ensure-report-dirs.js` tail invokes the deleted script — strip that segment, keep rimraf body |
| `clean:reports` (line 38) | EDIT | same — strip the `&& node scripts/ensure-report-dirs.js` tail |
| `clean:results` (line 32) | KEEP | inline node -e expression, no external script dep |
| `test:clean` (line 33) | KEEP | invokes `clean:results && npm test` — `npm test` is now the delegated form (post-A) |

**Verify line numbers** before edit — `package.json` may have shifted after SUBPLAN_RCD_A's edits.

---

## Phase 4 — Verification

```bash
# 1. Root archive-helper scripts gone
ls scripts/archive-allure.js scripts/archive-html.js scripts/preserve-allure-history.js scripts/ensure-report-dirs.js 2>/dev/null
# expect: no such file (4x)

# 2. Live-code refs to deleted scripts = zero
grep -rE "scripts/(archive-allure|archive-html|preserve-allure-history|ensure-report-dirs)" \
  --include="*.json" --include="*.ts" --include="*.js" --include="*.mjs" --include="*.sh" --include="*.yml" \
  --exclude-dir=node_modules --exclude-dir=plans --exclude-dir=clients
# expect: zero hits

# 3. clients/encore/scripts/ archive helpers still present (untouched)
ls clients/encore/scripts/archive-allure.js clients/encore/scripts/archive-html.js \
   clients/encore/scripts/preserve-allure-history.js clients/encore/scripts/ensure-report-dirs.js
# expect: all 4 present

# 4. Root npm scripts pruned (8 deleted scripts gone)
node -e "const p=require('./package.json').scripts; for (const k of ['allure:archive','allure:generate','allure:history','allure:open','allure:report','html:archive','reports:archive','reports:clean']) console.log(k, k in p ? 'PRESENT (FAIL)' : 'gone (ok)')"
# expect: all 8 = "gone (ok)"

# 5. Root npm clean still works (rimraf body intact)
npm run clean
# expect: succeeds; reports/* + logs/test-execution.log purged
```

---

## Phase 2.5 — Adjacent-Sweep ritual

- **DO-NOW**: if a doc (`docs/SETUP.md`, `README.md`) mentions `npm run reports:archive` / `npm run allure:report` from root, update to the `--prefix clients/encore` form OR remove if redundant.
- **APPEND to SUBPLAN_RCD_C**: if an `.env.server` or `reports/`/`logs/` reference is uncovered in this subplan's grep, add as bullet in C with `grep -F "<line>"` verification.
- **HALT + ask user**: any package.json script outside the enumerated 8 that calls the deleted helpers — investigate before delete.

---

## Acceptance criteria

- [ ] 4 root scripts deleted (Phase 2).
- [ ] 8 root npm scripts deleted (Phase 3 DELETE rows).
- [ ] 2 root npm scripts edited to drop the deleted-script tails (`clean`, `clean:reports`).
- [ ] Verification grep #2 returns zero live-code hits.
- [ ] `clients/encore/scripts/` archive helpers untouched (verification #3).
- [ ] `npm run clean` from root succeeds (verification #5).
- [ ] `/regression-guard` snapshot diff = clean (only the 4 deleted files + 1 modified `package.json` show in the diff).
- [ ] Activity-log row appended per LR-028.
- [ ] `/final-q` verdict block.

---

## Handoff

After Phase 4 verification passes: SUBPLAN_RCD_C is unblocked (env + reports + cruft sweep + tsconfig demote). Parent PLAN_ROOT_CLIENT_DEDUPE.md remains pending until C closes.

---

## Execution Summary

**Closed 2026-07-16.** The subplan's changes were pre-applied to the working tree by an earlier session; this session VERIFIED the applied state against the plan and committed it: opus-4.6 verification run rcdb-verify-0716 (17/17 state-vs-plan rows MATCH — 8 npm DELETE rows absent, 2 EDIT rows tail-stripped with rimraf bodies intact, 2 KEEP rows unchanged, 4 root scripts staged-deleted and absent from disk, plus the TRIM_04 healer:post-complete rider absent) + independent gpt-5.5 cross-provider re-execution rcdb-review-0716 (GREEN — re-ran the battery and the 17-row spot-verify itself). Commit 1772f8d6 (explicit 5-path pathspec). Evidence dirs: .claude/state/ua-worker/rcdb-verify-0716-artifacts and .claude/state/ua-worker/rcdb-review-0716-artifacts (phase1-zero-ref, phase4-battery, functional-coverage tees + manifests).

### Acceptance criteria outcomes

- 4 root scripts deleted — DONE (battery #1: absent from disk; commit 1772f8d6).
- 8 root npm scripts deleted — DONE (battery #4: node check all "gone (ok)").
- 2 root npm scripts edited (clean, clean:reports tails stripped) — DONE (rows 9-10 MATCH).
- Verification grep #2 zero live-code hits — DONE (both seats, exclusions: node_modules, plans/, clients/, ephemeral .claude/worktrees/ + .claude/state/).
- clients/encore/scripts/ helpers untouched — criterion VOID by premise-correction (see deviation below); replaced by functional-coverage proof.
- npm run clean from root succeeds — DONE (exit 0; reports/ was absent beforehand, guard honored, no data touched).
- Regression diff = the 4 deletions + package.json only — DONE (reviewer allow-list style check).
- Activity-log row — DONE this closure. /final-q rides the session-level audit.

### Deviation (premise-correction, owner-decided)

The plan Context claimed clients/encore/scripts/ carries identical copies of the 4 archive helpers — FALSE at execution time (the client scripts dir holds only clean-run, share-for-debugging, test-cli, walks). The live reporting need is covered client-natively: allure:generate / allure:open / allure:report entries (npx allure direct) + clean, with Allure trend history preserved via the root clean:results keep-set (categories.json, environment.properties, history). The four ARCHIVING utilities (allure:archive, html:archive, reports:archive, allure:history) therefore retire with no successor. Owner delegated the decision in-chat 2026-07-16 ("do whatever is best... based on historical data, ur brain, and internet"); dispatcher decided RETIRE on: zero usage evidence anywhere (no doc/CI/hook refs, no archived content ever on disk, staged-deleted for weeks unnoticed), Allure-native history mechanism already covering trend preservation, instant git restorability, and current practice placing report retention in CI artifact stores rather than local copy scripts.

### Next-batch ledger

- None new — the worktree-copy grep-noise item and doc stale-pointers remain with SUBPLAN_TRIM_06_CLOSURE from the earlier trims.

### Documentation

- LR-028 activity-log row appended this closure. Parent PLAN_ROOT_CLIENT_DEDUPE.md annotated per LR-027 parent-cascade.
