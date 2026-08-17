# PLAN_63: PC Backup → OneDrive (jadebiz) — Survive the Company-Account Reset

**Status**: Pending
**Created**: 2026-08-11
**Identity**: OWNER (personal-machine ops — no pipeline identities; Copilot workers stay OFF personal paths, all execution is CEO-inline by design)
**Model**: fable
**Thinking**: max
**Justification**: irreversible-loss domain (one shot at pre-reset capture); judgment calls on secrets custody, path migration, and restore verification
**PermissionMode**: default
**BrowserTool**: chrome
**CoverageMode**: n/a (not coverage-bearing — no TCs, no walks)
**Depends on**: none

> 🤖 **SESSION BOOTSTRAP — run with `/execute PLAN_63_PC_BACKUP_ONEDRIVE_RESET_SURVIVAL.md` after Rutvik's GO. All context below.**
>
> 1. Identity OWNER; no pipeline roles fire. 2. Skills: none auto-called; `/regression-guard` N/A (no repo code changes). 3. Model/thinking per frontmatter. 4. No plan dependencies. 5. Browser tool = Chrome (claude-in-chrome — needs the user's real logged-in SharePoint session; Playwright CLI has no such session). 6. Execute Phase 0 first — it re-measures everything and HALTs on quota/disk/scope surprises. 7. Phases 1→4 pre-reset; Phase 5 runs AFTER the reset in a fresh session on the new account. 8. On completion flip the Status field, add the Executed date, append the LR-028 activity-log row, git mv to done, reindex.
>
> **HALT + ASK** if: OneDrive business quota < payload; C: free space < staging need; `aud` / `Old ones` / Downloads triage changes totals >30%; any upload path fails twice (no improvising a 4th path); the drill (Phase 4) is not GREEN — the reset must NOT proceed on a red drill.

---

## 0. Context

Company will replace the unofficial Microsoft account (`rutvik.jade-biz@outlook.com`) with an official one. Worst case = full wipe + new Windows profile (username may change from `rutvi`). Goal: after reset + new account, restore everything and continue pending work like nothing happened — including Claude Code memory, sessions, hooks, and the delegation workforce.

**Backup target**: jadebiz business OneDrive (`jadebiz-my.sharepoint.com`) — cloud, survives the wipe. Session exists in one of the user's Chrome profiles (verified: 2 Chrome instances connected; exact profile pinned at Phase 0 via Q1 answer).

## 1. Measured inventory (recon 2026-08-11, all read-only)

| Item | Size | Disposition |
|---|---|---|
| `projects\encore_framework` (incl. repo-local `.claude` 4.1GB, `clients` 3.7GB, `_archive` 1.6GB, `.git` 1GB, `.auth`) | ~11GB | **Tier 1** — full dir, gitignored content included (specs_planning, .auth, .env.*, client CLAUDE.md exist ONLY on disk; 114 dirty files) |
| `~/.claude` (954MB) + `~/.claude.json` | ~1GB | **Tier 1** — memory, sessions, hooks, settings, delegation gates ("Claude half" of the system) |
| `~/.copilot` | 1.6GB | **Tier 1** — worker agent defs + state ("Copilot half") |
| `~/.ssh`, per-repo git configs (no global gitconfig — verified empty), `.codex` `.gemini` `.cursor` `.config` etc. small dotfolders | small | **Tier 1** |
| 19 home worktrees `encore-push-*`/`encore-surf-*`/`encore-notes-*` (210MB), `encore_backups` (2MB), `projects\_branch-backups` (51MB) | ~265MB | **Tier 1** — cheap, irreplaceable-if-unpushed |
| Env-var dump (User+Machine), `winget export`, `npm -g` list (claude-code, copilot, playwright-cli/mcp, typescript — captured), VS Code extensions + User settings, Windows Terminal settings, `$PROFILE`, Postman data, Chrome bookmarks export | tiny | **Tier 1** — restore-kit inputs |
| Desktop (1MB), Documents (6MB), Pictures, Videos (43MB), Music, Favorites | ~50MB | **Tier 2** |
| Downloads (5.3GB), `aud` (2.6GB), `projects\Old ones` (11.3GB) | 19GB | **Tier 3 — Rutvik triage call (Q4)**; default = include all three |
| node_modules (247MB), `.playwright-cli`/ms-playwright browsers, docker-desktop WSL, `.cache`, Chrome `User Data` binaries | — | **EXCLUDE** — regenerable; Chrome cookies/passwords are DPAPI-bound and dead after reset anyway (Google sync restores them) |

Payload ≈ 14GB (Tier 1+2) or ~33GB with full Tier 3, before 7z compression. Staging needs matching free space on C: — Phase 0 gates on this.

## 2. Phases

**Phase 0 — Preflight freeze (R)**: machine-enumerated full-disk walk of the profile root (denominator = `Get-ChildItem -Force`, not judgment); re-measure all sizes; inspect `aud` + `Old ones` contents for the triage call; per-worktree pushed-state check (`git status` + `git log @{u}..`); C: free-space gate; OneDrive business quota check via web; pin the Chrome profile holding the jadebiz session; emit `BACKUP_MANIFEST.md` (item → size → tier → include/exclude → reason). HALT on any gate failure.

**Phase 1 — Stage + archive (local C: only)**: staging dir `C:\backup_staging\PC_BACKUP_2026-08\` — **never under `C:\Users\RutvikKhorasiya\OneDrive`** (that folder syncs to the PERSONAL tenant, which must receive nothing); 7z archives split into ≤4GB volumes; **ALL payload archives AES-256 encrypted** (company tenant = admin-visible; transcripts/.env/.auth/.ssh inside). Passphrase: Rutvik holds it OFF this PC (Q3). Plaintext files: `RESTORE_README.md`, `restore.ps1`, `BACKUP_MANIFEST.md`, `SHA256SUMS.txt` only. Hash manifest over every archive volume.

**Phase 2 — Upload (path per Q2 answer)**:
- **A (recommended)**: Rutvik adds the jadebiz work account to the OneDrive desktop client (~1 min; sign-in is his — Claude never enters credentials). Claude then moves archives into the synced folder, monitors sync to green, verifies web listing + sizes.
- **B (zero-touch)**: browser upload through the logged-in Chrome session, volume by volume. Fully autonomous today; slower and less robust for ~30GB.
- **C (scriptable)**: rclone + one-time OAuth consent click from Rutvik; resumable, checksum-verified, enables scheduled delta re-syncs until reset day.
- Verify regardless of path: re-download 2 random volumes → SHA-256 match; total-size reconciliation; screenshot of the OneDrive folder listing.

**Phase 3 — Restore kit (authored pre-reset, lives in the OneDrive folder)**: `restore.ps1 -NewProfile C:\Users\<new>` → install tooling (winget import; node 25; git; gh; `npm -g` list incl. claude-code + copilot); unpack archives; **path migration**: rewrite `C:\Users\RutvikKhorasiya` → new profile path across `.claude.json`, `.claude/**` configs, `.copilot` configs; **rename `.claude/projects/C--Users-RutvikKhorasiya-*` slug dirs to the new-path slugs** (this is what makes sessions + memory reattach); `npm i` per repo; `npx playwright install`; then the re-auth checklist. **Restore writes to fresh targets only — never over existing non-empty dirs** (precedent: agent-mistakes.md 2026 restore incident where an overwrite of newer gitignored content stayed invisible because the check compared ID sets, not content).

**Phase 4 — Restore DRILL (pre-reset, mandatory)**: unpack key archives to a temp target + run the path-rewrite in dry-run + content-hash diff against live. GREEN = "reset-ready" flag to Rutvik. Red = reset waits. No drill, no reset.

**Phase 5 — Post-reset (new account, fresh session)**: sign into OneDrive/browser (Rutvik), run `restore.ps1`, run the verify battery (Claude memory loads, `git status` matches the frozen manifest, one spec runs solo green), report deltas.

## 3. What will NOT survive — one-time re-auths after reset (by design, DPAPI dies with the account)

Claude Code login · GitHub `gh` · Copilot CLI · Google/Chrome profile sign-ins (sync restores bookmarks/passwords) · VS Code account · Atlassian MCP · Navigator4 `.auth` storage states (archived copies may still be valid; else re-run `auth.setup`) · Windows Credential Manager · Wi-Fi. `RESTORE_README.md` carries this as a checklist.

## 4. Autonomy map

- **Claude alone**: everything in Phases 0, 1, 3, 4; Phase 2 fully alone on path B, after one sign-in/consent on paths A/C; Phase 5 execution; optional nightly delta re-sync until reset day.
- **Rutvik, unavoidable (3 touches)**: ① pick upload path + do the single sign-in/consent (A/C) — credential entry is his, always; ② hold the archive passphrase off-PC; ③ GO to execute + the final "drill is green, reset may proceed" call.

## 5. Question resolutions (Rutvik, 2026-08-11)

- **Q1 RESOLVED**: jadebiz session lives in Chrome browser named **"jbs"** — verified live (OneDrive Home renders as Rutvik Khorasiya, My Files accessible, 71 recent items).
- **Q2 RESOLVED + PATH A UNLOCKED (2026-08-11)**: **company OneDrive only — the personal `rutvik.jade-biz@outlook.com` OneDrive receives NOTHING.** Rutvik added the work account to the OneDrive client himself; verified in registry (`Business1: rutvik.khorasiya@jade-biz.com`) with sync folder live at `C:\Users\RutvikKhorasiya\OneDrive - Jade Business Services, LLC`. **Quota verified via Storage Metrics: 1TB total, 1023.75GB free** — 33GB payload fits with headroom. A = primary (stage into the business sync folder — NEVER the personal `C:\Users\RutvikKhorasiya\OneDrive`); B (browser via "jbs") = fallback; C (rclone) = only if the nightly freshness loop is wanted.
- **Q3 OPEN — confirmed at GO**: passphrase custody (phone/password manager, never on this PC).
- **Q4 RESOLVED**: include all Tier 3 (Downloads + `aud` + `Old ones`) → ~33GB payload.
- **Q5 RESOLVED**: **same jadebiz account after the reset** — the reset swaps the Windows-profile-level personal `@outlook.com` account for the official one; the jadebiz M365 account (and its OneDrive) persists. Backup target survives. Offline external-drive copy downgraded to optional-recommended (3-2-1), no longer a gate.

## 6. Verification artifact (D23)

- This file exists at `plans/pending/PLAN_63_PC_BACKUP_ONEDRIVE_RESET_SURVIVAL.md` with the Status field reading Pending.
- At execution close: the SHA256SUMS file in the PC_BACKUP_2026-08 staging area (local backup staging, not repo evidence) verifies clean against re-downloaded volumes (`7z t` + hash compare log), and the Phase 4 drill log shows GREEN.

## 7. Risks

| Risk | Mitigation |
|---|---|
| Backup green, restore red | Phase 4 drill is a hard gate before reset |
| jadebiz account itself replaced at reset | Q5 + offline copy recommendation |
| Company DLP/quota blocks big uploads | Quota VERIFIED 2026-08-11: 1TB / 1023.75GB free; first-volume smoke test still runs for DLP |
| Admin visibility of personal/secret content on company tenant | AES-256 on every payload archive |
| Staging disk space (~2× payload) | Phase 0 free-space gate |
| Path/username change breaks Claude state | Phase 3 path-rewrite + project-slug rename, drilled in Phase 4 |
| Restore overwrites newer data | Fresh-target-only writes + content-hash diffs (mistake-log precedent) |

## 8. Execution progress — 2026-08-11 (Status stays Pending; Phase 5 is event-gated)

**Phases 0–4 executed. Phase 5 cannot run until the reset actually happens** — it is gated on an external event, not deferred by choice. Status therefore stays `Pending` per LR-060 (the plan is not complete until Phase 5 runs on the new account); no `## Deferral Authorization` block is claimed, because nothing that *could* be done was skipped.

### What is in the cloud

Business OneDrive folder `PC_BACKUP_2026-08` (`jadebiz-my.sharepoint.com`, tenant `rutvik.khorasiya@jade-biz.com`) — **16 files, 15.62 GB, flat layout**, cloud-side listing confirmed via the SharePoint REST API. The personal-tenant folder `C:\Users\RutvikKhorasiya\OneDrive` received nothing.

- 12 encrypted volumes across 11 archive groups (AES-256, `-mhe=on` encrypted headers, split at 4 GB).
- 4 plaintext files only: `RESTORE_README.md`, `restore.ps1`, `BACKUP_MANIFEST.md`, `SHA256SUMS.txt`. A `Select-String` scan across all four found zero occurrences of the passphrase.
- Group 11 (`11_loose_root_files`) was added after a full-profile-root diff against the drill output exposed 14 loose files never captured by groups 1–10 — a Claude config backup, saved walk-output files, `encore-notes-trim-xlsx.cjs`, and a Git patch of uncommitted worktree changes.
- Measured-and-excluded: `.cache` (1.4 GB, entirely `codex-runtimes`, regenerable), the empty `Postman` root folder, `npx` (0 bytes), Windows stub folders, `NTUSER` hives (profile-bound), and both OneDrive sync folders (cloud-resident already).

### Cloud verification (content, not just listing)

Files were fetched back from SharePoint and hashed in-browser with `crypto.subtle`, then compared against local truth:

| File | Result |
|---|---|
| `06_user_folders.7z.001` | SHA-256 matches `SHA256SUMS.txt` |
| `05_worktrees_backups.7z.001` | SHA-256 matches `SHA256SUMS.txt` |
| `11_loose_root_files.7z.001` | SHA-256 matches `SHA256SUMS.txt` |
| `restore.ps1` | 42,629 bytes, SHA-256 matches disk |
| `RESTORE_README.md` | 6,886 bytes, SHA-256 matches disk |
| `SHA256SUMS.txt` | 1,084 bytes, SHA-256 matches disk |

`SHA256SUMS.txt` itself was rebuilt from disk (never appended), self-verified 12/12, and duplicate-checked.

**Verification coverage — complete:**

- **12 of 12** volumes in the synced OneDrive folder hash-match `SHA256SUMS.txt` (local `Get-FileHash`). Nothing was corrupted on the way into the folder.
- **12 of 12** cloud file sizes match local byte-for-byte, from the SharePoint REST listing.
- **12 of 12** volumes were **read back out of the cloud and SHA-256 verified**, plus all three plaintext kit files. Zero mismatches anywhere.
  - Eight volumes (02, 03, 04, 05, 06, 07.002, 08, 11) were fetched whole and hashed in one piece.
  - The four largest (01 · 3.5 GB, 07.001 · 4 GB, 09 · 2.68 GB, 10 · 1.9 GB) were verified in **50 chunks of 256 MB**, each chunk hashed in the browser and compared against the identical byte range hashed on disk. 50 of 50 matched, and every chunk's `content-range` total matched the local file size exactly.

**Two measuring-tool traps hit on the way, recorded so they are not re-learned:**

1. A browser cannot buffer a multi-gigabyte response into one `ArrayBuffer`. Whole-file fetches of the 3.5 GB and 4 GB volumes threw `TypeError: Failed to fetch`, and the 1.9 GB one resolved with only **710 MB** and therefore reported a hash "mismatch". A wrong-*sized* read convicts the download, not the file — chunked verification later proved that same volume byte-perfect. Never read a mismatch as corruption without first checking that the number of bytes examined is the number of bytes expected.
2. The REST endpoint `…/GetFileByServerRelativeUrl('…')/$value` **silently ignores the `Range` header** — it answers `200` with the whole file. A first chunked attempt therefore made zero progress in ~20 minutes while re-downloading the same 1.9 GB over and over, with no error to explain it. `…/_layouts/15/download.aspx?SourceUrl=<path>` honours ranges properly (`206` + `accept-ranges: bytes` + a correct `content-range`) and is the endpoint to use for large-file verification.

### Phase 4 drill — what the live runs actually proved

The drill runs the shipped `restore.ps1` verbatim, substituting only the interactive passphrase prompt, and stops after Step 5 so it does not install tooling on this machine.

| Run | Scope | Outcome |
|---|---|---|
| Full 1–10 | all groups, pre-fix script | exit 0; every folder placed correctly; no double-nesting; no strays |
| `-Only 5,11` | after the listing-parser fix | group 5 discovered 21 real guards; group 11 extracted |
| `-Only 5,11` | after the crash fixes | Step 5 completes: `Path migration done -- 0 replacement(s) across 0 files scanned` |
| `-Only 5`, wrong passphrase | forced-failure run | `Group 5 SKIP -- archive listing failed: 7z l exited 2`; run continued; target left with 0 files |
| Full 1–11 | final script, all groups | **GREEN** — see below |

**Final run, all 11 groups against the finished script**: exit 0, and the log contains zero `[FAIL]`, `[WARN]`, `[SKIP]` or exception lines. 33.9 GB / 367,871 files extracted. Every placement check passed: nothing double-nested (`projects\encore_framework\encore_framework`, `Downloads\Downloads`, `aud\aud`, `projects\Old ones\Old ones` all absent), the group-10 staging directory cleaned itself up, and no stray `User` / `Postman` / `_branch-backups` left at the profile root. Everything that must exist does — `projects\encore_framework\.git`, `projects\Old ones`, `projects\_branch-backups`, `AppData\Roaming\Code\User`, `AppData\Roaming\Postman`, `AppData\Local\Postman` (distinct from the Roaming one), `AppData\Local\copilot`, `AppData\Roaming\cluely-v2`, `Downloads`, `aud`, `.claude\projects`, `.claude.json`, `sysinfo`, and the group-11 loose files. Step 5 renamed 4 project slug directories and made **652 path replacements across 6,463 files scanned** — the mechanism that makes Claude sessions and memory reattach under a new username.

**Phase 4 verdict: GREEN — reset-ready.**

### Defects the drill found and closed (none were theoretical)

1. **7-Zip not on PATH** — the script called bare `7z`; Windows' installer does not add it. Extraction was impossible on any machine. Fixed with an absolute-path resolver.
2. **Resolver crashed under StrictMode** — the first fix read `.Source` on a `$null` from `Get-Command`. Fixed null-safely.
3. **Four groups would have double-nested** (`projects\encore_framework\encore_framework\`), two AppData folders had lost their destination, and group 10 was absent from the script entirely. All corrected against a machine-enumerated map of every archive's real root entries.
4. **Archive-listing parser read the wrong column** — it split `7z l -ba` output on whitespace assuming six columns, but solid archives leave the Compressed column blank, shifting the name. It invented a phantom entry and could silently drop a real directory from the safety guard. Rewritten to parse `7z l -slt`.
5. **The safety guard failed open** — a listing failure produced an empty guard list, which the caller treated as "safe to extract". Now refuses the group loudly, names the `-Only 5` recovery path, and lets the other groups finish. Live-fired with a deliberately wrong passphrase.
6. **Step 5 crashed on any partial restore** — `$allFiles.Count` on a `$null` pipeline result is a terminating error under `Set-StrictMode -Version Latest`, killing Steps 6–8. This fired on exactly the `-Only <group>` path the README tells the user to use for recovery. Two more sites of the same class (lines 633 and 823) were found by scan and fixed; the one at 823 sat inside the verification check that exists to report that very failure.

Defect 4 came from reading the drill's own guard output; 5 came from a cross-family review of the fix for 4; 6 came from the live run. Rounds 1–2 on the kit ran author (sonnet) → reviewer (gpt-5.5) → author defends, per the fight protocol.

## 8b. Second pass — the 2026-08-12 delta (groups 12 and 13)

A full working day happened after the 11 August capture, so a top-up was taken the next afternoon. Rutvik's framing was the right question to answer first: *can this ride on git instead of a second archive?*

### The answer to that question

**Partly — for exactly one thing, and it is the biggest thing by size.** Local `HEAD` was verified at `1bb410d5` against `git ls-remote origin` at the same SHA, 0 unpushed commits, on 3 reachable remotes. The changed part of `.git` was **929 MB of repacked pack files** whose every commit GitHub already holds. That was excluded; `git fetch origin && git reset --hard origin/main` restores it.

**No — for everything else.** A fresh clone recovers committed code and nothing more. What lives only on this disk: `~/.claude` and `~/.copilot` entirely, `.claude/state/` (4.27 GB), `_archive/` (1.56 GB), `clients/encore/CLAUDE.md`, `.claude/private/`, `.env.local`, `.auth/`, and **39 untracked top-level entries** including 8 plan files — among them this plan. The delta archive is also the *more faithful* vehicle for uncommitted work, since it captures the working tree exactly as it stands rather than as some commit describes it.

Cutoffs were read from each group's own archive volume timestamp, never assumed. Groups 4, 5, 7, 8, 9, 11 were re-walked and had **zero** changed files.

| | Raw | Compressed | Contents |
|---|---|---|---|
| 12_delta_repo | 58,964 files / 1,388.5 MB | 758.7 MB | repo changes since 11 Aug 21:22 + 5 stashes as patches under `projects\_p63-delta-stashes\` |
| 13_delta_home | 523 files / 250.5 MB | 30.5 MB | `.claude`, `.copilot`, `Desktop`, `.claude.json` since their own cutoffs |

Both entry counts reconcile exactly against the input lists (530 listed for group 13 minus 7 PID-keyed process-lock markers that ceased to exist mid-run -- PID-keyed process-lock markers, one transient session JSON, and a rotating Claude backup).

### Deliberate exclusions, each a decision

- `.git` packs (929 MB) — on origin, verified, not assumed.
- Perplexity/Comet updater cache (212 MB under AppData) — a download cache the app rebuilds.
- Git stashes were **kept** despite living inside `.git`, exported as 5 patch files, because a stash is local-only and GitHub never sees it. All 5 predate 4 August so group 1 also holds them; the patches are a second net.

### Two honest limits, recorded not buried

- **A timestamp delta cannot express a deletion**, so restoring can resurrect a deleted file. Nothing was knowingly deleted on 12 August (the working session reported zero deletions; `git status` showed 0 deleted tracked).
- **`session-store.db` (170 MB) was copied while open.** Its WAL was captured alongside, which is normally enough, but a torn write is possible. It holds past agent sessions, not work product.

### Kit changes this pass

`Invoke-7zExtract` gained an opt-in `-Overwrite` switch. Groups 1–11 pass nothing and keep their byte-identical fail-on-existing behaviour; groups 12/13 pass it because replacing the older copy is their entire job. The call site uses `$g.ContainsKey('Overwrite')` rather than `$g.Overwrite` — a missing hashtable key is not worth gambling on under `Set-StrictMode -Version Latest`, which is precisely the class of defect that killed Step 5 in round 2. Verified by dry-run: exit 0, 14/14 checksums, both delta groups reporting "(overwriting existing files)".

## 8c. Independent Fable audit and the hole it found (2026-08-12)

Rutvik asked for a Fable seat to adjudicate the backup. It was briefed to **falsify**, not confirm, and told the passphrase was unavailable.

**On the delta itself it found nothing.** It re-walked all five source areas with a different engine than the list builder, compared against the actual 7-Zip input lists, and reported **0 missed files across 59,494**; it re-derived the "zero change" claim for groups 4/5/7/8/9/11 independently; it recomputed the SHA-256 of **all** cloud volumes and matched every one; it confirmed `HEAD == origin/main` with no unpushed commits itself rather than taking the claim.

**It found one real hole, and the delta could never have caught it — the hole predated the delta.** Two files sat loose directly in `C:\Users\RutvikKhorasiya\projects\` and belonged to **no archive group at all**: `AGENT_INTELLIGENCE_PLAYBOOK.md` (no copy anywhere on disk) and `branch-archive-encore-framework-2026-08-05.bundle` (232 MB, carrying a ref `snapshot/disk-2026-07-07-preship` that exists in no remote and in no local branch). The group definitions covered `encore_framework`, `Old ones`, `_branch-backups` and the worktrees — nobody had asked what *else* lived in `projects\`. I re-derived that coverage from disk before acting and confirmed exactly those two, machine-enumerated. They are now **group 14 `14_projects_loose`** (222 MB), with ordinary static fresh-target guards; `SHA256SUMS.txt` is at 15 entries, orphan-checked both directions, and the server copy matches at 233,203,521 bytes.

The lesson is the transferable part: **the delta re-verified its own coverage but inherited the parent's denominator unquestioned.** A top-up asks "what changed since the last backup", never "was the last backup's scope right".

**Three documentation defects it found, all corrected in `RESTORE_README.md` rather than silently patched:**

- The stash patches carry only the **tracked** half of a stash. Two of the five have an untracked half of roughly 18,000 files that no patch contains, while `READ-ME-FIRST.txt` (already sealed inside archive 12) tells the reader `git apply` restores the stash. The complete stashes do survive inside group 1's `.git` and are untouched by `reset --hard`, so nothing is lost — but the README now names the real route and flags its own shipped file as overstating.
- Step 9 verification check V1 (git-status line count vs an 11 August frozen snapshot) **will report FAIL after a correct restore**, because groups 12/13 legitimately move the tree past that snapshot. Documented as expected noise; its companion commit-ID check was verified still accurate (`rev-parse 'HEAD@{2026-08-11 21:22:50}'` resolves to the frozen head exactly).
- Group 13 contains `.claude.json`, which both documents omitted from their descriptions.

**Two limits it confirmed but could not close**, both needing the passphrase: archive *contents* are proven only via the input lists (`-mhe=on` blocks listing), and **groups 12/13/14 have never been extraction-drilled** — every drill log predates them. Rutvik declined the live-fire on cost grounds after being told; recorded here rather than left implicit.

### Phase 5 (post-reset) — what runs on the new account

Sign into OneDrive, then `pwsh -File restore.ps1 -BackupDir "<synced folder>" -NewProfile C:\Users\<new-username>`. The script verifies all 15 checksums, prompts for the passphrase, installs missing tooling, extracts all 14 groups (12 and 13 overwriting by design, 14 guarded like the rest), rewrites `C:\Users\RutvikKhorasiya` path references, renames the `.claude\projects` slug directories so sessions and memory reattach, reinstalls npm globals and VS Code extensions, runs `npm install` + `npx playwright install`, and prints the re-auth checklist. Then, in the repo: log into GitHub once (Credential Manager does not survive the reset) and `git fetch origin && git reset --hard origin/main`.
