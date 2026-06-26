---
name: Client Delivery Business Model
description: How the client delivery works — we build+maintain, they use. Ongoing model with versioned updates. Client runs in CI.
type: project
---

Client repo delivery is an ONGOING service model:
- We build + maintain the Playwright test automation framework
- Client uses it to find bugs in their systems automatically
- They run tests in their CI, get reports (HTML for humans, JUnit/JSON/Allure for AI/RCA/tech)
- We push versioned updates; they pull and run
- They don't write tests, modify configs, or extend the framework
- IP protection = business model + stripped source (no obfuscation needed)

**Why:** Client pays for bug detection service, not framework ownership. They want bugs found automatically so their devs fix and move on.

**How to apply:** When making delivery decisions, always favor "bare minimum to RUN tests and GET reports". Don't ship dev tooling (eslint, prettier) or internal docs. Ship all report formats. Keep session reuse for CI speed.
