# PLAN — Permanently scrub internal references from the Encore deliverable source

**Status**: DONE
**Executed**: 2026-06-10
**Identity**: OWNER (non-pipeline deliverable maintenance)
**PermissionMode**: execute

## Context

The Encore client deliverable ships via `git archive HEAD clients/encore/` (tracked files
only, LR-049). A prior closure audit scanned only the exported workbook cells for internal
jargon — it never scanned source-file comments (`.ts` / `.spec.ts` / page / selector / data /
config / README). This plan closed that gap, untracked the internal planning folder, and added
a standing gate so the jargon can never re-ship.

What ships: `clients/encore/{src,tests,config,test_cases_xlsx}/` + root files
(`package.json`, `playwright.config.ts`, `tsconfig.json`, `.gitignore`, `README.md`, `.env.e2e`).
What does not (gitignored): `CLAUDE.md`, `specs_planning/`, `readable_externals/`, `docs/`,
`.auth/`, `.env.*.local`.

### Decisions locked with the user
1. **Commit structure:** ONE finished-work baseline commit (CP feature + the completed
   XLSX-revert-recovery work — they share the regenerated workbook, so they cannot be split),
   then the jargon scrub + untrack as a second commit, then the gate as a third.
2. **Jargon scope:** full — all affected shipped source files.
3. **Rewrite style:** keep the plain-English "why"; KEEP `NM-####` (Encore's own Jira IDs).
4. **Permanent prevention:** add a standing gate so the jargon can never ship again.

## Execution Summary

**Three commits on `client_deliverable`:**

| Commit | SHA | Contents | Gates |
|---|---|---|---|
| 1 — baseline | `7ccc5563` | Finished CP Wave-1.5 work (Override/New-Pricebook/Toolbar-IO + Search field-coverage) + completed XLSX-revert-recovery (tc-parity guardrails, xlsx-lint, TestRail regen) + the 7 Tier-A hard-token fixes (5 files) + `.gitignore`/`navigation.md`. 48 files. | parity / activity-log / closure / xlsx-vocab / deny-list — all passed |
| 2 — scrub + untrack | `35c9c24c` | Tier-B jargon scrub in 47 shipped files (comments/JSDoc text only) + `git rm -r --cached specs_planning/` (53 files untracked, kept on disk). | deny-list / parity passed; no A/R, only M+D |
| 3 — gate | `592fc2bf` | `SOURCE_COMMENT_JARGON` array in `scripts/verify-no-forbidden.mjs` (root, never ships) + `.xlsx` binary-skip in `checkTarget`. | deny-list passed (self-skip) |

**TASK 1 — untrack `specs_planning/`:** `git rm -r --cached` removed 53 tracked files from the
index; all remain on disk; already gitignored so they will not re-track. `git ls-files
specs_planning/` = 0 in HEAD.

**TASK 2 — Tier-A hard tokens (7 occurrences / 5 files, comments only):**
`common.ts:102/104/105` (3× `SUBPLAN_…` band parentheticals stripped), `toolbar-io.ts:8` and
`toolbar-io.spec.ts:12` (`SUBPLAN_CORP_PRICING_EDGE_P3` → "a later edge-case test phase"),
`new-pricebook.spec.ts:16` (`specs_planning/…md` path removed), `override.spec.ts:215`
(whole comment rewritten to drop `agent-mistakes.md` + `§2.1` + `field-case-generation.md`).
These rode Commit 1 because the pre-commit `--staged-diff` hook blocks any client file still
carrying a hard token.

**TASK 3 — Tier-B jargon sweep (comments/JSDoc text only):** 46 shipped files rewritten —
internal rule IDs (`LR-###`, `ALL/AUD/PLN/GEN/HLR-###`, `REQ-###`), section refs (`§`),
doctrine (`Doctrine N`), wave/phase/question IDs (`Wave-1.5`, `WV15`, `W15-A/B`, `Q-WV#`,
`CPR-####-Q#`, `EDGE_P3`), artifact names (`walk-evidence`, `field-inventories`,
`rejection-affordance`), `recon`, test-sense `oracle`, `playwright-cli`, `Path C/D`, `F11`,
internal `.md` paths — all rewritten to client-neutral, technically-accurate prose.

**Permanent prevention:** `SOURCE_COMMENT_JARGON` added to `verify-no-forbidden.mjs` (the single
source of truth for what must never ship), scoped to client-shipping paths exactly like
`MARKER_GREP_CLIENT_ONLY` (every file in `--target`, every `isClientShipping()` file in
`--staged-diff`). Fail-green: every pattern confirmed 0 occurrences in the clean post-scrub tree.
Deliberately excluded (false-positive / kept-by-decision): `NM-####`, `oracle`, `recon`, `FCC`
(`@fcc` tags + describe titles), `Path [C-Z]` (Windows `D:\`), `F11`, `field-case-runner.ts`
(a real shipped filename).

**Deviations logged:** (a) two string-literal edits (an Error message + a `Log.warn`) shed an
`LR-0##` token — behavior-neutral diagnostic text, no test asserts on them, required for the gate
to be fail-green; (b) the `.xlsx` binary-skip added to `checkTarget` (companion fix so the gate's
single-char `§` pattern can't false-positive on the packed workbook).

**Verification (all PASS):**
1. `git archive HEAD clients/encore/ | tar -x` → `verify-no-forbidden --target` → **exit 0** (116 files).
2. `node scripts/xlsx-vocab-lint.mjs` → **0** forbidden.
3. `cd clients/encore && npx playwright test --list` (local env) → **546 tests / 20 files**, no import errors (= baseline; comment edits + 2 title strips compile clean).
4. Commit 2 diff = **47 M (comment text) + 53 D (untrack)**, zero A/R — comment-only + untrack.
5. `git ls-files specs_planning/` = **0**; files still on disk.
6. Gate proven: injected `// LR-999` into the extract → **exit 1** naming the file; clean tree → exit 0.

### Out of scope / notes
- The 2 test-title strips were `corporate-pricing-override.spec.ts:80` (`(LR-036)`) and `:201`
  (`(LR-011)`) — TC-IDs unchanged, parity intact.
- `package-lock.json` / config / README all swept clean.
- The CP-landing commit committed the full current CP snapshot incl. the now-complete 1445 Search work.
