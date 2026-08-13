# GAHM Ethics & Responsible AI

_Audience: judges, mentors, users, and anyone evaluating the project's
ethical design. This document is structured around ten ethical considerations
raised in project review; for each one it states GAHM's design response and how
it is implemented. The demo scenario is the **Aranya Corridor Reserve**
(Nilgiri-Karnataka elephant corridor, India)._

GAHM's founding position: the engine **recommends, the ranger decides**. Every
ethical control below follows from that — the system is a decision-support
tool with humans accountable at every step.

## 1. Privacy & data protection

**Design response: minimal personal data, no sensitive data in warnings.**

- **Data minimization** — the app stores only what the workflow needs: account
  credentials, alert metadata, decision logs. No photos, no biometrics, no
  location history of individuals.
- **Edge processing vision** — detection happens on cameras/sensors at the
  reserve boundary; raw footage is not transmitted. Face blurring is applied
  before any image leaves the edge.
- **No exact coordinates in SMS** — community warnings name the zone and
  direction, never precise wildlife locations (this also protects against
  poachers using the alert channel).
- **Access control** — role-based access (RBAC): each account only ever sees
  its own workspace; ranger actions are attributed and logged.
- **Encryption & retention** — data is encrypted in transit and at rest; alert
  data is retained only as long as needed for the decision record and is
  deletable.
- **Demo** — all demo data is synthetic and badged "Demo data" in-app; demo
  phone numbers are fictional.

**Indian law**: designed with the **Digital Personal Data Protection (DPDP)
Act, 2023** in mind — personal data is minimized, used only for the purpose
stated at collection (the sign-up screen shows a data privacy notice), and
consent is required before collection. Wildlife GPS telemetry (non-personal
data) sits outside DPDP scope, but GAHM treats it carefully anyway: exact
locations stay out of public-facing warnings.

## 2. Bias & fairness

**Design response: anti-economic bias is a hard rule.**

- **No prioritization by farm size or wealth** — the risk score uses species,
  movement, proximity, history, time, group size, and weather. It never
  considers how large or valuable a farm is. A smallholder's alert ranks
  exactly like a large farm's.
- **Fair coverage** — sensors and SMS delivery are tested for environmental
  and equipment fairness: coverage must not silently favor villages with
  better infrastructure.
- **Local calibration** — thresholds and species scores are configurable per
  reserve (`src/engine/config.ts` is the executable source of truth), so
  calibration can be tuned to local conflict patterns rather than assuming one
  global model fits all communities.

## 3. Accuracy & reliability

**Design response: honest about uncertainty, never confident when it isn't.**

- **Uncertainty penalty** — missing movement data **−8**, low detection
  confidence **−5**. The score drops and the alert panel explains why.
- **The "we don't know" path** — EVT-1045 in the demo shows a Medium alert with
  an explicit uncertainty warning instead of a confident (and possibly wrong)
  score.
- **Two numbers kept separate** — *detection confidence* (is the species
  identification correct?) and *conflict risk* (does the context demand
  attention?) are deliberately different, so neither is mistaken for the
  other.
- **Interpretable model** — a weighted, transparent scoring model is easier to
  validate and correct than a black box; every point in a score is shown as a
  contributing reason.

## 4. Human oversight

**Design response: no autonomy anywhere.**

- No autonomous dispatch of rangers, no automatic deterrents (no AI-fired
  crackers, no autonomous drones).
- Community SMS warnings require a **human ranger action** — the engine
  prepares, the ranger sends.
- The ranger owns the workflow: Acknowledge → Contact ranger unit → Prepare
  warning → record outcome. Each decision is attributed to an account.
- GAHM surfaces *suggested next actions*; they are suggestions, not orders.

## 5. Transparency & explainability

**Design response: the whole model is open and readable.**

- The risk score is built from seven weighted signals, and every alert lists
  each signal with its points (proximity +25, movement +20, species +15, …).
- The code is the source of truth: `src/engine/config.ts` and
  `src/engine/riskEngine.ts` contain the complete model, weights, and tables.
- Worked examples are published in `risk-algorithm.md` — anyone can reproduce
  EVT-1042's 87/100 by hand.
- No hidden scoring, no black-box API, no obfuscated weights.

## 6. Data ownership & consent

**Design response: communities own their data; opt-out is respected.**

- **DPDP consent** — personal data is collected only with informed consent and
  for a stated purpose; account holders can request deletion.
- **Community prior informed consent** — before any sensor is deployed near a
  village, the community is consulted and agrees (PIC is a requirement for
  deployment, not an afterthought).
- **SMS opt-out** — recipients can reply **STOP** at any time; the warning
  footer states this.
- **Demo honesty** — all synthetic data is badged "Demo data"; nothing real is
  implied.

## 7. Accessibility & inclusion

**Design response: the tool works on the least capable device in the village.**

- SMS warnings target **basic feature phones** — no app download, no internet
  required.
- Messages are short, jargon-free, and available in **Hindi and English**
  (local-language support is designed in; see `SmsSimulator.tsx`).
- Keyword replies (**SAFE**) work with any phone, and non-digital fallback
  protocols (ranger contact, village notice) remain the baseline.
- The dashboard is a single screen with no page scroll and low cognitive load
  — one alert, one decision, one action at a time.

## 8. Environmental impact

**Design response: deliberately low-footprint AI.**

- The risk engine is a **rule-based weighted model** — no GPU inference, no
  LLM, no training loops. Inference is a handful of arithmetic operations.
- The app is a static site under ~1 MB; hosting cost and energy are minimal.
- The design vision moves computation to the edge (cameras/sensors at the
  boundary), further shrinking the cloud footprint.
- The goal of the product itself — preventing conflict before it escalates —
  protects both livelihoods and biodiversity (SDG 15: Life on Land).

## 9. Over-reliance on AI (deskilling)

**Design response: decision-support, not replacement.**

- GAHM is explicitly positioned as an *intelligence layer* — it reduces alert
  fatigue so rangers can spend attention where it matters; it does not make
  ranger judgment obsolete.
- Every alert ends in a **ranger decision** and an **outcome recording** step,
  which preserves and strengthens field expertise through a feedback loop.
- Suggested actions are advisory; the ranger workflow (acknowledge, monitor,
  escalate, dismiss) is the human's, unchanged.

## 10. Accountability

**Design response: every decision is attributable and auditable.**

- Every event tracks ownership: who acknowledged it, who contacted the ranger
  unit, who sent the SMS, who recorded the outcome, and when.
- Response-time metrics (average response minutes from recorded outcomes) make
  accountability measurable, not aspirational.
- Role-based access governance ensures only authorized accounts can act on an
  event, and every action is logged.

## Legal compliance (India)

- **Digital Personal Data Protection (DPDP) Act, 2023** — personal data
  minimization, purpose limitation, informed consent, right to access and
  deletion, and a visible privacy notice at sign-up.
- **Wildlife (Protection) Act, 1972** — the design supports non-lethal
  mitigation only; elephants (Schedule I) and tigers receive the highest
  species-impact scores because their protection is both legally mandated and
  ecologically critical; coordinates are concealed from public-facing warnings
  to prevent poaching and retaliation.

## How to review this in the demo

1. **Sign-up screen** — read the data privacy notice shown during account
   creation.
2. **EVT-1042 (87/100 High)** — open it and read the point-by-point signal
   breakdown; reproduce it by hand with `risk-algorithm.md`.
3. **EVT-1045** — the uncertainty path: Medium with a visible "we don't know"
   warning instead of a confident score.
4. **SMS simulator** — compose in English and Hindi; note the no-coordinates
   rule and the STOP opt-out footer.
5. **Any event** — check that ownership, timestamps, and outcome recording
   make every action attributable.
