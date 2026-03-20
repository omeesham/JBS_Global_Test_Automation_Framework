# Vision

Encore Framework is an AI-powered test automation platform. A QA engineer pastes requirements into a chat interface, and the system generates Playwright E2E tests, executes them, self-heals failures, and produces audit reports — all driven by a 5-stage AI pipeline (requirements, planning, generation, healing, audit) with real-time SSE progress updates.

The platform merges two codebases: IntelliQE provides the React chat UI, JIRA integration, and test case management; Encore provides the Playwright framework, pipeline orchestrator, Fastify backend, and local worker. Together they form a single monorepo where the frontend at `website/` talks to both the Express backend (chat, JIRA, template-based generation) and the Encore Fastify backend (AI pipeline, SSE events, worker coordination) through a Vite dual-proxy. The target user is a QA team that wants to go from written requirements to running automation scripts with minimal manual intervention.
