# PLAN_64: Old→New Profile Lossless Migration + Pinned-Chats & Lost-Draft Recovery

**Status**: Pending
**Created**: 2026-08-12
**Identity**: OWNER (personal-machine ops — no pipeline identities; all execution CEO-inline, same posture as PLAN_63)
**Model**: fable
**Thinking**: max
**Justification**: irreversible-loss domain (leveldb draft evidence can be compacted away by app restarts; ACL surgery on a dead profile; one shot at a clean merge) + multi-rule judgment (LR-050 stale enumeration, restore-incident content-hash lesson)
**PermissionMode**: default
**BrowserTool**: none
**CoverageMode**: n/a (not coverage-bearing — no TCs, no walks)
**Depends on**: none (sibling of PLAN_63 — reuses its `restore.ps1` path-migration logic; the OneDrive backup remains the disaster fallback, NOT the primary route)

> 🤖 **SESSION BOOTSTRAP — run with `/execute PLAN_64_PROFILE_MIGRATION_LOSSLESS.md`. All context below.**
>
> 1. **Identity**: OWNER — no pipeline roles fire. 2. **Skills**: none auto-called; `/regression-guard` N/A (no repo code changes — this plan moves files and authors standalone ops scripts only). 3. **Model/thinking/permission-mode**: per frontmatter above. 4. **Dependency gate**: none. 5. **Context load**: this file in full + `PLAN_63_PC_BACKUP_ONEDRIVE_RESET_SURVIVAL.md` §1 (measured inventory) + OneDrive `PC_BACKUP_2026-08/restore.ps1` lines 87, 664–745 (path-migration logic to port). 5.5. **Browser tool**: `none` — no live-app interaction anywhere in this plan (local file ops + registry reads only). 6. **Phase 0 FIRST** — re-measures gates and HALTs on surprises. 7. Phases run in THREE execution contexts (§3) — respect the context column; Phases 4–5 are run by Rutvik from an elevated terminal with the Claude app CLOSED, never from inside this session. 8. **Handoff**: flip the Status field, add the Executed date, `git mv` to done, `npm run plans:reindex`. Activity log N/A (no pipeline artifacts touched — LR-028 trigger not met); log rows go in this plan's Execution Summary instead.
>
> **HALT + ASK USER** if: elevated robocopy /B of the old app storage fails twice · any phase would WRITE to `C:\Users\RutvikKhorasiya` (forbidden, always) · collision found where the same-named file differs on both sides outside the planned collision set (§4 Phase 4c) · Phase 0 free-space or closed-app gate fails · draft keywords not supplied at Phase 2 entry (uplink ASK, do not guess) · dry-run output shows any write action (S0 lesson, agent-mistakes.md:257).

---

## 0. Context

PC was reset 2026-08-12. Old profile `C:\Users\RutvikKhorasiya` is fully intact on the same disk; new profile is `C:\Users\RutvikKhorasiya` (AzureAD). Rutvik's ask (verbatim intent): **lossless** copy old→new, restore **pinned Claude Code chats**, recover a **lost unsent draft** typed before the reset, **no messups**. Decisions locked via Q&A 2026-08-12: (1) migrate everything INTO the new profile, (2) admin/elevation available, (3) draft was typed before the reset → lives in old app storage, (4) `.claude` merge = old base + every post-reset session kept.

Why local copy, not the OneDrive restore: everything the backup holds exists newer and complete on local disk; local copy skips download, decryption, extraction, and the passphrase. `restore.ps1` still contributes its tested path-migration logic (§4 Phase 4d). OneDrive backup = untouched disaster fallback.

## 1. Verified recon (2026-08-12, all read-only — LR-020 anchors)

| Fact | Evidence |
|---|---|
| Old profile intact: repo, `.claude` (503 encore transcripts + memory/hooks/settings), `.copilot`, `.claude.json`, 19 home worktrees, Downloads/aud/Old-ones | dir listings this session; sizes per PLAN_63 §1 inventory (measured 2026-08-11, ~35GB total payload) |
| New profile minimal: `.claude` has only backups/projects/session-env/sessions/shell-snapshots; no `.copilot`, no repo | dir listing this session |
| New-profile app storage = `%APPDATA%\Claude` (Electron: `Local Storage\leveldb`, `IndexedDB`, `claude-code-sessions`, `config.json`) | dir listing this session |
| **Pins + drafts ARE persisted in `Local Storage\leveldb`** — `grep -a` hits for `pinned` and `draft` in `000005.ldb`/`000014.log`/`000016.ldb` | binary grep this session (new profile; schema assumed same generation as old — see §2 H2) |
| Old app storage candidate `C:\Users\RutvikKhorasiya\AppData\Local\Claude` is **permission-denied** to the new account; old Roaming has no `Claude` dir (only `Claude Code` = ChromeNativeHost shell + `ClaudeConnector`) | ls + grep this session |
| Old also has `Local\Claude Nest-3p`, `Local\Claude-3p` (in-app browser profiles), `Local\claude-cli-nodejs` | ls this session |
| `restore.ps1` path migration: `ConvertTo-Slug` (line 87), Step-5 migration incl. slug-dir renames + 4-form text replace (lines 664–745) | grep this session |
| Slug collision detail: old transcripts under `C--Users-RutvikKhorasiya-projects-encore-framework` (lowercase c), new session writing to `C--Users-RutvikKhorasiya-projects-encore-framework` (capital C) — both must merge → `C--Users-RutvikKhorasiya-projects-encore-framework` | ls both projects dirs |
| Disk: 693GB free on C: (need ~40GB incl. staging) | `df -h` this session |
| New profile Desktop/Documents NOT OneDrive-redirected (plain `C:\Users\RutvikKhorasiya\...`) | `[Environment]::GetFolderPath` this session |
| Evidence freeze DONE: `C:\Users\RutvikKhorasiya\claude_evidence_freeze_2026-08-12\new-roaming-claude` (6.4MB — leveldb, IndexedDB, session stores, configs) | created this session, pre-plan |
| Restore-incident lesson: ID-set/count comparison is NOT verification — a 2026-06 restore silently clobbered newer content while parity stayed GREEN | agent-mistakes.md:67 |
| Dry-run lesson: a "dry run" that writes anywhere is an S0 defect | agent-mistakes.md:257 |

## 2. Hypotheses (explicitly NOT verified — Phase 1 confirms or kills)

- **H1**: old pins/drafts live inside `C:\Users\RutvikKhorasiya\AppData\Local\Claude` (older app generation stored user data under Local; "Claude Nest" era). Unverifiable pre-elevation — the dir is ACL-locked. If H1 false after unlock: sweep the rest of old AppData for `Local Storage\leveldb` dirs (`Claude Nest*`, `Claude Code`, any `*claude*`), then re-evaluate.
- **H2**: pin/draft leveldb schema is compatible enough between old and new app builds for a storage overlay to restore pins. If false: fallback = manual re-pin from the Phase-2 extracted list (still delivers the outcome, more clicks).
- **H3**: the draft text survives in old leveldb `.log`/`.ldb` (drafts persist to Local Storage; deletion tombstones don't scrub old segments until compaction, and the old profile's app never ran again after the reset — no compaction since). Honest framing: recovery is **probable, not guaranteed**.

## 3. Execution contexts (who runs what — the no-messups architecture)

| Context | Runs | Why |
|---|---|---|
| **A — this Claude session** | Phases 0, 2, 3, 6 | read-only recon, forensics on staged COPIES, script authoring, verification |
| **B — Rutvik, elevated PowerShell** | Phase 1 | ACL-locked old dirs need admin robocopy `/B`; Claude never elevates itself |
| **C — Rutvik, elevated PowerShell, Claude app + VS Code CLOSED** | Phases 4–5 | `.claude.json`, `.claude\`, and `%APPDATA%\Claude` are live-written by the running app; overlaying them while open = corruption. One script, one command, authored + dry-run in Phase 3 |

## 4. Phases

**Phase 0 — Preflight (A, read-only)**: re-verify free space ≥ 50GB · evidence freeze exists · `claude --version` + app build noted · machine denominator of old profile top-level (`Get-ChildItem -Force C:\Users\RutvikKhorasiya`) → emit `migration-manifest.md` (source → target → size → phase) · confirm with Rutvik a window when app can close. HALT on any gate failure.

**Phase 1 — Elevated evidence recovery (B, old side strictly read-only)**: Claude authors `unlock-and-stage.ps1`; Rutvik runs elevated. `robocopy /B /E /COPY:DAT /DCOPY:DAT /XJ /R:1 /W:1 /LOG+` each of: `Local\Claude`, `Local\Claude Nest-3p`, `Local\Claude-3p`, `Roaming\Claude Code`, `Local\claude-cli-nodejs` → `C:\migration_staging\old-app-storage\<name>`. Plus: `reg load HKU\OldRutvi C:\Users\RutvikKhorasiya\NTUSER.DAT` → export `Environment` + `...\CurrentVersion\Run` → `reg unload` (old user env vars/PATH additions, read-only). **No takeown/icacls on the originals — `/B` reads without touching ACLs.** HALT if `/B` fails twice.

**Phase 2 — Draft + pins forensics (A, on staged copies only)**: **ASK Rutvik for draft keywords first (uplink — no guessing)**. Carve staged leveldb (`.log` + `.ldb`, UTF-8 AND UTF-16LE scans) for keywords + generic draft-key patterns; carve the 2026-08-12 evidence freeze too (belt-and-braces for the "not sure which side" residual). Extract pinned-session markers; map session UUIDs → titles via old `.claude\projects\**\*.jsonl`. Deliver: `recovered-draft.txt` (or an honest negative report naming every file+encoding scanned) + `pinned-sessions.md` (UUID + title + pin evidence — the manual re-pin fallback).

**Phase 3 — Author + dry-run `migrate-profile.ps1` (A)**: one script covering Phases 4–5, `-DryRun` mode = robocopy `/L` + zero filesystem writes of any kind (S0 lesson). Dry-run from this session; Rutvik reviews the projected-actions log before Phase 4.

**Phase 4 — Bulk copy + path migration (C)**:
- **4a** Backup live new-side `.claude\` + `.claude.json` → `C:\migration_staging\new-claude-backup\` (second net beyond the freeze).
- **4b** robocopy old→new (`/E /COPY:DAT /DCOPY:DAT /XJ /R:1 /W:1 /LOG+`, target ACLs inherited — never `/COPYALL`, never `/MIR`/`/MOV`/`/PURGE`): `projects\` (repo + `Old ones` + `_branch-backups`) · 19 home worktrees (`encore-push-*` etc.) · loose home files (`encore-*` txt/dirs, `aud`, `capture-*`) · dotfolders (`.ssh .codex .gemini .cursor .config .antigravity .antigravity-ide .securecoder .cisco .docker .vscode .local`) · `.claude` + `.claude.json` + `.copilot` · Desktop/Documents/Pictures/Videos/Music/Favorites/Links/Contacts · Downloads · AppData picks (`Roaming\Code\User`, `Roaming\Postman`, `Roaming\npm`, `Local\copilot*`, `Local\github-copilot*`, `Local\claude-cli-nodejs`, Windows Terminal `Packages\...\LocalState`).
- **4c** Re-overlay the 4a backup on top (new-side post-reset sessions/config win their own files back). Planned collision set: `.claude.json` (old wins — new one is near-empty; 4a preserves it), `.claude\.last-cleanup` (either). Everything else UUID-named → **verify zero unplanned collisions by hash-diff, not name-diff** (agent-mistakes.md:67).
- **4d** Path migration (ported from `restore.ps1:664–745`): slug-dir renames in `.claude\projects` (merging BOTH encore slug spellings into `C--Users-RutvikKhorasiya-projects-encore-framework`) + text replace of the 4 forms (`C:\Users\RutvikKhorasiya`, `C:/Users/RutvikKhorasiya`, slug-prefix, slug-exact) **+ a 5th form the original misses: JSON-escaped `C:\\Users\\RutvikKhorasiya` inside `.jsonl`/`.json`** (transcript `cwd` fields) — across `.claude.json`, `.claude\**`, `.copilot\**`, repo `.env*`, worktree `.git` pointer files, VS Code `settings.json`, Terminal settings. Text files only — binaries (`.ldb .log .db .sqlite* .exe .node`) excluded.
- **4e** `git worktree repair` (main repo, then each worktree) · `git status` sanity vs Phase-0 snapshot · `npm install` + `npx playwright install` in the repo at its new path.

**Phase 5 — App-storage overlay for pins (C, same closed-app window)**: overlay staged old `Local Storage\` + `IndexedDB\` into `%APPDATA%\Claude\` (current state already double-backed-up: freeze + a fresh pre-overlay copy the script takes); merge (not replace) `claude-code-sessions\`. Relaunch app → pins visible? YES → done. NO / app resets state (H2 false) → script's `-RestoreAppState` flag puts the pre-overlay state back, Rutvik re-pins manually from `pinned-sessions.md`. Either branch delivers pins.

**Phase 6 — Verification + closure (A, new session opened from the NEW repo path)**: battery per §8 · deltas reported · re-auth checklist (Claude, `gh auth login` + `setup-git`, Copilot, VS Code, Atlassian MCP, `npm run auth:setup` for `.auth\`) · staging + freeze dirs and the untouched old profile are **kept until Rutvik types "migration accepted"** — cleanup is a later, separate consent.

## 5. What becomes stale (LR-050 — enumerated in-scope, verified in §8)

1. **Old-path references** in migrated text configs (all 5 replacement forms) — killed by 4d; verified by the §8 zero-hit grep.
2. **Old slug dirs** `C--Users-RutvikKhorasiya-*` / `C--Users-RutvikKhorasiya-*` under new `.claude\projects` — renamed/merged by 4d; verified by `ls`.
3. **Worktree gitdir pointers** to `C:/Users/RutvikKhorasiya/...` — repaired by 4e; verified by `git worktree list`.
4. **node_modules absolute-path shims** — refreshed by 4e `npm install`.
5. **Staging + freeze dirs** (`C:\migration_staging\*`, `claude_evidence_freeze_2026-08-12`) — enumerated here, deleted ONLY after "migration accepted" (explicit consent, never auto).
6. **Old profile itself** — NOT stale-cleaned by this plan. Untouched, permanently, until a separate future decision.

## 6. NOT touched

- `C:\Users\RutvikKhorasiya\**` — **zero writes, all phases** (strict, deliberate — LR-046 aware). Reads only, via `/B` where ACL-locked.
- OneDrive `PC_BACKUP_2026-08\**` — read `restore.ps1` only.
- Repo source code — no `src/`/`pipeline/`/`clients/` logic changes; the ops scripts live in `C:\migration_staging\scripts\`.

## 7. Risks & honest expectations

| Risk | Mitigation | Residual |
|---|---|---|
| Draft already compacted/never persisted | old app never ran post-reset (no compaction trigger); dual-encoding carve; freeze carved too | possible honest negative — reported, not papered over |
| Pin-storage schema skew old↔new build (H2) | overlay + `-RestoreAppState` rollback + manual re-pin list | worst case = minutes of manual re-pinning, zero data loss |
| Old app data NOT in `Local\Claude` (H1) | post-unlock sweep of all old AppData for leveldb dirs | recovery delayed, not lost |
| Overlay corrupts app state | app closed during C-phases; freeze + pre-overlay backup = two restore points | none beyond re-copy |
| Silent content clobber on merge | hash-diff verification, planned-collision allowlist, 4a/4c ordering | agent-mistakes.md:67 class — mitigated by design |
| Long paths (node_modules) | robocopy handles long paths natively | cosmetic log noise |

## 8. Verification battery (Phase 6 — evidence-emission format per LR-042)

1. `robocopy` logs: zero lines targeting `C:\Users\RutvikKhorasiya` as destination → confirms §6 strict line.
2. Transcript census: old-side count (503 + other 3 slugs) vs new merged slug-dir count — **plus 10-file random SHA-256 sample old vs new** (content, not IDs).
3. Post-reset sessions: every file in the 4a backup exists at final state, hash-equal.
4. `grep -rIl "Users.rutvi"` (text files only) across new `.claude.json`, `.claude\`, `.copilot\`, repo configs, worktree pointers → **zero hits** (strict, deliberate).
5. `git -C C:\Users\RutvikKhorasiya\projects\encore_framework status` clean-equivalent to Phase-0 snapshot; `git worktree list` all paths new-profile; `git stash list` intact.
6. `npm install` exit 0 · `npx playwright test --list` resolves.
7. App relaunch: session list shows pre-reset chats; pins present (or fallback branch documented in Execution Summary).
8. `recovered-draft.txt` delivered OR named-files negative report.

## 9. Acceptance criteria

- [ ] Zero writes to `C:\Users\RutvikKhorasiya` (battery #1)
- [ ] All old transcripts + memory + hooks + settings live under new profile, hash-sampled (battery #2)
- [ ] Every post-reset session survives (battery #3)
- [ ] Zero old-path hits in migrated text configs (battery #4)
- [ ] Repo + 19 worktrees + stashes healthy at new path (battery #5, #6)
- [ ] Pins restored — overlay branch OR manual-re-pin branch, explicitly recorded (battery #7)
- [ ] Draft recovered OR honest negative with full scan evidence (battery #8)
- [ ] Re-auth checklist delivered; staging/freeze retained pending "migration accepted"

## 10. Rollback

Everything is additive: old profile untouched, freeze + pre-overlay + 4a backups exist. Full rollback = delete new-profile copies, restore `%APPDATA%\Claude` from freeze, reopen from old path — 10 minutes, zero loss.
