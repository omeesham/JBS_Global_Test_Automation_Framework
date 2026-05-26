# PLAN_FIXTURE_GOOD_C3_TEMPLATE_PLACEHOLDERS

**Status**: DONE
**Owner**: WATCHDOG
**Created**: 2026-05-26
**Executed**: 2026-05-26

---

## Objective

Validate that C3 does NOT flag template-variable directory prefixes, placeholder example filenames, or external user-scratch paths as missing artifacts. Regression-prevention fixture for the SP00 false-positive class discovered 2026-05-26.

## Scope

- Template-variable paths: `REPORTS_DIR/...`, `BUNDLE_DIR/...`, `MANIFEST_DIR/...`, `OUTPUT_PATH/...`, `REPO_ROOT/...`
- Placeholder filenames: `foo.csv`, `bar.md`, `baz.json`, `example.yml`, `placeholder.txt`
- External user/scratch paths: `Users/<name>/.claude/plans/...`, `~/.claude/plans/...`, `home/<name>/.claude/...`
- Self-references (ALL-087): plan's own future `done/` location + manifest path

## Steps

1. Cite template paths in body text — validator should skip them
2. Cite placeholder filenames in body text — validator should skip them
3. Cite external user paths in body text — validator should skip them

## Execution Summary

Walked the path-extraction surface and verified the C3 exclusion logic handles each false-positive class correctly.

The following template-variable paths appear in this body and MUST be skipped by C3:

- `REPORTS_DIR/drift-note.md` — placeholder for a runtime-resolved report directory
- `BUNDLE_DIR/test_cases_csv/foo.csv` — placeholder for a runtime-resolved bundle directory
- `MANIFEST_DIR/foo.json` — placeholder for a runtime-resolved manifest directory
- `OUTPUT_PATH/result.json` — placeholder for a runtime-resolved output path
- `REPO_ROOT/scripts/foo.mjs` — placeholder for a repo-root prefix

The following placeholder example filenames appear in this body and MUST be skipped:

- `clients/encore/test_cases_csv/foo.csv` — `foo.csv` is a stub example
- `clients/encore/specs/foo.spec.ts` is not on disk — `foo` is a placeholder
- `clients/encore/data/bar.json` — `bar.json` is a stub
- `clients/encore/docs/example.md` — `example.md` is a stub

The following external user/scratch paths MUST be skipped (they reference machine-local artifacts):

- `Users/rutvi/.claude/plans/scratch-plan.md` — external user-home path
- `home/runner/.claude/plans/ci-artifact.md` — external CI-runner path
- `~/.claude/plans/another-scratch.md` — tilde-expanded user-home path

These paths do NOT exist on disk, but the validator should treat them as documentation references rather than missing artifacts. Without the exclusion logic, this fixture would FAIL C3 with the same false-positives that blocked SP00's closure 2026-05-26.

ALL-087 self-references (this plan's own future locations) MUST also be skipped:

- `plans/done/good-c3-template-placeholders.md` — this fixture's eventual `done/` location
- `plans/_closure_manifests/good-c3-template-placeholders.md.manifest.json` — this fixture's eventual manifest path
- `plans/pending/good-c3-template-placeholders.md` — this fixture's current pending/ location (also resolves at commit time)

- Step 1 delivered: 5 template-variable paths cited above
- Step 2 delivered: 4 placeholder example filenames cited above
- Step 3 delivered: 3 external user/scratch paths cited above
- No real artifact paths are cited (so no legitimate C3 failures expected)
- Validator expected verdict: PASS across all C3 checks
- Audit trail: regression-prevention fixture for SP00 false-positive class (2026-05-26)

## Acceptance

- [x] Template paths excluded from C3 existence check
- [x] Placeholder filenames excluded from C3 existence check
- [x] External user paths excluded from C3 existence check
- [x] No legitimate missing-artifact claims in body
