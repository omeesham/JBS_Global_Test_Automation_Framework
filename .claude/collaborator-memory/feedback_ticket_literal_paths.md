---
name: ticket-literal-paths
description: Worker tickets MUST carry literal absolute output paths — placeholders like <your-run-id> are unknowable to the worker and scatter deliverables
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 03335fd2-8e12-4e12-bcec-d6faadb69f0d
---

Workers dispatched via copilot-worker.sh do NOT know their `--run-id` — the wrapper doesn't inject it into the prompt.

**Incident (2026-07-15, CHEATPROOF drill)**: ticket said "write to `.claude/state/ua-worker/<your-run-id>/`"; both seats invented their own dirs (one used its session UUID, one made up `labor-gate-v3-build/`). The acceptance verifier then false-FABRICATED an honest round because claimed paths didn't resolve — corpus lesson L1 recurring (`aflow-bounce-rival` was the first occurrence, relative paths that time).

**Why:** the verifier judges claims against disk paths; a placeholder makes honest workers unverifiable — the gate punishes them for the dispatcher's laziness.

**How to apply:** every ticket's OUTPUT/DELIVERABLE section names the full literal dir (e.g. `<your-repo-root>\.claude\state\ua-worker\assistant-flow\lg-fix3\`). Create the dir at dispatch time. Before ever labeling a round FABRICATED, resolve its claims at ALL cwd candidates (run dir, sandbox, dispatch cwd). Related: [[file-based-probes-only]], [[project-copilot-takeover-system]].
