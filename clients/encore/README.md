# Encore QA Automation

End-to-end Playwright test suite for Navigator Cloud (`cloudapps-e2e.encoreglobal.com`). Produces two reports per run (Playwright HTML + Allure). Browser projects (`chromium`, `chrome`, `firefox`, `webkit`) and parallelism (worker count) are all configurable per run — defaults in `playwright.config.ts`, overridable via CLI flags or environment variables.

---

## Requirements

- Node.js ≥ 18
- npm ≥ 9
- ~1 GB disk for browsers + dependencies
- Network access to `cloudapps-e2e.encoreglobal.com` and Microsoft login endpoints

---

## Quickstart — one-line setup + run + reports

From inside the unzipped folder:

```bash
npm install && npx playwright install chromium && npm run test:cli
```

This installs dependencies + Chromium, then runs the full suite via `test:cli` (which preserves Allure history across runs). After it finishes, view reports with `npm run report` (Playwright HTML) or `npm run allure:open` (Allure).

---

## One-time setup

```bash
npm install
npx playwright install chromium
```

Credentials are not committed — the suite runs in **GitHub Actions**. Set `NAVIGATOR_USERNAME`, `NAVIGATOR_PASSWORD`, and `BASE_URL` under repo **Settings → Secrets and variables → Actions**, then run the **Playwright Tests** workflow (Actions tab → Run workflow). `.env.e2e` holds only non-secret config.

Verify the setup with a single short spec (~60 seconds — exercises auth + a real module flow):

```bash
npm run test:grep -- "TC-LOC-CUR-001" --project=encore-locations
```

Green = credentials + SSO + fixtures all working.

---

## Running the suite

### Recommended — single command, Allure history preserved

```bash
npm run test:cli
```

This stashes Allure history, cleans, restores history, runs the suite, and regenerates the Allure report. The Trend widget accumulates day over day across runs.

### Other test commands

| Command | What it does |
|---|---|
| `npm test` | Run full suite, no history-preservation chain |
| `npx playwright test --project=chromium` | Run via the chromium project |
| `npx playwright test <path> --project=chromium` | Run a single spec or directory |
| `npm run test:chrome` | Run via the `chrome` project (real Chrome channel) |
| `npm run test:debug` / `test:ui` / `test:headed` | Debug, Playwright UI, or headed-browser modes |
| `npm run test:failed` | Re-run only previously-failed tests |
| `npm run test:grep -- "@notes"` | Filter by tag/grep |
| `npx playwright test --list` | List every discoverable test without running |

### Tuning parallelism

Worker count is set by an inline expression in `playwright.config.ts` (CI default 4, local 2). Override per run with the `MAX_WORKERS` env var:

```bash
MAX_WORKERS=4 npm test          # match CI default explicitly
MAX_WORKERS=8 npm test          # try higher locally
MAX_WORKERS=1 npm test          # force serial
```

More workers = faster wall-clock but higher load on the app under test. Module projects keep `fullyParallel: false` so each spec file stays in one worker (required for the LR-019 baseline-reset ordering); different spec files still run in parallel across workers. If 4 introduces state races on shared office=1604, drop the CI default to 2 in the config.

---

## Reports

After every run:

| Path | Contents |
|---|---|
| `reports/html-report/` | Latest Playwright HTML report |
| `reports/allure-report/` | Latest Allure report (with Environment, Categories, Trend) |
| `reports/failure-summary.json` | Machine-readable failure data (see **Failure categorization** below) |
| `reports/junit-results.xml` | JUnit XML for CI dashboards |
| `reports/test-results.json` | Raw Playwright results |

### Viewing reports locally

```bash
npm run report            # opens the Playwright HTML report
npm run allure:report     # generates + opens Allure in the browser
```

### When a test fails

Run `npm run share-for-debugging` after the suite (it's also run automatically in CI). The script writes `reports/share-for-debugging-<timestamp>.zip` containing the diagnostic JSON, traces, screenshots, videos, and logs. Send that one file to the QA automation team — that's all they need.

---

## CI/CD integration

The suite is CI-agnostic. Pick the pattern that fits your pipeline:

**Simplest** — call the chain directly:
```yaml
- run: npm install
- run: npx playwright install chromium
- run: npm run test:cli
- uses: actions/upload-artifact
  with:
    path: reports/
```

**Finer control** — split into stages, upload artifacts between them, set `continue-on-error` on the test step so reports still publish when tests fail.

Scheduling, runner infrastructure, secret management, artifact distribution, and credential rotation are owned by your deployment team — not wired into this repo.

---

## Failure categorization

Every failing run writes `reports/failure-summary.json`. Each failure carries a `failureCategory` classified into one of:

| Category | Who to file with |
|---|---|
| `AUTHENTICATION` | Transient SSO flake — retry. Escalate if persistent. |
| `NETWORK` | Usually upstream / environment. Re-run before triaging. |
| `TIMEOUT` / `SELECTOR` / `INFRASTRUCTURE` | Framework-side — file with the QA automation team |
| `APPLICATION` / `DATA` (a.k.a. "Product Defects") | App-side — file with Encore's product team |

Allure's **Categories** panel groups failures into the same buckets visually.

---

## Updating

Receive the latest version from the QA automation team. Do **not** commit or edit files under `src/**` or `specs/**` — those are framework-owned and will be overwritten on the next update. If you need a change in those paths, request it from the QA automation team.

Safe-to-edit without conflicts: anything under `reports/` (generated output) and `node_modules/` (installed). Credentials live in GitHub Secrets, not in the repo.

---

## Troubleshooting

1. **Nothing runs at all** — `npm install` exited non-zero, or `npx playwright install chromium` didn't complete. Re-run both; check node/npm versions meet the requirements above.
2. **Every test fails with auth errors** — credentials expired or rotated. Update the GitHub Secrets (`NAVIGATOR_USERNAME` / `NAVIGATOR_PASSWORD`).
3. **`TC-LOC-CUR-001` verify fails but the app works in a browser** — Microsoft SSO is having a bad moment. Retry in 5 minutes before deeper triage.
4. **Reports look empty / blank widgets** — run `npm run clean` and re-run `test:cli`. Some widgets (Trend) only populate after the second run.
5. **Allure Trend never grows** — ensure `test:cli` is used. `npm test` alone runs the suite without the stash/restore chain, so history doesn't accumulate.

---

## License & credentials

Credentials are provided via GitHub Secrets at workflow runtime — nothing is committed. `.env.e2e` carries only non-secret CI config.
