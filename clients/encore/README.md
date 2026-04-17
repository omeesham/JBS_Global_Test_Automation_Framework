# clients/encore

Per-client tree for the **Encore** tenant of the framework. Scaffolded by SP-MT-01;
populated by later subplans in the PLAN_MULTI_TENANT_RESTRUCTURE chain.

## Status (SP-MT-01)

Empty skeleton — every subdirectory currently contains only a `.gitkeep`.
All framework code, tests, configs, and docs still live at the repo root.

TypeScript path aliases are wired in `tsconfig.json` but resolve to the **current
root locations**. No behavior changes in this subplan.

| Alias              | Current target (SP-MT-01) | After SP-MT-02            |
| ------------------ | ------------------------- | ------------------------- |
| `@framework/*`     | `src/*`                   | `src/*` (unchanged)       |
| `@client/*`        | `src/*`                   | `clients/encore/src/*`    |
| `@client-tests/*`  | `tests/*`                 | `clients/encore/tests/*`  |

## Planned contents (after SP-MT-02 / SP-MT-03)

| Path                                       | What lives here                                       |
| ------------------------------------------ | ----------------------------------------------------- |
| `clients/encore/src/common/`               | Encore-specific domain constants and helpers          |
| `clients/encore/src/pages/`                | Page objects for Encore's Navigator Cloud app         |
| `clients/encore/src/selectors/`            | Encore selector registry                              |
| `clients/encore/src/utils/`                | Encore-specific test utilities                        |
| `clients/encore/tests/specs/`              | Encore-only Playwright specs                          |
| `clients/encore/tests/setup/`              | Encore-only fixtures and global setup/teardown        |
| `clients/encore/tests/test-data/`          | Encore-only test data (Excel, JSON, etc.)             |
| `clients/encore/config/environments/`      | Encore-only env overrides (`.env.development`, etc.)  |
| `clients/encore/config/allure/`            | Encore-only Allure categories / branding              |
| `clients/encore/docs/read_only_docs/`      | Encore-only agent rules and shared docs               |
| `clients/encore/specs_planning/`           | Encore-only test cases, test plans, and audits        |
| `clients/encore/exports/`                  | Encore-only exported deliverables                     |

The root-level `src/`, `tests/`, `config/`, `docs/`, and `specs_planning/`
continue to host framework-wide code that applies to every client.

## Switching clients

`ACTIVE_CLIENT` (default `encore`) selects the tree under `clients/<id>/`:

```bash
# Run the pipeline for a different client (once SP-MT-02+ land)
ACTIVE_CLIENT=otherclient npm test
```

Persistent overrides live in `config/environments/.env.local`:

```env
ACTIVE_CLIENT=otherclient
```

Programmatic access: `scripts/shared-paths.ts` exports `activeClient()`,
`clientRoot()`, and `clientPath(rel)`. Pipeline scripts migrate to these
helpers in SP-MT-04.

## Roadmap pointer

Full restructure plan: `plans/pending/PLAN_MULTI_TENANT_RESTRUCTURE.md`
(see subplans SP-MT-01 through SP-MT-04 for the ordered rollout).
