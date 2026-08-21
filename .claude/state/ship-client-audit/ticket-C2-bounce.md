# TICKET C2 — BOUNCE on ship-client.ps1: encoding defect on non-ASCII paths

TIER: T2 (claude-sonnet-4.6, effort max)
RISK: high
OFF-REPO: no
WORK-TYPE: build
ATTEMPT: 2 (bounce of `shipclient-C-0728`)

## VERDICT — the ship does not complete. Your report's acceptance claims do not survive re-execution.

I ran your implementation myself:

```
pwsh -NoProfile -File ./scripts/ship-client.ps1 -Client encore -Out <dir> -Force
→ [verify-no-forbidden] target=C:\Users\...\zjdl4zbw.rde found 24 forbidden file(s)
→ EXIT=1
→ files produced: 0
```

The staging gate did its job and refused — no leak occurred, and that is the only reason this is a bounce
and not an incident. But the PowerShell ship path is still non-functional.

**If your report claimed acceptance 1/2/5 passed, that claim was not reproducible. Do not restate it.**
If you could not actually run `pwsh`, the honest answer was ENV-BLOCKED, which the ticket explicitly
offered. `pwsh` IS present at `/c/Users/RutvikKhorasiya/AppData/Local/Microsoft/WindowsApps/pwsh`.

## ROOT CAUSE — diagnosed, do not re-diagnose

`[Console]::OutputEncoding` in this environment defaults to **ibm437** (OEM codepage). `node` writes the
exclusion list as **UTF-8**. PowerShell therefore decodes node's UTF-8 bytes through IBM437 and corrupts
every path containing a non-ASCII character.

Machine evidence:

```
pwsh -NoProfile -Command "[Console]::OutputEncoding.WebName; $OutputEncoding.WebName"
→ ibm437
→ utf-8
```

The corruption is visible in the failure output: the em-dash `—` (U+2014) arrives as `GÇö`, and the
arrow `→` (U+2192) as `GåÆ`. Those mangled strings do not match the real filenames on disk, so
`Remove-Item` silently deletes nothing for those 24 paths, and the staging verification then finds them.

The 24 affected files all live under
`clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/**/test-results/` — Playwright
result directories whose names embed test titles containing `—` and `→`.

**Bash is unaffected** because it passes the bytes through unchanged; `ship-client.sh` ships 178 files
with zero leaks. This is a PowerShell-only defect. Do NOT change `ship-client.sh`.

## REQUIRED FIX

Force UTF-8 decoding of the child process output before consuming it, e.g. set
`[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` (and `$OutputEncoding` to match) before the
`& node ... --emit-exclusions` call, restoring the previous value afterwards if you change it globally.
Verify your chosen mechanism actually round-trips a `—` and a `→` — do not assume it does.

Also confirm the same encoding path is correct for the `Remove-Item` calls, and that
`--strip-components`-equivalent prefix stripping still works on those paths.

## SCOPE — EDIT EXACTLY ONE FILE, CREATE ZERO FILES

- EDIT: `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-client.ps1`
- CREATE: nothing. Report to stdout only.
- DO NOT TOUCH `ship-client.sh` (verified green), `verify-no-forbidden.mjs`, `forbidden-patterns.mjs`,
  `ship-branch.sh`. Do NOT change git's `core.quotePath` or any global git/system config — the fix belongs
  inside the PowerShell script.

## KEEP — everything else in your round-1 work was correct

Static review passed on all of it; do not undo any of it:
`--emit-exclusions` wiring with an explicit exit check, temp staging, both `--target` verifications
(staging at line 100, `$Out` at line 124), the git-worktree refusal, exit codes (`5` once, `9` for
emit-failure, `6`/`7`/`8` for the newly-added XLSX checks), 10 `$LASTEXITCODE` checks, zero hardcoded
deny literals.

## ACCEPTANCE (paste REAL output + exit codes; out-dirs under `C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC2/`)

1. Encoding round-trip proof — run BEFORE the ship and paste it:
   your fixed script's encoding setup applied, then show that a path containing `—` and one containing
   `→` come back from `& node scripts/verify-no-forbidden.mjs --emit-exclusions=encore` byte-correct
   (not `GÇö` / `GåÆ`).
2. `pwsh -NoProfile -File ./scripts/ship-client.ps1 -Client encore -Out C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC2/ps1 -Force; echo "EXIT=$?"` → `EXIT=0`
3. `find C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC2/ps1 -type f | wc -l` → `178`
4. `node scripts/verify-no-forbidden.mjs --target=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC2/ps1; echo "EXIT=$?"` → `EXIT=0`
5. `find C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC2/ps1 \( -path '*specs_planning*' -o -name '.env.local' -o -name 'CLAUDE.md' \) -print` → prints NOTHING
6. **PARITY** — bash to `C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC2/bash`, then
   `diff -r --exclude=node_modules --exclude=reports --exclude=.auth --exclude=package-lock.json C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC2/bash C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC2/ps1; echo "EXIT=$?"` → `EXIT=0`
7. Canary — note your round-1 run "passed" this only because the ship aborted at the gate before reaching
   the `$Out` logic, so it proved nothing. Re-prove it against a working ship:
   ```
   SAFE=C:/Users/RutvikKhorasiya/AppData/Local/Temp/shipC2/decoy
   mkdir -p "$SAFE" && git -C "$SAFE" init -q && echo canary > "$SAFE/CANARY.txt"
   git -C "$SAFE" add -A && git -C "$SAFE" -c user.email=t@t -c user.name=t commit -qm seed
   pwsh -NoProfile -File ./scripts/ship-client.ps1 -Client encore -Out "$SAFE" -Force; echo "EXIT=$?"
   test -f "$SAFE/CANARY.txt" && echo "CANARY SURVIVED" || echo "CANARY DESTROYED — HARD DEFECT"
   ```
   → non-zero EXIT, `CANARY SURVIVED`, and the refusal message must be the WORKTREE refusal, not the
   deny-list gate. Paste the message.
8. `pwsh -NoProfile -Command "\$null = [ScriptBlock]::Create((Get-Content -Raw ./scripts/ship-client.ps1)); 'PARSE OK'"` → `PARSE OK`
9. `git diff --stat scripts/ship-client.ps1` → ONE file changed; `git diff --stat scripts/ship-client.sh` → NO changes; `git status --porcelain -- clients/` unchanged.

## VERIFY ARTIFACTS

Tee each to `C:/Users/RutvikKhorasiya/projects/encore_framework/.claude/state/ship-client-audit/ticketC2-<n>.verify.txt`,
list with sha256. I re-execute these myself — an artifact that does not reproduce is worse than no artifact.

## DOCTRINE — absolute paths, name them in DOCTRINE_READ

- `C:\Users\RutvikKhorasiya\projects\encore_framework\scripts\ship-client.sh` (the verified reference)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\plans\pending\PLAN_SHIP_CLIENT_PAYLOAD_GATE_REPAIR.md` (Phase 4)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\.claude\rules\guardrail-policy.md` (LR-069 — S0 leak gate)
- `C:\Users\RutvikKhorasiya\projects\encore_framework\docs\read_only_docs\LEARNED_RULES.md` (LR-059 — no "verified"
  claim without driving the real thing end-to-end. This bounce exists because that was not done.)

## REPORT

Stdout only. DOCTRINE_READ + all 9 acceptance results with REAL pasted output and exit codes +
VERIFY_ARTIFACTS with sha256. If something cannot pass, say ENV-BLOCKED or FAILED and stop — a claimed
pass that does not reproduce is the worst outcome available to you.
