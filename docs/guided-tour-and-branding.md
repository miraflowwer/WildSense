# Guided Tour Fixes & WICRE Naming (v1.2.0)

_Audience: developers. This is the versioned record of the two v1.2.0 changes:
why the guided tour could stall on real user clicks, how it was fixed and
verified headlessly, and how the product/org naming is split across the UI._

## 1. The guided tour could not be completed with real clicks

The interactive Joyride tour (12 steps, `src/components/DemoTour.tsx`) worked
when driven by programmatic `.click()` calls but stalled for real users. A
headless-Chrome CDP investigation (real `Input.dispatchMouseEvent` clicks +
`document.elementFromPoint` probes) found five contributing causes:

1. **Spotlight overlay intercepts clicks inside its hole.** Joyride v3 renders
   the spotlight as one full-screen SVG `<path>` with an evenodd cutout. The
   path carries an inline `style="pointer-events: auto"`, so real clicks aimed
   at the highlighted target hit the path instead. (Companion quirk: Chromium's
   `document.elementFromPoint` ignores `pointer-events: none` on SVG paths, so
   verification must use real clicks, not `elementFromPoint` probes.)
2. **The lockdown allow-rule was too broad.** `#react-joyride-portal,
   #react-joyride-portal * { pointer-events: auto !important }` (specificity
   1,0,0) matched the spotlight path too (it lives inside the portal), and beat
   the spotlight fix `.react-joyride__overlay .react-joyride__spotlight path`
   (0,2,1) — both `!important`, higher specificity wins → the hole stayed
   clickable-blocked.
3. **Step 8's OutcomeForm was outside the lockdown exemption.** The form opens
   only *after* the user clicks "Close & record outcome", i.e. after the
   step-8 active-target marking already ran — so its inputs/buttons stayed
   `pointer-events: none` and the outcome could not be saved (tour stall).
4. **SMS rule too strict.** Step 7→8 required the SMS modal to be closed *and*
   the warning sent; the simulator doesn't close on send.
5. **Demo re-runs with dirty state.** If EVT-1042 was already resolved in a
   previous run, the default `awaiting_review` filter hid it and the tour
   stalled looking for a missing target.

### Fixes

- `src/index.css` — scoped the portal allow-rule to the tooltip only
  (`#react-joyride-portal .react-joyride__tooltip, ... .react-joyride__tooltip
  *`), and neutralized the whole overlay
  (`.react-joyride__overlay, .react-joyride__overlay * { pointer-events: none
  !important }`). Safe because `overlayClickAction: false` — overlay clicks do
  nothing anyway.
- `src/components/OutcomeForm.tsx` — on mount, if `body.tour-active` is set,
  the form self-registers `data-tour-active` (removed on unmount), so the
  step-8 lockdown exemption follows the form wherever it opens.
- `src/components/DemoTour.tsx` — step 7→8 now fires on `state.sms.sentAt !=
  null` alone; step 8 tooltip copy says the SMS simulator closes automatically;
  `EXTRA_ACTIVE_TARGETS` (step 8 → `[data-tour="outcome-form"]`) keeps the
  form interactive alongside the spotlighted Close & record button.
- `src/components/App.tsx` — demo-mode tour start dispatches `RESET_DEMO`, so
  every demo re-run starts from pristine state (logged-in users keep
  `START_TUTORIAL`).
- `src/index.css` — the active-target allow-rule keeps its higher-specificity
  `body.tour-active [data-tour-active]` prefix (0,2,2 beats the lockdown's
  `body.tour-active button` at 0,1,2).

### Back button bounced forward — fixed 2026-08-14

Clicking Back decremented `stepIndex` correctly, but the state machine's
forward rules re-fired in the same commit — the triggering state (acknowledged,
ranger contacted, SMS open/sent, outcome recorded, EVT-1045 selected) was still
set, so the tour immediately bounced forward again (steps 3, 6–11 appeared to
ignore Back entirely).

Fix (`src/components/DemoTour.tsx`, `src/store/store.tsx`,
`src/types.ts`):

- **One-run machine suppression** — `skipNextMachineRun` ref: the `prev`
  handler sets it, and the next state-machine run (after the `runTour`/events
  guard) consumes and skips itself. That single run is the one where the
  stale trigger state would bounce the tour.
- **Per-step reverse resets on re-entry** — the workspace-sync effect now
  unwinds whatever the step's own forward rule depends on, so re-doing the
  action advances again: re-entering step 6 clears `rangerContactedAt` (new
  `CLEAR_RANGER_CONTACT` store action, local-only — no persist case, mirroring
  `RESET_EVENT_STATUS`), re-entering step 9 resets EVT-1042's status to
  `under_review` after a recorded outcome, re-entering step 8 re-opens the SMS
  modal fresh (`OPEN_SMS` resets `sentAt`), and the alert selection is cleared
  on the alert-click steps (already present).

Verified headless with real clicks (probe10): Back at every action step stays
put, the target re-highlights correctly, and repeating the step's action
advances forward — 45/45 checks, tour finishes and unlocks the UI.

### Verification

`npm run verify` is green (oxlint + `tsc -b` + `vite build`). The full 12-step
tour was then driven **with real CDP mouse clicks only** (no programmatic
`.click()`): tooltip Next on informational steps, real clicks on EVT-1042,
Acknowledge, Contact ranger, Prepare SMS, Send warning (modal auto-closes),
Close & record outcome, type `12` into the response-minutes field, Save, then
EVT-1045, Next, Finish — every step advanced and `body.tour-active` was
removed at the end. Repro scripts live in
`C:\Users\miraf\AppData\Local\Temp\opencode\tour-probe*.mjs`.

## 2. WICRE vs GAHM naming

**WICRE** (Wildlife Conflict Risk Engine) is the product; **GAHM** (Global
Actions on Habitats and Marines) is the team/org. v1.2.0 sweeps the UI so the
product is called WICRE and GAHM appears only as the builder:

- Header, auth cards, boot splash, landing page (hero, ethics, footer),
  FeatureCarousel, and all four SMS warning templates say WICRE (product) or
  "WICRE … · by GAHM" (attribution).
- GAHM intentionally remains in: org-policy copy (`auth.privacySignup` —
  "GAHM ethics and data policy"), internal console prefixes
  (`[GAHM Store]`, `[GAHM API Error]`), and the demo credential
  (`DEMO_PASSWORD`).
- i18n: key names (`app.brandTagline`, `app.aboutGahm`, `app.boot`) are
  unchanged — only values changed, in all three catalogs (`catalog-en.ts`,
  `catalog-kn.ts`, `catalog-ta.ts`). `riskExplain.overview` /
  `riskExplain.uncertaintyBody` explain the engine, so they say WICRE too.
- Version bump 1.1.1 → **1.2.0** (`package.json`; the landing footer already
  reads "Version 1.2.0").