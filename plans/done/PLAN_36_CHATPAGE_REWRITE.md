# PLAN_36: ChatPage Rewrite — Tri-Model + Cards (The Super Weapon)

**Status**: Pending
**Dependencies**: After PLAN_34 + PLAN_35 (needs auth upgrade + shared pipeline components)
**Scope**: Split 85KB monolith, tri-model chatbot (haiku/sonnet/opus), cards + buttons UX, wire to real Encore backend

This is the crown jewel. The chatbot must feel like Claude Desktop for QA. It handles EVERYTHING — new runs, JIRA, status, debugging, configuration. Users should rarely need to leave Chat.

---

## Current ChatPage Problems

1. **85KB monolith** — 1500+ lines in one file
2. **Calls fake `/api/generate`** — Express backend keyword-matching agents (line 442)
3. **Falls back to setTimeout animations** when Encore is down (lines 622-660)
4. **Has inline mock data** — hardcoded mockItems for Confluence/SharePoint connections (NOT from mockData.ts — verified zero imports)
5. **Multi-step wizard is rigid** — welcome -> sub-category -> source-select -> connect -> generate -> results -> saved
6. **"Tessa" branding** — the chatbot is called "Tessa" (branding removed in PLAN_33, logic rewrite here)
7. **Only dual-model** — needs tri-model (haiku/sonnet/opus) + thinking toggle

---

## What to KEEP from ChatPage

1. **JIRA connect flow** (CONNECT_FIELDS, connectJira logic) — REAL, works
2. **Conversation persistence** (createChatConversation, saveChatMessage) — REAL, PostgreSQL
3. **JIRA story import** (getJiraStories, getJiraStoryDetails) — REAL, works
4. **Test case save/export** (saveTestCases, exportTestCases) — REAL, PostgreSQL
5. **SSE pipeline subscription** (lines 550-619: subscribeToPipelineEvents) — REAL, works
6. **Test case table with editing** — good UX, keep the inline edit/delete/pagination
7. **Column selector** (ALL_COLUMNS, lines 160-170) — useful for test case customization
8. **Visual pipeline progress** (PIPELINE_STAGES, lines 180-193) — reuse for real pipeline
9. **Page size selector** — good UX pattern

---

## What to REMOVE from ChatPage

1. All inline mock data (hardcoded Confluence/SharePoint mockItems — ChatPage has NO imports from mockData.ts)
2. The `runGeneration()` function that calls `/api/generate` (lines 431-492)
3. All setTimeout animations for simulated pipeline (lines 622-660)
4. Hardcoded fallback test cases (lines 475-479: TC-001, TC-002, TC-003)
5. Connection form fields for non-functional sources (Confluence, SharePoint, Azure Blob, AWS S3, GCP Storage — lines 116-147)
6. Data source selection (DataSrc type, DATA_SOURCES constant — lines 51, 103-108)
7. "Tessa" branding throughout

---

## Chatbot Intelligence Architecture

### Tri-model approach — haiku routes, user's preferred model executes

Claude CLI supports `--model` flag. Haiku ALWAYS handles intent routing (fast, cheap). User's preferred model (sonnet default, or haiku/opus per settings) handles the actual response. Thinking toggle adds "ultrathink" instruction.

```
User message
    |
POST /api/chat/ask { message, conversationId, websiteContext, model?, thinkingEnabled? }
    |
[Model from: per-request override > user's Settings preference > default "sonnet"]
    |
[Step 1: Haiku Intent Router (always haiku — 1-3s)]
  claude -p "{prompt}" --model haiku --output-format json --max-turns 1
  -> Returns: { action, params, response, needsDepth }
    |
[Step 2a: If action is simple API call (80% of messages)]
  Execute action server-side (trigger_run, list_runs, get_detail, cancel_run, etc.)
  Return haiku's response + action results -> DONE (1-3s total)
    |
[Step 2b: If needsDepth OR user selected opus/sonnet explicitly]
  Use user's selected model (haiku | sonnet | opus)
  If thinkingEnabled: prepend "Think deeply and exhaustively." to system prompt
  claude -p "{enriched_prompt}" --model {selected_model} --output-format json --max-turns 3
  -> Returns: deeper analysis + response (3-30s depending on model + thinking)
```

**Model options (shown in Settings + inline Chat toggle):**

| Model  | Speed  | Depth        | Best For                                                      |
|--------|--------|--------------|---------------------------------------------------------------|
| haiku  | 1-3s   | Fast, direct | Quick tasks, status checks, simple triggers                   |
| sonnet | 3-10s  | Balanced     | General use, test generation, most questions (DEFAULT)         |
| opus   | 10-30s | Maximum      | Complex debugging, architecture, deep "why" analysis          |

**Thinking toggle**: When ON, the AI "ultrathinks" — spends more time reasoning before responding. Useful for power users who want exhaustive analysis. When OFF, standard fast responses.

**Why this is best long-term:**
- Haiku is fast enough for intent routing (1-3s, never seen by user)
- ALL messages go through AI — no brittle pattern matching that breaks
- Users CHOOSE their speed/depth tradeoff (power users get opus, casual users get haiku)
- Thinking toggle is a single system prompt instruction — zero complexity
- Works identically with Max subscription (all 3 models, $0 cost)
- When we move to API billing, haiku is 10x cheaper — users who chose haiku save us money

---

## New Backend Endpoint: `POST /api/chat/ask`

```typescript
// website/backend/src/routes/chat.routes.ts (add to existing)
// CRITICAL: Use promisify(execFile) ASYNC, NOT execFileSync — sync blocks entire Express event loop
import { execFile } from 'child_process';
import { promisify } from 'util';
const execFileAsync = promisify(execFile);

router.post('/ask', async (req, res) => {
  const { message, conversationId, websiteContext, model, thinkingEnabled } = req.body;

  // Resolve model preference: per-request > user settings > default
  const userModel = model || req.user.preferred_model || 'sonnet';
  const thinking = thinkingEnabled ?? req.user.thinking_enabled ?? false;

  // 1. Gather live context (non-blocking, failures OK)
  const [runs, usage, workerStatus] = await Promise.allSettled([
    fetch(`${ENCORE_URL}/api/pipeline/list`).then(r => r.json()),
    fetch(`${ENCORE_URL}/api/admin/usage`).then(r => r.json()),
    fetch(`${ENCORE_URL}/api/admin/worker-status`).then(r => r.json()),
  ]);

  // 2. Load conversation history (last 20 messages)
  const history = await getRecentMessages(conversationId, 20);

  // 3. Build prompt with website + service context
  const prompt = buildChatbotPrompt(message, history, {
    recentRuns: runs.status === 'fulfilled' ? runs.value.slice(0, 10) : [],
    usage: usage.status === 'fulfilled' ? usage.value : null,
    workerOnline: workerStatus.status === 'fulfilled' ? workerStatus.value?.connected : false,
    website: websiteContext,
    enabledServices: websiteContext?.enabled_services || ['web'],
  });

  // 4. Step 1: Haiku intent routing (always fast)
  let output: string;
  try {
    const { stdout } = await execFileAsync('claude', [
      '-p', prompt, '--model', 'haiku', '--output-format', 'json', '--max-turns', '1',
    ], { timeout: 15000, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    output = stdout;
  } catch (err) {
    return res.json({
      text: 'AI assistant is temporarily unavailable. Use Dashboard for run history and Settings for configuration.',
      action: 'none', error: true,
    });
  }

  let response = JSON.parse(output);

  // 5. Step 2: If needsDepth OR user explicitly chose opus/sonnet for depth
  if (response.needsDepth || userModel !== 'haiku') {
    const deepPrompt = buildDeepPrompt(message, history, response.reasoning, websiteContext, thinking);
    try {
      const { stdout: deepOutput } = await execFileAsync('claude', [
        '-p', deepPrompt, '--model', userModel, '--output-format', 'json', '--max-turns', '3',
      ], { timeout: 90000, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      response = JSON.parse(deepOutput);
    } catch {
      // Haiku response still valid as fallback
    }
  }

  // 6. Execute action (trigger_run replaces the entire NewRunPage flow)
  if (response.action === 'trigger_run' && response.params) {
    try {
      const run = await fetch(`${ENCORE_URL}/api/pipeline/run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(response.params),
      }).then(r => r.json());
      response.runId = run.runId;
      await trackWebsiteRun(websiteContext.id, run.runId, req.userId);
    } catch {
      response.text += '\n\n(Failed to start pipeline. Is the Encore backend running?)';
    }
  } else if (response.action === 'cancel_run' && response.params?.runId) {
    await fetch(`${ENCORE_URL}/api/pipeline/${response.params.runId}/cancel`, { method: 'POST' });
  }

  // 7. Persist messages
  await saveChatMessage(conversationId, 'user', message);
  await saveChatMessage(conversationId, 'assistant', response.text, { action: response.action });

  res.json(response);
});
```

---

## Haiku System Prompt (fast, intent routing)

```
You are a QA automation assistant. Parse the user's message and respond with JSON.

Context:
- Client: {{clientName}}
- Website: {{websiteName}} ({{websiteUrl}})
- Auth: {{authType}}
- App config: {{websiteConfig}}
- Enabled services: {{enabledServices}}  // ["web", "api", "custom"]
- Worker: {{workerOnline ? "Online" : "Offline"}}
- Recent runs (last 5): {{recentRunsSummary}}
- Total cost: ${{totalCost}} across {{totalRuns}} runs

Available actions:
- trigger_run: Start a test run. Params: { feature, module, intent, targetUrl?, serviceType? }
- list_runs: Show test runs. Params: { status? }
- get_run: Get run details. Params: { runId }
- cancel_run: Cancel a run. Params: { runId }
- configure: Change settings. Params: { changes }
- connect_jira: Start JIRA setup. Params: {}
- show_dashboard: Direct user to Dashboard for visual data. Params: {}
- check_status: Quick status of latest run. Params: {}
- none: Just respond conversationally.

Only offer services that are in enabledServices. If user asks about a disabled
service, explain they can enable it in Settings.

IMPORTANT: Never mention internal terms like "agents", "pipeline stages",
"convergence guards" to the user. Use client-friendly language:
- "agents" -> "our testing engine" or "automated analysis"
- "pipeline stages" -> "testing phases"
- "convergence guards" -> "quality checks"

Respond ONLY with JSON:
{
  "text": "human-readable response",
  "action": "action_name or none",
  "params": { ... },
  "needsDepth": false,  // true ONLY for debugging, analysis, complex "why" questions
  "responseType": "options" | "progress" | "results" | "jira_stories" | "text"
  // options = show clickable choices, progress = show pipeline bar,
  // results = show completion card, jira_stories = show story list, text = plain message
}
```

---

## Deep-Thinking Prompt (uses user's preferred model — sonnet/opus)

```
You are a senior QA automation engineer. The user asked a question that requires
deep analysis. Here's the context:

{{full context: website, runs with stage details, artifacts, convergence guards}}
{{if thinkingEnabled: "Think deeply and exhaustively before responding. Consider all angles."}}

User's question: {{message}}
Initial analysis from fast model: {{haiku reasoning}}

Provide a thorough, expert-level response. Include specific data from the
runs/stages when relevant. Explain what quality checks triggered, suggest fixes
for failing runs, analyze test coverage gaps.

Use client-friendly language — never expose internal implementation details.

Respond with JSON: { "text": "...", "action": "none" }
```

---

## ChatPage Restructure

Split the 85KB monolith into sub-components:

```
website/frontend/src/pages/ChatPage.tsx (main orchestrator, ~200 lines)
  +-- components/chat/ChatMessageList.tsx (message display + scroll)
  +-- components/chat/ChatInput.tsx (text input + send)
  +-- components/chat/ChatActionCard.tsx (NEW — cards + buttons UX)
  +-- components/chat/ChatWelcome.tsx (greeting + quick actions + service context)
  +-- components/chat/ModelSelector.tsx (inline haiku/sonnet/opus toggle + thinking switch)
  +-- components/chat/JiraImportFlow.tsx (JIRA connect + story picker)
  +-- components/chat/PipelineProgress.tsx (stage timeline — reuses StageTimeline from PLAN_35)
  +-- components/chat/TestCaseResults.tsx (table + edit + save + export)
  +-- components/chat/ColumnSelector.tsx (select columns for test cases)
  +-- components/chat/QuickActions.tsx (context-aware based on enabled services)
```

---

## ChatActionCard.tsx — THE v5 UPGRADE

The AI responds with STRUCTURED CARDS, not just text bubbles. This is the modern AI UX pattern (Cursor, Linear, Notion).

The haiku intent router returns a `responseType` field in its JSON:

```json
{
  "text": "...",
  "action": "...",
  "params": { ... },
  "needsDepth": false,
  "responseType": "options" | "progress" | "results" | "jira_stories" | "text"
}
```

### Card types rendered by ChatActionCard.tsx

**`options`** — clickable option buttons (user picks instead of typing):
```
+---------------------------------------------+
|  What do you want to test?                   |
|  [Login & Auth]  [Checkout Flow]             |
|  [Search & Filters]  [User Profile]          |
|  Or describe it: ____________________        |
+---------------------------------------------+
```

**`progress`** — live pipeline progress bar inline in chat:
```
+---------------------------------------------+
|  Testing login & authentication...           |
|  ████████░░░░░░░░ Phase 2/5                  |
|  Analysis -> Planning * -> Generation -> ... |
+---------------------------------------------+
```

**`results`** — test result summary with action buttons:
```
+---------------------------------------------+
|  [check] 12 test cases generated             |
|  [View in Dashboard] [Download] [Run Again]  |
+---------------------------------------------+
```

**`jira_stories`** — clickable story cards from JIRA import:
```
+---------------------------------------------+
|  PROJ-123: Login flow redesign               |
|  PROJ-124: Checkout validation               |
|  PROJ-125: Search performance                |
|  [Select stories to test]                    |
+---------------------------------------------+
```

**`text`** — plain text (fallback for conversational responses)

**Zero extra backend work** — haiku already returns JSON. Frontend just renders it differently based on `responseType`.

**Why this matters for "dumb users"**: They never have to know what to type. The AI always offers the next step as a clickable option. Text input stays for power users.

---

## Chat Flows (after rewrite — CARDS + BUTTONS UX)

### Flow 1: Natural language run creation (REPLACES NewRunPage)

```
User: "Generate tests"
Bot: [responseType: "options"] -> renders ChatActionCard:
     +---------------------------------------------+
     |  What do you want to test?                   |
     |  [Login & Auth]  [Checkout Flow]             |
     |  [Search]  [User Profile]  [Custom...]       |
     +---------------------------------------------+
User: [clicks "Login & Auth"] -- zero typing
Bot: [responseType: "progress"] -> triggers pipeline, shows live progress card:
     +---------------------------------------------+
     |  Testing login & authentication...           |
     |  ████████░░░░░░░░ Phase 2/5                  |
     |  Analysis -> Planning * -> Generation -> ... |
     +---------------------------------------------+
Bot: [responseType: "results"] -> on completion:
     +---------------------------------------------+
     |  [check] 12 test cases generated             |
     |  [View in Dashboard] [Download] [Run Again]  |
     +---------------------------------------------+
```

### Flow 2: JIRA-based trigger

```
User: "Pull stories from JIRA"
Bot: [responseType: "jira_stories"] -> clickable story cards:
     +---------------------------------------------+
     |  PROJ-123: Login flow redesign               |
     |  PROJ-124: Checkout validation               |
     |  PROJ-125: Search performance                |
     |  [Select stories to test]                    |
     +---------------------------------------------+
User: [clicks PROJ-123]
Bot: [responseType: "progress"] -> pipeline runs inline
```

### Flow 3: Status check

```
User: "What's running?"
Bot: [responseType: "text" with inline mini-timeline]
     "Your login testing is in the analysis phase. 2 of 5 phases complete."
     [mini stage timeline card -- client-friendly language]
     (Cost shown only if super admin configured cost_visibility for this client)
```

### Flow 4: Deep analysis (user's preferred model)

```
User: "Why do my tests keep failing?"
Bot: [haiku routes to needsDepth -> uses sonnet/opus per user settings]
Bot: "Looking at your recent runs, the quality checks show repeated patterns..."
     [deep, actionable analysis -- NO internal terms exposed]
```

### Flow 5: Model/thinking override

```
User: [toggles Deep Thinking ON in ModelSelector] "Analyze my test coverage gaps"
Bot: [uses opus + ultrathink -> exhaustive multi-paragraph analysis]
```

### Flow 6: Service-aware behavior

```
User with only "web" enabled: "Can I test my APIs?"
Bot: "API testing isn't currently enabled for your project. You can request
      it in Settings -> Services. Want help with web testing instead?"
```

---

## Demo First Impressions

Card-based welcome message on first load:

```
Bot: "Welcome to IntelliQE. I'm your AI testing assistant.

      Project: {websiteName} ({clientName})
      Worker: * Online
      AI: {modelName} | Deep Thinking: {on/off}
      Recent: 3 runs (2 completed, 1 running)

      [Generate Tests] [Import from JIRA] [View Dashboard] [Check Status]"
```

---

## IP Protection Rules

Bot responses NEVER expose internal terms:
- "agents" -> "testing engine" / "automated analysis"
- "pipeline stages" -> "testing phases"
- "convergence guards" -> "quality checks"
- Model names, Claude CLI, architecture details -> never in user-facing text

---

## Input Validation

- `message`: max 5000 chars
- `conversationId`: UUID format
- `model`: haiku | sonnet | opus (enum)
- Rate limit: 10 req/min/user
- History: last 20 messages per conversation

---

## Files to Modify

- `website/frontend/src/pages/ChatPage.tsx` (major rewrite + split)
- `website/backend/src/routes/chat.routes.ts` (add /api/chat/ask endpoint)

## Files to Create

- `website/frontend/src/components/chat/ChatMessageList.tsx`
- `website/frontend/src/components/chat/ChatInput.tsx`
- `website/frontend/src/components/chat/ChatActionCard.tsx` (NEW — renders options/progress/results/jira_stories/text)
- `website/frontend/src/components/chat/ChatWelcome.tsx`
- `website/frontend/src/components/chat/ModelSelector.tsx` (inline model + thinking toggle)
- `website/frontend/src/components/chat/JiraImportFlow.tsx`
- `website/frontend/src/components/chat/PipelineProgress.tsx`
- `website/frontend/src/components/chat/TestCaseResults.tsx`
- `website/frontend/src/components/chat/ColumnSelector.tsx`
- `website/frontend/src/components/chat/QuickActions.tsx`
- `website/backend/src/services/chatbot.service.ts` (Claude CLI tri-model routing + prompt building)

---

## Verification

- [ ] ChatPage.tsx under 200 lines (orchestrator only)
- [ ] All 10 chat sub-components render independently
- [ ] ChatActionCard renders all 5 responseTypes correctly (options, progress, results, jira_stories, text)
- [ ] POST /api/chat/ask returns valid JSON with responseType field
- [ ] Haiku intent routing completes in under 5s
- [ ] Deep model fallback works when haiku response is valid
- [ ] JIRA connect flow preserved and functional
- [ ] Conversation persistence works (messages saved to PostgreSQL)
- [ ] SSE pipeline subscription shows live progress in chat
- [ ] Test case table editing/save/export preserved
- [ ] ModelSelector toggle switches between haiku/sonnet/opus
- [ ] Thinking toggle adds ultrathink instruction
- [ ] No internal terms ("agents", "pipeline stages", "convergence guards") in any user-facing text
- [ ] Rate limiting enforced (10 req/min/user)
- [ ] Input validation blocks oversized messages
- [ ] Welcome card renders with live project context
- [ ] Service-aware responses respect enabledServices config
