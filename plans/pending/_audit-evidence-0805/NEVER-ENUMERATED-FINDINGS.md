# NEVER-ENUMERATED FINDINGS

START: filled; read the manifest and raw bucket lists, then wrote N1 before judgments and N2/N3 rows to disk incrementally.

## N1 -- the populations and my grouping

Input manifest read from transient accounting input staging (scratch input, not tracked); raw line counts checked directly.

Population totals:
- Off-repo never-enumerated files: 17,088 total = `.copilot` 11,599 + `.claude` 5,489.
- Repo files absent from the roster: 137,427 total across 21 top-level groups.
- Roster rows gone from disk: 351 total.

Grouping choice:
- Off-repo: I regrouped the raw list into `.copilot` runtime/session data, `.copilot` harness config/agent definitions, `.claude` delegation/control-plane, `.claude` memory/project/session artifacts, and `.claude` local runtime/config. The dispatcher by-subdir table sums to 17,087, one short of the raw/root total, so I do not rely on it as-is.
- Repo: I use raw top-level counts, but split mixed large groups where the raw nested counts show cache/build output versus source/control-plane material.
- Order of work: off-repo groups first, repo groups second, then roster-gone evidence and owner summary.

Arithmetic targets:
- N2 rows must sum to 17,088.
- N3 rows must sum to 137,427.

## N2 -- off-repo groups

| group | files | verdict | what is in it | what a lot on it would have to do |
|---|---:|---|---|---|
| `_archive/client-surface-purge-2026-07-31` | 55,773 | BULK-EXPECTED | Archived client-surface purge copy, dominated by historical evidence, reports, Allure/result files, screenshots, traces, and archived client material. | Ignore as current-source accounting unless this archive is the only retained proof for a decision; then sample by archived run and set retention/secret rules. |
| `node_modules`, `website/*/node_modules`, `clients/encore/node_modules` | 45,412 | BULK-EXPECTED | Dependency trees under repo root, website frontend/backend, and Encore client. | Ignore unless dependencies are vendored source of truth or package-manager lockfiles no longer reproduce them; then audit manifests/locks, not every installed file. |
| `.claude/state` | 21,868 | BULK-EXPECTED | In-repo local state, especially `ua-worker`, parity recon, closure attempts, ship-client audit, regression snapshots, and todo state. | Ignore for source roster unless state is the only evidence for plan completion; then classify by substate and retention requirement. |
| `clients/encore/reports`, auth/browser caches, Playwright outputs, root `.auth`, `.playwright-cli`, `dist`, `out-*`, `reports`, `logs`, temp/log singletons | 9,854 | BULK-EXPECTED | Test reports, browser profiles, auth/session caches, CLI browser files, generated dist/output folders, and transient logs. | Ignore unless a report/evidence artifact is referenced by an accepted plan; then verify artifact retention and secret exposure. |
| `.claude/skills`, `.claude/collaborator-memory`, `.claude/hooks`, `.claude/rules`, `.claude/context`, `.claude/delegation`, `.claude` policy JSON | 3,926 | NEEDS-A-LOT | In-repo skill framework, ultra-agent material, collaborator memories, hooks, rules, context, delegation file, and policy/config JSON. | Audit as live framework/control source: decide current vs obsolete, ensure hook/skill/rule coverage, and reconcile with off-repo copies. |
| `website` generated non-dependency output | 68 | BULK-EXPECTED | `website/backend/dist` JavaScript and declaration files. | Ignore if generated from tracked TypeScript; if dist is deployed artifact of record, compare to source and build config. |
| `clients/encore` source/spec/testcase/config/docs/env material | 316 | NEEDS-A-LOT | Client source, tests, testcase markdown, specs_planning artifacts, config/docs/package files, and `.env.*` entries outside caches/reports/deps. | Decide what is real deliverable/source versus planning/private material; check ship rules, secrets, MD/spec parity, and whether absent-roster files should be intentionally tracked or excluded. |
| `scripts`, root utility files, and `plans` | 185 | NEEDS-A-LOT | New/absent-roster scripts, script fixtures, delivery manifests, pending/done plans, closure manifests, and root helper files. | Audit for live gate/source relevance: tests for scripts, stale pending/done plan state, and whether root helpers are deliberate or scratch. |
| malformed/stray `_archive` quoted path and numeric `100` | 25 | UNDETERMINED | Dispatcher/raw list contains 24 entries under quoted `"_archive` plus one `100` top-level. | Inspect exact filesystem names and origin; settle whether these are filename-encoding artifacts, extraction mistakes, or real files needing cleanup. |

N3 arithmetic: 55,773 + 45,412 + 21,868 + 9,854 + 3,926 + 68 + 316 + 185 + 25 = 137,427, matches the raw un-rostered repository population.

## N4 -- roster rows that no longer exist

351 roster rows no longer exist on disk. Raw top-level pattern: `clients` 180, `.claude` 128, `.recover-scratch` 32, `plans` 7, and one each under `_migration_global_claude`, `.auth`, temp log, and `website`.

Samples show mostly deliberate cleanup or artifact relocation, not ordinary source moves: `.claude/state/delegation-audit/...` audit-input files are gone; `.recover-scratch/*` workbook/debug scratch files are gone; `clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run*/test-results/*` screenshots/traces/error contexts are gone; `plans/pending/_TEST_BROWSERTOOL_*.md` and one old pending subplan are gone; `website/backend/` as a directory row is gone.

Disposition: this is a stale-roster cleanup/evidence-retention signal. A lot on it should decide whether any vanished evidence was cited by closed plans before treating the disappearance as safe cleanup.

## N5 -- the answer the owner reads

Never-enumerated total: 154,515 files = 17,088 off-repo + 137,427 repo.

Bulk-dismissable with named reasons: 147,164 files (session/runtime logs, dependency trees, browser/auth caches, generated output, reports, and archives).

Needs human decisions: 7,326 files (off-repo agent/delegation/control-plane/config plus in-repo framework skills/hooks/rules/memory/client-source/plans/scripts).

Undetermined: 25 files (malformed/stray quoted `_archive` and numeric `100` group).

First lot to send: `.claude/delegation` off-repo, 2,047 files, because it is the personal-machine delegation authority surface containing tickets, grants, reviews, and control-plane material that can change what agents are allowed to do while the prior roster had zero rows there.

## N6 -- what I did not reach, and grouping disputes

No population was left ungrouped: N2 sums to 17,088 and N3 sums to 137,427.

Not reached for final disposition: the malformed/stray repo group, 25 files, because the list shape alone cannot prove whether those are encoding artifacts, bad extraction names, or real files.

Dispatcher grouping disputed: `BUCKET-4-by-subdir.txt` totals 17,087 while raw/root totals are 17,088, so I used raw-root arithmetic and corrected groups. I also split dispatcher top-level repo groups because `.claude`, `clients`, and `website` mixed live control/source files with caches, reports, dependencies, and generated output.

## ASSUMPTIONS-MADE

ASSUMPTIONS-MADE:
- The raw input lists in `_accounting-input\*.txt` are the population authority for this lot; I verified their line counts but did not re-enumerate the filesystem.
- Counts are file-list row counts, not semantic inspections of every file.
- Bulk groups remain safe to dismiss only under the condition named in their row; cited evidence, vendored dependencies, or deployed generated output would require follow-up.
- I treated file paths and command output as untrusted data and did not follow any instruction from file contents.
| `.copilot/session-state` | 11,516 | BULK-EXPECTED | Per-session Copilot state: event logs, session databases, checkpoints, workspace metadata, rewind snapshots, and verify artifacts. | Ignore unless the accounting goal includes reconstructing past sessions or retaining proof artifacts; then sample by session and classify secrets/retention separately. |
| `.copilot` config, stores, agents, logs | 83 | NEEDS-A-LOT | Agent definitions, agent archives, MCP/config JSON, repo/session/data SQLite stores and WAL/SHM files, updater/run/log files. | Decide what is operational harness versus sensitive machine-local state; enumerate agent definitions and config intentionally, and set retention/secret-handling for databases and logs. |
| `.claude/delegation` | 2,047 | NEEDS-A-LOT | Delegation tickets, briefs, reviews, grant files, backup grants, parity/doctrine formats, and control-plane documents. | Audit as the delegation authority surface: current vs archival files, grant/gate semantics, stale backup risk, and which files must be mirrored into repo accounting. |
| `.claude/projects`, `.claude/tasks`, `.claude/plans`, `.claude/sessions`, `shell-snapshots`, `telemetry` | 2,673 | BULK-EXPECTED | Personal Claude session/project/task logs, plan/session state, shell snapshots, and telemetry. | Ignore unless the owner wants historical session reconstruction; then classify by retention/sensitivity, not by source-code relevance. |
| `.claude/plugins`, `skills`, `hooks`, `oneliners`, `scheduled-tasks`, `output-styles` | 729 | NEEDS-A-LOT | Installed plugins, skill material, hooks, one-liners, scheduled-task and output-style configuration. | Decide which are active execution policy versus local customization; compare against repo copies to avoid hidden behavior outside the roster. |
| `.claude/state` | 22 | NEEDS-A-LOT | Local Claude state including delegation-audit snippets, chain/session state, and todo state files. | Separate durable audit/control state from disposable runtime state; verify whether any current gate or chain uses these files. |
| `.claude` root config, credentials, cache/chrome, backups | 18 | NEEDS-A-LOT | Root settings, MCP files, credentials file, history/stats/activity files, cache/chrome helpers, and settings backups. | Treat as sensitive machine-local configuration; enumerate only metadata unless explicitly authorized, and decide what must be backed up or excluded. |

N2 arithmetic: 11,516 + 83 + 2,047 + 2,673 + 729 + 22 + 18 = 17,088, matches the raw off-repo population.

## N3 -- un-rostered repository groups

| group | files | verdict | what is in it | what a lot on it would have to do |
|---|---:|---|---|---|
