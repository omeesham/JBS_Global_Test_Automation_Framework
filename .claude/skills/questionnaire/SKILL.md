---
name: questionnaire
description: Ask simple yes/no questions to close all gaps and doubts before executing any plan or work — dynamic question chain that adapts based on answers. Use when user says "questions", "ask me", "steering", or before any execution with ambiguity.
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, Agent, AskUserQuestion
---

# /questionnaire — Dynamic Steering Questions

When the user invokes `/questionnaire`, your job is to close ALL gaps, doubts, and ambiguities by asking **dead-simple questions**. This ensures the user can steer you with confidence before you execute anything.

## How It Works

### Step 1: Gather Context (silent — do NOT show this to user)
1. Read the current plan (from `plans/pending/` or conversation context) if one exists
2. Read any relevant files, configs, or code referenced by the plan
3. Internally list ALL topics where you have doubts, gaps, assumptions, or need direction
4. Group topics loosely (e.g., "database", "auth", "naming", "scope", "deployment")
5. Do NOT show the topic list to the user — just start asking

### Step 2: Ask Questions
- Ask **up to 10 questions in a single batch** using the AskUserQuestion tool when topics are independent
- Only use multiple batches when answers from earlier questions materially change what you need to ask next
- Continue until ALL topics are resolved

### Step 3: Summarize
When all topics are covered, output a clean **"Decisions Made"** summary — a numbered list of every decision the user made, grouped by topic.

---

## QUESTION FORMAT RULES (MANDATORY — NEVER BREAK THESE)

### DO:
- **Yes / No / or type your answer** — that's it
- **One concept per question** — never bundle two decisions into one question
- **One short sentence of context max** — only if absolutely needed
- **Use the user's language** — plain English, no jargon
- **Give a default suggestion** when you have one — "Should X be Y? yes/no"

### Examples of GOOD questions:
```
1. Should the pipeline run all 5 agents automatically without you clicking anything? yes/no
2. Database: keep using PostgreSQL in Docker? yes/no
3. Website name on the UI: "Encore"? yes/no/custom
4. Should failed tests auto-retry up to 3 times? yes/no
5. Agent model for requirements stage: use Haiku (cheaper) or Sonnet (smarter)?
```

### DON'T (BANNED — NEVER DO THESE):
- **No 4-option multiple choice** — if there are options, make it "A or B?" max
- **No paragraphs of context** — if you need more than one sentence, you're overexplaining
- **No technical jargon** — say "save to database" not "persist to PostgreSQL via Prisma ORM"
- **No compound questions** — "Should we do X and also Y?" is TWO questions, ask them separately
- **No hypotheticals** — "If we were to consider..." — just ask directly
- **No "what do you think about..."** — ask a concrete yes/no, not an open-ended opinion
- **No filler questions** — every question must change what you do next. If the answer doesn't affect execution, don't ask it

### Dynamic Chaining Rules:
- If user says **yes** to something → mark resolved, move on
- If user says **no** → ask ONE follow-up: "What should it be instead?" or "Should I skip this entirely?"
- If user gives a **custom answer** → accept it, mark resolved, check if it creates new questions
- If an answer **contradicts** a previous answer → flag it: "Earlier you said X. This conflicts. Which one wins?"
- If an answer **opens a new topic** you hadn't considered → add it to your internal list
- **Never re-ask** a question that was already answered

---

## When to Use This Skill

**Identity**: ALL. No identity restrictions for this skill.

The user will invoke `/questionnaire` when:
- They want to sign off on a plan before execution
- They lack confidence in what you're about to do
- They want to redirect your approach
- A plan was created and needs steering before `/execute`
- Any time they feel you might be making assumptions

## Rules
- NEVER skip Step 1 (context gathering) — you must know what you're asking about
- NEVER show the internal topic list — just ask naturally
- NEVER ask questions you can answer by reading the code — only ask what requires human judgment
- NEVER batch more than 5 questions — keep it digestible
- ALWAYS end with a Decisions Made summary
- If there are genuinely zero doubts (rare), say so honestly and ask if the user has any doubts for YOU

## Auto-Calls

None — this is a standalone skill. Called by `/chain` Phase 3 when blocking questions exist.

## Output

A numbered "Decisions Made" summary grouped by topic, listing every decision the user made during the session.
