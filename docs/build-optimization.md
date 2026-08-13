# Build Optimization — Vendor Chunk Splitting

_Audience: developers. How the production bundle is split, why, and how to tune it._

## Problem

The Vercel build logs warned:

> Some chunks are larger than 500 kB after minification.

The main `index` chunk was **758 kB minified (226 kB gzip)**. Only Leaflet was
code-split (`React.lazy` on `MapView`/`NewDetectionForm`, see
[`architecture.md`](architecture.md) → "Lazy loading"); everything else —
react/react-dom, @supabase, gsap, lenis, react-joyride — shipped in one chunk.

## Fix (2026-08-13, `app/vite.config.ts`)

Vite 8 uses **Rolldown**, so the equivalent of Rollup's `manualChunks` is
`build.rolldownOptions.output.codeSplitting.groups` (the warning itself
suggests it; `rollupOptions`/`manualChunks` are deprecated in Vite 8):

```ts
build: {
  rolldownOptions: {
    output: {
      codeSplitting: {
        groups: [
          { name: 'react',     test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,  priority: 100 },
          { name: 'supabase',  test: /node_modules[\\/]@supabase[\\/]/,                    priority: 90 },
          { name: 'motion',    test: /node_modules[\\/](gsap|lenis)[\\/]/,                  priority: 80 },
          { name: 'joyride',   test: /node_modules[\\/](react-joyride|@floating-ui|@gilbarbara|is-lite|react-innertext|scrollparent|scroll|@fastify)[\\/]/, priority: 70 },
        ],
      },
    },
  },
},
```

Notes:

- Regex separators must use `[\\/]` to be cross-platform (Windows-safe).
- `priority` (higher wins) resolves overlaps; joyride's transitive deps
  (`@floating-ui`, `@gilbarbara`, `scroll`, …) are pulled into its chunk so
  they don't get orphaned.

## Result

`npm run verify` green, 0 warnings:

| Chunk | Before | After |
|---|---|---|
| `index` (app code) | 758.36 kB min / 226.27 kB gzip | **151.56 kB min / 37.26 kB gzip** |
| `react` | — | 189.59 kB min / 59.61 kB gzip |
| `supabase` | — | 208.12 kB min / 53.77 kB gzip |
| `motion` (gsap+lenis) | — | 131.48 kB min / 49.34 kB gzip |
| `joyride` | — | 75.72 kB min / 25.50 kB gzip |
| `leaflet` (lazy, unchanged) | 148.80 kB min / 43.38 kB gzip | 148.81 kB min / 43.39 kB gzip |

- Every chunk is under 500 kB; the warning is gone.
- All chunks are `modulepreload`-ed in parallel from `index.html` — no
  waterfall, initial load unaffected.
- Bonus: vendor chunks cache independently (they change less often than app
  code).

## Version & branch

- `package.json` bumped **1.0.0 → 1.0.1** (also `package-lock.json`,
  `CHANGELOG.md`).
- Shipped on branch **`perf/vendor-chunk-splitting`** (b05674f) — **not merged
  to `main`**; PR: `https://github.com/miraflowwer/Wildlife-Conflict-Risk-Engine/pull/new/perf/vendor-chunk-splitting`.
