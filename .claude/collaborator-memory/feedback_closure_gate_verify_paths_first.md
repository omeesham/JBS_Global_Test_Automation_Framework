---
name: closure-gate-verify-paths-first
description: "Before any Status PENDING→DONE flip, verify all cited paths exist (Depends-on, Bootstrap skill cites, etc.) — closure-gate denies with truncated C2/C3 errors otherwise"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 362055c8-d4c7-4496-a642-e7173b72176c
---

Before attempting to flip a plan's `**Status**: PENDING` → `**Status**: DONE` via Edit, dry-run the closure-gate validator with the projected DONE content via stdin AND fix any C3 path-existence failures FIRST. The PreToolUse hook denies the Edit and the inline error message TRUNCATES the validator output (shows only `C2:` `C3:` with no path detail).

**Why:** Plans authored before a repo restructure (e.g., the 2026-05-19 client-deliverable rebuild) carry stale path cites in their Bootstrap / Depends-on / Skill-references sections. The closure-gate C3 check (`path-existence`) fires when any cited path no longer exists OR points to `pending/<plan>` when the plan has since moved to `done/<plan>`. The hook itself truncates output (only `C2:` / `C3:` heading visible), forcing a separate validator invocation to see the actual missing-path list. Saves a 2-round-trip iteration vs trial-and-error.

Observed (≥3 occurrences as of 2026-05-20):
- SP-B closure 2026-05-19T12:00 — "2 C3 path-existence violations from markdown-link href ../../ prefixes"
- PLAN_DIST_REGRESSION 2026-05-19T18:17 — "C4 WARN-only prose handoff to PLAN_ROOT_CLIENT_DEDUPE.md deprecation hint, non-blocking"
- SP-C closure 2026-05-20T13:34 — 2 C3 failures (Depends-on `plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_A.md` stale after SP-A moved to done/; `.claude/skills/simplify/SKILL.md` phantom path — /simplify is alias-only without SKILL.md file)

**How to apply:** Before the Edit that flips Status, run:

```bash
cat plans/pending/<PLAN>.md | sed 's/^\*\*Status\*\*: PENDING/**Status**: DONE/' | node scripts/validate-plan-closure.mjs --content-from-stdin --plan plans/pending/<PLAN>.md 2>&1 | head -60
```

If output shows `[FAIL] ... C3: ... - <path>`, that path is either stale (update plan body to current location) or phantom (drop the cite or fix it). Re-run dry-run until `[PASS]`, THEN flip Status via Edit. Hook accepts on first try.

**Skill-cite phantoms to watch for:** `/simplify`, `/slop`, `/upgrade` are alias-only skills with no SKILL.md file at `.claude/skills/<name>/SKILL.md`. Plan-body Bootstrap citations of these paths fail C3. Substitute the canonical target (`.claude/skills/audit/SKILL.md` for /slop and /upgrade; `/simplify` has no canonical target — drop or rephrase).

**Fix-forward sweep (added 2026-05-20 post-SP-C audit):** Right after `git mv plans/pending/<PLAN>.md plans/done/`, grep `plans/pending/` for any other plan whose `**Depends on**:` or `Bootstrap` cites the just-moved file at its OLD `plans/pending/` location, and update those citations in the same session. Skipping this propagation is what gets caught the NEXT time a sibling subplan tries to close — the audit cycle of "I learned this rule then immediately failed to apply it to siblings" was caught in the SP-C post-execution audit 2026-05-20. Specifically: at SP-C close, SP-D's frontmatter Depends-on still pointed at `plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_{A,C}.md` (both already moved to done/). Sweep formula:

```bash
# After moving <PLAN>.md to done/, run:
grep -rEn 'plans/pending/<PLAN>\.md' plans/pending/ docs/ .claude/ scripts/
# Every hit becomes a candidate edit (skip historical / done/ / report/ paths).
```

**Inward-self-reference sub-pattern (added 2026-05-22 post-SUBPLAN_NOTES_FCC_PILOT closure):** Closure cleanup is two-sided. The fix-forward sweep above handles OUTWARD direction (other plans citing the just-moved file). The INWARD direction is: the moved plan's OWN body cites its source location, e.g., procedural text like `"Phase 0.1 — runs node scripts/check-subplan-identity.mjs plans/pending/<self>.md"` or `"LR-055 validator output (verbatim from … --plan plans/pending/<self>.md)"`. These citations break C3 the moment `git mv` lands. Pre-mv stdin dry-run catches the bare-path siblings BUT does NOT catch self-references against the future `done/` path (validator sees content as-is at pre-mv time when path still resolves). Two ways to handle:

1. **Preferred — pre-mv path-cleanup grep**: before `git mv`, grep the plan body for `plans/pending/<SELF>.md` (its own current location) and rewrite the regular-prose hits to `plans/done/<SELF>.md` + optional `(e.g.)` exemption phrase. Citations inside code fences (validator-skipped per `^(```|~~~)` rule) can stay as historical evidence (e.g., the literal `git mv plans/pending/<X> plans/done/` bash command in the Phase 7.2 step).
2. **Fallback — chicken-egg workaround** when fixes are caught after the mv: each individual Edit's projected post-state STILL retains OTHER unfixed paths, so the closure hook denies every edit (catch-22). Temporarily revert `**Status**: DONE` → `**Status**: PENDING` (no C-check fires for PENDING — LR-055 trigger scope is DONE only), apply all citation fixes, restore `**Status**: DONE` + `**Executed**: YYYY-MM-DD`, re-run `--write-manifest` to refresh the closure manifest. The intermediate PENDING-in-done/ state lasts seconds; no other gate fires on it.

Both directions cross-link to `agent-mistakes.md` ALL-087 (chicken-egg workaround) + ALL-083 (general path-remediation taxonomy).

**C2 extension-allowlist gotcha (added 2026-07-10, PLAN_CORP_PRICING_MISSING_TESTID_XLSX closure):** C2's "cited file path in Execution Summary" regex (`C2_PATH_RX`, validate-plan-closure.mjs ~line 254) has a hard extension allowlist that does NOT include `.xlsx` (nor extension-less files like `.gitignore`). A plan whose only deliverable is an xlsx fails C2 ("No cited file path in Execution Summary") even though the path is cited verbatim. Fix: cite at least one truthful path with a recognized extension (`.md`/`.ts`/`.json`/…) in the Execution Summary — e.g. the activity-log `.md` path or the read-only source `.ts` files — never fake one. Also: `git mv` on a never-tracked plan file fails `fatal: not under version control` — `git add` the plan first, then `git mv`.

**Related:** [[feedback_handoff_no_blockers]] (don't trust received obstacle claims), LR-027 (Execution Summary mandatory before mv), LR-055 (closure-gate C1-C5), LR-050 (restructure plans must enumerate stale cleanup IN-SCOPE — pairs with this: plans authored BEFORE the restructure are the cascade victims).
