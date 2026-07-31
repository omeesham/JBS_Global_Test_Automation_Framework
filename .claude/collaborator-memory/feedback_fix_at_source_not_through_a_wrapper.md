---
name: feedback_fix_at_source_not_through_a_wrapper
description: "Fix the thing at its source. A wrapper/proxy/interceptor that makes N call sites behave correctly is a patch over the problem, not a fix — and it buys itself a test suite of its own"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 97fc2a8f-d682-49e5-ad02-431273e486b4
  modified: 2026-07-30T20:08:01.450Z
---

When something needs to be right at many call sites, **fix it at each site**. Do not build a wrapper,
proxy, interceptor, or decorator that makes them all behave correctly from the outside.

Rutvik, 2026-07-31, on `src/fixtures/step-wrapper.ts`: *"so u mean instead of fixing the code, u put a
patch that fixes it? … fix it properly, not thru a wrapper! permanent fix."*

**The live case.** The Playwright report showed raw method names instead of readable steps. The correct
fix is Playwright's own `test.step('Select Currency', …)` written inside each page-object method — one
line per method, explicit, boring. Instead a `Proxy` was built that intercepts every page-object method
and derives the step name from the method name. Less typing at authoring time. What it cost:

- The proxy has to distinguish sync from async methods and pass the raw `page` through untouched — real
  complexity that only exists because of the proxy.
- That complexity needed its own test file (`tests/_unit/step-wrapper.spec.ts`, 6 tests). **The patch
  bought itself a test suite.**
- That test file sat in the client's `tests/` folder and shipped to the client — one of the two leaks
  Rutvik named. A patch's blast radius is not local.
- The step names are *derived*, so they are only as good as the method names. A poorly named method
  silently produces a poor report line, with nothing to review.

**Why:** a wrapper moves the problem instead of removing it. The call sites are still wrong; a layer is
now hiding that. The layer becomes load-bearing, needs tests, needs maintenance, and fails in ways the
original problem never could. "Fewer keystrokes now" is not an engineering argument.

**How to apply:**
- Before writing any interceptor/proxy/decorator/wrapper, write out the plain fix and count the lines.
  If the answer is "one boring line in N places", **write the N lines.** Mechanical repetition is not
  technical debt; cleverness that needs its own test suite is.
- **A patch that requires its own tests is the tell.** If your fix needs a test to prove the fix works
  (as opposed to tests proving the *feature* works), you built a mechanism, not a fix.
- Codegen or a lint rule beats a runtime wrapper when the fix really is mechanical — it puts the real
  line in the real file and leaves nothing to intercept at runtime.
- Applies to shipped client code especially: the client reads it. Explicit beats clever in a deliverable.
  Related: [[feedback_deliverable_needs_justifying_comments]].
- Same failure shape one level up: [[feedback_recurrence_convicts_prior_fix]] — when a fix needs a second
  fix to repair what it broke, the first one was wrong.
