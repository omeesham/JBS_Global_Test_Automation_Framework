---
name: NotCluely KT Reference
description: Complete KT exchange with NotCluely (2026-03-17/18) — their engineering patterns, Claude Code practices, and full deep-dive answers to our 8 questions. Implementation details available. See reference_notcluely_patterns.md for adoptable patterns.
type: reference
---

# NotCluely Knowledge Transfer — 2026-03-17

## Their Stack (Context Only — NOT for adoption unless admin asks)
- React frontend, Python backend, PostgreSQL, AI features
- SaaS platform with chatbot interface

## Their Engineering Patterns (Revisitable Reference)

| # | Pattern | Problem It Solves | Their Approach | Ask Them For |
|---|---------|------------------|----------------|-------------|
| 1 | **Role-based UI chatbot** | Different users need different experiences from same interface | Single component adapts per user role. Keeps codebase simple. | Component architecture, role detection logic, how they handle role changes |
| 2 | **AI-gated task execution** | Automated commands running without oversight = risk | Pipeline with AI review step before anything executes automatically | Decision logic, override mechanism, what gets reviewed vs auto-approved |
| 3 | **Test results as structured DB data** | CI logs are unqueryable, can't surface in dashboards | Store test results as structured data in database, not just log files | DB schema, query patterns, how they surface in dashboards |
| 4 | **Conversational bug reports** | Forms are friction, users skip details, copy-paste is tedious | Users describe issues in chat, AI captures + categorizes automatically. Admin sees pre-sorted list. | Chat→structured data pipeline, AI categorization prompts, admin UI |
| 5 | **Layered content protection** | Single defense layer = single point of failure | Multiple independent defense layers, each targeting different method. Bypassing one doesn't help with others. | Architecture of layers, what methods each targets, how they're independent |

## Their Claude Code Practices (Assessed)

| Practice | Our Equivalent | Verdict |
|----------|---------------|---------|
| Strong CLAUDE.md | `copilot-instructions.md` (252 lines) + `MEMORY.md` (94 lines) + `AGENT_SHARED_RULES.md` (461 lines) | We're ahead |
| Memory: index + topics + real-time mistake journal | MEMORY.md index + 15 topic files + `agent-mistakes.md` (216 lines) + `agent-escalations.json` + auto-sync injection | We're ahead (auto-sync is more advanced) |
| Skill-based workflows | 6 custom skills + 6+ plugin skills | We're ahead |
| Multi-agent split (plan/execute) | 5-agent pipeline + schema-driven orchestration + anti-collusion | We're significantly ahead |
| Quality habits (limit retries, verify, self-audit) | 3 convergence guards + 3x enemy audit + self-audit checklist + max 2 FIX cycles | We're ahead |

**Caveat**: Comparison based on their high-level summary only. Their implementations may be deeper than described.

## What We Can Teach Them (7 Patterns)
1. Full-chain audit (`/audit`) — prompt→intent→plan→execution + missing audit
2. Dynamic questionnaire (`/questionnaire`) — pre-execution gap-closing
3. Autonomous plan chaining (`/chain`) — sequential execution with quality gates
4. Anti-collusion governance (ALL-028 to ALL-037)
5. Convergence guards (3 types in JSON config)
6. Failure classification + triage routing
7. Mistake injection with auto-sync into agent context

## Questions Asked (ALL ANSWERED — Part C received 2026-03-18)
1. What specific skills do you have? — **15 custom skills + auto-routing table**
2. How does the AI review gate work? — **Allowlist (287+ patterns) + deny list + 2-tier backend**
3. Test results DB schema + query patterns — **TestResult table with run_id grouping, M2M endpoints**
4. Chat→bug report pipeline details — **Dual model: BugReport (raw) + ChatSubmission (AI-enriched)**
5. Layered content protection architecture — **8-layer system (N/A for Encore)**
6. Real-time mistake capture mechanism — **6 explicit triggers, BLOCKING capture**
7. How do 2 agents avoid rubber-stamping? — **6 mechanisms (we're stronger here)**
8. CLAUDE.md structure + compounding — **~400 lines, 16 sections, /reflect + /compile-learnings graduation loop**

## Part C Answers Received (2026-03-18)

All 8 questions answered in full. Gap analysis completed — see [reference_notcluely_patterns.md](reference_notcluely_patterns.md) for adoptable patterns.

### Summary of Their Answers

| Q# | Topic | Key Takeaway | vs Encore |
|----|-------|-------------|-----------|
| 1 | Skills (15 custom) | Auto-routing table maps user intent→skill without `/slash` commands. `/execute` chains 3-10 skills. Context dedup markers. | We have 6 more-disciplined skills but lack auto-routing |
| 2 | Permission gate | Allowlist (287+ patterns) + explicit deny list for destructive ops | Same philosophy. Their deny list is a small improvement |
| 3 | Test results DB | TestResult table with run_id grouping, M2M endpoints, failure dashboards | We use file artifacts — different paradigm, theirs better for queries |
| 4 | Bug pipeline | Dual model: raw BugReport + AI-enriched ChatSubmission (category, sentiment, urgency, frustration). Prompt injection detection. | We lack AI enrichment + vetting protocol |
| 5 | Content protection | 8-layer system targeting vision + text models. Self-healing via MutationObserver | N/A — different product, not relevant to Encore |
| 6 | Mistake capture | 6 explicit triggers (user corrects, retry, unexpected state, output!=evidence, command errors, approach changed). BLOCKING. | We have blocking capture but triggers less explicit |
| 7 | Anti rubber-stamping | 6 mechanisms: verify 3+ claims, folder-as-status, evidence tables, max 2 cycles, parallel audits, 4D verification | **We're stronger** — §8 + trust levels + per-agent checklists |
| 8 | CLAUDE.md + compounding | ~400 lines, 16 sections. Learning loop: mistakes→/reflect→patterns→/compile-learnings→graduated rules | We have more memory but lack reflect/compile/graduate cycle |

### Comparative Verdict
- **Encore ahead**: Anti rubber-stamping, memory system (17 files vs ~10), distributed governance, context compaction
- **NotCluely ahead**: Learning loop graduation (/reflect + /compile-learnings), auto-skill routing, explicit mistake triggers
- **Even**: Permission model, evidence tables, max 2 fix cycles, blocking capture, inherited work verification

## Status
- KT exchange COMPLETE (both directions answered)
- Adoptable patterns extracted to [reference_notcluely_patterns.md](reference_notcluely_patterns.md)
- Future implementation pending Rutvik's review
