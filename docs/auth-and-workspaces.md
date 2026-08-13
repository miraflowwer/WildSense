# Auth & User Workspaces

_Audience: developers. The agreed
security plan lives in
[`docs/implementations/improved-auth-security.md`](../../docs/implementations/improved-auth-security.md)
(read it before touching `src/auth/`); the historical backend plan is in
[`docs/implementations/auth-and-user-workspaces.md`](../../docs/implementations/auth-and-user-workspaces.md)
and the boot-session validation in
[`docs/implementations/boot-session-validation.md`](../../docs/implementations/boot-session-validation.md)._

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
  signed out with a notice instead of flashing stale state — see
  `boot-session-validation.md`.
- **Mode mapping**: email `demo@gahm.org` → `mode: 'demo'` (synthetic in-browser
  scenario, nothing persisted); any other account → `mode: 'user'` (backend
  workspace).
- **Sign-up is instant**: email confirmation is **off** (Supabase dashboard
  setting "Confirm email" must stay OFF) — `signUp` returns a session and the
  `SIGNED_IN` event signs the user in. If no session comes back, the UI shows a
  configuration error.
- **Forgot password**: `resetPasswordForEmail` with `redirectTo: window.location.origin`
  → Supabase fires `PASSWORD_RECOVERY` → the app shows `SetPassword` →
  `updateUser({ password })`. The email template is customized via Brevo SMTP
  (see `personalized-signin-email.md`).
- **Sign-out** clears the stay-signed-in flag and surfaces a signed-out notice.
- **Error hygiene**: the context exposes `clearError()` so views can clear stale
  cross-view errors (see `demo-polish-2026-08-13.md`).

## Stay signed in (`src/auth/storage.ts`)

- Flag `gahm.stay_signed_in` (+ timestamp) in `localStorage`, remembered for
  **30 days** (`REMEMBER_DAYS`).
- The Supabase storage adapter routes session tokens to **localStorage** when the
  flag is on, **sessionStorage** otherwise — so an unchecked "stay signed in"
  session dies with the browser tab.
- All storage access is wrapped in try/catch: blocked storage degrades to
  best-effort instead of crashing sign-in.

## Workspaces & Row-Level Security

- Data tables: `events` and `sms_log`. Every row carries `owner_id` (the
  signed-in Supabase user id).
- RLS policies keep each account's rows private: `loadEvents()` returns only the
  caller's rows; inserts set `owner_id` from the session.
- The demo account is shared: anyone signing in with it enters `demo` mode,
  which runs the synthetic in-browser scenario and writes nothing to the
  database.

## Write-through API (`src/auth/api.ts`)

- `loadEvents()` — all rows for the caller, newest first (`happened_at` desc).
- `insertEvent(event)` — new detection (sets `owner_id`).
- `updateEvent(eventId, patch)` — status/ownership/outcome updates by `event_id`.
- `insertSmsLog(...)` — simulated SMS send records.

The store dispatches actions first (instant UI) and writes through in the
background; failures flip `notPersisted` so the UI can indicate offline-ish
state. See [`data-model.md`](data-model.md) for the action → API mapping.

