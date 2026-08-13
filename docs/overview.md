# GAHM in Plain Language

_Audience: users, judges, mentors, and anyone new to the project — no code
required._

## The problem

Across many protected landscapes, a single ranger may be responsible for roughly
**72 km²**. Wildlife monitoring systems report every detection as if it were
equally urgent, so rangers drown in raw alerts. The real challenge is not
detecting wildlife — it is recognizing when ordinary movement is becoming a
dangerous human–wildlife conflict before crops are destroyed, communities are
put at risk, or animals face retaliation.

## What GAHM is

**GAHM** (**Global Actions on Habitats and Marines**) is an **intelligence layer** that sits above existing detection feeds
(cameras, acoustic sensors, ranger reports). It is not another animal-detection
model. Its differentiating question:

> Not only *what* was detected — but **does it matter right now?**

The product is a **risk-prioritization workflow**: the system estimates the
likelihood of conflict from weak, scattered signals and surfaces only the events
that need a ranger's attention.

## How the workflow works

1. **A detection arrives** — species, confidence, group size, location, time.
2. **Context is added** — distance to farms, direction of movement, time of day,
   weather, historical conflict hotspots.
3. **The risk engine scores it** — a transparent 0–100 score with every
   contributing signal explained (+25 proximity, +20 movement, and so on).
4. **A ranger reviews it** — GAHM recommends; the ranger decides. No autonomous
   responses.
5. **A community warning is sent** — a short, clear SMS to the affected area
   (simulated in this demo).
6. **The outcome is recorded** — was it a real conflict? Was it prevented? This
   closes the learning loop.

## Reading the risk score

| Score | Level | What happens |
| --- | --- | --- |
| 0–39 | Low (green) | Logged quietly — no interruption |
| 40–69 | Medium (amber) | Displayed for monitoring |
| 70–100 | High (red) | Full explainable alert for ranger review |

Two numbers in the alert panel are deliberately different: **detection
confidence** (how sure the sensor is that it saw a species) and **conflict risk**
(how much the context demands attention). They are not the same thing.

## What is real and what is a demo

- **The geography is real**: the villages (Beechanahalli, Hangala, Masinagudi)
  are actual settlements in the Bandipur–Nagarhole–Mudumalai elephant corridor
  in southern India; the reserve boundary is a simplified stand-in for that
  corridor.
- **All events are synthetic**, created for the demo and badged "Demo data" in
  the app. There are no real sensors, no real wildlife detections, and no real
  phone numbers.
- **The SMS warning is simulated** on screen — no messages are actually sent.
- **Accounts are real when configured**: with Supabase keys set, sign-up and
  sign-in work against a live backend and each account's data is kept private.
  Without keys, the app runs in offline demo mode.

## Why it is responsible AI

- **Human oversight everywhere** — no autonomous ranger deployment, no automatic
  deterrents, full audit trail of decisions.
- **Honest uncertainty** — when movement data is missing, the engine says so and
  lowers the score, rather than pretending everything is known.
- **Community safety and privacy** — warnings never expose exact wildlife
  coordinates, are written for basic phones and local languages (English +
  Hindi), and include opt-out; alerts are never prioritized by farm size or
  economic value.
- **Indian legal compliance** — designed with the Digital Personal Data
  Protection (DPDP) Act, 2023 and the Wildlife (Protection) Act, 1972 in mind:
  consent, data minimization, and non-lethal, protection-first design.

The full ethics position — ten considerations from project review, each with
GAHM's design response — is in [`ethics.md`](ethics.md).

## The key demo moment

Several elephant detections arrive the same day. Two are deep inside the reserve
— the engine logs them quietly as green. One is near the northern boundary at
dusk, moving toward farmland, in an area with a history of conflict — the engine
turns it red (**87/100, High**) and explains every contributing factor. Same
species, same day. **Context changes everything** — that contrast is the whole
product in one minute.

