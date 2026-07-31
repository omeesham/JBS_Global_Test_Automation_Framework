---
name: never-conclude-from-redacted-or-name-only-match
description: A grep match that only proves a variable NAME exists is not evidence about its VALUE; masked/redacted output can never support an identity claim — verify with a value-scoped check (count/shape match on the value side only).
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e010826e-7134-40d4-a540-2ce4761e963d
---

2026-07-17 credential-leak session: Claude declared "your personal creds are used everywhere, automation user never provisioned" because `grep -iE 'NAVIGATOR_USERNAME|<surname>|<given-name>' .env.local` matched — but the match was on the var NAME `NAVIGATOR_USERNAME` itself, and the value (redacted by Claude's own masking pipe) was actually `s-prd-clickauto@psav.com`, the automation account. The false claim was repeated 4× with rising confidence, and Rutvik's direct flag ("there should be an automation user") was denied without running the one check that would settle it.

**Why:** Masking values is mandatory for secret hygiene, but a conclusion drawn from masked data is fabricated evidence. A name-only match proves the key exists, nothing about who/what the value is. Sibling rule to [[gate-trip-probes-need-valid-payloads]] and [[file-based-probes-only]] — all three are "the probe's design must be able to prove the claim before its output counts as evidence."

**How to apply:** Before any claim of the form "X is/isn't the account/value/identity used": run a VALUE-scoped check that keeps secrets hidden but discriminates the claim — e.g. `grep -icE '^VAR=.*<identity-term>' file` (count only), or print the username half only (identities like emails are claims-relevant, not secrets; passwords stay masked). If the user flags a contradiction, the disproving check is MANDATORY before repeating the claim (audit Step 2.5: user-flagged = non-dismissable).
