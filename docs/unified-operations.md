# Unified Reserve Operations & Collaboration

_Audience: developers and operators. This document explains the multi-ranger coordination architecture, real-time event synchronization, on-duty sector roster, in-app notification feed, and community alert subscriptions in WildSense._

## Overview

WildSense is designed for multi-ranger protected reserves where multiple field officers and station operators coordinate in real time across different geographic sectors (e.g. Kabini, Bandipur, Mudumalai).

Rather than siloing rangers into isolated views, WildSense provides a **Unified Corridor Operations** layer:
- **Shared Reserve Map**: All rangers in a reserve share the active detection feed, allowing real-time situational awareness across sectors.
- **On-Duty Sector Roster**: A live team board showing active rangers, their assigned sectors, and their latest logged actions.
- **Live Response Audit Trail**: Every incident stores an append-only timeline of ranger actions (acknowledgments, patrol dispatches, SMS warnings, notes, outcomes) with full accountability.
- **In-App Notification Feed**: Instant alerts when a fellow ranger dispatches a patrol, claims an alert, or issues a community warning.
- **DPDP §6 Compliant Community Subscription**: Verified village residents can register for localized SMS warnings with explicit consent and coordinate-scrubbing protections.

---

## Real-Time Synchronization Architecture

### 1. Supabase Realtime (Live Mode)

When configured with Supabase keys, WildSense leverages Postgres Realtime replication on the `events` table:
- Changes committed by any ranger (`INSERT`, `UPDATE`) are broadcast to all connected clients over WebSockets.
- Remote events update the local React store smoothly without page refreshes.
- If another ranger acknowledges an incident or updates its status, a notification is added to the in-app notification bell.

### 2. Multi-Ranger Demo Synchronization (BroadcastChannel)

In demo mode (or during live presentations), WildSense utilizes the standard browser `BroadcastChannel` API (`wildsense-demo-sync`):
- Clicking **Open team view** in the header launches a secondary teammate window (`/?teammate`) set to a fellow ranger persona (e.g. `K. Rao (Masinagudi)`).
- Actions taken in either window (acknowledging alerts, dispatching patrols, sending community warnings) broadcast immediately across open browser tabs/windows.
- The main station window receives the action, updates its local store, appends to the incident audit trail, and creates an instant notification badge.

---

## Data Model & Tables

### 1. `profiles` Table
Stores authenticated ranger identity and status:
- `user_id` (UUID, primary key, references `auth.users`)
- `name` (text, ranger callsign or full name)
- `sector` (text, e.g. `Kabini`, `Bandipur`, `Mudumalai`)
- `on_duty_since` (timestamptz)
- `last_active_at` (timestamptz)
- `last_action` (text, e.g. `Dispatched patrol unit to Moyar Valley`)

### 2. `subscribers` Table
Manages community alert recipients with strict data privacy:
- `id` (UUID, primary key)
- `name` (text, recipient name)
- `phone` (text, contact number)
- `community` (text, settlement name)
- `consent_given` (boolean, check constraint `consent_given = true`)
- `consent_given_at` (timestamptz)
- `opted_out` (boolean, default false)

### 3. `corridor_activity` View
A sanitized public summary view used by the public landing page to show aggregate conflict status without disclosing sensitive animal coordinates.

---

## Statutory Compliance

- **DPDP Act, 2023 (§6)**: Notice and consent are strictly enforced prior to collecting villager contact numbers for SMS warnings.
- **Wildlife Protection Act, 1972 (§9 & Schedule I)**: Exact GPS coordinates of endangered species are scrubbed from community warnings and public feeds to prevent poaching risks.
