---
name: report
description: Produce a polished, reader-appropriate artifact for an external audience (client or a JBS colleague working on a client). Runs ONLY when explicitly invoked — no auto-routing, no intent matching, no parent-skill auto-calls. Picks format by reader tier (agent-only plain md / human+agent structured md + light html / human-only full-visual html + optional pptx), then writes under clients/<client>/readable_externals/<audience>/.
user-invocable: true
disable-model-invocation: true
auto-calls: none
tools: Read, Glob, Grep, Write, Edit, Bash, Skill
---

# /report — External-Audience Artifact Generator

Produces the one thing this repo was missing: a consistent, findable, reader-appropriate artifact for someone outside our session — the Encore client or a JBS colleague working on Encore. Raw markdown at the repo root is not what these readers want; this skill gives them what they do want.

## When to Use

**Identity**: OWNER. This is documentation/artifact work, not pipeline work.

**Explicit-invocation ONLY.** The skill fires when Rutvik types `/report <...>`. It does NOT auto-route on intent phrases like "make me a report", "summarize this", "write it up for the client". Those phrases, without the literal `/report` slash command, must be ignored. This is the structural guarantee that the skill never runs unasked.

**Triggers (explicit `/report ...` only)**:
- Handoff docs to a colleague or client
- Review-response artifacts (e.g., "here's what we did with your 11 bug flags")
- Status updates to client stakeholders
- Pivot-defense decks
- Bug-flag responses
- Any other artifact that leaves our hands for a non-session reader

## Input

Argument forms:
- `/report <subject phrase>` — subject only; skill asks the 1 directional question
- `/report <subject> for <audience>` — `<audience>` is `encore` or `jbs`
- `/report <subject> for <audience> --reader=<tier>` — `<tier>` is `agent` | `human-agent` | `human`
- `/report <subject> for <audience> --reader=human --deck` — add PPTX deck on top of tier-3 HTML
- `/report migrate` — one-time sweep for orphaned external-audience files at repo root / unexpected locations

If the invocation is a bare `/report` with no subject, ask ONE directional question: "What's this report about, and who reads it — Encore or JBS?"

## Folder convention (where the output lands)

**Always**: `clients/<client>/readable_externals/<audience>/<YYYY-MM-DD>_<slug>/`

- `<client>` — default is the active client from env (Encore for now). Override with `--client=<name>`.
- `<audience>` — `encore` (shown to the Encore client) OR `jbs` (shown to colleagues at our own company, JBS, working on Encore).
- `<YYYY-MM-DD>_<slug>` — dated subdirectory, kebab-case slug from the subject. Example: `2026-04-23_local-office-bug-flag-response`.

**Never** write under `readable_externals/` from any other skill, hook, or tool. The folder is `/report`-exclusive. Any other writer = bug.

**Never** place external-audience artifacts at repo root, in `plans/`, in `clients/<client>/specs_planning/_internal/`, or anywhere else outside this convention.

## Reader tiers (format is picked by WHO reads, not by subject)

### Tier 1 — `agent-only` (agents consume, humans never read)

- **File**: `handoff.md` (or similar plain name) inside the dated dir.
- **Format**: clean, structured markdown. No HTML. No styling. No assets folder.
- **Why**: pretty formatting is wasted when a receiving agent just parses the content.

### Tier 2 — `human+agent` (both read — default on ambiguity)

- **Files**:
  - `source.md` — primary structured markdown (both audiences use this)
  - `index.html` — LIGHT render: basic headings, tables, code blocks, minimal CSS. NOT the tier-3 visual treatment.
- **Why**: human colleague skim-reads in a markdown viewer OR opens the html for a nicer look; their agent parses the md.

### Tier 3 — `human-only` (humans consume, agents never reuse it)

- **Files**:
  - `index.html` — full visual treatment (verdict banner, colored cards, badges, polished layout)
  - `source.md` — raw content we generated from (our audit trail; NEVER shared)
  - `assets/` — optional screenshots / diagrams
  - `deck.pptx` — optional, only when `--deck` passed
- **Why**: non-technical reader has ~60 seconds; the artifact must communicate the FEEL (where we stand, what we need, what's green/red/amber) before any words get read.

### Tier selection

- User passes `--reader=agent|human-agent|human` → use that.
- Otherwise, ask: "Who actually reads this — their agent, a human, or both?"
- If the user answer is still ambiguous or they say "both" → default to `human-agent` (tier 2).
- `--deck` layers PPTX on top of whatever tier. Makes sense mainly for tier 3.

## Phases

### Phase 0: Identity + trigger gate

1. Assert identity = OWNER (load via `/identity` if not active).
2. Confirm the invocation is literal `/report ...` from the user. If this skill was somehow auto-called from another skill's chain or from a hook, HALT — the skill must not run unasked.
3. If the subject phrase is missing, ask the single directional question.

### Phase 1: Input gathering

Resolve:
- `<client>` — default Encore (check `ACTIVE_CLIENT` env / CLAUDE.md).
- `<audience>` — `encore` or `jbs`. Ask if not given.
- `<reader tier>` — `agent` / `human-agent` / `human`. Ask if not given; default on ambiguity = `human-agent`.
- `<slug>` — kebab-case derivation of the subject, prefixed with today's date.
- Source material — from the session context (previous chat), referenced plan files, findings files, catalog files, bug reports. Take whatever the user offered; pull more via Read/Grep only if the subject clearly references something specific.

### Phase 2: Synthesis (opinionated, minimal)

From the source material, extract THREE things and nothing else:

1. **One-line verdict** — the feel, plain English, zero jargon. Example: "8 of 11 reviewer flags were ours; 3 are real app bugs; 1 was a reviewer misread."
2. **2-5 headline facts** — counts, statuses, decisions. Each ≤ 20 words.
3. **Table-worthy detail** — row per item (flag, TC, bug, module, etc.). ≤ 10 rows for tier-3 default; more allowed if `--long` is passed.

Drop everything else. Technical appendices belong in `source.md` only — never in the rendered artifact.

**Jargon translation** (applied to rendered output, not to `source.md`):
- `LR-XXX`, `SP-X-Y-Z`, `TC-XYZ-NNN`, chain-session IDs, subplan codes → plain English equivalents or removed.
- Agent codenames (HUNTER / BUILDER / etc.) → removed.
- "MCP-verified", "regression-guard", "chain_audit" → plain English ("tested on the live app", "cross-checked", etc.).
- File paths (except the artifact's own path) → removed or translated.

### Phase 3: Render

Pick the template by tier.

#### Tier 1 template (`handoff.md`)

```markdown
# <Subject> — Handoff

**Date**: YYYY-MM-DD
**From**: <us — e.g., "encore_framework maintainers">
**To**: <audience — e.g., "JBS reviewer agents">

## Verdict
<one-line feel statement>

## Headlines
- <fact 1>
- <fact 2>
- ...

## Details
| <col 1> | <col 2> | ... |
|---|---|---|
| ... | ... | ... |

## What we need from you
<if anything, 1-3 bullets; else omit section>
```

#### Tier 2 templates

`source.md` follows the same structure as tier 1.

`index.html` is a LIGHT render — sans-serif body, basic styling, table borders, code styling, NOT cards/badges/colors. Kept under ~80 lines of CSS. Template embedded below as `TIER2_HTML_TEMPLATE`.

#### Tier 3 template

`index.html` is the full visual treatment. Embedded as `TIER3_HTML_TEMPLATE`. Uses:
- Sans-serif body; monospace only for IDs/filenames if any slip in
- Green / amber / red accent by verdict state
- Top: verdict banner
- Next: "What this is" one-sentence block
- Then: cards (2x2 or 3x1) OR a table — pick whichever fits the content
- Footer: small timestamp + one-line "source" reference

`source.md` alongside holds the un-translated content (audit trail, never shared).

`deck.pptx` — generated only if `--deck`. Delegate to `anthropic-skills:pptx` via the Skill tool. 1 slide per headline fact; closing slide = the table.

### Phase 4: Placement + report back

1. Create `clients/<client>/readable_externals/<audience>/<YYYY-MM-DD>_<slug>/` if it doesn't exist.
2. Write the files per tier.
3. Report back in chat:
   - `Wrote: <relative path>/index.html` (or `handoff.md` for tier 1)
   - `Verdict: <one line>`
   - `Open in browser to preview.` (for tiers 2 and 3)
4. Do NOT commit or push. Rutvik controls git.

### Phase 5: Activity log

Append one row to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md` per LR-028 and LR-037 (current wall-clock timestamp, not backdated):

```
| YYYY-MM-DDTHH:MM | owner | done | <list of files written> | /report <subject> for <audience>, tier=<N>. <one-line verdict>. |
```

## Embedded HTML templates

### TIER2_HTML_TEMPLATE (light)

Replace `{{TITLE}}`, `{{DATE}}`, `{{VERDICT}}`, `{{BODY_HTML}}`. `{{BODY_HTML}}` = markdown content converted to basic HTML (h2/h3/p/ul/ol/table/code).

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{{TITLE}}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 820px; margin: 2.5rem auto; padding: 0 1.2rem; color: #222; line-height: 1.55; }
  h1 { font-size: 1.55rem; margin: 0 0 0.2rem; }
  h2 { font-size: 1.15rem; margin-top: 1.8rem; border-bottom: 1px solid #ddd; padding-bottom: 0.2rem; }
  h3 { font-size: 1rem; margin-top: 1.2rem; }
  .meta { color: #666; font-size: 0.85rem; margin-bottom: 1.2rem; }
  .verdict { background: #f4f6fa; border-left: 4px solid #5470c6; padding: 0.8rem 1rem; margin: 1rem 0 1.4rem; font-weight: 500; }
  table { border-collapse: collapse; width: 100%; margin: 0.8rem 0; font-size: 0.92rem; }
  th, td { border: 1px solid #e1e4e8; padding: 0.45rem 0.7rem; text-align: left; vertical-align: top; }
  th { background: #f6f8fa; }
  code { background: #f4f4f4; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.88em; }
  ul, ol { padding-left: 1.4rem; }
  footer { margin-top: 2.5rem; color: #888; font-size: 0.8rem; border-top: 1px solid #eee; padding-top: 0.8rem; }
</style>
</head>
<body>
<h1>{{TITLE}}</h1>
<div class="meta">{{DATE}}</div>
<div class="verdict">{{VERDICT}}</div>
{{BODY_HTML}}
<footer>Generated {{DATE}}.</footer>
</body>
</html>
```

### TIER3_HTML_TEMPLATE (visual)

Replace `{{TITLE}}`, `{{DATE}}`, `{{VERDICT_STATE}}` (green|amber|red), `{{VERDICT_TEXT}}`, `{{WHAT_THIS_IS}}` (one sentence), `{{CARDS_HTML}}` (2-5 `<div class="card status-green|amber|red">...</div>` blocks) OR `{{TABLE_HTML}}` (one `<table>`), `{{FOOTER_SOURCE}}`.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{{TITLE}}</title>
<style>
  :root {
    --green: #2f8a4c; --green-bg: #e7f5ec;
    --amber: #b07a1f; --amber-bg: #fdf5e3;
    --red:   #b83232; --red-bg:   #fbeaea;
    --fg: #1f2328; --muted: #666; --border: #e1e4e8;
  }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1.3rem; color: var(--fg); line-height: 1.5; }
  .title { font-size: 1.7rem; font-weight: 600; margin: 0 0 0.3rem; }
  .date { color: var(--muted); font-size: 0.85rem; margin-bottom: 1.4rem; }
  .verdict { padding: 1rem 1.2rem; border-radius: 8px; font-size: 1.05rem; font-weight: 500; margin-bottom: 1.6rem; }
  .verdict.green { background: var(--green-bg); border-left: 5px solid var(--green); color: var(--green); }
  .verdict.amber { background: var(--amber-bg); border-left: 5px solid var(--amber); color: var(--amber); }
  .verdict.red   { background: var(--red-bg);   border-left: 5px solid var(--red);   color: var(--red); }
  .intro { color: var(--muted); font-size: 0.95rem; margin-bottom: 1.6rem; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.9rem; margin-bottom: 1.8rem; }
  .card { padding: 0.9rem 1.1rem; border: 1px solid var(--border); border-radius: 8px; background: #fafbfc; }
  .card .label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); margin-bottom: 0.3rem; }
  .card .value { font-size: 1.4rem; font-weight: 600; }
  .card.status-green .value { color: var(--green); }
  .card.status-amber .value { color: var(--amber); }
  .card.status-red   .value { color: var(--red); }
  .card .note { font-size: 0.85rem; color: var(--muted); margin-top: 0.3rem; }
  table { border-collapse: collapse; width: 100%; margin: 0.5rem 0 1.8rem; font-size: 0.92rem; }
  th, td { border-bottom: 1px solid var(--border); padding: 0.55rem 0.7rem; text-align: left; vertical-align: top; }
  th { background: #f6f8fa; font-weight: 600; }
  tr .pill { display: inline-block; padding: 0.1rem 0.55rem; border-radius: 999px; font-size: 0.78rem; font-weight: 500; }
  tr .pill.green { background: var(--green-bg); color: var(--green); }
  tr .pill.amber { background: var(--amber-bg); color: var(--amber); }
  tr .pill.red   { background: var(--red-bg);   color: var(--red); }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f4f4f4; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.88em; }
  footer { color: var(--muted); font-size: 0.78rem; border-top: 1px solid var(--border); padding-top: 0.8rem; margin-top: 2.5rem; }
</style>
</head>
<body>
<div class="title">{{TITLE}}</div>
<div class="date">{{DATE}}</div>
<div class="verdict {{VERDICT_STATE}}">{{VERDICT_TEXT}}</div>
<p class="intro">{{WHAT_THIS_IS}}</p>
{{CARDS_HTML}}
{{TABLE_HTML}}
<footer>{{FOOTER_SOURCE}}</footer>
</body>
</html>
```

## Migration sub-command (`/report migrate`)

One-time + on-demand sweep for orphaned external-audience files.

Scan locations:
- Repo root for `HANDOFF_*.md`, `REVIEW_*.md`, `SUMMARY_*.md`, `REPORT_*.md`, `PIVOT_*.md`, `*_for_*.md`, `*_to_colleague.md`
- `clients/<client>/` root for the same patterns
- Any `.md` at repo root that isn't `CLAUDE.md`, `README.md`, `MEMORY.md`, `BUNDLE_MANIFEST.md` (framework files)

For each hit: ASK the user which tier applies (agent-only / human+agent / human-only) and what audience (encore / jbs). Never guess. Then move the content to `source.md` in a new dated subdirectory, generate the tier-appropriate rendered artifact, and delete the original from repo root.

## Rules

1. **NEVER auto-trigger.** Only explicit `/report` from the user. Not from intent patterns, not from auto-calls, not from hooks. If another skill tries to call this one, refuse.
2. **NEVER write to `clients/<client>/readable_externals/` from any other skill.** The folder is `/report`-exclusive.
3. **NEVER place the rendered artifact at repo root, in `plans/`, or in `specs_planning/_internal/`.** Wrong location = fail the skill.
4. **NEVER include internal-only identifiers** (rule numbers like `LR-XXX`, subplan IDs like `SP-B-LM-2`, chain-session UUIDs, agent codenames) in the rendered `index.html` or PPTX. They may appear in `source.md` only.
5. **NEVER exceed 1 screenful of content** in tier-3 HTML unless `--long` was explicitly passed. Minimal is the contract.
6. **NEVER auto-commit or push.** Rutvik controls git.
7. **NEVER guess tier or audience.** If not passed as args, ask.
8. **ALWAYS write `source.md` alongside** any tier-2 or tier-3 output — this is the audit trail for what we told the external audience.
9. **ALWAYS append an activity-log row** per Phase 5 with the current wall-clock timestamp (LR-037 — no backdating).
10. **ALWAYS translate internal jargon** out of the rendered artifact. `source.md` can keep it; `index.html` and `deck.pptx` cannot.

## Output

- `clients/<client>/readable_externals/<audience>/<YYYY-MM-DD>_<slug>/` containing tier-appropriate files
- One-activity-log-row appended
- 2-3 line chat summary with path + verdict + "open in browser" instruction

No git commit. No push. No surprise side effects.
