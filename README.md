# SOC-Next | סימולטור מרכז פעולות אבטחה

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://soc-next-sigma.vercel.app/)

🔗 **Live Demo:** https://soc-next-sigma.vercel.app/
🔗 **github link:** https://github.com/shakedoz02/soc-next.git


## Overview

SOC-Next is a gamified Security Operations Center (SOC) simulator that trains users to detect, investigate, and respond to real-world cyber threats through hands-on interactive scenarios — all in the browser, with zero setup required.

---

## Problem Statement

Cybersecurity students and junior SOC analysts lack accessible, realistic training environments. Enterprise tools like Splunk or IBM QRadar are expensive and complex to configure. Passive learning methods (PDFs, lectures, videos) don't build the real muscle memory needed for live incident response. SOC-Next bridges that gap with a free, gamified, browser-based simulator.

---

## Target Audience

- Cybersecurity students learning SOC workflows for the first time
- Junior analysts preparing for their first SOC role
- Organizations that want to run team training on incident response without risking production systems

---

## Competitors & Differentiation

| Competitor | Their Approach | Our Advantage |
|------------|---------------|---------------|
| Splunk (free tier) | Real SIEM, complex setup | Zero setup, browser-based, beginner-friendly |
| IBM QRadar | Enterprise-only, expensive | Free and accessible |
| TryHackMe / HackTheBox | CTF-style hacking labs | Focused specifically on SOC/IR analyst workflows |
| PDF training / lectures | Passive learning | Hands-on, scored, with XP and achievements |
| Manual tabletop exercises | Requires a team/facilitator | Solo, self-paced, instant feedback |

---

## Key Features

- 🚨 Real attack scenario simulations (Ransomware, DDoS, SQL Injection, Phishing, and more)
- 📊 Alert triage dashboard with severity levels (CRITICAL / HIGH / LOW)
- 🔍 Investigation workflow with guided playbook steps
- 📝 Log analysis with real-time filtering
- 🏆 Gamification: XP system, levels, ranks, and achievements
- 📈 Performance tracking: score, accuracy, elapsed time, mistakes count
- 👤 User profiles with full progress tracking across scenarios

---

## Database Schema (ERD)
![alt text](image.png)
---
![ERD Diagram](docs/erd.png)


## External Services & Integrations

| Service | Type | Purpose |
|---------|------|---------|
| Supabase | Database | Data storage for users, scenarios, alerts, logs, investigations |
| Supabase Auth | Authentication | Email/password login and session management |
| Vercel | Deployment | Hosting and CI/CD pipeline |
| Next.js API Routes | Server Logic | Server-side rendering and secure API handling |

---

## Getting Started (Local Development)

```bash
git clone https://github.com/shakedoz02/soc-next.git
cd soc-next
npm install
cp .env.example .env.local
# Add your Supabase credentials to .env.local
npm run dev
```

Required environment variables in `.env.local`: 
VITE_SUPABASE_URL=https://vutngifsmjajycupelwc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dG5naWZzbWphanljdXBlbHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODg3MTYsImV4cCI6MjA5NTM2NDcxNn0.KYn7jDkTWGU0UbGabiX0Gf-RW5O1dkjBkukwvXTWbcQ


---

