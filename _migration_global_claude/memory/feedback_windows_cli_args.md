---
name: Windows cross-spawn cannot handle multiline or special-char CLI args
description: On Windows, cross-spawn goes through cmd.exe which mangles newlines and special chars in args
type: feedback
---

cross-spawn on Windows uses cmd.exe to resolve .cmd wrappers. cmd.exe cannot handle:
- Newline characters in arguments (treats as command separator)
- Special characters: `|`, `{}`, `?` (interpreted as shell metacharacters)
- Combined command lines > 8191 characters

**Why:** Claude CLI's `--system-prompt` arg contained a multi-line system prompt with JSON examples (`{}`), pipes (`|`), and question marks (`?`). cross-spawn passed this through cmd.exe which mangled it. Error: "Input must be provided either through stdin or as a prompt argument when using --print"

Known issue: https://github.com/anthropics/claude-code/issues/3411

**How to apply:** When spawning Claude CLI on Windows:
- Pipe prompts via stdin (`-p -`) instead of CLI args
- Strip ALL `CLAUDE*` env vars (not just `CLAUDECODE`) to prevent nested-session detection
- Add `stripCodeFences()` to handle markdown-wrapped JSON responses from stdin-piped prompts
