---
name: feedback-spec-may-describe-a-predecessor-system
description: A Confluence/Jira design spec carrying the product name may document a PREDECESSOR system — probe one concrete claim against the live app before building on it
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0a493e2b-a8df-4b02-8548-f6d52e6fbf95
  modified: 2026-07-30T10:46:34.019Z
---

Before treating any design document as describing the system under test, **verify one concrete,
cheap claim from it against the live app.** A spec that carries the product name may document a
predecessor.

**The instance (2026-07-30, cost: a wrong committed plan section).** Confluence page `3871342594`,
"Navigator Legacy Permissions — Design Spec", was read in full and its mechanism written into
`SUBPLAN_GUARDRAIL_ROLE_PARTITION_ORACLE.md` Phase 0 as *"the whole partition mechanism"*: role
`NavRevenueMgmt` governs PG overrides, access is a three-level `NONE/READ/EDIT` scalar, roles are
location-scoped via `GET User/Role?locationId=` and reload on office change — the last of which was
written up as possibly removing a two-account blocker.

A live sweep across 13 offices refuted every part. Navigator Cloud has **no such endpoint**; roles
come from a session-level `GET /navigator/api/auth/session`; the keys are 19 namespaced permissions
like `NavigatorCloud.Pricing.ManagePricing` with **no `NavRevenueMgmt`**; every value is the string
`FullAccess` with no scalar; and nothing varies by office. The page was accurate — about **legacy
HeliosWeb**, the predecessor.

**Why:** LR-063 mandates exhausting Confluence/Jira before declaring anything unknown, which
structurally *increases* exposure to this trap — the more diligently the doc corpus is mined, the
more predecessor-era material gets pulled in. The word "Legacy" was in the page title and still did
not register, because the product name matched and the content was detailed and internally coherent.
Plausibility is not applicability.

**How to apply:**

- Probe **one** falsifiable claim before building on a spec — an endpoint that should 404, a role key
  that should appear, a field that should exist. One `fetch()` settles it.
- Treat "Legacy", "v1", "HeliosWeb", "classic", or a rewrite/successor mentioned anywhere on the page
  as a hard prompt to probe first, not a footnote.
- When it turns out to be predecessor material, **keep it labelled rather than deleting it** — the
  next reader will find the same page and needs to see the refutation attached to it.
- The refutation is itself an asset: it converts a suspected blocker into a measured one and sharpens
  the escalation. Here it turned "we need a read-only-role account" into "we need an account whose
  `NavigatorCloud.Pricing.ManagePricing` is not `FullAccess`", checkable the moment it arrives.

Related: [[feedback_verify_recommendations_vs_design]], [[feedback_self_first_research]],
[[feedback_blocked_reasons_name_the_unlock]], [[feedback_never_conclude_from_redacted_or_name_only_match]].
