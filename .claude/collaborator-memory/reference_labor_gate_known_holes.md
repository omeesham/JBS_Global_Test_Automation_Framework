---
name: labor-gate-known-holes
description: "Live labor-gate: 3 proven ways a real spec suite runs inline unblocked, + why the check:spec-quality 'over-block' chip was killed as won't-fix"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 03335fd2-8e12-4e12-bcec-d6faadb69f0d
---

**Proven 2026-07-15** by a gpt-5.5 cross-provider attack probe, reproduced by Claude against the ORIGINAL staged gate. These run a REAL Playwright suite and the LIVE gate ALLOWs them:

- `pnpm exec playwright test`
- `yarn dlx playwright test`
- `npm run <keyword-free-name>` where the script chain reaches `playwright test` deeper than the resolver's depth cap

Also ungated by design (`delegation-gate.mjs:128-130`): all Bash, reads-at-scale, RCA, verification batteries, `.md` drafting.

**Why:** these are self-discipline holes, not attacker holes — the gate exists to stop Claude laboring, and Claude is not an adversary. Nothing exploits them; a tightening (adding the shapes to the block list) can never open a hole, so it is safe whenever it's worth a round. Owner decision 2026-07-15: log, don't chase.

**How to apply:** don't hand-wave "the gate would have caught it" — it wouldn't, for these three. When authoring any labor-gate change, `npm run` resolution decides ALLOW by *failing to recognize* a body — that polarity is how 10 real weakenings got introduced in one session; see [[gate-fix-floor-design]].

**Killed chip (won't-fix, 2026-07-15)**: "labor-gate over-blocks `npm run check:spec-quality`". Premise was WRONG — that script runs 5 chained commands = a verification battery, which `worker-ext.md` DEFAULT-DELEGATE requires be ticketed to a worker. The block IS the doctrine working. 3 build attempts + 2 reviews produced only new holes (`node`/`ts-node` script bodies treated as proved-safe → suite execution ALLOWed). Correct action: ticket the check. Claude filed this chip against its own guardrail — a signal worth noticing. Related: [[project-copilot-takeover-system]].
