# Docs — Index

This folder holds the versioned documentation for the GAHM demo app, written
for **users** (rangers) and **developers**. The full index with reading order
lives in the **repo README**: [`../README.md`](../README.md).

## For users (rangers)

| Document | What it covers |
| --- | --- |
| [`overview.md`](overview.md) | The product in plain language: what GAHM does, why it matters, the workflow, what is real vs. demo |
| [`user-guide.md`](user-guide.md) | Operating the dashboard: sign-in, reading alerts, taking action, SMS warnings, recording outcomes |
| [`demo-script.md`](demo-script.md) | The under-one-minute demo walkthrough + talking points (for presenters) |

## For developers

| Document | What it covers |
| --- | --- |
| [`architecture.md`](architecture.md) | Stack, module map, boot and runtime data flow, lazy loading, layout constraints |
| [`risk-algorithm.md`](risk-algorithm.md) | The scoring model: weights, thresholds, uncertainty penalty, worked examples |
| [`data-model.md`](data-model.md) | Shared types, store state and actions, write-through persistence |
| [`auth-and-workspaces.md`](auth-and-workspaces.md) | Supabase auth, offline demo mode, stay-signed-in, per-account workspaces |
| [`dev-workflow.md`](dev-workflow.md) | Running, verifying, updating, hosting, uninstalling the app |