# TICKET C — mirror the payload-gate redesign into ship-client.ps1

TIER: T2 (claude-sonnet-4.6, effort max)
RISK: medium
OFF-REPO: no
WORK-TYPE: build

## GOAL

Bring `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-client.ps1` to semantic parity with the
already-finished, already-verified `scripts/ship-client.sh`, and fix two known false-green defects in it.

`ship-client.ps1` declares itself "identical semantics to ship-client.sh" (its line 2). Right now that is
false: its line 29 still runs the `--client` pre-flight that aborts on 453 tracked deny-listed files, so
the PowerShell path is as broken as the bash one was.

## READ FIRST — the reference implementation is DONE, do not redesign it

`C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-client.sh` is final and verified green
(ships 178 files, exit 0, zero leaks, idempotent, refuses to overwrite a git worktree). **Read it and
mirror its logic.** Do not invent a different approach. The shape you are mirroring:

1. Capture the exclusion list from `node scripts/verify-no-forbidden.mjs --emit-exclusions=<client>`,
   checking the command's exit status explicitly (a FAILED command aborts; an EMPTY list is legitimate).
2. Stage into a temp directory, not `$Out`.
3. `git archive` into staging, then remove each excluded path (strip the leading `clients/<id>/`), then
   prune empty directories.
4. Verify the staged payload with `--target=<staging>` — the authoritative gate.
5. `$Out` safety: refuse UNCONDITIONALLY if `$Out` is a git worktree (`-Force` does NOT override);
   refuse a non-empty `$Out` without `-Force`.
6. Populate `$Out` from staging, then verify `--target=$Out` (defence in depth), BEFORE the npm smoke.
7. Existing post-ship checks stay: no `.github/workflows`, npm install + `playwright test --list` smoke,
   remove `node_modules`/`reports`/`test-results` afterwards, XLSX presence check.
8. Clean up the staging dir on exit.

## ALSO FIX — two recorded false-green defects in this file

From `C:\Users\RutvikKhorasiya\projects\encore_framework\plans\pending\_ULTRAAUDIT_FINDINGS.md`:

- **P2-LOT17-06 (S1)** — lines 53-55: no `$LASTEXITCODE` check after `npm install --silent` or after
  `npx playwright test --list`. A failed smoke currently produces a false-green ship.
- **P2-LOT17-07 (S2)** — lines 39-40: no `$LASTEXITCODE` check after `tar` before `Remove-Item` deletes
  `_archive.tar`. A failed extract destroys the evidence and continues.

Cite both finding IDs in a comment where you fix them.

## EXIT-CODE PARITY (get this exactly right)

Mirror `ship-client.sh`'s codes: `2` bad args, `3` dirty tree, `4` client dir missing,
`5` GitHub workflow present, `6` XLSX missing, `7` XLSX stale, `8` XLSX absent from archive,
`9` emit-exclusions failed, `1` `$Out` refusals. `exit 5` must appear for exactly ONE condition.

Note: `ship-client.ps1` currently has NO XLSX freshness/presence checks at all — that gap is
`_ULTRAAUDIT_FINDINGS.md` P2-LOT17-01. **Add them**, mirroring the bash `if ($Client -eq 'encore')`
blocks, so codes 6/7/8 are real rather than reserved.

## SCOPE — EDIT EXACTLY ONE FILE, CREATE ZERO FILES

- EDIT: `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-client.ps1`
- CREATE: nothing. Report to stdout only.
- DO NOT TOUCH `ship-client.sh` (it is finished), `verify-no-forbidden.mjs`, `forbidden-patterns.mjs`,
  or `ship-branch.sh`.

## ACCEPTANCE (paste REAL output + exit codes; out-dirs under `C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC/`)

PowerShell 7 (`pwsh`) is available. If it is NOT on this machine, STOP and report that as an
ENV-BLOCKED finding with the command you tried — do not fake a pass and do not claim the file works
without running it.

1. `pwsh -NoProfile -Command "& { . ./scripts/ship-client.ps1 -Client encore -Out C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC/out1 -Force }"; echo "EXIT=$?"` → `EXIT=0`
   (adjust invocation form as needed; report the exact command you ran)
2. `find C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC/out1 -type f | wc -l` → `178` (must match the bash ship exactly)
3. `node scripts/verify-no-forbidden.mjs --target=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC/out1; echo "EXIT=$?"` → `EXIT=0`
4. `find C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC/out1 \( -path '*specs_planning*' -o -name '.env.local' -o -name 'CLAUDE.md' \) -print` → prints NOTHING
5. **Cross-implementation parity** — the two ship paths must produce identical payloads. Ship with bash to
   `C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC/bash1`, then:
   `diff -r --exclude=node_modules --exclude=reports --exclude=.auth --exclude=package-lock.json C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC/bash1 C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC/out1; echo "EXIT=$?"` → `EXIT=0`
6. Canary — must refuse a git worktree without deleting:
   ```
   SAFE=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC/decoy
   mkdir -p "$SAFE" && git -C "$SAFE" init -q && echo canary > "$SAFE/CANARY.txt"
   git -C "$SAFE" add -A && git -C "$SAFE" -c user.email=t@t -c user.name=t commit -qm seed
   ```
   then run the ps1 with `-Out "$SAFE" -Force` → non-zero exit, and
   `test -f "$SAFE/CANARY.txt" && echo "CANARY SURVIVED" || echo "CANARY DESTROYED — HARD DEFECT"`
7. `grep -c 'LASTEXITCODE' scripts/ship-client.ps1` → at least `6`
8. `grep -c 'exit 5' scripts/ship-client.ps1` → `1`
9. `grep -n 'exit 9' scripts/ship-client.ps1` → exactly one hit, on the emit-failure branch
10. `grep -nE 'specs_planning|readable_externals|\.env\.local' scripts/ship-client.ps1` → NO hits
11. `pwsh -NoProfile -Command "\$null = [ScriptBlock]::Create((Get-Content -Raw ./scripts/ship-client.ps1)); 'PARSE OK'"` → `PARSE OK`
12. `git diff --stat scripts/ship-client.ps1` → ONE file changed; `git status --porcelain -- clients/` unchanged from before your run.

## VERIFY ARTIFACTS

Tee each to `C:/Users/RutvikKhorasiya/projects/encore_framework/.claude/state/ship-client-audit/ticketC-<n>.verify.txt`,
list with sha256.

## DOCTRINE — absolute paths, name them in DOCTRINE_READ

- `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-client.sh` (THE reference — mirror it)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\plans\pending\PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md` (Phase 4)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\plans\pending\_ULTRAAUDIT_FINDINGS.md` (P2-LOT17-01/06/07)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\guardrail-policy.md` (LR-069 — S0 leak gate; the floor must not drop)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\pipeline.md` (LR-049 — never `cp -r`; `Copy-Item -Recurse` of the working tree is the same violation. Copying a VERIFIED staging dir is fine, but do not leave a `cp -r` token, and do not copy from `clients/<id>/` directly.)

## CONSTRAINTS

- Never archive or copy from the working tree — `git archive` only.
- If acceptance 5 (bash↔PowerShell payload parity) fails, that is a real defect: report the diff, do not
  suppress it by widening the exclude list.
- If any criterion cannot pass, say so plainly. Do not weaken a criterion to make it pass.

## REPORT

Stdout only. DOCTRINE_READ + all 12 acceptance results with REAL pasted output and exit codes +
VERIFY_ARTIFACTS with sha256. Under `## ASK`, disclose ANY change this ticket did not request.
