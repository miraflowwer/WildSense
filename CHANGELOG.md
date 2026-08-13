# Changelog

All notable changes to the GAHM demo app are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this
project adheres to [Semantic Versioning](https://semver.org).

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
