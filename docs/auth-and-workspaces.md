# Auth & User Workspaces

_Audience: developers. This is the versioned record of GAHM's auth design:
two modes, stay-signed-in, per-account workspaces, and boot session validation.
The team's detailed security plans live in the workspace docs outside this
repo; if this document ever disagrees with `src/auth/`, **the code wins**._

## Two modes

The app has no hard dependency on a backend. `src/auth/supabase.ts` creates the
client **only** when both env keys are present:

| Mode | When | Behavior |
| --- | --- | --- |
| **Offline demo mode** | No `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | `supabase` is `null`. The demo credentials sign in to a simulated session; real sign-up/sign-in shows "Server unreachable — check your connection and try again." |
| **Supabase mode** | Both keys set in `app/.env` (gitignored) | Real sign-up/sign-in, sessions, per-account workspaces. The demo credentials still enter demo mode. |

Demo credentials live in `src/auth/demoAccount.ts` (`demo@gahm.org`); the sign-in
screen exposes them through the "Try the demo" card.

## AuthProvider behavior (`src/auth/AuthProvider.tsx`)

- **Boot**: if "stay signed in" is on but the 30-day window expired, the flag is
  cleared and the session signed out. The existing session is then validated via
  `getUser()` with an 8-second timeout; a rejected (deleted-account) session is
  signed out with a notice instead of flashing stale state.
- **Mode mapping**: email `demo@gahm.org` → `mode: 'demo'` (synthetic in-browser
  scenario, nothing persisted); any other account → `mode: 'user'` (backend
  workspace).
- **Sign-up is instant**: email confirmation is **off** (Supabase dashboard
  setting "Confirm email" must stay OFF) — `signUp` returns a session and the
  `SIGNED_IN` event signs the user in. If no session comes back, the UI shows a
  configuration error.
- **Forgot password**: `resetPasswordForEmail` with `redirectTo: window.location.origin`
  → Supabase fires `PASSWORD_RECOVERY` → the app shows `SetPassword` →
  `updateUser({ password })`. The email template is customized via Brevo SMTP.
- **Sign-out** clears the stay-signed-in flag and surfaces a signed-out notice.
- **Error hygiene**: the context exposes `clearError()` so views can clear stale
  cross-view errors on view switches.

## Stay signed in (`src/auth/storage.ts`)

- Flag `gahm.stay_signed_in` (+ timestamp) in `localStorage`, remembered for
  **30 days** (`REMEMBER_DAYS`).
- The Supabase storage adapter routes session tokens to **localStorage** when the
  flag is on, **sessionStorage** otherwise — so an unchecked "stay signed in"
  session dies with the browser tab.
- All storage access is wrapped in try/catch: blocked storage degrades to
  best-effort instead of crashing sign-in.

## Workspaces & Row-Level Security

- **Unified Reserve Operations**: All authenticated rangers in a reserve share the active corridor `events` feed, ensuring synchronized incident tracking across sectors.
- **Data tables**:
  - `events`: Active wildlife incident reports with `audit_trail` JSON array tracking every action taken by rangers.
  - `profiles`: Authenticated ranger roster with sector assignments (`Kabini`, `Bandipur`, `Mudumalai`) and live duty status.
  - `subscribers`: Verified village alert recipients with enforced `consent_given = true` check constraint per DPDP Act §6.
  - `sms_log`: Record of dispatched community warning transmissions.
- **Auto-seeding on sign-up**: when a new user signs up and `loadEvents()` returns an empty database (`0` events), `store.tsx` automatically invokes `seedUserEvents()` to seed the standard corridor incidents into Supabase.
- The demo account is shared: anyone signing in with it enters `demo` mode, which runs the local scenario and communicates via `BroadcastChannel` for multi-window team collaboration without writing to the database.

## Write-through API (`src/auth/api.ts`)

- `loadEvents()` — loads corridor incidents, newest first (`happened_at` desc).
- `seedUserEvents(events)` — batch seeds initial corridor events into Supabase.
- `insertEvent(event)` — new wildlife detection (sets `owner_id`).
- `updateEvent(eventId, patch)` — status/ownership/outcome updates by `event_id`.
- `appendEventAudit(eventId, entry)` — appends an action to the incident audit trail.
- `loadProfiles()` / `upsertProfile(profile)` — manages on-duty sector roster.
- `loadSubscribers()` / `subscribeVillager(...)` / `deleteSubscriber(id)` — manages DPDP §6 verified subscribers.
- `loadCorridorActivity()` — loads aggregate public activity summary.
- `insertSmsLog(...)` — SMS dispatch records.

The store dispatches actions first (instant UI) and writes through in the background; failures flip `notPersisted` so the UI can indicate offline state. Diagnostic logging (`console.error('[GAHM API Error] ...')`) surfaces PostgREST and RLS issues in the browser console. See [`data-model.md`](data-model.md) for the action → API mapping.

## Security Hardening (SECURITY DEFINER Functions)

- Helper functions defined in `public` with `SECURITY DEFINER` (such as `public.rls_auto_enable()`) can present security risks if exposed to `anon` or `authenticated` roles via PostgREST RPC endpoints.
- **Remediation**: Execute `REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;` in Supabase SQL Editor and restrict execution to `service_role` and `postgres`.
- Consolidated schema and patch scripts are stored in `docs/supabase-schema-and-fixes.sql`.



