---
name: file-based-probes-only
description: Adversarial/verification probes with quoted payloads MUST be file-based scripts — inline shell -e strings mangle escaping and fabricate evidence in both directions
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 03335fd2-8e12-4e12-bcec-d6faadb69f0d
---

Inline `node -e "..."` / `bash -c "..."` probe strings passed through shell double-quoting silently rewrite `\\\"` sequences — the probe tests a DIFFERENT string than intended.

**Incident (2026-07-15, CHEATPROOF drill)**: my inline adversarial battery false-accused Seat B's labor-gate fix of missing the nested `bash -c` evasion. A file-based re-probe showed B was 6/6 all along — the "failing" input had been mangled by shell escaping into a no-backslash variant. The same session's tamper-test also failed twice inline before succeeding as a script file. Fabricated evidence from my own tooling — the exact defect class the CHEATPROOF plan exists to kill, produced by the referee.

**Why:** every quoting layer (bash → node -e → JS string) rewrites backslashes; by three layers deep nobody can eyeball the actual bytes.

**How to apply:** any probe/test whose inputs contain quotes, backslashes, or nesting → Write a `.mjs` file with the cases as literals, run `node file.mjs`. Never `-e` with escaped payloads. Related: [[reference-scorecard-record-runbook]], dispatcher lesson "write full absolute paths".
