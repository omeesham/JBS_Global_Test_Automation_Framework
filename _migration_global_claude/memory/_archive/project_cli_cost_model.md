---
name: CLI-powered AI cost model
description: Each client gets 1 Claude subscription powering the AI via CLI (no API keys). Scalable later via multi-subscription switching as limits are reached. No Anthropic API SDK.
type: project
---

The AI chat backend uses Claude CLI (subscription-based) instead of Anthropic API SDK (pay-per-token). Each client gets one Claude subscription. The CLI runs per-client. Future scaling: multi-subscription switching as rate limits are reached. This is an intentional cost optimization — avoid API costs entirely.
