# QA Knowledge Base — README

**Location:** `tooling/qa/knowledge/`  
**Purpose:** Shared knowledge between dev_agent and qa_agent for requirements tracking, feature planning, and continuous learning.

**Last Updated:** 2026-02-06

---

## 📁 File Structure

```
tooling/qa/knowledge/
├── requirements.json      # All requirements (DEV writes, QA reads)
├── features.json          # All features (DEV writes, QA reads)
├── mistakes.jsonl         # Mistakes log (BOTH append)
├── agent_interface.md     # QA-Dev communication contract
└── KNOWLEDGE_README.md    # This file (explains schemas)
```

**File Count:** 5 total (consolidated from 70+ individual files)

---

## 📋 requirements.json

**Owner:** dev_agent (CRUD operations)  
**Consumer:** qa_agent (read-only)

### Schema

```json
{
  "requirements": [
    {
      "id": "REQ-001",
      "title": "Excel data adapter",
      "description": "Create adapter to read test data from Excel files",
      "acceptance_criteria": [
        "Read .xlsx files",
        "Parse into key-value format",
        "Support multiple sheets"
      ],
      "status": "implemented",
      "priority": "high",
      "created": "2026-02-06T10:00:00Z",
      "last_updated": "2026-02-06T14:00:00Z",
      "implementation_notes": "Uses xlsx library, supports formulas",
      "verified_by": "QA-VERIFICATION-20260206-143000",
      "verification_outcome": "PASS"
    }
  ]
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (REQ-NNN format) |
| `title` | string | ✅ | Short requirement name |
| `description` | string | ✅ | What needs to be built |
| `acceptance_criteria` | array | ✅ | Testable criteria for completion |
| `status` | enum | ✅ | `planned`, `in_progress`, `qa_review`, `complete`, `cancelled` |
| `priority` | enum | ❌ | `low`, `medium`, `high`, `critical` |
| `created` | ISO 8601 | ✅ | When requirement was added |
| `last_updated` | ISO 8601 | ✅ | When requirement was last modified |
| `implementation_notes` | string | ❌ | Technical notes about implementation |
| `verified_by` | string | ❌ | Task ID of QA verification |
| `verification_outcome` | enum | ❌ | `PASS`, `FAIL`, `BLOCKED`, `CONDITIONAL` |

### CRUD Operations (Dev Agent Only)

**Create:**
```powershell
$requirements = Get-Content tooling/qa/knowledge/requirements.json | ConvertFrom-Json
$newReq = @{
    id = "REQ-$(($requirements.requirements.Count + 1).ToString('D3'))"
    title = "New feature"
    description = "..."
    acceptance_criteria = @("...")
    status = "planned"
    created = (Get-Date -Format "o")
    last_updated = (Get-Date -Format "o")
}
$requirements.requirements += $newReq
$requirements | ConvertTo-Json -Depth 10 | Set-Content tooling/qa/knowledge/requirements.json
```

**Read:**
```powershell
$requirements = Get-Content tooling/qa/knowledge/requirements.json | ConvertFrom-Json
$req = $requirements.requirements | Where-Object { $_.id -eq "REQ-001" }
```

**Update:**
```powershell
$requirements = Get-Content tooling/qa/knowledge/requirements.json | ConvertFrom-Json
$req = $requirements.requirements | Where-Object { $_.id -eq "REQ-001" }
$req.status = "complete"
$req.last_updated = Get-Date -Format "o"
$requirements | ConvertTo-Json -Depth 10 | Set-Content tooling/qa/knowledge/requirements.json
```

**Delete (Rare):**
```powershell
$requirements = Get-Content tooling/qa/knowledge/requirements.json | ConvertFrom-Json
$requirements.requirements = $requirements.requirements | Where-Object { $_.id -ne "REQ-001" }
$requirements | ConvertTo-Json -Depth 10 | Set-Content tooling/qa/knowledge/requirements.json
```

---

## 🎯 features.json

**Owner:** dev_agent (writes all 3 sections)  
**Consumer:** qa_agent (read-only)

### Schema

```json
{
  "user_login": {
    "user_request": {
      "prompt": "Add email-based authentication",
      "timestamp": "2026-02-06T15:00:00Z",
      "agent_mode": "BUILD"
    },
    "fix_requests": [
      {
        "prompt": "Fix QA issues",
        "timestamp": "2026-02-06T16:30:00Z",
        "agent_mode": "FIX",
        "qa_verification_id": "QA-VERIFICATION-LOGIN-EMAIL_20260206"
      }
    ],
    "requirement_id": "REQ-042",
    "current_state": {
      "exists": true,
      "files": ["src/auth/login.ts"],
      "analysis": "Current implementation uses username-only authentication. No email support.",
      "integrations": ["src/auth/session.ts", "src/database/users.ts"],
      "researched_at": "2026-02-06T15:05:00Z",
      "researcher": "dev_agent"
    },
    "implementation_plan": {
      "goal": "Add email-based authentication",
      "changes_required": [
        {
          "file": "src/auth/login.ts",
          "type": "modify",
          "reason": "Add email field to login form and validation",
          "estimated_lines": 25
        }
      ],
      "risks": ["Breaking change: existing username-only logins"],
      "dependencies": [],
      "planned_at": "2026-02-06T15:10:00Z"
    },
    "new_version": {
      "implemented": true,
      "files_changed": ["src/auth/login.ts", "tests/auth/login.test.ts"],
      "files_added": [],
      "implementation_summary": "Added email-based authentication alongside username login.",
      "breaking_changes": [],
      "migration_notes": "Existing username logins still work.",
      "test_results": {
        "unit_tests": "15/15 passed",
        "integration_tests": "3/3 passed",
        "coverage": "94%"
      },
      "qa_fixes": [],
      "documentation_updated": true,
      "tests_updated": true,
      "completed_at": "2026-02-06T16:00:00Z",
      "implementer": "dev_agent"
    },
    "dev_completion": {
      "status": "COMPLETE",
      "ready_for_qa": true,
      "completed_at": "2026-02-06T16:00:00Z",
      "notes": "All acceptance criteria met. Tests passing locally.",
      "test_pass_rate": "15/15 (100%)",
      "breaking_changes": false,
      "dev_confidence": "high",
      "iteration": 1,
      "fixes_from_qa": []
    }
  }
}
```

### Section Descriptions

**0. `user_request` (EXACT user prompt)**

Dev agent captures the EXACT words the user said:
- What did the user literally ask for?
- When did they ask?
- What mode was dev in (BUILD vs FIX)?

**Why critical for QA:**
QA verifies dev fulfilled the USER'S request, not dev's interpretation.

**0b. `fix_requests` (Iteration tracking)**

If user asks dev to fix QA issues multiple times:
- Each fix request logged
- Tracks QA iteration cycle
- Links to QA verification IDs

**1. `current_state` (Research BEFORE coding)**

Dev agent researches what currently exists before making changes:
- Which files implement this feature?
- What are the current limitations?
- What systems does it integrate with?
- What's the current architecture?

**2. `implementation_plan` (Plan BEFORE coding)**

Dev agent plans the changes:
- What files need modification?
- What are the risks?
- What dependencies exist?
- What's the high-level approach?

**3. `new_version` (Documentation AFTER coding)**

Dev agent documents what was built:
- What files were changed/added?
- What was implemented?
- What tests were added?
- Are there breaking changes?

**4. `dev_completion` (COMPLETION SIGNAL for QA)**

Dev agent formally signals work is done:
- Is work COMPLETE, PARTIAL, or BLOCKED?
- Is it ready for QA verification?
- What's dev's confidence level?
- What iteration is this (1st build, 2nd fix, etc.)?
- Did dev fix QA findings from previous iteration?

**Why critical:**
- QA knows when to start verification
- QA can adjust scrutiny based on dev_confidence
- QA can check if previous findings were addressed (iteration > 1)

### Field Descriptions

#### user_request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✅ | EXACT user words (not dev's interpretation) |
| `timestamp` | ISO 8601 | ✅ | When user made request |
| `agent_mode` | enum | ✅ | `BUILD`, `FIX` |

#### fix_requests (array)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✅ | EXACT user words for fix request |
| `timestamp` | ISO 8601 | ✅ | When fix requested |
| `agent_mode` | enum | ✅ | Always `FIX` |
| `qa_verification_id` | string | ✅ | Which QA verification this responds to |

#### current_state

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exists` | boolean | ✅ | Does this feature already exist? |
| `files` | array | ✅ | Files that implement current version |
| `analysis` | string | ✅ | Current implementation details |
| `integrations` | array | ❌ | Connected files/systems |
| `researched_at` | ISO 8601 | ✅ | When research was completed |
| `researcher` | string | ✅ | Agent that did research |

#### implementation_plan

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `goal` | string | ✅ | High-level objective |
| `changes_required` | array | ✅ | List of file changes planned |
| `risks` | array | ✅ | Potential issues |
| `dependencies` | array | ✅ | Other features/requirements needed |
| `planned_at` | ISO 8601 | ✅ | When plan was created |

#### changes_required (sub-object)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | string | ✅ | File path |
| `type` | enum | ✅ | `add`, `modify`, `delete` |
| `reason` | string | ✅ | Why this change |
| `estimated_lines` | number | ❌ | Estimated LOC |

#### new_version

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `implemented` | boolean | ✅ | Is implementation complete? |
| `files_changed` | array | ✅ | Files modified |
| `files_added` | array | ✅ | Files added |
| `implementation_summary` | string | ✅ | What was built |
| `breaking_changes` | array | ✅ | List of breaking changes |
| `migration_notes` | string | ❌ | How to upgrade |
| `test_results` | object | ✅ | Test pass/fail counts |
| `qa_fixes` | array | ✅ | Fixes applied after QA review |
| `documentation_updated` | boolean | ✅ | Were docs updated? |
| `tests_updated` | boolean | ✅ | Were tests added/modified? |
| `completed_at` | ISO 8601 | ✅ | When implementation finished |
| `implementer` | string | ✅ | Agent that implemented |

#### dev_completion

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | enum | ✅ | `COMPLETE`, `PARTIAL`, `BLOCKED` |
| `ready_for_qa` | boolean | ✅ | Is QA allowed to start verification? |
| `completed_at` | ISO 8601 | ✅ | When dev finished (or got blocked) |
| `notes` | string | ✅ | Dev's assessment of completion |
| `test_pass_rate` | string | ✅ | "N/N (percentage)" |
| `breaking_changes` | boolean | ✅ | Any breaking changes? |
| `dev_confidence` | enum | ✅ | `low`, `medium`, `high` |
| `iteration` | number | ✅ | 1 = first build, 2+ = fixes after QA |
| `fixes_from_qa` | array | ✅ | QA findings addressed (empty if iteration=1) |

---

## 📝 mistakes.jsonl

**Owner:** BOTH agents (append-only)  
**Consumer:** BOTH agents (read for learning)

### Format

**JSONL (JSON Lines)** - Each line is a complete JSON object.

### Schema

```json
{"timestamp":"2026-02-06T14:23:00Z","agent":"qa_agent","category":"false_alarm","issue":"flagged_refactor_as_regression","what_flagged":"Password reset function returning different type","why_wrong":"Was intentional improvement from boolean to rich result object","what_missed":["Tests were updated and passing","New type provides better information"],"how_to_avoid":["When return type changes, check if tests were updated","Look for improvement patterns"],"pattern":"Type change + passing tests = likely intentional","task_id":"TASK-123"}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | ISO 8601 | ✅ | When mistake occurred |
| `agent` | enum | ✅ | `dev_agent`, `qa_agent` |
| `category` | enum | ✅ | `false_alarm`, `code_bug`, `process_mistake` |
| `issue` | string | ✅ | Short mistake identifier |
| `what_flagged` | string | ✅ (QA) | What QA incorrectly flagged |
| `code_bug_type` | string | ✅ (Dev) | Type of bug dev made |
| `why_wrong` | string | ✅ | Why it was a mistake |
| `what_missed` | array | ✅ | What should have been checked |
| `how_to_avoid` | array | ✅ | Prevention steps |
| `pattern` | string | ✅ | How to recognize in future |
| `task_id` | string | ❌ | Related verification task |

### Append Operation

**PowerShell:**
```powershell
$mistake = @{
    timestamp = Get-Date -Format "o"
    agent = "qa_agent"
    category = "false_alarm"
    issue = "flagged_refactor_as_regression"
    what_flagged = "Password reset function returning different type"
    why_wrong = "Was intentional improvement"
    what_missed = @("Tests were updated", "New type provides better info")
    how_to_avoid = @("Check test updates when types change")
    pattern = "Type change + passing tests = likely intentional"
    task_id = "TASK-123"
} | ConvertTo-Json -Compress

Add-Content -Path tooling/qa/knowledge/mistakes.jsonl -Value $mistake
```

**Read All Mistakes:**
```powershell
$mistakes = Get-Content tooling/qa/knowledge/mistakes.jsonl | ForEach-Object { $_ | ConvertFrom-Json }

# Filter QA false alarms
$qaFalseAlarms = $mistakes | Where-Object { $_.agent -eq "qa_agent" -and $_.category -eq "false_alarm" }

# Find patterns
$patterns = $mistakes | Group-Object -Property pattern | Sort-Object Count -Descending
```

---

## 🔄 Workflow Integration

### Dev Agent BUILD MODE

1. **CRUD Requirements** → Update `requirements.json`
2. **Research Current State** → Add `current_state` to `features.json`
3. **Plan Implementation** → Add `implementation_plan` to `features.json`
4. **Code the Feature** → Write source code
5. **Document New Version** → Add `new_version` to `features.json`
6. **Signal QA Ready** → Create verification bundle

### QA Agent Verification

1. **Read Context:**
   - `requirements.json` → Find acceptance criteria
   - `features.json` → Read dev's plan and implementation
   - `mistakes.jsonl` → Learn from past errors
2. **Verify Code:**
   - Compare code vs `implementation_plan`
   - Check all `acceptance_criteria` met
   - Detect regressions to `current_state`
3. **Create Findings** → Write `findings.md`
4. **Wait for Dev** → Dev creates `dev_response.md`
5. **Process Feedback:**
   - Remove false alarms
   - Log to `mistakes.jsonl`
   - Update `findings.md`
6. **Final Outcome** → Write `summary.json`

### Dev Agent FIX MODE

1. **Read QA Findings** → Read `findings.md`
2. **Validate Issues** → Check actual code
3. **Fix Valid Issues** → Modify code
4. **Log False Alarms** → Append to `mistakes.jsonl`
5. **Create Response** → Write `dev_response.md`
6. **Update Features** → Add QA fixes to `features.json`
7. **Signal QA** → Ready for re-verification

---

## 📊 Benefits of JSON Structure

**vs Individual .md Files:**

| Aspect | Per-file .md | Single JSON |
|--------|-------------|-------------|
| **File Count** | 70+ files | 5 files |
| **CRUD Operations** | Manual editing | Programmatic |
| **Agent Parsing** | Complex regex | Native JSON |
| **Data Consistency** | Can drift | Single source |
| **Query Speed** | Read many files | Read once |
| **Merge Conflicts** | High risk | Lower risk |
| **Human Readable** | Very high | Medium-high |

**Best of Both Worlds:**
- ✅ Agents use JSON (fast, reliable)
- ✅ Humans can read JSON (well-formatted)
- ✅ README explains schemas (human-friendly)

---

## 🚨 File Ownership Rules

| File | Creator | Updater | Reader |
|------|---------|---------|--------|
| `requirements.json` | dev_agent | dev_agent | qa_agent |
| `features.json` | dev_agent | dev_agent | qa_agent |
| `mistakes.jsonl` | BOTH | BOTH | BOTH |
| `agent_interface.md` | human | human | BOTH |
| `KNOWLEDGE_README.md` | human | human | BOTH |

**QA Agent Boundaries:**
- ✅ Read from `requirements.json`
- ✅ Read from `features.json`
- ✅ Append to `mistakes.jsonl`
- ❌ NEVER modify `requirements.json`
- ❌ NEVER modify `features.json`
- ❌ NEVER delete from `mistakes.jsonl`

**Dev Agent Responsibilities:**
- ✅ CRUD `requirements.json`
- ✅ Write all 3 sections of `features.json` entries
- ✅ Append to `mistakes.jsonl` (false alarm logs)
- ✅ Update feature entries with QA fixes

---

## 📖 Example Usage Scenarios

### Scenario 1: Adding New Requirement

**Dev Agent:**
```powershell
# Read current requirements
$reqs = Get-Content tooling/qa/knowledge/requirements.json | ConvertFrom-Json

# Add new requirement
$newReq = @{
    id = "REQ-042"
    title = "User login with email"
    description = "Users authenticate with email and password"
    acceptance_criteria = @(
        "Login form accepts email and password",
        "Invalid credentials show error",
        "Valid credentials create session"
    )
    status = "planned"
    priority = "high"
    created = Get-Date -Format "o"
    last_updated = Get-Date -Format "o"
}

$reqs.requirements += $newReq
$reqs | ConvertTo-Json -Depth 10 | Set-Content tooling/qa/knowledge/requirements.json
```

### Scenario 2: Researching Feature

**Dev Agent:**
```powershell
# Read features
$features = Get-Content tooling/qa/knowledge/features.json | ConvertFrom-Json

# Add user request + current state research
$features | Add-Member -MemberType NoteProperty -Name "user_login" -Value @{
    user_request = @{
        prompt = "Add email-based authentication"
        timestamp = Get-Date -Format "o"
        agent_mode = "BUILD"
    }
    requirement_id = "REQ-042"
    current_state = @{
        exists = $true
        files = @("src/auth/login.ts")
        analysis = "Current uses username-only. No email support."
        integrations = @("src/auth/session.ts", "src/database/users.ts")
        researched_at = Get-Date -Format "o"
        researcher = "dev_agent"
    }
}

$features | ConvertTo-Json -Depth 10 | Set-Content tooling/qa/knowledge/features.json
```

### Scenario 3: QA Reading Context

**QA Agent:**
```powershell
# Read requirement
$reqs = Get-Content tooling/qa/knowledge/requirements.json | ConvertFrom-Json
$req = $reqs.requirements | Where-Object { $_.id -eq "REQ-042" }

# Read feature
$features = Get-Content tooling/qa/knowledge/features.json | ConvertFrom-Json
$feature = $features.user_login

# Check EXACT user request (not dev's interpretation)
Write-Host "User asked for: $($feature.user_request.prompt)"
Write-Host "At: $($feature.user_request.timestamp)"

# Check dev completion signal
if ($feature.dev_completion.ready_for_qa -ne $true) {
    Write-Error "Dev not ready for QA. Status: $($feature.dev_completion.status)"
    exit 1
}

Write-Host "Dev Status: $($feature.dev_completion.status)"
Write-Host "Dev Confidence: $($feature.dev_completion.dev_confidence)"
Write-Host "Iteration: $($feature.dev_completion.iteration)"

if ($feature.dev_completion.iteration -gt 1) {
    Write-Host "This is a RE-VERIFICATION. Check these fixes:"
    $feature.dev_completion.fixes_from_qa | ForEach-Object {
        Write-Host "  - $($_.finding_id): $($_.description)"
    }
}

# Check dev's plan vs actual code
Write-Host "`nDev planned:"
$feature.implementation_plan.changes_required | ForEach-Object { Write-Host "- $($_.file): $($_.reason)" }

Write-Host "`nDev implemented:"
$feature.new_version.files_changed | ForEach-Object { Write-Host "- $_" }

# Read past mistakes to avoid
$mistakes = Get-Content tooling/qa/knowledge/mistakes.jsonl | ForEach-Object { $_ | ConvertFrom-Json }
$qaPatterns = $mistakes | Where-Object { $_.agent -eq "qa_agent" -and $_.category -eq "false_alarm" } | Select-Object pattern -Unique
```

### Scenario 4: Logging False Alarm

**Dev Agent (after QA validation):**
```powershell
$mistake = @{
    timestamp = Get-Date -Format "o"
    agent = "qa_agent"
    category = "false_alarm"
    issue = "flagged_refactor_as_regression"
    what_flagged = "Function return type changed from boolean to ResetResult"
    why_wrong = "Was intentional improvement with updated tests"
    what_missed = @("Tests were updated to match new type", "New type provides better UX")
    how_to_avoid = @("Check if tests updated when signatures change", "Look for 'improve' in commit messages")
    pattern = "Type change + passing tests + better return value = likely intentional"
    task_id = "TASK-123"
} | ConvertTo-Json -Compress

Add-Content -Path tooling/qa/knowledge/mistakes.jsonl -Value $mistake
```

---

### Scenario 5: Dev Fixing QA Issues (Iteration 2)

**Dev Agent (FIX MODE):**
```powershell
# User says: "Fix QA issues"

# 1. Log fix request
$features = Get-Content tooling/qa/knowledge/features.json | ConvertFrom-Json
$feature = $features.user_login

if (-not $feature.fix_requests) {
    $feature | Add-Member -MemberType NoteProperty -Name "fix_requests" -Value @()
}

$feature.fix_requests += @{
    prompt = "Fix QA issues"
    timestamp = Get-Date -Format "o"
    agent_mode = "FIX"
    qa_verification_id = "QA-VERIFICATION-LOGIN-EMAIL_20260206"
}

# 2. Fix the valid issues (example: added error display to UI)

# 3. Update dev_completion for iteration 2
$feature.dev_completion = @{
    status = "COMPLETE"
    ready_for_qa = $true
    completed_at = Get-Date -Format "o"
    notes = "Fixed error message display in UI. Username login regression addressed."
    test_pass_rate = "17/17 (100%)"
    breaking_changes = $false
    dev_confidence = "high"
    iteration = 2
    fixes_from_qa = @(
        @{
            finding_id = "Finding #1"
            commit = "abc123"
            description = "Added .error-message display in LoginComponent"
        },
        @{
            finding_id = "Finding #2"
            commit = "def456"
            description = "Added username check before email validation"
        }
    )
}

$features | ConvertTo-Json -Depth 10 | Set-Content tooling/qa/knowledge/features.json

Write-Host "✅ FIX COMPLETE - Dev signals iteration 2 ready for QA"
```

---

### Scenario 6: QA Checking Dev Completion Signal

**QA Agent (before starting verification):**
```powershell
$features = Get-Content tooling/qa/knowledge/features.json | ConvertFrom-Json
$feature = $features.user_login
$completion = $feature.dev_completion

# ALWAYS check this before verification
if ($completion.ready_for_qa -ne $true) {
    Write-Error "❌ Dev has NOT signaled ready for QA"
    Write-Error "   Status: $($completion.status)"
    Write-Error "   Notes: $($completion.notes)"
    exit 1
}

Write-Host "✅ Dev signaled ready for QA"
Write-Host "   Status: $($completion.status)"
Write-Host "   Confidence: $($completion.dev_confidence)"
Write-Host "   Iteration: $($completion.iteration)"

if ($completion.iteration -gt 1) {
    Write-Host "`n📋 This is a RE-VERIFICATION"
    Write-Host "   QA findings dev claims to have fixed:"
    $completion.fixes_from_qa | ForEach-Object {
        Write-Host "   - $($_.finding_id): $($_.description) (commit: $($_.commit))"
    }
    Write-Host "`n⚠️  QA must verify these fixes were actually applied"
}

# Adjust scrutiny based on dev_confidence
switch ($completion.dev_confidence) {
    "low" { 
        Write-Host "⚠️  Dev confidence is LOW - Extra scrutiny required"
        Write-Host "   Focus on edge cases and error handling"
    }
    "medium" {
        Write-Host "ℹ️  Dev confidence is MEDIUM - Standard verification"
    }
    "high" {
        Write-Host "✅ Dev confidence is HIGH - Standard verification"
    }
}
```

---

## 🔧 Maintenance

### Backup Strategy

**Before making changes:**
```powershell
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item tooling/qa/knowledge/requirements.json "tooling/qa/knowledge/requirements_backup_$timestamp.json"
Copy-Item tooling/qa/knowledge/features.json "tooling/qa/knowledge/features_backup_$timestamp.json"
```

### Cleaning Old Mistakes

**Archive mistakes older than 6 months:**
```powershell
$cutoff = (Get-Date).AddMonths(-6)
$mistakes = Get-Content tooling/qa/knowledge/mistakes.jsonl | ForEach-Object { $_ | ConvertFrom-Json }

$recent = $mistakes | Where-Object { [DateTime]$_.timestamp -gt $cutoff }
$archive = $mistakes | Where-Object { [DateTime]$_.timestamp -le $cutoff }

# Save recent mistakes
$recent | ForEach-Object { $_ | ConvertTo-Json -Compress } | Set-Content tooling/qa/knowledge/mistakes.jsonl

# Archive old mistakes
$archive | ForEach-Object { $_ | ConvertTo-Json -Compress } | Set-Content "tooling/qa/knowledge/mistakes_archive_$(Get-Date -Format 'yyyyMM').jsonl"
```

### Requirement Status Reporting

**Show all requirements by status:**
```powershell
$reqs = Get-Content tooling/qa/knowledge/requirements.json | ConvertFrom-Json
$reqs.requirements | Group-Object -Property status | Format-Table Count, Name
```

---

## 📚 Further Reading

- **agent_interface.md** - QA-Dev communication protocol
- **Test.agent.md** - Dev agent system prompt (BUILD + FIX modes)
- **Rutvik_QA.agent.md** - QA agent system prompt (verification workflow)

---

**Questions?** Review the agent prompts or check `agent_interface.md` for detailed communication protocols.
