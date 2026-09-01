# SUBPLAN_GUARDRAIL_CLI_ERROR_CHANNEL

Status: pending
Class: a `playwright-cli` command that failed (stale ref, unmatched selector) prints `### Error` to
  stdout and returns a normally-shaped result; a probe that does not read that channel reads the
  failure as an observation about the application.

Graduating incidents (3, all 2026-08/09, Item Search):
- CEO-M17 — caught mid-session on the PRS th-probes; the guard (count `### Error` per command) was
  adopted by habit from that point on.
- CEO-M19 (Sev S1) — BUG-ISR-PCD-001 "View → Category silently no-ops" was filed from a PCD walk
  that PREDATED the CEO-M17 catch and was never re-driven. A false defect record reached the
  module's findings and survived one closure gate. The owner could not reproduce it; the LR-044
  re-drive proved the filed step order physically impossible and the control working. Invalidated.
- CEO-M20 — an `[active]` marker in a snapshot line broke a ref regex, so a barcode fill silently
  never landed and a search returned 376 rows that read as a plausible product finding. The habit
  fired (`err=1`), the reading was discarded, and the real behaviour (Any Field ↔ Barcode are
  mutually exclusive) was then found and covered by TC-ISR-PRS-030.

Prior-fix trial (LR-069 §3.5): the CEO-M17 remedy is agent discipline only — "check every command's
stdout for `### Error`". Verdict SURVIVES on the evidence: it fired on CEO-M20, on the first
instance, and stopped a bad reading from reaching an artifact. It is not CONVICTED and must not be
replaced. The gap it leaves is narrower and specific: the guard is *remembered*, not *structural*,
so it protects only sessions that remember it — which is exactly how CEO-M19 shipped (a walk from
before the habit existed, never re-driven).

Proposed mechanism (NOT yet implemented — a hook/wrapper change needs an explicit owner GO):
a thin wrapper around `playwright-cli` invocations that exits non-zero when stdout contains
`### Error`, so a failed command cannot return a normally-shaped result to an unwary caller.
Preferred over a detective gate because the failure is per-command and the caller is a probe loop.

Fail-green prerequisite: confirm the wrapper is silent across a full existing walk before any probe
is switched onto it, so it wedges nothing legitimate.

Companion (already landed, no work needed here): LR-044 governs re-driving a filed bug before
consuming it, and CEO-M19's rule states that a caught instrument-error class re-derives every
EARLIER verdict the same instrument produced.

Scope: the CLI probe path only. No change to specs, page objects, or any client-shipping file.
