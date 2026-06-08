# Field-Case Generation Templates

> Per-field-type case taxonomy for authoring FCC (Field-Case Coverage) blocks.
> Companion to bug-archetypes.md (probe → bug) and tc-authoring-rules.md (text hygiene).
> Synthesized 2026-05-19 from external QA framework guide + existing ARCH-NNN archetypes.

## How to use
1. Read the field-inventory artifact for your module to enumerate field types.
2. For each field, look up its type in §2 → grab the case-template row.
3. Drop each case into your spec's FCC describe block via `saveAndVerifyCase()` (clients/encore/src/core/field-case-runner.ts).
4. Run each case as its own independent test. Each: baseline → act → save → reload → verify → cleanup.
5. Existing module TCs stay at the BOTTOM of the spec — FCC is additive, not destructive.

## §1 — The 3-tier save verification framing
- **Tier 1** (BASELINE, always required): UI cache invalidation via page reload + re-navigation + DOM read of persisted value. Implemented today via `reloadAndNavigateTo*Tab()` page-object helpers.
- **Tier 2** (RECOMMENDED, partial today): Network response check — POST/PUT/PATCH returned 2xx, response body reflects committed payload, server-generated metadata (timestamps, version hashes) present. `clickSaveWithDialog()` captures errors; explicit payload-structure assertions are an FCC follow-up.
- **Tier 3** (FUTURE, out-of-scope now): Direct DB query. Framework has no DB access from test suite. Note as aspirational.

## §2 — Per-Field-Type Case Templates

| Field type | Positive cases | BVA cases | Negative cases | Save-cycle cases |
|---|---|---|---|---|
| Plain text | 1-char, mid, max-1 chars | empty, max, max+1 (paste) | special chars, whitespace-only, newline, leading/trailing space | new fill, edit overwrite, append, prepend, partial-replace, clear |
| Numeric / spinbutton | min, mid, max | min-1, max+1, decimal-step boundary | "abc", "1.2.3", "-5" if positive-only, leading-zero, scientific notation | new fill, edit, revert-to-original-disables-Save (LR-009) |
| Password | meets all policy criteria | min length, max length | missing-lower, missing-upper, missing-digit, missing-special; copy-paste in confirm | typically no per-field save — covered in user creation flow |
| Checkbox (native + Radix) | check, uncheck | n/a | n/a | toggle on→save, toggle off→save, toggle-then-revert (Save stays disabled per LR-009) |
| Dropdown / combobox (Radix) | each documented option | first option, last option (LR-025 retry for 50+ options) | invalid value via DOM tamper → server rejection | each-option save+reload |
| Cascading dropdown | parent→child population | empty child when no parent | invalid pair via API bypass | parent A → child A1 save; switch parent A→B, verify child resets |
| Multi-row FormArray (e.g. Notes) | 1 row, 2 rows, N rows | empty row, max-row content, +1 over limit (paste) | special chars, newlines, unicode, html-as-text | add+save, edit+save, delete-first/middle/last+save, clear+save, delete-all+save |
| Date / offset | valid range mid | min boundary, max boundary, ±1 day | invalid format, negative offset where positive-only (LR-008), Delivery < Prep (NM-1264) | each constraint-violation reverts; valid saves+reloads |
| File upload | valid file at half-max size | empty file, exact-max byte count, +1 byte | spoofed-extension (.exe→.png), invalid MIME, cancellation mid-stream | (future — no current Encore module uses) |
| Rich text / WYSIWYG | plain text save | formatting combinations (bold/italic/list) | XSS script tag (stored as literal), oversized payload | (future — no current Encore module uses) |

## §3 — Cross-refs (probe / rule companions)
- Archetypes (probe form): bug-archetypes.md ARCH-002 (non-numeric), ARCH-005 (parent-child cascade), ARCH-009 (missing-cascade), ARCH-010 (boundary/format), ARCH-013 (save-cycle 6-state), ARCH-014 (cross-field 6-dim)
- LR rules: LR-008 (date positivity), LR-009 (revert-to-original Save state), LR-010 (async cross-field validation poll), LR-011 (NaN reload), LR-022 (no hardcoded counts), LR-025 (Radix large-dropdown retry), LR-026 (dirty-state defensive reload), LR-051 (no OR-expression asserts), LR-052 (no fixed waitForTimeout in poll), LR-053 (no strict row count w/ placeholder bug)
- Authoring hygiene: tc-authoring-rules.md Rules 1–5
- Runner: clients/encore/src/core/field-case-runner.ts
- Source: external QA framework guide (digested 2026-05-19 — see PLAN_BIG_PIVOT_FCC_MASTER and SUBPLAN_NOTES_FCC_PILOT)

## §4 — Promotion criteria
- When a second client lands → promote this doc to `docs/read_only_docs/FIELD_CASE_GENERATION.md` (framework level).
- When a new field type appears in any module → append a row to §2 with positive/BVA/negative/save-cycle templates.
- When a new ARCH-NNN archetype lands in bug-archetypes.md and overlaps a row in §2 → cross-link.
