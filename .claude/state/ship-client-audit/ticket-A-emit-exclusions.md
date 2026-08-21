# TICKET A — add `--emit-exclusions=<client>` to verify-no-forbidden.mjs

TIER: T2 (claude-sonnet-4.6, effort max)
RISK: medium
OFF-REPO: no
WORK-TYPE: build

## GOAL

Add ONE new reporting mode to `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\verify-no-forbidden.mjs`:
`--emit-exclusions=<client>`. It prints, one repo-relative path per line to stdout, every file that
`git ls-files clients/<client>/` returns AND that the EXISTING `matchesDeny()` helper classifies as denied.

This is the single source of truth the ship scripts will consume so they can exclude those paths at
`git archive` time instead of aborting. It REPORTS — it does not judge. **Exit 0 even when the list is
non-empty.** Exit 2 only on a genuine error (git failure, missing `--client` value).

## WHY (context — read before coding)

`npm run client:ship -- --client=encore` has aborted since 2026-06-26 because the `--client=<id>` mode
exits 1 on 453 tracked-but-deny-listed files. Those files are force-tracked ON PURPOSE (commit `e0f63b32`)
so colleagues get work artifacts via the team remote. The fix is to stop asking "is the index clean?" and
start asking "is the payload clean?" — which needs a machine-readable exclusion list. That is this ticket.

## SCOPE — EDIT EXACTLY ONE FILE, CREATE ZERO FILES

- EDIT: `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\verify-no-forbidden.mjs`
- CREATE: nothing. Do NOT write a summary file, a report file, or a test file. Report to stdout only.
- DO NOT TOUCH: `scripts/lib/forbidden-patterns.mjs`, any ship script, any hook, any plan.

## HARD CONSTRAINTS

1. **Do NOT define a new pattern list.** Import and reuse the existing `matchesDeny` from
   `./lib/forbidden-patterns.mjs`. If you find yourself typing `specs_planning` or `.env.local` as a
   literal, you are doing it wrong — that is the exact drift defect this ticket exists to prevent.
2. The existing modes (`--client`, `--target`, `--staged-diff`, `--head-file`, `--staged`) must behave
   **byte-identically**. Do not touch `checkClient`, `checkTarget`, `checkStagedDiff`, `checkStagedFile`,
   or `checkHeadFile`.
3. Path normalisation must match `checkClient()`: it strips the leading `clients/<id>/` and prepends `/`
   before calling `matchesDeny`. Your emitted lines, however, must be the FULL repo-relative path
   (`clients/encore/specs_planning/...`), because `git archive` pathspecs need the full path. Get this
   right — matching on the stripped form, emitting the full form.
4. Update the file's header comment block (lines 3-17) to document the new mode alongside the others, and
   update the usage string at the bottom (currently line ~415).
5. Windows host, Git Bash available. Node 25. ESM module (`.mjs`, top-level await already in use).

## ACCEPTANCE (machine-checkable — every one must be pasted with real output)

Run each from `C:\Users\RutvikKhorasiya\projects\encore_framework`:

1. `node scripts/verify-no-forbidden.mjs --emit-exclusions=encore | wc -l` → must print `453`
2. `node scripts/verify-no-forbidden.mjs --emit-exclusions=encore; echo "EXIT=$?"` → must print `EXIT=0`
3. `node scripts/verify-no-forbidden.mjs --emit-exclusions=encore | grep -c '^clients/encore/'` → `453`
   (proves full repo-relative paths, not stripped ones)
4. `node scripts/verify-no-forbidden.mjs --emit-exclusions=encore | grep -x 'clients/encore/.env.local'` → one hit
5. `node scripts/verify-no-forbidden.mjs --emit-exclusions=encore | grep -x 'clients/encore/CLAUDE.md'` → one hit
6. `node scripts/verify-no-forbidden.mjs --emit-exclusions=encore | grep -c 'specs_planning'` → `422`
7. REGRESSION — the old modes are untouched:
   `node scripts/verify-no-forbidden.mjs --client=encore; echo "EXIT=$?"` → still `EXIT=1` and still prints
   `found 453 forbidden file(s)`
8. `node --check scripts/verify-no-forbidden.mjs` → exit 0
9. `git diff --stat scripts/verify-no-forbidden.mjs` → exactly ONE file changed, and
   `git status --porcelain` shows NO new untracked files created by you.

## VERIFY ARTIFACTS

Tee each acceptance command:
`<cmd> 2>&1 | tee C:/Users/RutvikKhorasiya/projects/encore_framework/.claude/state/ship-client-audit/ticketA-<n>.verify.txt`
List each file with its sha256 in your report.

## DOCTRINE — read these absolute paths before coding, and name them in DOCTRINE_READ

- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\guardrail-policy.md` (LR-069 — this file is an
  S0-class leak gate; your change must not lower its floor. The new mode is a REPORTER, not a gate, so it
  needs no ramp — state that explicitly in your report.)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\pipeline.md` (LR-049 ship discipline)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\skills\regression-guard\SKILL.md` (WRAP — fingerprint
  the module's exports before and after; a changed export signature on the untouched modes is a defect)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\plans\pending\PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md`
  (the parent plan — Phase 1 is this ticket)

## REPORT

Return the parity report to stdout. Include DOCTRINE_READ, the 9 acceptance results with REAL pasted
output and exit codes, the VERIFY_ARTIFACTS list with sha256, and any assumption you made under `## ASK`.
Do not write the report to a file.
