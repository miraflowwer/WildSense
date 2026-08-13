# Data Model & State

_Audience: developers. Companion: [`architecture.md`](architecture.md) and
[`auth-and-workspaces.md`](auth-and-workspaces.md) (persistence + RLS)._

## Shared types (`src/types.ts`)

### `DetectionEvent` — the central object

| Field | Type | Meaning |
| --- | --- | --- |
| `event_id` | `string` | e.g. `EVT-1042` |
| `timestamp` | `string` (ISO) | Detection time |
| `sensor_zone` | `string` | Reserve zone (e.g. `North Boundary`) |
| `species` | `string` | e.g. `elephant` |
| `detection_confidence` | `number` | 0–1, sensor's confidence in the identification |
| `estimated_count` | `number` | Group size |
| `distance_to_farm_km` | `number` | Distance to nearest farm boundary |
| `movement_toward_farm` | `boolean` | Direction of travel |
| `movementKnown` | `boolean` | Whether movement data exists (drives uncertainty) |
| `historical_incidents_nearby` | `number` | Conflict history in the area |
| `weather_condition` | `string` | `dry`, `clear`, `rain`, `fog`, `drought` |
| `position` | `{ lat, lng }` | Latest location |
| `trail` | `{ lat, lng, ts }[]` | Movement trail for the map |
| `speed_kmh` | `number \| null` | Estimated speed from trail (null when < 2 points) |
| `community` | `string` | Nearest community name |
| `risk_score` | `number` | 0–100, computed by the engine |
| `risk_level` | `'low' \| 'medium' \| 'high'` | Derived from the score + thresholds |
| `reasons` | `ContributionReason[]` | Explainable breakdown (label, points, description) |
| `uncertainty` | `Uncertainty` | `penalty` + `warning` text (or null) |
| `status` | `EventStatus` | `awaiting_review` → `under_review` / `monitoring` / `escalated` / `dismissed` / `resolved` |
| `acknowledgedAt` | `string \| null` | When a ranger claimed the event |
| `rangerContactedAt` | `string \| null` | When the ranger unit was contacted |
| `owner` | `string \| null` | Ranger name who owns the event |
| `outcome` | `OutcomeRecord \| null` | Feedback recorded at close |

### Supporting types

- `OutcomeRecord` — `confirmed`, `conflictPrevented`, `actionTaken`,
  `feedback: 'valid' | 'false'`, `responseMinutes`, `notes`.
- `FarmZone` / `Community` / `Sensor` / `ZonePolygon` — the map's geography:
  3 farms, 3 communities, 6 sensors (one offline in the demo), 1 reserve
  polygon.
- `SmsState` — the SMS simulator's live state: `openEventId`, `sending`,
  `sentAt`, `delivered`/`failed` counts, `replies`, `allClearSent`.
- `Kpis` — operations-bar numbers: sensors online, communities affected,
  average response minutes.
- `FilterState` — list filters: `species`, `risk`, `status`, `zone`, `community`.

## Store (`src/store/store.tsx`)

`GahmProvider` owns a single reducer + `StoreState`:

```
events, selectedId, filter, sms, kpis, rangerName,
lastSyncAt, mode: 'demo' | 'user', notPersisted
```

| Action | Effect |
| --- | --- |
| `SELECT_ALERT` | Select the event shown in the panel |
| `SET_RANGER_NAME` | Ranger display name (falls back to `Ranger Demo`) |
| `SET_SYNC` | `lastSyncAt` timestamp |
| `ACKNOWLEDGE` | status → `under_review`, sets `owner` + `acknowledgedAt` |
| `CONTACT_RANGER` | `rangerContactedAt` + `owner` |
| `MONITOR` | status → `monitoring` |
| `ESCALATE` | status → `escalated` |
| `MARK_FALSE` | status → `dismissed` + false-outcome record |
| `RESOLVE` | status → `resolved` + `OutcomeRecord` |
| `SET_FILTER` | Patch the filter |
| `OPEN_SMS` / `CLOSE_SMS` | Open/reset the SMS simulator for an event |
| `SEND_SMS` | Mark sent (simulated delivery: 5 delivered, 1 failed) |
| `SMS_REPLY` | Append a community reply |
| `SEND_ALL_CLEAR` | Mark all-clear sent |
| `RESET_DEMO` | Rebuild the initial state (demo replay) |
| `SET_MODE` | Rebuild state for `demo` or `user` mode |
| `HYDRATE_EVENTS` | Load account events from the backend (user mode) |
| `ADD_EVENT` | Prepend a new event and select it |
| `SET_PERSISTED` | Flip `notPersisted` on write success/failure |

Selectors in `src/store/selectors.ts` provide sorted events (risk score desc),
filtered lists, and `findById`. KPIs are recomputed from `events` with `useMemo`.

## Persistence (`src/auth/api.ts`)

- **demo mode**: state lives only in memory; nothing is written anywhere.
- **user mode**: every mutating action is written through:
  - `ACKNOWLEDGE`, `CONTACT_RANGER`, `MONITOR`, `ESCALATE`, `MARK_FALSE`,
    `RESOLVE` → `updateEvent(eventId, patch)` on the `events` table;
  - `ADD_EVENT` → `insertEvent(event)` (sets `owner_id` to the signed-in user);
  - SMS sends are logged to `sms_log` (see `SmsSimulator`).
- Write failures set `notPersisted = true`; the next successful write clears it.

Table columns are snake_case (e.g. `happened_at`, `movement_known`,
`owner_name`, `acknowledged_at`) and map back into `DetectionEvent` fields via
`rowToEvent()` — keep the two in sync when the shape changes.

## Demo data (`src/data/demoData.ts`)

`buildDemoState()` runs every raw demo detection through the **real** risk engine
(`computeRisk`) so the demo scores are always computed, never hard-coded. The
scripted scenario: 8 events (EVT-1038…EVT-1046) — the flagship
EVT-1042 (87/100 High) and the uncertainty-path EVT-1045. All of it stays
badged "Demo data".
