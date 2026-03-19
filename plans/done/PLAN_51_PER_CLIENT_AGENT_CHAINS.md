# PLAN 51: Per-Client Custom Agent Chains

## Context
Different clients have different needs — some need UI testing agents, some need API testing agents, some need ETL agents in the future. The current pipeline is a fixed 5-agent chain (Requirements → Planner → Generator → Healer → Audit) that's global. We need to make it so each client can have a completely different set of agents and pipeline topology, configurable by super admins.

## Dependencies
- None (this is the foundation for PLAN_50 Admin Orchestration Editor)

## Scope

### Backend: Agent Registry
- New file: `src/server/models/agent-registry.ts`
- Defines all available agent types with metadata:
  ```typescript
  interface AgentType {
    id: string;           // e.g., 'requirements', 'api_testing', 'security_scan'
    name: string;         // Display name
    description: string;  // What this agent does
    icon: string;         // Lucide icon name
    category: 'core' | 'testing' | 'security' | 'data' | 'custom';
    defaultModel: string; // haiku, sonnet, opus
    agentFile: string;    // Path to .agent.md prompt file
    capabilities: string[]; // What it can do
  }
  ```
- Initial registry: 5 current agents + placeholders for future (API, Security, Perf, A11y, ETL)

### Backend: Per-Client Pipeline Definitions
- New DB table: `pipeline_definitions`
  ```sql
  CREATE TABLE pipeline_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    definition JSONB NOT NULL,        -- Full PipelineDefinition JSON
    version INTEGER DEFAULT 1,
    is_default BOOLEAN DEFAULT false,  -- Template definition (no client_id)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by VARCHAR(255)
  );
  ```
- Migration: current global `pipeline-definition.json` → row with `is_default=true, client_id=NULL`
- Each client gets their own row (or inherits default)

### Backend: API Endpoints
- `GET /admin/agent-types` — returns full agent registry
- `GET /admin/pipeline-definition?clientId=xxx` — per-client (falls back to default if none)
- `PUT /admin/pipeline-definition?clientId=xxx` — save per-client definition
- `POST /admin/pipeline-definition/validate` — validate topology before save
- `POST /admin/pipeline-definition/clone-default?clientId=xxx` — copy default to client

### Frontend: Dynamic Pipeline Graph
- `PipelineGraph.tsx` currently has hardcoded `STAGE_META`, `POSITIONS`, `EDGE_DEFS`
- Change: load these dynamically from the pipeline definition for the current client
- New prop: `definition?: PipelineDefinition` — if provided, use it instead of hardcoded values
- Position calculation: auto-layout (dagre or simple left-to-right algorithm) when positions not specified
- Stage names/icons from agent registry metadata

### Frontend: Type Updates
- Add `AgentType` interface to `types/index.ts`
- Add `agentTypes` to API service (`encoreApi.ts`)
- Update `PipelineDefinition` type if needed for per-client fields

### Files to Create/Modify
| File | Action |
|------|--------|
| `src/server/models/agent-registry.ts` | CREATE — agent type definitions |
| `src/server/routes/admin.routes.ts` | MODIFY — add agent-types + per-client endpoints |
| `src/server/models/pipeline-definition.ts` | CREATE — DB model for per-client definitions |
| `website/frontend/src/types/index.ts` | MODIFY — add AgentType |
| `website/frontend/src/services/encoreApi.ts` | MODIFY — add API calls |
| `website/frontend/src/components/pipeline/PipelineGraph.tsx` | MODIFY — dynamic stage loading |
| DB migration file | CREATE — pipeline_definitions table |

## Estimated Effort
Medium — 1-2 sessions (backend + frontend integration)

## Verification
1. `GET /admin/agent-types` returns 5+ agent types with metadata
2. `GET /admin/pipeline-definition?clientId=client1` returns default (no custom yet)
3. `PUT /admin/pipeline-definition?clientId=client1` with modified definition → saves
4. `GET /admin/pipeline-definition?clientId=client1` now returns custom definition
5. PipelineGraph renders correctly with dynamic stage definitions
6. Client with 3 agents → graph shows 3 nodes (not hardcoded 5)
7. Default template unchanged when client definition modified
