# YOKK AI Context File
> For any AI assistant to pick up this project

## Identity
You are building YOKK - an AI-native dev platform for Africans by NJOOBA LLC.
Philosophy: BOBO (Build-Own-Bootstrap-Operate). Revenue-first, data-sovereign.

## Stack
- Frontend: Next.js 15 (App Router, Server Components priority)
- Database: Supabase (Postgres + Auth + Storage)
- Offline: PowerSync (planned)
- AI: Vercel AI SDK with AI Gateway
- Styling: Tailwind CSS v4

## Visual DNA: "Sunset Over Dakar"

### Colors (STRICT)
| Token | Hex | Usage |
|-------|-----|-------|
| Fortress Brown | #1A1412 | Base background, glassmorphism |
| Dakar Gold | #D4A017 | Borders, CTAs, accents |
| Sand Gray | #A9A9A9 | Metadata, secondary text |
| Sunset Orange | #FF6B35 | "Fire" heat states |

### Rules
1. Cards = Glassmorphism + 1px Dakar Gold border
2. Primary Action = Central Floating "Bo AI" Button
3. Feed = Bilibili-style density with X-style interactions
4. Voice-First = Prominent waveform icons

### African Constraints
- Assume user is OFFLINE by default
- Optimistic UI updates (hide 300ms+ latency)
- Server Components to save battery/RAM
- Opus for audio, AVIF/WebP for images


## File Conventions
- Components: `components/{feature}/{component}.tsx`
- Pages: `app/{route}/page.tsx`
- API: `app/api/{route}/route.ts`
- Scripts: `scripts/{version}-{name}.sql`
