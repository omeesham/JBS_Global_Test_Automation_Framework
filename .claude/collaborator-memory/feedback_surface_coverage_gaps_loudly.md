---
name: feedback_surface_coverage_gaps_loudly
description: "When coverage is empty-state / single-office / dialog-only, flag it LOUDLY and ask before ever calling it \"done\""
metadata: 
  node_type: memory
  type: feedback
  originSessionId: aed9b060-0245-42be-84e0-f5b3ba690bf4
---

Never let "done / tested / covered" stand unqualified when the coverage is actually empty-state-only, single-office-only, dialog-open-only, or otherwise NOT the full behavior. Say the limitation in the SAME breath as the status, prominently — and ask before claiming done on a known hole.

**Why:** 2026-07-16 — I described the Corporate Pricing Override **Labor grid** as "tested" when the only assertion that ever ran was the EMPTY state on office 1606 (TC-CPR-OVR-008, 0 rows). The populated Labor grid was never walked (Labor override data doesn't live on 1606/1604). Rutvik discovered this only by interrogating me, called it a "big mistake" and his "last straw on shit cases without letting me know cases are shit due to X,Y,Z." The rule to prevent it (LR-068 no-silent-partial-coverage, LR-040(c) empty-surface, LR-059 real-verification) already existed — the failure was mine in the CHAT SUMMARY: I reported partial coverage as if it were complete.

**How to apply:** any time coverage rests on a thin slice, state it explicitly with the concrete reason (no data on this office / blocked by defect / no fixture / never walked) at the moment you give status — do not wait to be asked. If a surface was never actually driven with real data, that is a NOT-COVERED gap, not "tested." Pairs [[feedback_real_verification]], LR-068, LR-040(c), LR-059.
