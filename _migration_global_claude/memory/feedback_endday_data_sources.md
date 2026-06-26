---
name: End-day skill — multi-source data gathering, never trust git alone
description: For end-day status, gather work from PLANS moved to done/, FILE MTIMES, git commits, activity log (validated), and uncommitted changes — all in parallel. Never trust a single source. Past reported lines are CLAIMS, not facts — verify before referencing.
type: feedback
originSessionId: 20553684-0faf-4369-a208-414c24756127
---
**Rule**: When gathering a day's work for end-day status, use MULTIPLE authoritative sources and reconcile discrepancies. File mtimes are the most reliable truth source. Plans moved pending/ → done/ are a high-confidence completion signal. Git log is a supplement (catches committed work only). Activity log must be validated (can be backdated). Past reported lines are CLAIMS, not facts.

**Why**: On 2026-04-15 I relied on git log alone, then referenced "yesterday's local office pages work" in today's line 3. Rutvik caught that Tuesday (2026-04-14) had ZERO commits — the claimed "Local Office Settings + ECT integration" was actually committed on 2026-04-15 at 12:41 today. Tuesday's activity log row was also backdated (files had mtime 2026-04-15, caught by LR-037). Perpetuating past false claims in today's cross-day narrative = lying to client.

**How to apply**:

1. **Primary signal — Plans moved to done/**:
   - `grep -l "Executed.*YYYY-MM-DD" plans/done/*.md` — plans completed on target date
   - `find plans/ -newermt "YYYY-MM-DD" ! -newermt "YYYY-MM-DD+1day"` — plans touched that day
   - Read each plan's Status, Executed, Execution Summary fields — describes achievement in planning language

2. **Truth signal — file mtimes**:
   - `find . -type f -newermt "YYYY-MM-DD" ! -newermt "YYYY-MM-DD+1day" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./reports/*"`
   - Mtimes don't lie. If git shows zero commits but mtimes show work, work was done but uncommitted.
   - Group by directory: `plans/`, `specs_planning/`, `src/`, `tests/`, `docs/`

3. **Supplement — git log** (committed work only):
   - `git log --format="%ai %h %s" --since="YYYY-MM-DD" --until="YYYY-MM-DD+1day"`
   - Can be incomplete (uncommitted work not captured). Use as supporting evidence, not authoritative.

4. **Validated — activity log**:
   - Read rows matching target date
   - Run `npm run validate:activity-log` and discard any row whose When < max(file mtime) — backdated
   - Never trust raw log content; LR-037 exists because agents backdate

5. **Work-in-progress — uncommitted**:
   - `git status --porcelain` + mtime filter = uncommitted work from target date
   - Include in analysis; flag to Rutvik if uncommitted

6. **Past reported lines — HISTORICAL CLAIMS, NOT FACTS**:
   - Lines in `reported_history[]` of daily-status-bank.json = what was TOLD to client
   - Before referencing "yesterday's [X]" in a new line, cross-check [X] actually happened on that day via sources 1-5
   - If past report was overstated → do NOT perpetuate the false cross-day framing. Drop it or rephrase honestly.

**Reconciliation pattern**: Build a per-day picture with all sources, note contradictions. If activity log says work done day N but mtimes say day N+1, go with mtimes (log was backdated). If past report claims X was done but no source confirms, treat as unverified — don't reference in new lines.

**Golden rule test**: Before outputting any cross-day reference ("continuing yesterday's...", "following up on [earlier day]'s..."), ask: "What FILE or PLAN evidence confirms that past-day work actually happened on that day?" If you can't point to file mtimes or plan Executed dates for that day, don't reference it.
