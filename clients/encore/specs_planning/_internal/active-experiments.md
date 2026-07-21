# Active Experiments — Encore

Single tracked log of in-flight production-touching experiments. **Gitignored** per
`clients/encore/.gitignore` (under `specs_planning/`). Internal-only.

| ID | Started | Owner | Files touched | Reason | Removal trigger |
|---|---|---|---|---|---|
| EXP-AUTH-STATE-SHARED | 2026-04-30 | Rutvik | `playwright.config.ts`, `playwright.config.ci.ts`, `tests/setup/auth.setup.ts`, `tests/setup/auth-storage.ts`, `tests/setup/fixtures.ts`, `tests/specs/_verification/auth-experiment.spec.ts`, `.github/workflows/playwright-tests.yml` | Shared `storageState` across workers using personal MFA account while shared automation user `s-prd-clickauto@psav.com` is broken. The setup project does ONE TOTP login per run; all workers reuse `.auth/encore-state.json` read-only. Avoids simultaneous MFA conflicts on the personal account. | Encore IT provisions the MFA-less auto-user; revert to single-worker auth (or keep the parallel-run scaffolding without the personal-account dependency). See `clients/encore/CLAUDE.md` § "Temporary credentials" for removal checklist. |

## Why this file lives here

`specs_planning/_internal/` is per-client and gitignored at the per-client level — so
this file is visible to agents working in the source repo, but never enters
`git archive HEAD clients/encore/`. The file replaces the in-config "TEMP_EXPERIMENT"
multi-paragraph blocks (which leaked the human name into shipped CI metadata).
