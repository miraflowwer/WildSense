# Architecture

_Audience: developers. Pairs with
[`risk-algorithm.md`](risk-algorithm.md) (the scoring model),
[`data-model.md`](data-model.md) (state and persistence), and
[`auth-and-workspaces.md`](auth-and-workspaces.md). Every claim here is
verifiable against `src/`; if this document disagrees with the code, the code
wins._

## Stack

- **React 19 + TypeScript** — UI, strictly typed end to end.
- **Vite 8** — dev server, build, `tsc -b` type-checking.
- **Tailwind CSS v4** — styling (single `@import` in `src/index.css`).
- **GSAP + ScrollTrigger** — entrance reveals and card morphing on the Landing Page.
- **Lenis** — smooth inertial scrolling engine for desktop and mobile; also powers the Landing Page's scroll-locked feature deck (see "Landing page scroll" below).
- **Leaflet + OpenStreetMap tiles** — the risk map (tiles need internet).
- **Supabase (optional)** — auth + per-account persistence. Without env keys the
  app runs in offline demo mode.
- Build output is fully static (`dist/`), deployable to any static host.

## Module map

```
src/
├── main.tsx                    Entry: <AuthProvider><GahmProvider><App/>
├── App.tsx                     Root layout: landing view vs. auth vs. dashboard, lazy-loading
├── index.css                   Tailwind import (single line)
├── types.ts                    Shared types (events, store, SMS, geo objects)
├── engine/                     Product core
│   ├── config.ts               Executable source of truth: weights, thresholds, tables
│   ├── riskEngine.ts           computeRisk() scoring + suggestNextAction()
│   └── geo.ts                  haversineKm, distanceToCircleKm, formatTime
├── data/
│   └── demoData.ts             Synthetic detections, reserve, farms, communities, sensors
├── store/
│   ├── store.tsx               GahmProvider: reducer + write-through persistence
│   ├── storeContext.ts         StoreContext + useGahm()
│   └── selectors.ts            sortedEvents, filterEvents, findById
├── auth/
│   ├── AuthProvider.tsx        Provider only: sessions, boot validation, sign-in/up/out
│   ├── authContext.ts          AuthContext + types + useAuth()
│   ├── supabase.ts             Supabase client (null without env keys → offline mode)
│   ├── storage.ts              Stay-signed-in flag + session storage adapter
│   ├── demoAccount.ts          Shared demo credentials + hint text
│   └── api.ts                  DB write-through helpers (events, sms_log)
├── lib/
│   └── lenisHolder.ts          Shared handle to the single Lenis instance (scroll-locked deck)
└── components/
    ├── LandingView.tsx         Cream-white public landing page with GSAP reveals + Lenis smooth scroll
    ├── FeatureCarousel.tsx     Scroll-locked feature deck: Lenis stop/start lock + wheel/touch stepping
    ├── MapView.tsx             Leaflet map (React.lazy)
    ├── NewDetectionForm.tsx    Manual detection entry (React.lazy)
    ├── AuthView.tsx            Sign-in/sign-up + modal support + demo card + forgot password
    ├── SetPassword.tsx         Reset-password screen
    ├── AlertList.tsx           Scrollable sorted/filtered alert list
    ├── AlertPanel.tsx          Event detail: signals breakdown, actions, status
    ├── FiltersBar.tsx          Risk/species/zone/community/status filters
    ├── OperationsBar.tsx       Header KPIs + Reset demo
    ├── SmsSimulator.tsx        Simulated community warning composer
    ├── OutcomeForm.tsx         Close-event feedback form
    ├── EthicsModal.tsx         Ethical AI & legal compliance modal
    ├── RiskExplanationModal.tsx Environmental risk calculation spec
    └── LocationPickerMap.tsx   Leaflet picker for new-detection coordinates
```

## Boot sequence

1. `main.tsx` mounts `AuthProvider` → `GahmProvider` → `App`.
2. `AuthProvider` boots: clears expired stay-signed-in sessions, reads the
   existing session, validates it against the server (8 s timeout), signs out
   stale sessions (see `auth-and-workspaces.md`).
3. `GahmProvider` reacts to `auth.mode`:
   - **demo mode** → seeds state from `buildDemoState()` (synthetic 8-event
     scenario);
   - **user mode** → loads the account's events from Supabase
     (`HYDRATE_EVENTS`) and marks persistence active.
4. `App` renders the auth screen or the dashboard (map + operations bar +
   filters + alert list + alert panel), all inside an `h-dvh`, `overflow-hidden`
   shell.

## Runtime data flow

```
UI action (Acknowledge, Contact ranger, Send SMS, Close event, …)
        │
        ▼
dispatch(action)  ──►  reducer mutates state  ──►  selectors re-render views
        │
        └─ (user mode only) persistAction(action, state)
                │
                ▼
        src/auth/api.ts → Supabase (events / sms_log) → SET_PERSISTED ok|fail
```

- In **demo mode** nothing is written to a database; the reducer still runs so
  the flow is identical on screen.
- In **user mode**, every mutating action is written through to Supabase; failed
  writes flip `notPersisted` in state (see `data-model.md`).
- **Tutorial (guided tour) mode** (`state.inTutorial`, see `DemoTour.tsx` and
  `App.tsx`): when a logged-in user runs the tour, real events are snapshotted
  into `realEventsSnapshot` and sample events (EVT-1042, EVT-1045, …) are loaded
  in memory only. Writes are suspended: the store's dispatch guard skips
  `persistAction`, and `SmsSimulator` skips `insertSmsLog`, so no tutorial
  activity (events or SMS logs) ever reaches Supabase. Finishing/skipping the
  tour dispatches `FINISH_TUTORIAL`, which discards the sample data and restores
  the snapshot — the workspace always returns to its real, clean state.

## Lazy loading

`MapView` and `NewDetectionForm` are `React.lazy`-loaded inside `<Suspense>`, so
the Leaflet library ships in its own on-demand chunk instead of the initial
bundle. Initial load stays fast; the map appears after a brief fallback.

Beyond lazy loading, the production build splits vendors into dedicated chunks
(react, supabase, gsap+lenis, react-joyride) via Rolldown
`output.codeSplitting.groups` in `vite.config.ts` — see
[`build-optimization.md`](build-optimization.md) for the config and measured
sizes.

## Layout constraints

- **One screen, no page scroll** — every view fits the viewport (`h-dvh` +
  `overflow-hidden` at page level). Only internal panels (alert list, map)
  scroll, inside their own area.
- **Guarantee**: every view fits without scrolling at ≥768 px viewport height;
  on smaller screens the auth card scrolls internally as a last resort — never
  the page.
- **Responsive**: auth screens compact to full-width cards; the dashboard stacks
  the sidebar under the map on narrow screens instead of overflowing
  horizontally.

## Landing page scroll behavior

The public Landing Page (not the dashboard) is the one screen that scrolls. It
uses Lenis (`autoRaf: false`) driven by the GSAP ticker for smooth inertial
scrolling, with GSAP ScrollTrigger entrance reveals for the hero, persona, SDG 15
and ethics sections.

The feature showcase (`FeatureCarousel.tsx`) is a **scroll-locked deck**. When the
deck scrolls to `top top+=80` (just below the sticky header, so its "Feature
Showcase 1 of 4" bar stays visible) it calls `lenis.stop()` to freeze the page,
and scroll gestures — wheel, touch, or arrow keys — step through the slides
instead, one slide per gesture with a 650 ms debounce. Scrolling past the last
slide (or back past the first) calls `lenis.start()` and Lenis animates on to the
next section. The lock is skipped when the deck is taller than the viewport
(small screens) or when the user prefers reduced motion. The single Lenis
instance is shared with the deck through `src/lib/lenisHolder.ts`. There is no
GSAP pinning involved, which keeps the transition into and out of the deck
jank-free.

## Where the risk logic lives

`engine/config.ts` is the executable source of truth for weights
(25/20/15/15/10/10/5), thresholds (low 40, high 70), and the species/time/
weather/group tables. `engine/riskEngine.ts` implements scoring and the
uncertainty penalty. See [`risk-algorithm.md`](risk-algorithm.md) for the full
model and worked examples.

