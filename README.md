# GAHM — Wildlife Conflict Risk Engine (Demo App)

AI-powered weak-signal detector: turns scattered wildlife and environmental
signals into prioritized, explainable risk alerts for rangers. Built for the
Teens in AI — AI4Good Incubator 2026 Demo Day.

Stack: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Leaflet
(OpenStreetMap tiles).

All data is **synthetic demo data** (badged in-app). No real sensors, no real
SMS.

---

## Requirements

- Node.js 20+ (any recent LTS works) and npm

## Launch locally

```bash
npm install     # first time only
npm run dev     # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run verify` | **Run before pushing anything**: lint + type-check + build |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve the production build locally (simulates the hosted site) |
| `npm run lint` | oxlint |
| `npm run clean` | Delete `node_modules` + `dist` (recreated by install/build) |
| `npm run update` | Verify + git commit "Update GAHM demo" + push → host redeploys |
| `npm run uninstall-demo` | Remove local installation: `node_modules`, `dist`, `.git`, `.netlify` state |

> On Windows, `clean` may fail with "file is locked" while the dev server is
> running. Stop it with Ctrl+C first, then run `npm run clean` again (the
> script retries and explains this automatically).

### One-click dev menu (`gahm.bat`)

Run `gahm.bat` (double-click, or from any terminal — it finds the app folder on
its own): a Windows menu TUI wraps the scripts above — launch the demo (1),
test dependencies (2), run checks: lint + type-check + build (3), update (4),
or uninstall (5).

## Demo flow (under one minute)

1. Sign in with the 'Try the demo' card on the sign-in screen (`demo@gahm.org`).
2. EVT-1042 is the flagship event: **87/100 High** at the top of the list,
   moving toward North Farm at dusk. Open it and walk the contributing-signal
   breakdown.
3. Acknowledge → Contact ranger unit → Prepare community warning (SMS
   simulator) → Close & record outcome.
4. EVT-1045 shows the uncertainty path (missing movement data); interior events
   stay green.
5. Use **Reset demo** in the header to replay the whole flow.

Full script, talking points, and judge Q&A: [`docs/demo-script.md`](docs/demo-script.md).

## Auth & workspaces

Real account sign-up/sign-in works when Supabase keys are configured (Row-Level
Security keeps each account's data private). Without `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` in the environment, the demo login still works in
offline demo mode. See [`docs/auth-and-workspaces.md`](docs/auth-and-workspaces.md).

## Documentation

The app ships a versioned docs folder — start at
[`docs/README.md`](docs/README.md): plain-language overview, demo script,
architecture, risk algorithm, data model, auth, and the developer workflow.

---

## Host online (pick one)

The build output is fully static (`dist/`), so any static host works. The two
zero-config options:

### Vercel (fastest — no config file needed)

1. The repo exists at `https://github.com/miraflowwer/GAHM-Prototype` (branch
   `main`) — push updates with `git push`. For a fresh repo instead, create one
   on GitHub and push the `app/` folder contents:

```bash
git init
git add .
git commit -m "GAHM demo"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. Go to [vercel.com/new](https://vercel.com/new), import the repo — Vercel
   auto-detects Vite (build `npm run build`, output `dist`). No extra settings.
3. Push updates with `git push`; Vercel auto-deploys each commit.

### Netlify (equivalently easy — config is already in `netlify.toml`)

1. Push the `app/` folder to GitHub as above.
2. Go to [app.netlify.com](https://app.netlify.com), **Add new site → Import an
   existing project**, pick the repo. Build settings are picked up from
   `netlify.toml`, or just confirm: build command `npm run build`, publish
   directory `dist`.
3. Every `git push` redeploys automatically.

### Not on GitHub yet?

The repo already exists. For a fresh repo, push your first commit (commands
above). To deploy without git at all: `npm run build`, then drag the `dist/`
folder onto [vercel.com/new](https://vercel.com/new) or the Netlify dashboard.

### Updating the hosted app

Both platforms auto-deploy from git, so updating is one command:

```bash
npm run update
```

That runs `verify` (lint + type-check + build), commits everything with
"Update GAHM demo", and pushes — Vercel/Netlify redeploy within a minute. For a
custom commit message:

```bash
npm run verify
git add -A && git commit -m "Your message" && git push
```

### Uninstalling / tearing down

```bash
npm run uninstall-demo   # removes node_modules, dist, .git and .netlify locally
```

That leaves the source files in place. To remove everything completely:

1. Delete the local folder (`app/` / the repo copy you made);
2. Delete the GitHub repo (Settings → Danger Zone → Delete repository);
3. Delete the hosted site in the Vercel or Netlify dashboard (Settings → Danger
   Zone → Delete Project/Site) — delete this **last**, it stays live until you
   do.

---

## Notes

- OpenStreetMap tiles require an internet connection to render the map.
  Everything else runs standalone.
- **Repo location**: the git repo lives inside `app/` — the workspace root one
  level up carries only a `.git` pointer file (`gitdir: app/.git`) with
  `core.worktree` pinned to `app/`, so git-aware tools launched from the root
  resolve this repo. Run git commands from inside `app/` (or via
  `npm run update` / `gahm.bat`); never `git init` at the root.
- **No test framework**: `verify` is lint + type-check + build — there are no
  unit tests to run.
