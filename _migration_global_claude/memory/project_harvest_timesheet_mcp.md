---
name: project-harvest-timesheet-mcp
description: Harvest MCP is wired up for Encore-only — purpose is publishing timesheets + CSV export on request
metadata: 
  node_type: memory
  type: project
  originSessionId: 35ec4f6e-d1de-4dbc-8e9c-c81f38266eb4
---

Harvest MCP server is registered in Claude Code at **local scope** (private to the Encore project, keyed to `C:\Users\rutvi\projects\encore_framework` in `C:\Users\rutvi\.claude.json`) — deliberately NOT user scope and NOT committed to the shared repo. Transport: HTTP, URL `https://api.harvestapp.com/mcp`.

**Purpose (Rutvik, 2026-06-15):** Encore-only. Use it to (1) publish timesheets describing the work done, and (2) export those sheets as CSV — both **only when Rutvik asks**, never proactively.

**Auth status:** ✓ Connected (authenticated 2026-06-15). The harvest server exposes its OWN in-band auth tools — `mcp__harvest__authenticate` (returns an `id.getharvest.com` OAuth URL for the user to open) and `mcp__harvest__complete_authentication` (paste callback URL if the localhost redirect page errors). This is the working path — NOT the connector Directory (Harvest isn't a marketplace connector) and NOT a free-floating Chrome session. Note: the running session must be restarted after `claude mcp add` before the server appears. Remove with `claude mcp remove "harvest" -s local`.
