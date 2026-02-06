# Quality Assurance Infrastructure

**Purpose:** Ensure all AI agent work is tracked, verified, and mistakes are logged to prevent recurrence.

---

## 📁 Directory Structure

```
.qa/
├── README.md                          # This file
├── AGENT_MISTAKES.md                  # Log of all agent mistakes
├── REQUIREMENTS_TRACKER.json          # JSON tracking all requirements
├── VERIFICATION_LOGS/                 # Verification reports for each task
│   ├── TASK-001-before/              # Pre-task snapshot
│   ├── TASK-001-after/               # Post-task snapshot
│   └── comparison_report.txt         # Diff between snapshots
├── templates/                         # Templates for documentation
│   ├── PRE_TASK_ANALYSIS.template.md
│   ├── POST_TASK_VERIFICATION.template.md
│   ├── QA_FINDINGS.template.md
│   └── FIX_REQUEST.template.md
└── scripts/                           # Automation scripts
    ├── generate_task_id.sh
    ├── snapshot_state.sh
    └── compare_states.sh
```

---

## 🎯 Purpose of Each Component

### 1. AGENT_MISTAKES.md
**What:** Chronological log of all mistakes made by AI agents  
**Why:** Learn from errors and prevent recurrence  
**When to Update:** Immediately when a mistake is discovered  
**Format:**
```markdown
### [Date Time] - TASK-XXX - CATEGORY
- Agent: Session identifier
- Description: What went wrong
- Impact: What was affected
- Root Cause: Why it happened
- Prevention: How to avoid in future
- Status: Fixed/Documented/Pending
```

### 2. REQUIREMENTS_TRACKER.json
**What:** Machine-readable tracking of all project requirements  
**Why:** Programmatic verification of completion status  
**When to Update:** 
- When new requirements are added
- When requirements status changes
- After task completion
**Structure:** See schema in file

### 3. VERIFICATION_LOGS/
**What:** Before/after snapshots and comparison reports  
**Why:** Verify exactly what changed during a task  
**When to Use:** For every significant task  
**Contents:**
- `TASK-XXX-before/` - State before starting
- `TASK-XXX-after/` - State after completion
- Comparison reports

### 4. templates/
**What:** Standardized documentation templates  
**Why:** Ensure consistent, thorough documentation  
**Available Templates:**
- **PRE_TASK_ANALYSIS** - Document before starting work
- **POST_TASK_VERIFICATION** - Verify after completion
- **QA_FINDINGS** - Report issues discovered
- **FIX_REQUEST** - Request specific fixes with clear requirements

### 5. scripts/
**What:** Automation scripts for QA tasks  
**Why:** Reduce manual effort, ensure consistency  
**Available Scripts:**
- **generate_task_id.sh** - Create unique task ID
- **snapshot_state.sh** - Capture current codebase state
- **compare_states.sh** - Diff two snapshots

---

## 🔄 Recommended Workflow

### For Any New Task

#### 1. Before Starting
```bash
# Generate task ID
TASK_ID=$(bash .qa/scripts/generate_task_id.sh)
echo "Working on: $TASK_ID"

# Create pre-task analysis using template
cp .qa/templates/PRE_TASK_ANALYSIS.template.md ".qa/VERIFICATION_LOGS/${TASK_ID}-PRE.md"
# Fill in the template

# Capture before state
bash .qa/scripts/snapshot_state.sh "${TASK_ID}-before"

# Commit current state (if using git)
git add -A
git commit -m "State before $TASK_ID"
```

#### 2. During Work
- Make changes as requested
- Track any issues in notes
- If mistake discovered → log in AGENT_MISTAKES.md immediately

#### 3. After Completion
```bash
# Capture after state
bash .qa/scripts/snapshot_state.sh "${TASK_ID}-after"

# Compare states
bash .qa/scripts/compare_states.sh \
  ".qa/VERIFICATION_LOGS/${TASK_ID}-before" \
  ".qa/VERIFICATION_LOGS/${TASK_ID}-after" \
  ".qa/VERIFICATION_LOGS/${TASK_ID}-comparison.txt"

# Create post-task verification
cp .qa/templates/POST_TASK_VERIFICATION.template.md ".qa/VERIFICATION_LOGS/${TASK_ID}-POST.md"
# Fill in the template

# Update REQUIREMENTS_TRACKER.json if requirements completed

# Commit final state
git add -A
git commit -m "Completed $TASK_ID"
```

---

## 📝 How to Use Templates

### PRE_TASK_ANALYSIS.template.md
**When:** Before starting any task  
**Purpose:** 
- Clarify requirements
- Identify risks
- Plan approach
- Get approval

**How to Use:**
1. Copy template to `.qa/VERIFICATION_LOGS/TASK-XXX-PRE.md`
2. Fill in all sections
3. Review with user if needed
4. Keep as reference during work

### POST_TASK_VERIFICATION.template.md
**When:** After completing any task  
**Purpose:**
- Document what was done
- Verify all requirements met
- Check for issues
- Compare to plan

**How to Use:**
1. Copy template to `.qa/VERIFICATION_LOGS/TASK-XXX-POST.md`
2. Fill in actual results
3. Compare to pre-task plan
4. Document any deviations
5. List any issues found

### QA_FINDINGS.template.md
**When:** Issue or bug discovered  
**Purpose:**
- Document problems clearly
- Track resolution
- Prevent recurrence

**How to Use:**
1. Copy template to `.qa/VERIFICATION_LOGS/QA-XXX.md`
2. Describe issue with evidence
3. Analyze root cause
4. Propose solution
5. Track until resolved

### FIX_REQUEST.template.md
**When:** Requesting specific changes  
**Purpose:**
- Clear fix requirements
- Provide context to agent
- Define acceptance criteria

**How to Use:**
1. Copy template to `.qa/VERIFICATION_LOGS/FIX-XXX.md`
2. Describe problem and desired outcome
3. List acceptance criteria
4. Provide implementation guidance
5. Specify testing requirements
6. Give to agent with clear instructions

---

## 🔍 Mistake Logging Process

### When to Log a Mistake
- Agent made incorrect assumption
- Code broke existing functionality
- Requirements misunderstood
- Files incorrectly created/deleted
- Configuration errors
- Type errors not caught
- Tests failed after changes
- Documentation incorrect

### How to Log
1. Open `.qa/AGENT_MISTAKES.md`
2. Add new entry at bottom under "## Entries"
3. Use this format:
```markdown
### [YYYY-MM-DD HH:MM] - TASK-XXX - CATEGORY
- **Agent:** Session identifier
- **Description:** Clear explanation
- **Impact:** What broke or was affected
- **Root Cause:** Why it happened
- **Prevention:** How to avoid next time
- **Status:** Fixed / Documented / Pending
```
4. Update summary at top (Total Mistakes, Resolved, Pending)
5. Commit the change

### Mistake Categories
- `LOGIC_ERROR` - Incorrect implementation logic
- `ASSUMPTION_ERROR` - Wrong assumptions made
- `SCOPE_CREEP` - Did more/less than asked
- `BREAKING_CHANGE` - Broke existing features
- `CONFIG_ERROR` - Configuration mistakes
- `DEPENDENCY_ERROR` - Wrong/missing dependencies
- `TYPE_ERROR` - TypeScript typing issues
- `TEST_ERROR` - Test failures or bad tests
- `DOCUMENTATION_ERROR` - Docs incomplete/wrong
- `CLEANUP_ERROR` - Didn't clean up properly

---

## 📊 Requirements Tracking

### REQUIREMENTS_TRACKER.json Schema

```json
{
  "project": "Project Name",
  "created": "ISO 8601 timestamp",
  "lastUpdated": "ISO 8601 timestamp",
  "requirements": [
    {
      "id": "REQ-XXX",
      "title": "Short title",
      "description": "Detailed description",
      "status": "not_started|in_progress|completed|blocked",
      "priority": "critical|high|medium|low",
      "category": "migration|feature|bugfix|documentation|infrastructure",
      "created": "ISO 8601 timestamp",
      "completed": "ISO 8601 timestamp or null",
      "verification": {
        "verified": true|false,
        "verifiedBy": "Name",
        "verificationDate": "ISO 8601 timestamp",
        "notes": "Verification notes"
      },
      "dependencies": ["REQ-XXX", ...],
      "blockers": ["Description of blocker", ...],
      "acceptance_criteria": ["Criterion 1", "Criterion 2", ...]
    }
  ],
  "metadata": {
    "total": 0,
    "completed": 0,
    "in_progress": 0,
    "blocked": 0,
    "not_started": 0,
    "categories": { ... },
    "priorities": { ... }
  }
}
```

### How to Update
1. Edit `.qa/REQUIREMENTS_TRACKER.json`
2. Add new requirement or update existing
3. Update metadata counts
4. Update `lastUpdated` timestamp
5. Commit changes

---

## 🛠️ Scripts Reference

### generate_task_id.sh

**Purpose:** Generate unique task identifier  
**Usage:**
```bash
bash .qa/scripts/generate_task_id.sh [PREFIX]
```
**Examples:**
```bash
bash .qa/scripts/generate_task_id.sh           # TASK-001-20260206-143000
bash .qa/scripts/generate_task_id.sh FIX       # FIX-001-20260206-143000
bash .qa/scripts/generate_task_id.sh QA        # QA-001-20260206-143000
```
**Output:** Prints task ID to stdout and logs to `.qa/.task_history`

---

### snapshot_state.sh

**Purpose:** Capture complete codebase state  
**Usage:**
```bash
bash .qa/scripts/snapshot_state.sh <TASK_ID>
```
**Examples:**
```bash
bash .qa/scripts/snapshot_state.sh TASK-001-before
bash .qa/scripts/snapshot_state.sh TASK-001-after
```
**Output:** Creates directory `.qa/VERIFICATION_LOGS/<TASK_ID>/` with:
- `git_status.txt` - Git status
- `git_diff.txt` - Current diff
- `git_commit.txt` - Current commit hash
- `file_tree.txt` - All files
- `typescript_files.txt` - All .ts files
- `python_files.txt` - All .py files
- `config_snapshot.txt` - Config file contents
- `directory_tree.txt` - Directory structure
- `line_counts.txt` - Line counts by file
- `metadata.txt` - Snapshot metadata

---

### compare_states.sh

**Purpose:** Compare two snapshots and generate diff report  
**Usage:**
```bash
bash .qa/scripts/compare_states.sh <BEFORE_DIR> <AFTER_DIR> [OUTPUT_FILE]
```
**Examples:**
```bash
bash .qa/scripts/compare_states.sh \
  .qa/VERIFICATION_LOGS/TASK-001-before \
  .qa/VERIFICATION_LOGS/TASK-001-after

bash .qa/scripts/compare_states.sh \
  .qa/VERIFICATION_LOGS/TASK-001-before \
  .qa/VERIFICATION_LOGS/TASK-001-after \
  .qa/VERIFICATION_LOGS/TASK-001-report.txt
```
**Output:** Comparison report showing:
- Git changes
- New/deleted files
- TypeScript file changes
- Python file changes
- Line count changes
- Directory structure changes
- Configuration changes
- Summary statistics

---

## 🎯 Best Practices

### For AI Agents
1. **Always generate task ID first** before starting work
2. **Create pre-task analysis** to clarify requirements
3. **Capture before snapshot** to enable rollback
4. **Log mistakes immediately** - don't hide errors
5. **Create post-task verification** to confirm success
6. **Update requirements tracker** when completing work
7. **Compare states** to verify exactly what changed

### For Users
1. **Review pre-task analysis** before approving work
2. **Check post-task verification** to confirm completion
3. **Review comparison reports** to understand changes
4. **Read AGENT_MISTAKES.md** periodically to see patterns
5. **Use FIX_REQUEST template** for clear fix instructions
6. **Keep REQUIREMENTS_TRACKER.json** up to date

### For Quality Assurance
1. **Verify all acceptance criteria** before marking complete
2. **Test critical features** after any changes
3. **Check for breaking changes** in comparison reports
4. **Review code quality** using templates
5. **Ensure documentation updated** for all changes
6. **Log findings** using QA_FINDINGS template

---

## 🚨 Common Issues

### Scripts Won't Run on Windows
**Problem:** Bash scripts require Git Bash or WSL  
**Solution:** 
- Install Git Bash (comes with Git for Windows)
- Use WSL (Windows Subsystem for Linux)
- Or create PowerShell equivalents in `.qa/scripts/` as `.ps1` files

### Task IDs Not Sequential
**Problem:** Counter file corrupted or deleted  
**Solution:** Check `.qa/.task_counter` and reset if needed

### Snapshots Too Large
**Problem:** Snapshot directories consuming disk space  
**Solution:** 
- Delete old snapshots after verification complete
- Add `VERIFICATION_LOGS/` to `.gitignore` if not tracking
- Configure script to exclude large directories

### Requirements Tracker Outdated
**Problem:** JSON file not reflecting current state  
**Solution:**
- Review and update all requirement statuses
- Update metadata counts to match
- Set up periodic reviews (weekly/monthly)

---

## 📚 Additional Resources

### Related Files
- [MIGRATION_MANIFEST.md](../MIGRATION_MANIFEST.md) - Pre-migration feature catalog
- [MIGRATION_SUMMARY.md](../hybrid_typescript_converted/MIGRATION_SUMMARY.md) - Post-migration results
- [VERIFICATION_CHECKLIST.md](../VERIFICATION_CHECKLIST.md) - User verification steps

### External Documentation
- [Markdown Guide](https://www.markdownguide.org/)
- [JSON Schema Validation](https://json-schema.org/)
- [Git Best Practices](https://github.com/git-guides/)

---

## 🔄 Maintenance

### Weekly Tasks
- [ ] Review AGENT_MISTAKES.md for patterns
- [ ] Update REQUIREMENTS_TRACKER.json statuses
- [ ] Archive old verification logs (>30 days)
- [ ] Check scripts still work correctly

### Monthly Tasks
- [ ] Analyze mistake trends
- [ ] Update templates if needed
- [ ] Review and improve workflow
- [ ] Clean up VERIFICATION_LOGS directory

### As Needed
- [ ] Add new mistake categories
- [ ] Create new templates
- [ ] Add new automation scripts
- [ ] Update this README

---

**Version:** 1.0.0  
**Last Updated:** February 6, 2026  
**Maintained By:** Project Team  
**Questions/Issues:** Document in QA_FINDINGS.template.md
