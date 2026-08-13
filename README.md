# GAHM — Documentation Index

This is the documentation index for the **GAHM demo app** — an AI-powered
wildlife conflict risk engine ("weak signal detector") that turns scattered
wildlife and environmental signals into prioritized, explainable risk alerts
for rangers (SDG 15: Life on Land). Built for the Teens in AI — AI4Good
Incubator 2026 Demo Day.

The full documentation ships with this repo in [`docs/`](docs/). It is written
for **two audiences**: the **user** (the ranger operating the dashboard) and
the **developer** (the people building, testing, and maintaining it). Every
document states its audience up front. Everything is written against the actual
code in `src/`; if a prose document ever disagrees with the code, the code wins
(see `src/engine/config.ts`).

## For users (rangers)

| Document | What it covers |
| --- | --- |
| [`docs/overview.md`](docs/overview.md) | The product in plain language: what GAHM does, why it matters, the workflow, what is real vs. demo |
| [`docs/methodology.md`](docs/methodology.md) | Scientific methodology: 4 ingested telemetry layers, 7-signal mathematical formulation, empirical Indian surveys, and academic bibliography |
| [`docs/user-guide.md`](docs/user-guide.md) | Operating the dashboard: sign-in, reading alerts, taking action, SMS warnings, recording outcomes |
| [`docs/demo-script.md`](docs/demo-script.md) | The under-one-minute demo walkthrough + talking points (for presenters) |
| [`docs/ethics.md`](docs/ethics.md) | Ethics & responsible AI — privacy, bias, transparency, human oversight, Indian legal compliance |

## For developers

| Document | What it covers |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | Stack, module map, boot and runtime data flow, lazy loading, layout constraints |
| [`docs/risk-algorithm.md`](docs/risk-algorithm.md) | The scoring model: weights, thresholds, uncertainty penalty, worked examples |
| [`docs/data-model.md`](docs/data-model.md) | Shared types, store state and actions, write-through persistence |
| [`docs/auth-and-workspaces.md`](docs/auth-and-workspaces.md) | Supabase auth, offline demo mode, stay-signed-in, per-account workspaces |
| [`docs/unified-operations.md`](docs/unified-operations.md) | Multi-ranger coordination, real-time sync, on-duty roster, in-app notifications, and DPDP §6 subscriptions |
| [`docs/dev-workflow.md`](docs/dev-workflow.md) | Running, verifying, updating, hosting, uninstalling the app |
| [`docs/build-optimization.md`](docs/build-optimization.md) | Production bundle chunk splitting: why, the Rolldown config, measured sizes |
| [`docs/i18n.md`](docs/i18n.md) | Interface languages (English / Kannada / Tamil): scope, catalog structure, per-account preference, adding strings |
| [`docs/guided-tour-and-branding.md`](docs/guided-tour-and-branding.md) | Why the guided tour could stall on real clicks, the lockdown/spotlight fixes, headless verification, and the WildSense-vs-GAHM naming split |

## Quick orientation

- **The product**: a risk-prioritization workflow — the engine estimates
  conflict likelihood from weak, scattered signals and surfaces only the events
  that need a ranger's attention. GAHM recommends; the ranger decides.
- **The stack**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Leaflet
  (OpenStreetMap tiles), with optional Supabase auth and persistence.
- **Quickstart**:
  1. Open terminal inside `app/` and run `npm install`.
  2. Run `npm run dev` and open `http://localhost:5173`.
  3. Click **Try the demo** on the sign-in screen to launch the EVT-1042 scenario.
- **TUI launcher (Windows)**: instead of typing npm commands, run [`gahm.bat`](gahm.bat) — a
  text-menu helper that launches the demo at `http://localhost:5173`, installs/checks
  dependencies, runs the verify gate, updates (verify + commit + push), or uninstalls. It
  locates the app folder whether you double-click it inside `app/` or one level above.

## Team GAHM

Developed by **Team GAHM** for the Teens in AI — AI4Good Incubator 2026:

- **Harima K.** — Project Lead
- **Mathew M.** — Prototype Lead
- **Gabriel L.** — Technical Lead
