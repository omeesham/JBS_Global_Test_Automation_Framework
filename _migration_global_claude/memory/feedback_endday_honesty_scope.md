---
name: End-day skill — honesty and scope (Encore progress only, don't bank to hide)
description: Client only sees Encore-product progress. Path-allowlist gate (clients/encore/**, tests/**, src/**, website/**) filters EVERY client-audience emission including raw-source fallback paths. Framework internals (.claude/**, plans/**, scripts/**, CLAUDE.md) are NEVER reported AND NEVER banked. Don't use the bank to hide — only bank when Rutvik explicitly asks.
type: feedback
originSessionId: 20553684-0faf-4369-a208-414c24756127
---
**Rule**: End-day status reports ONLY Encore-product progress to the client. Workflow, tooling, framework, Claude-internal work is invisible from the client's view — not reported, not banked. Use the bank sparingly; only bank when Rutvik explicitly asks.

**Why**: Client pays for Encore-product progress (their features, their bugs, their requirements). They don't care about our internal tooling, our rule graduation system, our validation scripts, our planning workflow automation. Reporting workflow items dilutes the real work. And banking workflow items is worse — it's hiding non-client work as a future client claim, which is dishonest. "its not good to hide critical items from client" — Rutvik 2026-04-15. Banking should be used when there's GENUINE extra Encore work to defer, not as a dumping ground.

**How to apply**:

1. **Path allowlist check (STRUCTURAL — runs first, before any judgment)**. For every commit, file, activity-row, or plan being considered for client report, inspect the paths it touched:

   **IN SCOPE (Encore product — eligible for report)**:
   - `clients/encore/**` (all Encore planning, specs, catalogs, requirements, bug reports)
   - `tests/**` (except `tests/examples/`)
   - `src/**` (page objects, selectors, adapters, fixtures used by Encore specs)
   - `website/**` (QA SaaS portion, client-facing)

   **OUT OF SCOPE (framework internals — DROP, never report, never bank)**:
   - `.claude/**` (skills, hooks, agents, state, settings)
   - `plans/**` (planning workflow artifacts — the plan files themselves are internal; the Encore work they describe is reported via the actual code/spec changes under `clients/encore/` or `tests/` or `src/`)
   - `scripts/**` (tooling, reindexers, validators)
   - `CLAUDE.md`, `docs/read_only_docs/**`, `.github/agents/**`, `.githooks/**`
   - Any path under `clients/*/` where the client is NOT the active client

   **Filter rule**: a unit of work is reportable ONLY if it touched at least one IN-SCOPE path AND the IN-SCOPE portion is the substantive change (not a drive-by edit). A commit that touches both framework and Encore paths reports ONLY the Encore portion. A commit that touches zero IN-SCOPE paths = DROP.

2. **Bypass-path discipline**: this path filter applies to ANY client-audience emission — `/end-day`, `/end-week`, `/standup`, `/next-this-week`, AND any manual "just give me a summary" fallback when bank/skill is unavailable. Falling back to raw `git log`, `find -newer`, or activity-log without applying this filter is the exact leak pattern that caused the 2026-04-23 incident. Raw source is never an excuse to skip scope filtering.

3. **Judgment filter (runs after path filter, catches edge cases)**: for items that passed the path filter, ask "is this Encore-product progress?" Rule changes, tooling improvements, framework hardening that happens to touch an Encore path (rare) still DROP.

4. **Bank only when asked**: Rutvik says "bank this" or "save this for later" → bank. Otherwise don't. Default = report what's reportable, drop the rest.

5. **Don't pad with workflow**: if today has only 2 Encore items, report 2 lines or pull from bank. Don't add a workflow filler line to hit 3.

6. **Honest minimization**: it's okay to say today was lighter. It's NOT okay to lie by inflating with workflow items disguised as Encore work. If a whole day was framework-only, the honest answer is "today was internal tooling — nothing shippable on Encore" (and that's fine — don't invent).

**Examples of what NEVER goes to client**:
- Rule graduation (LR-XXX, GEN-XXX, PLN-XXX additions to CLAUDE.md)
- Activity log validation tools, timestamp gates
- Plans INDEX auto-regeneration, GARDENER folder cleanup
- Agent framework improvements, skill authoring, prompt refinement
- Pipeline hardening, quality gates, validation scripts
- Memory file updates, MCP findings documentation

**Examples of what DOES go to client** (Encore progress):
- Feature module work (History, Local Office, Locations, Pricing, etc.)
- Requirements corrections based on Jira/live verification
- Test case specs (creation, upgrade, fix)
- Bug reports filed against Encore app
- Audit of Encore planning docs

**Test**: If the line would make sense to someone who doesn't know Claude Code exists → it's client-safe. If the line requires explaining our internal process → DROP.
