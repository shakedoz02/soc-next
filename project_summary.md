# SOC-NEXT Project Summary

## 1. Entities

---

### User / Profile

| Field | Type | Notes |
|---|---|---|
| id | string | Supabase auth user ID |
| email | string | User email address |
| name | string | Display name |
| level | number | Current rank level |
| xp | number | Total experience points |
| xpToNext | number | XP required for next level |
| rank | string | Rank title (e.g. "Analyst", "Senior Analyst") |
| sessionsCompleted | number | Count of completed investigations |
| accuracy | number (0–100) | Average accuracy percentage |

**DB table:** `profiles`  
**DB columns:** `id, email, name, level, xp, xp_to_next, rank, sessions_completed, accuracy`

---

### Scenario

| Field | Type | Notes |
|---|---|---|
| id | string | Unique identifier (e.g. 'sql-injection') |
| title | string | English title |
| titleHe | string | Hebrew title |
| description | string | Hebrew description |
| difficulty | string | CRITICAL / HIGH / MEDIUM / LOW |
| duration | string | Estimated time (e.g. "20-30 דקות") |
| xpReward | number | XP awarded on completion |
| icon | string | Material Symbol icon name |
| attackerIP | string | IP address to block (solution target) |
| logs | Log[] | Array of log events for the scenario |
| playbook | PlaybookStep[] | Array of investigation steps |
| solution.commands | string[] | Correct terminal commands |
| solution.keywords | string[] | IPs or identifiers to match |

**Source:** `src/data/scenarios.js` (in-memory, not in DB)

---

### Log

| Field | Type | Notes |
|---|---|---|
| id | number | Unique within scenario |
| timestamp | string (ISO 8601) | Event timestamp |
| source | string | System name (e.g. 'Web-Server-01') |
| level | string | CRITICAL / ERROR / WARN / INFO |
| message | string | Log message text |

**Source:** Embedded inside each Scenario object.

---

### PlaybookStep

| Field | Type | Notes |
|---|---|---|
| step | number | Step number (1-based) |
| title | string | Step title (Hebrew) |
| description | string | Detailed instructions (Hebrew) |

**Source:** Embedded inside each Scenario object.

---

### Alert

| Field | Type | Notes |
|---|---|---|
| id | string | Alert identifier (e.g. 'ALT-001') |
| severity | string | CRITICAL / HIGH / MEDIUM / LOW |
| title | string | Alert title |
| cve | string | CVE or issue identifier |
| source | string | Source system name |
| timestamp | string | Display timestamp |
| scenarioId | string | References Scenario.id |

**Source:** `src/data/scenarios.js` (in-memory, not in DB)

---

### Investigation

| Field | Type | Notes |
|---|---|---|
| id | string | Record ID |
| user_id | string | FK → profiles.id |
| scenario_id | string | References scenario identifier |
| scenario_title | string | Denormalized scenario title |
| score | number | Final score (0–100) |
| xp_earned | number | XP awarded |
| elapsed_seconds | number | Investigation duration |
| mistakes | number | Error count |
| completed_at | string (ISO timestamp) | Completion time |
| commands | string (JSON) | Array of executed commands |

**DB table:** `investigations`

---

### Terminal History Line (in-memory only)

| Field | Type | Notes |
|---|---|---|
| type | string | 'system' / 'prompt' / 'input' / 'output' / 'success' / 'error' |
| text | string | Line content |

---

## 2. Entity Relationships

```
User (profiles)
└── has many → Investigation (user_id FK)
                └── references → Scenario (scenario_id, denormalized title)

Scenario
├── has many → Log         (embedded array, in-memory)
├── has many → PlaybookStep (embedded array, in-memory)
└── has one  → solution    (embedded object: commands[], keywords[])

Alert
└── references → Scenario (scenarioId → Scenario.id)
```

---

## 3. Mock / Hardcoded Data

### SCENARIOS array (`src/data/scenarios.js`)

| ID | Difficulty | Attacker IP | Solution Commands |
|---|---|---|---|
| sql-injection | CRITICAL | 192.168.1.105 | `block 192.168.1.105` |
| brute-force | HIGH | 10.0.0.47 | `block 10.0.0.47`, `kill-session 10.0.0.47` |
| ransomware | CRITICAL | 172.16.0.88 | `isolate-host 172.16.0.88`, `fw-block 172.16.0.88` |
| port-scan | LOW | 192.168.10.55 | `fw-block 192.168.10.55` |

Each scenario has 4–8 log entries and 4 playbook steps.

### ALERTS array (`src/data/scenarios.js`)

| ID | Severity | Title | Linked Scenario |
|---|---|---|---|
| ALT-001 | CRITICAL | SQL Injection | sql-injection |
| ALT-002 | HIGH | Brute Force | brute-force |
| ALT-003 | LOW | Port Scan | port-scan |
| ALT-004 | CRITICAL | Ransomware | ransomware |

### STATS (LandingPage.jsx)

Hardcoded marketing numbers: 1,200+ analysts, 50k+ logs, 150+ scenarios, 98% success rate.

### NAV items (Sidebar.jsx)

Routes: `/lobby`, `/alerts`, `/profile`

### QUICK_CMDS (TerminalPanel.jsx)

Quick-access buttons: `help`, `whois <IP>`, `fw-block <IP>`, `close-ticket`

### HELP_LINES (useTerminal.js)

Command reference output for the `help` command listing all available terminal commands.

---

## 4. Pages

### LandingPage (`src/pages/LandingPage.jsx`)
- **Visible to:** Unauthenticated users (redirects authenticated users to `/lobby`)
- **Displays:** Hero section, feature bento cards, hardcoded stats, terminal animation preview, CTA links to `/auth` and `/lobby`

### AuthPage (`src/pages/AuthPage.jsx`)
- **Visible to:** Unauthenticated users (redirects authenticated to `/lobby`)
- **Displays:** Tabbed login/register form; email confirmation screen after signup
- **Forms:** Login (email, password) | Register (name, email, password)

### LobbyPage (`src/pages/LobbyPage.jsx`)
- **Visible to:** Authenticated users
- **Displays:** User greeting, 4 stat cards (XP, Level, Accuracy, Sessions), XP progress bar, grid of 4 scenario cards with difficulty, description, XP reward, duration
- **Action:** "התחל חקירה" navigates to `/investigate/:scenarioId`

### AlertQueuePage (`src/pages/AlertQueuePage.jsx`)
- **Visible to:** Authenticated users
- **Displays:** 3 stat cards (Critical count, MTTR, System Health), filterable alert table (by severity)
- **Each row:** Severity icon, title, CVE, source, timestamp, status badge, investigate button

### InvestigationLabPage (`src/pages/InvestigationLabPage.jsx`)
- **Visible to:** Authenticated users
- **Displays:** Scenario title, live timer, score, mistake count; SiemLogsViewer (top), TerminalPanel (bottom), PlaybookPanel (right sidebar)

### SummaryPage (`src/pages/SummaryPage.jsx`)
- **Visible to:** Authenticated users (receives state from previous page)
- **Displays:** Circular score, XP earned, time taken, accuracy, activity chart, document action cards, Download PDF button
- **Data source:** React Router location state (`score`, `xpEarned`, `elapsed`, `mistakes`, `commands`)

### ProfilePage (`src/pages/ProfilePage.jsx`)
- **Visible to:** Authenticated users
- **Displays:** Profile card (avatar, name, email, rank, XP bar, stats), sign-out button, premium tier card, last 20 investigations table, 6 achievements grid

---

## 5. Main Components

| Component | File | Purpose |
|---|---|---|
| AppShell | `src/components/AppShell.jsx` | Protected route wrapper; renders Sidebar + TopBar + Outlet |
| TopBar | `src/components/TopBar.jsx` | Header with logo, nav links, XP bar, user avatar, logout |
| Sidebar | `src/components/Sidebar.jsx` | Fixed right-side nav; user badge, XP bar, nav items, New Investigation button |
| SidebarItem | `src/components/SidebarItem.jsx` | Reusable nav item (icon + label + active highlight) |
| AlertRow | `src/components/AlertRow.jsx` | Single alert table row with severity, title, CVE, source, timestamp, investigate button |
| Toast / Toaster | `src/components/Toast.jsx` | Global notification system (success / error / info); event-bus pattern, auto-dismiss 4s |
| ErrorBoundary | `src/components/ErrorBoundary.jsx` | Catches React errors; shows fallback UI with reload button |
| SiemLogsViewer | `src/components/investigation/SiemLogsViewer.jsx` | Log table inside investigation; click row to select |
| TerminalPanel | `src/components/investigation/TerminalPanel.jsx` | Command-line interface; history display, input, quick-command buttons |
| PlaybookPanel | `src/components/investigation/PlaybookPanel.jsx` | Investigation checklist; step completion state, current hint, close-ticket button |

---

## 6. Hooks & Context

### AuthContext (`src/contexts/AuthContext.jsx`)
Manages global auth state. Provides:
- `user` — current User object or null
- `loading` — auth initialization flag
- `signIn(email, password)`
- `signUp(email, password, name)`
- `signOut()`
- `saveInvestigation({ scenarioId, scenarioTitle, score, xpEarned, elapsed, mistakes, commands })` — calls Supabase RPC

### useInvestigationTimer (`src/hooks/useInvestigationTimer.js`)
- Returns: `elapsed` (seconds), `elapsedRef`, `stop()`, `formatTime()`
- Increments every second while `active === true`

### useTerminal (`src/hooks/useTerminal.js`)
- Returns: `history`, `input`, `setInput`, `handleCommand`, `completedSteps`, `score`, `mistakes`, `finished`, `finalState`
- Validates commands against scenario solution; tracks score and mistakes

**Scoring logic:**
- Correct solution command with correct IP: step completed, no penalty
- Correct command, wrong IP: −15 score, +1 mistake
- Missing argument: −5 score, +1 mistake
- Unknown command: −5 score, +1 mistake
- `close-ticket` before completion: −10 score
- Final score = running score − (mistakes × 5), clamped 0–100

---

## 7. Supabase Schema

### Table: `profiles`
```sql
id              text PRIMARY KEY  -- Supabase auth user ID
email           text
name            text
level           integer
xp              integer
xp_to_next      integer
rank            text
sessions_completed integer
accuracy        numeric
```

### Table: `investigations`
```sql
id              uuid PRIMARY KEY
user_id         text REFERENCES profiles(id)
scenario_id     text
scenario_title  text
score           integer
xp_earned       integer
elapsed_seconds integer
mistakes        integer
completed_at    timestamptz
commands        jsonb
```

### RPC: `add_xp_and_save_investigation`
Parameters: `p_user_id, p_xp_to_add, p_scenario_id, p_scenario_title, p_score, p_elapsed, p_mistakes, p_commands`  
Returns: updated user stats object `{ xp, level, xp_to_next, rank, sessions_completed, accuracy }`

---

## 8. Routing

| Path | Page | Auth Required |
|---|---|---|
| `/` | LandingPage | No |
| `/auth` | AuthPage | No |
| `/lobby` | LobbyPage | Yes |
| `/alerts` | AlertQueuePage | Yes |
| `/investigate/:scenarioId` | InvestigationLabPage | Yes |
| `/summary/:scenarioId` | SummaryPage | Yes |
| `/profile` | ProfilePage | Yes |
| `*` | Redirect to `/` | — |

Protected routes are wrapped in `AppShell`, which redirects to `/auth` if no authenticated user is found.

---

## 9. Key Libraries

| Library | Purpose |
|---|---|
| React Router v6 | Routing with lazy-loaded pages |
| Supabase JS | Auth, database queries, RPC calls |
| jsPDF | PDF report generation on SummaryPage |
| Tailwind CSS | Utility-first styling |
| Material Symbols | Icon font |
