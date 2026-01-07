# YOKK - AI-Native Developer Platform for Africa

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mohs-projects-980c85c9/v0-ai-dev-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/hDNyN7ZVWk2)

> AI-native platform for African developers, traders, and entrepreneurs.

---

## Philosophy: BOBO

- **B**uild - Own your stack, Match your user reality.
- **O**wn - Data sovereignty for Africa  
- **B**ootstrap - Revenue-first, sustainable growth
- **O**perate - Self-sufficient infrastructure

---

## Project Status

| Phase | Status | Description |
|-------|--------|-------------|
| 1.1 - Codebase Cleanup | ✅ Complete | Clean foundation with demo data |
| 1.2 - Database Setup | 🚧 Current | Supabase schema ready |
| 1.3 - Auth Flow | 📋 Pending | Login/signup with Supabase Auth |
| 2 - Social Feed | 📋 Pending | X-style feed with Bilibili density |
| 3 - Gamification | 📋 Pending | JRPG-style XP and achievements |
| 4 - Product Launches | 📋 Pending | ProductHunt-style launch system |
| 5 - Bo AI Assistant | 📋 Pending | Grok-inspired AI helper |
| 6 - Voice Comments | 📋 Pending | Audio-first engagement |
| 7 - Offline-First | 📋 Pending | PowerSync for offline sync |
| 8 - Production Polish | 📋 Pending | Security, testing, deployment |

**Full Roadmap:** [Notion Tracker](https://www.notion.so/2e1b7dd11755812fb694c14fdaff539b)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Mobile | React Native (Expo) | Native iOS/Android |
| Web | Next.js 15 | Server components, PWA |
| Database | Supabase (Postgres) | Auth + data with RLS |
| Offline | PowerSync | SQLite local sync |
| AI | Vercel AI SDK → Groq/Claude | Edge-deployed Bo AI |
| Styling | Tailwind CSS | "Sunset over Dakar" theme |

---

## Design System: Sunset Over Dakar

Built for African users on mid-range devices with unstable connections.

**Colors:**
- **Fortress Brown** `#1A1412` - Dark glassmorphism base
- **Dakar Gold** `#D4A017` - Glowing borders, CTAs
- **Sand Gray** `#A9A9A9` - Metadata text
- **Sunset Orange** `#F97316` - Fire/trending states

**Principles:**
- Offline-first (assume user is offline)
- Mobile-first (44px touch targets)
- Bandwidth-aware (Opus audio, AVIF images)
- Latency-tolerant (optimistic UI for 300ms+ RTT)

---

## Key Features

### 1. Social Feed
X-style interactions with Bilibili information density. Posts, articles, products all in one feed.

### 2. Product Launches
ProductHunt-style daily launches for African tech products.

### 3. Bo AI Assistant
Proprietary AI router with African tech context. Inspired by Grok (X/Twitter).

### 4. Gamification
JRPG-style XP system (levels 1-50) with achievements and unlockables.

### 5. Voice Comments
Audio-first engagement using Opus encoding for low bandwidth.

### 6. Offline-First
PowerSync for SQLite sync. Queue actions offline, sync on reconnect.

---

## Project Structure

```
YOKK/
├── ARCHITECT.md          # Living agent persona (READ FIRST)
├── YOKK-STATE.md         # Current state snapshot
├── scripts/              
│   └── 001-yokk-schema.sql  # Database schema with RLS
├── app/                  # Next.js pages
├── components/           # React components
│   ├── feed/            # Social feed components
│   ├── launch/          # Product launch components
│   ├── profile/         # User profiles & gamification
│   ├── bo/              # Bo AI chat interface
│   └── voice/           # Voice recording/playback
├── lib/
│   ├── types.ts         # TypeScript types
│   ├── demo-data.ts     # Mock data for demo mode
│   └── supabase/        # Supabase client utilities
└── public/              # Static assets
```

---

## Development

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/MouhamedN96/YOKK.git
   cd YOKK
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**
   Already configured in Vercel workspace. See `.env.example` for local development.

4. **Run database migration:**
   ```bash
   # Execute scripts/001-yokk-schema.sql in your Supabase dashboard
   ```

5. **Start dev server:**
   ```bash
   npm run dev
   ```

---

## Working on This Project

**IMPORTANT:** If you're an AI agent working on this project:

1. **Read `ARCHITECT.md` first** - This embodies the project vision and constraints
2. Check the [Notion Tracker](https://www.notion.so/2e1b7dd11755812fb694c14fdaff539b) for current phase
3. Read `YOKK-STATE.md` for quick state reference
4. Update the Mutation Log in `ARCHITECT.md` before ending your session

This project uses a "Shifting Architect" pattern - each Human/AI session continues as the same persona across sessions.

#NOTES:
###Read ARCHITECT.md and embody The Architect.
###Check the Notion Tracker 
### https://www.notion.so/YOKK-Project-Tracker-2e1b7dd11755812fb694c14fdaff539b?source=copy_link
---

## Deployment

**Live App:** Deployed automatically to Vercel on every push to `main`.

**Vercel Project:** [https://vercel.com/mohs-projects-980c85c9/v0-ai-dev-platform](https://vercel.com/mohs-projects-980c85c9/v0-ai-dev-platform)

**Continue Building:** [https://v0.app/chat/hDNyN7ZVWk2](https://v0.app/chat/hDNyN7ZVWk2)

---

## Target Users

- **Traders and businessmen** needing knowledge access
- **Developers** needing community and network  
- **Entrepreneurs** needing help and visibility
- People where every $1 is earned through sweat, under the sun, in tough times

---


## License

Proprietary - NJOOBA

---

## Contact

**Builder:** Mouhamed NDIAYE  
**GitHub:** [@MouhamedN96](https://github.com/MouhamedN96)

---

**Built for Africa. By Africans. No BS. Just Pronciples.**
