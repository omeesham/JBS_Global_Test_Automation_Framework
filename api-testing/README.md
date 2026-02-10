# 🌐 API Testing - Simple Guide for Everyone

**What is this folder?**  
Everything related to testing APIs (the "behind-the-scenes" part of websites that handles data) lives here in ONE place.

**Who is this for?**  
Anyone using AI prompts to create or fix tests - **no programming knowledge required!** Just describe what you want to test.

---

## 📁 Folder Structure (What Goes Where)

```
api-testing/
├── README.md                    ← You are here! Start here for guidance
├── REQUIREMENTS_API.md          ← List of API features and test plans
│
├── api-contracts/               ← "Expected Response Formats"
│   ├── common.api.ts                → Standard API response shapes
│   └── auth.api.ts                  → Login/logout data formats
│
├── api-helpers/                 ← "Connection Tools"
│   ├── base-api.ts                  → Foundation (all connections use this)
│   └── auth-api.ts                  → Login/logout connection
│
└── api-tests/                   ← "Actual Tests"
    └── auth/                        → Login/logout tests
        └── authentication.spec.ts
```

---

## 🎯 How to Use This (AI Prompting Guide)

### **Scenario 1: Create New API Test**

**What you need**: Copy-paste from browser DevTools (Network tab)

**Example prompt**:
```
"Create an API test for contact creation based on this DevTools data:

[Paste from DevTools Network tab - includes URL, request body, response]"
```

**What AI will do automatically**:
1. ✅ Read the pasted data (URL, headers, body, response)
2. ✅ Create response format in `api-contracts/contacts.api.ts`
3. ✅ Create connection helper in `api-helpers/contacts-api.ts`
4. ✅ Create test file in `api-tests/contacts/create-contact.spec.ts`
5. ✅ Update `REQUIREMENTS_API.md` with test plan

**You don't need to**:
- Know TypeScript or JavaScript
- Understand file paths or imports
- Write any code manually

---

### **Scenario 2: Fix Broken API Test**

**What you need**: Tell AI which test is failing

**Example prompt**:
```
"The login test is failing with 'token not found' error.  
Fix it using the new DevTools data I'm pasting below:

[Paste updated API response from DevTools]"
```

**What AI will do automatically**:
1. ✅ Find affected files (api-helpers/auth-api.ts, api-contracts/auth.api.ts)
2. ✅ Update response formats to match new structure
3. ✅ Fix the test in api-tests/auth/authentication.spec.ts
4. ✅ Update documentation in REQUIREMENTS_API.md

---

### **Scenario 3: Understand What a Test Does**

**Example prompt**:
```
"Explain what api-tests/auth/authentication.spec.ts does in simple terms"
```

**What AI will do**:
- Read the test file
- Explain in plain English (no jargon)
- Show what data it sends and expects back

---

## 📖 Folder Details (For Curious Learners)

### **api-contracts/** - "Response Blueprints"
**Plain English**: What the API *should* return when you call it.

**Example**:
- `auth.api.ts` says "Login response MUST include token, username, and email"
- If API returns something different → Test fails (catches bugs!)

**When to update**: When DevTools shows API changed its response format

---

### **api-helpers/** - "Reusable Connectors"
**Plain English**: Functions that talk to the API for you.

**Example**:
- `auth-api.ts` has `login(username, password)` function  
- Tests call this instead of writing HTTP code every time

**When to update**: When new API endpoints added (e.g., "Reset Password")

---

### **api-tests/** - "Test Scripts"
**Plain English**: The actual tests that run and check if API works correctly.

**Example**:
- `authentication.spec.ts` → Tests login, logout, invalid credentials
- Runs independently (no browser needed)

**When to update**: When adding new test scenarios or fixing broken tests

---

## 🚨 Important Rules for AI Agents

When user provides DevTools data, you MUST:

1. ✅ **Extract everything automatically**:
   - Request URL → Becomes endpoint in api-helpers
   - Request body → Becomes input interface in api-contracts
   - Response body → Becomes output interface in api-contracts
   - Status codes → Becomes expected assertions in tests

2. ✅ **Create all 3 pieces** (ONE feature = 3 files):
   - `api-contracts/{feature}.api.ts` - Response format
   - `api-helpers/{feature}-api.ts` - Connection function
   - `api-tests/{feature}/{scenario}.spec.ts` - Test file

3. ✅ **Use environment variables** (NEVER hardcode):
   - Base URL → `process.env.BASE_URL`  
   - Credentials → `process.env.USERNAME_AUTOMATION`, `process.env.PASSWORD_AUTOMATION`  
   - Tokens → Store in test context, NOT in files

4. ✅ **Clean up after tests**:
   - Created test contact? → Delete it in `afterEach` hook
   - Generated authentication token? → Invalidate in `afterEach`
   - Follow pattern: Setup → Test → Cleanup

5. ✅ **Verify exact structure**:
   - DevTools shows `{token, user: {id, name}}` → Test MUST assert exact shape
   - Not just "response exists" → Check EVERY field user showed

6. ✅ **Document in REQUIREMENTS_API.md**:
   - Add REQ-XXX section for every new feature
   - Include original DevTools paste
   - Explain what API does in plain English

---

## 🔗 Related Documentation

- **For test plans**: See `REQUIREMENTS_API.md` (API-specific requirements)
- **For UI testing**: See main `REQUIREMENTS.md` (UI/browser testing)
- **For architecture**: See `docs/ARCHITECTURE.md` (technical deep-dive)
- **For AI agents**: See `.github/copilot-instructions.md` (automation workflow)

---

## ✅ Quick Checklist (For AI Verification)

After creating/updating API tests, verify:

- [ ] Created `api-contracts/{feature}.api.ts` with interfaces matching DevTools
- [ ] Created `api-helpers/{feature}-api.ts` extending `BaseApi`  
- [ ] Created `api-tests/{feature}/{scenario}.spec.ts` with assertions
- [ ] Updated `REQUIREMENTS_API.md` with REQ-XXX section
- [ ] Used environment variables (no hardcoded URLs/credentials)
- [ ] Added cleanup in `afterEach` hooks
- [ ] Tests pass: `npm test api-testing/api-tests/{feature}`
- [ ] TypeScript compiles: `npm run typecheck`

---

## 🆘 Common Questions

**Q: What is "DevTools"?**  
A: The browser's developer panel. Press F12, go to Network tab, perform action in website, click the request, copy data.

**Q: Do I need to know TypeScript?**  
A: No! Just paste DevTools data and describe what you want. AI handles code generation.

**Q: What if API structure changes?**  
A: Paste new DevTools data, tell AI "update {feature} to match this new structure".

**Q: Can I mix API + UI tests?**  
A: Yes! See `docs/ARCHITECTURE.md` - "Hybrid Tests" section for examples.

**Q: How do I run only API tests?**  
A: `npm test api-testing/` (no browser opens, much faster than UI tests)

---

**Last Updated**: 2026-02-08  
**Version**: 1.0 (Initial restructure for non-technical users)
