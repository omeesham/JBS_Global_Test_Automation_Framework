# SUBPLAN SP-PWC2-00: Research + Verify Researcher Claims (kill-switch gate)

**Status**: DONE
**Executed**: 2026-04-24
**Priority**: P0
**Created**: 2026-04-24
**Parent**: [PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md](PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md)
**Depends on**: none (first gate)
**Blocks**: SP-PWC2-01, SP-PWC2-02, SP-PWC2-03, SP-PWC2-04, SP-PWC2-05, SP-PWC2-06, SP-PWC2-07

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

*Thinking justification*: Multi-source web synthesis + adversarial claim verification. Downstream 7 subplans rest on these claims. If the 4× token win doesn't hold on our workload, V2 is re-planned. Opus + xhi for judgment about which claims to trust and which to flag UNVERIFIED.

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_PWC2_00_RESEARCH_AND_VERIFY_CLAIMS.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /research, /execute
**Context files** (read before Phase 0):
- `plans/pending/PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md` (parent — claim table)
- `plans/pending/PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md` (V1 — citations to corroborate or refute)
- `docs/read_only_docs/MCP_BROWSER_GUIDE.md` (current MCP baseline we're replacing)
- CLAUDE.md LR-038 (existing browser tool matrix — for terminology consistency)

**Phase 0 directive**: WebFetch each source in the parent claim table. Don't paraphrase from the researcher's summary — go to the primary.

**Handoff sequence**:
- Artifact: `docs/read_only_docs/CLI_BROWSER_GUIDE.md` with every claim labeled CONFIRMED / PARTIALLY CONFIRMED / UNVERIFIED + citation link.
- Activity-log row (LR-037) listing the guide path + verdict summary.
- Chat: one-paragraph summary of which claims survived and which did not.
- `/final-q` GREEN/YELLOW/RED verdict.

**HALT conditions**:
- If ≥2 load-bearing claims (CLI token savings, CLI exists, Chrome has SSO inheritance) flip UNVERIFIED → HALT; V2 plan re-evaluation before any downstream subplan starts.
- If primary sources contradict the researcher's numbers by >2×, HALT and surface the gap to user.

---

## Purpose

Kill-switch gate. Every researcher claim in the V2 plan is re-fetched from its primary source. Unverified claims are labeled, not silently dropped. Output is the canonical reference document `CLI_BROWSER_GUIDE.md` that downstream subplans (SP-PWC2-01 LR-038 rewrite, SP-PWC2-03 agent rewrite) will cite.

No code touched. No rule rewritten. This is research-only, zero-blast-radius.

## Step-by-step

1. **Phase 0 — Claim inventory**: extract all 10 claims from parent plan's validation table. Note which carry load (thesis-critical) vs which are nice-to-have.
2. **WebFetch primary sources** (parallelize):
   - playwright.dev/agent-cli/introduction → confirm CLI exists, YAML-on-disk, `show` dashboard
   - github.com/microsoft/playwright-cli README → positioning language + command surface
   - Microsoft benchmark blog or testcollab post → 114K vs 27K number
   - scrolltest.medium.com (Pramod Dutta) → reproduction of 4× benchmark
   - claude.com/claude-for-chrome + code.claude.com/docs/en/chrome → no-headless, Chrome/Edge only, SSO inheritance, version floor
   - Outpost post on CLI wall-clock (if still reachable) → 2-3× slower claim
3. **Write `docs/read_only_docs/CLI_BROWSER_GUIDE.md`** with sections:
   - Executive summary (when CLI wins, when Chrome wins, when neither)
   - Command surface reference (CLI command → equivalent MCP/Chrome call)
   - Authentication story (`state-save` for CLI, live session for Chrome)
   - Performance claims table (each claim + CONFIRMED/UNVERIFIED + citation link)
   - Known limitations of each tool (CLI blind to pixels; Chrome no headless)
   - Troubleshooting (Chrome connection drop protocol, CLI auth refresh)
4. **Label UNVERIFIED claims explicitly**. Don't rewrite them, don't drop them — flag them so future agents know not to cite them as fact.
5. **Cross-check with MCP_BROWSER_GUIDE.md** to ensure terminology is consistent (e.g., "snapshot" means the same thing in both).
6. **Activity-log row** + chat handoff summarizing kills (if any) and surviving claims.

## Acceptance criteria

- [ ] `docs/read_only_docs/CLI_BROWSER_GUIDE.md` exists.
- [ ] ≥6 claims from parent table carry explicit CONFIRMED verdict + citation link.
- [ ] UNVERIFIED claims are labeled as such (not silently removed).
- [ ] Executive summary states the CLI-vs-Chrome task matrix in one paragraph (seed for LR-038 v2).
- [ ] No code files touched (grep: only the new `.md` was created).
- [ ] Activity-log row per LR-037.
- [ ] `/final-q` verdict emitted.

## Handoff

Next: SP-PWC2-01 (LR-038 v2) consumes this guide's task-matrix section. Chat summary: "Research complete. N claims CONFIRMED, M UNVERIFIED. V2 thesis {holds|at-risk}."

---

## Execution Summary (2026-04-24)

**Verdict**: GREEN — 0 UNVERIFIED in LB1-LB7 (the HALT set). V2 thesis **holds**. Downstream SP-PWC2-01..07 may proceed.

**Claims implemented** (all 10 from parent §"Researcher claim validation"):

| ID | Verdict | Notes |
|---|---|---|
| LB1 — `@playwright/cli` exists | CONFIRMED | playwright.dev/agent-cli + github.com/microsoft/playwright-cli (v0.1.8, 2026-04-14 release) |
| LB2 — 114K→27K tokens (~4×) | CONFIRMED (with caveat) | Playwright-team benchmark corroborated by Pramod Dutta's independent reproduction (~89K→24K, same ratio); single-source caveat on absolute numbers documented |
| LB3 — YAML snapshot on disk | CONFIRMED | Example output shows `.playwright-cli/page-<ts>.yml` path |
| LB4 — `show` multi-session dashboard | PARTIALLY CONFIRMED | Command exists; "multi-session + remote-takeover" language not on primary this pass — SP-PWC2-07 pilot confirms live |
| LB5 — Chrome/Edge only, no headless | CONFIRMED | Anthropic official docs (code.claude.com/docs/en/chrome) |
| LB6 — Chrome inherits browser session | CONFIRMED | Anthropic official docs: "shares your browser's login state" + pauses on login/CAPTCHA |
| LB7 — Claude Code 2.0.73+ + ext 1.0.36+ | CONFIRMED | Anthropic official docs Prerequisites section |
| NH8 — MCP degrades after ~15 interactions | **UNVERIFIED** | Folk wisdom — no primary source. Carried forward per plan; do not cite as fact. |
| NH9 — Outpost 2-3× wall-clock | CONFIRMED | Outpost post is live (2026-04-03): MCP 80-150s vs CLI 180-350s, one 600s outlier. Root cause: CLI needs 2-3× more tool calls per task. |
| NH10 — "CLI functional / Chrome visual" | DESIGN RULE | Heuristic, not benchmark — adopted as LR-038 v2 organizing principle |

**HALT gate**: 0 UNVERIFIED in LB1-LB7. 1 PARTIALLY CONFIRMED (LB4) — not a HALT input per plan. Contradiction gate: none fired (no source disagreed with any claim by >2×).

**TCs / items deferred**: LB4 is PARTIALLY CONFIRMED rather than fully CONFIRMED — tagged for SP-PWC2-07 pilot to confirm the "multi-session + remote-takeover" language via live CLI inspection. This is a (b) classification per LR-040 (grep-verifiable line item): SP-PWC2-07 must verify `playwright-cli show --help` output includes multi-session and remote-takeover behavior before LR-038 v2 cites it as fact.

**MCP verification**: N/A — BrowserTool:none subplan. All verification via WebFetch.

**Deliverables**:
- Created: `docs/read_only_docs/CLI_BROWSER_GUIDE.md` (6 sections; 10-row verdict table; ~200 lines; serves as canonical reference for SP-PWC2-01..07)
- Terminology divergence footnote added in §2 (MCP "snapshot" = inline tree; CLI "snapshot" = YAML on disk)
- LB2 single-source caveat documented per adversarial spot-check in plan (Pramod's independent reproduction rescues the 4× ratio claim from pure-laundering)

**Rules honored**: LR-020 (all claim IDs + source URLs re-verified against primary sources), LR-027 (this Execution Summary embedded before `git mv` to `plans/done/`), LR-028 (activity-log row appended), LR-035 (plans-reindex post-move), LR-037 (timestamp ≥ all touched file mtimes), LR-038 (BrowserTool:none declared in frontmatter), LR-040 (every claim classified (a)-direct-verified-via-WebFetch or (b)-grep-verifiable-item-in-SP-PWC2-07 — zero phantom hand-offs), LR-041 (opus/xhi/auto honored), LR-042 (/final-q verdict emitted).

**Chat handoff summary**: "Research complete. 6 LB CONFIRMED (LB1-3, LB5-7), 1 LB PARTIALLY CONFIRMED (LB4 `show` dashboard — SP-PWC2-07 pilot verifies), 0 LB UNVERIFIED. 1 NH CONFIRMED (NH9 wall-clock), 1 NH UNVERIFIED (NH8 MCP-degrades-after-15 — folk wisdom), 1 NH is DESIGN RULE (NH10). V2 thesis holds."
