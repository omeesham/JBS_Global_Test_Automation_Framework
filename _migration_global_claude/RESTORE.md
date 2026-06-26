# Global ~/.claude restore (PC migration)

Temp folder — reusable bits of the global `~/.claude/` that live OUTSIDE the repo.
Delete this folder after restoring on the new PC.

## What's here
- `memory/`          → your vision + feedback + preferences (Claude steering)
- `settings.json`    → global model/plugins/effort config
- `mcp.json`         → MCP server wiring
- `plugins/`         → installed plugin skills/commands
- `scheduled-tasks/` → cron routines

## Restore on new PC
```bash
# from the cloned repo root:
cp -r _migration_global_claude/memory   "$HOME/.claude/projects/C--Users-rutvi-projects-encore-framework/memory"
cp _migration_global_claude/settings.json "$HOME/.claude/settings.json"
cp _migration_global_claude/mcp.json       "$HOME/.claude/mcp.json"
cp -r _migration_global_claude/plugins  "$HOME/.claude/plugins"
cp -r _migration_global_claude/scheduled-tasks "$HOME/.claude/scheduled-tasks"
```

## NOT included (re-create on new PC)
- `.credentials.json` — live Claude auth token; just run `claude` and log in.
- `projects/` transcripts (646 MB of chat logs) — not needed.
- caches, shell-snapshots, telemetry, debug — runtime junk.
