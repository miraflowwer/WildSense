# GAHM App — Documentation

This folder is the **versioned documentation** for the GAHM demo app — it ships
with the repository, so anyone who clones the repo gets these docs. Everything
here is written against the actual code in `app/src/`; if a prose document ever
disagrees with the code, the code wins (see `src/engine/config.ts`).

Team-level and historical material (implementation plans, event material,
ideation trail, research) lives in the workspace-root `docs/` folder, **outside
git**. The canonical product spec is
[`docs/implementations/initializations.md`](../../docs/implementations/initializations.md)
— read it before planning any implementation.

## Reading order

| # | Document | Audience | What it covers |
| --- | --- | --- | --- |
| 1 | [`overview.md`](overview.md) | Everyone — judges, mentors, new teammates | What GAHM does, why it matters, the workflow in plain language, what is real vs. demo |
| 2 | [`demo-script.md`](demo-script.md) | Demo-day presenters | The under-one-minute walkthrough, talking points, likely judge questions |
| 3 | [`architecture.md`](architecture.md) | Developers | Stack, module map, boot and runtime data flow, lazy loading, layout constraints |
| 4 | [`risk-algorithm.md`](risk-algorithm.md) | Developers | The scoring model: weights, thresholds, uncertainty penalty, worked examples |
| 5 | [`data-model.md`](data-model.md) | Developers | Shared types, store state and actions, write-through persistence |
| 6 | [`auth-and-workspaces.md`](auth-and-workspaces.md) | Developers | Supabase auth, offline demo mode, stay-signed-in, per-account workspaces |
| 7 | [`dev-workflow.md`](dev-workflow.md) | Developers | Running, verifying, updating, hosting, uninstalling the app |

## Quick orientation

- **The product**: an AI-powered wildlife conflict **risk engine** — a "weak
  signal detector" that turns scattered detections into prioritized, explainable
  risk alerts for rangers (SDG 15: Life on Land).
- **The repo**: `app/` is the git repo (branch `main`, pushed to
  `miraflowwer/GAHM-Prototype`). These docs are versioned with it; the root
  `docs/` is not.
- **The demo**: all data is synthetic and badged "Demo data" in-app. No real
  sensors, no real SMS, no real wildlife data.
