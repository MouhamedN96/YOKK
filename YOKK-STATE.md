# YOKK Project State
> Last Updated: January 6, 2026

## Quick Resume Prompt
Copy this to resume with any AI:
```
I'm building YOKK - an AI-native dev platform for Africans. Stack: Next.js 15 + Supabase + PowerSync + Vercel AI SDK. Theme: "Sunset over Dakar" (Fortress Brown #1A1412, Dakar Gold #D4A017). Read YOKK-STATE.md and GEMINI.md for full context, then continue from the "Next Tasks" section.
```

## Completed Features
- [x] Database schema (scripts/001-yokk-schema.sql) - NOT YET EXECUTED
- [x] Seed data (scripts/002-seed-sample-data.sql)
- [x] Supabase auth integration (login/signup)
- [x] Core layout (header, sidebar, bottom nav with Bo AI button)
- [x] Social feed with posts, upvotes, comments
- [x] User profiles with XP/gamification
- [x] Bo AI chat interface (/bo)
- [x] Voice recorder/player components
- [x] Explore page with categories
- [x] Community page with user rankings
- [x] Trending page with time filters
- [x] Launch page (ProductHunt-style)
- [x] Product submission flow

## Next Tasks
- [ ] RUN DATABASE MIGRATION (scripts/001-yokk-schema.sql)
- [ ] Run seed data (scripts/002-seed-sample-data.sql)
- [ ] Add PowerSync for offline-first sync
- [ ] Add notifications system
- [ ] Add user settings page
- [ ] Add direct messages
- [ ] Add video upload (Bilibili-style)
- [ ] Add product comments/reviews

## Database Status
- Tables created: NO (0 tables)
- RLS policies: In schema, not applied
- Seed data: Ready to run

## Key Files
| File | Purpose |
|------|---------|
| `GEMINI.md` | AI context file with design rules |
| `scripts/001-yokk-schema.sql` | Full database schema |
| `scripts/002-seed-sample-data.sql` | Sample posts/users |
| `lib/types.ts` | TypeScript interfaces |
| `app/globals.css` | Theme tokens & styles |
| `components/layout/*` | Core navigation |
| `components/feed/*` | Post cards & feed |
| `components/bo/*` | AI assistant |
| `components/voice/*` | Voice recording |

## Design Tokens
```css
--fortress-brown: #1A1412
--dakar-gold: #D4A017
--sand-gray: #A9A9A9
--sunset-orange: #FF6B35
```

## Environment Variables Needed
- SUPABASE_URL ✓
- SUPABASE_ANON_KEY ✓
- NEXT_PUBLIC_SUPABASE_URL ✓
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✓

## Architecture Decisions
1. Server Components for performance (African infrastructure)
2. Optimistic UI updates (hide 300ms+ latency)
3. Opus codec for voice (bandwidth efficient)
4. AVIF/WebP for images
5. PowerSync for offline-first (pending)

## Known Issues
- Database tables not created yet
- Bo AI needs authentication check
- Voice upload to Supabase storage not implemented

## Git Branches
- main: Current development
