# Project Name: SOC-Next
## AI Agent Development Instructions

### 1. Project Overview
[cite_start]You are tasked with building a Full-Stack React web application called "SOC-Next"[cite: 5]. 
[cite_start]**The Problem:** Cyber security students and juniors struggle to gain practical experience in analyzing live logs and alerts, which is a major barrier to landing their first SOC (Security Operations Center) roles[cite: 5, 118].
[cite_start]**The Solution:** An interactive simulator that mimics a SOC shift with various attack scenarios[cite: 5, 118]. [cite_start]It allows users to practice log analysis and decision-making based on guided Playbooks[cite: 118]. 
[cite_start]**Key Differentiator:** The system interface and Playbooks are in Hebrew to lower the cognitive load, while the raw logs and terminal commands remain in English to maintain realism[cite: 141, 142].

### 2. Tech Stack
[cite_start]Strictly adhere to the following stack[cite: 11]:
* [cite_start]**Frontend:** React + Vite[cite: 11].
* [cite_start]**Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)[cite: 11].
* [cite_start]**Deployment:** Vercel (Frontend) + Supabase Cloud (Backend)[cite: 11].
* [cite_start]**Styling:** Tailwind CSS (Implement a professional "Dark Mode" SOC design)[cite: 161].
* [cite_start]**External Libraries:** `jspdf` or `react-pdf` for Shift Report generation, `Stripe` for future payments (Freemium/B2B model)[cite: 22].

### 3. Application Architecture & Data Flow
* **Scenario Selection:** User selects an attack scenario (e.g., SQL Injection). [cite_start]The Frontend sends a GET request to Supabase to fetch logs, playbooks, and solutions[cite: 19].
* **Terminal Validation:** User types a mitigation command (e.g., `fw-block 10.0.0.5`). The Frontend sends a POST request. [cite_start]The Backend validates if the IP belongs to the attacker and updates the user's XP[cite: 19].
* **Event Closure:** User clicks "End Investigation". [cite_start]The backend calculates the final score (accuracy minus mistakes) and closes the ticket[cite: 19].
* [cite_start]**PDF Generation:** The server gathers all actions from the DB and generates a styled PDF report for download[cite: 19].

### 4. Site Map & Routing (Navigation Flow)
[cite_start]Implement the following 7 core screens based on the defined user access levels[cite: 78]:

1.  [cite_start]**Landing Page (Public):** Explains the value of SOC-Next, shows a sample PDF report, and includes a "Get Started" CTA[cite: 78, 94].
2.  [cite_start]**Auth Page (Public):** Login/Register view using Supabase Auth (Tabs for sign-in/sign-up and a "Forgot Password" link)[cite: 78, 94].
3.  [cite_start]**The Lobby / Home (Logged In):** Displays user's current XP/Level and a menu of attack scenarios (e.g., Brute Force, SQLi) to choose from[cite: 78].
4.  [cite_start]**Alert Queue (Logged In):** A table displaying live security events waiting to be handled, with filters for severity (High/Med/Low)[cite: 78, 103].
5.  **Investigation Lab (Logged In):** The core screen. Must include:
    * [cite_start]**Log Viewer:** Displays raw JSON logs in a readable format[cite: 97, 161].
    * [cite_start]**Playbook Panel:** Step-by-step instructions in Hebrew[cite: 97, 161].
    * [cite_start]**Terminal:** An interactive black-box component for executing commands (e.g., blocking IPs)[cite: 97, 161].
    * [cite_start]**Timer/Score Tracker:** Real-time feedback UI[cite: 97].
6.  [cite_start]**Summary & Report (Logged In):** Shows performance metrics (Score, XP earned, Time, Accuracy) and features a prominent button to download the "Shift Report" as a PDF[cite: 78, 100].
7.  [cite_start]**Profile & Settings (Logged In):** User details, task history, and subscription management via Stripe[cite: 78].

### 5. Feature Prioritization (MoSCoW)
Focus purely on the "Must" and "Should" features for Version 1.
* [cite_start]**Must Include:** Alert List, Log Viewer, Hebrew Playbooks, Interactive Terminal, Basic success/failure feedback[cite: 5, 161].
* [cite_start]**Should Include:** PDF Report generation, Gamification (XP & Levels), Dark Mode UI, 3-5 different attack scenarios[cite: 161].
* [cite_start]**Do NOT Include Yet:** Live log integration from real systems, user chat, complex email verification[cite: 161].

### 6. Step-by-Step Execution Plan for AI
1.  **Initialize Project:** Scaffold a Vite+React app. Install Tailwind CSS, React Router, and Supabase client.
2.  [cite_start]**Database Setup:** Provide SQL scripts to create Supabase tables: `users`, `scenarios` (containing logs and playbook text), and `scores` (tracking XP)[cite: 27].
3.  **Auth Implementation:** Build Screen 1 (Landing) and Screen 2 (Auth) utilizing Supabase authentication.
4.  **Routing & Layout:** Set up protected routes for the authenticated screens (Screens 3-7). Create a consistent dark-mode navigation shell.
5.  **Core Feature (Investigation Lab):** Build the Log Viewer component, the Hebrew Playbook sidebar, and the Terminal component. Ensure state management tracks the user's terminal inputs against the expected scenario solution.
6.  [cite_start]**Gamification & Reporting:** Implement the XP calculation logic[cite: 19]. [cite_start]Build Screen 6 (Summary) and integrate `jspdf` to export the user's actions into a formatted PDF[cite: 19, 22].