# Ship to Encore — Local Runbook (NEVER LEAVES THIS PC)

**Audience**: Rutvik + Claude only. Path is gitignored at `clients/encore/.gitignore:8` (`docs/read_only_docs/`), so this file structurally cannot enter `git archive`.

**Mock repo**: `omeesham/EncoreGlobal_AI_Test_Framework` — internal hygiene only. The Encore client never touches git; JBS colleagues hand over the folder/zip outside git.

---

## When to use

Any time we want to push the current `client_deliverable` branch's remediated state to the mock repo + verify the GA run is green-enough (login works + ≥1 spec passes).

## Pre-flight (60 seconds)

```bash
# we must be on the right branch and either clean or about to commit
git branch --show-current                       # expect: client_deliverable
git status --short | head -5                    # know what's staged

# what's currently on the mock?
git ls-remote https://github.com/omeesham/EncoreGlobal_AI_Test_Framework.git refs/heads/dev-rutvik
# remember this SHA — use it in --force-with-lease at Step 4
```

## The 6 steps

```bash
# 1. Commit any pending source changes (skip if tree clean)
git add -A
git commit -m "<concise message — what shipped this round>"

# 2. Verify-vendor-fresh check (vestigial post-2026-05-19 — vendoring removed by
#    PLAN_DIST_REGRESSION_AND_N_FIXES; meta-absent → exit 0 path always taken).
#    Kept in the ship-script preflight as a no-op until PLAN_ROOT_CLIENT_DEDUPE.md cleanup.
node scripts/verify-vendor-fresh.mjs --client=encore

# 3. Ship via the only blessed path (LR-049)
npm run client:ship -- --client=encore --out=/tmp/encore-deliv-$(date +%Y-%m-%d)
# this runs vendor-fresh + deny-list pre + git archive + deny-list post + npx playwright test --list
# `--list` does NOT run globalSetup — that's expected; the real auth smoke is the GA run

# 4. Push the shipped output to the mock repo
cd /tmp/encore-deliv-$(date +%Y-%m-%d)
git init
git add -A
git remote add origin https://github.com/omeesham/EncoreGlobal_AI_Test_Framework.git
git commit -m "Encore deliverables — <date or label>"
git push --force-with-lease=main:<KNOWN_SHA_FROM_PREFLIGHT> origin HEAD:main

# 5. Trigger the GA workflow + watch
gh workflow run playwright-tests.yml --repo omeesham/EncoreGlobal_AI_Test_Framework --ref dev-rutvik
sleep 10
gh run list --repo omeesham/EncoreGlobal_AI_Test_Framework --workflow playwright-tests.yml --limit 1
gh run watch <RUN_ID> --repo omeesham/EncoreGlobal_AI_Test_Framework

# 6. Verdict — GREEN if BOTH:
#    a) setup project login completes + writes .auth/encore-state.json
#    b) ≥1 spec passes in encore-local-office or encore-locations
#    Spec failures are FINE. Only 0-login or 0-pass is a stop-and-ask signal.
```

## Variant: Notes-only temp push to the `notes` branch (deny-list HARD-GATED)

Used when shipping ONLY the Notes surface from the **latest on-disk** state. Differs from the 6 steps above: source = working tree (not HEAD), `client:ship` is NOT used (its `xlsx:freshness` gate blocks a deliberately-partial workbook), we TRIM after archiving (so the deny-list must re-run on the FINAL content), and the fresh-init scratch has **no pre-push hook** → the manual gate is the ONLY net (see LR-049 caveat). Zero mutation to the working repo: `git stash create` snapshots without touching it.

```bash
REPO=$(git rev-parse --show-toplevel)
OUT="$HOME/encore-notes-push-$(date +%Y-%m-%d)"
URL=https://github.com/omeesham/EncoreGlobal_AI_Test_Framework.git

# 1. Snapshot the LIVE working tree without mutating it (captures uncommitted edits; gitignored excluded)
STASH=$(git stash create); SRC=${STASH:-HEAD}
rm -rf "$OUT"; mkdir -p "$OUT"
git archive "$SRC" clients/encore/ | tar -x -C "$OUT" --strip-components=2

# 2. Overlay any USER-NAMED untracked file as-is (archive skips untracked) — e.g. the QA tracker
cp clients/encore/test_cases_xlsx/encore-qa-tracker.csv "$OUT/test_cases_xlsx/" 2>/dev/null || true

# 3. Notes-only trim: keep ONLY location-notes.spec.ts (history is NOT notes); workbook -> Overview + locations_notes
cd "$OUT"
rm -f specs/locations/location-{account-address,auto-addon,currency,legal,local-information,management-history,pricing,shared-setup-locations}.spec.ts \
      specs/local-office/local-office-{ect,history,settings}.spec.ts \
      specs/locations/history/location-hist-notes.spec.ts
rmdir specs/locations/history 2>/dev/null
NODE_PATH="$REPO/node_modules" node -e 'const X=require("exceljs"),p=process.argv[1],K=new Set(["Overview","locations_notes"]);(async()=>{const w=new X.Workbook();await w.xlsx.readFile(p);w.worksheets.filter(s=>!K.has(s.name)).map(s=>s.id).forEach(i=>w.removeWorksheet(i));await w.xlsx.writeFile(p);})()' "$OUT/test_cases_xlsx/encore_test_cases.xlsx"

# 4. Commit in scratch, then HARD-GATE on the deny-list run against a CLEAN extract (NOT the polluted scratch)
git init -q -b main && git add -A
git -c user.name="RutviK-JBS" -c user.email="rutvik.khorasiya@jade-biz.com" commit -q -m "Encore notes-only deliverable - $(date +%Y-%m-%d)"
V=$(mktemp -d); git archive HEAD | tar -x -C "$V"
node "$REPO/scripts/verify-no-forbidden.mjs" --target="$V"; DENY=$?; rm -rf "$V"
[ $DENY -ne 0 ] && { echo "DENY-LIST FAIL — DO NOT PUSH. Fix the leak in source, re-trim."; exit 1; }   # <-- the gate that was once skipped

# 5. Push ONLY on GREEN (force-with-lease against the live remote tip)
git remote add origin "$URL"
TIP=$(git ls-remote "$URL" refs/heads/notes | awk '{print $1}')
git push --force-with-lease=notes:"$TIP" origin HEAD:refs/heads/notes

# 6. If a prior LEAKY commit is already in this branch's history, collapse to ONE clean commit so it's
#    gone from `git log`, not just off HEAD:
#    git checkout --orphan _clean && git add -A && git commit -m "..." \
#      && git push --force-with-lease=notes:<live-tip> origin _clean:refs/heads/notes
```

**Why the gate is step 4, not optional**: 2026-06-02 a push script printed `deny_exit=1` but had no `exit 1`, so it pushed leaky `specs_planning/…` page-object comments to `notes`. The shipped-set deny-list (on a clean `git archive HEAD` extract) is load-bearing here because the scratch's pre-push hook does not exist.

## Failure paths

- **vendor-fresh fails** → DEPRECATED 2026-05-19; this branch is now structurally unreachable (vendoring removed, meta always absent → exit 0). If it ever fires, the verify-vendor-fresh script itself broke — read the failure, do NOT run `vendor:build:all`. Tracked by PLAN_ROOT_CLIENT_DEDUPE.md.
- **deny-list grep fails** → check `scripts/verify-no-forbidden.mjs` MARKER_GREP / DENY_GLOBS; fix the leak source, recommit.
- **`git archive` smoke fails** (`npx playwright test --list` errors) → spec syntax / import error in shipped output; read the error, fix in source repo, restart at Step 1.
- **GA run RED with login error** → check workflow log for the auth.setup.ts step. If `NAVIGATOR_USERNAME` / `NAVIGATOR_PASSWORD` GitHub secrets are wrong → fix in repo Settings UI (out of scope here).
- **GA run RED with 0 passes** → not a flake; surface the log + STOP. Don't iterate without user input.

## Rollback (only if we made the deliverable structurally worse)

```bash
# tag pre-rebuild-2026-04-30 = febff022 (the original IP-leaking commit, archival-only)
# previous good main (post-SP-EFD-04) = d39f8997
git push --force origin <PREVIOUS_GOOD_SHA>:main
```

Don't roll back for spec-level flakes — those are downstream of the ship pipeline.

## Why this file exists

So future sessions don't burn 10 minutes researching the deliverable channel + force-push pattern + GA trigger. Read this once, run the 6 commands, done. If the workflow changes, edit this file — never re-derive from scratch.
