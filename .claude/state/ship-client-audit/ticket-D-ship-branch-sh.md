# TICKET D — stop ship-branch.sh depending on a coincidence to keep credentials out

TIER: T2 (claude-sonnet-4.6, effort max)
RISK: high
OFF-REPO: no
WORK-TYPE: build

## GOAL

Edit `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-branch.sh` so its exclusion of internal /
secret paths is DERIVED from the deny-list, not hand-written — while changing nothing else about its
behaviour.

## WHY — this is a real latent credential leak, not a tidy-up

`ship-branch.sh` is the LIVE client-delivery path (used by `/push-encore-deliverables`). Lines 142-143
hand-strip its scratch copy:

```
rm -rf "$SCRATCH/docs" "$SCRATCH/specs_planning" "$SCRATCH/readable_externals" \
       "$SCRATCH/.github" "$SCRATCH/.auth" "$SCRATCH/.claude" "$SCRATCH/CLAUDE.md"
```

That list omits `.env.local`, which IS tracked in git (`git ls-files --error-unmatch
clients/encore/.env.local` succeeds), IS on `DENY_GLOBS` (`/\.env\.local$/`), and per LR-ENC-003 holds
REAL credentials. `git archive` at line 137 therefore extracts it into `$SCRATCH`.

It does not currently reach the client only because line 265-269 does a throwaway `git init` + `git add -A`
inside `$SCRATCH`, which re-applies the SHIPPED `clients/encore/.gitignore` — whose lines 15-18 happen to
list `.env.local`. Delete or reorder that gitignore line and the next module ship pushes live credentials
to `encore_deliverables_test`. The safety is accidental. Make it structural.

## SCOPE — EDIT EXACTLY ONE FILE, CREATE ZERO FILES

- EDIT: `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-branch.sh`
- CREATE: nothing. Report to stdout only.
- DO NOT TOUCH: any other script, the client `.gitignore`, any preset, any plan.

## REQUIRED CHANGE — exactly one thing

Replace the hand-written `rm -rf` at lines 139-143 with a strip derived from
`node scripts/verify-no-forbidden.mjs --emit-exclusions=encore` (landed by Ticket A — prints one
repo-relative path per line, e.g. `clients/encore/specs_planning/foo.md`, exits 0).

**The trap you must handle**: the archive at line 137 uses `--strip-components=2`, so paths inside
`$SCRATCH` are CLIENT-relative (`specs_planning/foo.md`), while `--emit-exclusions` emits REPO-relative
paths (`clients/encore/specs_planning/foo.md`). Strip the `clients/encore/` prefix before removing.
Remove files defensively (missing path = not an error) and prune directories that become empty.

Keep the explanatory comment block, updated to say the list is derived rather than mirrored.

## WHAT MUST NOT CHANGE

- Dry-run stays the DEFAULT. `--push` stays required to push. Do not push during this ticket.
- All 22 branch presets, `--modules`, `--surface`, `--tcs`, `--keep-scratch`, the working-tree integrity
  trap, the spec trim, the xlsx trim, the throwaway-git-init block, the CLEAN re-extract, the
  `--target` hard gate, and the `--force-with-lease` push logic: byte-identical in behaviour.
- Do NOT remove the throwaway `git init` + `git add -A` — it stays as defence in depth. You are removing
  its status as the ONLY thing keeping credentials out, not removing it.

## ACCEPTANCE (machine-checkable — paste REAL output + exit codes)

Run from `C:\Users\RutvikKhorasiya\projects\encore_framework`:

1. `bash scripts/ship-branch.sh --branch=nm2273 --keep-scratch; echo "EXIT=$?"` → `EXIT=0`, output ends
   with the DRY-RUN line and `deny-list clean`. **No push must occur** — confirm `--push` absent.
2. From the `SCRATCH=` path that run prints, prove the scratch itself (BEFORE the git-init filter) is now
   clean — this is the whole point of the ticket:
   `find <SCRATCH> \( -name '.env.local' -o -path '*specs_planning*' -o -name 'CLAUDE.md' -o -path '*/docs/*' \) -print` → prints NOTHING
3. Prove the regression this ticket targets is real and now fixed — run the same find against a scratch
   built by the PREVIOUS version (`git stash` your change, re-run step 1 with `--keep-scratch`, find,
   then `git stash pop`): the OLD scratch MUST show `.env.local`, the NEW one must not. Paste both.
4. `bash scripts/ship-branch.sh --branch=notes; echo "EXIT=$?"` → `EXIT=0` (a second preset still works)
5. `bash -n scripts/ship-branch.sh; echo "EXIT=$?"` → `EXIT=0`
6. `grep -nE '\$SCRATCH/(docs|specs_planning|readable_externals|CLAUDE\.md)' scripts/ship-branch.sh` → NO hits
7. `git diff --stat scripts/ship-branch.sh` → exactly ONE file changed
8. `git status --porcelain -- clients/` before and after your runs → IDENTICAL (the script's own integrity
   trap already asserts this; prove it independently)

## VERIFY ARTIFACTS

Tee every acceptance command to
`C:/Users/RutvikKhorasiya/projects/encore_framework/.claude/state/ship-client-audit/ticketD-<n>.verify.txt`
and list each with its sha256.

## DOCTRINE — read these absolute paths, name them in DOCTRINE_READ

- `C:\Users\RutvikKhorasiya\projects\encore_framework\plans\pending\PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md` (Phase 5 is this ticket; Finding 4 in Context is the bug)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\pipeline.md` (LR-049, incl. the scratch-init caveat)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\guardrail-policy.md` (LR-069 — S0 class: a credential leak to a client repo is irreversible; gate on first occurrence)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\clients\encore\CLAUDE.md` (LR-ENC-003 — why `.env.local` holds real creds)

## CONSTRAINTS

- NEVER pass `--push` in this ticket. No network write of any kind.
- Never `cp -r` (LR-049).
- If acceptance 3 does NOT show `.env.local` in the OLD scratch, STOP and report — that would mean the
  premise is wrong and the change may be unnecessary. Do not proceed on an unproven premise.

## REPORT

To stdout only. DOCTRINE_READ + all 8 acceptance results with REAL pasted output and exit codes +
VERIFY_ARTIFACTS with sha256 + any assumption under `## ASK`.
