---
name: Reporting-skill orthogonal toggles — more-detail + no-lies
description: 4 reporting skills share orthogonal toggles — `more-detail` (ARMOR) + `no-lies` (NO-LIES), composable. Phase 0 regex must avoid bare common words (`real`, `expand`) to prevent false triggers.
type: feedback
originSessionId: b9ff0e23-41b6-45fc-8ddf-8b6e55f32c47
---
All four reporting skills (`/standup`, `/end-day`, `/end-week`, `/next-this-week`) share **two orthogonal, composable mode toggles** detected in Phase 0:

- **`more-detail` → ARMOR** — meeting ammo for "asswhoop days" where Rutvik needs 2–3 named modules + rough status + deliverable noun. Synonyms: `expand on`, `arm me`, `meeting mode`, `a bit more detail`. Hard cap 1.5× default length.
- **`no-lies` → NO-LIES** — raw reality for colleagues with repo access (or self-reality-check). Forbids plan-optimism; verifies "finished" claims against git/mtime; banking OFF in `/end-day`; forces audience=standup in `/end-week`. Synonyms: `no lies`, `honest`, `straight`, `exact`, `reality`.
- **Composable** — `no-lies more-detail` = honest + armored. Footer always emits `[Mode: SHIELD|ARMOR|NO-LIES|NO-LIES + ARMOR]` for traceability (Rutvik-only, not copy-pasted).

**Why:** Orthogonality lets Rutvik pick the right surface per audience without inventing new skills. SHIELD is strategic-vague (scrum, timesheets, external status). NO-LIES is raw reality (repo-access colleague, introspection). ARMOR is expanded specificity (meeting preparation). Composition covers the 4 real scenarios he described 2026-04-23.

**How to apply:**
- Regex discipline — `no_lies` must NOT match bare `real` (false-triggers on "real quick", "real issue") → use `reality` + explicit `no lies`. `more_detail` must NOT match bare `expand` (false-triggers on "expand on that") → use `expand on`.
- Invocation-form docstrings (synonyms listed under each toggle) MUST match Phase 0 regex exactly — drift is an audit finding. Grep the SKILL.md Phase 0 block + the Invocation Forms block every time one is edited.
- Scan invocation string + prior 1–2 user messages for regex match; fall back to SHIELD if no match.
- Every skill must have a `[Mode: X]` footer emitted below the copy-paste block. Missing footer = bug.
- Every skill's Phase 0 block must be identical in structure across all 4 skills; one edit = 4 file updates.
