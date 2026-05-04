# Encore QA Automation

End-to-end Playwright test suite for Navigator Cloud (`cloudapps-e2e.encoreglobal.com`). Produces two reports per run (Playwright HTML + Allure) with per-run timestamped archives. Browser projects (`chromium`, `chrome`, `firefox`, `webkit`) and parallelism (worker count) are all configurable per run — defaults in `playwright.config.ts`, overridable via CLI flags or environment variables.

---

## Requirements

- Node.js ≥ 18
- npm ≥ 9
- ~1 GB disk for browsers + dependencies
- Network access to `cloudapps-e2e.encoreglobal.com` and Microsoft login endpoints

---

## One-time setup

```bash
npm install
npx playwright install chromium
```

Credentials ship pre-wired in `clients/encore/config/environments/.env.e2e` (Microsoft SSO + TOTP). **Rotate these before any production use** — the shipped values are for the E2E environment only.

Verify the setup with the auth smoke test (~30 seconds):

```bash
npx playwright test clients/encore/tests/seed.spec.ts --project=chromium
```

Green = credentials + SSO + fixtures all working.

---

## Running the suite

### Recommended — single command, full chain

```bash
npm run test:daily
```

This is the intended daily command. It does, in order:

1. Preserves Allure history (so the Trend widget accumulates day over day)
2. Cleans stale report artifacts
3. Runs the full chromium suite
4. Generates the Allure report
5. Archives both HTML + Allure reports to timestamped directories

### Alternative — manual / granular control

If your CI pipeline needs the steps separately (parallelization, artifact upload between steps, etc.), run them individually:

```bash
node scripts/preserve-allure-history.js    # seed trend history
npm run clean:reports                      # clean stale outputs
npx playwright test --project=chromium     # run the suite
npm run allure:generate                    # build Allure report
npm run reports:archive                    # archive both reports
```

### Other test commands

| Command | What it does |
|---|---|
| `npx playwright test --project=chromium` | Run full suite, skip the daily chain |
| `npx playwright test <path> --project=chromium` | Run a single spec or directory |
| `npm run test:chrome` / `test:firefox` / `test:webkit` | Browser variants |
| `npm test -- --list` | List every discoverable test without running |

### Tuning parallelism

Worker count (how many specs run in parallel) is set in `playwright.config.ts` but can be overridden per run:

```bash
npx playwright test --project=chromium --workers=4
npx playwright test --project=chromium --workers=50%   # half of CPU cores
```

More workers = faster wall-clock but higher load on the app under test and on the runner. Start at 1–2 for SSO-heavy environments; scale up after validating stability. `fully-parallel` mode and `retries` are also configurable in `playwright.config.ts`.

---

## Reports

After every run:

| Path | Contents |
|---|---|
| `reports/html-report/` | Latest Playwright HTML report |
| `reports/allure-report/` | Latest Allure report (with Environment, Categories, Trend) |
| `reports/html-archive/<timestamp>/` | Every past HTML run (if using `test:daily` or `reports:archive`) |
| `reports/allure-archive/<timestamp>/` | Every past Allure run |
| `reports/failure-summary.json` | Machine-readable failure data (see **Failure categorization** below) |
| `reports/junit-results.xml` | JUnit XML for CI dashboards |
| `reports/test-results.json` | Raw Playwright results |

### Viewing reports locally

```bash
npm run report            # opens the Playwright HTML report
npm run allure:report     # generates + opens Allure in the browser
```

### Archive retention

Archives are kept indefinitely by default. To auto-prune, set environment variables before running `test:daily` or `reports:archive`:

```bash
ALLURE_ARCHIVE_MAX_DAYS=30   # keep 30 days of Allure archives
HTML_ARCHIVE_MAX_DAYS=30     # keep 30 days of HTML archives
```

Setting to `0` (default) means never prune.

---

## CI/CD integration

The suite is CI-agnostic. Pick the pattern that fits your pipeline:

**Simplest** — call the chain directly:
```yaml
- run: npm install
- run: npx playwright install chromium
- run: npm run test:daily
- uses: actions/upload-artifact   # upload reports/ as your pipeline requires
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
| `AUTHENTICATION` | Transient SSO / MFA flake — retry. Escalate if persistent. |
| `NETWORK` | Usually upstream / environment. Re-run before triaging. |
| `TIMEOUT` / `SELECTOR` / `INFRASTRUCTURE` | Framework-side — file with your automation vendor |
| `APPLICATION` / `DATA` (a.k.a. "Product Defects") | App-side — file with Encore's product team |

Allure's **Categories** panel groups failures into the same buckets visually.

---

## Updating

Pull the `client_deliverable` branch. Do **not** commit or edit files under `clients/encore/src/**`, `clients/encore/tests/**`, or `src/**` — those are framework-owned and will be overwritten on the next update. If you need a change in those paths, request it from your automation vendor.

Safe-to-edit without conflicts: `clients/encore/config/environments/.env.*` (your credentials), anything under `reports/` (generated output), `node_modules/` (installed).

---

## Troubleshooting

1. **Nothing runs at all** — `npm install` exited non-zero, or `npx playwright install chromium` didn't complete. Re-run both; check node/npm versions meet the requirements above.
2. **Every test fails with auth errors** — credentials expired or rotated. Update `clients/encore/config/environments/.env.e2e` (or override via `.env.local`).
3. **Seed smoke fails but the app works in a browser** — Microsoft SSO is having a bad moment. Retry in 5 minutes before deeper triage.
4. **Reports look empty / blank widgets** — run `npm run clean` and re-run `test:daily`. Some widgets (Trend) only populate after the second run.
5. **Allure Trend never grows** — ensure `test:daily` is used, or that you call `node scripts/preserve-allure-history.js` before each run if invoking steps manually.

---

## License & credentials

Test credentials in `.env.e2e` are plain-text by design for the E2E environment. Rotate on day one if this repo leaves your controlled infrastructure.
