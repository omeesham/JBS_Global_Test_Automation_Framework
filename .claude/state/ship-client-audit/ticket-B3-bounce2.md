# TICKET B3 — round-2 bounce on ship-client.sh (2 defects; your round-2 fixes were correct)

TIER: T2 (claude-sonnet-4.6, effort max)
RISK: medium
OFF-REPO: no
WORK-TYPE: build
ATTEMPT: 3 (bounce of `shipclient-B2-0728`)

## STATUS — all three round-2 defects are FIXED. Verified independently, not from your report:

- `grep -c 'cp -r' scripts/ship-client.sh` → `0`. The tar-pipe replacement is correct.
- The comment now cites the real reason (453 pathspecs ≈ 27 KB vs the Windows command-line limit,
  `--pathspec-from-file` absent in git 2.43.0.windows.1). Accurate.
- The emit-failure check is right, and it correctly distinguishes COMMAND FAILURE from a legitimately
  EMPTY list.

I also checked two things I suspected were defects and they are NOT — do not "fix" them:
- The `[[ -e ... ]] && rm -rf ...` loop body does NOT trip `set -e` when the test is false (verified
  empirically). Leave it.
- `rm -rf "$OUT/node_modules" "$OUT/reports" "$OUT/test-results"` is safe: `git ls-files
  clients/encore/reports/` returns 0 tracked files, so nothing shipped is deleted — it only removes what
  the `npm install` + playwright smoke created. This is an improvement over the old behaviour, which left
  `node_modules` inside the delivered directory. **Keep it.** But see defect 2 note below.

Two defects remain.

## DEFECT 1 (must fix) — exit-code collision: `5` now means two different things

Line 38 uses `exit 5` for "emit-exclusions failed". Line 98 already uses `exit 5` for "deliverable
contains a GitHub workflow". The ticket constraint was explicit: exit codes 2/3/4/5/6/7/8 keep their
current meanings. These codes are referenced in plan docs (e.g. `_ULTRAAUDIT_FINDINGS.md` cites "sh exits
6/7" for the XLSX gates), so a collision is a real ambiguity, not a style nit.

Assign the emit-failure a NEW unused code: **`exit 9`**. Update the message accordingly. Do not renumber
any existing code.

## DEFECT 2 (must fix) — `$OUT` is no longer verified after the copy; the S0 floor dropped

Your change moved the deny-list verification to `$STAGING` (correct — that IS the authoritative gate and
it must stay). But it DELETED the old post-archive check that ran against the final output:

```
-# Post-ship: deny-list grep against the actual output (defense in depth).
-node scripts/verify-no-forbidden.mjs --target="$OUT"
```

Its own comment said "defense in depth". This is an S0 leak gate (`.claude/rules/guardrail-policy.md`
LR-069): a client-facing IP/secret leak is irreversible, so the floor is gated on FIRST occurrence and
must not be lowered by a refactor. Right now nothing at all inspects `$OUT` — if the tar-pipe copy
misbehaves, or anything writes into `$OUT` between the copy and delivery, no gate sees it.

Restore a `--target="$OUT"` verification. **Placement matters**: put it immediately AFTER the tar-pipe
copy and BEFORE the `npm install` smoke — that mirrors the old ordering and avoids scanning
`node_modules`. Keep the `$STAGING` gate as well. Two checks, not one replacing the other.

## SCOPE — EDIT EXACTLY ONE FILE, CREATE ZERO FILES

- EDIT: `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-client.sh`
- CREATE: nothing. Report to stdout only.
- Change ONLY the two things above. No other edits, no cleanups, no renames.

## ACCEPTANCE (paste REAL output + exit codes; out-dirs under `C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB3/`)

1. `grep -c 'exit 5' scripts/ship-client.sh` → `1`
2. `grep -n 'exit 9' scripts/ship-client.sh` → exactly one hit, on the emit-failure branch
3. `grep -c 'verify-no-forbidden.mjs --target' scripts/ship-client.sh` → `2`
4. Ordering proof — paste the output of
   `grep -n -E 'tar -xf -|--target=|npm install' scripts/ship-client.sh`
   and show the `--target="$OUT"` line number falls BETWEEN the tar-extract line and the `npm install` line.
5. `bash scripts/ship-client.sh --client=encore --out=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB3/out1 --force; echo "EXIT=$?"` → `EXIT=0`
6. `find C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB3/out1 -type f | wc -l` → `178`
7. `find C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB3/out1 \( -path '*specs_planning*' -o -name '.env.local' -o -name 'CLAUDE.md' \) -print` → prints NOTHING
8. `test -d C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB3/out1/node_modules && echo "LEFTOVER — DEFECT" || echo "clean"` → `clean`
9. Ship again to `out2`; `diff -r --exclude=node_modules --exclude=reports --exclude=.auth --exclude=package-lock.json <out1> <out2>; echo "EXIT=$?"` → `EXIT=0`
10. Canary — throwaway repo, must refuse and not delete:
    ```
    SAFE=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB3/decoy
    mkdir -p "$SAFE" && git -C "$SAFE" init -q && echo canary > "$SAFE/CANARY.txt"
    git -C "$SAFE" add -A && git -C "$SAFE" -c user.email=t@t -c user.name=t commit -qm seed
    bash scripts/ship-client.sh --client=encore --out="$SAFE" --force; echo "EXIT=$?"
    test -f "$SAFE/CANARY.txt" && echo "CANARY SURVIVED" || echo "CANARY DESTROYED — HARD DEFECT"
    ```
    → non-zero EXIT and `CANARY SURVIVED`
11. `bash -n scripts/ship-client.sh; echo "EXIT=$?"` → `EXIT=0`
12. `git diff --stat scripts/ship-client.sh` → ONE file changed; `git status --porcelain -- clients/` unchanged from before your run.

## VERIFY ARTIFACTS

Tee each to `C:/Users/RutvikKhorasiya/projects/encore_framework/.claude/state/ship-client-audit/ticketB3-<n>.verify.txt`,
list with sha256.

## DOCTRINE — absolute paths, name them in DOCTRINE_READ

- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\guardrail-policy.md` (LR-069 — S0 severity class; a refactor may not lower a gate's floor. Defect 2 is exactly that.)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\pipeline.md` (LR-049)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\plans\pending\PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md` (Phases 2+3)

## REPORT

Stdout only. DOCTRINE_READ + all 12 acceptance results with REAL pasted output and exit codes +
VERIFY_ARTIFACTS with sha256. Under `## ASK`, disclose ANY change you made that this ticket did not
request — undisclosed scope is judged harder than a disclosed mistake.
