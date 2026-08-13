# Developer Workflow

_Audience: developers. This is the run/host/update quickstart for the repo; the
full documentation index lives in [`app/README.md`](../README.md). The one-click
menu (`gahm.bat`) below mirrors the npm scripts — keep the two in sync when
scripts change._

## Requirements

- Node.js 20+ and npm.

## Local development

```bash
npm install     # first time only
npm run dev     # dev server at http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with fast refresh |
| `npm run lint` | oxlint |
| `npm run build` | `tsc -b` (type-check) + production build to `dist/` |
| `npm run verify` | **The only pre-push gate**: lint → type-check → build. There is no unit test framework — do not look for or write vitest/jest tests. |
| `npm run preview` | Serve the production build locally |
| `npm run clean` | Delete `node_modules` + `dist` (recreated by install/build) |
| `npm run update` | Verify + `git commit -m "Update GAHM demo"` + push to `origin/main` |
| `npm run uninstall-demo` | Remove `node_modules`, `dist`, `.git`, `.netlify` — **deletes local git history**; never run casually |

Windows gotchas:

- `npm run clean` fails with "file is locked" while the dev server is running —
  stop it with Ctrl+C first; the script retries automatically and explains.
- `npm run uninstall-demo` is destructive (see above) and the hosted site stays
  live until deleted in its dashboard.

## One-click menu (`gahm.bat`)

`app/gahm.bat` (cmd.exe, double-click or from any terminal) locates the app
folder whether run from inside `app/` or one level above, then offers:

| Option | Action |
| --- | --- |
| 1 | Launch dev server (auto-installs deps if missing) |
| 2 | Test dependencies (Node/npm check + `npm ls`) |
| 3 | Run checks: lint + type-check + build |
| 4 | Update: verify → refresh packages → commit + push |
| 5 | Uninstall (asks for confirmation) |
| 6 | Quit |

The menu maps 1:1 to the npm scripts above — change behavior in `package.json`
first, then mirror the wording in the menu. Keep the batch file plain ASCII with
CRLF line endings.

## Environment keys

`app/.env` (gitignored — never commit it) optionally holds:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

From Supabase: Project Settings → API → Project URL and anon public key. Without
them the app runs in **offline demo mode** (demo login works, real sign-up
shows "Server unreachable"). See
[`auth-and-workspaces.md`](auth-and-workspaces.md).

## Hosting and updates

The build is fully static (`dist/`). Zero-config options, both auto-deploying
from git push:

- **Vercel** — repo `miraflowwer/GAHM-Prototype` (branch `main`); import at
  vercel.com/new, Vite is auto-detected.
- **Netlify** — settings already in `netlify.toml`; import at app.netlify.com.

Updating the hosted app is one command:

```bash
npm run update   # verify → commit "Update GAHM demo" → push → host redeploys
```

Manual equivalent with a custom message: `npm run verify` then
`git add -A && git commit -m "message" && git push`.

## Teardown

```bash
npm run uninstall-demo   # removes node_modules, dist, .git, .netlify — source stays
```

Full removal order: delete the local folder → delete the GitHub repo
(Settings → Danger Zone) → delete the hosted site in the Vercel/Netlify
dashboard **last** (it stays live until then).

## Troubleshooting

- `Node.js was not found` — install Node 20+ and reopen the menu.
- Dev server port in use — Vite picks another port; check the terminal output.
- Map not rendering — OpenStreetMap tiles need internet; the rest of the app
  works offline.
- Lint warnings (e.g. fast-refresh advice) don't fail `verify`; errors do.

