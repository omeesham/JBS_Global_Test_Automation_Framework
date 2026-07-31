---
name: project_encore_e2e_multi_location_offices
description: The 6 offices Encore designated for e2e tests needing more than one location — new work only
metadata: 
  node_type: memory
  type: project
  originSessionId: aed9b060-0245-42be-84e0-f5b3ba690bf4
---

Encore-designated e2e offices for any NEW test that needs more than one location (given by Rutvik 2026-07-16, from Encore):

- **4104** — ETS, Dallas
- **4107** — SC, Vermont
- **9220** — C&C/SC, Vegas
- **9311** — SC, Mexico
- **2463** — ETS, Canada (Ontario)
- **8843** — SC, Canada (Quebec)

**Scope rule (now)**: apply ONLY to new work going forward. Do NOT change offices already wired into existing tests.

**Future intent (not now)**: eventually EVERY location used in tests that is NOT one of these 6, NOT 1604, and NOT 1101 will be migrated onto this 6-office list — including old/existing cases. Rutvik deferred this deliberately: we don't care about retrofitting old cases right now. When a future migration pass is authorized, sweep all specs/test-data and convert any office outside {these 6, 1604, 1101} to one of the 6.

Existing/known offices stay as-is: 1604 (default test office, currently blocked by the 4543 duplicate-key server crash on Product Group Override), 1606 (used in override spec — Labor tab empty state only), 1101 (Corporate master, corporate-only data per [[project... ]] LR-ENC-005), 1605 (currency variety), 1107 (HEDGE Corp SGA Budget Only — confirmed to HAVE populated Equipment override rows, seen live 2026-07-16).

Related: LR-ENC-005 (office 1101 master), [[feedback_surface_coverage_gaps_loudly]].
