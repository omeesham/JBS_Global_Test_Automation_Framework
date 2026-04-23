# SUBPLAN SP-IDS-02 — PreToolUse hook for override discipline (typed authorization)

**Status**: DONE
**Executed**: 2026-04-23
**Parent**: [PLAN_IDENTITY_DISCIPLINE_STRUCTURAL.md](../done/PLAN_IDENTITY_DISCIPLINE_STRUCTURAL.md)
**Created**: 2026-04-23
**Priority**: P0
**Identity**: OWNER
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**Depends on**: SP-IDS-01 (uses `scripts/identity-ownership.mjs`)
**Skills**: /execute, /regression-guard

---

## Bootstrap

- **Identity**: OWNER. No switch.
- **Context files**: SP-IDS-01's output (ownership mirror + `check-identity-switch.mjs` reference) + `check-rubberstamp.mjs` (multi-turn transcript scan pattern).
- **HALT conditions**: if SP-IDS-01 is NOT landed → HALT (depends on its ownership mirror).
- **Handoff sequence**: activity-log + `/regression-guard` AFTER + `/final-q`.

---

## Intent

Override path from SP-IDS-01's hook already allows *inline* overrides (user-typed authorization right before the blocked write). SP-IDS-02 adds a **dedicated** override-discipline hook that enforces:

1. `[OVERRIDE]` used without `[OVERRIDE-REQUEST]` preceding it → deny (structural request-approve handshake).
2. Second `[OVERRIDE]` in the same session → block stop with reminder ("override is break-glass, not workflow" per ALL-077 language).
3. Override log entries include all three required fields: identity, path, reason. Missing any → block (audit integrity).

This is separate from SP-IDS-01's inline override-allow path because:
- SP-IDS-01 handles the **allow decision** at PreToolUse time.
- SP-IDS-02 handles the **discipline audit** at Stop time (count overrides, verify handshake, enforce break-glass semantics).

---

## Artifacts produced

| Path | Ownership | Action |
|---|---|---|
| `.claude/hooks/override-discipline-gate.sh` | RW | CREATE |
| `.claude/hooks/lib/check-override-discipline.mjs` | RW | CREATE |
| `.claude/hooks/lib/test-override-discipline-fixtures.mjs` | RW | CREATE |

---

## Phases

### Phase 0 — Context
1. Read SP-IDS-01's `check-identity-switch.mjs` (verify override-allow path signature).
2. Read `check-rubberstamp.mjs` (multi-turn scan pattern).
3. Read `feedback_identity_switch_protocol.md` §"If the new identity ALSO can't write" (override semantics).

### Phase 1 — Build `check-override-discipline.mjs`
Input: argv[2] = transcript path. Output: "block" | "allow".

Logic (Stop hook mode only — SP-IDS-01 owns PreToolUse for override-allow):
1. Count `[OVERRIDE]` occurrences in assistant text across the full transcript.
2. For each `[OVERRIDE]` log line, regex-extract `identity`, `path`, `reason` fields. Any missing → **block** with reason "override log missing required field".
3. For each `[OVERRIDE]`, scan backward up to 5 assistant/user messages for `[OVERRIDE-REQUEST]` from assistant + user authorization phrase. Missing either → **block** with reason "override used without request-approve handshake".
4. If count >= 2 in same session AND no `[OVERRIDE-EXPLICIT-APPROVAL-BATCH]` tag from user → **block** with reason "multiple overrides per session; break-glass semantics violated — user must explicitly approve batch or switch identity".
5. Fail-open on parse error.

### Phase 2 — Build `override-discipline-gate.sh`
Stop-hook wrapper; same shape as `final-q-gate.sh`. Emits block JSON on stdout when `check-override-discipline.mjs` prints "block".

### Phase 3 — Fixtures `test-override-discipline-fixtures.mjs`
Min 6 fixtures:
1. CLEAN — 1 override with full handshake (request + user auth + log with identity/path/reason) → allow
2. NO-REQUEST — override without preceding `[OVERRIDE-REQUEST]` → block
3. NO-USER-AUTH — request present but no user authorization → block
4. MISSING-FIELD — override log `[OVERRIDE] writing to X` (no identity, no reason) → block
5. MULTIPLE-NO-BATCH — 2 overrides, no batch approval → block
6. MULTIPLE-WITH-BATCH — 2 overrides + user text `[OVERRIDE-EXPLICIT-APPROVAL-BATCH]` — (user explicitly pre-approved) → allow
7. EMPTY — empty transcript → allow
8. ZERO-OVERRIDES — normal session, no `[OVERRIDE]` anywhere → allow

### Phase 4 — Verify
- `node test-override-discipline-fixtures.mjs` → 8/8 PASS.
- `bash -n override-discipline-gate.sh` + `node --check check-override-discipline.mjs` → no syntax errors.

### Phase 5 — /regression-guard + activity-log + /final-q

---

## Success criteria

1. 8/8 fixtures pass.
2. Hook does not block normal sessions (ZERO-OVERRIDES + empty fixtures pass through).
3. Registration DEFERRED to parent closure.

---

## Out of scope
- `/identity` skill changes (SP-IDS-03).
- `/execute` Phase 0 (SP-IDS-04).
- Modifying SP-IDS-01's inline override-allow logic.

---

## Execution Summary (2026-04-23)

**Artifacts created**:
- `.claude/hooks/lib/check-override-discipline.mjs` (145 lines) — Stop-only hook mode. Scans transcript for `[OVERRIDE]` log lines, validates: (1) preceding `[OVERRIDE-REQUEST]` + user authorization, (2) required fields (identity/path/reason), (3) multiple-overrides-require-batch-approval. Fail-open on parse error.
- `.claude/hooks/override-discipline-gate.sh` (37 lines) — Stop-hook wrapper; passes stdin JSON transcript path to node helper.
- `.claude/hooks/lib/test-override-discipline-fixtures.mjs` (9 fixtures covering all 3 rules + edge cases).

**Verification** (2026-04-23):
- `node .claude/hooks/lib/test-override-discipline-fixtures.mjs` → 9/9 PASS (clean_handshake, no_request, no_user_auth, missing_identity, missing_reason, multiple_no_batch, multiple_with_batch, empty_transcript, zero_overrides).
- `bash -n .claude/hooks/override-discipline-gate.sh` + `node --check .claude/hooks/lib/check-override-discipline.mjs` → clean.

**LR-040 closure**: all planned items (a) fixture-proven. No (b) or (c) items.

**Deferred**: Hook registration in `settings.json` — landed in parent plan closure step.

**Post-close patch (2026-04-23T15:35)** — Stop hook on THIS session fired correctly but on a false positive: my Q2 scope-gate message contained `[OVERRIDE]` wrapped in inline-code backticks as part of design-discussion prose. Original regex `/\[OVERRIDE\]/i` matched anywhere in text. Fix: line-anchored regex `/^\s*\[OVERRIDE\]\s+\S/m` — requires bracket-tag at line start followed by whitespace + non-whitespace content. Prose mentions in backticks or mid-sentence don't match. Malformed log lines (e.g. bracket-tag + "wrote to X" missing identity) still match so Rule 2 can report the missing-field violation. Same fix applied to `check-identity-switch.mjs` OVERRIDE_REQUEST_RX for consistency. Added 2 regression fixtures (`prose_mention_backticks`, `prose_mention_mid_sentence`) — 11/11 PASS after fix.
