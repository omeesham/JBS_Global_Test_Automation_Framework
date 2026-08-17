#!/usr/bin/env node
// test-todo-injection.mjs — self-tests for check-todo-injection.mjs helpers.
// Extracted from inline --self-test suite (P2-LOT11-01).
// Run: node .claude/hooks/lib/test-todo-injection.mjs

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TAG_RE, extractTags, isBannedPhraseTarget, scanBannedPhrases,
  extractWriteContent, extractWriteContentPairs,
  isSpecPath, scanSkipFixmeWithoutBugCite, scanSkipFixmeNetNewWithoutBugCite,
  extractCaptureEntries, extractEntryProbe,
  isEvidenceDirTarget, isWalkExemptionsTarget,
  REPO_ROOT,
} from "./check-todo-injection.mjs";
import { isInExecuteContext, hasOverrideAuthorization } from "./hook-utils.mjs";

function runSelfTest() {
  const cases = [];

  // 1. TAG_RE — accept all 4 tag types.
  cases.push(["TAG accepts [/skill:direct]", () => TAG_RE.test("foo [/skill:direct] bar")]);
  cases.push(["TAG accepts [/skill:wrap]", () => TAG_RE.test("[/skill:wrap]")]);
  cases.push(["TAG accepts [/skill:inform]", () => TAG_RE.test("[/skill:inform]")]);
  cases.push(["TAG accepts [/skill:verify]", () => TAG_RE.test("[/skill:verify]")]);
  cases.push(["TAG accepts LR-027(reason)", () => TAG_RE.test("hit LR-027(plan finalization)")]);
  cases.push(["TAG accepts [manual](reason)", () => TAG_RE.test("[manual](just a doc)")]);
  cases.push(["TAG accepts [ceremony]", () => TAG_RE.test("hello [ceremony] world")]);
  cases.push(["TAG rejects bare LR-027", () => !TAG_RE.test("just LR-027 mentioned")]);
  cases.push(["TAG rejects [/skill:badtype]", () => !TAG_RE.test("[/skill:explode]")]);
  cases.push(["TAG rejects bare [manual]", () => !TAG_RE.test("[manual] without parens")]);

  // 2. extractTags — multiple tags in one string.
  cases.push([
    "extractTags multi",
    () => {
      const tags = extractTags("[/skill:direct] thing LR-007(verify) more [ceremony]");
      return tags.length === 3;
    },
  ]);

  // 3. isInExecute — positive (execute, no final-q).
  cases.push([
    "isInExecuteContext positive",
    () => {
      const msgs = [
        { role: "user", content: "do thing" },
        {
          role: "assistant",
          content: [
            { type: "tool_use", name: "Skill", input: { skill: "execute", args: "PLAN.md" } },
          ],
        },
        { role: "assistant", content: [{ type: "text", text: "working on it" }] },
      ];
      return isInExecuteContext(msgs) === true;
    },
  ]);

  // 4. isInExecute — negative (final-q after execute).
  cases.push([
    "isInExecuteContext negative after final-q",
    () => {
      const msgs = [
        {
          role: "assistant",
          content: [{ type: "tool_use", name: "Skill", input: { skill: "execute" } }],
        },
        {
          role: "assistant",
          content: [{ type: "tool_use", name: "Skill", input: { skill: "final-q" } }],
        },
      ];
      return isInExecuteContext(msgs) === false;
    },
  ]);

  // 5. isInExecute — never invoked.
  cases.push([
    "isInExecuteContext negative no execute",
    () => {
      const msgs = [
        { role: "user", content: "hi" },
        { role: "assistant", content: [{ type: "text", text: "hello" }] },
      ];
      return isInExecuteContext(msgs) === false;
    },
  ]);

  // 6. hasOverrideAuthorization — request + auth.
  cases.push([
    "override accepted",
    () => {
      const msgs = [
        {
          role: "assistant",
          content: [{ type: "text", text: "[OVERRIDE-REQUEST] foo/bar.ts edit\n" }],
        },
        { role: "user", content: "override approved" },
      ];
      return hasOverrideAuthorization(msgs, "foo/bar.ts") === true;
    },
  ]);

  // 7. hasOverrideAuthorization — request without auth.
  cases.push([
    "override rejected (no auth)",
    () => {
      const msgs = [
        {
          role: "assistant",
          content: [{ type: "text", text: "[OVERRIDE-REQUEST] foo/bar.ts edit" }],
        },
        { role: "user", content: "ok thanks" },
      ];
      return hasOverrideAuthorization(msgs, "foo/bar.ts") === false;
    },
  ]);

  // 8. extractTags — zero tags.
  cases.push([
    "extractTags zero",
    () => extractTags("plain prose with no tags").length === 0,
  ]);

  // 9. isBannedPhraseTarget — positive cases.
  cases.push([
    "banned-target walk-evidence",
    () => isBannedPhraseTarget("clients/encore/specs_planning/_internal/walk-evidence-shared-setup-2026-05-15.md"),
  ]);
  cases.push([
    "banned-target neutral-eye-audits nested",
    () => isBannedPhraseTarget("clients/encore/specs_planning/_internal/neutral-eye-audits/module-x/audit.md"),
  ]);
  cases.push([
    "banned-target field-inventories nested",
    () => isBannedPhraseTarget("clients/encore/specs_planning/_internal/field-inventories/foo-2026-05-15.md"),
  ]);
  cases.push([
    "banned-target plans/pending",
    () => isBannedPhraseTarget("plans/pending/SUBPLAN_DQU_V6_PILOT_SSL_A.md"),
  ]);
  cases.push([
    "banned-target plans backslash (Windows)",
    () => isBannedPhraseTarget("plans\\pending\\SUBPLAN_FOO.md"),
  ]);

  // 10. isBannedPhraseTarget — exemptions.
  cases.push([
    "banned-target EXEMPT browser-tool rule",
    () => !isBannedPhraseTarget(".claude/rules/browser-tool.md"),
  ]);
  cases.push([
    "banned-target EXEMPT agent-mistakes",
    () => !isBannedPhraseTarget("clients/encore/specs_planning/_internal/agent-mistakes.md"),
  ]);
  cases.push([
    "banned-target EXEMPT this plan",
    () => !isBannedPhraseTarget("plans/done/PLAN_FIX_CLI_HALLUCINATION_AND_SSL_A_BLOCKER.md"),
  ]);
  cases.push([
    "banned-target EXEMPT feedback memory",
    () => !isBannedPhraseTarget("/home/rutvik/.claude/projects/foo/memory/feedback_browser_tool_selection.md"),
  ]);

  // 11. isBannedPhraseTarget — non-target paths.
  cases.push([
    "banned-target negative src/",
    () => !isBannedPhraseTarget("src/components/foo.ts"),
  ]);
  cases.push([
    "banned-target negative clients/encore/specs/",
    () => !isBannedPhraseTarget("clients/encore/specs/foo.spec.ts"),
  ]);

  // 12. scanBannedPhrases — positive matches.
  cases.push([
    "scan matches Section 0 Live-Walk Blocker",
    () => scanBannedPhrases("## Section 0 — Live-Walk Blocker\nstuff").length > 0,
  ]);
  cases.push([
    "scan matches UNFILLED-BLOCKED-SECTION",
    () => scanBannedPhrases("here is UNFILLED-BLOCKED-SECTION placeholder").length > 0,
  ]);
  cases.push([
    "scan matches structural blocker",
    () => scanBannedPhrases("This is a structural blocker for the run").length > 0,
  ]);
  cases.push([
    "scan matches provisioning invariant",
    () => scanBannedPhrases("violates the provisioning invariant").length > 0,
  ]);
  cases.push([
    "scan matches Path N NOT taken phrase",
    () => scanBannedPhrases("Two paths: Path 1 (NOT taken in this session)").length > 0,
  ]);
  cases.push([
    "scan matches cannot complete strict line single session",
    () => scanBannedPhrases("subplan cannot complete its strict-line acceptance criteria in this single session").length > 0,
  ]);

  // 13. scanBannedPhrases — clean content.
  cases.push([
    "scan clean prose passes",
    () => scanBannedPhrases("Normal documentation about CLI commands.").length === 0,
  ]);

  // 14. extractWriteContent — Edit reads new_string only.
  cases.push([
    "extractWriteContent Edit returns new_string",
    () => {
      const r = extractWriteContent("Edit", { old_string: "banned: Section 0 — Live-Walk Blocker", new_string: "clean replacement" });
      return r.length === 1 && r[0] === "clean replacement";
    },
  ]);
  cases.push([
    "extractWriteContent Edit ignores old_string",
    () => {
      // Deletion case: new_string is empty, old_string has banned content.
      // Scan should NOT trip — gates deletions in.
      const r = extractWriteContent("Edit", { old_string: "Section 0 — Live-Walk Blocker text", new_string: "" });
      return r.length === 1 && scanBannedPhrases(r[0]).length === 0;
    },
  ]);
  cases.push([
    "extractWriteContent Write returns content",
    () => {
      const r = extractWriteContent("Write", { content: "the file body" });
      return r.length === 1 && r[0] === "the file body";
    },
  ]);
  // 15. isSpecPath — positive + negative.
  cases.push([
    "isSpecPath positive .spec.ts",
    () => isSpecPath("clients/encore/specs/locations/location-shared-setup.spec.ts"),
  ]);
  cases.push([
    "isSpecPath positive .test.ts",
    () => isSpecPath("apps/web/src/utils/foo.test.ts"),
  ]);
  cases.push([
    "isSpecPath positive Windows backslash",
    () => isSpecPath("clients\\encore\\specs\\foo.spec.ts"),
  ]);
  cases.push([
    "isSpecPath negative page object",
    () => !isSpecPath("clients/encore/src/pages/local-office/local-office-settings.page.ts"),
  ]);
  cases.push([
    "isSpecPath negative markdown",
    () => !isSpecPath("plans/pending/PLAN_FOO.md"),
  ]);

  // 16. scanSkipFixmeWithoutBugCite — denies skip/fixme without BUG- cite.
  cases.push([
    "skip-fixme deny: test.skip with no cite",
    () => {
      const c = "test.skip('TC-001 something', async ({ page }) => { /* body */ });";
      return scanSkipFixmeWithoutBugCite(c).length === 1;
    },
  ]);
  cases.push([
    "skip-fixme deny: test.fixme with no cite",
    () => {
      const c = "test.fixme('TC-002 broken', async ({ page }) => {});";
      return scanSkipFixmeWithoutBugCite(c).length === 1;
    },
  ]);
  cases.push([
    "skip-fixme deny: two skips with no cite",
    () => {
      const c = "test.skip('TC-A', () => {});\ntest.skip('TC-B', () => {});";
      return scanSkipFixmeWithoutBugCite(c).length === 2;
    },
  ]);

  // 17. scanSkipFixmeWithoutBugCite — allows skip/fixme with BUG- cite.
  cases.push([
    "skip-fixme allow: same-line trailing comment",
    () => {
      const c = "test.skip('TC-001', async () => {}); // BUG-LOC-SHR-001 appears for role X";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme allow: previous-line comment",
    () => {
      const c = "// BUG-LOC-SHR-001 — net-zero revert bug, see ssl-007 plan\ntest.skip('TC-001', () => {});";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme allow: next-line comment",
    () => {
      const c = "test.fixme('TC-002', () => {});\n// BUG-LOC-NTS-003 — deferred until app fix";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme allow: inline BUG cite in test body",
    () => {
      const c = "test.skip('TC-003 BUG-MGH-001 reproducer', () => {});";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);

  // 18. scanSkipFixmeWithoutBugCite — ignores non-skip code.
  cases.push([
    "skip-fixme noop: plain test()",
    () => {
      const c = "test('TC-001 normal', async ({ page }) => { await page.goto('/'); });";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme noop: test.describe()",
    () => {
      const c = "test.describe('Block A', () => { test('TC-001', () => {}); });";
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme noop: empty content",
    () => scanSkipFixmeWithoutBugCite("").length === 0,
  ]);

  // 19. scanSkipFixmeWithoutBugCite — mixed: some have cite, some don't.
  cases.push([
    "skip-fixme partial: cite on one, missing on other",
    () => {
      const c = [
        "test.skip('TC-A', () => {}); // BUG-LOC-001",
        "test.skip('TC-B', () => {});",
      ].join("\n");
      // First has cite (allow), second doesn't (offender). But adjacency check
      // means second line also sees prev line which has BUG-LOC-001 → ALLOWED.
      // To test the deny path, separate them.
      return scanSkipFixmeWithoutBugCite(c).length === 0;
    },
  ]);
  cases.push([
    "skip-fixme partial: distant skips, only one cited",
    () => {
      const c = [
        "test.skip('TC-A', () => {}); // BUG-LOC-001",
        "",
        "// unrelated comment",
        "",
        "test.skip('TC-B', () => {});",
      ].join("\n");
      // Second skip has no BUG- in prev/same/next line → 1 offender.
      return scanSkipFixmeWithoutBugCite(c).length === 1;
    },
  ]);

  // 20. isSpecPath — node_modules exclusion (false-positive guard).
  cases.push([
    "isSpecPath excludes node_modules .test.ts",
    () => !isSpecPath("node_modules/zod/src/v3/tests/array.test.ts"),
  ]);
  cases.push([
    "isSpecPath excludes node_modules .spec.ts (backslash)",
    () => !isSpecPath("C:\\proj\\node_modules\\pkg\\foo.spec.ts"),
  ]);
  cases.push([
    "isSpecPath excludes nested node_modules",
    () => !isSpecPath("website/backend/node_modules/zod/src/foo.test.ts"),
  ]);

  // 20b. isEvidenceDirTarget — SUBPLAN_CGS_B evidence-dir write gate (.playwright-cli/).
  cases.push([
    "evidence-dir positive: repo-relative .playwright-cli/",
    () => isEvidenceDirTarget(".playwright-cli/page-1.yml"),
  ]);
  cases.push([
    "evidence-dir positive: absolute POSIX .playwright-cli/",
    () => isEvidenceDirTarget("/home/rutvik/proj/.playwright-cli/net-x.json"),
  ]);
  cases.push([
    "evidence-dir positive: Windows backslash .playwright-cli\\",
    () => isEvidenceDirTarget("C:\\Users\\RutvikKhorasiya\\projects\\encore_framework\\.playwright-cli\\snap.yml"),
  ]);
  cases.push([
    "evidence-dir NEGATIVE: walk-evidence MD is NOT blocked (F5 — LR-064 authoring preserved)",
    () => !isEvidenceDirTarget("clients/encore/specs_planning/_internal/walk-evidence-pricing-2026-06-24.md"),
  ]);
  cases.push([
    "evidence-dir NEGATIVE: field-inventory MD is NOT blocked",
    () => !isEvidenceDirTarget("clients/encore/specs_planning/_internal/field-inventories/pricing-2026-06-24.md"),
  ]);
  cases.push([
    "evidence-dir NEGATIVE: ordinary source file",
    () => !isEvidenceDirTarget("scripts/walk-coverage/lib/coverage-manifest.mjs"),
  ]);
  // 20c. isWalkExemptionsTarget — walk-completeness enforcement write gate.
  cases.push([
    "walk-exemptions positive: repo-relative",
    () => isWalkExemptionsTarget(".claude/walk-exemptions.json"),
  ]);
  cases.push([
    "walk-exemptions positive: absolute POSIX",
    () => isWalkExemptionsTarget("/home/rutvik/proj/.claude/walk-exemptions.json"),
  ]);
  cases.push([
    "walk-exemptions positive: Windows backslash",
    () => isWalkExemptionsTarget("C:\\Users\\RutvikKhorasiya\\projects\\encore_framework\\.claude\\walk-exemptions.json"),
  ]);
  cases.push([
    "walk-exemptions NEGATIVE: a different .claude json",
    () => !isWalkExemptionsTarget(".claude/closure-config.json"),
  ]);
  cases.push([
    "walk-exemptions NEGATIVE: same name elsewhere",
    () => !isWalkExemptionsTarget("scripts/walk-coverage/walk-exemptions.json"),
  ]);
  // 21. scanSkipFixmeNetNewWithoutBugCite — grandfather behavior.
  cases.push([
    "net-new deny: NEW skip without cite (oldContent empty)",
    () => {
      const newC = "test.skip('TC-NEW', () => {});";
      return scanSkipFixmeNetNewWithoutBugCite(newC, "").length === 1;
    },
  ]);
  cases.push([
    "net-new allow: same skip line exists verbatim in oldContent (grandfathered)",
    () => {
      const oldC = "  test.skip('TC-OLD', () => {});";
      const newC = "  test.skip('TC-OLD', () => {});";
      return scanSkipFixmeNetNewWithoutBugCite(newC, oldC).length === 0;
    },
  ]);
  cases.push([
    "net-new allow: editing AROUND existing skip (skip line preserved verbatim)",
    () => {
      const oldC = [
        "// preamble",
        "  test.skip('TC-OLD-SSL-007', 'Blocked by app bug', () => {});",
        "// trailer",
      ].join("\n");
      const newC = [
        "// preamble UPDATED",
        "  test.skip('TC-OLD-SSL-007', 'Blocked by app bug', () => {});",
        "// trailer UPDATED",
      ].join("\n");
      return scanSkipFixmeNetNewWithoutBugCite(newC, oldC).length === 0;
    },
  ]);
  cases.push([
    "net-new deny: NEW skip added alongside existing-grandfathered skip",
    () => {
      const oldC = "  test.skip('TC-OLD', 'Blocked by app bug', () => {});";
      const newC = [
        "  test.skip('TC-OLD', 'Blocked by app bug', () => {});",
        "  test.skip('TC-FRESH', 'no bug filed', () => {});",
      ].join("\n");
      return scanSkipFixmeNetNewWithoutBugCite(newC, oldC).length === 1;
    },
  ]);
  cases.push([
    "net-new allow: NEW skip added WITH BUG- cite",
    () => {
      const oldC = "";
      const newC = [
        "// BUG-LOC-SSL-007 — net-zero revert",
        "  test.skip('TC-NEW', () => {});",
      ].join("\n");
      return scanSkipFixmeNetNewWithoutBugCite(newC, oldC).length === 0;
    },
  ]);
  cases.push([
    "net-new deny: skip line text CHANGED (reason rewrite) → no longer grandfathered",
    () => {
      const oldC = "  test.skip('TC-OLD', 'old reason', () => {});";
      const newC = "  test.skip('TC-OLD', 'new reason text', () => {});";
      // Text differs → treated as net-new. Documents the workflow friction
      // explicitly: reason rewrites on existing skips require a BUG- cite
      // OR override. Documented behavior, not a bug.
      return scanSkipFixmeNetNewWithoutBugCite(newC, oldC).length === 1;
    },
  ]);

  // 22. extractWriteContentPairs — Edit returns paired old+new.
  cases.push([
    "pairs Edit returns {newContent, oldContent}",
    () => {
      const r = extractWriteContentPairs("Edit", {
        old_string: "test.skip('TC-OLD', () => {});",
        new_string: "test.skip('TC-OLD', () => {});\ntest.skip('TC-FRESH', () => {});",
      });
      return r.length === 1
        && r[0].oldContent.includes("TC-OLD")
        && r[0].newContent.includes("TC-FRESH");
    },
  ]);
  cases.push([
    "pairs Write reads on-disk oldContent when file exists",
    () => {
      // Self-test runs in same process as the hook lib file → use this file's
      // own path as a known-existing disk file.
      const selfPath = fileURLToPath(import.meta.url);
      const r = extractWriteContentPairs("Write", { file_path: selfPath, content: "stub" });
      return r.length === 1 && r[0].newContent === "stub" && r[0].oldContent.length > 0;
    },
  ]);
  cases.push([
    "pairs Write returns empty oldContent for nonexistent file (net-new file)",
    () => {
      const r = extractWriteContentPairs("Write", {
        file_path: "C:/does/not/exist/zzz.spec.ts",
        content: "new file body",
      });
      return r.length === 1 && r[0].newContent === "new file body" && r[0].oldContent === "";
    },
  ]);

  // 23. extractCaptureEntries — two-mode dispatch (TodoWrite vs TaskList post-rename).
  cases.push([
    "extractCaptureEntries TaskList wrapped {tasks: [...]} returns inner array",
    () => {
      // Production tool_response shape, verified 2026-05-26 across 246
      // transcript JSONLs (11/11 conformant; 0 divergent).
      const wrapped = { tasks: [
        { id: "1", subject: "[ceremony] x", status: "pending", blockedBy: [] },
        { id: "2", subject: "untagged", status: "pending", blockedBy: [] },
      ] };
      const r = extractCaptureEntries("TaskList", {}, wrapped);
      return Array.isArray(r) && r.length === 2 && r[0].subject === "[ceremony] x";
    },
  ]);
  cases.push([
    "extractCaptureEntries TaskList non-array tool_response returns null (fail-open trigger)",
    () => {
      // String, object-without-tasks, null, wrapped-with-non-array-tasks, and
      // wrapped-with-null-tasks all return null → handleCapture fails-open.
      return extractCaptureEntries("TaskList", {}, "not an array") === null
        && extractCaptureEntries("TaskList", {}, { not: "array" }) === null
        && extractCaptureEntries("TaskList", {}, null) === null
        && extractCaptureEntries("TaskList", {}, { tasks: "not-an-array" }) === null
        && extractCaptureEntries("TaskList", {}, { tasks: null }) === null;
    },
  ]);
  cases.push([
    "extractEntryProbe TaskList uses subject only (no activeForm in response)",
    () => {
      // Tagged TaskList subject → tag is found.
      const tagged = extractEntryProbe("TaskList", { subject: "[manual](Phase 1) settings.json matcher" });
      const taggedHit = extractTags(tagged).length > 0;
      // Untagged TaskList subject → no tag found.
      const untagged = extractEntryProbe("TaskList", { subject: "plain prose with no tag" });
      const untaggedHit = extractTags(untagged).length > 0;
      // TodoWrite legacy probe concatenates content + activeForm.
      const legacy = extractEntryProbe("TodoWrite", { content: "do work", activeForm: "doing [ceremony] work" });
      const legacyHit = extractTags(legacy).length > 0;
      return taggedHit && !untaggedHit && legacyHit;
    },
  ]);
  cases.push([
    "extractCaptureEntries TaskList defensive flat-array fallback (legacy v14 shape)",
    () => {
      // If a future harness flattens the payload to a top-level array, take it.
      // Documents the second branch of extractCaptureEntries' TaskList handler.
      const flat = [{ id: "1", subject: "x", status: "pending", blockedBy: [] }];
      const r = extractCaptureEntries("TaskList", {}, flat);
      return Array.isArray(r) && r.length === 1 && r[0].subject === "x";
    },
  ]);

  // 18. File-driven fixture consumption (SUBPLAN_XLSX_PREP_01 Phase 6a, 2026-05-26).
  // The 6 fixtures under pipeline/tests/hooks/fixtures/ were previously
  // illustrative reference payloads with no test harness consuming them. The
  // assertions below now actually LOAD each fixture from disk and exercise it
  // through the relevant hook helper so the files become consumed (not dead).
  // Per stale-file-verification-2026-05-26.md item #1 AMBIGUOUS resolution.
  const FIXTURE_DIR = join(REPO_ROOT, "pipeline", "tests", "hooks", "fixtures");
  const tryReadJsonFixture = (rel) => {
    const fp = join(FIXTURE_DIR, rel);
    if (!existsSync(fp)) return null;
    try {
      return JSON.parse(readFileSync(fp, "utf8"));
    } catch (_e) {
      return null;
    }
  };
  const tryReadJsonlFixture = (rel) => {
    const fp = join(FIXTURE_DIR, rel);
    if (!existsSync(fp)) return null;
    try {
      return readFileSync(fp, "utf8")
        .split(/\r?\n/)
        .filter((l) => l.trim().length > 0)
        .map((l) => JSON.parse(l));
    } catch (_e) {
      return null;
    }
  };

  cases.push([
    "fixture v12-no-todo-marker-active: Edit payload shape (parses + key fields)",
    () => {
      const d = tryReadJsonFixture("v12-no-todo-marker-active.json");
      return (
        d !== null &&
        d.tool_name === "Edit" &&
        typeof d.session_id === "string" &&
        typeof d.transcript_path === "string" &&
        d.transcript_path.endsWith("transcript-in-execute.jsonl")
      );
    },
  ]);

  cases.push([
    "fixture v13-capture-payload: TodoWrite with every todo TAG_RE-tagged",
    () => {
      const d = tryReadJsonFixture("v13-capture-payload.json");
      if (d === null) return false;
      if (d.tool_name !== "TodoWrite") return false;
      const todos = d.tool_input && d.tool_input.todos;
      if (!Array.isArray(todos) || todos.length === 0) return false;
      // Every todo's content (legacy probe) must match TAG_RE — illustrates the
      // shape the --capture path is supposed to record as fully-tagged.
      return todos.every((t) => TAG_RE.test(t.content));
    },
  ]);

  cases.push([
    "fixture v13-todo-tagged-then-edit: Edit follow-up payload after tagged TodoWrite",
    () => {
      const d = tryReadJsonFixture("v13-todo-tagged-then-edit.json");
      return (
        d !== null &&
        d.tool_name === "Edit" &&
        typeof d.tool_input === "object" &&
        typeof d.tool_input.file_path === "string"
      );
    },
  ]);

  cases.push([
    "fixture v14-tasklist-capture-payload: TaskList tool_response shape",
    () => {
      const d = tryReadJsonFixture("v14-tasklist-capture-payload.json");
      if (d === null) return false;
      if (d.tool_name !== "TaskList") return false;
      // Either nested .tool_response.tasks (current shape) OR top-level array
      // (legacy v14 flat shape) — both are illustrative of valid harness payloads.
      const tasks =
        (d.tool_response && Array.isArray(d.tool_response.tasks) && d.tool_response.tasks) ||
        (Array.isArray(d.tool_response) && d.tool_response) ||
        null;
      return Array.isArray(tasks) && tasks.length > 0 && typeof tasks[0].subject === "string";
    },
  ]);

  cases.push([
    "fixture transcript-in-execute.jsonl: isInExecute returns true",
    () => {
      const msgs = tryReadJsonlFixture("transcript-in-execute.jsonl");
      return Array.isArray(msgs) && msgs.length > 0 && isInExecuteContext(msgs) === true;
    },
  ]);

  cases.push([
    "fixture transcript-in-execute-with-todo.jsonl: isInExecute true + TodoWrite mention",
    () => {
      const msgs = tryReadJsonlFixture("transcript-in-execute-with-todo.jsonl");
      if (!Array.isArray(msgs) || msgs.length === 0) return false;
      if (isInExecuteContext(msgs) !== true) return false;
      // Confirm the transcript mentions the TodoWrite event (capture trigger).
      const serialized = JSON.stringify(msgs);
      return serialized.includes("TodoWrite") || serialized.includes("Built TodoWrite");
    },
  ]);

  let passed = 0;
  let failed = 0;
  for (const [name, fn] of cases) {
    let ok = false;
    try {
      ok = !!fn();
    } catch (e) {
      ok = false;
    }
    if (ok) {
      passed++;
      console.log(`PASS ${name}`);
    } else {
      failed++;
      console.log(`FAIL ${name}`);
    }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

runSelfTest();
