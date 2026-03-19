# PLAN 49C: n8n-Style Visual Pipeline Graph

## Context
Current pipeline visualization is linear timelines (PipelineProgress vertical, StageTimeline horizontal). Need animated node graph showing agent-to-agent flow like n8n — nodes connected by animated edges with real-time status.

## Pre-Audit Findings (Refined)
1. usePipelineSSE has phantom "execution" stage — graph must use pipeline-definition.json topology
2. DAG has cycles (healing→healing, healing→planning, audit→healing) — dagre can't handle, use manual positions
3. Don't replace PipelineProgress — add as Graph/Timeline tab toggle in RunDetailDrawer
4. Realistic effort: ~350 lines (custom nodes + edges + layout + animations)

## What to Build
1. **Install dependency**: `@xyflow/react` (React Flow v12+)
2. **New component**: `PipelineGraph.tsx` (~300 lines) with:
   - 5 agent nodes positioned manually in left-to-right DAG layout
   - Topology from pipeline-definition.json `stages[].next` for edges
   - Conditional routing visible (labeled edges: "pass", "fail", "selector issues")
   - Real-time status per node (pending/running/completed/failed/awaiting_triage)
   - Animated edges on active path, static on completed
   - Running node has pulse animation
   - Custom node component: name, status badge, model, cost, duration
   - Completed runs render same graph with final states (no animation)
3. **Integration**: Tab toggle in RunDetailDrawer header ("Graph" / "Timeline" buttons)

## Manual Node Layout
```
                                ┌──────────┐
                          ┌────►│  Audit   │───► completed
                          │pass └──────────┘
┌─────────┐  ┌─────────┐  ┌──────────┐       │critical
│  Reqs   │─►│ Planner │─►│Generator │       ▼
└─────────┘  └─────────┘  └──────────┘  ┌──────────┐
                  ▲            │fail     │  Healer  │◄─┐
                  │            └────────►│          │──►│ (retry)
                  │  selectors  │        └──────────┘
                  └─────────────┘             │pass
                                              └────► audit
```

Positions (x, y):
- requirements: (0, 150)
- planning: (250, 150)
- generation: (500, 150)
- audit: (750, 50)
- healing: (750, 250)

## Files to Modify
- `website/frontend/package.json` — add @xyflow/react
- `website/frontend/src/components/pipeline/PipelineGraph.tsx` — NEW (main graph component)
- `website/frontend/src/components/dashboard/RunDetailDrawer.tsx` — add Graph/Timeline tab

## Edge Cases
- Memoize nodes/edges arrays to prevent React Flow re-renders on every SSE tick
- Healing loop: self-referencing edge with curved path
- Healing→planning edge: goes backward (use smoothstep edge type)
- fitView on mount, disable pan/zoom for drawer (too small)
- Mobile: hide graph, show timeline only (graph needs min ~600px width)

## Effort
~350 lines across 2 files + dependency
