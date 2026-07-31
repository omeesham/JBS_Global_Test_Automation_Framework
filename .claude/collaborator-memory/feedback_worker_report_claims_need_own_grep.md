---
name: feedback-worker-report-claims-need-own-grep
description: "A worker's acceptance line is a claim, not a fact — re-run the grep yourself; four were false this session"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e1001be8-214b-4595-8e09-2ddfcb84e658
  modified: 2026-07-30T17:36:19.959Z
---

Worker reports state acceptance lines like `USES .first() ON SPINBUTTON: NO` or
`SILENT CATCH AROUND A WAIT: 0 remaining`. Several were **false while the rest of the report was honest** —
the worker fixed what the ticket named and reported the category as clean.

Confirmed false claims (2026-07-22 NM-2271):
- `USES .first() ON SPINBUTTON: NO` → 5 sites remained
- `SILENT CATCH AROUND A WAIT: 0 remaining` → 3 remained
- `exit 0 / ok=true / success` on two shard runs that wrote **nothing** to disk

**Why:** the worker isn't lying — it answers the question it was asked, scoped to the lines the ticket cited.
A ticket naming `page.ts:1049 and :239` invites a narrow read; the same defect existed 9× in that file.

**How to apply:**
1. Ticket the **category**, never specific line numbers: "every occurrence in this file", not "these two".
2. Require the raw command output in the report: *"paste `grep -c ...` verbatim — do not assert a count you
   have not printed."*
3. Re-run the decisive grep yourself before accepting. It is 1 cheap Bash call and it caught 4 defects here.
4. A stale-looking report may be from a **previous run** — check the file mtime against the run's start
   before reading numbers off it.

Related: [[feedback_copilot_output_untrusted]], [[feedback_claim_vs_artifact_crosscheck]]

## Partial death looks like success — count the rows, never read the total (2026-07-30)

A worker asked to classify 260 findings emitted **143 rows** and then wrote a `## COUNTS` section
claiming 260 — 107/153 by class, when the emitted rows were 87/56. It had run out of room partway
through and summarised as though finished. Total worker death is obvious (no deliverable, `ok:false`);
**partial death is invisible**, because the report is well-formed, the completed rows are genuinely good,
and only the summary lies.

The tells, cheapest first:
- **The summary's own arithmetic disagrees with itself.** Its OWNER sub-breakdown summed to 114 against
  a headline of 107. Add up any breakdown before trusting the total above it.
- **Emitted rows ≠ claimed count.** One `awk` between the section headers plus `grep -c`. Check for range
  notation first (`P2-LOT06-01..32` in one row would legitimately make rows < findings) — if every row is
  one item, the row count *is* the count.
- **Visible working-out left in the deliverable** ("Wait let me recount:", "Let me just report totals:")
  means the worker was improvising the summary rather than reading it off its own output.
- **A total that exactly matches a previously-remembered number** is a red flag, not reassurance — it
  usually means the prior denominator was inherited rather than re-derived.
- **Look at *which* items are missing.** Front-to-back coverage that stops dead partway through is
  truncation; scattered gaps are a different bug.

**How to apply:**
- Size the ticket to be completable. 260 rows in one report is the batch-write size that kills workers —
  the dispatcher owns that fault, not the worker.
- Put this clause in every enumeration ticket: *"If you cannot finish, emit the rows you completed and
  say where you stopped. A truncated report that admits truncation is a good result; a truncated report
  with a confident summary is the worst possible output."* Require one of two literal sentences under a
  `## COMPLETENESS` heading so the honest case is as easy to write as the dishonest one.
- Keep the good rows, reject only the summary. Re-dispatch the remainder in disjoint slices, each worker
  deriving its own scope from the source (see [[feedback_never_propagate_a_derived_id_to_file_mapping]]).
- **Compute final totals yourself from the emitted rows across all reports.** Never sum worker summaries.
