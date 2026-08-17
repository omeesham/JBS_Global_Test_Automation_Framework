---
description: Client-deliverable hygiene — no internal jargon in shipped client source
paths:
  - "clients/*/src/**/*.ts"
  - "clients/*/tests/**/*.ts"
  - "clients/*/scripts/**/*.js"
  - "clients/*/scripts/**/*.ts"
  - "clients/*/scripts/**/*.mjs"
  - "clients/*/config/**"
  - "clients/*/README.md"
---

# Client-Deliverable Hygiene

Path-scoped rule pack — loads when editing files that ship to a client inside `clients/<id>/`.

## LR-058: No internal jargon in shipped client source — translate to plain English at the point of writing

Files that ship to the client (everything under `clients/<id>/` that survives the ship deny-globs —
`src/`, `tests/`, `config/`, `scripts/`, `README.md`, root config) are **customer-facing**. Their
comments, JSDoc, string literals, and test titles MUST carry **zero** internal-process vocabulary:

- Rule / requirement IDs — `LR-###`, `LR-ENC-###`, `ALL/AUD/PLN/GEN/HLR/MNT-###`, `REQ-###`
- Plan / ticket IDs — `PLAN_*`, `SUBPLAN_*`, `SP-XX-N`
- Pipeline identity codenames — `HUNTER`, `GIVER`, `BUILDER`, `HEALER`, `WATCHDOG`, `GARDENER`, `OWNER`
- Doctrine / section refs — `§`, `Doctrine N`, `doctrine item N`
- Internal artifact names/paths — `walk-evidence`, `field-inventor*`, `rca-*.md`, `_internal/`, `specs_planning`, `neutral-eye`, `agent-*`
- Wave / phase IDs — `Wave-1.5`, `WV15`, `W15-*`, `Q-WV*`, `CPR-*-Q*`, `EDGE_P*`
- Renamed-away directory paths — `specs/` (the test dir is now `tests/`; a surviving `specs/` reference in shipped source is stale)

**The load-bearing principle**: *a plan that cites a rule does NOT license the token into the file.*
When a subplan says "keep separate (LR-012 spirit)" or "verify-only guard (LR-057)", the shipped
comment must read "kept separate because the behaviors differ" / "verify-only guard" — the WHY in
plain English, never the internal ID. The reason is what the customer benefits from; the ID is ours.
Internal IDs/artifacts belong in plans, `specs_planning/`, and the activity log — not in shipped code.

**KEPT (not jargon, never flagged)**: `NM-####` (the client's own Jira tickets), `@fcc` tags +
describe-title `FCC`, the `field-case-runner.ts` filename, `oracle` (OracleProductCode / Oracle DB),
`recon*`, `Path [C-Z]` (Windows drive letters), `F11`.

### Enforcement (defense in depth — write-time + commit-time + ship-time)

1. **Write-time (PREVENTIVE)** — PreToolUse hook `.claude/hooks/jargon-gate.sh` +
   `.claude/hooks/lib/check-jargon.mjs` DENIES an Edit/Write/NotebookEdit that introduces a banned
   token into an `isClientShipping()` file. Scans NEW content only — a scrub that removes jargon
   always passes. **No override** — a genuine false-positive is fixed by adding the token to the
   DELIBERATELY-EXCLUDED set in `forbidden-patterns.mjs`, never by bypassing per-write.
2. **Commit-time (detective)** — `.githooks/pre-commit` → `scripts/verify-no-forbidden.mjs --staged-diff`.
3. **Ship-time (detective)** — `scripts/verify-no-forbidden.mjs --target=<clean git-archive extract>` before any push.

All three layers read the **same** token sets from `scripts/lib/forbidden-patterns.mjs`
(`MARKER_GREP_CLIENT_ONLY` + `SOURCE_COMMENT_JARGON`) — edit a pattern there and every layer updates,
so the preventive hook and the detective gates can never drift apart. Adding a new banned token
requires **fail-green discipline**: confirm ZERO hits on the clean shipped tree first, so the gate
wedges nothing legitimate.

**How to apply**: when writing a comment / JSDoc / string / title in a shippable file, state the
reason in plain English. If a future maintainer needs the internal rule reference, put it in the
plan or the activity-log row, not the file.

**Trigger**: every Edit/Write to a file under `clients/<id>/` that ships (per the deny-globs).
Enforced by: [WIRED: .claude/hooks/lib/check-jargon.mjs] (write-time PreToolUse deny) + [WIRED: scripts/verify-no-forbidden.mjs] (pre-commit + ship-time gates) + [AGENT-DISCIPLINE] GENERATOR HARD STOP #12 / HEALER HARD STOP #7 / MAINTAINER HARD STOP #6 (prose instructions agents follow; no independent hook).

## LR-073: Structural names on shippable paths must be feature-based — ticket IDs are content, not names

File and directory basenames under client-shippable paths (`clients/<id>/tests/`, `testcases/`, `src/`,
`config/`, `specs_planning/test-cases/`), plus registry keys and values that propagate into shipped
file names (`module-codes.json` submodule keys and `mdBasename` values; `SPLIT_FILE_MAP` stem values;
`SHEET_NAMES` keys in `to-xlsx.ts`), **must be feature-based**. Examples: `corporate-override-core`,
`location-pricing`.

Ticket IDs (`nm####` / `NM-####`) are legal **only as content** — inside file bodies for traceability,
in plan files, and in internal artifacts under `specs_planning/_internal/`.

**Trigger**: authoring or renaming any file/directory under a shippable client path, or editing the
three named registry structures.
**Enforced by**: [WIRED: scripts/lib/check-structural-names.mjs] (pre-commit --staged, ship-time,
npm run check:structural-names) — severity S0, deny on first occurrence.

**Graduated from**: 2026-07-28 (commit `a544dcd72`) — six client-facing workbooks shipped named
`corporate-override-nm2268.xlsx` through `-nm2273.xlsx` because no file-naming rule existed and no
gate scanned path names (only file content). S0 class: internal-vocabulary leak onto a client-facing
surface is trust-destroying and gates on first occurrence.

---

**Graduated from**: 2026-06-11 — 25 internal-jargon comment lines reintroduced across 9 shippable
files by two Opus build sessions **<24h after** the 2026-06-10 source-comment scrub. Root cause: the
scrub installed only a commit/ship-time gate; nothing existed at the AUTHORING layer (no rule, no
write-time hook, no agent HARD STOP, no `agent-mistakes` entry), and the framework's own
"embed the rule ID at the point of action" culture actively trained builders to cite IDs everywhere.
The work sat uncommitted, so the commit gate never fired until the push session staged it. This rule
plus the write-time hook close the authoring-layer gap so the token can never be written, not merely
caught later.
