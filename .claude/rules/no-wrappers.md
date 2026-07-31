---
description: No runtime Proxy interception in client page-object source
paths:
  - "clients/*/src/**"
---

# No Runtime Proxy in Client Page Objects

When many call sites need to share a behaviour, put the behaviour at each call site using a method decorator (such as `@step`), or extract a shared helper the method calls directly. Do not build a `Proxy` that intercepts calls from outside.

**Why**: a Proxy hides the labelling from every reader of the method — the intent is invisible unless you know the Proxy exists and hunt for its handler. A decorator above the method is readable at a glance.

**Origin**: PLAN_FIX_AT_SOURCE_NOT_WRAPPERS, 2026-07-31 — the page-object step Proxy was retired and replaced with per-method `@step` decorators.

**Enforcement**: `scripts/lib/forbidden-patterns.mjs` — `new Proxy(` and `ProxyHandler` are banned in client source via the write-time hook, pre-commit gate, and ship-time check.
