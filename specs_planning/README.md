# Test Plans & Test Cases

## ⚠️ AGENT CHECKLIST — Avoid Common Mistakes

**For Copilot agents creating test documentation:**

### ❌ DO NOT:
1. Mark tests as `✅ Automated` when creating initial test cases — use `⚠️ Manual`
2. Set queue stage to `"completed"` — use `"pending_planning"`
3. Add `"testResults"` or `"completedAt"` to queue entries — Generator adds these after running tests
4. Fill "Actual Results" with PASS/FAIL — leave as `(Pending execution)`
5. Add "Automation File" field to test cases — Generator adds this after tests pass
6. Claim 100% automation coverage when Status = Manual

### ✅ DO:
1. Create test cases with `**Status:** ⚠️ Manual`
2. Create queue with `"stage": "pending_planning"`
3. Let Generator update Status → ✅ Automated after tests pass
4. Let Planner/Generator fill execution results
5. Follow TEMPLATE.md structure exactly

**See `test-cases/TEMPLATE.md` for detailed rules and examples.**

---

## How to Request Tests (Start Here)

**Just describe what you want to test in plain English.** No formal tables, no file paths, no selectors needed.

### Example — Describing a Flow

> "I want to test the forgot password flow. User clicks 'Forgot Password?' link on the login page. It opens a new page with an email input field. User fills their email and clicks Submit. If the email is valid, system shows a success message saying 'check your email'. If email is invalid or not found, it shows an error message. If the email field is empty and they submit, it shows a validation error."

### What Happens Next

1. **Copilot agent** updates `REQUIREMENTS.md` if you described a new feature/module:
   - Shows you a short summary of proposed changes (ADD / UPDATE / REMOVE) **before editing**
   - You review and approve — then the file is updated
2. **Copilot agent** creates `specs_planning/test-cases/forgot-password-test-cases.md` with 3 test cases:
   - TC-FORGOT-001: Valid email → success message (High priority)
   - TC-FORGOT-002: Invalid email → error message (Medium priority)
   - TC-FORGOT-003: Empty email → validation error (Medium priority)
3. **Copilot agent** adds queue entry to `specs_planning/agent-queue.json` (`stage: "pending_planning"`)
4. **You invoke agents** (manual trigger, autonomous execution):
   - `@playwright-test-planner` → explores website, creates detailed plan, discovers additional scenarios
   - `@playwright-test-generator` → generates `.spec.ts` files, runs tests
   - `@playwright-test-healer` → fixes any failures

**Note**: Playwright agents (Planner/Generator/Healer) still NEVER modify `REQUIREMENTS.md`. Only Copilot agents (Claude Code, GitHub Copilot, etc.) can, and only with your approval.

### Tips for Describing Flows

- Describe what the user **does** and what they **see** at each step
- Include **happy path** (what works) + **negative cases** (what fails) + **edge cases** (weird input)
- Mention **page transitions** ("clicking X opens a new page with...")
- No need for selectors, file paths, or code — agents discover those
- You can describe multiple flows in one message
- You can also provide truth tables if you prefer (see below)

---

## Directory Structure

```
specs_planning/
├── README.md                           # This file
├── test-plans/                         # Playwright Planner agent outputs
│   └── {feature}-plan.md              # Technical test plans for automation
└── test-cases/                         # Jira-exportable test cases
    ├── TEMPLATE.md                    # Test case template
    └── {feature}-test-cases.md        # Business-readable test cases
```

---

## Purpose

This directory contains two types of documentation:

### 1. Test Plans (Technical) - `test-plans/`
- **Created by**: Playwright Planner agent
- **Format**: Markdown with detailed automation steps
- **Used by**: Generator agent to create `.spec.ts` files
- **Content**: Selector details, exact navigation steps, technical scenarios

### 2. Test Cases (Business) - `test-cases/`
- **Created by**: AI agent automatically (expanded from truth tables)
- **Format**: Jira-compatible markdown (tables, priorities, acceptance criteria)
- **Used by**: Product owners, QA managers, stakeholders, Jira import
- **Content**: User stories, acceptance criteria, test data, expected results
- **Exportable to**: Jira, Azure DevOps, TestRail, Excel

---

## Truth Table Workflow

### Where Truth Tables Live

**Truth tables are stored in test case files**:

- **REQUIREMENTS.md** is a READ-ONLY website knowledge base. Agents read it for context about modules and features but never modify it.

- **specs_planning/test-cases/{feature}-test-cases.md** (Detailed format)
   - Agent converts each truth table row into DETAILED test case
   - Includes preconditions, steps, data, expected results, automation guidance
   - Planner agent uses these details to explore website
   - Element discoveries and selector details are recorded here by agents

---

## Workflow

### When User Provides Truth Table

**User Input**:
```
"Test login validation with truth table:
| Username | Password | MFA | Expected Result |
|----------|----------|-----|-----------------|
| valid    | valid    | yes | Success + redirect |
| valid    | invalid  | n/a | Error: Invalid password |
| invalid  | valid    | n/a | Error: User not found |
| valid    | valid    | wrong | Error: Invalid MFA code |"
```

**AI Agent Actions** (Automatic):

1. **Read REQUIREMENTS.md** for context about the module (READ-ONLY — never modify)

2. **Create specs_planning/test-cases/login-test-cases.md**:
   - Expand each truth table row into FULL test case
   - Include ALL info Planner agent needs:
     - Preconditions (account exists, user logged out, etc.)
     - Detailed test steps (navigate, fill, click, verify)
     - Test data (actual values, sources like .env)
     - Expected results (redirects, error messages, session tokens)
     - Automation guidance (element names, verification points)
   - Mark as `Type: User-Requested`

**User Invokes Planner**: `@playwright-test-planner Explore login flow based on REQ-008`

**Planner Agent Actions** (Automatic):

1. **Read REQUIREMENTS.md** for context about the login module (READ-ONLY)
2. **Read specs_planning/test-cases/login-test-cases.md** → Understand detailed scenarios
3. **Explore website** with those scenarios as baseline
4. **Discover additional scenarios** (forgot password, remember me, account lockout, etc.)
5. **Create specs_planning/test-plans/login-plan.md** → Technical automation steps for ALL scenarios
6. **Update specs_planning/test-cases/login-test-cases.md** → Add agent-discovered test cases (marked `Type: Agent-Discovered`)

**User Invokes Generator**: `@playwright-test-generator Generate tests from test-plans/login-plan.md`

**Generator Agent Actions** (Automatic):

1. **Create .spec.ts files** in `tests/specs/auth/`
2. **Update specs_planning/test-cases/login-test-cases.md**:
   - Add automation file paths to "Related Files" section
   - Change "Automation Status" from ⚠️ Manual to ✅ Automated
   - Update summary (automation count, percentage)

**Final State**:
- `REQUIREMENTS.md` → Unchanged (READ-ONLY)
- `specs_planning/test-cases/login-test-cases.md` → 4 user-requested + 3 agent-discovered = 7 detailed test cases
- `specs_planning/test-plans/login-plan.md` → Technical automation plan for all 7 scenarios
- `tests/specs/auth/login-*.spec.ts` → 7 automated tests

---

### When Planner Explores Without User Truth Table

**User Input**: `@playwright-test-planner Explore contact management module`

**Planner Agent Actions** (Automatic):

1. **Explore website** (contacts CRUD operations)
2. **Create specs_planning/test-plans/contacts-plan.md** → All discovered workflows
3. **Create specs_planning/test-cases/contacts-test-cases.md** → All test cases (marked `Type: Agent-Discovered`)
4. **Do NOT update REQUIREMENTS.md** (no user request, no approval)

**Final State**:
- `REQUIREMENTS.md` → Unchanged (no user feature request)
- `specs_planning/test-plans/contacts-plan.md` → Technical plan
- `specs_planning/test-cases/contacts-test-cases.md` → 10 agent-discovered test cases
- User can review test cases before approving Generator agent

---

## Test Case Format (Jira-Compatible)

See `test-cases/TEMPLATE.md` for complete template.

**Key Sections**:
- **Header**: Feature name, epic, priority, test type, environment, module
- **Summary**: Test case counts, automation percentage, pass rate
- **Truth Table Reference**: Link back to REQUIREMENTS.md (if user-requested)
- **Test Cases**: Detailed scenarios with:
  - ID, Type (User-Requested/Agent-Discovered), Priority, Status
  - User Story, Preconditions, Test Steps (table format)
  - Test Data (with sources like .env), Expected Results
  - Acceptance Criteria, Edge Cases, Related Test Cases
  - Related Files, Automation Guidance, Test Results
- **Change Log**: Track updates by agents

**Example Test Case Structure**:
```markdown
### TC-001: Login with Valid Credentials and MFA

**Type**: User-Requested (Truth Table Row 1)
**Source**: REQUIREMENTS.md → REQ-008 → Truth Table Row 1

**Preconditions**:
- User account exists: valid@example.com
- MFA enabled on account
- User logged out

**Test Steps**:
| Step # | Action | Input Data | Expected Result | Notes for Agent |
|--------|--------|------------|-----------------|-----------------|
| 1 | Navigate to login page | URL: /login | Login form displayed | Check for txtUsername, txtPassword, btnLogin |
| 2 | Enter username | valid@example.com | Field populated | Use element: txtUsername from Login_Elements.csv |
| 3 | Enter password | ValidPass123! | Field masked | Use element: txtPassword |
| 4 | Click Login button | - | MFA prompt appears | Use element: btnLogin |
| 5 | Enter MFA code | {current_totp_code} | Code accepted | Use element: txtMfaCode, generate via otplib |
| 6 | Click Verify button | - | Redirect to /home | Use element: btnMfaSubmit |

**Test Data**:
| Field | Value | Source | Notes |
|-------|-------|--------|-------|
| Username | valid@example.com | .env → USERNAME_AUTOMATION | Existing user |
| Password | ValidPass123! | .env → PASSWORD_AUTOMATION | Valid password |
| MFA Secret | {secret} | .env → MFA_SECRET | TOTP secret |

**Automation Guidance for Planner Agent**:
```typescript
// 1. Navigate to page.goto(config.base_url)
// 2. Fill username: getElement('txtUsername').fill(username)
// 3. Fill password: getElement('txtPassword').fill(password)
// 4. Click login: clickElement('btnLogin')
// 5. Generate MFA: const code = generateTOTP(config.mfa_secret)
// 6. Fill MFA: getElement('txtMfaCode').fill(code)
// 7. Click verify: clickElement('btnMfaSubmit')
// 8. Verify redirect: expect(page.url()).toContain(config.home_url)
```
```

---

## Automation Rules

### ✅ Agent Responsibilities (MUST DO AUTOMATICALLY)

**All AI Agents (Copilot Chat, etc.)**:
- When user provides truth table:
  1. ✅ Read `REQUIREMENTS.md` for context (READ-ONLY — never modify)
  2. ✅ Create `specs_planning/test-cases/{feature}-test-cases.md` (expand each row into detailed test case)
  3. ✅ Mark test cases as `Type: User-Requested`

**Playwright Planner Agent**:
- When exploring website:
  1. ✅ Read `REQUIREMENTS.md` for module context (READ-ONLY)
  2. ✅ Read detailed test cases from `specs_planning/test-cases/{feature}-test-cases.md`
  3. ✅ Explore website based on those scenarios
  4. ✅ Create `specs_planning/test-plans/{feature}-plan.md` (technical automation steps)
  5. ✅ Update `specs_planning/test-cases/{feature}-test-cases.md` (add agent-discovered scenarios with element details)
  6. ✅ Mark agent-discovered scenarios as `Type: Agent-Discovered`
  7. ❌ NEVER modify `REQUIREMENTS.md`

**Playwright Generator Agent**:
- When creating automation:
  1. ✅ Read test plan from `specs_planning/test-plans/{feature}-plan.md`
  2. ✅ Create `.spec.ts` files in `tests/specs/`
  3. ✅ Update `specs_planning/test-cases/{feature}-test-cases.md`:
     - Add automation file paths to "Related Files"
     - Change status from ⚠️ Manual to ✅ Automated
     - Update summary (automation count, percentage)

**Playwright Healer Agent**:
- When fixing broken tests:
  1. ✅ Update `specs_planning/test-cases/{feature}-test-cases.md`:
     - Update "Last Test Run" timestamp
     - Update "Result" (PASSED/FAILED)
     - Add note to "Known Issues" if applicable

### ❌ REQUIREMENTS.md is READ-ONLY

Agents NEVER modify `REQUIREMENTS.md`. All discoveries go in `specs_planning/test-cases/` files:
- Agent-discovered scenarios (marked `Type: Agent-Discovered`)
- Element details (IDs, selectors, attributes)
- Edge cases found during exploration
- Validation behaviors and error messages

---

## Complete Auto-Discovery Workflow (Zero Manual Lookups)

**User never specifies**: REQ-XXX numbers, file paths, test names - agents find everything.

**How to invoke agents**:
1. Open Copilot Chat panel in VS Code (Ctrl+Alt+I or Cmd+Shift+I)
2. Click **@** button in chat input field
3. Select agent from dropdown (`@playwright-test-planner`, `@playwright-test-generator`, `@playwright-test-healer`)
4. Type request (e.g., "discover pending tests")

---

### Full Workflow Example

#### Step 1: User Gives Scenarios (to Copilot)
```
"Test login with:
1. Valid credentials + MFA → Success
2. Invalid email → Error"
```

**Copilot automatically**:
- ✅ Reads `REQUIREMENTS.md` for context (READ-ONLY)
- ✅ Creates `specs_planning/test-cases/login-test-cases.md` (status: ⚠️ Manual)

---

#### Step 2: Invoke Planner (Agent Picker)
**User**: Select `playwright-test-planner` → Type: `"discover pending tests"`

**Planner automatically**:
- ✅ Scans `specs_planning/test-cases/*.md`
- ✅ Lists: "Found 1 pending feature: Login (3 test cases)"
- ✅ Asks: "Which feature?"

**User**: `"Login"`

**Planner continues**:
- ✅ Explores EspoCRM login with real browser
- ✅ Creates `specs_planning/test-plans/login-plan.md`
- ✅ Updates `test-cases/login-test-cases.md` with agent discoveries

---

#### Step 3: Invoke Generator (Agent Picker)
**User**: Select `playwright-test-generator` → Type: `"generate pending tests"`

**Generator automatically**:
- ✅ Scans `specs_planning/test-plans/*.md`
- ✅ Lists: "Found 1 pending plan: Login (5 scenarios)"
- ✅ Asks: "Which plan to automate?"

**User**: `"Login"` (or `"all"`)

**Generator continues**:
- ✅ Creates `.spec.ts` files in `tests/specs/`
- ✅ Updates automation status to ✅ Automated
- ✅ Adds automation file paths to test cases

---

#### Step 4: Invoke Healer (Agent Picker) - If Tests Fail
**User**: Select `playwright-test-healer` → Type: `"fix failing tests"`

**Healer automatically**:
- ✅ Runs ALL tests (`test_run`)
- ✅ Finds failures: "login-with-mfa.spec.ts failed (selector not found)"
- ✅ Debugs issue (element selector changed)
- ✅ Fixes code in `.spec.ts` file
- ✅ Reruns test to verify
- ✅ Updates test case results (timestamp, status, pass/fail)

---

### Summary: What User Does

**Total manual input**: 
1. ✅ Describe scenarios (once)
2. ✅ Select Planner agent → `"discover pending tests"` → `"Login"`
3. ✅ Select Generator agent → `"generate pending tests"` → `"Login"`
4. ✅ Select Healer agent (if needed) → `"fix failing tests"`

**What user NEVER does**:
- ❌ Look up REQ-XXX numbers
- ❌ Specify test plan file paths
- ❌ Specify test case file names
- ❌ Manually track automation status
- ❌ Update documentation (agents do it)

**All agents auto-discover their work!**

---

## Jira Export

### Manual Export
1. Open `specs_planning/test-cases/{feature}-test-cases.md`
2. Copy test case section (TC-XXX block)
3. Create Jira Test ticket
4. Paste into Description field
5. Jira will render markdown tables automatically

### Automated Export (Optional)
```bash
# Convert to CSV for bulk import
node scripts/md-to-jira-csv.js specs_planning/test-cases/login-test-cases.md

# Import CSV to Jira
# Use Jira's CSV import feature
```

### Jira Fields Mapping
| Markdown Field | Jira Field |
|----------------|------------|
| TC-XXX | Test Case ID |
| Feature Name | Summary |
| Priority | Priority |
| Type (User/Agent) | Labels |
| User Story | Description |
| Test Steps | Steps |
| Expected Results | Expected Result |
| Related Files | Attachments/Links |

---

## Key Principles

1. **"Truth tables live in test-cases/"**
   - REQUIREMENTS.md: Static website knowledge base (READ-ONLY for agents)
   - test-cases/: Detailed test scenarios with element discoveries

2. **"What's written must be automated"**
   - Every test case should have automation
   - Unautomated cases marked as ⚠️ Manual

3. **"What's automated must be written"**
   - Every `.spec.ts` file must reference a test case
   - Test case updated with automation file path

4. **"User-requested vs Agent-discovered"**
   - User scenarios → test cases (marked `Type: User-Requested`)
   - Agent scenarios → test cases (marked `Type: Agent-Discovered`)
   - REQUIREMENTS.md → Never modified by agents

5. **"Agents handle documentation automatically"**
   - No manual reminders needed
   - User focuses on features, agents maintain files

---

## Example: Complete Workflow

**Day 1: User Provides Truth Table**
```
User: "Test login with validation matrix:
| Username | Password | MFA | Expected |
|----------|----------|-----|----------|
| valid    | valid    | yes | Success  |
| valid    | invalid  | n/a | Error    |
| invalid  | valid    | n/a | Error    |
| valid    | valid    | wrong | Error  |"

AI Agent (Copilot):
✅ Read REQUIREMENTS.md for context (READ-ONLY)
✅ Created specs_planning/test-cases/login-test-cases.md (4 detailed test cases)
✅ Ready for Planner agent
```

**Day 1: Planning**
```
User: "@playwright-test-planner Explore login module"

Planner Agent:
✅ Read REQUIREMENTS.md for context (READ-ONLY)
✅ Read specs_planning/test-cases/login-test-cases.md (4 detailed scenarios)
✅ Explored website, found 3 additional scenarios
✅ Created specs_planning/test-plans/login-plan.md (7 scenarios total)
✅ Updated specs_planning/test-cases/login-test-cases.md (added TC-005 to TC-007)
```

**Day 1: Generation**
```
User: "@playwright-test-generator Generate from test-plans/login-plan.md"

Generator Agent:
✅ Created 7 .spec.ts files in tests/specs/auth/
✅ Updated specs_planning/test-cases/login-test-cases.md (added automation paths)
```

**Day 2: Export to Jira**
```
QA Manager:
1. Opens specs_planning/test-cases/login-test-cases.md
2. Sees 7 test cases (4 user + 3 agent) ready for Jira
3. Exports to Jira (manual copy or script)
4. All test cases include automation status ✅
```

---

## Maintenance

- **New feature with truth table**: Agent creates test cases automatically (REQUIREMENTS.md is READ-ONLY)
- **Planner explores**: Updates test cases with discoveries automatically
- **Code generated**: Generator updates test cases with automation paths automatically
- **Test failure**: Healer updates test case status automatically
- **Jira export**: Run anytime (test cases always current)

**No manual tracking needed** - agents maintain all files automatically!

---

## File Reference

| File | Purpose | Created By | Updated By |
|------|---------|------------|------------|
| `REQUIREMENTS.md` | Website knowledge base (modules, features, flows) | Team (manual only) | Never (READ-ONLY for agents) |
| `specs_planning/test-cases/TEMPLATE.md` | Test case template | Manual | Manual |
| `specs_planning/test-cases/{feature}-test-cases.md` | Detailed test scenarios (Jira-ready) | Copilot → Planner → Generator | Planner, Generator, Healer |
| `specs_planning/test-plans/{feature}-plan.md` | Technical automation plan | Planner | Never |
| `tests/specs/{feature}.spec.ts` | Executable tests | Generator | Healer |
