# Bundle Manifest — git-archive ship

**Generated**: 2026-05-19 (post-PLAN_DIST_REGRESSION_AND_N_FIXES — vendoring removed; clients/<id>/src/ ships directly)

The deliverable for any client is `git archive HEAD clients/<client>/` — full stop. There is no curation, no per-file include/exclude decision at ship time. The manifest is the per-client `.gitignore`.

## What ships

- Everything tracked in `clients/<client>/`. Verifiable via `git ls-files clients/<client>/`.
- The client is self-contained: `clients/<client>/src/{core,pages,selectors,types,utils}/`, `tests/`, `config/`, `playwright.config.ts`, etc. No pre-built artifacts.

## What does not ship

- Anything matching the per-client `.gitignore` patterns (CLAUDE.md, specs_planning/, readable_externals/, docs/read_only_docs/, .auth/, .env.*.local, .env.server).
- The entire `pipeline/` directory at repo root (never reachable from `clients/<client>/`).
- Anything else outside `clients/<client>/` (root tsconfig.json, root playwright.config*.ts, root scripts/, etc. — irrelevant to client).

## Ship command

- `npm run client:ship -- --client=<id> --out=<path>`
- Wraps `git archive HEAD clients/<id>/ | tar -x -C <path> --strip-components=2`.
- Pre-flight: deny-list grep (vendor-fresh check is vestigial post-2026-05-19 — meta-absent path always taken).
- Post-flight: deny-list grep + `npx playwright test --list` smoke.

## New client onboarding

- `cp -r clients/encore clients/<new>` then update `package.json`'s `name` field.
- Follow the per-client `.gitignore` template at `clients/encore/.gitignore`.
- The client is self-contained — no separate vendor build required.

## Layer model (3-layer defense)

| Layer | Mechanism | Catches |
|---|---|---|
| 1 | Per-client `.gitignore` (A2) | Anything matching the agent / pipeline patterns is structurally absent from `git archive` output. |
| 2 | LR-049 ship-via-git-archive rule | Any agent or human invoking `cp -r clients/<id>` for ship is HALTed before the action. |
| 3 | Pre-push hook (E4) | At push time, deny-list grep refuses pushes that would leak forbidden patterns. |

If any one layer fails, the others catch.
