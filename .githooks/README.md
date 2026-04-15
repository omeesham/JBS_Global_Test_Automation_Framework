# Git Hooks

Shared git hooks for this repo. Not active by default — enable once per clone:

```bash
npm run plans:hooks:install
```

That sets `git config core.hooksPath .githooks`.

## Hooks

- **pre-commit** — if any `plans/pending/*.md` or `plans/done/*.md` files are staged,
  re-runs `npm run plans:reindex` and auto-stages `plans/INDEX.md` so the index
  can never drift from the filesystem state.

## CI gate (no install required)

CI / scripts can run `npm run plans:reindex:check` to fail if INDEX.md is stale.
