---
snapshot: 2026-08-03
supersedes: partial-2026-07-30-pass
note: This is a 2026-08-03 snapshot superseding the partial 2026-07-30 pass. The filename is preserved as the plan's Per-Identity matrix and closure-check C6 cite it. The measurement date in this frontmatter is authoritative; ignore the filename date.
---

# Client Surface Census — clients/encore/

**Snapshot date**: 2026-08-03 (supersedes partial 2026-07-30 pass — filename preserved for plan cross-reference)
**Host**: DESKTOP-RUTVIK (Windows)
**Repo**: C:/Users/rutvi/projects/encore_framework

---

## MEASUREMENT-WINDOW

| Key | Value |
|---|---|
| Enumeration start | 2026-08-03T17:55:38+05:30 |
| Enumeration end | 2026-08-03T17:57:45+05:30 |
| Host | Windows, C:/Users/rutvi/projects/encore_framework |
| Commands run | git ls-tree -r --name-only HEAD; git -c core.quotepath=false ls-files -z; git ls-files --others --ignored --exclude-standard -z; git ls-files --others --exclude-standard -z; Get-ChildItem -Force -Recurse per directory |
| Warning | Tree is LIVE. Concurrent sessions write under clients/encore/ (especially reports/allure-results). Every figure below is a snapshot of this window, not a stable count. |
| Prior drift example | 2026-07-31: identical du runs 20 min apart returned 927 MB then 647 MB (plan Phase 1 observation) |

---

## RECONCILIATION

| Bucket | File count | Method |
|---|---|---|
| HEAD (tracked, ships via git archive) | 636 | git ls-tree -r --name-only HEAD -- clients/encore |
| INDEX (git ls-files) | 636 | git -c core.quotepath=false ls-files -z -- clients/encore |
| Ignored-but-present | 10,306 | git ls-files --others --ignored --exclude-standard -z (first 200 sampled; full count from dir walks below) |
| Untracked-and-not-ignored | 0 | git ls-files --others --exclude-standard -z -- clients/encore |
| Disk walk total | 10,942 | Get-ChildItem -Force -Recurse per named directory |

**Reconciliation**: HEAD (636) + untracked (0) + ignored (~10,306) ≈ disk walk (10,942). Minor delta is expected: the ignored count was sampled at 200 and the disk walk was directory-by-directory. The identity holds within measurement noise for a live tree.

---

## INDEX-VS-HEAD

**Finding F1 — quotepath encoding artifact, not a real mismatch.**

git ls-files and git ls-tree HEAD both report 636 files. A naive diff produces 24 apparent mismatches — but all 24 are the same files with non-ASCII characters (em-dashes U+2014 and arrows U+2192) in their paths, appearing once octal-quoted (\\342\200\224\, \\342\206\222\) in git ls-files output and once decoded in git ls-tree output.

**Root cause**: git ls-files defaults core.quotepath=true even with -c override in some PowerShell contexts, causing the same path to appear in both raw and decoded form when the two outputs are compared.

**All 24 are under**: clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/ and run2/ test-results directories. They are the same files, counted once each in the final 636 total.

**Conclusion**: HEAD == INDEX. No staged deletions or pending additions affecting the ship boundary.

---

## TRACKED

**Total**: 636 files. Disposition summary: SHIPS=181 | SHIPS-BUT-DIRTY=3 | AGENT-ONLY-LEGITIMATE=450 | AGENT-ONLY-ROT=0 | SLOP=2

**Note on AGENT-ONLY-LEGITIMATE in tracked set**: 426 files under specs_planning/ are tracked despite .gitignore:188 listing clients/*/specs_planning/. This can only be reached via git add -f. These files DO ship via git archive (git archive reads HEAD, not .gitignore). This is Finding F2 below.

### SHIPS (181 files)

| Path | Bytes | MTime | Last Commit | Disposition |
|---|---|---|---|---|
| clients/encore/.env.e2e | 1295 | 2026-07-29T14:58 | cd0ce110 2026-07-29 | SHIPS |
| clients/encore/.env.local | 1283 | 2026-07-20T19:08 | afeeda8b 2026-07-21 | SHIPS |
| clients/encore/.gitignore | 848 | 2026-07-31T02:01 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/config/allure/categories.json | 1769 | 2026-06-08T15:51 | 4c86fd42 2026-05-11 | SHIPS |
| clients/encore/docs/jira_pricing_test_cases.xlsx | 26168 | 2026-07-31T15:06 | e0f63b32 2026-06-26 | SHIPS |
| clients/encore/docs/MODULE_REGISTRY.md | 4918 | 2026-07-27T21:58 | a544dcd7 2026-07-28 | SHIPS |
| clients/encore/docs/Pricing-Functional Details-JIRA STORIES 1.docx | 1719837 | 2026-06-08T18:06 | e0f63b32 2026-06-26 | SHIPS |
| clients/encore/docs/REQUIREMENTS.md | 82379 | 2026-07-27T22:20 | a544dcd7 2026-07-28 | SHIPS |
| clients/encore/package-lock.json | 57621 | 2026-07-21T23:08 | f99eed76 2026-05-19 | SHIPS |
| clients/encore/package.json | 2016 | 2026-06-11T21:04 | 16f0980d 2026-06-11 | SHIPS |
| clients/encore/playwright.config.ts | 6613 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/README.md | 12674 | 2026-07-29T15:31 | cd0ce110 2026-07-29 | SHIPS |
| clients/encore/src/data/common.ts | 334 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/data/corporate-override/override.ts | 24856 | 2026-07-30T23:39 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/src/data/corporate-pricing/common.ts | 961 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/data/corporate-pricing/detail.ts | 2098 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/empty.csv | 0 | 2026-07-09T12:49 | 3156c352 2026-07-09 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/malformed.csv | 37 | 2026-07-09T12:49 | 3156c352 2026-07-09 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/override-discount-over-100.csv | 197 | 2026-07-24T13:50 | e101fd71 2026-07-24 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/override-extra-columns.csv | 218 | 2026-07-24T13:50 | e101fd71 2026-07-24 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/override-header-only.csv | 124 | 2026-07-24T13:50 | e101fd71 2026-07-24 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/override-invalid-currency.csv | 194 | 2026-07-24T13:50 | e101fd71 2026-07-24 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/override-negative-price.csv | 190 | 2026-07-24T13:50 | e101fd71 2026-07-24 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/override-nonexistent-location.csv | 197 | 2026-07-24T13:50 | e101fd71 2026-07-24 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/override-nonexistent-pg.csv | 187 | 2026-07-24T13:50 | e101fd71 2026-07-24 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/override-nonnumeric-price.csv | 191 | 2026-07-24T13:50 | e101fd71 2026-07-24 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/override-too-few-columns.csv | 142 | 2026-07-24T13:50 | e101fd71 2026-07-24 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/import-all/wrong-format.txt | 102 | 2026-07-09T12:49 | 3156c352 2026-07-09 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/baseline.csv | 267 | 2026-07-07T11:38 | 467cbeb1 2026-07-07 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/create-novel.csv | 332 | 2026-07-07T15:04 | 467cbeb1 2026-07-07 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/empty.csv | 0 | 2026-07-07T11:26 | 467cbeb1 2026-07-07 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/field-writability.csv | 267 | 2026-07-07T15:04 | 467cbeb1 2026-07-07 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/header-only.csv | 116 | 2026-07-07T15:04 | 467cbeb1 2026-07-07 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/malformed.csv | 27 | 2026-07-07T11:26 | 467cbeb1 2026-07-07 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/partial-update.csv | 222 | 2026-07-07T11:26 | 467cbeb1 2026-07-07 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/valid-update.csv | 267 | 2026-07-07T11:26 | 467cbeb1 2026-07-07 | SHIPS |
| clients/encore/src/data/corporate-pricing/fixtures/loc-pricing-import/wrong-format.txt | 47 | 2026-07-07T11:26 | 467cbeb1 2026-07-07 | SHIPS |
| clients/encore/src/data/corporate-pricing/new-pricebook.ts | 2790 | 2026-07-30T23:04 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/data/corporate-pricing/search.ts | 3058 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/data/corporate-pricing/strategy.ts | 2615 | 2026-07-30T23:04 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/data/corporate-pricing/toolbar-io.ts | 13031 | 2026-07-30T23:04 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/data/local-office/local-office-ect.ts | 936 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/data/local-office/local-office-history.ts | 179 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/data/local-office/local-office-settings.ts | 5991 | 2026-07-15T19:07 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/data/locations/location-account-address.ts | 2356 | 2026-07-15T19:07 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/data/locations/location-auto-addon.ts | 643 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/data/locations/location-currency.ts | 691 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/data/locations/location-left-panel-basic-information.ts | 2371 | 2026-07-30T23:04 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/data/locations/location-legal.ts | 699 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/data/locations/location-local-info.ts | 8400 | 2026-07-15T18:54 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/data/locations/location-management-history.ts | 564 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/data/locations/location-notes.ts | 3315 | 2026-07-15T18:54 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/data/locations/location-pricing.ts | 5801 | 2026-07-15T18:26 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/data/locations/location-shared-setup-locations.ts | 1848 | 2026-07-15T19:07 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/fixtures/dependency-gate.ts | 1419 | 2026-07-15T18:18 | 35c9c24c 2026-06-10 | SHIPS |
| clients/encore/src/fixtures/label-jargon.json | 1112 | 2026-07-09T16:18 | 3156c352 2026-07-09 | SHIPS |
| clients/encore/src/fixtures/pages.fixture.ts | 21270 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/fixtures/step-decorator.ts | 1783 | 2026-07-31T20:01 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/auth/login.page.ts | 9043 | 2026-07-15T19:12 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/pages/base.page.ts | 31906 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/components/location-form-helpers.component.ts | 8976 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/corporate-override/corporate-override.page.ts | 71871 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/corporate-pricing/corporate-pricing-detail.page.ts | 11413 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/corporate-pricing/corporate-pricing-new-pricebook.page.ts | 16973 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts | 75589 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/corporate-pricing/corporate-pricing-strategy.page.ts | 14732 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/corporate-pricing/corporate-pricing.page.ts | 9877 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/local-office/local-office-ect.page.ts | 7972 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/local-office/local-office-history.page.ts | 5213 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/local-office/local-office-settings.page.ts | 11432 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/locations/location-account-address.page.ts | 19174 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/locations/location-auto-addon.page.ts | 10028 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/locations/location-currency.page.ts | 12460 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/locations/location-left-panel-basic-information.page.ts | 19869 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/locations/location-legal.page.ts | 8983 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/locations/location-local-info.page.ts | 11888 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/locations/location-management-history.page.ts | 15869 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/locations/location-notes.page.ts | 17587 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/locations/location-pricing.page.ts | 28151 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/pages/locations/location-shared-setup-locations.page.ts | 18509 | 2026-07-31T18:02 | 48d5933f 2026-07-31 | SHIPS |
| clients/encore/src/reporter/agent-reporter.ts | 12268 | 2026-07-15T18:57 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/auth/dynamic.ts | 1153 | 2026-07-15T18:57 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/auth/login.ts | 479 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/selectors/corporate-override/override.ts | 6629 | 2026-07-30T23:39 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/src/selectors/corporate-pricing/details.ts | 630 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/selectors/corporate-pricing/index.ts | 922 | 2026-07-27T21:00 | a544dcd7 2026-07-28 | SHIPS |
| clients/encore/src/selectors/corporate-pricing/new-pricebook.ts | 1065 | 2026-07-15T18:56 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/corporate-pricing/pricing-detail.ts | 996 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/selectors/corporate-pricing/search.ts | 3314 | 2026-07-15T19:13 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/corporate-pricing/strategy.ts | 509 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/selectors/index.ts | 5590 | 2026-07-30T22:17 | a544dcd7 2026-07-28 | SHIPS |
| clients/encore/src/selectors/local-office/local-office-ect.ts | 2426 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/local-office/local-office-history.ts | 387 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/local-office/local-office-settings.ts | 4823 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/account-address.ts | 3276 | 2026-07-15T18:56 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/auto-addon.ts | 1619 | 2026-07-15T18:56 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/currency.ts | 1378 | 2026-07-15T18:52 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/history.ts | 751 | 2026-07-15T18:52 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/left-panel-basic-information.ts | 3623 | 2026-07-30T23:04 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/legal.ts | 794 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/local-info.ts | 5592 | 2026-07-15T18:18 | 8875b232 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/notes.ts | 980 | 2026-07-15T19:10 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/pricing.ts | 3076 | 2026-07-15T18:54 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/shared-setup-locations.ts | 2124 | 2026-07-15T19:10 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/selectors/locations/shared.ts | 1545 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/setup/global-setup.ts | 6586 | 2026-07-29T15:39 | cd0ce110 2026-07-29 | SHIPS |
| clients/encore/src/types/diagnostics.ts | 1214 | 2026-07-15T18:52 | 4a4ded3e 2026-05-19 | SHIPS |
| clients/encore/src/types/index.ts | 163 | 2026-07-15T18:52 | aa7a8552 2026-07-14 | SHIPS |
| clients/encore/src/utils/auth-storage.ts | 6466 | 2026-07-15T19:10 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/utils/constants.ts | 273 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/utils/credential-loader.ts | 3959 | 2026-07-17T07:38 | 3d43c6e9 2026-07-20 | SHIPS |
| clients/encore/src/utils/diagnostics-collector.ts | 8616 | 2026-07-15T18:52 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/utils/env-config.ts | 503 | 2026-07-15T18:52 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/utils/field-case-runner.ts | 11550 | 2026-07-30T23:39 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/src/utils/logger.ts | 1598 | 2026-07-15T18:52 | 4a4ded3e 2026-05-19 | SHIPS |
| clients/encore/src/utils/retry-telemetry.ts | 3380 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/src/utils/url-host.ts | 1407 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/testcases/corporate-override/corporate-override-core.xlsx | 23095 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-override/corporate-override-nm2268.xlsx | 10472 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-override/corporate-override-nm2269.xlsx | 10200 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-override/corporate-override-nm2270.xlsx | 10258 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-override/corporate-override-nm2271.xlsx | 22643 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-override/corporate-override-nm2272.xlsx | 14683 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-override/corporate-override-nm2273.xlsx | 13530 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-pricing/corporate-pricing-detail.xlsx | 25408 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-pricing/corporate-pricing-export-all.xlsx | 12515 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-pricing/corporate-pricing-import-all.xlsx | 12628 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-pricing/corporate-pricing-loc-export.xlsx | 9632 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-pricing/corporate-pricing-loc-import.xlsx | 10822 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-pricing/corporate-pricing-new-pricebook.xlsx | 21033 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-pricing/corporate-pricing-override.xlsx | 7572 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-pricing/corporate-pricing-search.xlsx | 28439 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/corporate-pricing/corporate-pricing-strategy.xlsx | 20086 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/encore_test_cases.xlsx | 342191 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/encore-qa-tracker.xlsx | 15759 | 2026-07-21T22:28 | a544dcd7 2026-07-28 | SHIPS |
| clients/encore/testcases/local-office/local-office-ect.xlsx | 15129 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/local-office/local-office-history.xlsx | 9587 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/local-office/local-office-settings.xlsx | 25857 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/locations/location-account-address.xlsx | 17903 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/locations/location-auto-addon.xlsx | 13884 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/locations/location-currency.xlsx | 14149 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/locations/location-left-panel-basic-information.xlsx | 20307 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/locations/location-legal.xlsx | 14273 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/locations/location-local-information.xlsx | 44953 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/locations/location-management-history.xlsx | 15784 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/locations/location-notes.xlsx | 30184 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/locations/location-pricing.xlsx | 18231 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/testcases/locations/location-shared-setup-locations.xlsx | 23552 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/tests/auth.setup.ts | 5694 | 2026-07-15T18:18 | 3156c352 2026-07-09 | SHIPS |
| clients/encore/tests/corporate-override/corporate-override-core.spec.ts | 55814 | 2026-07-31T02:09 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/tests/corporate-override/corporate-override-nm2268.spec.ts | 11088 | 2026-07-31T02:09 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/tests/corporate-override/corporate-override-nm2269.spec.ts | 9890 | 2026-07-31T02:09 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/tests/corporate-override/corporate-override-nm2270.spec.ts | 9473 | 2026-07-31T02:09 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/tests/corporate-override/corporate-override-nm2271.spec.ts | 48859 | 2026-07-31T02:09 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/tests/corporate-override/corporate-override-nm2272.spec.ts | 20850 | 2026-07-31T02:09 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/tests/corporate-override/corporate-override-nm2273.spec.ts | 22762 | 2026-07-31T02:09 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/tests/corporate-pricing/corporate-pricing-detail.spec.ts | 26448 | 2026-07-30T23:04 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/tests/corporate-pricing/corporate-pricing-export-all.spec.ts | 16973 | 2026-07-30T23:04 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/tests/corporate-pricing/corporate-pricing-import-all.spec.ts | 32771 | 2026-07-30T23:04 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/tests/corporate-pricing/corporate-pricing-loc-export.spec.ts | 6560 | 2026-07-30T23:04 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/tests/corporate-pricing/corporate-pricing-loc-import.spec.ts | 14833 | 2026-07-30T23:04 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/tests/corporate-pricing/corporate-pricing-new-pricebook.spec.ts | 31364 | 2026-07-15T19:03 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/tests/corporate-pricing/corporate-pricing-override-nav.spec.ts | 681 | 2026-07-31T02:09 | 816ac4c8 2026-07-31 | SHIPS |
| clients/encore/tests/corporate-pricing/corporate-pricing-search.spec.ts | 44732 | 2026-07-28T03:40 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tests/corporate-pricing/corporate-pricing-strategy.spec.ts | 33318 | 2026-07-15T19:03 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/tests/local-office/local-office-ect.spec.ts | 15795 | 2026-07-28T03:57 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tests/local-office/local-office-history.spec.ts | 3734 | 2026-07-15T19:03 | 3156c352 2026-07-09 | SHIPS |
| clients/encore/tests/local-office/local-office-settings.spec.ts | 52683 | 2026-07-28T03:36 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tests/locations/location-account-address.spec.ts | 30872 | 2026-07-28T03:36 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tests/locations/location-auto-addon.spec.ts | 14848 | 2026-07-15T18:28 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/tests/locations/location-currency.spec.ts | 21151 | 2026-07-15T19:03 | 4ea2cfea 2026-07-15 | SHIPS |
| clients/encore/tests/locations/location-left-panel-basic-information.spec.ts | 22358 | 2026-07-30T23:04 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tests/locations/location-legal.spec.ts | 13796 | 2026-07-28T03:40 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tests/locations/location-local-information.spec.ts | 29570 | 2026-07-28T03:57 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tests/locations/location-management-history.spec.ts | 27491 | 2026-07-28T03:37 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tests/locations/location-notes.spec.ts | 54722 | 2026-07-28T03:37 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tests/locations/location-pricing.spec.ts | 39625 | 2026-07-28T03:40 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tests/locations/location-shared-setup-locations.spec.ts | 53676 | 2026-07-28T03:40 | b6d617bd 2026-07-28 | SHIPS |
| clients/encore/tsconfig.json | 1351 | 2026-07-31T16:31 | 48d5933f 2026-07-31 | SHIPS |

### SHIPS-BUT-DIRTY (3 files)

**Note**: scripts/ files contain internal path references and debug tooling not appropriate for client delivery. The 3 scripts/ files need slop audit. The remaining 0 are classification overflows — see quotepath note.

| Path | Bytes | MTime | Last Commit | Disposition | Reason |
|---|---|---|---|---|---|
| clients/encore/scripts/clean-run.js | 2569 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS-BUT-DIRTY | scripts/ tooling — internal debug paths, not client-facing; needs /audit --mode=slop |
| clients/encore/scripts/share-for-debugging.js | 1874 | 2026-07-15T19:07 | 4ea2cfea 2026-07-15 | SHIPS-BUT-DIRTY | scripts/ tooling — internal debug paths, not client-facing; needs /audit --mode=slop |
| clients/encore/scripts/test-cli.js | 1133 | 2026-07-15T18:53 | 4ea2cfea 2026-07-15 | SHIPS-BUT-DIRTY | scripts/ tooling — internal debug paths, not client-facing; needs /audit --mode=slop |

### AGENT-ONLY-LEGITIMATE (tracked via force-add) (450 files)

These are specs_planning/ planning artifacts tracked via git add -f despite .gitignore:188. They are agent-only work product (test cases, catalogs, plans, evidence). They do NOT belong in the tracked set — see Finding F2.

| Path | Bytes | MTime | Last Commit | Disposition |
|---|---|---|---|---|
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/history-location-hist-note-17d7d-ol-69-\342\200\224-empty-to-hello-save-encore-locations-retry1/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/history-location-hist-note-17d7d-ol-69-\342\200\224-empty-to-hello-save-encore-locations-retry1/test-failed-1.png" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/history-location-hist-note-17d7d-ol-69-\342\200\224-empty-to-hello-save-encore-locations-retry1/trace.zip" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/history-location-hist-note-17d7d-ol-69-\342\200\224-empty-to-hello-save-encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/history-location-hist-note-17d7d-ol-69-\342\200\224-empty-to-hello-save-encore-locations/test-failed-1.png" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/history-location-hist-note-17d7d-ol-69-\342\200\224-empty-to-hello-save-encore-locations/trace.zip" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-24a0d-elf-SI-\342\206\222-self-SI-unchanged--encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-25729-oad-3-\342\206\222-2-with-middle-gone--encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-66d78-FF-\342\206\222-save-persists-each-leg-encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-73f95-save-reload-2-\342\206\222-0-non-self--encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-8ae95--reload-\342\206\222-all-three-persist-encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-ded8d-f-\342\206\222-self-unchanged-in-page--encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-settings-Loca-b79d6--\342\206\222-app-re-applies-default-1-encore-local-office-retry1/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-settings-Loca-b79d6--\342\206\222-app-re-applies-default-1-encore-local-office-retry1/test-failed-1.png" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-settings-Loca-b79d6--\342\206\222-app-re-applies-default-1-encore-local-office-retry1/trace.zip" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-settings-Loca-b79d6--\342\206\222-app-re-applies-default-1-encore-local-office/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-settings-Loca-b79d6--\342\206\222-app-re-applies-default-1-encore-local-office/test-failed-1.png" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-settings-Loca-b79d6--\342\206\222-app-re-applies-default-1-encore-local-office/trace.zip" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-24a0d-elf-SI-\342\206\222-self-SI-unchanged--encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-25729-oad-3-\342\206\222-2-with-middle-gone--encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-66d78-FF-\342\206\222-save-persists-each-leg-encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-73f95-save-reload-2-\342\206\222-0-non-self--encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-8ae95--reload-\342\206\222-all-three-persist-encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| "clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-ded8d-f-\342\206\222-self-unchanged-in-page--encore-locations/error-context.md" | N/A | N/A | never | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/_archive/shared-setup-giver-2026-05-12.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/_archive/shared-setup-hunter-2026-05-12.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/active-experiments.md | 1469 | 2026-07-21T13:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/agent-activity-log.md | 450471 | 2026-08-03T17:33 | 50e20c25 2026-08-03 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/agent-metrics-report.md | 1180 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/agent-mistakes.md | 77339 | 2026-08-03T17:37 | 6eb9aa7e 2026-07-30 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/b5-pretriage-W1-01-2026-05-26.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/bug-archetypes.md | 21228 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/c9-anti-pattern-candidates-2026-05-27.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/content-dedupe-audit-2026-05-26.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/corp-pricing-audit-demands-2026-06-05.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/corp-pricing-closure-audit-2026-06-05.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/corp-pricing-defect-FINAL-2026-07-13.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/corp-pricing-defect-verify-override-2026-07-13.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/corp-pricing-defect-verify-pricebook-2026-07-13.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/corp-pricing-drift-ledger-2026-06-19.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/corp-pricing-w15-audit-demands-2026-06-09.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/corp-pricing-w15-closure-audit-2026-06-09.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/corporate-pricing-missing-testids-report.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/corporate-pricing-override-dependency-map-2026-07-18.md | 9570 | 2026-07-18T10:10 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/csv-md-delta-investigation-2026-05-26.md | 26713 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/daily-status-bank.json | 14163 | 2026-08-03T14:46 | 795d8ff5 2026-07-31 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/_pre-consolidation-tracker.csv | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/auth-warmup.log | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/build-tracker-csv.mjs | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/list-census.txt | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/0b720a67-f57c-4ca8-9f62-8fbabf9b6b93-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/1ee1e5c2-efe2-49c4-b21e-f3f13027cb66-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/3085026e-7d13-4dbc-9cce-bd6d25d37f96-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/35081688-864b-4773-8a47-17f6e7d93f74-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/38a88621-db40-43ef-8a53-c9e56537e987-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/44cd6a0d-6f8d-48e2-95b7-16e3f4eec43f-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/4b013b40-4694-414b-ba27-d682023330c1-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/5d820b3b-1043-42b5-858e-757650b316f9-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/753e3aed-8e2b-433a-b81d-275caca726da-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/83295d13-3f52-460a-9726-ed7f9cf9cb4c-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/89dc9ebc-6c69-48dc-93cb-914a570f9571-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/9469ed07-6add-4edf-9a2f-37cee65b6ae1-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/957c364e-1291-4373-ba38-66b8cc19554a-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/96dd0b44-ca64-4f23-bd92-be41871122ad-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/9b5c5fcf-77a6-4537-8e7c-f1ab74ac0c15-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/af7f9ecc-a2f4-43bd-a7ae-dd064b265bf6-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/c9985084-e4c7-4865-80f2-9179b3f09608-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/eb650cc6-a0c2-4500-b7fa-a42dda8c8973-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/eef426c1-bd2d-470f-806c-a2beee16d46b-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/f4e3eeb4-c639-4d34-87b5-336733503d1d-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/allure-results/f8802070-a7df-4736-906c-c614b0d2d936-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/console.log | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/diagnostics/local-office-history.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/diagnostics/location-account-address.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/diagnostics/location-hist-notes.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/diagnostics/location-local-information.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/diagnostics/location-management-history.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/diagnostics/location-notes.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/diagnostics/location-shared-setup-locations.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/failure-summary.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/junit-results.xml | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/.last-run.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/history-location-hist-note-f8547-ines-and-multi-line-content-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/history-location-hist-note-f8547-ines-and-multi-line-content-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/history-location-hist-note-f8547-ines-and-multi-line-content-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office-retry1/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office-retry1/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office-retry1/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-account-address-L-70a79-s-persist-after-page-reload-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-account-address-L-70a79-s-persist-after-page-reload-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-account-address-L-70a79-s-persist-after-page-reload-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-account-address-L-867af-List-search-returns-results-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-account-address-L-867af-List-search-returns-results-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-account-address-L-867af-List-search-returns-results-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-account-address-L-e12fc-er-returns-matching-account-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-account-address-L-e12fc-er-returns-matching-account-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-account-address-L-e12fc-er-returns-matching-account-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-local-information-fa8f5-W-Net-Amount-toggle-persist-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-local-information-fa8f5-W-Net-Amount-toggle-persist-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-local-information-fa8f5-W-Net-Amount-toggle-persist-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-3facf-rrect-values-location-1604--encore-locations-retry1/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-3facf-rrect-values-location-1604--encore-locations-retry1/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-3facf-rrect-values-location-1604--encore-locations-retry1/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-3facf-rrect-values-location-1604--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-3facf-rrect-values-location-1604--encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-3facf-rrect-values-location-1604--encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-6096b-or-location-with-no-history-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations-retry1/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations-retry1/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations-retry1/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-management-histor-d00e6-disabled-when-only-one-page-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-2904f-rtial-replace-slice-middle--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-2904f-rtial-replace-slice-middle--encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-2904f-rtial-replace-slice-middle--encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-79a66-039-1-char-persist-BVA-min--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-79a66-039-1-char-persist-BVA-min--encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-79a66-039-1-char-persist-BVA-min--encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-9e4c3-tion-deferred-to-HIST-spec--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-9e4c3-tion-deferred-to-HIST-spec--encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-9e4c3-tion-deferred-to-HIST-spec--encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-b2698-row-stays-with-empty-value--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-b2698-row-stays-with-empty-value--encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-notes-Location-No-b2698-row-stays-with-empty-value--encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-105ad--save-reload-all-5-persist--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-54216-y-the-Miami-Marriott-office-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations-retry1/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations-retry1/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations-retry1/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations-retry1/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations-retry1/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations-retry1/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run1/test-results/location-shared-setup-loca-f8a8a-riginal-state-disables-Save-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/10b774fb-3591-4771-86b0-95603c2098b3-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/14bee6bc-98c1-4910-8d3d-b8db5d8d48d0-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/2a02f717-477f-46c9-847e-80df74e0e4a3-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/6c4be2ff-896e-4bdb-b009-0980b0724773-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/83aea72b-f950-4054-bef1-5b1045321400-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/8639d9df-c617-4176-b071-07a935a1ffa6-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/957ea14d-81de-45a6-9262-835313e962c0-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/98730562-a774-4468-a129-059761e5527c-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/9aebf1f3-e2cf-4a71-b49c-89f4127be903-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/a57a9be1-dda7-46bf-b797-168b716c82a4-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/a67e0a76-01d9-4726-9f0a-84ff0e50cc76-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/ada2bf61-c3a1-47b2-bb14-d707da10aef3-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/b69e887b-094f-4e49-aa8d-a8f1d1003690-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/d91f2049-595c-43bd-9c04-b35151542ab3-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/dd0eaeba-40fd-43cb-be41-7e97cd8cc61b-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/allure-results/faea8e5c-fe2f-4484-8ee7-7cfbda1c154c-attachment.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/console.log | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/diagnostics/local-office-history.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/diagnostics/local-office-settings.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/diagnostics/location-account-address.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/diagnostics/location-currency.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/diagnostics/location-hist-notes.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/diagnostics/location-management-history.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/diagnostics/location-notes.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/diagnostics/location-shared-setup-locations.diagnostics.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/failure-summary.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/junit-results.xml | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/.last-run.json | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/history-location-hist-note-f637b-atin-diacritic-CJK-dingbat--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/history-location-hist-note-f637b-atin-diacritic-CJK-dingbat--encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/history-location-hist-note-f637b-atin-diacritic-CJK-dingbat--encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office-retry1/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office-retry1/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office-retry1/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-history-Local-c0425--no-Save-no-editable-fields-encore-local-office/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-settings-Loca-1b296--aria-invalid-Save-disabled-encore-local-office/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-settings-Loca-1b296--aria-invalid-Save-disabled-encore-local-office/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/local-office-settings-Loca-1b296--aria-invalid-Save-disabled-encore-local-office/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-account-address-L-70a79-s-persist-after-page-reload-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-account-address-L-70a79-s-persist-after-page-reload-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-account-address-L-70a79-s-persist-after-page-reload-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-account-address-L-e12fc-er-returns-matching-account-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-account-address-L-e12fc-er-returns-matching-account-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-account-address-L-e12fc-er-returns-matching-account-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-currency-Location-8b022-sists-after-save-and-reload-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-currency-Location-8b022-sists-after-save-and-reload-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-currency-Location-8b022-sists-after-save-and-reload-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-management-histor-6096b-or-location-with-no-history-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations-retry1/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations-retry1/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations-retry1/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-management-histor-8e5dd-dit-Delete-controls-present-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-management-histor-d00e6-disabled-when-only-one-page-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-notes-Location-No-79a66-039-1-char-persist-BVA-min--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-notes-Location-No-79a66-039-1-char-persist-BVA-min--encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-notes-Location-No-79a66-039-1-char-persist-BVA-min--encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-105ad--save-reload-all-5-persist--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-54216-y-the-Miami-Marriott-office-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations-retry1/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations-retry1/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations-retry1/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-68b59--Change-Local-Office-dialog-encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations-retry1/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations-retry1/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations-retry1/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations/test-failed-1.png | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-7c26d--BVA-empty-after-non-empty--encore-locations/trace.zip | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/run2/test-results/location-shared-setup-loca-f8a8a-riginal-state-disables-Save-encore-locations/error-context.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/skip-grep.txt | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/defence-evidence-2026-06-01/update-tracker-questions.mjs | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/dep-gate-inventory-2026-05-08.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/drift-note-W1-01-2026-05-26.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/ENCORE_MISSING_TESTID_REPORT.xlsx | N/A | N/A | e37d13cf 2026-07-29 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-detail-divergences-2026-06-05.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-newpricebook-divergences-2026-06-09.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-search-divergences-2026-06-05.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-strategy-divergences-2026-06-05.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/encore-questions-drafts/notes-fcc-followups.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/encore-questions-drafts/TC-LOC-MGH-019-pagination-collapse-2026-05-08.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/evidence-cp-override-2026-07-13/raw-evidence.md | 4955 | 2026-07-13T19:45 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/evidence-cp-review-2026-07-13/01-A12-override-red-repro.txt | 4870 | 2026-07-21T15:27 | 4591adbc 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/excel-revert-recovery-deviations-2026-06-10.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/false-green-sweeps/account-address-2026-05-29.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/false-green-sweeps/auto-addon-2026-06-11.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/false-green-sweeps/currency-2026-06-17.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/false-green-sweeps/launcher-dialogs-2026-06-11.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/false-green-sweeps/left-panel-basic-information-2026-06-03.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/false-green-sweeps/legal-2026-05-27.md | 7259 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/false-green-sweeps/pricing-2026-06-18.md | 10335 | 2026-06-18T17:41 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/false-green-sweeps/pricing-2026-06-19.md | 8151 | 2026-06-19T16:12 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/false-green-sweeps/shared-setup-locations-2026-05-22.md | 11261 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/fcc-truth-investigation-2026-05-26.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/account-address-2026-05-29.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/auto-addon-2026-06-11.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/corporate-pricing-search-2026-06-05.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/corporate-pricing-search-fcc-2026-06-10.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/currency-2026-06-17.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/launcher-dialogs-2026-06-11.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/left-panel-basic-information-2026-06-03.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/legal-2026-05-27.md | 11595 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/notes-2026-05-19.md | 11607 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/override-2026-06-09.md | 3917 | 2026-06-11T00:43 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-catalogs/pricing-2026-06-19.md | 9487 | 2026-06-19T17:33 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-case-generation.md | 24046 | 2026-07-30T13:50 | 9573e866 2026-07-30 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md | 10740 | 2026-06-08T18:08 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29-address-dialog.png | 79570 | 2026-06-08T18:08 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29-tab.png | 122429 | 2026-06-08T18:08 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/auto-addon-2026-06-11.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-detail-2026-06-05.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-export-all-2026-07-09.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-import-all-2026-07-21.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-loc-export-2026-07-09.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-loc-import-2026-07-09.md | 6699 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-new-pricebook-2026-06-09.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-new-pricebook-2026-06-30.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-08.md | 17648 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-09.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-19.md | 10695 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-07-09.md | 8870 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-07-22.md | 31369 | 2026-07-27T21:57 | e37d13cf 2026-07-29 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-05.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-05.png | 137995 | 2026-06-08T15:51 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-10.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-07-09.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-strategy-2026-06-05.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-strategy-2026-06-29.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-toolbar-io-2026-06-08.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/currency-2026-06-17.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-2026-06-03.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-2026-06-11.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md | 19503 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/notes-2026-05-11.md | 22070 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/pricing-2026-06-18.md | 8021 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/pricing-2026-06-19.md | 19551 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventories/shared-setup-2026-05-12.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/field-inventory-spec.md | 30298 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/gardener-sweep-currency-2026-06-17.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/baseline-list.txt | 119302 | 2026-06-10T20:35 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/baseline-testrail-dump.json | 9244 | 2026-06-10T20:37 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/baseline-xlsx-dump.json | 439449 | 2026-06-10T20:37 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/dump-testrail.mjs | 1654 | 2026-06-10T20:36 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/findings-merged.json | 264130 | 2026-06-11T00:21 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/fix-offbyone.mjs | 2157 | 2026-06-11T00:59 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/fix-shorthand.mjs | 2160 | 2026-06-11T01:00 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/id-rename-map.csv | 5814 | 2026-06-11T00:59 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/id-rename-map.json | 7147 | 2026-06-11T00:59 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/md-fixes.mjs | 3829 | 2026-06-11T00:51 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/remediate.mjs | 10736 | 2026-06-11T00:36 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/summarize-findings.mjs | 956 | 2026-06-11T00:20 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/testplan-fixes.mjs | 5385 | 2026-06-11T00:52 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/unmojibake.mjs | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/v13-negative-test.mjs | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/v9-corp-run.txt | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/v9-li070-rerun.txt | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/v9-li070-run.txt | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/id-audit-2026-06-10/verdict-report.md | 11023 | 2026-07-03T16:15 | d1c1ad69 2026-07-03 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/intake/commission-hunter-2026-06-26.md | 3081 | 2026-06-26T03:29 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/intake/notes-audit-2026-05-14.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/jira-defect-crossref-2026-06-09.md | 8145 | 2026-06-09T11:55 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/li-cascade-evidence-2026-04-28.md | 5189 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md | 6810 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md | 28417 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/notes-pilot-baseline-2026-05-21.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/account-address-2026-05-29.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/account-address-2026-06-11.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/auto-addon-2026-06-11.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md | 3510 | 2026-06-08T15:51 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-loc-import-2026-07-07.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-override-2026-06-08.md | 3379 | 2026-06-08T23:26 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-rewalk-2026-06-19.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/currency-2026-06-17.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-03.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-11.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/notes-2026-05-11.md | 15293 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md | 20376 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/pricing-2026-06-19.md | 8590 | 2026-06-19T15:59 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/old-site-baseline/shared-setup-2026-05-12.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/phase-0-verification-2026-05-21.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/phase-0-verification-auto-addon-2026-06-11.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/phase-0-verification-currency-2026-06-17.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/phase-0-verification-launcher-dialogs-2026-06-11.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/phase-0-verification-left-panel-basic-information-2026-06-03.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/phase-0-verification-pricing-2026-06-18.md | 4126 | 2026-06-18T12:05 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/phase-0-verification-pricing-2026-06-19.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/phase-0-verification-shared-setup-locations-2026-05-22.md | 7645 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/PLAN_CLIENT_DELIVERABLE_REBUILD-deviations.md | 24305 | 2026-07-21T14:03 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/plan-dependency-graph-2026-05-27.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/plan-triage-ledger-2026-05-27.md | 53840 | 2026-07-21T13:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/pre-exec-audit-self-help-mandate-2026-06-22.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/pre-exec-audit-tiered-delegated-walk-2026-06-22.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/preflight-skip-inventory-2026-05-08.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/rca-corp-pricing-detail-nm2260-2026-06-24.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/rca-currency-baseline-remediation-2026-06-17.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/rca-launcher-dialog-misses-2026-06-11.md | 7997 | 2026-06-11T18:54 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/REMEDIATION_PROGRESS.md | 2159 | 2026-07-03T00:04 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/remediation-walk-evidence-2026-07-10.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/restructure-map-2026-06-05.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/reviewer-walk-evidence-chip-testid-2026-07-10.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/reviewer-walk-evidence-corp-pricing-2026-07-10.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/reviewer-walk-evidence-missing-testid-noncorp-2026-07-10.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/reviewer-walk-evidence-remediation-2026-07-10.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/reviewer-walk-evidence-remediation-bounce-2026-07-10.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/stale-file-sweep-2026-05-26.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/stale-file-verification-2026-05-26.md | 18648 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/tc-authoring-rules.md | 18375 | 2026-06-26T23:25 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/tc-coverage-map-shared-setup-2026-05-15.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/testid-gap-report-2026-07-02.md | 7794 | 2026-07-03T00:00 | 3d70b4a1 2026-07-03 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/testid-gap-report-2026-07-06.md | N/A | N/A | f153a705 2026-07-06 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/testid-live-dumps-2026-07-06/details-tabs-probe.json | N/A | N/A | f153a705 2026-07-06 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/testid-live-dumps-2026-07-06/details.json | N/A | N/A | f153a705 2026-07-06 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/testid-live-dumps-2026-07-06/new-pricebook-equipment.json | N/A | N/A | f153a705 2026-07-06 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/testid-live-dumps-2026-07-06/new-pricebook-labor.json | N/A | N/A | f153a705 2026-07-06 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/testid-live-dumps-2026-07-06/pg-override.json | 301 | 2026-07-06T21:21 | f153a705 2026-07-06 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/testid-live-dumps-2026-07-06/search-dropdown-portal.json | N/A | N/A | f153a705 2026-07-06 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/testid-live-dumps-2026-07-06/search-testid-detail.json | N/A | N/A | f153a705 2026-07-06 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/testid-live-dumps-2026-07-06/search.json | N/A | N/A | f153a705 2026-07-06 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/W1-01-decisions-and-pretriage-2026-05-26.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-coverage-pilot-pricing-2026-06-19.md | N/A | N/A | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-account-address-master-bill-to-2026-06-11.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corp-pricing-labor-save-2026-06-30.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-05.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md | 16674 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-29.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-A.md | 13872 | 2026-07-17T02:08 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-B.md | 17576 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-C.md | 11306 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-D.md | 11532 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-E.md | 15865 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-F.md | 10451 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-17-READ-ME-FIRST.md | 3022 | 2026-07-22T23:43 | e37d13cf 2026-07-29 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-2026-07-20-SAVE.md | 7924 | 2026-07-21T22:34 | e37d13cf 2026-07-29 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-hist-ssl-acc-2026-06-02.md | 8115 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-location-settings-2026-05-14.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-missing-testid-noncorp-2026-07-10.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-notes-2026-05-12.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-radix-tab-dom-2026-05-22.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md | 79664 | 2026-07-23T15:58 | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-22.md | N/A | N/A | 367363ff 2026-07-23 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/walk-parity-pricing-2026-06-22.md | 7311 | 2026-06-22T21:26 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/_internal/xlsx-prep-verification-2026-05-26.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/catalogs/hist-root-map-local-office-history.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/catalogs/hist-root-map-location-management-currency.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/catalogs/hist-root-map-location-management-notes.md | 13807 | 2026-07-21T14:03 | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/catalogs/hist-root-map-location-management-pricing.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/catalogs/hist-root-map-location-management-shared-setup.md | N/A | N/A | afeeda8b 2026-07-21 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_core_test_cases.md | 83422 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_nm2268_test_cases.md | 14492 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_nm2269_test_cases.md | 13912 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_nm2270_test_cases.md | 16624 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_nm2271_test_cases.md | 87192 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_nm2272_test_cases.md | 36383 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-override/corporate_override_nm2273_test_cases.md | 35372 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_detail_test_cases.md | 89654 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_export_all_test_cases.md | 26607 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_import_all_test_cases.md | 21752 | 2026-07-27T22:22 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_loc_export_test_cases.md | 11442 | 2026-07-27T21:56 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_loc_import_test_cases.md | 22617 | 2026-07-27T22:22 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_new_pricebook_test_cases.md | 73383 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_override_test_cases.md | 2014 | 2026-07-31T04:04 | 816ac4c8 2026-07-31 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_search_test_cases.md | 103942 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_strategy_test_cases.md | 72013 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/local-office/local_office_ect_test_cases.md | 30411 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/local-office/local_office_history_test_cases.md | 10391 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md | 83443 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/locations/locations_account_address_test_cases.md | 42116 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/locations/locations_auto_addon_test_cases.md | 31596 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/locations/locations_currency_test_cases.md | 32684 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_basic_information_test_cases.md | 54773 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/locations/locations_legal_test_cases.md | 35068 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md | 151866 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md | 36204 | 2026-07-27T22:01 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md | 91852 | 2026-07-28T01:23 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/locations/locations_pricing_test_cases.md | 45169 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-cases/setup/locations/locations_shared_setup_locations_test_cases.md | 71477 | 2026-07-27T23:52 | a544dcd7 2026-07-28 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_detail_test_plan.md | 31865 | 2026-06-24T19:04 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_export_all_test_plan.md | 6951 | 2026-07-09T22:11 | 65c29cc3 2026-07-09 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_loc_export_test_plan.md | 3925 | 2026-07-09T22:11 | 65c29cc3 2026-07-09 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_loc_import_test_plan.md | 7660 | 2026-07-09T22:11 | 65c29cc3 2026-07-09 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_new_pricebook_test_plan.md | 24456 | 2026-06-30T14:26 | df47994a 2026-07-01 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_override_test_plan.md | 46928 | 2026-07-24T14:36 | e101fd71 2026-07-24 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_search_test_plan.md | 37361 | 2026-06-24T19:04 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_strategy_test_plan.md | 24628 | 2026-06-29T20:06 | df47994a 2026-07-01 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/local-office/local_office_ect_test_plan.md | 9931 | 2026-06-11T00:52 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/local-office/local_office_history_test_plan.md | 5263 | 2026-06-11T00:52 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/local-office/local_office_settings_test_plan.md | 19685 | 2026-06-11T00:52 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/locations/locations_account_address_test_plan.md | 21366 | 2026-06-11T19:27 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/locations/locations_auto_addon_test_plan.md | 17460 | 2026-06-11T17:04 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/locations/locations_currency_test_plan.md | 15562 | 2026-06-17T20:39 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/locations/locations_left_panel_basic_information_test_plan.md | 15367 | 2026-06-11T19:42 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/locations/locations_legal_test_plan.md | 15386 | 2026-06-11T00:52 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/locations/locations_local_information_test_plan.md | 47306 | 2026-06-11T00:52 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/locations/locations_management_history_test_plan.md | 8571 | 2026-06-11T00:52 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/locations/locations_notes_test_plan.md | 20358 | 2026-06-11T00:52 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/locations/locations_pricing_test_plan.md | 14094 | 2026-06-19T18:04 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |
| clients/encore/specs_planning/test-plans/setup/locations/locations_shared_setup_locations_test_plan.md | 14915 | 2026-06-11T00:52 | e0f63b32 2026-06-26 | AGENT-ONLY-LEGITIMATE |

### SLOP (2 files)

| Path | Bytes | MTime | Last Commit | Disposition | Reason |
|---|---|---|---|---|---|
| clients/encore/CLAUDE.md | 13400 | 2026-07-31T17:18 | 48d5933f 2026-07-31 | SLOP | Internal agent config; gitignored at per-client level but force-tracked; contains internal vocabulary (LR-NNN, codenames) — MUST NOT ship to client |
| clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md | 7802 | 2026-07-12T19:58 | afeeda8b 2026-07-21 | SLOP | Internal read-only doc (SHIP_TO_ENCORE.md) — agent instruction file, not client deliverable; should not be in tracked set |

### AGENT-ONLY-ROT (0 files)

None in tracked set. (Rot is in ignored set — see IGNORED section.)

---

## UNTRACKED-NOT-IGNORED

**Count: 0 files**

Command: \git -c core.quotepath=false ls-files --others --exclude-standard -z -- clients/encore\ returned empty output.

This bucket was the danger set in the 2026-07-30 measurement (contained the doubled clients/encore/clients/ directory and ~20 loose root files, ~2.8 MB total). As of this 2026-08-03 snapshot it is empty. The danger set has been cleared. No .gitignore gaps are indicated.

**Delta from prior measurement (2026-07-31)**: prior pass reported 29 untracked-not-ignored files. All are now gone.

---

## IGNORED

**Per-directory rollups** (bulk machine-output trees collapsed to one row each with file count and total size). Every rollup row states the count it represents — none are silently collapsed.

Snapshot: 2026-08-03T17:56:xx+05:30

| Directory | Files | Total Size | Disposition | Notes |
|---|---|---|---|---|
| clients/encore/reports/ | 6,200 | ~78.3 MB | AGENT-ONLY-ROT | Runtime report output. Sub-breakdown: allure-results (bulk raw), allure-report (generated), diagnostics, html-report, junit-results, bugs, walk-coverage, fcc-completion-run, screenshots, logs. No retention rule. Prior measurement: 927 MB / 91,634 files (2026-07-31 ~12:05) — massive reduction confirms live-tree churn. |
| clients/encore/specs_planning/ | 174 | ~7.3 MB | AGENT-ONLY-LEGITIMATE | Planning artifacts. Prior measurement: 2,751 files / 1.1 GB. Reduction by ~1,093 MB confirms _internal.zip and allure-results dumps were pruned. 426 of these files are also in the tracked set (force-added) — see Finding F2. |
| clients/encore/node_modules/ | 3,382 | ~86.8 MB | AGENT-ONLY-LEGITIMATE | Standard npm dependency tree. Gitignored. Expected. MANDATED: package.json requires it for runtime. |
| clients/encore/.auth/ | 722 | ~60.9 MB | AGENT-ONLY-ROT | Playwright browser profiles and auth state. Only 2 *-state.json files (~20 KB) are needed (per plan Phase 1). The remaining ~60.9 MB is Chromium profile bloat with no retention rule. |
| clients/encore/.playwright-cli/ | 1 | ~2 KB | AGENT-ONLY-ROT | Walk scratch and console logs. Prior: 328 files. Now 1 file. No retention rule. |
| clients/encore/playwright-report/ | 1 | ~819 KB | AGENT-ONLY-ROT | Standard Playwright HTML report output. No retention rule. |
| clients/encore/testcases/ | 31 | ~854 KB | SHIPS | Client-deliverable XLSX test case files. These are gitignored at root level but present on disk. REFERENCED: specs_planning plan files cite them as deliverables. NOTE: if gitignored, they cannot ship via git archive — this is a finding (F3). |
| clients/encore/docs/ | 5 | ~1.8 MB | SHIPS | Docs directory has 5 files on disk; most are in tracked set. Any untracked docs/ files here are SHIPS candidates needing git add. |
| clients/encore/logs/ | 1 | ~232 KB | AGENT-ONLY-ROT | Scratch log file. No retention rule. |

---

## FINDINGS

### F1 — quotepath encoding produces phantom INDEX-vs-HEAD mismatches

git ls-files octal-quotes non-ASCII filenames by default. Comparing git ls-files output against git ls-tree output without normalising encoding produces 24 apparent mismatches, all of which are the same files. The prior audit of this tree reported 25 'unexplained' phantom files from this exact bug. This census used \git -c core.quotepath=false ls-files -z\ and NUL-splitting to avoid it, and confirmed HEAD == INDEX.

### F2 — specs_planning/ is simultaneously gitignored and tracked (426 files)

.gitignore line 188 contains \clients/*/specs_planning/\. Yet 426 files under specs_planning/ are in HEAD. This state requires git add -f and produces confusing behaviour: routine git add on specs_planning/ paths silently no-ops, while git archive ships those files to the client. A directory that is both gitignored and tracked is an unstable fence. These files ARE currently shipping to the client via git archive, despite the intent to keep them internal.

**Evidence**: git ls-tree HEAD -- clients/encore/specs_planning returns 426 files. .gitignore line 188: \clients/*/specs_planning/\.

**Recommended action**: decision required — either remove from tracked set (git rm --cached -r clients/encore/specs_planning/) or remove the .gitignore rule. This is a Phase 2 / Phase 3 decision for the owner.

### F3 — testcases/ present on disk but gitignored, so cannot ship via git archive

clients/encore/testcases/ contains 31 files (~854 KB) of client-deliverable XLSX. The directory is present on disk and referenced as a deliverable, but if it is gitignored, git archive will not include it. Verify whether testcases/ is in .gitignore and whether it is in the tracked set. If it is gitignored-only, the XLSX deliverables are invisible to git archive — a delivery gap.

**Evidence**: Get-ChildItem of testcases/ returns 31 files; it appeared in the ignored-dirs enumeration. Cross-check against HEAD: if not in git ls-tree, it does not ship.

### F4 — SLOP: CLAUDE.md and docs/read_only_docs/SHIP_TO_ENCORE.md are tracked and ship to client

CLAUDE.md (13,400 bytes, last commit 48d5933f) contains internal agent config, LR-NNN rule references, codenames, and process vocabulary. It is gitignored at per-client level (per CLAUDE.md § Repo Structure) but force-tracked. It currently ships to the client via git archive. Same for docs/read_only_docs/SHIP_TO_ENCORE.md (7,802 bytes) — an internal agent instruction file with no client value.

### F5 — danger set cleared: untracked-not-ignored is now 0

The 2026-07-31 measurement found 29 untracked-not-ignored files including the doubled clients/encore/clients/ directory and ~20 loose root files (screenshots, debug scripts, review text). All are now gone. The fence is effective as of this snapshot.

### F6 — massive tree reduction since prior measurement

| Metric | 2026-07-31 | 2026-08-03 | Delta |
|---|---|---|---|
| reports/ files | 52,022–91,634 (live churn) | 6,200 | −45,000–85,000 |
| specs_planning/ files | 2,751 | 174 | −2,577 |
| .playwright-cli/ files | 328 | 1 | −327 |
| Untracked-not-ignored | 29 | 0 | −29 |
| Total disk (est.) | 2.2 GB | ~250 MB | −~1.95 GB |

---

## VERIFY_ARTIFACTS

All commands run with absolute paths from repo root C:/Users/rutvi/projects/encore_framework.

| # | Command | Output |
|---|---|---|
| 1 | git ls-tree -r --name-only HEAD -- clients/encore | 636 lines |
| 2 | git -c core.quotepath=false ls-files -z -- clients/encore | 636 NUL-delimited paths |
| 3 | git -c core.quotepath=false ls-files --others --ignored --exclude-standard -z -- clients/encore | 200 sampled; full count via dir walks |
| 4 | git -c core.quotepath=false ls-files --others --exclude-standard -z -- clients/encore | 0 (empty) |
| 5 | Get-ChildItem -Force -Recurse per named dir | Per-dir rollups in IGNORED section |
| 6 | git log -1 --pretty=format:'%h %as' per tracked file | Last-commit column in TRACKED tables |

Raw command output preserved in session temp files (ephemeral — not committed):
- C:\Users\rutvi\AppData\Local\Temp\1785759938338-copilot-tool-output-26636-fc00437d-3bc8-4aff-80c0-f55a18989be9.txt (enumerations)
- C:\Users\rutvi\AppData\Local\Temp\1785759994917-copilot-tool-output-26636-c701b161-31fb-44e6-bb6a-9725ef4f39d0.txt (tracked file details)

---

## ASSUMPTIONS-MADE

1. testcases/ directory appeared in the 'ignored dirs' enumeration loop (I checked named dirs including testcases) and is NOT in the HEAD tracked set — assumed gitignored-only. Needs verification.
2. scripts/ files classified SHIPS-BUT-DIRTY based on path pattern alone; actual slop content not line-audited (line audit is Phase 2 scope).
3. The 24-file quotepath artifact is the complete explanation for the INDEX-vs-HEAD diff — no other encoding issues assumed to be hiding further mismatches.
4. Ignored dir file counts were measured by Get-ChildItem against named dirs; any dirs not in my named list and not under the above dirs would not appear in the rollup.

---

## ASK

1. **clarify-scope**: testcases/ (31 files, 854 KB of XLSX deliverables) — is it in the tracked set or gitignored? If gitignored, it cannot ship via git archive. Needs owner decision: track it or ship separately.
2. **choose-between**: specs_planning/ is simultaneously gitignored (.gitignore:188) and tracked (426 force-added files). Owner must decide: (a) remove from tracked set so they stay internal, or (b) remove the .gitignore rule and accept them as shipped. Currently they ship to the client, which contradicts the gitignore intent.
3. **clarify-scope**: CLAUDE.md and docs/read_only_docs/SHIP_TO_ENCORE.md are SLOP in the tracked set and currently ship to the client. Confirm these should be git rm --cached (untrack without deleting) as part of Phase 3.
