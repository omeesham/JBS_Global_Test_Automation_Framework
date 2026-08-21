# TICKET B — rewire ship-client.sh to gate the PAYLOAD, not the index

TIER: T2 (claude-sonnet-4.6, effort max)
RISK: high
OFF-REPO: no
WORK-TYPE: build

## GOAL

Edit `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-client.sh` so that
`bash scripts/ship-client.sh --client=encore --out=<dir> --force` completes with **exit 0** and produces a
deliverable containing **zero** deny-listed files.

Ticket A already landed the mechanism you will consume:
`node scripts/verify-no-forbidden.mjs --emit-exclusions=<client>` prints one repo-relative path per line
(453 lines for encore) and exits 0. Verified working — do not re-implement it.

## WHY

`ship-client.sh:34` runs `verify-no-forbidden.mjs --client="$CLIENT"`, which exits 1 on 453
tracked-but-deny-listed files, and `set -euo pipefail` aborts before the `git archive` at line 54. Those
files are force-tracked on purpose (commit `e0f63b32`) so colleagues receive work artifacts via the team
remote — the index is NOT going to be cleaned. The ship must therefore exclude them from the payload
instead of refusing to run.

## SCOPE — EDIT EXACTLY ONE FILE, CREATE ZERO FILES

- EDIT: `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-client.sh`
- CREATE: nothing. Report to stdout only.
- DO NOT TOUCH: `verify-no-forbidden.mjs`, `forbidden-patterns.mjs`, `ship-client.ps1`, `ship-branch.sh`.

## REQUIRED CHANGES

**1. Replace the line-34 pre-flight.** Delete `node scripts/verify-no-forbidden.mjs --client="$CLIENT"`.
In its place, capture the exclusion list:
`mapfile -t EXCLUSIONS < <(node scripts/verify-no-forbidden.mjs --emit-exclusions="$CLIENT")`
Handle the empty-list case (a clean client) without emitting a malformed pathspec.

**2. Exclude at archive time.** Convert each path to a `git archive` exclude pathspec
`:(exclude)<path>` and pass them to the archive call so denied files never enter the payload.
**Argv-length guard**: 453 paths will be long. If the assembled argument list would exceed a safe
threshold, write the pathspecs to a temp file and use `git archive --pathspec-from-file=<file>` instead.
State in your report WHICH branch encore actually takes.

**3. Stage to a temp dir, not `$OUT`.** Extract into `$(mktemp -d)`. Run the existing
`node scripts/verify-no-forbidden.mjs --target="<staging>"` against the staged tree — this is now the
authoritative gate. Only after it exits 0 may `$OUT` be populated.

**4. Delete the unconditional `rm -rf "$OUT"`** (currently line 52 — it will destroy any directory the
caller names, including a real checkout). Replace with: refuse if `$OUT` is a git worktree
(`git -C "$OUT" rev-parse --git-dir` succeeds) — this refusal is UNCONDITIONAL and `--force` does NOT
override it; refuse if `$OUT` exists and is non-empty unless `--force` was passed.

**5. Keep everything else byte-identical in behaviour and order**: the dirty-tree check, the
`clients/$CLIENT` existence check, the encore XLSX freshness pre-flight, the `.github/workflows` refusal,
the `npm install` + `npx playwright test --list` smoke, and the XLSX presence post-check. Exit codes
2/3/4/5/6/7/8 keep their current meanings.

**6. `set -euo pipefail` stays.** Clean up the temp staging dir on exit via `trap`.

## ACCEPTANCE (machine-checkable — paste REAL output + exit codes for each)

Run from `C:\Users\RutvikKhorasiya\projects\encore_framework`. Use a scratch out-dir under
`C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB/`:

1. `bash scripts/ship-client.sh --client=encore --out=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB/out1 --force; echo "EXIT=$?"` → `EXIT=0`
2. `node scripts/verify-no-forbidden.mjs --target=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB/out1; echo "EXIT=$?"` → `EXIT=0`
3. Explicit leak find → must print NOTHING:
   `find C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB/out1 \( -path '*specs_planning*' -o -name '.env.local' -o -name 'CLAUDE.md' \) -print`
4. Payload is non-empty and real: `find C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB/out1 -name '*.spec.ts' | wc -l` → > 0
5. XLSX survived: `test -f C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB/out1/testcases/encore_test_cases.xlsx; echo "EXIT=$?"` → `EXIT=0`
6. **`$OUT` safety — worktree refusal. NEVER point this test at the real repo.** Build a THROWAWAY
   git repo and aim the ship at that:
   ```
   SAFE=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB/decoy
   mkdir -p "$SAFE" && git -C "$SAFE" init -q && echo canary > "$SAFE/CANARY.txt"
   git -C "$SAFE" add -A && git -C "$SAFE" -c user.email=t@t -c user.name=t commit -qm seed
   bash scripts/ship-client.sh --client=encore --out="$SAFE" --force; echo "EXIT=$?"
   test -f "$SAFE/CANARY.txt" && echo "CANARY SURVIVED" || echo "CANARY DESTROYED — DEFECT"
   ```
   → non-zero EXIT and `CANARY SURVIVED`. If it prints `CANARY DESTROYED`, that is a hard defect: STOP,
   report it, and do not continue to the remaining criteria.
7. **Idempotency**: ship again to `out2`, then
   `diff -r --exclude=node_modules --exclude=reports --exclude=.auth --exclude=package-lock.json C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB/out1 C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB/out2; echo "EXIT=$?"` → `EXIT=0`
8. `bash -n scripts/ship-client.sh; echo "EXIT=$?"` → `EXIT=0`
9. `git diff --stat scripts/ship-client.sh` → exactly ONE file changed. `git status --porcelain scripts/` shows no new untracked file authored by you.
10. `grep -c 'rm -rf "$OUT"' scripts/ship-client.sh` → `0`
11. `grep -nE 'specs_planning|readable_externals|\.env\.local' scripts/ship-client.sh` → NO hits (the list must come from `--emit-exclusions`, never a literal)

## VERIFY ARTIFACTS

Tee every acceptance command to
`C:/Users/RutvikKhorasiya/projects/encore_framework/.claude/state/ship-client-audit/ticketB-<n>.verify.txt`
and list each with its sha256.

## DOCTRINE — read these absolute paths, name them in DOCTRINE_READ

- `C:\Users\RutvikKhorasiya\projects\encore_framework\plans\pending\PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md` (Phases 2+3 are this ticket)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\pipeline.md` (LR-049 — ship via git archive only)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\guardrail-policy.md` (LR-069 — this is an S0 leak gate; your change must not lower its floor. The floor moves from "abort" to "exclude + verify payload"; prove it with acceptance 2 and 3.)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-branch.sh` (READ ONLY — the working reference for archive→strip→verify. Do not edit it.)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\skills\regression-guard\SKILL.md` (WRAP)

## CONSTRAINTS

- Windows 11 host, Git Bash. `mktemp -d` returns a `/tmp/...` style path — be careful mixing it with
  Windows-style paths in `git`/`tar` calls; `ship-branch.sh` already solved this, copy its approach.
- Never `cp -r` for the deliverable (LR-049). `git archive` only.
- If an acceptance criterion cannot pass, STOP and report it as a defect. Do not weaken the criterion.

## REPORT

To stdout only. DOCTRINE_READ + all 11 acceptance results with REAL pasted output and exit codes +
VERIFY_ARTIFACTS with sha256 + any assumption under `## ASK`.
