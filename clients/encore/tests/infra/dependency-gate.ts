// 2026-05-08: skip-cascade removed per dependency-gate removal — annotation-only
// via DEP_ANNOTATION; tests surface their own failures (feedback_skip_discipline.md).
//
// Each test still calls dependencyGate(['TC-...']) for Allure observability — the
// declared deps appear as `dependsOn` annotations on the test, but no longer gate
// execution. Per-test navigation guards in each spec (test.beforeEach) handle the
// retry-recycle cascade that previously motivated the disk-backed registry.
import { test as base } from '@playwright/test';

const DEP_ANNOTATION = 'dependsOn';

type Fixture = { dependencyGate: (deps: string[]) => void };

export const dependencyGateExt = base.extend<Fixture>({
  dependencyGate: async ({}, use, testInfo) => {
    await use((deps: string[]) => {
      for (const dep of deps) {
        testInfo.annotations.push({ type: DEP_ANNOTATION, description: dep });
      }
    });
  },
});
