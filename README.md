# GAHM — Documentation

This is the documentation index for the **GAHM demo app** — an AI-powered
wildlife conflict risk engine ("weak signal detector") that turns scattered
wildlife and environmental signals into prioritized, explainable risk alerts
for rangers (SDG 15: Life on Land). Built for the Teens in AI — AI4Good
Incubator 2026 Demo Day.

The full documentation ships with this repo in [`docs/`](docs/). Everything is
written against the actual code in `src/`; if a prose document ever disagrees
with the code, the code wins (see `src/engine/config.ts`).

The team's canonical spec — `docs/implementations/initializations.md` — lives
outside this repo, in the unversioned workspace docs; read it before planning
any implementation.

## Reading order

| # | Document | Audience | What it covers |
| --- | --- | --- | --- |
| 1 | [`docs/overview.md`](docs/overview.md) | Everyone — judges, mentors, new teammates | What GAHM does, why it matters, the workflow in plain language, what is real vs. demo |
| 2 | [`docs/demo-script.md`](docs/demo-script.md) | Demo-day presenters | The under-one-minute walkthrough, talking points, likely judge questions |
| 3 | [`docs/architecture.md`](docs/architecture.md) | Developers | Stack, module map, boot and runtime data flow, lazy loading, layout constraints |
| 4 | [`docs/risk-algorithm.md`](docs/risk-algorithm.md) | Developers | The scoring model: weights, thresholds, uncertainty penalty, worked examples |
| 5 | [`docs/data-model.md`](docs/data-model.md) | Developers | Shared types, store state and actions, write-through persistence |
| 6 | [`docs/auth-and-workspaces.md`](docs/auth-and-workspaces.md) | Developers | Supabase auth, offline demo mode, stay-signed-in, per-account workspaces |
| 7 | [`docs/dev-workflow.md`](docs/dev-workflow.md) | Developers | Running, verifying, updating, hosting, uninstalling the app |

## Quick orientation

- **The product**: a risk-prioritization workflow — the engine estimates
  conflict likelihood from weak, scattered signals and surfaces only the events
  that need a ranger's attention. GAHM recommends; the ranger decides.
- **The stack**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Leaflet
  (OpenStreetMap tiles), with optional Supabase auth and persistence.
- **The demo**: all data is synthetic and badged "Demo data" in-app — no real
  sensors, no real SMS, no real wildlife data. Demo flow and talking points:
  [`docs/demo-script.md`](docs/demo-script.md).
- **Quickstart**: install, run, host, update — see
  [`docs/dev-workflow.md`](docs/dev-workflow.md).
- **The repo**: branch `main`, pushed to `miraflowwer/GAHM-Prototype`; run
  `npm run verify` (lint + type-check + build) before pushing anything.