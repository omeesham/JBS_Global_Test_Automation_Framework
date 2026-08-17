# DENOM-REDERIVE FINDINGS

START: filled

## D1 - your method

D1:
I will run read-only PowerShell commands from `C:\Users\rutvi\aud\f\r` against `_accounting-input\*.txt`.
For each input I will compute raw line count with `Get-Content -LiteralPath <file> | Measure-Object -Line` and deduped line count with lines normalized only for surrounding whitespace and exact duplicates removed via `Sort-Object -Unique`; I will not strip `repo:` or `home:` until bucket classification.
For git C-quoted or inconsistently quoted rows, I will keep the original row for audit samples and compare a normalized path key by removing only the leading stratum prefix (`repo:`/`home:`), trimming one matching pair of outer double quotes, and converting `/` to `\`; I will not silently decode or discard non-ASCII escapes.
For the partition I will dedupe the NOW-existing population from `A-tracked`, `B-untracked`, `B-ignored`, `C-claude`, and `D-copilot`, classify repo rows against normalized roster keys, classify roster smell tags from `ROSTER-BY-SMELL`, count off-repo rows by `home:` prefix, assert bucket sums equal the NOW deduped total, and list any fall-through rows.
For disk existence I will test repo paths relative to the repo root and home paths relative to `C:\Users\rutvi`; manifest-vs-roster will be normalized with the same path-key function.

## D2 - the counts

D2:
Input counts:
- `A-tracked.txt` raw=2053 dedup=2053, measured from the run-local accounting input bundle.
- `B-untracked.txt` raw=55751 dedup=55751, measured from the run-local accounting input bundle.
- `B-ignored.txt` raw=81126 dedup=81126, measured from the run-local accounting input bundle.
- `C-claude.txt` raw=5489 dedup=5489, measured from the run-local accounting input bundle.
- `D-copilot.txt` raw=11599 dedup=11599, measured from the run-local accounting input bundle.
- `ROSTER-PATHS.txt` raw=1854 dedup=1854, measured from the run-local accounting input bundle.
- `ROSTER-BY-SMELL.txt` raw=1854 dedup=1854, measured from the run-local accounting input bundle.
- `MANIFEST-PATHS.txt` raw=251 dedup=250, measured from the run-local accounting input bundle.
- `CROSSWALK-powershell.txt` raw=1 dedup=1, measured from the run-local accounting input bundle.
Roster smell distribution cmd=`Get-Content _accounting-input\ROSTER-BY-SMELL.txt | split tab | Group-Object`: normal=1773; scratch-dir=33; loose-root-dump=19; orphan-image=13; temp-log=10; vestigial-infra=3; walk-evidence=3.

## D3 - the accounting

D3:
Accounting command=`PowerShell normalize rows by root scope + relative path, classify against ROSTER-BY-SMELL, then sum buckets`.

| Bucket | Count |
|---|---:|
| In the roster and smell-tagged (`tag != normal`) | 45 |
| In the roster and tagged `normal` | 1458 |
| In the repository but absent from the roster | 137427 |
| Off-repo (`home:` from `C-claude.txt` + `D-copilot.txt`) | 17088 |
| Deduped NOW total | 156018 |

Sum assertion: 45 + 1458 + 137427 + 17088 = 156018; result PASS, fall-through rows=0.
The roster covers off-repo not at all: `ROSTER-PATHS.txt` off-repo rows=0 and `ROSTER-BY-SMELL.txt` off-repo rows=0.
I preserved repo/home root scope during dedupe; without that, five home rows collide with same relative `repo:` paths (`.claude/...`) and the total falsely drops to 156013.

## D4 - roster decay and the manifest

D4:
Roster decay command=`Node fs.existsSync(repo-relative path), with git C-style octal escape decoding cross-check`: roster rows gone from disk=427; decoding rescued 0 rows.
Gone sample: archived nav4 auth-state text file (gitignored, local-only); `.auth/chrome-profile/`; `.auth/encore-state.json`; repo-side private guiding-vision mirror (gitignored); `.claude/hooks/lib/uplink/packet-builder.mjs`; private end-day skill file (gitignored); `.claude/state/delegation-audit/arena-brief.md`.
Manifest-vs-roster command=`normalize MANIFEST-PATHS and ROSTER-PATHS with same relative-path key`: manifest paths absent from roster=96.
Manifest absent sample: local worker-doctrine index under ua-worker state (gitignored); `copilot-worker.sh`; `delegation-gate.mjs`; `delegation-nudge.mjs`; `~/.claude/delegation/`; `~/.claude/delegation/DUTY_STACK.md`; `~/.claude/delegation/config.json`.
Off-repo instruments: input lists are `C-claude.txt`=5489 and `D-copilot.txt`=11599; `CROSSWALK-powershell.txt` says claude=5488 copilot=11596, so deltas are +1 claude and +3 copilot in the input lists.
Likely explanation for the off-repo delta: `CROSSWALK-powershell.txt` appears to be a second walk snapshot of the same roots but not the exact emitted list; all `C-claude.txt`/`D-copilot.txt` rows have `home:` prefix and no blank rows, so the small +1/+3 delta is consistent with snapshot timing, hidden/permission-filter differences, or file-vs-container inclusion differences rather than malformed input rows.

## D5 - the ratio, in plain words

D5:
Of the 156,018 distinct paths that exist in the supplied current accounting lists, only 1,503 were ever in the 2026-07-18 roster. That is 1,503/156,018 = 0.963%, meaning the roster covered just under 1% of the current machine population, or about 1 out of every 104 paths. The roster covered zero off-repo rows, so it was mainly a small repo-focused denominator, not a denominator for everything on this machine.

## D6 - what you could not compute, and anything you dispute

D6:
Could not compute exact row identities for the off-repo crosswalk deltas because `CROSSWALK-powershell.txt` contains only `claude=5488 copilot=11596`, not path rows to diff against `C-claude.txt` and `D-copilot.txt`.
I dispute the phrase "same two off-repo roots" if it is intended to imply exact parity: the provided path lists are larger by +1 `.claude` row and +3 `.copilot` rows, with no blank lines or missing `home:` prefixes to explain it.
I also dispute treating the supplied repo strata as perfectly live disk truth: direct disk probes found 427 roster rows gone from disk, while a normalized comparison against `A/B`/`B-ignored` would call only 350 absent; 80 rows are present in the supplied current repo strata but absent by direct disk reads, e.g. `.auth/encore-state.json`, the repo-side private guiding-vision mirror, and `.claude/hooks/lib/uplink/packet-builder.mjs`.
Quoted/non-ASCII rows exist: 25 roster rows contain git C-style octal escapes or quoting-like escapes; decoding them did not change the roster-gone count.

---

## ASSUMPTIONS-MADE

ASSUMPTIONS-MADE:
- I treated `A-tracked.txt`, `B-untracked.txt`, `B-ignored.txt`, `C-claude.txt`, and `D-copilot.txt` as the supplied NOW population for the partition denominator, because that is what the ticket defined as input.
- I preserved `repo:` and `home:` as separate root scopes during dedupe, because the same relative `.claude/...` path under repo and home names different files.
- I treated roster paths with no prefix as repo-relative rows, because `ROSTER-PATHS.txt` samples are repo-relative and its off-repo row count is zero.
- I used direct filesystem existence, with repo-relative path resolution, for roster decay because the ticket asked for rows no longer on disk.
- I treated the off-repo crosswalk delta as explainable only at count level because the crosswalk file provides no row-level path list.

LOT-COMPLETE denom-rederive units=6
