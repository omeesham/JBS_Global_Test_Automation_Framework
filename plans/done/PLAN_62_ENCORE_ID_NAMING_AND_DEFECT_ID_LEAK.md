# PLAN 62 — Encore delivered-spec naming: the `CORE` ID segment and the `DEF-*` token leak

**Status**: DONE
**Executed**: 2026-08-08
**Priority**: Medium
**Created**: 2026-08-07
**Identity**: OWNER
**Model**: opus
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none
**Skills**: /planning, /delegation-temp, /regression-guard
**Depends on**: none

---

## 1. Context

Terms and Conditions (NM-3346) and Service Charge Text (NM-3345) were delivered to the client on 2026-08-07 and pushed to `encore-mock/main` (tip `41a02f72e`) and `origin/main` (tip `4b542701c`). The project owner then asked whether the test-case naming in those two suites matches the 29 suites already delivered, because he does not want reviewers telling him the convention was broken.

Two blind audits were run — `gpt-5.5` (run `n1-naming-gpt`) and `claude-opus-4.6` (run `n2-naming-opus`) — over a machine-enumerated corpus of 31 spec files and 996 test-case IDs. Reports and extraction data live at `.claude/state/ua-worker/chips/naming-audit/`. Their findings were then re-derived independently before being accepted; where they disagreed, the disagreement is resolved below with the evidence that settles it.

## 2. Findings

### 2.1 CONFIRMED — `CORE` is the only submodule code that reaches a test-case ID verbatim

`export_test_cases/module-codes.json` is the canonical ID registry. Submodule entries may carry `idModule` / `idSubmodule` fields that remap what actually lands in the ID string. Every corporate-override entry does exactly that: the registry key is `CORE`, but `idSubmodule: "OVR"` means the minted IDs read `TC-CPR-OVR-001` (`clients/encore/tests/corporate-override/corporate-override-core.spec.ts:66`). Seven registry entries carry that remap; they are the only ones in the file.

`TNC.CORE` and `SCT.CORE` (`export_test_cases/module-codes.json:41-46`) carry no remap, so the key falls straight through into the ID.

Consequence, measured across all 996 IDs:

| | Sibling suite segments | TNC / SCT |
|---|---|---|
| Distinct values | 23 | 1 (`CORE`) |
| Character length | 2–3 (`LI`, `LP` at 2; the rest at 3) | 4 |
| Character | domain abbreviation (`OVR`, `CUR`, `BAS`, `ECT`, `SRC`, `NTS`…) | generic word |
| IDs using `CORE` | 0 of 826 | 170 of 170 |

Both audit seats reached this independently and ranked it **COSMETIC, not blocking**. That ranking is correct: the written grammar in `module-codes.json:2` fixes the *segment count*, not segment length or vocabulary, and `LI`/`LP` already prove length varies. But the observation itself is real — a reviewer holding `TC-CPR-OVR-001` next to `TC-TNC-CORE-001` is looking at a genuine difference, and "the registry blesses it" is a weak answer when the registry entry was minted in the same commit as the delivery (`414158ed5`).

### 2.2 CONFIRMED — internal defect IDs `DEF-TNC-*` ship in client-visible test names

18 occurrences of `DEF-TNC-###` across two shipped files. Four are inside test titles, which means they render in the client's own HTML report:

- `terms-conditions.spec.ts:912` — `TC-TNC-CORE-044: … (DEF-TNC-002)`
- `terms-conditions.spec.ts:958` — `TC-TNC-CORE-045: … (DEF-TNC-005)`
- `terms-conditions.spec.ts:1628` — `TC-TNC-CORE-062: … (DEF-TNC-005 evidence)`
- `terms-conditions.spec.ts:1820` — `TC-TNC-CORE-074: … (DEF-TNC-005)`

The remaining 14 are comments in `terms-conditions.spec.ts` and `clients/encore/src/pages/terms-conditions/terms-conditions.page.ts`.

`NM-####` is the client's own Jira and legitimately stays. `DEF-TNC-###` is ours, and a client reviewer has nowhere to look it up. This violates LR-058 (`.claude/rules/deliverable.md`) — shipped client files carry no internal-process vocabulary.

The forbidden-token gate does not catch it: `scripts/lib/forbidden-patterns.mjs` has no `DEF-` pattern (verified — only `/\bsubplan\b/i` at line 194 matched a search for internal markers). The gate passed this delivery while four internal defect IDs went out in test names.

### 2.3 NOT A DEFECT — the cross-artifact ID counts reconcile

Seat 1 ranked the artifact-count differences **BLOCKING** and called them merge damage. That ranking does not survive. The counts:

| | markdown + xlsx | spec test titles | manifest |
|---|---|---|---|
| TNC | 92 | 87 | 77 |
| SCT | 83 | 83 | 81 |

The workbook's own summary row, machine-read earlier the same day, reads `terms_conditions_core — Automated: 87 / Pending: 5` and `service_charge_text_core — Automated: 83 / Pending: 0`. The five TNC IDs absent from the spec (`036`, `054`, `069`, `072`, `081`) are exactly the five the workbook already declares Pending, i.e. written up but not yet automated. The manifest shortfalls (77 vs 87, 81 vs 83) are exactly the 10 and 2 skipped tests, which the manifest excludes by design.

Every number reconciles. **There is no merge damage.** Seat 1's facts were correct; its diagnosis was not, because it had no visibility into the workbook's Pending column. Seat 2 read this correctly.

## 3. Decision — `CORE` stays, unchanged and undocumented

**Resolved 2026-08-08 by the project owner. No test-case identifier is renamed. No rationale is written into the registry. The `CORE` segment is left exactly as it is.**

The route to that decision matters, because it went through two reversals and each was driven by new evidence rather than by preference:

1. **First position (2026-08-07): do not rename** — on the assumption the IDs were already with the customer, making traceability the binding constraint.
2. **Reversed** when the owner corrected the premise: the delivery is in internal review and `encore-mock` is a dry-run mock, not the customer. With no external traceability to protect, renaming became cheap and the plan flipped to rename.
3. **Reversed again** by the council. Two blind seats — `r1-seg-gpt` and `r2-seg-opus` — were tasked with deriving the correct replacement segment from the corpus, explicitly forbidden from inventing one. Both established the same rule (the third segment abbreviates the submodule *band* — the tab, page, or operation within the parent module; fits 23/23) and both independently concluded that **the repo supplies no such band for these two modules**, because each has exactly one page.

Every candidate the council could derive is therefore padding:

| Candidate | Source | Defect |
|---|---|---|
| `CORE` (current) | — | 4 characters where every ID-reaching sibling is 2–3, and a generic word rather than a domain one |
| `TC-TNC-TNC-001` | r1 primary | Repeats the module code as the submodule; no sibling in the corpus does this |
| `TC-TNC-TAC-001` | r2 primary | Mints a second abbreviation of the exact phrase the registry already shortened to `TNC` |
| `TC-SCT-TXT-001` | r2 primary | `TXT` names a data type, not a business domain — the corpus names domains |

A hypothesis that these modules belong under `LOC` as sibling tabs (`TC-LOC-TNC-001`) was tested against the application's own test-id namespaces and **refuted**: the Locations tabs all sit under `location-settings-*`, while these two pages use their own `terms-conditions-*` and `service-charge-text-*` namespaces. They genuinely are separate modules.

Since no candidate is better than `CORE` and each carries its own defect, renaming would trade a cosmetic complaint for a substantive one across six artifacts. §4B is therefore **cancelled**. §4 (the internal-identifier removal) proceeded and is complete.

### 4B — Rename the suite segment — **CANCELLED 2026-08-08, see §3**

Retained below for the record only. Nothing in this section was executed, and the machine-derived worklist it describes remains accurate should the decision ever be revisited — the council's rename worklist is preserved at `.claude/state/ua-worker/chips/naming-audit/out-r1-seg-gpt/rename-worklist.json`.

~~**Open decision, resolved before any file is touched**~~: what replaces `CORE`. Every sibling submodule is a 2–3 character abbreviation of the *tab or sub-area* within its module — `LOC.LGL` (Locations → Legal), `LOS.BAS` (Local Office → Basic Information), `CPR.OVR` (Corporate Pricing → Override). Terms and Conditions and Service Charge Text were minted as their own top-level modules, so the sub-area that the submodule segment is supposed to name is not yet established. Determine the actual surface each suite covers — from the page objects, the specs, and the live navigation — and pick the segment from that, the same way every sibling was picked. **Do not invent a code before that fact is in hand**; that is what produced `CORE`.

Ordered work, once the segment is chosen:

1. **`export_test_cases/module-codes.json`** — add the `idSubmodule` remap for `TNC.CORE` and `SCT.CORE`, mirroring how the seven corporate-override entries do it. The file also carries an `idRenames` facility; use the sanctioned mechanism rather than hand-editing generated output.
2. **The markdown sources** — `terms_conditions_core_test_cases.md` (92 IDs) and `service_charge_text_core_test_cases.md` (83 IDs) under `clients/encore/specs_planning/test-cases/setup/`. These feed the exporter, so they are the real source of truth.
3. **`clients/encore/testcases/encore_test_cases.xlsx`** — sheets `terms_conditions_core` and `service_charge_text_core`. **Rebuilt via the exporter, never hand-edited**, and rebuilt with `--run-json` so measured results survive.
4. **The two per-module workbooks** — `clients/encore/testcases/terms-conditions/terms-conditions-core.xlsx` and `clients/encore/testcases/service-charge-text/service-charge-text-core.xlsx`. Confirmed to exist; their ID content is unread, so **verify before assuming they need changing**.
5. **The spec files** — 170 test titles across `terms-conditions.spec.ts` and `service-charge-text.spec.ts`. Hand-written, so these are real edits. Titles and IDs only; not one line of test logic.
6. **`scripts/deliverable/delivery-manifest.encore.json`** — the `tc_ids[]` arrays (77 and 81). Regenerate with the ship gate's own extraction, never by hand — a single typo re-fails the scope gate.

Then, in order: parity gate, freshness gate, scope gate, and a re-push to both remotes.

**Sheet names are a separate question.** The workbook sheets are `terms_conditions_core` / `service_charge_text_core` and the registry keys are `CORE`. Renaming the *ID segment* does not require renaming the *sheet group* — corporate-override proves the two can differ. Decide deliberately whether the sheet names follow, and say why either way.

## 4. Changes

### Task 1 — remove `DEF-*` from client-visible surface (delegated, `--mode edit`)
- Rewrite the four test titles so the meaning survives without the internal ID — e.g. `(DEF-TNC-005)` becomes wording that names the behaviour, not the ticket. Comment-only occurrences may keep their explanation but lose the identifier.
- Files: `clients/encore/tests/terms-conditions/terms-conditions.spec.ts`, `clients/encore/src/pages/terms-conditions/terms-conditions.page.ts`.
- **Comments and title strings only. Zero test logic changes.** Renaming a test title does not change its `TC-` ID, so no artifact parity is disturbed — confirm this holds by re-running the parity gate.

### Task 2 — close the gate hole at source (delegated, `--mode edit`)
- Add a `DEF-[A-Z]{2,4}-\d+` pattern to `scripts/lib/forbidden-patterns.mjs` so this family cannot ship again.
- **`NM-####` must not be caught.** Prove the discrimination both ways: a fixture containing `DEF-TNC-005` trips the gate; a fixture containing `NM-3346` does not.
- Re-run `node scripts/verify-no-forbidden.mjs --staged-diff` unpiped and paste the exit code.

### Task 3 — record the `CORE` decision so it is defensible (Claude, not delegated)
- Add a `$comment` to the `TNC.CORE` and `SCT.CORE` entries in `export_test_cases/module-codes.json` stating that these modules are single-suite with no sub-tab to abbreviate, so the generic `CORE` segment is deliberate and not an oversight.
- This is the answer to "your naming isn't per the other specs" — a dated, in-repo rationale beats an argument reconstructed months later.

### NOT touched
- The test-case IDs themselves, in any of the five artifacts. See §3.
- The `idSubmodule` remap machinery. It works; the corporate-override entries stay as they are.
- The seven held-back specs, and any already-delivered module.
- `encore-mock/main`. Nothing in this plan is pushed to the client without a separate explicit instruction.

## 5. Prior-Fix Trial

This is a recurrence of the LR-058 internal-vocabulary class, which was "fixed" earlier the same day.

| Prior fix | What it did | Why it did not fire | Verdict |
|---|---|---|---|
| `w11-jargon-scrub` (2026-08-07) | Removed "deferred to deep subplan" and the `L3` tier label from `terms-conditions.spec.ts`; swept the shipped surface using the repo's own checker | **scoped-wrong** — it swept using `scripts/verify-no-forbidden.mjs`, so it could only find tokens already on the list. `DEF-` was never on the list, so a clean sweep result was an artifact of the gate's blind spot, not of a clean file. | CONVICTED |

The convicted mechanism is the token list, not the sweep. Task 2 rewires it by adding the missing family and proving the pattern discriminates (`DEF-` trips, `NM-` does not) rather than merely asserting the list is now complete. A pattern that never fires is not a gate — the discrimination proof is the point, not the regex.

## 6. Per-Identity Satisfaction

| Role | Owns | Required | Concrete deliverable |
|---|---|---|---|
| HUNTER | requirements | Nothing — the requirement is the owner's question, already answered in §2 | `(none)` |
| GIVER | workbooks | Nothing — no ID changes, so no workbook edit | `(none)` |
| BUILDER | shipped source | Title + comment rewrites | `clients/encore/tests/terms-conditions/terms-conditions.spec.ts`<br>`clients/encore/src/pages/terms-conditions/terms-conditions.page.ts` |
| HEALER | status | Nothing — no failing test is involved | `(none)` |
| WATCHDOG | evidence | The two-way discrimination proof for the new pattern | `.claude/state/ua-worker/chips/naming-audit/out-c2-gate-floor/REPORT.md`<br>`.claude/state/ua-worker/chips/naming-audit/out-c2r-review/REPORT.md`<br>`.claude/state/ua-worker/chips/naming-audit/out-c2b-bounce/REPORT.md` |
| GARDENER | gates | The forbidden-pattern change | `scripts/lib/forbidden-patterns.mjs` |
| OWNER | registry rationale, commit, push | The `$comment` entries; publishing | `export_test_cases/module-codes.json` |

## 7. Verification

```bash
grep -rn 'DEF-' clients/encore/tests/ clients/encore/src/ | wc -l
```

Expected: `0`.

```bash
node scripts/verify-no-forbidden.mjs --staged-diff
```

Expected: zero marker hits, exit 0 — run unpiped, since a pipe reports the pipe's exit code.

```bash
npx tsx scripts/check-tc-parity.ts
```

Expected: PASS, exit 0 — proves the title rewrites left every `TC-` ID untouched.

## Execution Summary

**Executed**: 2026-08-08. **Outcome**: delivered and pushed to both remotes; verified on the remotes after the fact.

| Item | Status | Evidence |
|---|---|---|
| §4 Task 1 — remove `DEF-*` from the shipped spec and page object | DONE | `c1-def-scrub`; 4 test names + comments reworded, meaning preserved |
| §4 Task 1b — remove `BUG-*` from the same spec | DONE | `c3-bug-scrub`; found by the dispatcher after the gate work exposed them |
| §4 Task 1c — remove both from the markdown source and regenerate the workbooks | DONE | `c4-md-workbook`; **this was a scope miss in the original plan** — see below |
| §4 Task 2 — extend the forbidden-token gate | DONE | `c2-gate-floor` → `c2r-review` (ACCEPT-WITH-FIXES) → `c2b-bounce`; `scripts/lib/forbidden-patterns.mjs` |
| §4 Task 3 — write the `CORE` rationale into the registry | **CANCELLED** | Owner instruction 2026-08-08: leave it, do not document it |
| §4B — rename the suite segment | **CANCELLED** | See §3; no derivable better segment exists |

**The plan's own scope miss.** §4 as first written named only the spec and page object. The identifiers were also in the test-case markdown and in **both shipped workbooks** — 15 cells each. That would have shipped. It was caught not by review but by `check-tc-parity` flagging `TC-TNC-CORE-044` as title-divergent, because the spec had been corrected and the workbook had not. Root cause: the forbidden-token gate reads source files and cannot read spreadsheet cells, so a clean gate result was never evidence about the workbook. The `xlsx-lint` vocab gate does read cells and now passes on 4,141 rows, but it had no pattern for these identifiers either until Task 2 landed.

**Verification performed.**

- Pre-push: two blind cross-family seats. `pre2-opus` returned CLEAR-TO-PUSH; `pre1-gpt` returned BLOCK on five points, of which three were stale (its ship dry run archived `HEAD` at 02:00 while the commit landed at 01:55), one was an explained measurement difference, and one was real — two commits from a different session (`7745dc979`, `0eaba0ae2`, PLAN_61 work) were on `main` and went with the branch.
- Post-push: `post2-opus` LANDED-CLEAN; `post1-gpt` PROBLEM on one point — a PLAN_61 commit touched `clients/encore/specs_planning/_internal/agent-activity-log.md`. That is a ticket-wording defect, not a delivery defect: the ticket said "nothing under `clients/`" where it meant "nothing that ships", and `specs_planning/` is purged by the ship. Confirmed absent from the client remote.
- Dispatcher's own checks on the remote: tip `c6c7c186b`, 24 specs, seven held-back specs absent, **zero test-case ids lost across all 24 specs**, zero internal identifiers in source or workbook cells.

**A hollow check worth recording.** The dispatcher first verified the payload at the ship's scratch path and got zero identifiers, zero leaks, clean on every count — while the directory had already been deleted. Every zero was the absence of a directory, not the absence of a defect. Re-verified against a payload built with `git archive`. This is the failure mode where a green result is an artifact of invisibility.

**Pushed**: `encore-mock/main` `41a02f7` → `c6c7c18`; `origin/main` `4b542701c` → `10ef433ed`.

## 9. Evidence

- `.claude/state/ua-worker/chips/naming-audit/out-n1-naming-gpt/NAMING-AUDIT.md` — gpt-5.5 seat, with `parity-final.json` and `line-evidence.txt`
- `.claude/state/ua-worker/chips/naming-audit/out-n2-naming-opus/NAMING-AUDIT.md` — opus seat
- `.claude/state/ua-worker/chips/naming-audit/TICKET-naming-convention-audit.md` — the ticket both seats answered
