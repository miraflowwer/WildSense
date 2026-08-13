# Changelog

All notable changes to the GAHM demo app are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this
project adheres to [Semantic Versioning](https://semver.org).

## [v0.4.0] — 2026-08-13 — Interactive Guided Tour

### Added

- Interactive step-by-step guided tutorial powered by `react-joyride` that walks demo-day presenters through the full detection → decision workflow.
- "Guided tour" header button in demo mode allowing presenters to trigger or restart the guided walkthrough at any time.
- Reactive state machine in `DemoTour` that automatically advances steps as rangers take actions (Acknowledge alert, Contact ranger unit, Prepare SMS, Send SMS, Record outcome, Inspect uncertainty).
- Styled tooltip overlays matching GAHM design tokens (emerald green highlights, clean typography, proper overlay layer).

## [v0.3.2] — 2026-08-13 — Demo mode server reachability fix

### Fixed

- Resolved issue where signing in with demo credentials (`demo@gahm.org`) incorrectly set `serverReachable` to `false` even when Supabase backend was reachable, causing the "Server unreachable — demo mode" banner to appear erroneously.
- Updated `AuthProvider` error handling to distinguish between Supabase API responses (`isAuthApiError`) and actual network connection failures.

## [v0.3.1] — 2026-08-13 — Supabase project update & security hardening

### Changed

- Updated Supabase project instance credentials (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in `app/.env` and `app/netlify.toml`.

### Security

- Resolved `public.rls_auto_enable()` `SECURITY DEFINER` vulnerability warnings by revoking execution permissions from `PUBLIC`, `anon`, and `authenticated` roles and restricting access to `service_role` and `postgres`.
- Added consolidated database migration & security patch script in `docs/supabase-schema-and-fixes.sql`.
- Updated developer documentation in `app/docs/auth-and-workspaces.md` and `docs/implementations/auth-and-user-workspaces.md`.

## [v0.3.0] — 2026-08-13 — Ethics & Indian rebrand

### Added

- `docs/ethics.md` — comprehensive responsible AI documentation structured
  around ten ethical considerations (privacy, bias, accuracy, human oversight,
  transparency, consent, accessibility, environment, deskilling,
  accountability) plus Indian legal compliance (DPDP Act 2023, Wildlife
  (Protection) Act 1972).
- `CHANGELOG.md` — this file.
- Sign-up screen now shows a data privacy notice.

### Changed

- Demo rebranded from East African (Kijani Reserve, Kenya) to Indian
  (**Aranya Corridor Reserve**, Nilgiri-Karnataka corridor).
- Species list updated to Indian conflict species (elephant, tiger, leopard,
  gaur, wild boar) — risk weights and thresholds unchanged.
- Weather/season model updated to Indian monsoon patterns (dry_season,
  post_monsoon, pre_monsoon, clear, monsoon).
- SMS language option changed from Kiswahili to Hindi.
- Demo recipients changed from Tanzanian (+255) to Indian (+91) numbers.
- Farm zones, communities, and sensors renamed to Indian equivalents
  (Rajapura, Hosahalli, Doddapalya).
- EVT-1045 uncertainty-path demo detection changed from hyena to leopard.

## [v0.2.0] — 2026-08-13 — Auth security & demo polish (retroactive)

- "Stay signed in" session control, forgot-password flow, hardened password
  UX, redesigned auth screen.
- One-screen layout, fast-refresh/chunk-split refactor, stale-auth-error fixes.

## [v0.1.0] — 2026-08-12 — Initial working demo (retroactive)

- Risk engine (weights 25/20/15/15/10/10/5, thresholds 40/70), map, alert
  workflow, SMS simulator, auth, docs.
