---
name: feedback_gate_push_on_denylist
description: "When scripting a deliverable push, the git push MUST be conditional on the deny-list exit code — never echo-and-continue"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 03979bc3-9b1e-4137-9efb-f9aeaf67aec2
---

When scripting a notes/client-deliverable push to `encore_deliverables_test`, the `git push` MUST be hard-gated on the `verify-no-forbidden.mjs` exit code (`if [ $DENY -ne 0 ]; then exit 1; fi` BEFORE the push). Never just `echo deny_exit=$?` and let the script continue.

**Why:** On 2026-06-02 a push script printed `deny_exit=1` but had no gate, so it pushed anyway — leaking `specs_planning/_internal/walk-evidence-*.md` internal-path comments (added by the user's fresh page-object edits) to the `notes` branch. Remediated by sanitizing the path token in the shipped copies, then squashing the branch to a single clean commit via `git checkout --orphan` + force-with-lease.

**How to apply:**
- Run `verify-no-forbidden --target` on a CLEAN extract of the shipped set — `git archive HEAD | tar -x -C <tmp>` — NOT on the scratch dir after `npm install`/`git init`. A polluted scratch yields false positives (`JBS` in `.git/config`, `OWNER` inside `node_modules/allure-*`, `.claude/` inside `node_modules/playwright`) that mask or confuse the real result.
- Gate the push on that clean-set result; push only on exit 0.
- If a leak already reached the remote, sanitize + collapse history to one clean commit (orphan) so the internal token isn't reachable via `git log`, not just off HEAD.

The exact gated, copy-pasteable procedure now lives in `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md` § "Variant: Notes-only temp push" — follow it rather than re-improvising a script. The rule-level WHY (scratch-init pushes have no pre-push hook, so the manual gate is load-bearing) is in LR-049's "scratch-init caveat" (`.claude/rules/pipeline.md`).

Pairs with [[feedback_no_token_burn_on_rediscovery]] (the notes-push procedure is now a stable runbook) and LR-049 (ship via git archive).
