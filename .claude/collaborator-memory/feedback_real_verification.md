---
name: real-verification-means-full-user-journey
description: "Never declare \"verified\" based on component rendering or no-crash checks — must test the actual user action end-to-end"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 93ce0a56-81f6-41ce-991b-520bffdbcd17
---

After UI changes, verification must trace the FULL user journey, not just confirm components render without errors.

**Why:** In March 2026, declared AgentSelector "verified" because it rendered 5 buttons without console errors. But the selection was never sent to the backend — the component was purely cosmetic. "No crashes" ≠ "working UX". Rutvik caught this immediately from screenshots.

**How to apply:**
1. After ANY UI change, perform the actual user action: click the button → type input → send → verify the result appears correctly
2. Check network tab: did the frontend actually send the expected payload?
3. Check backend logs: did the backend receive and process the correct data?
4. "Component renders" is step 0, not the finish line
5. For chat flows: send a real message through the agent selector and verify the response reflects the agent choice

**Sharper (2026-06-18 — graduated to LR-059):** A simulator/mock you build to match your OWN new protocol is CIRCULAR verification — green proves the contract you just wrote, not that the real (often older-version) counterpart cooperates. IntelliQE Disconnect/Remove was "25/25 AUTO green" against a sim connector, but the user's REAL running connector was OLD code that ignored the new commands → server (which I made wait for the connector to confirm) never forgot it → UI frozen "connected." The real end-to-end drive was SKIPPED ("would pollute the repo") — exactly where every reported bug lived. Never claim works/verified for an integration feature until the REAL counterpart is driven end-to-end against its ACTUAL installed version. See [[feedback_verify_on_preview]] [[feedback_claim_vs_artifact_crosscheck]] [[feedback_server_authoritative_lifecycle]].
