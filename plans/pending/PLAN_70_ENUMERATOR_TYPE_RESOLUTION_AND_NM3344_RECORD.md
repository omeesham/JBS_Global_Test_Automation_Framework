> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_70_ENUMERATOR_TYPE_RESOLUTION_AND_NM3344_RECORD.md`. All context below.**
>
> The agent self-bootstraps from the frontmatter + sections in this file, with **no additional user prompting**:
>
> 1. **Identity**: load `/identity` per the Identity field below. Phase 2 is HUNTER-owned (live walk); Phases 0/1/3/4/5 are OWNER.
> 2. **Skills**: load every skill in the Skills field (leading skill auto-calls its chain).
> 3. **Model + thinking + permission-mode**: read the frontmatter fields below (all three required per LR-041).
> 4. **Dependency gate**: verify every Depends-on item is DONE or N/A. HALT if blocked.
> 5. **Context load**: read §1–§3 of this plan plus the four council artifacts named in §2 **in full** before any edit. They are the evidence base; do not re-derive what they settle.
> 5.5. **Browser tool**: `cli` per LR-038 v2 — Phase 2 is an unattended functional DOM probe, no pixel assertion, no fresh passkey flow.
> 6. **Phase 0 FIRST**: the record corrections land before any code change, so the repo stops asserting three things now known to be false.
> 7. **Execute Phases 1+** per Step-by-Step.
> 8. **Handoff**: flip the Status field to DONE, add the Executed date, append an activity-log row (LR-028 + LR-037), `git mv` to `plans/done/`, `npm run plans:reindex`, commit.
>
> **HALT + ASK USER** if: a dependency blocks / scope ambiguity beyond the KEEP list / Phase 1 discovers >30% scope extension / regression-guard shows unrelated changes / LR-037 timestamp drift / **Phase 5 config change — never flip a guardrail mode without Rutvik's explicit in-chat go**.

---

# PLAN 70: Enumerator type resolution + NM-3344 record correction

**Status**: Pending
**Priority**: High
**Created**: 2026-08-16
**Identity**: OWNER (Phase 2: HUNTER)
**Skills**: /execute, /rca, /regression-guard, /final-q
**Model**: opus
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli
**CoverageMode**: quick
**Depends on**: none
**Parent**: none

---

## §1 — Context

NM-3344 (Service Charge coverage) closed on 2026-08-15 with two findings recorded as open rather than
resolved. A five-seat council investigated both: two workers (claude-sonnet-4.6), two cross-family reviewers
(gpt-5.5) that independently re-executed the work, and one author defense round. Both findings are now settled,
and **both differ materially from how the closed plan describes them.**

**Finding 1 — enumerator type resolution: REAL, and worse than recorded.** It is not one defect with the stated
cause; it is **three distinct causes**, and the cause named in the closed plan is not the one hurting this page.
The framework mandates this enumerator as the machine denominator (REQUIREMENTS.md HARD STOP #11: *"the
denominator is machine-enumerated by scripts/walk-coverage/enumerate-page.mjs — RUN IT; do NOT self-count"*), so
every walk that ran it since 2026-07-22 inherited its output unchallenged.

**Finding 2 — second rejection behaviour: NOT REAL. Refuted.** Non-numeric and numeric-out-of-range inputs
behave **identically** on this page, verified live on the same day, on the same fields, in the same session, and
independently re-executed by a different model family using the exact value the 14 August walk used. The closed
plan's claim that they differ is wrong. No test-case gap follows from it.

**The suspected loophole is cleared.** Commit `2744d5ed6` ("stop a check failing plans in the mode meant to be
non-blocking") was checked against git history, not prose: `unresolved_probe_mode` was introduced as `"announce"`
by commit `367363ff` on **2026-07-23**, and `git show 2744d5ed6^:.claude/guardrail-config.json` confirms it was
still `"announce"` immediately before the commit on 2026-08-15. The commit made the code honor a three-week-old
configured value. **It was a legitimate bug fix, not a gate relaxed to let a plan close.**

## §2 — Evidence base (read before editing; do not re-derive)

| Artifact | What it settles |
|---|---|
| `.claude/state/ua-worker/chips/nm3344-close/out-B-repo/FINDINGS-B.md` | Original repo-side RCA (contains errors corrected by the defense — read the defense too) |
| `.claude/state/ua-worker/chips/nm3344-close/out-B-repo/REVIEW-B-r2.md` | Cross-family re-execution; config history; real multiplier; blast radius refutation |
| `.claude/state/ua-worker/chips/nm3344-close/out-B-repo/DEFENSE-B.md` | Aligned final record for finding 1 — **the three causes, the blast-radius table, the coverage verdict** |
| `.claude/state/ua-worker/chips/nm3344-close/out-A-live/FINDINGS-A.md` + `REVIEW-A.md` + `ALIGNED-A.md` | Live evidence for both findings; positive control; the live observation still owed |

Supporting raw artifacts (`*.verify.txt`, `r2-*`, `rev-*`) sit beside those files with sha256 manifests.

## §3 — The three causes (finding 1)

| # | Cause | Provable from | Effect |
|---|---|---|---|
| 1 | **Tab-cycle ordering.** The opener loop (`enumerate-page.mjs:641-660`) navigates to the History tab and leaves the page there; Phase 2.2 type derivation runs afterwards at `:874+`, so the `page.$eval` read at `:901` fails and the catch at `:904/:908` records `probe='unresolved'`. Note the code stores **selectors, not element handles** — the earlier "detached handle" wording was withdrawn. | repo | 23–24 controls per run |
| 2 | **Readiness wait returns a stale count instead of failing.** `waitReady` (`:184`) uses `timeout: 20000` and, on timeout, **returns `last` rather than throwing** (`:182-204`). It governs both initial load and opener clicks (`:551`, `:651`). Repo walk notes record 38s and 90s readiness for this page. | repo | compounds 1 and 3, silently |
| 3 | **Controls expose no native type, and the classifier has no rule for them.** Live: the 79 Basic Information percentage inputs return `type=null, inputmode=decimal`. A **positive control proves the probe works** — the same read resolves `type=text` on Location inputs elsewhere in the app. A no-tab-cycle control read and a long-readiness re-run both returned 79/79 present, 79/79 `type=null`, `changedCount=0`. | live | all 79 |
| 4 | **The denominator counts global app-shell chrome as page controls.** The 6 controls recorded as `unresolved:edit-mode-click` are **not form fields at all** — they are the global sidebar navigation anchors (Home, Inbox, Job Search, Asset Search, Customer Search, Item Search), `tagName=A` with `href` present. Independently re-executed and confirmed: `MAPPING-CONFIRMED` (all six keys quote `role a` / `why native:a[href]`) and `GLOBAL-CHROME-CONFIRMED` (the identical 6 appear in the `service-charge-basic-info`, `service-charge-history` **and** `1604-service-charge` records, and repo inventories already classify these `struct:a` keys as app-shell chrome). They can never resolve a field type because they are not fields. | live | 6 on **every** page |

**Confirmed classification signals (independently verified, direct input to the Phase 2 classifier):**
the 79 percentage inputs consistently carry `tagName=INPUT`, `type=null`, `inputmode=decimal`,
`data-testid` prefixed `service-charge-percentage-`, class tokens `h-7 / w-[100px] / text-right / pr-6`,
`aria-invalid=false`, and a value containing a percent marker; `role`, `id`, `name`, `formcontrolname` and
`href` are **all null on all 79** — so `formcontrolname` is NOT an available signal, despite being an obvious
candidate. Nav anchors are separable by `tagName === 'A' && href !== null`.

**Cause 1 alone is not sufficient** — this is the load-bearing finding. Fixing the tab ordering makes the DOM
readable, but these controls still expose no `type`. Worse, the existing rule at `TYPE_SIGNAL_RULES:461`
matches `tag === 'INPUT'` → "Plain text", so a naive ordering fix would silently reclassify 79 numeric
percentage fields as **plain text** — trading a visible `unresolved` for an invisible wrong answer. That is
strictly worse than the current state and must not ship.

**CAUSE 1 RESTATED (2026-08-16) — the mechanism above is incomplete, and the fix built on it did not work.**
Live instrumentation on office 1604 found the real mechanism: it is not only that the *opener loop* leaves the
page on History **before** derivation starts. **The derivation loop itself click-probes a navigation control
partway through, and that click unmounts the surface it is still measuring.** Clicking
`id:radix-_r_10_-trigger-History` takes testids **80 → 0**, percentage inputs **79 → 0**, Save **1 → 0**.
Every element whose turn comes after that click fails its `$eval` and is recorded `unresolved` — the
classifier is never reached.

That distinction is the whole difference between a fix that works and one that does not. Navigating back
**once at the start** cannot help, because the loop breaks the page again after it has begun. The property
that must hold is: *no element may fail to resolve because an earlier probe in the same pass changed what is
mounted.*

**CAUSE 5 — THE ACTUAL KILLER, found 2026-08-16 after three failed fixes. Four corrupted bytes.**

Two regexes that strip an archetype suffix — `enumerate-page.mjs` ~`:371` and ~`:533` — are written with
**mojibake**: `Ã—` where the character must be `×` (U+00D7). The keys they match carry a proper `×`, so
**the regexes never matched, and never have.** The chain:

1. `collapseArchetypes()` emits the key `testid:service-charge-percentage-# [archetype×79]`
2. `:533`'s regex fails to strip the suffix, so the lookup key keeps the whole string
3. the `archetypeRepKeys` lookup — keyed on `testid:service-charge-percentage-#` — **misses**
4. the fallback assigns the full archetype key as the selector key
5. `:371`'s regex fails identically, so the suffix survives into `entryKeyToSelector`
6. the selector becomes `[data-testid="service-charge-percentage-# [archetype×79]"]`
7. that matches **0 elements** live, `$eval` throws, the catch records `unresolved`

**79 real controls have been invisible to the type resolver for the life of this code**, and every walk
inherited the result because HARD STOP #11 forbids second-guessing the enumerator.

This is why **three fixes about *when* the read happens all failed** — the defect is in *what selector is
constructed*, and no amount of re-ordering changes a selector that matches nothing. A run of failed timing
fixes was evidence the input was wrong, not the schedule. The corruption survived four review seats because
`×` and `Ã—` are indistinguishable at a glance and a non-matching regex fails **silently** — it does not
error, it just declines to strip, and a wrong-but-plausible string flows on. Lesson recorded in auto-memory
(`feedback_a_non_ascii_literal_in_a_matcher_fails_silently_forever`); the fix uses the codepoint escape
`×` so no future encoding round-trip can re-break it.

**Two other beliefs were tested and refuted by the same run**, and neither should be re-investigated:
- The classifier is **correct**. `readElementObservation` converts a null `type` to `''`, the
  `inputmode=decimal` predicate evaluates true, and `deriveFieldType` on a real percentage input returns
  `Numeric / spinbutton`. A `type === ''` vs `type = null` mismatch was the leading theory and it is **wrong**.
- `service-charge-save` does **not** fail because Save fires a network write and the click-probe times out.
  It is a read-failure after the History unmount, plus a source denylist.

**Inflation arithmetic (corrected):** an unresolved control emits **129** case rows (the parser's
`totalFieldCases` across 13 field types); a correctly-typed Numeric/spinbutton control emits **14**. The real
inflation is **129 / 14 = 9.214×**. The closed plan's "roughly 129-fold" was a misread of the row count as a
multiplier. The interim 6.2× figure was also wrong and is withdrawn.

**Blast radius — two separate censuses, because there are two separate bugs with two separate dates.**

*Type inflation (causes 1–3), defect entered `cfd79956b` 2026-07-22.* Only
`service-charge-basic-information-2026-08-10.md` and `service-charge-history-2026-08-10.md` are **AFFECTED**,
cited only by `PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK`. Five other candidates came back NOT-AFFECTED —
their "unresolved" hits are prose, not machine probe entries — and two of those NOT-AFFECTED calls survived
independent spot-checks.

*Chrome scoping (cause 4), entered by `4a24e140c` **2026-06-26** — ~26 days EARLIER and an independent bug.*
Three further artifacts flip to AFFECTED: `corporate-pricing-override-2026-07-21.md` (cited by no plan),
`pricing-2026-06-19.md`, and `terms-conditions-core-2026-08-05.md` (cited by no closed plan — an earlier claim
that `SUBPLAN_LEGAL_FCC` cited it was **refuted** by machine enumeration). `pricing-2026-06-19.md` **is** cited
by four closed plans: `PLAN_EXHAUSTIVE_WALK_GUARANTEE`, `PLAN_TIERED_DELEGATED_WALK`,
`SUBPLAN_CGS_B_WALK_INTEGRITY`, `SUBPLAN_PRICING_FCC`.

**Materiality (independently judged, and deliberately not inflated):** those four closed plans are
**contaminated but not invalidated**. The pricing artifact is pre-2026-06-24 grandfathered or used as
framework/parity evidence, and none of their conclusions rests on a 6-element chrome-inflated pass/fail the
way NM-3344's denominator agreement does. **NM-3344 remains the only closed plan whose conclusions actually
turn on a bad denominator.** Six spurious chrome elements is a far smaller distortion than 9.2× type
inflation — do not treat the two as equivalent, and do not reopen those four plans.

**AMENDMENT (2026-08-16) — the census above covered the WRONG ARTIFACT CLASS for part of this question.**
Both censuses enumerated **markdown** artifacts under `clients/encore/specs_planning/_internal/`. The
enumerator also writes **JSON walk-reports** under `reports/walk-coverage/`, and that class was never
censused. A machine census of it (council-verified, full-disk enumeration of 249,716 files) found:

| JSON walk-report | total | unresolved | ratio | tracked citations |
|---|---|---|---|---|
| `4107-corporate-pricing-override.json` | 504 | 499 | **0.990** | yes |
| `4107-cpr-resting.json` | 70 | 66 | 0.943 | none |
| `1604-service-charge.json` | 30 | 24 | 0.800 | none |
| `service-charge-history.json` | 30 | 24 | 0.800 | yes |
| `1604-pricing.json` | 29 | 23 | 0.793 | yes |
| `service-charge-basic-info.json` | 29 | 23 | 0.793 | yes |

Seven further JSONs predate the `derived_types` schema and carry no per-control probe labels at all — no
ratio is extractable from them, confirmed by opening every one.

**Every parseable walk record sits between 79% and 99% unresolved.** The `service-charge` JSON→artifact
mapping is `MAPPING-CONFIRMED` on real evidence — matching URLs and office, and the inventories explicitly
cite run-ids `nm3344-denominator-0811` and `nm3344-histdenom-0811` — not on filename similarity.

**Per-citer disposition (council-ruled):**

| JSON | Disposition |
|---|---|
| `service-charge-basic-info.json` | **conclusions depend on it** — the inventory records `Machine denominator: 29 element(s)` sourced from it and uses that as its coverage floor |
| `service-charge-history.json` | **conclusions depend on it** — same path, denominator 30 |
| `4107-corporate-pricing-override.json` | **provenance mention only** — that inventory explicitly disclaims it: `Coverage_Ratio: 148/148 of AGENT-derived case slots — ⚠ NOT the LR-062 machine denominator`, and records `CrossCheck: UNEARNED`. Its coverage argument is self-contained; the 99% figure is reported there as a known open problem, not used as a denominator |
| `1604-pricing.json` | **NOT the source of the pricing denominator.** An earlier reading blamed it for `pricing-2026-06-19.md`'s `79/79 (100%)` claim — but this JSON's total is **29**, not 79. The 79 traces to a **historical 2026-06-19/06-22 pricing machine walk** documented in the inventory and its parity proof. Dependency on the *current* JSON is **not established**; dependency on the *historical run* is. Whether that historical run is still reachable for examination is Phase 5's third demand |
| `1604-service-charge.json`, `4107-cpr-resting.json` | no tracked citations — blast radius reaches nothing |

So the JSON-class radius is **two artifacts with count-dependent conclusions** (both already AFFECTED and
already scheduled for regeneration in Phase 3), plus one unresolved historical-run question on the pricing
side. The four closed plans citing `pricing-2026-06-19.md` are **not** implicated by the current JSON.

## §4 — Prior-Fix Trial (recurrence gate)

| Prior fix | What it did | Why it did not prevent this | Verdict |
|---|---|---|---|
| `2744d5ed6` (2026-08-15) — unresolved-probe check made non-blocking in `announce` mode | Corrected code that contradicted its own comment and config | **SURVIVES — not convicted.** It fixed an announce/deny bug correctly. It was never meant to detect *why* types go unresolved, only to report the ratio. It reported this defect on every run, as designed. The failure was that nobody acted on an announce-mode signal. | SURVIVES |
| REQUIREMENTS.md HARD STOP #11 (LR-062) — "RUN the machine enumerator; do NOT self-count" | Forces a machine denominator over model judgment | **CONVICTED, partially.** The rule makes the enumerator authoritative but provides **no check that its output is meaningful**. A run where most controls resolve `unknown` satisfies the rule perfectly. Phase 5 rewires this. | CONVICTED |
| `verify-denominator.mjs` unresolved-ratio check (threshold `0.5`, announce mode, ramp started 2026-07-22) | Warns when the unresolved fraction exceeds half | **CONVICTED — `rubber-stampable`** (LR-069 §3.5 enum; upheld on independent review). The lowest ratio in the entire corpus is `0.793`, so it has fired on **100% of runs** and become indistinguishable from noise — nobody acted on any of it. Worse, its ramp criterion is *quietness*, and it has never once been quiet, so announce→deny could never graduate. | CONVICTED |

**Both convicted items' rewire is in scope (Phase 5) — no sediment left idling.** Adding a second
threshold check beside the convicted one is forbidden by LR-069 §3.5.

**CORRECTION (2026-08-16) — the "100% unresolved" figure is `FIGURE-CONTRADICTED`.**
This plan and its source handoff describe a **30/30 unresolved** run on 15 August. Three things were
established against it:

1. **No machine artifact carries it.** The surviving evidence is 24/30 (2026-08-11), 24/30 (2026-08-15), and
   23/29 for Basic Information.
2. **Its only source is a prior council report** (`out-B-repo/FINDINGS-B.md`), which reconciles 30/30 and
   23/29 by assigning them to two separate events — a reconciliation that is **not independently evidenced**.
   A prior report's number is a claim, and several of that report's other conclusions have already been
   overturned by this plan.
3. **The fix commit's own message contradicts it.** `2744d5ed6` says *"four fifths of the controls in them
   never resolved a type"* — approximately 80%, which matches the JSONs and does **not** match 100%.

The real measured baseline for this surface is **79–80% unresolved**, and every acceptance criterion in this
plan is now stated against that. Nothing downstream may rest on the 30/30 figure.

**A related caution about the corpus itself.** `reports/walk-coverage/*.json` are **generated and untracked**
(`.gitignore` matches `reports/*`), and the enumerator overwrites a fixed path per surface. This is not
theoretical: `1604-pricing.json` read **29** during the census and **58** hours later in the confirmation
round — the same path, a different run. So the distribution in the table above is a snapshot of a mutable
directory, re-running the census does not reproduce it, and the raw historical pricing JSON behind the
`79/79` claim is simply **gone** — only the inventory and parity summaries survive it.

---

## §5 — Step-by-Step

### Phase 0 — Correct the record (no code) [OWNER]

The repo currently asserts three things known to be false. Fix them before anything else.

- [ ] In `plans/done/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md` §"Known and not closed here", replace the
      two bullets with corrected text: (a) the enumerator defect has **three** causes, the tab-cycle one is not
      the operative cause for this page, and inflation is **9.214×** not 129-fold; (b) the second-rejection
      finding is **refuted** — both input classes behave identically, verified live with the 14 Aug value.
      Cite this plan and the council artifacts. **Do not alter the plan's Status or closure record** — the
      closure stands; only the open-findings text was wrong.
- [ ] Append the corrected statements to `clients/encore/specs_planning/_internal/agent-mistakes.md`
      (prefix `REQ-*`), one entry per corrected claim, then `npm run sync:mistakes`.
- [ ] **Acceptance**: `grep -c '129-fold' plans/done/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md` returns 0.

### Phase 1 — The one live observation still owed [HUNTER, BrowserTool: cli]

Cause 3's fix cannot be designed without it. `ALIGNED-A.md` §WHAT-A-LIVE-RUN-STILL-OWES specifies it exactly —
follow that spec, do not improvise.

- [ ] For the **6 `edit-mode-click` controls** that stay unresolved after a click-to-reveal probe, record what
      the DOM exposes **after** that click: `tag`, `type`, `role`, `inputmode`, `class`, `formcontrolname`,
      `aria-*`, and any adjacent unit/suffix label.
- [ ] Same for a representative sample of the 79 percentage inputs, so the classifier has both shapes.
- [ ] **HARD STOP #10 / LR-061-C applies**: run a **positive control** before recording any "exposes nothing"
      verdict — the original walk skipped this and the reviewer had to supply it. A no-op without a positive
      control is unsound evidence.
- [ ] **HARD STOP #13**: emit an `## Observations` section (Bugs/Defects + Suggestions), literal `none` if empty.
- [ ] **HARD STOP #11b**: the opener frontier for these 6 controls must be enumerated, not sampled.
- [ ] HARD STOPs #1 (office 1604 only), #4/#7 (observation-first, simple tools), #8 (beforeunload) apply as
      written. #12 (empty-surface) is `out-of-scope: no empty surface in this probe — 79 populated inputs`.
- [ ] **The decision this phase exists to make**, stated as an explicit token in the artifact:
      `SAME-CLASS` — the 6 belong to the same `type=null` / `inputmode=decimal` class as the 79 percentage
      inputs, so one classifier rule covers both — or `DISTINCT-ARCHETYPE` — they need their own classification
      path. Phase 2's cause-3 design branches on this answer, so it must be a token, not a narrative.
- [ ] **Acceptance**: a dated artifact under `clients/encore/specs_planning/_internal/` carrying the raw
      per-control attribute table, the positive-control output, and the token above.

### Phase 2 — Fix the enumerator (all three causes) [OWNER]

Scope: `scripts/walk-coverage/enumerate-page.mjs` (+ `lib/` if the classifier lives there).

- [ ] **Cause 1**: return to the Basic Information tab before Phase 2.2 runs, **or** derive types before the
      opener loop. Prefer whichever keeps the opener frontier walk intact.
- [ ] **Cause 2**: `waitReady` must **fail loudly** on timeout instead of returning `last`. Raise the timeout to
      cover the observed 38s/90s readiness. A silent partial is the thing being removed — do not merely raise
      the number.
- [ ] **Cause 3**: add classifier rules keyed on the **confirmed** signals in §3 — `inputmode=decimal`, the
      `data-testid` prefix, class tokens, unit suffix — so type-less numeric inputs resolve as
      Numeric/spinbutton. **`formcontrolname` is null on all 79 — do not key on it.**
      **Guard against the `TYPE_SIGNAL_RULES:461` hazard**: a control that matches no specific rule must stay
      `unresolved`, never fall through to "Plain text". Silence beats a confident wrong type.
- [ ] **Cause 4**: scope the denominator to the page-content area so global app-shell chrome is excluded.
      Prefer a **container-scoped enumeration** over a blocklist of element names — a blocklist rots as the
      shell changes, and the defect is that global chrome is in scope at all, not that these particular six
      links are. `tagName === 'A' && href !== null` is the confirmed separator if a predicate is needed.
      **This changes the denominator for every page the enumerator has ever walked, not just Service Charge** —
      re-check the §3 blast-radius census against the new scoping before assuming it still holds.
- [ ] **Cause 4 — verify the container boundary live BEFORE implementing.** Flagged risk: if the sidebar and
      the content area share a common ancestor, or the content selector is unstable, a container-scoped
      enumeration can still capture shell elements or start dropping real content elements — the second
      failure mode is far worse, because it removes controls from the denominator silently. Probe first and
      confirm both directions: the 6 nav anchors fall **outside** the chosen container, and all 79 percentage
      inputs fall **inside** it. Do not implement the scoping until that probe passes.
- [ ] `/regression-guard` before and after.
- [ ] **Acceptance**: unit/fixture coverage under `scripts/walk-coverage/tests/` proving (a) a type-less numeric
      input resolves as numeric, (b) an unknown-shaped control stays `unresolved` rather than defaulting,
      (c) `waitReady` throws on timeout.

### Phase 3 — Re-walk and regenerate the two affected artifacts [HUNTER → OWNER]

**STATUS 2026-08-16 — PHASE 3 COMPLETE.** Enumerator `PHASE3-ENUMERATOR-READY`; both artifacts regenerated,
reviewed cross-family, and machine-verified `complete=true, reasons=[], provenanceFail=false`.

**Deliverables** (the 2026-08-10 originals are untouched — they are the evidence of what the broken
enumerator produced):
- `clients/encore/specs_planning/_internal/field-inventories/service-charge-basic-information-2026-08-16.md`
- `clients/encore/specs_planning/_internal/field-inventories/service-charge-history-2026-08-16.md`

**Three defect classes were caught in review, none by the authoring seat.** Worth recording, because each is
the same shape this plan exists to fix — a record that reads like evidence but is not:

| Caught | What it was |
|---|---|
| **88 fabricated probe results** | `affordance: none` on every row, from an enumeration pass that click-probed nothing. LR-057 requires a live probe of control, label and row; LR-062 condition 5 rates an unprobed observation claim as fabrication-class. The History rows contradicted themselves in their own text — `affordance: none; sort affordance unprobed`. Now `affordance: unprobed` throughout |
| **A manufactured 79-row expansion** | One archetype entry expanded back into ~79 rows carrying per-row testids, defaults, validation and enabled-state the measurement never captured — much of it inherited from the 2026-08-10 artifact and re-dated as if measured today. Collapsed to archetype level; the reviewer confirmed the collapse kept every supported fact rather than going green by deletion |
| **A dangling `Completion_Record`** | Both files pointed at `reports/walk-coverage/cv2-*.json`, which does not exist. `coverageVerdict` returned `complete=false`; with `coverage_mode: deny` that fails Cx at closure. Repointed at the durable evidence chip — `reports/walk-coverage/` is gitignored and overwritten on every walk, so a pointer there resolves today and rots on the next run |

A fourth finding — `HISTORY-CLAIMS-MISATTRIBUTED` — resolved to **`Unsupported: none`**: every claim had real
backing (the live DOM read, or the prior walk), but cited the cv2 JSON as its source. Fixed by citation, with
the inherited values carrying their real 2026-08-10 date.

**Two framework gaps surfaced and are deliberately left honest rather than papered over** (filed, not fixed
here): `MCP_Session_Tool` has no allowed value for the Playwright CLI that LR-038 v2 made the default, and
LR-057 has no token meaning "not probed". In both cases the true value is unlisted, and a true-but-unlisted
value beats a listed lie. Neither was raised as a closure blocker by the reviewer.

The re-walk ran on office 1604 and was independently re-executed by a second model family, which confirmed
every number:

| Claim | Ruling |
|---|---|
| denominator 29 → 13 | CONFIRMED |
| 21 shell/chrome elements excluded | CONFIRMED |
| **0 legitimate controls lost** | CONFIRMED — the failure mode that mattered most did not occur |
| 4 previously-invisible column-sort controls surfaced | CONFIRMED |
| **0 of 13 types resolved** (vs 0 of 29 pre-fix) | CONFIRMED — the fix did not move the live outcome |

**RESOLVED 2026-08-16 — the type resolver now works live**, after three failed fixes and a top-tier RCA that
found Cause 5 (see §3). The confirming run, independently executed by a second model family:

> `testid:service-charge-percentage-# [archetype×79]` → **`Numeric / spinbutton`** — *not* Plain text — via
> the real representative selector `[data-testid="service-charge-percentage-0"]`, **live match count 1**, an
> `INPUT` with `inputmode=decimal` and value `0.00 %`. The old corrupted selector matches **0**.

**79 controls that were invisible to the type resolver for the life of this code now resolve correctly.**

The remaining 12 entries are each unresolved for a **named, non-defect reason**, which is what the phase's
acceptance asked for:

| # | Entry | Why unresolved |
|---|---|---|
| 1–2 | trigger-button, More information | `non_probeable` BUTTON |
| 3 | tablist | `non_probeable` |
| 4–5 | Basic Information / History tabs | `non_probeable` tab |
| 6, 9 | Basic Information / History tabpanels | `DIV role=tabpanel` — containers, not controls |
| 7 | `service-charge-save` | `denylist_hit` — mutating action, deliberately not click-probed |
| 10–13 | 4 column-sort buttons | **empty evidence** — Radix dynamic ID instability + classifier gap; the one genuine open item, separate ticket |

**The second defect — the enumerator could not measure the two tabs separately.** `parseArgs` accepted
arbitrary flags but `main` consumed no branch selector, so both invocations produced byte-identical JSONs,
verified by sha256 on two independent runs. **There had never been a real machine measurement of the History
branch**; every History *number* in every prior record was a duplicate of Basic Information.

> **Correction, 2026-08-16.** An earlier draft of this section — and the ticket written from it — said the
> 2026-08-10 History artifact was "Basic Information wearing a History label". A cross-family reviewer checked
> the original and refuted it: that file does carry genuine History content (its column headings and prior
> row observations, sourced from human/agent walks, not from the enumerator). The defect was confined to the
> **machine denominator**, which was a duplicate. The overstatement originated here and propagated into a
> deliverable before it was caught — recorded so the narrower claim is the one that survives.

**CLOSED 2026-08-16 — `PHASE3-ENUMERATOR-READY`, both surfaces measured correctly**, independently
re-executed live on office 1604 by a second model family. Closing it took four fixes, of which the branch
selector was only the first:

| Fix | Outcome |
|---|---|
| `resolveBranchOpener` + branch click | Outputs became distinct; an unrecognised branch exits 2 with `[FATAL]` |
| `minTestids: 0` on the History branch | Unblocked History, but the reviewer ruled the gate **`VACUOUS-AND-UNSAFE`** — two consecutive polls of zero satisfied it, so a blank page, a failed fetch and a rendered grid were indistinguishable. It then found the harm: a denominator of 10 written while its own DOM probe read `rowCount=0` |
| `waitReadyContent` — gate on rendered content | Waits for `text=Modified By`, then `tbody tr`, throws `[WAIT_READY_CONTENT_TIMEOUT]` on either. Form-surface readiness untouched |
| A test that detects its own removal | The first attempt "proved" red by deleting a function declaration — a `SyntaxError`, which proves only that the tests import the file. Replaced with an assertion against the live `MODULE_CONFIG`: removing `contentGate: true` gives `47 passed, 1 failed` with the module parsing; restoring gives `48 passed`. Suite 36 → 48 |

**The row selector was an assumption worth testing, and it held.** `tbody tr` was chosen from an earlier
"History renders 5 rows" observation, which does not establish the rows are HTML table rows — this app is
Radix, and Radix grids are frequently div-based with `role="row"`. Had it matched nothing, the gate would
have thrown a loud, confident, *wrong* timeout: worse than the vacuous gate, because it reads as evidence.
Live DOM: `tbody tr` count **5**, tag `TR`, `[role=row]` count **0**. `ROW-SELECTOR-CORRECT`.

Final live measurement, both branches, office 1604:

| Surface | Denominator | Result |
|---|---|---|
| Basic Information | 8 (raw 86) | Percentage archetype resolves `Numeric / spinbutton` via `[data-testid="service-charge-percentage-0"]`, live match count 1 — **not regressed** |
| Service Charge History | 10 (raw 10) | 6 navigation/chrome entries + the 4 column-sort buttons. Outputs distinct from Basic |

**One thing the History record must state explicitly, or it will mislead.** The surface renders **5 data
rows** which are deliberately **excluded** from the denominator as non-interactive display data — the same
principle that *includes* Basic's 79 percentage inputs, which are inputs. The exclusion is defensible, but a
bare "denominator = 10" cannot distinguish *considered and excluded* from *never seen*, and this plan already
lost rounds to a number that was small because something was invisible. The regenerated artifact carries the
row count and the exclusion rationale alongside the denominator.

**Every History-specific control in that denominator is in the deferred sort-button class.** The History
measurement is therefore truthful and complete, and also yields no usable per-field data until that separate
ticket lands. Said plainly here so no later reader mistakes a clean record for a covered surface.

Per-class disposition of the 13 remaining unresolved controls:

| Class | Disposition |
|---|---|
| 79 percentage inputs (1 archetype) | **strategy/order bug** — the classifier resolves them correctly when reached |
| 4 column-sort buttons | **classifier gap** — real sort controls, outside §2 field typing, no rule covers them |
| `service-charge-save` | **strategy limit** — mutating action; read-fail after unmount plus a source denylist |
| tabpanel / tablist containers | **not controls** — should not be in the denominator |
| tab triggers | controls, but not field inputs — need navigation/surface classification, not §2 typing |

- [ ] Re-run the enumerator against Service Charge Basic Information and History on office 1604.
- [ ] Regenerate `service-charge-basic-information-2026-08-10.md` and `service-charge-history-2026-08-10.md` as
      **new dated artifacts** (do not overwrite history — the old ones are the evidence that the defect existed).
- [ ] **Acceptance**: the unresolved ratio must fall materially below the **measured pre-fix baseline of
      23/29 (0.793) on Basic Information and 24/30 (0.800) on History** — not below 100%, which was never the
      real state (see the §4 correction). Every remaining unresolved control named individually with a reason.
      A run whose ratio is unchanged means Phase 2 failed in reality whatever the unit tests say — HALT, do
      not paper over it.
- [ ] **Also confirm the shell left the denominator** (cause 4): the 6 global sidebar anchors gone, and
      **nothing legitimate gone with them**. Compare the non-chrome control set element by element. Silently
      dropping real controls is the worse failure — a smaller denominator reads as cleaner coverage.

### Phase 4 — Settle the coverage question NM-3344 could not answer [OWNER]

Currently **UNDECIDABLE**: 45 TCs delivered against a corrected bound of 29 collapsed controls × 14 = **406
rows** (1106 before archetype/QUICK collapse), and the catalog authored 33 net-new cases. Rows are not TCs, so
the comparison is meaningless without the disposition manifest.

**TC SIDE: DONE AND ALIGNED (2026-08-16).** A council round (author → cross-family review → BOUNCE → defense →
confirmation) produced and hardened the test-case half. Verdict `SOUND-FOR-VERDICT`. Established facts, each
machine-verified twice:

- **45 TCs, agreeing across all three homes** — 30 Basic Information + 15 History in the markdown, the specs,
  **and** the XLSX (`check:tc-parity` exits 0). The first draft called the XLSX "unverifiable because binary";
  that was false and was corrected — this repo builds that workbook, so a reader for it necessarily exists.
- **The "33 net-new" figure is wrong, and not for the reason first supposed.** The catalog, the History
  markdown and the History spec all landed in the **same commit `5663c64f3`** — in which the catalog already
  said `HIS 001..003 / 33 net-new` while the spec already carried `HIS-004..015`. The catalog was authored
  undercounted on the day it was written. That is an NM-3344 authoring defect, not a sequencing artifact.
- **12 MD↔spec title mismatches** (`BAS-003/007/012/013/014/015/016/017/029`, `HIS-004/005/012`). Eleven are
  cosmetic elaborations. **`BAS-029` is not** — the spec drops "without scrolling", which changes the surface
  behaviour the test asserts.
- **Numeric out-of-range is already covered**: `BAS-006` uses `100.01` and `BAS-005` uses `-0.01`
  (boundary-adjacent), plus `BAS-011` `-5` and `BAS-016` a 50-digit literal (arbitrary). See §6.
- **Two genuine zero-coverage axes**: `Save-Failed`, and `Validation-Error → Fix → Dirty`. The first stated
  rationale for the second — "the field uses Angular normalisation, not a blocking error state" — was
  **refuted**: invalid input does set `aria-invalid=true`, retains its text and keeps Save disabled. The
  deferral survives with the corrected reason *"blocking validation-error recovery transition not covered"*.

**The join key — read this before doing the arithmetic.** `JOIN-KEY-EXISTS`: map rows name controls by
`data-testid` (`service-charge-percentage-N`), while the enumerator reports collapsed archetypes
(`[archetype×79]` with `rowCount:79`). They join on **archetype key + row index**. The framing at the top of
this phase — "45 TCs against 406 rows" — compares two different units and must not be used. Disposition per
archetype, then per row index within it.

- [x] Produce the corrected case-row manifest from Phase 3's output (control side).
- [x] Per-TC disposition table joined on archetype key + row index.
- [x] **Acceptance**: explicit verdict token, with the table behind it.
- [x] Carry forward the two caveats (`BAS-029` non-cosmetic drift; the corrected `Validation-Error` rationale).

**SETTLED 2026-08-16 — verdict `UNDER-COVERED`.** The first answer was `ADEQUATELY-COVERED`; cross-family
review overturned it and the author conceded all four rulings. **Every gap in the first verdict had been
labelled `DEFERRED`, which is how a coverage question gets answered green without anything being covered.**

| Ruling | Outcome |
|---|---|
| `HIS-012-CALCIFIES-A-BUG` | `TC-SVC-HIS-012` asserts that clicking a History column header **does not** set aria-sort. LR-040-D names `sort` a mandatory-effect class and forbids asserting the zero-effect as expected behaviour. A sort control that does not sort is a bug candidate; a passing test makes it documented behaviour — permanently, and invisibly, because the suite stays green. Compounding it, those 4 buttons carry **empty evidence**: never successfully probed. `sorting` cannot be called covered by it |
| `CONTRADICTION-CONFIRMED` | The refuted "no blocking validation-error state" rationale was still doing load-bearing work in the verdict's own paragraph, while the corrected version sat further down the same report |
| `DEFERRALS-MASK-GAPS` | Save-Failed was deferred as *"no error-injection mechanism available"*. That is false: `page.route(...)` + `route.fulfill({ status: 500 })` is used throughout this client, including in the **sibling module** at `clients/encore/tests/service-charge-text/service-charge-text.spec.ts:1425`, forcing exactly this failure. Independently verified. The governing distinction — *QUICK scope may defer work, but may not call a testable unimplemented transition unavailable* |
| `VERDICT-OVERSTATED` | Honest token is `UNDER-COVERED` |

**What survived**: §2 field-type rows are fully covered (14/14 Numeric + 5/5 save-cycle); `rbac` /
`concurrency` / `platform` remain legitimate QUICK deferrals per the Standard; `HIS-006` (default sort order)
is valid because it asserts an observable order rather than an absence.

**The three gaps, split by what the owner has to decide about each** — a blocked gap and an unwritten one need
different calls:

| # | Gap | Class | Blocked on | Cost |
|---|---|---|---|---|
| 1 | Sort-behaviour coverage — currently *held* by HIS-012, which calcifies instead of covering | **BLOCKED** | Radix dynamic ID instability (existing ticket). Needs either BY-DESIGN evidence that the headers are non-functional, or a stable non-ID selector strategy | Low, once unblocked |
| 2 | `Dirty → Save-Failed` state transition | **UNWRITTEN** | Nothing — technique proven at `service-charge-text.spec.ts:1425` | ~30 lines, 1 TC |
| 3 | `Validation-Error → Fix → Dirty` recovery | **UNWRITTEN** | Nothing — `aria-invalid` assertions already exist in `BAS-009`–`BAS-015`; only the recovery step is missing | ~20 lines, 1 TC |

**Not absorbed silently — surfaced to Rutvik**, per this phase's acceptance. Closing gaps 2 and 3 is new scope
beyond this plan (which contracted to *file* the gap, not close it), and authoring TCs carries the LR-ENC-002
parity obligation — MD, spec and XLSX land together or not at all.

**HIS-012 needs a decision sooner than the other two.** It is not merely a gap: it is a shipped test actively
asserting that a possible defect is correct behaviour. The minimal honest holding position is `fixme` with the
`DIFFERENTIAL-DATA-REQUIRED` reason, so it stops making the claim while gap 1 is blocked — per
`feedback_an_unconfirmed_expectation_must_be_fixme_never_a_tautology.md`. That edits a client deliverable, so
it is the owner's call rather than an in-flight rescope (LR-046).

### Phase 5 — Stop a meaningless denominator from passing as a denominator [OWNER]

The two convicted mechanisms from §4. A walk where four controls in five resolve `unknown` currently satisfies
HARD STOP #11 — and the check that was supposed to notice announces on every single run, which is the same as
noticing nothing.

**DESIGN: SETTLED 2026-08-16, council-ALIGNED.** Two candidates were refuted along the way — the original
"ratio exceeds a threshold" (a threshold already exists and everything exceeds it) and a boolean "zero
controls resolved" (silent on the graduating incident, whose real counts are 23/29 and 24/30). The settled
design, for **closure-bearing or cited walk completion records**:

> **Deny** when `!derived_types || total === 0 || unresolvedCount > 0`, where `unresolvedCount` is counted
> **after** subtracting externally-reviewed HARD STOP #11 allowlist exemptions. A record passes only after a
> fixed-enumerator re-walk leaves **zero unresolved non-exempt elements**. **No global ratio threshold.**

Why this shape rather than another number: HARD STOP #11 *already* demands 100% coverage with every manifest
row dispositioned. This enforces the rule that exists instead of inventing a parallel one — which is what made
the last mechanism ignorable. And the ramp is concrete rather than aspirational: fix the enumerator → re-walk
→ `unresolvedCount === 0` → the gate goes quiet. The convicted announce-mode ratio check is **removed** when
this lands; running both is the layering LR-069 §3.5 forbids.

**The allowlist write-gate is as load-bearing as the deny condition** (ruled `WELL-FOUNDED` — an agent that
can author its own exemption has no gate at all, the same reasoning that made LR-074's control files
self-protected). It is not optional garnish on the design:

- **Not agent-writable.** Agents and workers may not create or edit entries; an entry requires owner or
  external-reviewer sign-off, and the grant path is itself gate-protected.
- Each entry carries: a stable **element + surface + artifact** key, its **HARD STOP #11 exemption class**,
  a reason, the reviewer, the date, and evidence.
- The validator **ignores** any entry that is unreviewed, malformed, or stale — an unreadable grant must fail
  closed, not silently exempt.

An agent-writable flat list with no review gate recreates rubber-stampability under a different name.

**DESIGN CORRECTION (2026-08-16) — the original first step was wrong; do not build it.** It read *"add a check
that fails when the unresolved ratio exceeds a threshold."* A threshold check **already exists**
(`verify-denominator.mjs`, default `0.5`) and every run in the corpus exceeds it, so adding a second one
layers on an unconvicted-but-failed mechanism — forbidden by LR-069 §3.5. Trial first, then design.

- [ ] **Put the existing unresolved-ratio check on trial** per LR-069 §3.5 — `SURVIVES` or `CONVICTED` with a
      reason from the enum. If CONVICTED, its rewire-or-removal is in scope here; nothing new lands beside it.
- [ ] **Design a criterion that can actually graduate.** The current ramp is gated on the signal going quiet;
      it has never been quiet. Decide what a gate should assert to make a denominator *meaningful* rather than
      merely *low-unresolved* — a ratio is one proxy and it may be the wrong one.
- [x] **Threshold numbers wait for real data.** Census re-run 2026-08-16 against Phase 3's verified output.
      No number is encoded — the settled design has no ratio threshold at all, which is what removes the
      invented-threshold risk rather than managing it.
- [x] **Disposition the JSON blast radius** (§3 amendment).

**CENSUS RE-RUN 2026-08-16 — post-fix distribution.** Machine-measured from the two verified cv2 JSONs:

| Surface | Total | Resolved | Unresolved |
|---|---|---|---|
| Basic Information | 8 | **1** | 6 |
| Service Charge History | 10 | **0** | 9 |

The single resolved Basic entry is the percentage archetype — one entry standing for **79 controls**, which is
the whole of what the encoding fix recovered. Everything else on both surfaces is chrome, containers, the
denylisted Save, or the sort buttons.

**Two buckets, and the boundary was held strictly:**

- **Legitimately exempt — 6 Basic / 5 History.** Five navigation-chrome entries shared by both surfaces
  (`trigger-button`, `More information`, the `tablist`, and both tab triggers), plus `service-charge-save` on
  Basic (`denylist_hit` — clicking it commits a write). Each has a principled reason it can never yield a
  field type. These are the allowlist candidates.
- **Genuine gaps — the 4 History column-sort buttons.** Gate true positives that must keep firing.

> **A correction to how this plan has been describing those 4 buttons.** They have been called "Radix dynamic
> ID instability plus a classifier gap" throughout. The census reads the evidence field and finds it is the
> **empty string** — meaning *the enumerator ran no probe and produced no signal*, not that a probe was
> attempted and defeated by unstable IDs. Those are different diagnoses with different fixes, and the
> narrower, evidenced one is: nothing probed them. The separate ticket should be scoped to that, not to an
> ID-stability theory nobody has yet tested. It also sharpens the Phase 4 finding — `TC-SVC-HIS-012` asserts
> an outcome for a control that was never probed at all.

**Blast radius — fully contained.** Of the four cited JSON walk-reports, exactly two are count-dependent:
`service-charge-basic-info.json` and `service-charge-history.json`, whose counts (29 and 30) are recorded as
the coverage floor in the two **2026-08-10 inventories — the very artifacts Phase 3 already superseded**. The
other two are mention-only: the corporate-pricing-override inventory explicitly disclaims the JSON denominator
(`CrossCheck: UNEARNED`), and no currently-open artifact depends on the count in `1604-pricing.json` — the
historical JSON behind the `79/79` parity claim is gone from disk and is not that file.

**One open discrepancy, carried to the gate review rather than assumed away.** Both surfaces have exactly one
entry that is neither `resolved` nor `unresolved` (Basic 1+6=7 of 8; History 0+9=9 of 10) — most likely the
tabpanel container. A denominator with a silently third-classed entry is precisely the shape this plan exists
to distrust, so it gets confirmed, not reasoned about.
- [x] Update HARD STOP #11 to require the enumerator's output be *meaningful*, not merely *run*.
      Landed at **`.claude/agents/REQUIREMENTS.md:28`**.

> **Path correction, 2026-08-16 — twice wrong before it was right.** This line originally said
> `clients/encore/specs_planning/REQUIREMENTS.md`, was "corrected" to `clients/encore/docs/REQUIREMENTS.md`,
> and both were wrong: the second file exists and is 83KB but contains **no HARD STOP list at all**. A worker
> sent to edit it searched, found zero matches, and halted rather than editing the nearest plausible thing —
> which is the only reason this was caught instead of landing a rule in a file nobody reads.
>
> HARD STOP #11 is a **pipeline-agent** stop at `.claude/agents/REQUIREMENTS.md:28`, cross-referenced from
> `GENERATOR.md`, `PLANNER.md`, `AUDIT.md` and `HEALER.md`. Note that the number is per-agent — LR-064 cites
> *REQUIREMENTS* HARD STOP #11, *PLANNER* HARD STOP #19 and *AUDIT* HARD STOP #11 as three different rules —
> so "HARD STOP #11" alone is ambiguous without naming the agent.
>
> Fitting, for a plan about numbers nobody verified: this one was a confidently-stated path, carrying its own
> confident correction, and neither had been checked.
- [ ] **`unresolved_probe_mode` is currently `announce`. Whether it flips to `deny` is Rutvik's call, not this
      plan's** — present the evidence and the recommendation, then HALT for an explicit in-chat go. Guardrail
      config is a safety surface. **Evidence presented 2026-08-16; awaiting explicit go. Not flipped.**

**PHASE 5 COMPLETE 2026-08-16 — everything except the owner's flip.**

| Deliverable | State |
|---|---|
| Unresolved-probe gate in `verify-denominator.mjs` | **`COVERAGE-GATE-CORRECT`** — cross-family verified against real cv2 data: Basic's 6 unresolved reduce to **0** after exemptions; History's 9 reduce to **exactly the 4 sort buttons**. No ratio, no threshold |
| The convicted ratio check | **Removed**, same change, per LR-069 §3.5. No threshold comparison survives |
| Fixture | 12 cases, including *"all resolved → does NOT fire"* — the must-not-block case. Gate removal yields **10 named assertion failures**; restore yields green |
| Allowlist | Ships **empty**; valid-exempts, unreviewed-ignored, malformed-ignored, stale-ignored and unreadable-fails-closed each fixture-proven |
| Allowlist write-gate | Built, 10/10, **fires in production** (verified on real `Edit` payloads: deny on the allowlist, allow on `README.md`). **Not wired** — the settings.json line is the owner's |
| HARD STOP #11 | Updated at `.claude/agents/REQUIREMENTS.md:28` |
| Ramp | `announce`, telemetry wired. **`deny` not flipped** |

**The write-gate's first build passed 7/7 and did nothing in production** — it matched `file_edit`/`create_file`
while Claude emits `Edit`/`Write`, so every self-test was green and every real write sailed through. A guard
green in fixtures and silent in production is worse than no guard, because it manufactures assurance. Its
header now says so outright: **"THIS IS A SPEED BUMP, NOT A SECURITY BOUNDARY"**, followed by what it does not
stop — indirect shell writes, separate worker processes, path obfuscation — and a pointer to where the real
protection lives: the validator's `reviewed: true` requirement, which forces a self-authored exemption to
falsely claim human review and become audit-detectable.

The reviewer also listed a dozen shell bypasses (`cp`, `mv`, `sed -i`, `node -e`, `tee`, `Set-Content`, path
concatenation, case variance). **They were deliberately not chased.** LR-074 §74.2 records the precedent: the
previous write-protection gate took six adversarial rounds, produced a fresh bypass every round, and was
deleted. Enumerating constructs converges on nothing. The detective layer is the one that scales.

---

## §6 — NOT touched

- **NM-3344's closure itself.** The plan stays closed; only its open-findings text was wrong. Reopening it is
  not in scope — Phase 4 decides whether a *new* coverage gap gets filed.
- ~~**`verify-denominator.mjs`'s announce/deny mechanism** — proven correct (§4), left alone. Phase 5 adds a
  check beside it; it does not rewrite it.~~ **RETRACTED 2026-08-16 — this was wrong, and it was the most
  load-bearing wrong thing in the plan.** The announce/deny *mode selection* is correct (that is what
  `2744d5ed6` fixed). But the **unresolved-ratio check it gates is inert**: its threshold is `0.5`, and the
  lowest ratio ever recorded across every parseable walk record is `0.793`. It has therefore fired on **100%
  of runs**, which is indistinguishable from never firing — and explains precisely why nobody ever acted on
  it. A signal that never varies is not a signal. Two consequences: the announce→deny ramp is **structurally
  unable to graduate** (its criterion is quietness, and it has never been quiet), and Phase 5's original
  design — *add a check that fails when the ratio exceeds a threshold* — would layer a second threshold on
  top of a failed first one, which LR-069 §3.5 forbids outright. This check goes on trial in Phase 5; it is
  no longer in the NOT-touched list.
- **The five negative percentage test cases.** Finding 2 is refuted, so they cover the real behaviour.
  ~~Adding a numeric-out-of-range BVA case is a reasonable QUICK-tier addition but is deferred~~ —
  **RESOLVED 2026-08-16, no addition owed**: `TC-SVC-BAS-006` already drives `100.01` (max+1) and
  `TC-SVC-BAS-005` drives `-0.01` (min-1), both boundary-adjacent numeric out-of-range, confirmed at their
  spec lines by two independent seats. The axis is covered; the deferral is retired rather than carried.
- **The five NOT-AFFECTED walk artifacts** and their plans — census says clean; re-walking them is waste.
- `clients/encore/src/**` and `clients/encore/tests/**` — no product or spec change follows from either finding.

## §7 — Verification artifact

**The original check here was unfit and has been replaced.** It exited non-zero only when *every* control was
unresolved — and the real broken runs were 23/29 and 24/30, so it would have **passed the very defect this
plan exists to fix**. It was an instance of the same bug class it was meant to detect: a check whose failure
condition the actual failure never met.

```bash
node scripts/walk-coverage/enumerate-page.mjs --url "https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge" --out /tmp/p70-check.json && node -e "const d=require('/tmp/p70-check.json');const u=d.elements.filter(e=>e.probe==='unresolved').length;const t=d.elements.length;const r=u/t;console.log('unresolved',u,'of',t,'ratio',r.toFixed(3),'(pre-fix baseline 0.793)');process.exit(r>=0.793?1:0)"
```

Expected: a ratio well below the pre-fix baseline of `0.793`, exit 0. Exit 1 means the fix did not change the
live outcome. Re-derive the threshold from Phase 3's real distribution before relying on this long-term —
`0.793` is the measured pre-fix value, not a target anyone chose.

## §8 — Plan-Deviations log

| ID | Deviation | Reason | Disposition |
|---|---|---|---|
| — | (none yet) | | |
