# Plan 10: Add Stale Reference Prevention to validate:sync

**Status**: PENDING
**Priority**: P1 — prevents PLAN_09 issues from recurring on every future migration
**Estimated Scope**: ~60 lines added to `scripts/validate-agent-sync.ts`. One agent session.
**Trigger**: The 2026-03 overhaul consolidated §15→§12, R23-R30→ALL/GEN/HLR/AUD, and agent-learnings.md→stub. But no automated check catches stale references in prose. Every future renumbering/migration will produce the same stale-reference tail unless we add prevention.

---

## Why This Matters

`validate:sync` currently checks:
- RULES table entries match between agent-mistakes.md and agent files (works great)
- SYNC marker blocks are consistent across files (works great)
- R## subset codes present in agent files (works great)
- Stage flow vocabulary consistent (works great)

It does NOT check:
- Prose references to eliminated §N sections in comments or agent prompts
- Prose references to eliminated R## rules in validation script comments
- References to deprecated files (agent-learnings.md)

This means every structural migration (section renumber, rule consolidation, file deprecation) creates stale references that persist indefinitely until someone manually greps for them.

---

## Implementation

### Add a new validation pass to `scripts/validate-agent-sync.ts`

**Where**: After the existing R## subset validation pass, before the final summary output.

**What**: A configurable deny-list of patterns that should NOT appear in active code files. Any match = validation warning (not hard fail — historical docs are excluded).

```typescript
// === STALE REFERENCE DETECTION ===
// Configurable deny-list of patterns eliminated during consolidations.
// Add new entries here whenever a migration removes identifiers.

const STALE_REFERENCE_DENY_LIST: { pattern: RegExp; replacement: string; since: string }[] = [
  // 2026-03 consolidation: R23-R30 → consolidated into ALL-*/GEN-*/HLR-*/AUD-* rules
  { pattern: /\bR23\b/, replacement: 'ALL-005 (self-audit checklist)', since: '2026-03-03' },
  { pattern: /\bR24\b/, replacement: 'ALL-003 (search mistakes before retry)', since: '2026-03-03' },
  { pattern: /\bR25\b/, replacement: '§8 Context Self-Load', since: '2026-03-03' },
  { pattern: /\bR26\b/, replacement: 'ALL-004 (sync after writing rules)', since: '2026-03-03' },
  { pattern: /\bR27\b/, replacement: 'ALL-004 (capture novel patterns)', since: '2026-03-03' },
  { pattern: /\bR28\b/, replacement: '§12 Phase B (evidence checklist)', since: '2026-03-03' },
  { pattern: /\bR29\b/, replacement: 'ALL-003/ALL-004 (learning yield)', since: '2026-03-03' },
  { pattern: /\bR30\b/, replacement: '§13 Pre-Flight Competency Gate', since: '2026-03-03' },

  // 2026-03 consolidation: old § sections merged into §8 Session Protocol
  { pattern: /§9B\b/, replacement: '§8 Session Protocol', since: '2026-03-03' },
  { pattern: /§9C\b/, replacement: '§8 Session Protocol', since: '2026-03-03' },
  { pattern: /§15\b/, replacement: '§12 RCA Protocol', since: '2026-03-04' },
  { pattern: /§16\b/, replacement: '§8 Session Protocol', since: '2026-03-03' },
  { pattern: /§17\b/, replacement: '§8 Session Protocol', since: '2026-03-03' },
  { pattern: /§18\b/, replacement: '§13 Pre-Flight Gate', since: '2026-03-03' },

  // 2026-03 consolidation: agent-learnings.md deprecated (merged into agent-mistakes.md Resolution)
  { pattern: /agent-learnings\.md/, replacement: 'agent-mistakes.md Resolution column', since: '2026-03-03' },
];

// Files to scan (active code only — exclude plan docs, historical audits, and RCA files)
const SCAN_GLOBS = [
  'scripts/**/*.ts',
  '.github/agents/*.agent.md',
  '.github/copilot-instructions.md',
  'docs/read_only_docs/*.md',  // All active docs — ARCHITECTURE, AGENT_SHARED_RULES, FIX_DIAGNOSIS_TEMPLATE, etc.
  'src/**/*.ts',
  'tests/**/*.ts',
];

// Files to EXCLUDE from scan (historical records, plan documents)
const SCAN_EXCLUDES = [
  'plans/**',
  'specs_planning/audits/**',
  'specs_planning/agent-activity-log.md', // historical entries are valid records
  '**/node_modules/**',
];
```

**Logic**:
1. For each file matching SCAN_GLOBS (excluding SCAN_EXCLUDES):
   - Read file content
   - For each deny-list entry, test pattern against each line
   - If match found: record { file, line number, matched pattern, suggested replacement }
2. After scanning all files:
   - Print summary: `Stale references found: N` (or `No stale references found`)
   - For each finding: `  STALE: {file}:{line} — "{matched text}" → use "{replacement}" (eliminated {since})`
3. Return findings count (informational — does not fail the build, but prints clearly)

**Why not hard-fail?**: Some stale references may be in explanatory comments ("Replaces former §15...") that are intentionally documenting history. The deny-list catches them, the developer decides if they're genuine stale refs or intentional historical notes. Over time, as confidence grows, this can be promoted to hard-fail with an allowlist for intentional historical references.

---

## Execution Steps

1. Read `scripts/validate-agent-sync.ts` to understand current structure
2. Add the deny-list constant and scan logic after the existing validation passes
3. Wire it into the main validation function so it runs as part of `npm run validate:sync`
4. Test: run `npm run validate:sync` — it should report the stale references that PLAN_09 will fix
5. After PLAN_09 is executed: run again — should report zero stale references

---

## Future Use

When the next migration happens (e.g., renumbering rules, deprecating a file, eliminating a section):

1. Add new entries to `STALE_REFERENCE_DENY_LIST` with the pattern, replacement, and date
2. Run `npm run validate:sync` — it will find any files that still reference the old identifier
3. Fix them all
4. Done — no more stale reference tails

This is the "grep after rename" habit that the model doesn't naturally do, baked into the tooling so it happens automatically.

---

## What NOT to Do

- Do NOT make this a hard build failure initially — too many false positives from historical comments
- Do NOT scan `plans/` directory — those are historical plan documents with valid old references
- Do NOT scan `specs_planning/audits/` — those are point-in-time audit snapshots
- Do NOT add patterns for things that are still valid (e.g., don't add R01-R22, those are still active)
