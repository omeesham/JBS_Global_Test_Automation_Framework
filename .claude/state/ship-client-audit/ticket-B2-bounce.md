# TICKET B2 — BOUNCE on ship-client.sh (3 defects; functionality already verified green)

TIER: T2 (claude-sonnet-4.6, effort max)
RISK: medium
OFF-REPO: no
WORK-TYPE: build
ATTEMPT: 2 (bounce of run `shipclient-B-0728`)

## STATUS OF YOUR PRIOR WORK — read this first

Your Ticket B change WORKS. I independently re-ran the full battery, not your report:
`ship-client.sh --client=encore --out=<dir> --force` → EXIT=0; payload verify → EXIT=0; leak find → 0 hits;
178 files shipped (631 tracked − 453 excluded = 178, exact); idempotency `diff -r` → EXIT=0; worktree
refusal fires and the canary file survived. **None of that is in dispute and none of it may regress.**

Three defects remain. Fix ONLY these. Do not redesign.

## DEFECT 1 (must fix) — `cp -r` at line 81 violates LR-049

```
cp -r "$STAGING/." "$OUT/"
```

Functionally this is safe — `$STAGING` is a verified git-archive extract, not the working tree. But LR-049
(`.claude/rules/pipeline.md`) is enforced by grepping ship scripts for `cp -r`, and a hit inside the one
script that is supposed to be the counter-example is a landmine: the next auditor greps, finds it, and
either files a false violation or learns the wrong lesson. The ticket also stated "Never `cp -r` for the
deliverable" as a hard constraint.

Replace with a copy mechanism that leaves no `cp -r` token, e.g. a tar pipe:
`(cd "$STAGING" && tar -cf - .) | (cd "$OUT" && tar -xf -)`
or a `mv` where the filesystems allow it. `$STAGING` is under `/tmp` and `$OUT` may be on another volume,
so a bare `mv` can fail across devices — if you use `mv`, fall back correctly. Whatever you choose, the
resulting payload must remain byte-identical (acceptance 3 below re-proves idempotency).

## DEFECT 2 (must fix) — the comment at lines 55-57 states a misleading reason

```
# (git archive --pathspec-from-file is unavailable in
# this environment; staging-delete achieves the identical payload outcome.)
```

I verified both halves. `--pathspec-from-file` genuinely does NOT exist for `git archive` in
git 2.43.0.windows.1 — that part is TRUE and I accept the design deviation. But the comment implies
exclude-pathspecs were not an option at all, and they ARE supported:
`git archive HEAD clients/encore/ ':(exclude)clients/encore/specs_planning'` works and strips them.

The real reason staging-delete is correct here is the OTHER one: 453 inline `:(exclude)` pathspecs
(~27KB) would approach/exceed the Windows command-line limit, and `--pathspec-from-file` is not available
in this git to work around it. Rewrite the comment to say exactly that, so a future reader does not
"helpfully fix" it into an argv overflow.

## DEFECT 3 (must fix) — a failed exclusion query silently ships everything

```
mapfile -t EXCLUSIONS < <(node scripts/verify-no-forbidden.mjs --emit-exclusions="$CLIENT")
```

Process substitution does not propagate exit status, and `set -o pipefail` does not cover it. If node
errors (bad client id, module resolution failure), `EXCLUSIONS` is silently empty and the archive is
stripped of NOTHING. The `--target` gate at line 67 does still catch the resulting payload, so the leak
floor holds — but the failure is silent and misdiagnosable.

Capture and check the exit status explicitly; abort with a clear message if the emit command failed.
Note: an EMPTY list is legitimate (a client with no deny-listed tracked files) — you are checking for
COMMAND FAILURE, not for an empty array. Do not conflate the two.

## SCOPE — EDIT EXACTLY ONE FILE, CREATE ZERO FILES

- EDIT: `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-client.sh`
- CREATE: nothing. Report to stdout only.
- DO NOT TOUCH anything else. Do not revisit the design. Do not "improve" unrelated lines.

## ACCEPTANCE (paste REAL output + exit codes)

Run from `C:\Users\RutvikKhorasiya\projects\encore_framework`, out-dirs under `C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB2/`:

1. `grep -c 'cp -r' scripts/ship-client.sh` → `0`
2. `bash scripts/ship-client.sh --client=encore --out=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB2/out1 --force; echo "EXIT=$?"` → `EXIT=0`
3. Ship again to `out2`, then
   `diff -r --exclude=node_modules --exclude=reports --exclude=.auth --exclude=package-lock.json C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB2/out1 C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB2/out2; echo "EXIT=$?"` → `EXIT=0`
4. `node scripts/verify-no-forbidden.mjs --target=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB2/out1; echo "EXIT=$?"` → `EXIT=0`
5. `find C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB2/out1 \( -path '*specs_planning*' -o -name '.env.local' -o -name 'CLAUDE.md' \) -print` → prints NOTHING
6. File count unchanged at **178**: `find C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB2/out1 -type f | wc -l` → `178`
7. Canary still safe — build a throwaway repo and aim at it:
   ```
   SAFE=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB2/decoy
   mkdir -p "$SAFE" && git -C "$SAFE" init -q && echo canary > "$SAFE/CANARY.txt"
   git -C "$SAFE" add -A && git -C "$SAFE" -c user.email=t@t -c user.name=t commit -qm seed
   bash scripts/ship-client.sh --client=encore --out="$SAFE" --force; echo "EXIT=$?"
   test -f "$SAFE/CANARY.txt" && echo "CANARY SURVIVED" || echo "CANARY DESTROYED — HARD DEFECT"
   ```
   → non-zero EXIT and `CANARY SURVIVED`
8. Defect 3 proof — simulate emit failure and show the script aborts loudly rather than shipping
   unstripped: `bash scripts/ship-client.sh --client=nosuchclient --out=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipB2/out3; echo "EXIT=$?"` → non-zero, with a message naming the real cause. (`clients/nosuchclient` does not exist, so exit 4 may fire first — if so, state that plainly and demonstrate defect 3 another way rather than claiming a pass you did not observe.)
9. `bash -n scripts/ship-client.sh; echo "EXIT=$?"` → `EXIT=0`
10. `git diff --stat scripts/ship-client.sh` → ONE file changed; `git status --porcelain -- clients/` unchanged from before your run.

## VERIFY ARTIFACTS

Tee each to `C:/Users/RutvikKhorasiya/projects/encore_framework/.claude/state/ship-client-audit/ticketB2-<n>.verify.txt`,
list with sha256.

## DOCTRINE — absolute paths, name them in DOCTRINE_READ

- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\pipeline.md` (LR-049 — why `cp -r` is banned by grep)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\guardrail-policy.md` (LR-069 — S0 leak gate; the floor must not drop)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\plans\pending\PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md` (Phases 2+3)

## REPORT

Stdout only. DOCTRINE_READ + all 10 acceptance results with REAL pasted output and exit codes +
VERIFY_ARTIFACTS with sha256 + anything you could not prove under `## ASK`. If a criterion cannot pass,
say so — do not weaken it.
