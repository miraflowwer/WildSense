# Changelog

All notable changes to the GAHM demo app are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this
project adheres to [Semantic Versioning](https://semver.org).

## [v0.9.0] — 2026-08-13 — First-Time User Landing Page, Cream White Overhaul, GSAP Animations & Lenis Smooth Scroll

### Added

- **Cream White Visual System (`#FDFBF7`)**: Rebuilt the landing page from scratch with a warm ivory cream background (`#FDFBF7`), deep forest emerald accents (`#123524`), warm clay/copper highlights (`#C05621`), crisp white card containers (`#FFFFFF`) with soft warm borders (`#E8E2D5`), and dark charcoal typography (`#1A202C`). Dark mode has been eliminated on the landing page in favor of an elegant botanical aesthetic.
- **Lenis Smooth Scroll Engine**: Integrated Lenis smooth scrolling for buttery smooth inertial scrolling across desktop and mobile browsers, with automatic fallback for `prefers-reduced-motion: reduce`.
- **GSAP ScrollTrigger Animation Engine**: Added GSAP entrance reveals and scroll-triggered animations across the Hero, SDG 15 Purpose section, Persona Scroll-Break sections, and Ethics Charter.
- **Pinned GSAP Scroll-Locked Feature Deck (`FeatureCarousel.tsx`)**: Re-engineered the feature showcase into a viewport-pinned slide deck (`ScrollTrigger.create({ pin: true, scrub: 0.5 })`). As the user scrolls vertically, the active feature card, stats, and visual diagram morph smoothly in place before releasing scroll to the next section.
- **Stakeholder Persona Scroll-Break Sections**: Divided "Who is GAHM Built For" into 3 distinct full-viewport storytelling sections with scroll breaks for **Forest Rangers & Field Patrols**, **Wildlife Conservation Officers**, and **Fringe Agricultural Communities**. Features large high-impact visual artwork on the right and narrative storytelling on the left, animating into view with GSAP fade-in and scale-up scroll triggers.
- **Refined Cream White Auth Modal (`AuthView.tsx`)**: Updated the overlay login/register modal styling to match the warm ivory cream and deep emerald palette.
- **Ethical AI & Legal Charter**: Highlighted 5 core principles grounded in Indian law (*Wildlife (Protection) Act 1972*, *DPDP Act 2023*), including 0% GPS coordinate leakage in public SMS alerts, anti-economic bias, and honest uncertainty penalties.
- **Universal Accessibility Guarantee**: High-contrast visual alert indicators for deaf/hearing-impaired users, visual pulse animations, responsive mobile touch targets (≥44px), and zero horizontal scroll leaks.
- **Header Navigation Toggle**: Added an **About GAHM** button in the operational header for logged-in or demo users to navigate to the Landing Page at any time, with a sticky **Return to Dashboard** CTA.

## [v0.8.0] — 2026-08-13 — Logged-In User Tutorial, Uncapped Count Input, Clean Weather Labels & Environmental Risk Engine Spec

### Added

- **Logged-In User Guided Tour**: Enabled full access to the interactive Guided Tour for logged-in users in Live Mode (`mode === 'user'`).
- **Temporary Tutorial Data Cleanup**: When a logged-in user launches the Guided Tour, sample tutorial events (`EVT-1042`, `EVT-1045`) are temporarily loaded and database updates are suspended. When the tour finishes or is skipped, the tutorial data is purged and the user's workspace is restored to its clean real state.
- **Auto-Playing Guided Tour on Sign-Up**: Configured explicit sign-up session flags (`gahm_just_signed_up` in `sessionStorage` & `gahm_tour_played_[email]` in `localStorage`) in `AuthView.tsx` and `App.tsx`. Guarantees that when a new user completes account creation, the Guided Tour immediately mounts, loads sample tutorial data, and auto-plays step 1 automatically.
- **Uncapped Animal Count Input**: Redesigned the estimated animal count field in `NewDetectionForm.tsx` to allow any positive integer input (1 to 500+) with direct numeric entry and quick increment buttons (`+1`, `+5`, `+10`, `+25`).
- **Environmental Context Risk Engine Specification (`RiskExplanationModal.tsx`)**: Created a detailed, interactive specification modal accessible via the header nav ("Risk Engine") and AlertPanel ("How risk is calculated?"). Details the 5 core environmental context signals (*Animal Movement & Direction*, *Proximity to Farms*, *Historical Hotspots*, *Weather & Environmental Factors*, *Time of Day*) and multi-signal threshold filtering (low: 40, high: 70) that prevents false alert fatigue.

### Fixed

- **Tutorial SMS Logs No Longer Persist**: Fixed `SmsSimulator.tsx` so sending simulated SMS warnings or all-clear messages during the Guided Tour no longer writes `sms_log` rows referencing tutorial sample events (`EVT-1042`) into the user's Supabase database. The `insertSmsLog` call is now guarded by `!state.inTutorial` (alongside the existing `mode === 'user'` check), keeping all tutorial activity strictly temporary.
- **Complete Workspace Cleanup After Tutorial**: Removed automatic demo event database seeding (`seedUserEvents`) for logged-in user accounts in `store.tsx`. Ensures that new user accounts start with a completely clean workspace (`0 alerts`), display sample tutorial events strictly as temporary visual placeholders during the tour, and purge all sample events upon tutorial completion.
- **Prohibit Email Address as Profile Name (With Handle Support)**: Updated `AuthView.tsx`, `AuthProvider.tsx`, and `App.tsx` to use strict email pattern matching (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) rather than checking for simple `@` symbols. Prohibits actual email addresses (e.g. `alex@gmail.com`) while allowing callsigns/handles containing `@` (e.g. `@ranger_alex` or `@patrol1`).
- **Guided Tour Freeze & Missing Visual Data Fix**: Fixed freeze bug where `DemoTour.tsx` applied the `tour-active` grey overlay before sample tutorial events (`EVT-1042`, `EVT-1045`) were loaded into `state.events`. Updated `store.tsx` (`SET_MODE`, `RESET_DEMO`, `START_TUTORIAL`) and `DemoTour.tsx` to automatically inject sample tutorial events when `runTour` is active and guard `tour-active` CSS class application on sample event presence.
- **Explicit Sign-Up Password Validation Warning**: Updated `AuthView.tsx` and `SetPassword.tsx` to display immediate inline warning/error messages when a password is shorter than 8 characters (e.g., `⚠️ Password must be at least 8 characters (currently 3)`) and positive validation indicators (`✓ Password meets length requirements`) once the threshold is met.
- **Weather Label Formatting**: Added `formatWeatherName()` helper in `config.ts` to replace raw underscored string keys (`dry_season`, `post_monsoon`, `pre_monsoon`) with clean human-readable titles (`Dry Season`, `Post-Monsoon`, `Pre-Monsoon`) across forms, filters, and alert detail cards.
- **Log Detection Menu UI Redesign**: Modernized `NewDetectionForm.tsx` with a wider modal, refined typography, section dividers, location coordinate status tags, and improved species selection.

## [v0.7.6] — 2026-08-13 — Supabase Schema Alignment, Header Profile Sync & Database Setup Guidance

### Fixed

- **Blank Header Profile Indicator**: Fixed bug where logged-in user accounts displayed a blank header badge (`[ • ]`) by synchronizing `auth.user.name` into `state.rangerName` via `store.tsx` and adding multi-tier fallbacks in `App.tsx` (`displayRangerName` uses `auth.user.name` → `auth.user.email` → `'Ranger'`).
- **Database Setup Diagnostic Banner**: Updated server unreachable banner in `App.tsx` to provide explicit setup instructions when tables are missing in Supabase (`Database setup required — run docs/supabase-schema-and-fixes.sql in SQL Editor`).
- **Supabase SQL Schema Alignment**: Re-aligned `docs/supabase-schema-and-fixes.sql` table definitions for `public.events` and `public.sms_log` to 100% match `src/auth/api.ts` column names, types, primary keys, and Row-Level Security (RLS) policies.
- **API Error Logging & Diagnostics**: Enhanced `loadEvents()`, `insertEvent()`, `updateEvent()`, `insertSmsLog()`, and `seedUserEvents()` in `src/auth/api.ts` with explicit `console.error` diagnostic logging.

### Added

- **New User Workspace Auto-Seeding**: Configured automatic workspace initialization in `store.tsx` (`seedUserEvents`) when a new user signs up and `loadEvents()` returns `0` events. Automatically populates the user's personal Supabase workspace with the 8 standard demo incidents (EVT-1038 through EVT-1046) under their `owner_id`.

## [v0.7.5] — 2026-08-13 — Guided Tour Tooltip Placement & Viewport Padding Fixes

### Fixed

- **Map View Tooltip Centering & Clipping Elimination**: Updated Step 2 (`[data-tour="map-view"]`) tooltip placement to `'center'` over the map area in `DemoTour.tsx`, completely eliminating top-of-viewport screen clipping and header overlap.
- **SMS Simulator Modal Tooltip Shift**: Shifted SMS Simulator tooltip placement to `'left'` in `DemoTour.tsx` so the tooltip floats in the open space over the map to the left of the modal, leaving the entire SMS Simulator card (composed warning message, language toggles, recipient list, and Send warning button) 100% unobscured.
- **Floating UI Viewport Padding**: Added `floatingOptions={{ shiftOptions: { padding: 24 } }}` to the `<Joyride />` component to enforce a minimum 24px clearance from screen boundaries across all viewport sizes.

## [v0.7.4] — 2026-08-13 — Guided Tour Background Interaction Lockdown & Tour Step Refinements

### Added

- **Guided Tour Interaction Lockdown**: Prohibited user interactions with all greyed-out UI elements outside the active tour step target while the guided tour is running (`runTour === true`).
- **Target Element Attribute Synchronization**: Dynamically synchronized `data-tour-active="true"` on active step targets to permit pointer events strictly for the active target and Joyride portal tooltip (`#react-joyride-portal`).
- **Contributing Signals Target & Auto-Scroll**: Added dedicated step 4 highlighting `[data-tour="contributing-signals"]` with automatic smooth scrolling inside `AlertPanel`.
- **Full SMS Simulator Modal Highlight**: Updated SMS simulator tour step to highlight `[data-tour="sms-modal"]` (the entire modal card), providing full visibility of composed warning text and language toggle options with working Back/Next navigation.
- **Amber Uncertainty Warning Auto-Scroll**: Configured automatic scrolling down to `[data-tour="uncertainty-warning"]` so the amber warning card is clearly visible and highlighted, removing premature completion text.
- **Standalone Tour Completion Step**: Created a standalone final step (step 12) with custom completion prompt separated from the amber warning.
- **Pointer-Events & Cursor Styling**: Applied `pointer-events: none !important; cursor: not-allowed !important;` to background buttons, inputs, links, and Leaflet map controls/panes under `.tour-active`, restoring full interactivity immediately when the tour is finished, skipped, or closed via X button.
- **Keyboard Focus Trap**: Added a keydown listener to trap `Tab` focus within the active tour elements while the tour is running.

## [v0.7.3] — 2026-08-13 — Protected Area Boundary Color & Tour Text Styling

### Changed

- **Protected Area Boundary Color**: Updated reserve protected boundary polygon line to vibrant yellow (`#ca8a04`) with styled transparent yellow fill (`rgba(234,179,8,0.18)`).
- **Demo Tour Text Styling**: Updated tour step description text in `DemoTour.tsx` to `protected boundaries (yellow)` with yellow text highlight (`text-yellow-600`), matching map polygon styling.

## [v0.7.2] — 2026-08-13 — Map Territory Overlay & Contrast Color Refactor

### Changed

- **Shaded Territory Overlay**: Replaced heavy green zone shading (`rgba(22,163,74,0.25)`) with a clean, neutral slate territory overlay (`rgba(51,65,85,0.12)`) and slate boundary line (`#475569`), preventing map markers inside the reserve from blending with green terrain.
- **Online Sensor Markers**: Updated online sensor circle markers on the map from green (`#22c55e`) to bright sky blue (`#0284c7`) for high contrast against territory boundaries.
- **Low-Risk Detection Markers**: Updated low-risk incident marker color from emerald green (`#10b981`) to royal blue (`#2563eb`) across `demoData.ts`, `AlertList.tsx`, and `AlertPanel.tsx`.

## [v0.7.1] — 2026-08-13 — Desktop Sidebar Fixed-Width Layout Fix

### Fixed

- **Desktop Sidebar Expansion Bug**: Fixed issue where clicking on alerts in the right sidebar caused the sidebar to flex-grow and expand beyond its fixed width (`360px`/`380px`). Added `md:flex-none md:shrink-0` to the sidebar container in `App.tsx` to strictly constrain sidebar width on desktop displays regardless of mobile view tab state.

## [v0.7.0] — 2026-08-13 — Mobile Phone Compatibility, Positioning Redesign & Distinct Borders System

### Added

- **Mobile Phone Segmented View Switcher (`md:hidden`)**: Added interactive view mode toggle (`[ 🗺️ Map View | 🔔 Alerts & Details ]`) on screens `< 768px` allowing rangers on mobile phones to switch between full-height interactive map view and detailed incident review without squeezed vertical scrolling.
- **Auto-Switching Alert Focus**: Configured reactive state hook in `App.tsx` that automatically switches mobile viewport focus to the Alerts & Details view whenever an alert event is selected or targeted during guided tours.

### Changed

- **Distinct Card & Section Borders Design System**: Applied crisp, high-contrast borders (`border border-neutral-300 bg-white shadow-2xs`) across all dashboard components (`OperationsBar`, `FiltersBar`, `AlertList`, `AlertPanel`, `MapView`).
- **Color-Coded Left Accent KPI Indicators**: Added visual metric prioritization left borders in `OperationsBar` (Red for Active High-Risk Incidents, Amber for Unreviewed Alerts, Blue for Response Time, Emerald for Sensors Online, Purple for Communities Affected).
- **Responsive KPI Grid Layout**: Compacted `OperationsBar` card grid for mobile phone displays to maximize vertical map workspace.
- **Alert Cards Visual Polish**: Wrapped `AlertList` items in individual cards with crisp borders, shadow elevation (`shadow-2xs`), hover feedback, and high-contrast risk level badges.
- **Alert Detail Panel Hardening**: Enclosed `AlertPanel` signal reasons, risk breakdown cards, and suggested next action boxes in distinct card panels with touch-friendly action button hit targets (≥ 44px height).
- **Framed Map Container**: Added distinct border separation (`border-r border-neutral-300/70`) and styled floating demo data badge (`border border-neutral-700 bg-neutral-900/90 text-amber-300`) around `MapView`.

## [v0.6.0] — 2026-08-13 — WCAG 2.1 AA Navigation Header & Visual Hierarchy Refactor

### Changed

- Replaced static sync timestamp indicator in the top header with a real-time live UTC clock (`HH:MM:SS UTC`) with an animated pulsing indicator (`animate-pulse bg-emerald-500`) and monospace font styling (`font-mono`).
- Refactored top navigation header in `App.tsx` into 3 clear functional zones: **Brand & System Status** (left: GAHM logo, title badge, mode badge, sync status), **Primary User Actions** (center/right: `Log detection` primary CTA and `Guided tour` demo CTA), and **Account & Secondary Actions** (far right: User profile indicator, `Reset demo`, `Ethics & Legal`, `Sign out`) separated by a visual divider.
- Standardized User Profile Indicator (`state.rangerName`) strictly inside Zone 3 across both demo and live operating modes.
- Hardened color contrast to strictly comply with WCAG 2.1 AA (≥ 4.5:1 ratio): replaced low-contrast `bg-emerald-500` hover state with `bg-emerald-700` default and `hover:bg-emerald-800` active styles for primary white-on-emerald buttons.
- Enhanced responsive accessibility for sync status: replaced `hidden md:inline-flex` with `sr-only md:not-sr-only md:inline` so screen readers on mobile devices retain `aria-live="polite"` updates.
- Wrapped top navigation elements in semantic `<header>` and `<nav aria-label="Main Navigation">` elements.
- Ensured all header buttons (`Guided tour`, `Log detection`, `Reset demo`, `Ethics & Legal`, `Sign out`) have explicit `type="button"`, distinct visual hierarchy, minimum 44×44px active touch target hit areas (`min-h-[44px] min-w-[44px]`), and high-contrast WCAG focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-400`).
- Preserved single-screen layout (`h-dvh` / `overflow-hidden`) across desktop and mobile responsive viewports without horizontal or vertical page scrolling.

## [v0.5.0] — 2026-08-13 — DPDP Act & Wildlife Protection Act SMS Compliance Hardening

### Added

- Added explicit `Reply STOP to opt out` opt-out message text in both English and Hindi versions inside the `SmsSimulator` template strings in alignment with India's Digital Personal Data Protection (DPDP) Act 2023.
- Enhanced SMS Simulator footer notice explicitly citing DPDP Act 2023 and Wildlife (Protection) Act 1972 compliance to highlight anti-poaching location privacy (omitting exact GPS coordinates from public community SMS alerts) and consent management.
- Added interactive **Ethics & Legal** modal (`EthicsModal.tsx`) and header navigation button in `App.tsx` allowing rangers, judges, and mentors to inspect live legal frameworks and responsible AI principles directly in the app UI.

## [v0.4.4] — 2026-08-13 — Guided Tour Close (X) Backdrop Fix

### Fixed

- Fixed grey backdrop overlay remaining stuck on screen when closing the tour via the "X" button. Configured `closeButtonAction: 'skip'` in Joyride options and added explicit `action === 'close' || action === 'skip' || action === 'stop'` handling in `handleJoyrideEvent` to invoke `onFinishTour()`, immediately unmounting Joyride and restoring full workspace visibility.

## [v0.4.3] — 2026-08-13 — Guided Tour Scrolling, Alignment & Interaction Fixes

### Fixed

- Prevented camera/page downward scrolling ("Camera moves downward" bug) by setting `skipScroll: true` on all tour steps, adhering strictly to the "One screen, no page scroll" architectural rule.
- Fixed step 4 Acknowledge button interaction ("text for number 4 doesn't work") by dispatching `RESET_EVENT_STATUS` when stepIndex is 3 to guarantee the Acknowledge button is enabled (`disabled={false}`) and interactive for the ranger.
- Eliminated tooltip card right-side clipping by setting `placement: 'left'` for right-sidebar targets and constraining tooltip width to 310px (`styles.tooltip.width = '310px'`), anchoring tooltips inside the map area pointing at sidebar buttons.

## [v0.4.2] — 2026-08-13 — Guided Tour Position & Target Sync Fixes

### Fixed

- Resolved step 2 map tooltip top boundary clipping issue by setting step placement to `'center'`, preventing Floater positioning fallback overflow above the browser viewport top.
- Fixed step 4 and subsequent step loading spinner and disappearing tour bug by implementing full UI state synchronization (`useEffect`) in `DemoTour`. Guaranteed that target DOM elements (`AlertList`, `AlertPanel`, `SmsSimulator`) are rendered before Joyride targets them when advancing via "Next" or "Back" buttons.
- Disabled Joyride loader fallback (`loaderComponent={null}`) and set `overlayClickAction: false` to avoid accidental tour cancellation and prevent hanging loading spinners during step transitions.

## [v0.4.1] — 2026-08-13 — Demo Mode Detection Logging & Expanded Species

### Added

- Enabled manual detection logging ("Log detection") directly in Demo Mode, allowing presenters and testers to log new wildlife detections live during demo scenarios.
- Expanded species support in risk engine and dropdown selector to include Snow Leopard (`snow_leopard`), Elephant, Tiger, Sloth Bear, Wolf, Gaur, Wild Boar, and custom user-specified species.
- Added `formatSpeciesName` utility function for consistent title-cased species display across alert lists, detail panels, map tooltips, and species filter dropdowns.
- Custom species entry support when "Other species (custom)..." is chosen in the detection form.

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
