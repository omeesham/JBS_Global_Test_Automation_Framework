---
name: feedback_best_of_best_assistant_seats
description: "Assistant / debate / chief seats must ALWAYS be best-of-best models at model-max effort; sonnet & haiku are worker-tier only, never a seat"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e564a2f1-93bf-4e23-961c-0c6daa3a566e
---

Every assistant-class SEAT (debate rival, chief-of-staff, any judgment-class assistant role) must be drawn ONLY from the top-tier cross-family pool: **gpt-5.5 at `xhigh` (its model-max) × claude-opus-4.6 at `max`**. Both always run at model-MAX effort — "nothing short."

`claude-sonnet-*` and `claude-haiku-*` are **WORKER-tier ONLY** — they NEVER fill an assistant/debate/chief seat (sonnet under-reasons vs opus on judgment work). This overrides plain `scorecard.mjs select` output (which ranks worker-tier proven models). For a debate, PIN the two best cross-family models directly.

**Why:** Rutvik directive 2026-07-13 — "the assistants of claude are always the best of the models of gpt and claude ... at their max thinking ... sonnet is a worker, not an assistant, it's too dumb compared to opus." A weak seat produces weak judgment; the whole weakness-cancelling-panel value depends on both seats being frontier-class.

**How to apply:** on any I1+ debate / chief dispatch, ignore a sonnet/haiku `select` return and pin gpt-5.5 (xhigh) + opus (max). On a two-family machine (only claude+gpt), that pair IS the sole valid cross-family seating; the Claude-manager is the adjudicator, not a seat, so a claude-opus seat opposite a gpt seat is legitimately cross-family. Encoded in `~/.claude/delegation/debate-protocol.md` §2 tier floor. Relates to [[project_pipeline_identities_are_skins]].
