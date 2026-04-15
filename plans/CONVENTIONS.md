# plans/ — Naming & Frontmatter Conventions

Authoritative conventions for plan files. GARDENER enforces. Established 2026-04-15.

---

## Folder layout

- `plans/pending/` — actually-pending work (one `**Status**: PENDING|GATED|TEMPLATE-DRAFT`)
- `plans/done/` — plans whose execution is complete (`**Status**: DONE` + `**Executed**: YYYY-MM-DD` + Execution Summary per LR-027)
- `plans/templates/` (optional, create if needed) — stubs kept as reference, never executed directly
- `plans/INDEX.md` — auto-regenerable index (see `PLAN_PLANS_INDEX_AUTOREGEN.md`)
- `plans/CONVENTIONS.md` — this file

Never leave a DONE-status file in `plans/pending/`. Never leave a PENDING file in `plans/done/`.

---

## Filename conventions

| Type | Pattern | Example |
|------|---------|---------|
| Top-level plan | `PLAN_<NOUN>_<TOPIC>.md` | `PLAN_CLIENT_REPO_DELIVERY.md` |
| Sweep/cleanup/audit plan | `PLAN_<AREA>_<VERB>_<TOPIC>.md` | `PLAN_PLANS_GARDENER_SWEEP.md` |
| Ordered subplan of an initiative | `SUBPLAN_<INITIATIVE>_<NN>_<PHASE>.md` | `SUBPLAN_HISTORY_04_LOCAL_OFFICE_INTEGRATION.md` |
| Deliverable artifact from a subplan | `SUBPLAN_<INITIATIVE>_<NN>_<ARTIFACT>.md` | `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` |
| History-track short-form plan | `PLAN_HIST_<TOPIC>.md` | `PLAN_HIST_EXTERNAL_SP1_AUDIT.md` |

Never use bare `SP1_…`, `SESSION_N_FINDINGS.md`, or initiative-less stubs in `plans/`.
Per-session artifacts belong in `specs_planning/_internal/` or next to their parent plan in `plans/done/` once the parent is done.

---

## Required frontmatter

Every plan MUST have immediately under the `# Title`:

```markdown
# <Title>

**Status**: PENDING | GATED | TEMPLATE-DRAFT | DONE | DELIVERABLE
**Priority**: P0 | P1 | P2 | P3
**Created**: YYYY-MM-DD
**Identity**: OWNER | GARDENER | WATCHDOG | HUNTER | GIVER | BUILDER | HEALER
```

Subplans additionally:
```markdown
**Parent**: <PARENT_PLAN_FILENAME>.md
**Depends on**: <predecessor subplan filenames, or NONE>
```

DONE plans additionally:
```markdown
**Executed**: YYYY-MM-DD
```
…followed by a `### Execution Summary` section per LR-027.

---

## Grep tests for health

From repo root:

```bash
# Every pending file has a Status field
grep -L '^\*\*Status\*\*' plans/pending/*.md            # expect empty

# No DONE status in pending
grep -l 'Status.*DONE$' plans/pending/*.md              # expect empty (DELIVERABLE allowed)

# No PENDING status in done
grep -l 'Status.*PENDING' plans/done/*.md               # expect empty

# All subplans have a Parent
grep -L '^\*\*Parent\*\*' plans/pending/SUBPLAN_*.md    # expect empty
```

---

## Lifecycle

1. Create in `plans/pending/` with full frontmatter.
2. On execution, `git mv` to `plans/done/`, set Status=DONE, add Executed date + Execution Summary.
3. Carry along any deliverable artifacts (findings, reports) into `plans/done/` in the same move.
4. Subplan stubs that aren't ready: keep Status=TEMPLATE-DRAFT in pending/ OR move to `plans/templates/`.
5. GARDENER sweeps pending/ periodically (see `PLAN_PLANS_GARDENER_SWEEP.md`).

---

## Supersession

When a plan's scope is fully absorbed by another, do NOT leave it rotting in pending/.
Either `git rm` it and record in `plans/done/SUPERSEDED_PLANS.md`, OR move to `plans/done/`
with Status=SUPERSEDED + pointer to the successor plan.
