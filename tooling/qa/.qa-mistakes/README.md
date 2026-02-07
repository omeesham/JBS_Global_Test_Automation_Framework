# QA Self-Mistake Tracker

## Purpose

This directory contains the **QA agent's self-audit log** - a record of mistakes made by QA agents during verification, NOT developer mistakes.

## Key Principles

1. **QA-Owned**: Only QA agents write here
2. **Temporary**: Keeps last 20 mistakes only (auto-rotated)
3. **Private**: Not shared with project knowledge base
4. **Learning Tool**: Helps QA improve verification quality

## Mistake Categories

| Category | Description | Example |
|----------|-------------|---------|
| `FALSE_POSITIVE` | QA flagged valid code as problematic | Reported "bug" that was actually correct behavior |
| `FALSE_NEGATIVE` | QA missed actual issues | Approved code with real bugs |
| `BOUNDARY_VIOLATION` | QA modified production code | Changed `pages/` when only allowed to edit `tooling/qa/` |
| `INCOMPLETE_VERIFICATION` | Didn't check all requirements | Skipped manual test validation |
| `INCORRECT_INTERPRETATION` | Misunderstood prompt/requirements | Applied wrong acceptance criteria |
| `PROCESS_ERROR` | QA process itself failed | Script crashed, lock not released |
| `OTHER` | Uncategorized mistakes | Anything else |

## File Structure

```
.qa-mistakes/
├── README.md          # This file
└── mistakes.jsonl     # JSONL format (one JSON object per line)
```

## Entry Format

```jsonl
{"timestamp":"2026-02-06T14:30:00.000Z","task_id":"20260206-143000-abc1234","category":"FALSE_POSITIVE","description":"Flagged TypeScript inference as type error when it was valid","lesson_learned":"Trust TypeScript compiler - don't second-guess inferred types","context":{"file":"src/utils/helpers.ts","line":42}}
```

## Retention Policy

- **Maximum entries**: 20
- **Rotation**: Automatic (oldest deleted when 21st added)
- **Persistence**: Survives across sessions
- **Cleanup**: No manual cleanup needed

## Usage Examples

### Log a Mistake

```javascript
const { logQAMistake } = require('../enforcement/mistake_tracker');

logQAMistake(
  '20260206-143000-abc1234',
  'FALSE_POSITIVE',
  'Flagged valid async/await pattern as problematic',
  'Learn common async patterns - avoid false positives',
  { file: 'src/api.ts', line: 25 }
);
```

### Review Recent Mistakes

```javascript
const { getRecentMistakes, getMistakeStats } = require('../enforcement/mistake_tracker');

// Get last 10 mistakes
const recent = getRecentMistakes(10);
recent.forEach(m => {
  console.log(`[${m.category}] ${m.description}`);
  console.log(`  Lesson: ${m.lesson_learned}`);
});

// Get statistics
const stats = getMistakeStats();
console.log(`Total mistakes tracked: ${stats.total}`);
console.log(`False positives: ${stats.by_category.FALSE_POSITIVE}`);
console.log(`Recent (7 days): ${stats.recent_7_days}`);
```

## Why This Exists

**Problem**: QA agents can make mistakes (false positives, missed issues, boundary violations). Without tracking, they repeat the same errors.

**Solution**: Self-audit log that captures mistakes + lessons learned. QA agents can review this before verification to avoid known pitfalls.

**NOT for**:
- Developer mistakes (use task-specific qa_report.md)
- Permanent documentation (this rotates)
- Cross-project learning (this is local to framework)

## Integration Points

This tracker is called automatically when:
- QA verification fails with boundary violation
- QA process encounters errors
- Manual logging via scripts (encouraged after retries)

## Privacy & Scope

- ✅ Local to this QA system
- ✅ Not committed to git (in .gitignore)
- ✅ Not exposed to developers
- ❌ Not used for developer performance tracking
- ❌ Not persistent beyond 20 entries

---

**Last Updated**: February 6, 2026  
**Version**: 2.0.0
