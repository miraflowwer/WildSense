# GAHM User Guide (for rangers)

_Audience: the people operating the dashboard day to day. No technical
background needed — every button in this guide is named exactly as it appears
in the app._

GAHM is a risk-prioritization tool: it watches wildlife detections, scores how
much each one deserves your attention, and explains why. **You stay in charge —
GAHM recommends, you decide.**

## Signing in

- **No account yet?** Choose **Sign up**, enter your name, email, and a
  password of at least 8 characters (confirm it), then **Create account**. One
  account = one private workspace: each account only ever sees its own data.
  The sign-up screen shows a brief data privacy notice — your data is stored
  securely, used only for this application, and covered by the GAHM ethics and
  data policy (see [`ethics.md`](ethics.md)).
- **Already have an account?** **Sign in** with your email and password. Tick
  **Stay signed in** to stay logged in on this device for up to 30 days; leave
  it unticked and your session ends when you close the browser tab.
- **Forgot your password?** **Forgot password?** → enter your email →
  **Send reset link** → follow the link in your inbox to set a new password.
- **Just exploring?** Use the **Try the demo** card to enter the scripted demo
  scenario instantly with the shared demo account — no sign-up needed.

## The dashboard at a glance

- **Header**: GAHM brand, your name (or a "Demo data" badge in demo mode), the
  last sync time, and the actions **Reset demo**, **Log detection** (account
  mode only), and **Sign out**.
- **Operations bar** — five quick numbers:
  - **Active high-risk incidents** — red when there is one;
  - **Unreviewed alerts** — amber when there are any;
  - **Avg response time** — from recorded outcomes;
  - **Sensors online** (e.g. 5 / 6);
  - **Communities affected**.
- **Map**: reserve boundary, farm zones, communities, sensors, and detection
  markers with movement trails. (The map needs internet for the tiles.)
- **Filters** — narrow the list by **Species, Risk, Status, Community, or
  Zone**. The list defaults to "Awaiting review" so it always starts with what
  needs you, not everything.
- **Alert list** — sorted by risk score, highest first. Click an alert to open
  it.

## Reading an alert

- **Status pill** — where the event is in the workflow (see the status table
  below) and the event ID.
- **Species, time, zone, group size.**
- **Two numbers that are deliberately different**:
  - **Detection confidence** (%) — how sure the sensor is that it identified
    the species correctly;
  - **Conflict risk** (/100 with a level) — how much the *context* says this
    needs attention. A confident detection can be low risk, and vice versa.
- **Contributing signals** — the score explained line by line (green `+` for
  factors that raise it, red `−` for adjustments): proximity to farms, movement
  toward the boundary, species impact, conflict history, time window, group
  size, weather.
- **Context details** — distance from the community, movement (toward / away,
  with speed when available), past incidents, weather.
- **Uncertainty warning** — an amber-striped box appears when data is missing
  or low-confidence (e.g. no recent movement data). When it appears, the score
  is less certain: review manually. GAHM never pretends missing data is known.
- **Suggested next action** — the engine's recommendation. It is a
  suggestion, not an order.

## Taking action on an alert

| Button | What it does |
| --- | --- |
| **Acknowledge** | Claims the event — status → **Under review**, you become the owner, response time starts tracking. |
| **Monitor** | Marks the event for observation — status → **Monitoring**. |
| **Contact ranger unit** | Logs that a unit was dispatched (available from Medium risk up). |
| **Escalate** | Flags it up the chain — status → **Escalated**. |
| **Prepare community warning** | Opens the SMS warning simulator (available from Medium risk up). |
| **Mark as false / low concern** | Adds an optional note and dismisses the event — status → **Dismissed**. |
| **Close & record outcome** | Opens the outcome form; save it to resolve the event. |

Which buttons are enabled depends on the current status — the app guides you
one step at a time.

## Community warning (simulated SMS)

1. **Prepare community warning** from the alert.
2. Choose **English** or **Hindi (हिन्दी)** — the composed message updates live.
   It names the zone, tells people to secure livestock, says rangers were
   notified, and asks for a **SAFE** reply.
3. Review the recipient list (demo numbers in this prototype).
4. **Send warning** — you'll see delivered / delivery-failed counts and the
   send time.
5. **Replies** — community members reply **SAFE** (or anything else); replies
   appear in the panel.
6. When the risk has cleared, **Send all-clear**.

Two privacy rules are always on: exact wildlife coordinates are never shared
with recipients, and anyone can opt out by replying **STOP**.

## Recording the outcome

**Close & record outcome** → **Record outcome** form:

- **Confirmed wildlife presence** (checkbox);
- **Conflict**: Prevented or Occurred;
- **Action taken**: None / Ranger patrol / SMS warning / Both / Escalated;
- **Alert feedback**: Valid alert or False alert;
- **Response minutes** (required — feeds the average response time);
- **Notes** (optional, for the team).

**Save outcome** resolves the incident and closes the loop — your feedback is
what teaches the system.

## Statuses at a glance

| Status | Meaning |
| --- | --- |
| Awaiting review | New — needs you. |
| Under review | You claimed it; response time is tracking. |
| Monitoring | Being watched; no urgent action. |
| Escalated | Flagged to a higher level. |
| Dismissed | Marked false / low concern. |
| Resolved | Closed with a recorded outcome. |

## Logging a new detection (your account only)

**Log detection** in the header opens the manual entry form with a **live risk
score** as you fill it in, and a map picker for the location. Saving adds the
event to the top of your list. (The demo mode replays the scripted scenario and
doesn't offer this button.)

## If something looks off

- **"Server unreachable — demo mode"** banner: no backend configured/available;
  the demo scenario still works fully offline.
- **"Changes not saved — server unreachable"** banner: writes are failing; your
  actions won't persist until connectivity returns.
- **Map stays blank**: OpenStreetMap tiles need internet — everything else
  keeps working.
- **"Signed out"** notice: your session ended (or your account was removed);
  sign in again to continue.
