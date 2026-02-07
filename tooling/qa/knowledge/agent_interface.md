# QA-Dev Agent Interface Specification

**Purpose:** Define the exact contract between qa_agent (Rutvik_QA.agent.md) and dev_agent (Test.agent.md) for repository-based communication.

**Date Created:** February 6, 2026  
**Version:** 1.0

---

## Communication Flow

```
USER triggers qa_agent
    ↓
qa_agent creates verification bundle in tooling/qa/verifications/recent/{TASK-ID}/
    ├── 1_initial_findings.md (QA writes)
    ├── 2_review_request.md (QA writes)
    ├── evidence.json (QA writes)
    └── summary.json (QA writes after dev feedback)
    ↓
USER triggers dev_agent with "check QA's job"
    ↓
dev_agent reads 1_initial_findings.md
    ├── Validates each finding against actual code
    ├── Fixes valid issues
    ├── Logs false alarms
    └── Creates 3_worker_feedback.md (DEV writes)
    ↓
USER triggers qa_agent to process feedback
    ↓
qa_agent reads 3_worker_feedback.md
    ├── Removes false alarms
    ├── Updates knowledge base
    ├── Creates 4_findings_revised.md (QA writes)
    └── Updates summary.json with final outcome
```

---

## File Specifications

### 1_initial_findings.md (Created by QA)

**Purpose:** QA's initial findings before dev validation

**Required Structure:**
```markdown
# Initial QA Findings - [TASK-ID]
Created: [ISO timestamp]
Status: AWAITING_WORKER_VALIDATION

## 🔴 CRITICAL (Blocks Approval)

### Finding #{N}: {Title}
- **File**: {relative path}
- **Lines**: {line numbers or range}
- **Issue**: {clear description}
- **Impact**: {what breaks/why it matters}
- **Evidence**: {git command or file reference}
- **Confidence**: HIGH | MEDIUM | LOW

## 🟡 MEDIUM (Fix Before Release)
[Same format as critical]

## 🟢 MINOR (Fix When Convenient)
[Same format]

---

## Summary
- Total findings: {N}
- Critical: {N}
- Medium: {N}
- Minor: {N}

**Next Step**: Requesting worker agent validation of these findings.
```

**Dev Agent Expectations:**
- Clear file paths (no ambiguity)
- Line numbers when applicable
- Evidence commands dev can run
- Confidence levels to prioritize validation

---

### 2_review_request.md (Created by QA)

**Purpose:** Formal request to dev_agent for validation

**Required Structure:**
```markdown
# QA Review Validation Request - [TASK-ID]
Created: [ISO timestamp]
To: Worker Agent (dev_agent)
From: QA Agent (qa_agent)

## Purpose
I've completed initial verification and found {N} issues. Please validate each finding against actual code to confirm they're valid and not false alarms.

## What I Need From You

For EACH finding in 1_initial_findings.md:
1. Verify against actual code
2. Provide evidence (code snippets or git commands)
3. Flag false alarms with explanation
4. Explain any context I missed

## Validation Template

Create `3_worker_feedback.md` with this format:

[Include template showing dev what to produce]

## Critical Findings to Prioritize
- Finding #{N}: {title} (HIGH priority)
[List high-priority items]

## Timeline
Please review and respond within your next work cycle.
```

**Dev Agent Expectations:**
- Clear instructions on what to create
- Format template for 3_worker_feedback.md
- Priority list for triage

---

### 3_worker_feedback.md (Created by DEV)

**Purpose:** Dev agent's validation of QA's findings

**Required Structure:**
```markdown
# Worker Validation of QA Findings - [TASK-ID]
Created: [ISO timestamp]

## Finding #{N}: {Title}
**QA Claim:** {what QA said}
**My Validation:** ✅ VALID | ❌ FALSE ALARM | ⚠️ PARTIALLY VALID
**Evidence:**
```{language}
{actual code showing issue or lack thereof}
```
**Explanation:** {why it's valid/invalid, context QA missed}
**Fix Applied:** {if VALID: commit hash, files changed} | N/A
**QA Mistake Pattern:** {if FALSE ALARM: pattern for QA to learn}

[Repeat for each finding]

---

## Summary
- ✅ Valid: {N}
- ❌ False Alarms: {N}
- ⚠️ Partially Valid: {N}

## Fixes Applied
[List commits and files for valid issues fixed]

## False Alarms Logged
[List entries added to tooling/qa/.qa-mistakes/mistakes.jsonl]
```

**QA Agent Expectations:**
- Clear validation status for each finding
- Code evidence proving validation
- Patterns to learn from for false alarms
- Commit hashes for fixes (trackable)

---

### 4_findings_revised.md (Created by QA after processing feedback)

**Purpose:** QA's updated findings after dev validation

**Required Structure:**
```markdown
# Revised QA Findings - [TASK-ID]
Updated: [ISO timestamp]
After Worker Validation

## Changes from Initial Findings:
- ❌ Removed Finding #{N} ({title}) - FALSE ALARM
- ✅ Kept Finding #{N} ({title}) - VALIDATED
- ⚠️ Updated Finding #{N} ({title}) - PARTIALLY VALID

## 🔴 CRITICAL (Blocks Approval) - Validated

### Finding #{N}: {Title} ✅ VALIDATED
[Original finding, confirmed by dev]

### Finding #{N}: {Title} ⚠️ UPDATED
[Original finding with dev's context added]
**Worker Context:** {additional info from dev}
**Updated Status:** {new severity or resolution}

[Continue for all remaining findings]

---

## Summary (Updated)
- Original findings: {N}
- False alarms removed: {N}
- Updated with context: {N}
- Final valid findings: {N}
  - Critical: {N}
  - Medium: {N}
  - Minor: {N}

**Learning**: {What false alarms taught you}
```

---

### evidence.json (Created by QA)

**Purpose:** Machine-readable evidence and git references

**Required Structure:**
```json
{
  "task_id": "TASK-ID",
  "timestamp": "ISO 8601 timestamp",
  "base_commit": "git hash",
  "head_commit": "git hash",
  "changed_files": [
    {
      "path": "relative/path/to/file.ts",
      "status": "modified | added | deleted",
      "category": "expected | suspicious | missing",
      "diff_command": "git diff {base}..{head} -- {path}"
    }
  ],
  "test_results": {
    "command": "npm test",
    "exit_code": 0,
    "artifact_path": "reports/test-results.xml"
  },
  "compilation_test": {
    "command": "npm run typecheck",
    "exit_code": 1,
    "errors": []
  }
}
```

---

### summary.json (Created by QA after dev feedback)

**Purpose:** Machine-readable final outcome

**Required Structure:**
```json
{
  "task_id": "TASK-ID",
  "timestamp": "ISO 8601",
  "outcome": "PASS | FAIL | BLOCKED | CONDITIONAL",
  "outcome_reason": "Brief explanation matching outcome",
  "verification_version": "initial | revised_after_worker_feedback",
  "initial_findings": 5,
  "false_alarms_removed": 1,
  "final_findings": 4,
  "critical_issues": 1,
  "medium_issues": 2,
  "minor_issues": 1,
  "worker_feedback_received": true,
  "files_reference": {
    "initial_findings": "1_initial_findings.md",
    "review_request": "2_review_request.md",
    "worker_feedback": "3_worker_feedback.md",
    "revised_findings": "4_findings_revised.md",
    "evidence": "evidence.json"
  },
  "requirement_traceability": [
    {
      "requirement_id": "REQ-1",
      "description": "Brief requirement description",
      "evidence_files": ["src/file.ts", "tests/file.test.ts"],
      "verification_status": "VERIFIED | NOT_VERIFIED | BLOCKED",
      "blocker": "Optional: why not verified"
    }
  ]
}
```

**Outcome Codes:**
- `✅ PASS` - All requirements verified, no blocking issues
- `❌ FAIL` - Critical issues found (validated by dev), must fix
- `⏳ BLOCKED` - Cannot complete verification (e.g., compilation errors prevent testing)
- `⚠️ CONDITIONAL` - Minor issues exist but acceptance criteria met

---

## Dev Agent Integration Points

### What Dev Reads:
1. `tooling/qa/current/ACTIVE_TASK.json` (if using task tracking) OR user specifies verification dir
2. `{verification_dir}/1_initial_findings.md`
3. `{verification_dir}/2_review_request.md` (optional, for context)

### What Dev Creates:
1. `{verification_dir}/3_worker_feedback.md`
2. `tooling/qa/.qa-mistakes/mistakes.jsonl` entries (for false alarms)
3. Commits with fixes (if findings are valid)

### What Dev Calls:
- `track_action('worker', {...})` to update state (if using task tracking)

---

## QA Agent Boundaries

### ✅ QA Can Write:
- `tooling/qa/verifications/recent/{TASK-ID}/*` (all files in verification bundle)
- `tooling/qa/knowledge/*` (knowledge base updates)
- `tooling/qa/prompts/*` (prompt history)

### ❌ QA CANNOT Write:
- Repo root (no summaries, documentation, or artifacts outside tooling/qa/)
- Source code (src/, tests/, pages/, utils/, etc.)
- Configuration (package.json, tsconfig.json, playwright.config.ts, etc.)
- Documentation (docs/, README.md, etc.)

### Rule: If it's not in tooling/qa/, QA cannot create/modify it

---

## Wait Points in Workflow

**QA must STOP and WAIT at these points:**

1. **After creating 2_review_request.md**
   - Status: AWAITING_WORKER_VALIDATION
   - Waiting for: dev_agent to create 3_worker_feedback.md
   - User action: Trigger dev_agent with "check QA's job"

2. **After dev creates 3_worker_feedback.md**
   - Status: PROCESSING_FEEDBACK
   - Waiting for: User to trigger qa_agent to process feedback
   - User action: Tell qa_agent "process dev feedback" or similar

3. **After creating summary.json with final outcome**
   - Status: COMPLETE (outcome determined)
   - Waiting for: User decision based on outcome
   - User action: If FAIL/BLOCKED/CONDITIONAL, decide whether to fix and re-verify

---

## False Alarm Handling

### Dev Logs to mistakes.jsonl:
```json
{
  "timestamp": "ISO 8601",
  "finding_id": "Finding #N from 1_initial_findings.md",
  "qa_claim": "What QA said",
  "actual_code": "Code proving QA wrong",
  "why_false_alarm": "Explanation",
  "evidence": "Git command or test result",
  "pattern": "Pattern for QA to learn"
}
```

### QA Updates qa_false_alarms.md:
```markdown
## False Alarm #{ID}: [Date] - [Pattern]
**What I Flagged**: {description}
**Why It Was Wrong**: {explanation from dev}
**Worker Evidence**: {what dev showed}
**What I Missed**: {what I should have checked}
**How to Avoid**: {concrete steps}
**Detection Pattern**: {how to recognize in future}
**Prevention Check**: {command or checklist}
```

---

## Outcome Language - Strict Definitions

**Never say:**
- ❌ "Verification COMPLETE"
- ❌ "Work is done"
- ❌ "Everything looks good"

**Always say (exact outcome):**
- ✅ `Outcome: PASS` - All verified, no issues
- ❌ `Outcome: FAIL` - Critical issues block approval
- ⏳ `Outcome: BLOCKED` - Cannot verify (e.g., compilation errors)
- ⚠️ `Outcome: CONDITIONAL` - Minor issues, can proceed with conditions

**Include reason:**
- `Outcome: FAIL` - Reason: Missing error handling in API functions (validated by dev)
- `Outcome: BLOCKED` - Reason: TypeScript compilation fails, cannot run tests
- `Outcome: PASS` - Reason: All requirements verified, no issues found

---

## Version History

- v1.0 (2026-02-06): Initial specification based on Test.agent.md and Rutvik_QA.agent.md analysis
