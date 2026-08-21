# Resume state — profile migration (PLAN_64)

Written 2026-08-13 ~12:05 by the pre-restart session, so a fresh Claude started from
`C:\Users\RutvikKhorasiya\projects\encore_framework` can continue without re-deriving anything.

**Context in one line:** Windows replaced an unofficial MS account with an official AzureAD one,
creating `C:\Users\RutvikKhorasiya` while `C:\Users\rutvi` stayed fully intact. This was a **profile
change, not a reset** — nothing was wiped. Everything below follows from that.

## Standing constraints (do not relax)

- **Zero writes to `C:\Users\rutvi`.** Reads only, via `robocopy /B` where ACLs block. No `/MIR`, `/MOV`, `/PURGE`.
- **Backup archive passphrase is on Rutvik's phone.** Never attempt to crack, brute-force, or guess it. Emit the `7z x` command for him to run.
- **Staging dirs are retained** until Rutvik explicitly says "migration accepted". Do not clean up `C:\migration_staging`.
- **ACL-denied ≠ absent.** A `find`/`Test-Path` that returns nothing under the old profile proves nothing — it silently skips denied dirs. This has caused two wrong "it's gone" calls already.
- **Historical records stay historical.** Transcripts, `plans/done/`, and dated reports keep the old path; rewriting them falsifies the record (LR-027). Only *live* files get the new path.

## Done and verified

| Area | State |
|---|---|
| Migration | 16,711 files rewritten, 0 unplanned collisions, 0 old-profile writes |
| Data loss | None — the 15-file gap was fully explained as post-migration writes |
| User PATH | Repaired. `%APPDATA%\npm` restored → `claude` / `copilot` / `playwright-cli` / `tsc` back on PATH. Prior value: `forensics\user-path-before-2026-08-13_114719.txt` |
| Residual paths | ~~10 targets total, all clean~~ **THAT ROW WAS FALSE — corrected 2026-08-13 evening.** 12 targets. First pass fixed 4 (`.ci/Jenkinsfile.windows`, VS Code `storage.json`, 2× Antigravity `extensions.json`); second pass fixed 6 more (VS Code + Cursor + Gemini percent-encoded URIs); a third pass found **2 the earlier audits could not see** (below). Backups: `fix-backup-2026-08-13_115221` and `_123411` |
| Audit blind spot | **Every prior residual-path audit used ripgrep, which honors `.gitignore` — so the highest-risk file class (machine-local configs, gitignored precisely *because* they hold absolute local paths) was skipped silently.** `PLAN_64:112` correctly specifies `grep -rIl`; the risk is anyone re-running that check with `rg`. Corrected sweep: enumerate the ignored set with `git ls-files -o -i --exclude-standard`, then scan it |
| Full-profile audit | 941,562 files byte-scanned. 9,908 carry old-path refs — migration's `residual=1822` was a 5.4× undercount — but only **16 genuinely harmful-live**, and **0** broken git plumbing. Report: `forensics\path-audit.md` |
| Record truth | 82 narrative-record files reverted to old paths; 27 live files correctly keep new. Backup: `record-revert-backup-2026-08-13` |
| Gates | typecheck (1 err) and lint (3 err) both proven **pre-existing**; fixture provenance 6/6; the 2 closure FAILs (`SUBPLAN_XLSX_PREP_01…`, `SYSTEMS_AUDIT_RCA`) are **pre-existing** — both files are clean vs HEAD |
| claude.ai chat pins | Never lost — account-side, proven by identical UUIDs across three stores sharing no local path |

## Corrections to earlier claims (do not repeat the originals)

- Git identity was **never lost** — it lives at repo level (`RutviK-JBS <rutvik.khorasiya@jade-biz.com>`), not global. The old profile had no global `[user]` block at all.
- The `7z-output-*.txt` files are **3–15% progress samples, not manifests**, and 6 of 16 archives have no listing. "Absent from the listing" is never proof of absence.
- The RESTORE_README **overstates** the damage: 6 of 9 re-auth rows were already satisfied. Two rows are factually wrong — `.auth/` *is* in backup group 01, and `npm run auth:setup` does not exist in either package.json.

## The git reservoir — measured, awaiting Rutvik's decision

The audit's alarm was "119 tracked files hold 799 old-path refs in the committed tree." Measured
precisely (with a real lookahead — `grep -P` is unavailable in this locale and `grep -E` silently
ignores `(?!…)`, which produced a false zero on the first attempt):

- **119 files / 799 refs** in `HEAD` total
- **27 files / 81 refs are LIVE** — working tree is already correct, only the commit is missing
- **92 files / 718 refs are HISTORICAL** — they *should* keep old paths; committing a rewrite of these would falsify the record

So the alarming number is 92 files' worth of correct history. Real exposure is the 27.
Worst case if left: `.claude/settings.local.json` alone has 34 old-path refs in its committed blob
(0 in the working tree), so any `git restore` / `checkout` / fresh clone silently re-breaks Claude
Code's own permission allowlist and the Jenkins build path.

Remediation is a commit of the 27 already-corrected live files, and nothing else.
**Not done — committing is Rutvik's call and he has not been asked yet.**

## Open items

1. ~~**Elevated recovery**~~ — **DONE.** 159 `$I` records read across all 7 bins. Only 3 Claude-related entries, none of them the app store: the deleted `projects\intelliqe-login-to-claude` folder (23 MB, 2026-07-07) and two `claude-connector-setup.exe` installers in Downloads. **`Roaming\Claude` was never recycled**, so this route is exhausted. Output: `forensics\recyclebin-decode.txt`.
2. ~~**Bookmarks**~~ — **DONE, all 16 recovered**, straight from the old profile. The encrypted archive was never needed and the passphrase was never touched. Import file: `forensics\recovered-bookmarks.html` (2 folders — Default, and Profile 1 holding the Encore/Navigator/JIRA set). Raw copies: `forensics\old-bookmarks\`. Built as an *import* rather than a file overwrite because Chrome is running and a direct `Bookmarks` swap risks the checksum discarding them. **Remaining action: Rutvik imports via Chrome → Bookmark Manager → Import.** Edge's 3 were OEM junk (Lenovo/McAfee), skipped.
3. **Unsent draft and the 10 `code:` pins** — confirmed unrecoverable. The Recycle Bin was the last route and it came back clean. Draft schemas for the record: desktop `composer-draft:epitaxy-<sessionKey>`, web `LSS-<uuid>:textInput`; searching only the former yields a false negative.
4. **Ceremony** — PLAN_64 is still in `plans/pending/`. Outstanding: Phase 2.5 adjacent-sweep, Phase 3.5 finalization (Execution Summary + closure validator + `git mv` to done + `plans:reindex`), LR-028 activity-log check (expected N/A — no pipeline artifacts touched), `/final-q` exit with verdict block and delegation-temp Exit Receipt.
5. **PowerShell execution policy** — did not migrate. All five scopes read `Undefined`, so the effective policy is `Restricted` and `claude.ps1` will not load. `claude.cmd` works and is the immediate route (verified v2.1.81). The persistent fix is `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, which is Rutvik's to run — it is a security setting. No NTUSER hive was staged, so the old profile's actual value is unknown; `RemoteSigned` is the standard value, not a verified restoration.
6. **Reinstall-only** — 4 Desktop `.lnk` shortcuts and `.codex\config.toml` point at executables that exist *only* in the old profile. Rewriting them would break shortcuts that currently work, so they are deliberately excluded from the fix script. Remediation is reinstalling those apps.
7. **Never rewrite** — VS Code `state.vscdb` holds 90 old-path hits but is `SQLite format 3`; substitution changes record length prefixes and would corrupt the database. Clear it through the app's own UI. Also: 5 `.bak-*` hook copies would restore a delegation gate pointed at the old repo if ever applied.
8. **Old-tree writes** — ~~the pre-restart session's hooks resolved `$CLAUDE_PROJECT_DIR`~~ **CORRECTED 2026-08-13: that claim was wrong.** No delegation hook reads `$CLAUDE_PROJECT_DIR` — a grep across all of them returns zero hits. The real lever is `GATED_REPO_ROOT`, which is set nowhere, so **nine** hooks fall back to `process.cwd()` (delegation-gate:76, ua-worker-guard:64, check-delegation-envelope:38, check-isolation-perimeter:36, check-config-liveness:29, check-weight-council:39, check-agent-parity:36, check-closure-debt:37, delegation-nudge:46). `delegation-nudge:105` and `labor-gate:546` additionally write telemetry to the hook payload's cwd rather than the gated root, so telemetry only converges once no session runs from the old cwd. After restart, confirm the dead tree's `gate-fires.log` mtime has frozen. A full-tree sweep of old-tree writes never finished — only `.claude/state` was enumerated, so writes elsewhere under the old tree remain uncounted.

## Delegation control-plane wave — 2026-08-13 evening

Triggered by another session hitting two failures. Three read-only sweeps (home control plane, repo
wiring, launch surfaces) produced one mechanism and one culprit.

**Mechanism:** no delegation file was ever corrupted. `GATED_REPO_ROOT` is unset (no `env` block in
`~/.claude/settings.json`, no hook command sets it), so the gate perimeter is implicit in whichever
folder a session opened in. `scorecard.mjs` likewise reads `LEDGER_PATH || ~/.claude/delegation/ledger.jsonl`
— a file that has never existed — which is the whole of the "run_id not found" symptom. The failing
command was *also* missing `--lesson`, mandatory for the non-green `bounced-then-green` outcome, so a
path fix alone would not have made it pass.

**Culprit:** Claude Desktop. `AppData\Roaming\Claude\claude_desktop_config.json` still lists the dead
repo under `preferences.epitaxyPrefs` (`epitaxy-folder-permission-mode.*` = `auto`, plus a
`epitaxy-perm-mode-acks.*` entry), `git-worktrees.json` keeps it in `untrackedDirGc.cwds`, and three
session manifests pin `cwd` + `originCwd` there — including the starred/pinned "1715" session.
`originCwd` is the sharp edge: resume/fork rehydrates the old cwd even after the folder map is fixed.
Everything else was verified clean — Windows Terminal, HKCU\Environment, PowerShell profiles (absent),
npm shims, scheduled-task actions, Startup folder (empty), VS Code user config, `.gitconfig`, and every
live hook file.

**Done this wave:**
- All 4 scorecard records landed (`nm1715-fix-0813` bounced-then-green, `-r2`/`-review`/`-review2` green).
  Verified first: review-1 returned MATERIAL_ISSUES, review-2 replayed the evidence and returned ACCEPT,
  so `bounced-then-green` is accurate rather than assumed. Lesson routed to `council-worker.agent.md`:
  attempt 1 published sha256 digests for `.verify.txt` files never written to disk.
- Ledger split repaired: exactly 1 row (`nm1715-inv-0813-r3`) existed only in the dead tree's ledger and
  was appended to the canonical one (2323 → 2324). Old ledger untouched, mtime still 11:22:56.
  Backup: `C:\migration_staging\cutover-backup-ledger-20260813_193433.jsonl`.
- `cutover.ps1` + `cutover-json.mjs` authored and self-tested (dry run finds 10 fixes and writes nothing,
  proven by unchanged mtimes; `-Apply` while the app is running refuses with exit 1 and creates no backup
  dir; PowerShell parses with 0 errors; both files pure ASCII).

**Two live breaks the earlier audits could not see (gitignore blind spot), both now fixed:**
1. `clients\encore\.playwright\cli.config.json:2` — `storageState` pointed at
   `C:/Users/rutvi/.../clients/encore/.auth/encore-state.json`. The dead tree's copy still exists and is a
   byte-identical twin (11,313 B, same mtime), so **Playwright CLI runs kept succeeding while silently
   sourcing live browser auth from the dead profile** — no error to notice, and every run another read
   against a tree PLAN_64 declares read-only. It would have failed only once the old profile was deleted,
   long after the cause. Repointed to the new profile.
2. `plans\pending\_audit-evidence-0805\reaudit2.mjs:26-27` — `--repo` and `--home` both **defaulted** to the
   old profile, so running that audit instrument without explicit flags would confidently report findings
   about the dead tree. Defaults repointed.

Post-fix verification: `git ls-files -o -i --exclude-standard` enumerated 139,397 ignored files; 61,714
config/code candidates scanned; 8 carry the string and all 8 are benign (4 copies of the POSIX self-test
fixture `/home/rutvi/Documents/notes.txt`, the `agent-channel.mjs` person-name alias, a style-corpus
substring check, and the two restore-kit `$oldUser = "rutvi"` literals which are correct by design).
Caveat, stated honestly: that pass covered config/code extensions only — `.md`/`.txt`/`.log` inside the
ignored set were not scanned, on the grounds that they are records rather than live wiring.

**Separate defect found while checking record truth — the P63 restore kit was broken.** All three
`restore.ps1` copies had `$oldSlug` (r3: `$oldSlugPrefix` / `$oldSlugExact`) set to the literal
`"C--Users-RutvikKhorasiya-"`, i.e. the NEW slug in the variable meaning "old". Run against a machine
whose profile path differs, step 8a/5a would have matched and renamed the CURRENT project directories.
Cause is two mistakes stacked: `p63-kit-0811-r2/result.md:18` records a worker replacing the correct
dynamic `"C--Users-$oldUser"` with a hardcoded literal purely to satisfy a grep-based acceptance
criterion, and the 02:05 migration rewrite then rewrote that literal. The tell is `p63-kit-r3/restore.ps1:690`,
whose comment still said `rutvi` while the literal above it said `RutvikKhorasiya`.
Fixed in the two repo copies (`p63-kit-inrepo`, `p63-kit-r3`) by restoring the derived form
`"C--Users-$oldUser-"`, which is both correct and immune to any future path-rewrite pass; both still
parse with 0 errors. **The home copy `~/.claude/delegation/out/p63-kit-0811/restore.ps1` is still broken**
— the envelope gate (G1-TP1) denied the edit, correctly, since everything under `~/.claude/delegation/`
needs Rutvik GO plus a SELF_GRANT. Not self-approved. Lesson worth generalising: a grep-for-a-literal
acceptance criterion pushed a worker into writing worse code than it started with.

**Still open:** Rutvik runs `cutover.ps1 -Apply` with Claude Desktop closed, then relaunches from the new
folder. Also awaiting GO: the one-line slug fix in the home copy of the restore kit. After that: confirm the dead tree's `gate-fires.log` mtime is frozen, the old `.claude.json`
project key is still gone, the pinned "1715" session opens normally, and `node -p process.env.GATED_REPO_ROOT`
returns the new repo in a fresh terminal.

**Not fixed, deliberately:** `.codex\config.toml` (10 old-path refs; its only `trust_level="trusted"`
entry points at the dead repo, and its binaries exist solely under the old profile — remediation is
reinstalling Codex, not rewriting paths). Two report files that the 02:05 rewrite pass falsified
(`reports\p63-kit-r3.report.md:49`, `dlv-c2.report.md:70` now describe the wrong `$oldPath`) still need an
LR-027 revert. Security flag unrelated to migration: `~/.copilot/mcp-config.json` holds four plaintext
Tavily API keys — worth rotating.

## Where things live

- Scripts: `C:\migration_staging\scripts\` — `migrate-profile.ps1`, `fix-residual-paths.ps1`, `restore-user-env.ps1`, `elevated-recovery.ps1`, `decode-recyclebin.ps1`
- Findings: `C:\migration_staging\forensics\` — `path-audit.md`, `restoration-gaps.md`, `recovery-sweep.md`, `findings.md`, `pinned-sessions.md`, `battery-report.md`, `script-review.md`
- Rollback points: `fix-backup-2026-08-13_115221`, `record-revert-backup-2026-08-13`, `settings-backup-2026-08-13_014431`
- Prior session transcript: `C:\Users\RutvikKhorasiya\.claude\projects\C--Users-rutvi-projects-encore-framework\ef9c056b-4674-4b5c-908f-64a69d5818f9.jsonl`
