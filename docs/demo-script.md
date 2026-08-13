# Demo Script (under one minute)

_Audience: demo-day presenters. Goal: the full detection → decision workflow in
**under one minute**, ending on the contrast that makes the product memorable.
The official scenario is documented in
[`docs/implementations/initializations.md`](../../docs/implementations/initializations.md)
(§ Demo-Day Scenario)._

## Before you start

- Run the app (`npm run dev` → http://localhost:5173) or open the hosted site.
- The map needs an internet connection (OpenStreetMap tiles); everything else
  works offline.
- Use the **'Try the demo' card** on the sign-in screen — it signs in with the
  shared demo account (`demo@gahm.org`) and loads the scripted 8-event scenario.
- If the list ever gets messy mid-demo, **Reset demo** in the header replays it
  from scratch.

## The script

1. **Sign in with the demo card** — "Try the demo". (≈ 5 s)
2. **The list is already prioritized**: EVT-1042 is at the top — **87/100 High**,
   an elephant group moving toward North Farm at dusk. Point at the red marker
   on the map and the movement trail. (≈ 10 s)
3. **Open EVT-1042 and walk the breakdown** — every contributing signal is
   listed with its points: proximity to farms, movement toward the boundary,
   species impact, historical conflict hotspot, dusk time window, group size,
   weather. Highlight the two different numbers: **detection confidence 0.91**
   vs **conflict risk 87** — deliberately not the same thing. (≈ 15 s)
4. **Run the response flow**: Acknowledge → Contact ranger unit → Prepare
   community warning → the SMS simulator sends a plain-language warning
   (delivered/failed counts, and a `SAFE` community reply appearing in the
   panel). (≈ 15 s)
5. **Close and record the outcome** — confirmed, conflict prevented, response
   time recorded. This closes the learning loop. (≈ 10 s)
6. **Show the contrast**: the interior events (EVT-1041, EVT-1044) are green /
   Low — logged quietly. Then open **EVT-1045**: the uncertainty path — Medium
   (43/100) with the warning *"Risk uncertain: recent movement data is
   unavailable. Manual review recommended."* The engine admits what it doesn't
   know. (≈ 10 s)
7. **Reset demo** if a replay is asked for. (2 s)

Total ≈ 1 minute. Slow sections at will — the flow is the story.

## Talking points

- **Weak signal detector**: GAHM is not another detection model — it's the
  intelligence layer that answers "does it matter *right now*?" (one ranger ≈
  72 km²; alert fatigue is the real enemy).
- **Explainability**: every score shows its reasons; the ranger can audit,
  override, and learn from each alert.
- **Human in the loop**: GAHM recommends; the ranger decides. No autonomous
  deterrents, no auto-deployment.
- **Honest uncertainty**: missing data lowers the score and says so — never
  presented as certainty.
- **Feedback loop**: outcome recording feeds back into calibration (per the
  plan's metric set: precision/recall, response time, false-alert rate).
- **SDG 15**: preventing conflict protects both communities and wildlife — it
  stops crop loss *and* retaliatory harm to animals.

## Likely questions (and answers)

| Question | Answer |
| --- | --- |
| Is this real wildlife data? | No — all data is synthetic, badged "Demo data" in the app. |
| Does GAHM detect animals itself? | No — it ingests detections from cameras/sensors and prioritizes them. Detection is out of scope for the hackathon. |
| Are real SMS sent? | No — the community warning is simulated on screen (cost/privacy-safe for the hackathon). |
| Why these weights (25/20/15/…)? | Interpretable, transparent weights chosen to reflect each signal's contribution to conflict likelihood; thresholds are configurable per reserve (the code is the source of truth: `src/engine/config.ts`). |
| How do you handle bad data? | The uncertainty penalty lowers the score and the panel explains why — EVT-1045 demonstrates exactly that. |
| Privacy? | Warnings never include exact wildlife coordinates, are short, local-language, low-literacy friendly, with opt-out; alerts are never prioritized by farm size. |
| What would a pilot look like? | Phase 2 in the plan: one partner site, real detection feed, locally calibrated thresholds, community consent (see `initializations.md` §6). |
