# PLAN: Visual Debug Skill — Give All Agents Eyes

**Status**: pending
**Priority**: HIGH
**Scope**: `.claude/skills/visual-debug/`, agent prompt updates, trace extraction utility, CLAUDE.md routing

---

## Context

Our agents are blind. When tests fail, they read error messages, stack traces, and DOM text — but they never SEE what actually happened on screen. A BA agent proposed a visual telemetry system (wrong implementation — Python test instrumentation) but the core concept is right: agents need visual debugging capability.

**Research confirmed**: 80% of failures are diagnosable from text + DOM alone. But the remaining 20% — layout shifts, element interception, animation timing, visual state mismatches — require EYES. The tiered approach (cheapest analysis first, escalate to visual only when needed) is the proven architecture used by Applitools, Percy, and TestDino.

**What we're building**: A `/visual-debug` skill that gives agents a structured 4-tier debugging protocol, plus a trace extraction utility that pulls key frames from Playwright trace.zip files (which we ALREADY record on failure). Agents can watch the replay, then go live via MCP browser if needed.

---

## BA Proposal Audit Summary

| Aspect | Verdict | Detail |
|--------|---------|--------|
| Core concept (agents need eyes) | KEEP | Right idea, agents are blind for 20% of failures |
| Two-tier capture model | KEEP (adapted) | Becomes 4-tier: text → DOM → screenshot → live debug |
| Before/after screenshots per action | ALREADY HAVE | Playwright traces capture this at every action step |
| Visible change detection | AGENT DOES THIS | Claude is multimodal — it LOOKS at screenshots, no hashing code needed |
| Burst frame capture | KILL | Traces already have frame-by-frame + video on failure |
| Python/pytest implementation | WRONG | Our stack is TypeScript/Playwright |
| Runtime test instrumentation | WRONG | This is a SKILL, not code wrapping test execution |
| S3/blob storage | WRONG | Artifacts already in reports/ via Playwright config |
| AI RCA API call | WRONG | Agent IS the AI — it self-reasons from evidence |
| StepArtifact dataclass | ADAPT | Becomes the skill's mental model, not a persisted data structure |
| Performance guardrails | KEEP | Token budget matters — resize to 768px, crop to region, max 5 images per session |

---

## Architecture: 4-Tier Diagnosis Protocol

```
Test Failure
    │
    ▼
┌─────────────────────────────────────────────┐
│ TIER 1: Text Analysis (FREE - no images)    │
│ Error message + stack trace + test intent   │
│ + pattern match against agent-mistakes.md   │
│ Confident? → Classify + fix → DONE          │
└─────────────────┬───────────────────────────┘
                  │ Not confident
                  ▼
┌─────────────────────────────────────────────┐
│ TIER 2: DOM Analysis (no images, ~2K tokens)│
│ Extract accessibility snapshot from trace   │
│ + DOM diff at failure point                 │
│ + console errors + network failures         │
│ Confident? → Classify + fix → DONE          │
└─────────────────┬───────────────────────────┘
                  │ Not confident
                  ▼
┌─────────────────────────────────────────────┐
│ TIER 3: Visual Analysis (~1600 tokens/img)  │
│ Extract failure screenshot from trace       │
│ Crop to failure region, resize to 768px max │
│ + before/after comparison from trace frames │
│ Confident? → Classify + fix → DONE          │
└─────────────────┬───────────────────────────┘
                  │ Not confident
                  ▼
┌─────────────────────────────────────────────┐
│ TIER 4: Live Debug (MCP browser - full)     │
│ Navigate to failing page in live browser    │
│ Reproduce step by step with screenshots     │
│ Inspect DOM, console, network in real-time  │
│ → Classify + fix → DONE                     │
└─────────────────────────────────────────────┘
```

**Key principle**: Stop at the tier that produces a confident diagnosis. Most failures resolve at Tier 1-2 (free). Only visual/interaction bugs need Tier 3-4.

---

## Deliverables

### 1. Skill Definition: `.claude/skills/visual-debug/SKILL.md`

The core deliverable. ~250 lines. Structured protocol teaching agents:

**Phase 0 — Evidence Intake** (before touching browser):
- Read `reports/failure-summary.json` — failure category, error, selector, console/network errors
- Read the failed spec file — understand test intent and expected behavior
- Read the page object — understand selector used
- Scan `agent-mistakes.md` for matching patterns by failure category
- **Pattern match gate**: If known pattern (LR-009 dirty tracking, LR-010 async validation, LR-011 numeric corruption, etc.) matches with >80% confidence → skip to diagnosis with hypothesis

**Phase 1 — Text + DOM Analysis** (Tier 1-2, no images):
- Extract from trace.zip: action sequence, DOM snapshots at failure point, console log, network log
- Run `scripts/trace-extract.ts` to pull structured data from trace
- Diff accessibility snapshots (pre-action vs post-action from trace)
- Check: element exists? correct role? disabled? aria-invalid? value matches expected?
- Check: console errors during failing action? network 4xx/5xx?
- **Confidence gate**: If diagnosis is clear from text/DOM → report finding, done

**Phase 2 — Visual Analysis** (Tier 3, screenshots from trace):
- Extract failure screenshot from trace.zip (already captured at every action)
- Extract 2-3 preceding action screenshots for context
- Crop to failure region (use element bounding box from trace metadata)
- Resize to 768px max width
- Visually inspect: does the page look right? Layout issues? Error states? Overlapping elements?
- Compare before/after screenshots: did the UI change as expected?
- **Confidence gate**: If visual evidence confirms diagnosis → report, done

**Phase 3 — Live Debug** (Tier 4, MCP browser):
- `browser_navigate` to the failing page URL
- `browser_snapshot` — current accessibility tree
- Reproduce the failing action step by step:
  - `browser_take_screenshot` BEFORE action
  - Perform action (`browser_click`, `browser_fill_form`, etc.)
  - `browser_take_screenshot` AFTER action
  - Compare: did UI change?
  - `browser_evaluate` — inspect element state (disabled, value, computedStyle, z-index)
  - `browser_console_messages` — new errors?
  - `browser_network_requests` — failed calls?
- If no visible change after action: check for element interception (`document.elementFromPoint`), z-index issues, disabled state, pending animations
- **Max 5 screenshot pairs per session** (token budget guard)

**Phase 4 — Diagnosis & Report**:
- Classify: `BUG | UI_CHANGE | FLAKY | SETUP | VISUAL_NOISE`
- Subcategorize: `selector_broken | layout_shift | content_change | timing_race | env_diff | element_intercept | state_mismatch | network_dependent`
- Confidence score: 0-100
- Evidence chain: numbered list of specific observations
- Pattern match: cite agent-mistakes.md rule if matches, flag NEW pattern if novel
- Recommended fix: specific file:line and what to change
- Screenshots: reference saved artifacts in `reports/visual-debug/`

**Skill rules**:
- NEVER skip Tier 1-2. Always try text/DOM first. Visual is expensive.
- NEVER send full-page 1920x1080 screenshots. Crop + resize to 768px max.
- NEVER go to Tier 4 (live MCP) without exhausting Tier 1-3 first.
- NEVER take more than 5 screenshot pairs in one session.
- ALWAYS cross-validate visual claims against DOM state (LLMs hallucinate visual details).
- ALWAYS check agent-mistakes.md before starting — known patterns save 90% of time.
- On failure to diagnose: report "UNCERTAIN" with all evidence gathered, don't guess.

### 2. Trace Extraction Utility: `scripts/trace-extract.ts`

A lightweight script that extracts structured data from Playwright trace.zip files. Agents call this via Bash before analyzing.

**Input**: path to trace.zip
**Output**: JSON to stdout with:
```typescript
{
  actions: [
    {
      index: number,
      type: 'click' | 'fill' | 'navigate' | ...,
      selector: string,
      timestamp: number,
      screenshotPath: string,     // extracted to temp dir
      domSnapshot: string,        // accessibility tree at this point
      consoleErrors: string[],    // errors between this action and next
      networkErrors: { url, status }[]
    }
  ],
  failureAction: {
    index: number,
    error: string,
    screenshotPath: string,
    domSnapshot: string
  },
  metadata: {
    testName: string,
    duration: number,
    url: string
  }
}
```

**Implementation**:
- Uses `@playwright/test` trace API or raw ZIP extraction (trace.zip is a standard archive)
- Extracts screenshots to `reports/visual-debug/trace-frames/`
- Resizes extracted screenshots to 768px max width (sharp or jimp)
- Crops to failure region if bounding box available in trace metadata
- ~150 lines of TypeScript

**npm script**: `npm run trace:extract -- <path-to-trace.zip>`

### 3. Agent Prompt Updates

**ALL-014 rule removal**: Remove the vision-disabled rule from `AGENT_SHARED_RULES.md`. Replace with usage guidelines:
- Use screenshots ONLY when text/DOM analysis is insufficient
- Resize to 768px max before analyzing
- Max 5 screenshots per debugging session
- Always cross-validate visual observations against DOM state

**Update `/rca` skill** (`.claude/skills/rca/SKILL.md`):
- After current artifact-first steps, add: "If text-based artifacts are inconclusive and issue appears visual → invoke `/visual-debug` Tier 3-4"
- RCA remains artifact-first. Visual debug is the escalation path.

**Update `/bugfix` skill** (`.claude/skills/bugfix/SKILL.md`):
- Add clause: "For visual bugs (element not responding, wrong display, UI not updating) → invoke `/visual-debug` for evidence before attempting fix"

**Update healer agent** (`.github/agents/playwright-test-healer.agent.md`):
- Add `/visual-debug` to available skills
- Add: "When healing a visual failure, use `/visual-debug` Tier 3-4 to see what's happening before modifying selectors or waits"

**Update CLAUDE.md**:
- Add skill routing row #18: `"show me", "what's on screen", "visual debug", "screenshot debug" → /visual-debug`
- Update dependency graph:
  ```
  /rca    ──optional──> /visual-debug
  /bugfix ──optional──> /visual-debug
  ```
- `/visual-debug` is a leaf skill (no auto-calls)

### 4. Initial Visual Debugging Rules for agent-mistakes.md

Add VIS-001 through VIS-005:

| ID | Rule | Resolution |
|----|------|------------|
| VIS-001 | Always try text/DOM analysis before screenshots — 80% of failures are diagnosable without vision | Research: TestDino/Applitools data shows text+DOM covers majority of failures |
| VIS-002 | Resize screenshots to 768px max and crop to failure region before analyzing | Full-page 1920x1080 wastes 4-6x tokens, no model benefits from higher resolution |
| VIS-003 | Cross-validate ALL visual observations against DOM state — LLMs hallucinate visual details | Research: UW CSE 503 study shows visual claims must be verified against structured data |
| VIS-004 | "No visible change after click" usually means: element interception, disabled state, or async render not complete — check `document.elementFromPoint()` and computed styles | Pattern from LR-010, GEN-026, Percy Visual Review Agent findings |
| VIS-005 | Extract screenshots from trace.zip first — don't re-navigate and re-capture when trace has the data | Traces contain per-action screenshots + DOM. Live MCP is LAST RESORT. |

---

## Files to Create/Modify

| Action | File | Lines | What |
|--------|------|-------|------|
| CREATE | `.claude/skills/visual-debug/SKILL.md` | ~250 | Full skill definition with 4-tier protocol |
| CREATE | `scripts/trace-extract.ts` | ~150 | Trace.zip extraction utility |
| MODIFY | `CLAUDE.md` | +5 | Routing row #18 + dependency graph update |
| MODIFY | `docs/read_only_docs/AGENT_SHARED_RULES.md` | ~10 | Replace ALL-014 with usage guidelines |
| MODIFY | `.claude/skills/rca/SKILL.md` | +5 | Visual-debug escalation hook |
| MODIFY | `.claude/skills/bugfix/SKILL.md` | +5 | Visual-debug clause for visual bugs |
| MODIFY | `.github/agents/playwright-test-healer.agent.md` | +5 | Add visual-debug skill access |
| MODIFY | `specs_planning/_internal/agent-mistakes.md` | +5 | VIS-001 through VIS-005 |
| MODIFY | `package.json` | +1 | `trace:extract` npm script |

## NOT Doing

- NOT writing TypeScript telemetry modules in `src/`
- NOT modifying BasePage, fixtures, or agent-reporter
- NOT implementing runtime test instrumentation
- NOT building screenshot comparison code (agent is multimodal)
- NOT implementing S3/blob storage
- NOT implementing burst frame capture (traces + video already cover this)
- NOT adding per-action screenshot capture during test execution

---

## Verification

1. **Skill invocation**: Run `/visual-debug` in Claude Code → skill loads → protocol steps visible
2. **Trace extraction**: Run `npm run trace:extract -- reports/test-results/some-trace.zip` → JSON output with action sequence + extracted screenshots
3. **End-to-end**: Deliberately fail a test (wrong selector), then:
   - Agent reads failure-summary.json (Tier 1) → identifies selector issue from error message
   - If unclear: extracts trace (Tier 2) → sees DOM snapshot shows element missing
   - If still unclear: views failure screenshot from trace (Tier 3) → sees element is present but covered by overlay
   - If still unclear: goes live via MCP (Tier 4) → inspects z-index, finds dialog covering button
4. **Pattern matching**: Fail a test with Angular dirty tracking issue (LR-009), verify agent matches it from agent-mistakes.md before going to Tier 3
5. **Token budget**: Verify agent uses max 5 screenshot pairs per session, resizes to 768px
6. **Integration**: Run `/rca` on a visual bug, verify it escalates to `/visual-debug` when text analysis is insufficient
7. **Healer**: Healer agent can invoke `/visual-debug` when healing visual failures

---

## Implementation Sequence

| Phase | What | Dependency |
|-------|------|------------|
| 1 | Create `scripts/trace-extract.ts` + npm script | None |
| 2 | Create `.claude/skills/visual-debug/SKILL.md` | Phase 1 (references trace-extract) |
| 3 | Update CLAUDE.md routing + dependency graph | Phase 2 |
| 4 | Update AGENT_SHARED_RULES.md (replace ALL-014) | Phase 2 |
| 5 | Update `/rca`, `/bugfix` skills + healer agent | Phase 2 |
| 6 | Add VIS-001..005 to agent-mistakes.md | Phase 2 |
| 7 | Verify end-to-end | All above |

Phases 1-2 are the core work. Phases 3-6 are integration touches (~5 lines each). Phase 7 is validation.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Token bloat from screenshots | Hard limit: max 5 screenshot pairs, 768px resize, crop to region. Tier 1-2 are text-only. |
| Agent gets stuck in Tier 4 live debugging | Skill protocol has explicit "max 5 screenshot pairs" and "report UNCERTAIN if can't diagnose" rules |
| Trace.zip format changes across Playwright versions | trace-extract.ts uses documented Playwright trace API, not internal formats |
| Breaking existing agent behavior by removing ALL-014 | Replacement rule has clear usage guidelines (not "use freely" but "use efficiently, text first") |
| Healer becomes too token-hungry with visual debug | Optional — healer CHOOSES to invoke visual-debug only for visual failures, not all failures |

---

## Research Sources

- TestDino — AI-powered Playwright reporting with auto-classification (Bug/UI Change/Flaky/Setup)
- Applitools Root Cause Analysis — DOM-level diff, trained on 4B image pairs
- Percy Visual Review Agent — smart highlights, 40% noise filtering
- UW CSE 503 — multimodal LLM accuracy: OCR + screenshot hybrid outperforms either alone
- Token costs: Claude ~1600 tokens/image, GPT-4o 85-170+ per tile, Gemini 258+ per tile
- Key finding: accessibility snapshots use 4x fewer tokens than screenshots for same diagnostic value
- Key finding: 768px resize + region crop saves 50-80% tokens with no accuracy loss
