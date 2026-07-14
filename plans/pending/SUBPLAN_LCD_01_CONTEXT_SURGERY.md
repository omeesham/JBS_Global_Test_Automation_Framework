# SUBPLAN_LCD_01_CONTEXT_SURGERY — Compress doer-craft out of CEO always-on context

**Status**: Pending
**Priority**: P0
**Created**: 2026-07-13
**Identity**: OWNER
**Parent**: PLAN_LAZY_CEO_DELEGATOR.md
**Depends on**: none
**Blocks**: SUBPLAN_LCD_02, SUBPLAN_LCD_05
**Runs-after**: none
**Collides-with**: LCD_02 (CLAUDE.md pointers)
**Model**: claude-opus-4-6
**PermissionMode**: default (PROTECTED files need owner go + SELF_GRANT)
**RiskAcknowledged**: MEDIUM — incorrect surgery could remove CEO-needed context

---

## Objective

Reduce always-on WORKER-MOVE content from 44% (~284 lines) to ~4% (~25 lines) across root `CLAUDE.md`, `clients/encore/CLAUDE.md`, and `MEMORY.md`. Each removed section becomes either (a) a one-line compressed pointer in the CEO file, or (b) content in a worker landing zone. CEO retains enough to write correct tickets and catch lying workers (LR-042).

---

## Preconditions

- `clients/encore/CLAUDE.md` still contains LR-ENC-001 through LR-ENC-006 full sections (grep: `## LR-ENC-001`)
- Root `CLAUDE.md` still contains deterministic-probe delegation technique detail (grep: `Deterministic-probe delegation`)
- Root `CLAUDE.md` still contains POM restructure detail (grep: `POM restructure 2026-06-05`)

---

## Step-by-Step

### Phase 1 — Create ticket-scoped worker landing zone (non-protected)

1. Create `~/.claude/delegation/worker-doctrine-index.md` — a SINGLE index file listing existing doctrine paths workers must cite in their ticket DOCTRINE field, grouped by domain. No inline technique is stored here; this is a lookup-only pointer registry:
   ```markdown
   # Worker Doctrine Index
   ## Encore Walk / Divergence
   - Full technique: `clients/encore/CLAUDE.md` → sections LR-ENC-001, LR-ENC-004
   - Cite in HUNTER/GIVER tickets: `DOCTRINE: clients/encore/CLAUDE.md LR-ENC-001`
   ## DOM Detection / Selectors
   - Full technique: `.claude/rules/angular.md` + `clients/encore/CLAUDE.md` LR-036, LR-012, LR-017
   ## Spec Execution
   - Individual-first, SKIP investigation: `AGENT_SHARED_RULES.md` §4
   ## Env Config
   - Full env rules: `clients/encore/CLAUDE.md` LR-ENC-003
   ```
   Size cap: ≤40 lines. Workers read this index to know WHICH existing doc to cite — they do NOT read the full technique from here.

2. Verify index is correct: `cat ~/.claude/delegation/worker-doctrine-index.md | grep "^##" | wc -l` → expect ≥4 domain sections.

**Rationale for removing the original worker-primer.md approach** (per refute-gpt:9 FATAL FLAW): a new `~/.claude/delegation/worker-primer.md` had no proven injection mechanism — `worker-ext.md:109-111` only prepends `DUTY_STACK.md`, not a second primer. Technique content already lives in existing per-agent `.agent.md` files loaded by established paths. The doctrine-index approach uses the proven ticket-DOCTRINE mechanism instead of an unverified new loading path.

### Phase 2 — Compress CEO context (PROTECTED — needs owner go + SELF_GRANT)

**⛔ GATE**: DESCRIBE only. Do NOT execute until Rutvik gives explicit in-chat "go" + SELF_GRANT ceremony.

3. In `clients/encore/CLAUDE.md`, replace each WORKER-MOVE section with a one-line compressed pointer:
   ```
   <!-- CEO POINTER: LR-ENC-001 walk technique → ticket DOCTRINE; cite clients/encore/CLAUDE.md LR-ENC-001; VERIFY: worker states which divergence it handled -->
   ```
   Sections to compress (per delegation-audit-A classification):
   - LR-ENC-001 walk technique + divergence detail (~65 lines → 1 pointer)
   - LR-ENC-001 boolean/Glyphicon (~8 lines → 1 pointer)
   - LR-ENC-002 HARD STOPs + gate A/B/C detail (~35 lines → 1 pointer)
   - LR-ENC-003 full (~20 lines → 1 pointer)
   - LR-ENC-004 headless degradation detail (~20 lines → 1 pointer)
   - LR-ENC-006 step-wrapper/proxy/jargon (~60 lines → 1 pointer)
   - LR-008 date offset full rules (~15 lines → 1 pointer)
   - LR-017 selector namespace rules (~18 lines → 1 pointer)
   - LR-036 boolean code detail (~30 lines → 1 pointer)
   - Provisioning checklist + login note (~20 lines → removed entirely, ops-only)

4. In root `CLAUDE.md`, compress:
   - Deterministic-probe technique (3 lines → 1 line: "Workers use playwright-cli for deterministic probes; cite AGENT_SHARED_RULES §4 in ticket DOCTRINE")
   - POM directory naming detail (3 lines → 1 line: "POM layout defined in clients/<id>/src/; workers cite AGENT_SHARED_RULES §4")

5. In `MEMORY.md`, compress 18 worker-technique pointers into a single block:
   ```
   ## Worker-Lane Rules (cite in ticket DOCTRINE, not loaded here)
   Worker-specific technique lives in per-agent .agent.md files and existing rule docs.
   Doctrine paths for tickets: see ~/.claude/delegation/worker-doctrine-index.md
   ```

### Phase 3 — Verification

6. Count always-on CEO context: `wc -l CLAUDE.md clients/encore/CLAUDE.md` → target: combined <400 lines (down from ~517).
7. Verify no broken references: `grep -r "LR-ENC-001\|LR-ENC-002\|LR-ENC-003" plans/pending/ | head -20` → existing plans still reference the rule by name (which still works — the rule exists, just compressed).
8. Verify doctrine index is discoverable: `cat ~/.claude/delegation/worker-doctrine-index.md | head -5` → confirms file exists with expected header.

---

## Verification Artifact

- Pre/post `wc -l` comparison showing line reduction
- `grep` confirming compressed pointers contain the correct DOCTRINE citation guidance
- `worker-doctrine-index.md` content visible and structured with ≥4 domain sections

---

## Rollback

- `git checkout -- clients/encore/CLAUDE.md CLAUDE.md` (restores full content; these are git-tracked)
- Delete `~/.claude/delegation/worker-doctrine-index.md` (home-dir file, no git rollback needed — just delete)
