# Risk Algorithm

_Audience: developers. The executable
source of truth is
[`src/engine/config.ts`](../src/engine/config.ts) — if this document ever
disagrees with it, **the code wins**. The scoring implementation lives in
[`src/engine/riskEngine.ts`](../src/engine/riskEngine.ts)._

## Design principle

An **interpretable weighted scoring model** — not a black-box predictor. Every
point in the score is explained to the ranger as a contributing reason
(`label`, `points`, `description`), so the system earns trust and can be
audited, tuned, and overridden.

## Weights

| Weight | Signal | Contributing points |
| --- | --- | --- |
| **25** | Proximity to farms | 25 pts at ≤1 km; 0 pts at ≥12 km (`MAX_PROXIMITY_KM`); linear in between, rounded |
| **20** | Movement toward farm | 20 pts heading toward farmland; 6 pts moving away; **0 if unknown** |
| **15** | Species impact | `SPECIES_IMPACT`: elephant 15, tiger 14, leopard 13, gaur 10, wild_boar 8; unknown → 3 |
| **15** | Historical conflict | `min(15, incidents × 5)` — 3 prior incidents saturate the factor |
| **10** | Time of day | 10 pts in the dusk (17:00–20:00) or dawn (05:00–08:00) UTC peak; 3 pts otherwise |
| **10** | Group size | `GROUP_SIZE_POINTS`: 1→2, 2→4, 3→5, 4→7, 5→8, 6→9; cap at 10 |
| **5** | Weather / season | `WEATHER_FACTOR`: dry_season 5, post_monsoon 5, pre_monsoon 4, clear 3, monsoon 2 |

Maximum raw score: 25 + 20 + 15 + 15 + 10 + 10 + 5 = **100**.

## Uncertainty penalty

The engine never presents missing information as certainty:

- **−8** when movement data is unavailable (`movementKnown = false`) — warning:
  *"Risk uncertain: recent movement data is unavailable. Manual review
  recommended."*
- **−5** when detection confidence < 0.6 — warning: *"Low detection
  confidence; species identification uncertain."*

Both appear as a `Data uncertainty adjustment` reason with negative points and
a human-readable warning in the panel.

## Thresholds and levels

- `< 40` → **Low** (logged quietly, no interruption)
- `40–69` → **Medium** (displayed for monitoring)
- `≥ 70` → **High** (explainable ranger alert)

Thresholds are **per reserve** (`RESERVE_THRESHOLDS`; the demo reserve is
Aranya Corridor Reserve at 40/70) with a global fallback. `thresholdsForZone()`
maps sensor zones to their reserve. The final score is clamped to 0–100.

## Suggested next action

- High → *"Contact the nearest ranger unit and prepare a community SMS
  warning."*
- Medium → *"Add to monitoring; schedule a field check."*
- Low → *"Log event; no action needed."*

The ranger remains accountable — the engine recommends, the human decides.

## Worked examples

### EVT-1042 — the flagship High event (87/100)

Elephant, confidence 0.91, group of 5, 5.9 km from a farm, moving toward the
farm (movement known), 3 historical incidents nearby, dry season weather,
18:42 UTC (in the dusk peak):

| Factor | Points |
| --- | --- |
| Proximity | 14 (5.9 km → linear between 25 and 0) |
| Movement toward boundary | 20 |
| Species impact (elephant) | 15 |
| Historical conflict hotspot | 15 (3 × 5, saturated) |
| High-risk time window | 10 |
| Group size (5) | 8 |
| Weather / seasonal (dry_season) | 5 |
| **Total** | **87 → High** |

### EVT-1045 — the uncertainty path (46/100, Medium)

Leopard, confidence 0.52 (**< 0.6**), group of 3, 4.0 km from a farm, movement
**unknown**, 3 historical incidents, dry season, 23:05 UTC (outside the peak):

| Factor | Points |
| --- | --- |
| Proximity | 18 |
| Movement | 0 (unknown — no points) |
| Species impact (leopard) | 13 |
| Historical conflict hotspot | 15 |
| High-risk time window | 3 (outside peak) |
| Group size (3) | 5 |
| Weather / seasonal (dry_season) | 5 |
| Uncertainty adjustment | −8 (missing movement) − 5 (low confidence) = **−13** |
| **Total** | **46 → Medium** |

The demo shows this event as Medium with the uncertainty warning — the honest
"we don't know" path — instead of a confident but wrong score.

## The demo contrast

EVT-1041 and EVT-1044 are elephants deep inside the reserve (≥ 9.6 km from
farms, no conflict history, clear daytime weather): both land **Low** and stay
green. Same species, same day as EVT-1042 — only the context differs. That
contrast is the product's core message.

