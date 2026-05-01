---
name: encore-questions
description: Generate a live-Chrome-verified batch of questions to ask the Encore client-side QA contact. Previews candidates to the user BEFORE verifying, asks user to curate the list, verifies approved ones on live Chrome, outputs compact, then asks user "submit?" — if yes, records in submitted.json so the same question isn't re-surfaced until it's marked resolved. Default 3 per invocation; user can request more. Sub-commands — `/encore-questions` (main flow), `/encore-questions submitted` (list pending), `/encore-questions resolve <key-or-snippet>` (mark answered), `/encore-questions reset` (clear the submitted queue). PRIVATE — not in INDEX.md, not auto-routed.
user-invocable: true
disable-model-invocation: true
auto-calls: none
tools: Read, Write, Edit, Glob, Grep, Bash, mcp__Claude_in_Chrome__javascript_tool, mcp__Claude_in_Chrome__navigate, mcp__Claude_in_Chrome__read_page, mcp__Claude_in_Chrome__read_network_requests, mcp__Claude_in_Chrome__read_console_messages, mcp__Claude_in_Chrome__find, mcp__Claude_in_Chrome__tabs_create_mcp, mcp__Claude_in_Chrome__tabs_context_mcp
---

# /encore-questions — Verified QA-question batch for the Encore client-side contact

**PRIVATE SKILL** — not in INDEX.md, not in CLAUDE.md auto-routing. Manual invoke only.

**Identity**: OWNER
**Skills auto-called**: none
**Model + thinking**: `claude-opus-4-7` + `xhi`
**Justification** (per LR-041): Phase 5 requires adaptive judgment on whether a filed bug reproduces in isolation vs. was the prior agent's own interaction mistake — the exact failure mode that produced BUG-LOC-ECT-001 (stricken 2026-04-23). Deterministic rules alone miss "field saves fine alone, prior agent didn't isolate" — needs Opus to reason across DOM state + network + form-model interactions.
**Browser tool**: Claude in Chrome (LR-038).

**State file**: `.claude/state/encore-questions-submitted.json` — flat list of Qs already sent to the Encore QA but not yet answered. Created on first `submit yes`. Missing file = empty list. User can edit / delete directly.

---

## Invocation forms

```
/encore-questions                              main flow (default 3 Qs)
/encore-questions 5                            main flow with up to 5 Qs
/encore-questions more-detail                  main flow + source refs + evidence per Q in footer
/encore-questions no-lies                      surface low-confidence items that would normally be killed
/encore-questions submitted                    read-only list of currently-pending submitted Qs
/encore-questions resolve <key|snippet>        remove an entry from submitted.json
/encore-questions reset                        clear submitted.json (destructive — asks once)
```

---

## Phase 0 — Parse invocation

1. **Sub-command routing**: `submitted` / `resolve <…>` / `reset` short-circuit the main flow — jump to §Sub-commands at the bottom.
2. **Count override**: regex `\b([2-9])\b` or `\ball\b` on the invocation string → set `N = matched number or 8`. Default `N = 3`. Hard ceiling = 8 (matches Phase 5 verify budget).
3. **Mode detection**:
   - `more_detail`: `\b(more[- ]detail|expand on|arm me|meeting mode)\b`
   - `no_lies`: `\b(no[- ]lies|no lies|honest|straight|exact|reality)\b`
   - MODE = `NO-LIES+ARMOR` | `NO-LIES` | `ARMOR` | `SHIELD` (default)

Emit `[Mode: <MODE>] [N: <n>]` in the Rutvik-only footer at end of output.

---

## Phase 1 — Gather candidates

Parallel reads:
1. `plans/INDEX.md` → priority tags (P0 / P1 / P2).
2. `plans/pending/*.md` → grep for `Pending decisions`, `discussion-item`, `BUG-CANDIDATE`, `PRC-BUG-`, `NOT-TRACKED`, `ghost`, `phantom`, `unexplained`, `no Jira`, `need Jira`, `TBD`, open `?`.
3. `reports/bugs/BUG-*.json` → every `"status": "open"`.
4. `clients/encore/specs_planning/catalogs/*.md` → `empty-everywhere`, `phantom column`, `NOT-TRACKED (by inference)`, `PRC-BUG-`, `BUG-CANDIDATE`.
5. `clients/encore/specs_planning/_internal/field-inventories/*.md` → `no Jira`, `unclear requirement`, `no doc reference`.
6. `clients/encore/specs_planning/_internal/agent-mistakes.md` → unresolved LR-030 entries without a filed bug.
7. `.claude/state/encore-questions-submitted.json` → load pending-submitted list (may not exist yet).

---

## Phase 2 — Classify

Tier:
- **A — Structural** (column exists / missing, duplicate header, no dropdown option). Near-zero false-positive risk.
- **B — Single-step behavioral** (1 field → 1 save → observation). Low risk.
- **C — Multi-step behavioral** (N>1 setup steps). Higher risk — Phase 5 isolation gate handles.

---

## Phase 3 — Kill-list audit

Drop candidates matching ANY:
- **DOM-walkable by us in < 5 min** (field label, type, click-to-open, default, dropdown options).
- **DOM-walkable on OLD SITE (navigator2.training.psav.com) in < 5 min** (per LR-ENC-001 — baseline truth source). If we can answer by visiting the old Navigator UI, we don't need to ask Encore. Baseline-absent features (ECT, EnableMultidayPricing, Merchant Currency column, Benefits Multiplier — see `OSB-ACCESS-VERIFY-2026-04-24.md` §3/§5) are NOT killed by this criterion; they remain valid escalations (ALL-078).
- **Framework-internal** (identity, plan IDs, agent tooling, selector strategy, test architecture).
- **Already-closed BUG** (`status: closed` / `resolved` / `invalid`).
- **Agent-decidable TBDs** (helper naming, SP authoring choices).
- **Asks-to-invent-policy** — only ask QA to share existing policy.
- **Already submitted** — candidate's `questionKey` matches an entry in submitted.json. Reason: we've already asked; re-asking is noise until it's resolved. See `/encore-questions submitted` for the current queue.

**No Tier-C auto-kill.** Phase 5 isolation gate handles false-positive risk on multi-step bugs (it's ~2 min per bug).

Emit kill-list counts per category in `more-detail` mode.

---

## Phase 4 — Rank + pick top N

Order:
1. Priority: P0 > P1 > P2.
2. Tier: A > B > C.
3. Tie-break: prefer candidate with most concrete evidence on file.

Take top N (default 3). Keep the rest as substitution pool for Phase 5 FALSE drops.

**Empty-pool case**: if Phase 3 filters all candidates out (everything already in submitted.json, or no new candidates this scan), emit: `No new verified questions. Submitted queue has <N> pending answer — see /encore-questions submitted.` Exit cleanly, skip Phases 4.5–7.

---

## Phase 4.5 — Preview to user BEFORE verifying (NEW — user directive 2026-04-23)

**Core rule**: do NOT spend time on live Chrome verification until the user has curated the list. The user may already know some of these are bullshit, already-answered, or duplicates of something they've asked verbally.

Emit to chat:

```
Candidates to verify and surface (N picked; pool has M more):

  [1] [P<pri>] [Tier <A|B|C>] <questionKey> — <one-line observation>
  [2] ...
  [3] ...

Say which to verify on live Chrome — e.g. "verify 1 and 3", "all", "skip 2", "drop 3 add from pool", "stop".
```

Then STOP and wait for user response. Do not open Chrome.

User-response handling:
- **"all" / "yes" / "verify"** → proceed with all N.
- **"verify X,Y"** → proceed with just those.
- **"skip X" / "drop X"** → remove X, optionally pull replacement from pool (ask user).
- **"stop" / "cancel"** → exit skill cleanly, write nothing.
- **User replaces a candidate with a new one of their own** → accept; skip Phase 5 for user-provided Qs (they already know the context), flag them `[user-supplied]` in the output.

---

## Phase 5 — MCP live verify (only on user-approved subset)

**Announcement** (LR-038, mandatory first line of Phase 5):
> Browser tool: Claude in Chrome. Reason: verifying pending QA questions against live app before surfacing.

**Rule 0 — Read source verbatim first** (classical manual-QA discipline per LR-044): read the bug JSON `stepsToReproduce` or catalog file's evidence block **fully, no paraphrasing**.

### Per-candidate verify protocol

Navigate to source page, then tier-specific:

**Tier A (structural)** — old-site-first, then new-site DOM query:
1. **Old-site check first** (per LR-ENC-001 + LR-045): `navigate(https://navigator2.training.psav.com/#/setup/locationdetail/1604)` + `javascript_tool` for the equivalent structural probe. If the old site DOM answers the candidate (column present/absent, header text, dropdown options, default value) with high confidence, the question is answered — skip live new-site verify, mark verdict `CONFIRMED (baseline oracle)`, flow directly to Phase 6 compact output. This drops the Q from the submit pool because the baseline answered it; annotate in footer under `## Answered by baseline (not escalated)`.
2. **Baseline-absent** (feature not present on old site — ECT, EnableMultidayPricing, Merchant Currency column, Benefits Multiplier per `OSB-ACCESS-VERIFY-2026-04-24.md` §3/§5) → proceed with new-site-only probe; escalation to Encore QA remains valid per ALL-078.
3. **New-site probe** (needed when baseline answered "absent" or baseline was ambiguous):
```javascript
(() => {
  const headers = Array.from(document.querySelectorAll('[role="columnheader"], th'))
    .map((th, i) => ({idx: i, text: th.textContent.trim()}));
  return { count: headers.length, sample: headers.slice(0, 5), all: headers };
})();
```
Confirm the claim (count, duplicates, missing names, etc.) against BOTH sites where possible; divergence ≠ new-site bug unless both LR-034 and ALL-024 hierarchy agree.

**Tier B (single-step behavioral)** — fresh page, install fetch interceptor (LR-033), change ONE field, save, observe DOM + network + console.

**Tier C (multi-step behavioral)** — `READ VERBATIM → ISOLATION → FULL STEPS → MINIMIZE`:
1. **READ** `stepsToReproduce` verbatim.
2. **ISOLATION GATE**: change ONLY the field under test (skip setup from the bug). Save. If saves fine in isolation → verdict **FALSE**, RCA category `ISOLATION`.
3. **FULL STEPS**: if isolation blocked, follow filed steps exactly on fresh page. If no symptom → FALSE (pick RCA: HALLUCINATION / ENVIRONMENTAL / MISREAD / STALE).
4. **MINIMIZE** (if CONFIRMED): remove setup steps one at a time to find the shortest repro. Emit `## Minimal repro found` note if shorter than filed.

Record verdict: `CONFIRMED` / `FALSE` / `INCONCLUSIVE`.

### Substitution loop

- **CONFIRMED** → slot into final N.
- **FALSE** → drop. Mini-RCA categorize (ISOLATION / HALLUCINATION / MISREAD / ENVIRONMENTAL / STALE / ROLE-OR-OFFICE-DEPENDENT). Emit in `## Auto-dropped false positives` with source BUG ID + category + one-line evidence + close-recommendation. Then pick next from pool and verify — **but ASK USER FIRST** before pulling a pool replacement (same preview pattern as Phase 4.5).
- **INCONCLUSIVE** → drop. Flag in footer with evidence gap.

### Budget

- Max 8 verifies per invocation.
- Max 5 min Tier A, 10 min Tier B, 15 min Tier C.
- Total > 30 min → stop, emit partial.

### Hard gate

Final output NEVER includes a question not **CONFIRMED on live Chrome this invocation** (unless user-supplied — flagged `[user-supplied]`, skipped Phase 5).

---

## Phase 6 — Compact output

### Translation table
| Internal | Plain |
|---|---|
| subplan IDs, LR-NNN, PRC-BUG-X, BUG-XXX-NNN | drop from body (keep in `more-detail` footer) |
| "phantom row" / "phantom cluster" | "empty columns that never fill in" |
| "NOT-TRACKED" / "audit-trail gap" | "this change doesn't show up in history" |
| "87-column history" | "the History page that logs every change" |
| "save-cycle" | "a save" |
| "MCP-verified" | drop (internal detail) |
| "data-testid" | "unique labels that help tests find fields" |
| "office 1604" | "our test location" |
| "aria-invalid" / "aria-required" | "error indicator" / "required indicator" |

### Output format — per question (COMPACT)

```
**Q<n> [P<priority>]** <One-sentence observation — concrete counts OK, framing adverbs out.>
<One-sentence question — single clause, no guiding parentheticals.>
```

**HARD rules**:
- Max 2 short sentences per Q. No paragraphs. No sub-bullets.
- **Strip** `**What we want back:**` line.
- **Strip** guiding parentheticals ("(like Add/Remove a Pricing Strategy)", "(admin-only screen)").
- **Strip** confidence framing ("we can see both right now", "in every single save we've tested"). Keep concrete numbers, drop adverbs.
- **Strip** theme headings. Flat `Q1 Q2 Q3` with priority tags only.
- **Strip** "Filed locally as: BUG-XXX" from body (move to `more-detail` footer).

Below the Qs:
- `## Auto-dropped false positives` — only if any dropped. Source BUG ID + RCA category + evidence + close-reco.
- `## Source refs` — `more-detail` only. Per-Q source file:line + verify timestamp + verdict.
- Rutvik footer: `[Mode: <MODE>] [N: <n>]`, candidate counts, kill-list counts, budget used.

---

## Phase 7 — Submit confirm + record (NEW — user directive 2026-04-23)

After Phase 6 output, ask exactly once:

> **Submit these to Encore QA? (yes / no)**

Then STOP and wait.

- **yes** → for each surfaced Q, append to `.claude/state/encore-questions-submitted.json` (create file as `[]` if missing):
  ```json
  { "key": "<slug>", "question": "<compact text>", "submittedDate": "<YYYY-MM-DD>", "sourceRef": "<file path>" }
  ```
  Echo: `Recorded <N> questions to submitted queue. They won't re-surface until /encore-questions resolve <key>.`

- **no** → do nothing. Echo: `Held. Nothing recorded.`

- **"yes except Q2"** → record only the subset the user approved.

User-supplied Qs (from Phase 4.5) follow the same submit-confirm.

---

## Resolution cross-check (passive — best-effort)

The skill does NOT auto-scan every user message. But when the user pastes Jira text, email content, verbal update, or any new info that plausibly answers a submitted Q, Claude should:
1. Read `.claude/state/encore-questions-submitted.json`.
2. Substring-match the feed against each entry's `question` text (simple keyword overlap is enough).
3. If a likely match → say: `Looks like this might answer submitted Q "<key>". Mark resolved? (yes/no)`
4. On yes → run `/encore-questions resolve <key>` internally.

Missing a match is fine — user can always invoke `resolve` manually. Bookkeeping issue, not blocking.

---

## Sub-commands

### `/encore-questions submitted`
Read-only. Print `.claude/state/encore-questions-submitted.json` as a numbered list:
```
Pending submitted questions:
  1. <key> — <first 80 chars of question> (submitted <date>)
  2. ...
```
If file missing or empty: `No questions currently pending.`

### `/encore-questions resolve <key-or-snippet>`
- Load submitted.json.
- Find entry where `key` or first 40 chars of `question` contains the snippet (case-insensitive).
- If 0 matches → echo "No match. Try `/encore-questions submitted` to see keys."
- If >1 matches → list them, ask which index to resolve.
- If 1 match → remove from JSON, write back. Echo `Resolved: <key>. Removed from queue.`

### `/encore-questions reset`
- Confirm once: `Clear all <N> pending questions? (yes/no)`
- yes → overwrite file with `[]`. Echo `Cleared.`
- no → do nothing.

---

## State file schema — `.claude/state/encore-questions-submitted.json`

```json
[
  {
    "key": "short-slug-identifier",
    "question": "<one- or two-sentence compact Q text as shown to QA>",
    "submittedDate": "YYYY-MM-DD or 'earlier (pre-skill, manual)'",
    "sourceRef": "path/to/source/file.md"
  }
]
```

Rules:
- Flat array. No nesting. No nested state.
- `key` is a short slug (kebab-case, <40 chars). No collisions — if same-key re-submitted, skip (already pending).
- File missing → treat as `[]`. Don't auto-create on read.
- File writes: JSON.stringify with 2-space indent for human readability.
- User may edit or delete the file directly. Skill re-reads on each invocation.
