# MIGRATION-PLAN.md - Supabase to Turso + Better-Auth

> **Status:** DRAFT - Awaiting approval before execution
> **Date:** 2026-02-01
> **Author:** The Architect (Session 003)
> **Reason:** Supabase reliability issues (Jan 2026 outage), cost reduction, Africa edge latency

---

## DECISION RECORD

### Why Migrate

| Problem | Evidence |
|---------|----------|
| Supabase outage Jan 2026 | Data API, Auth, Storage, Realtime, Functions all down |
| Supabase postmortem | "This outage was avoidable, and the relaxed processes were unacceptable" |
| Cost | $25/mo minimum vs $5/mo Turso |
| Africa latency | No Supabase edge node in Africa. Turso has Johannesburg. |
| Vendor lock-in | Auth + DB + Storage tightly coupled. One goes down, all go down. |

### New Stack

| Layer | Current | New |
|-------|---------|-----|
| Database | Supabase Postgres | **Turso** (libSQL, Johannesburg edge) |
| Auth | Supabase Auth | **Better-Auth** (self-hosted, Ethiopian-built, MIT) |
| ORM | Supabase JS client | **Drizzle ORM** |
| Offline Sync | PowerSync (not activated) | **Turso embedded replicas** |
| Storage | Supabase Storage (not created) | **Cloudflare R2** |
| Analytics | None | **PostHog** |
| Framework | Next.js 15 | No change |
| Styling | Tailwind (Sunset over Dakar) | No change |

### Cost Comparison

| | Supabase | New Stack |
|--|----------|-----------|
| DB | $25/mo | $5/mo (Turso) |
| Auth | included | $0 (Better-Auth, self-hosted) |
| Storage | included | $0 (R2 free 10GB) |
| Sync | PowerSync (?) | $0 (Turso embedded replicas) |
| Analytics | N/A | $0 (PostHog free 1M events) |
| **Total** | **$25/mo+** | **~$5/mo** |

---

## SCHEMA TRANSLATION

### Tables (10 total)

All tables migrate from Postgres to SQLite (libSQL). Key syntax changes:

| Postgres | SQLite/libSQL |
|----------|---------------|
| `UUID PRIMARY KEY DEFAULT uuid_generate_v4()` | `TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) \|\| '-' \|\| ...)` or app-generated UUIDs |
| `TIMESTAMPTZ DEFAULT NOW()` | `TEXT DEFAULT (datetime('now'))` |
| `TEXT[]` (arrays) | `TEXT` (JSON string) |
| `JSONB` | `TEXT` (JSON string) |
| `BOOLEAN` | `INTEGER` (0/1) |
| `CHECK (type IN (...))` | Same syntax, supported |
| `REFERENCES ... ON DELETE CASCADE` | Supported (with `PRAGMA foreign_keys = ON`) |

### Table-by-Table Migration Notes

#### 1. profiles
- **Change:** `id` no longer references `auth.users(id)`. Better-Auth manages its own user table. Link via `better_auth_user_id` or use Better-Auth's user ID as profile ID.
- **Change:** `preferred_languages TEXT[]` -> `TEXT` (JSON array string)
- **Change:** `interests TEXT[]` -> `TEXT` (JSON array string)

#### 2. posts
- **Change:** `tags TEXT[]` -> `TEXT` (JSON array string)
- **Change:** `type` CHECK constraint preserved as-is

#### 3. comments
- Self-referencing FK (`parent_comment_id`) supported in SQLite

#### 4. upvotes
- Composite UNIQUE constraints supported
- `UNIQUE(user_id, post_id)` and `UNIQUE(user_id, comment_id)` work as-is

#### 5. launches
- `category` CHECK constraint preserved
- `tags TEXT[]` -> `TEXT` (JSON array string)
- `launch_date DATE` -> `TEXT`

#### 6. achievements
- Straightforward migration, no special types

#### 7. bo_conversations
- `messages JSONB` -> `TEXT` (JSON string, parse in app)

#### 8. feed_items
- `tags TEXT[]` -> `TEXT` (JSON array string)
- `UNIQUE(source, external_id)` preserved

#### 9. bookmarks
- Simple FKs, no special types

#### 10. user_security_keys
- **Change:** `user_id` references Better-Auth user table instead of `auth.users`
- `transports TEXT[]` -> `TEXT` (JSON array string)

### RLS -> Application-Level Authorization

Supabase RLS policies become middleware/query-level guards in the application.

| Current RLS Policy | New Implementation |
|--------------------|--------------------|
| `"Public profiles" FOR SELECT USING (true)` | No guard needed - public read |
| `"Own profile" FOR UPDATE USING (auth.uid() = id)` | Middleware: `session.userId === profileId` |
| `"Public posts" FOR SELECT USING (true)` | No guard needed - public read |
| `"Author posts" FOR ALL USING (auth.uid() = author_id)` | Middleware: `session.userId === post.authorId` |
| `"Public comments" FOR SELECT USING (true)` | No guard needed |
| `"Author comments" FOR ALL USING (auth.uid() = author_id)` | Middleware check |
| `"Own upvotes" FOR ALL USING (auth.uid() = user_id)` | Middleware check |
| `"Author launches" FOR ALL USING (auth.uid() = author_id)` | Middleware check |
| `"Public achievements" FOR SELECT USING (true)` | No guard needed |
| `"Own bo_conversations" FOR ALL USING (auth.uid() = user_id)` | Middleware check |
| `"Public feed" FOR SELECT USING (true)` | No guard needed |
| `"Own bookmarks" FOR ALL USING (auth.uid() = user_id)` | Middleware check |
| `"Own security keys" FOR ALL USING (auth.uid() = user_id)` | Middleware check |

**Pattern:** 6 tables are public-read. 7 tables need ownership checks on write operations. One shared `requireOwnership(session, resourceUserId)` utility handles all.

### RPC Functions -> Drizzle Queries

| Current RPC | New Implementation |
|-------------|--------------------|
| `increment_post_upvotes(post_uuid)` | `db.update(posts).set({ upvotes: sql\`upvotes + 1\` }).where(eq(posts.id, postId))` |
| `decrement_post_upvotes(post_uuid)` | `db.update(posts).set({ upvotes: sql\`max(0, upvotes - 1)\` }).where(eq(posts.id, postId))` |

### Indexes

All 9 indexes translate directly to SQLite `CREATE INDEX` statements. Drizzle schema handles these declaratively.

---

## AUTH MIGRATION

### Better-Auth Setup

Better-Auth runs as a Next.js API route: `app/api/auth/[...all]/route.ts`

#### Server Config (`lib/auth/auth.ts`)
```
- Database: Turso via Drizzle adapter
- Plugins: phone-number, passkey, oauth
- Session: cookie-based (httpOnly, secure, sameSite)
- Trusted origins: APP_URL
```

#### Client Config (`lib/auth/client.ts`)
```
- createAuthClient() from "better-auth/react"
- Plugins: phoneNumberClient, passkeyClient
```

### Auth Method Mapping

| Current (Supabase) | New (Better-Auth) | Plugin |
|---------------------|-------------------|--------|
| `signInWithPassword()` | `authClient.signIn.email()` | Core |
| `signInWithOtp({ phone })` | `authClient.phoneNumber.sendOtp()` | phone-number |
| `verifyOtp({ phone, token })` | `authClient.phoneNumber.verifyOtp()` | phone-number |
| `signInWithOAuth({ provider })` | `authClient.signIn.social({ provider })` | Core |
| PasskeyAuth (custom) | `authClient.passkey.register/authenticate()` | passkey |
| `signUp({ email, password })` | `authClient.signUp.email()` | Core |
| `signOut()` | `authClient.signOut()` | Core |
| `getSession()` | `auth.api.getSession({ headers })` (server) | Core |
| `getUser()` | Session includes user object | Core |
| `onAuthStateChange()` | `authClient.useSession()` (React hook) | Core |

### Files to Rewrite

| File | Current Role | New Role |
|------|-------------|----------|
| `lib/supabase/auth.ts` | Auth functions | DELETE - replaced by Better-Auth client |
| `lib/auth/african-auth.ts` | WhatsApp/Passkey/OTP | REWRITE - use Better-Auth plugins |
| `components/providers/AuthProvider.tsx` | Session context | REWRITE - Better-Auth session provider |
| `hooks/useAuth.ts` | Auth hook | REWRITE - wrap Better-Auth useSession |
| `lib/supabase/middleware.ts` | Session check | REWRITE - Better-Auth session validation |
| `middleware.ts` | Route protection | REWRITE - Better-Auth middleware |
| `app/api/auth/passkey/*` (4 files) | WebAuthn routes | DELETE - Better-Auth passkey plugin handles |
| `components/auth/AfricanAuthFlow.tsx` | Auth UI | REWRITE - point to Better-Auth methods |

---

## FILE OPERATIONS MAP

### DELETE (11 files)
```
lib/supabase/auth.ts
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/middleware.ts
lib/supabase/posts.ts
lib/supabase/types.ts
lib/powersync/Provider.tsx
lib/powersync/client.ts
lib/powersync/connector.ts
lib/powersync/enhanced-client.ts
lib/powersync/schema.ts
```

### CREATE (8 files)
```
lib/db/schema.ts           - Drizzle schema (10 tables + Better-Auth tables)
lib/db/client.ts           - Turso client initialization
lib/db/queries/posts.ts    - Post CRUD queries
lib/db/queries/profiles.ts - Profile queries
lib/db/middleware.ts        - Authorization guards (replaces RLS)
lib/auth/auth.ts           - Better-Auth server config
lib/auth/client.ts         - Better-Auth client config
app/api/auth/[...all]/route.ts - Better-Auth catch-all handler
drizzle.config.ts          - Drizzle migration config
```

### REWRITE (12 files)
```
lib/auth/african-auth.ts
components/providers/AuthProvider.tsx
hooks/useAuth.ts
middleware.ts
components/auth/AfricanAuthFlow.tsx
lib/actions/upvote.ts
components/compose/ComposeForm.tsx
app/(main)/layout.tsx
app/(main)/page.tsx
app/compose/page.tsx
app/onboarding/page.tsx
lib/yokk-unified-system.ts
```

### MODIFY (6 files)
```
app/login/page.tsx              - Minor: point to new auth flow
components/layout/Header.tsx    - Minor: useAuth hook same API
components/layout/Sidebar.tsx   - Minor: useAuth hook same API
app/api/system/health/route.ts  - Swap Supabase health check to Turso
app/api/webhooks/n8n/route.ts   - Swap to Drizzle queries
next.config.ts                  - CSP headers: Turso/R2 domains
```

### UNTOUCHED (~73 files, 66% of codebase)
All UI components, design system, Bo AI, PWA config, demo data, media optimizer.

---

## DEPENDENCY CHANGES

### Remove
```
@supabase/supabase-js
@supabase/ssr
@supabase/auth-helpers-nextjs
@powersync/common
@powersync/react
@powersync/web
@journeyapps/wa-sqlite
```

### Add
```
better-auth
@libsql/client
drizzle-orm
drizzle-kit
```

### Keep
```
@simplewebauthn/browser    - Better-Auth passkey plugin uses this
@simplewebauthn/server     - Better-Auth passkey plugin uses this
posthog-js                 - Already installed
```

---

## ENVIRONMENT VARIABLES

### Remove
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_POWERSYNC_URL
```

### Add / Activate (already templated in .env.example)
```
TURSO_DATABASE_URL=libsql://yokk-db.turso.io
TURSO_AUTH_TOKEN=<token>
BETTER_AUTH_SECRET=<generated-secret>
BETTER_AUTH_URL=http://localhost:3000   (or production URL)
CLOUDFLARE_ACCOUNT_ID=<id>
CLOUDFLARE_ACCESS_KEY_ID=<key>
CLOUDFLARE_SECRET_ACCESS_KEY=<secret>
CLOUDFLARE_R2_BUCKET=yokk-media
NEXT_PUBLIC_POSTHOG_KEY=<key>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## EXECUTION PHASES

### Phase 0: Infrastructure Setup (no code changes)
- [ ] Create Turso database (`turso db create yokk-db --location jnb`)
- [ ] Create Turso auth token
- [ ] Create Cloudflare R2 bucket (`yokk-media`)
- [ ] Create PostHog project
- [ ] Set up `.env.local` with new credentials
- [ ] Generate `BETTER_AUTH_SECRET` (`openssl rand -hex 32`)

### Phase 1: Database Layer (lib/db/*)
- [ ] Install: `drizzle-orm @libsql/client drizzle-kit`
- [ ] Create `drizzle.config.ts`
- [ ] Create `lib/db/schema.ts` - all 10 tables in Drizzle syntax
- [ ] Create `lib/db/client.ts` - Turso client init
- [ ] Run `drizzle-kit push` to create tables on Turso
- [ ] Verify schema with `turso db shell yokk-db`
- **Validation:** Tables exist, can insert/select test data

### Phase 2: Auth Layer (lib/auth/*)
- [ ] Install: `better-auth`
- [ ] Create `lib/auth/auth.ts` - server config with plugins
- [ ] Create `lib/auth/client.ts` - client config
- [ ] Create `app/api/auth/[...all]/route.ts` - catch-all handler
- [ ] Run `npx @better-auth/cli generate` - create Better-Auth tables
- [ ] Run `drizzle-kit push` - apply Better-Auth tables to Turso
- **Validation:** Can sign up, sign in, get session via API

### Phase 3: Auth UI + Middleware
- [ ] Rewrite `components/providers/AuthProvider.tsx`
- [ ] Rewrite `hooks/useAuth.ts`
- [ ] Rewrite `middleware.ts` - Better-Auth session check
- [ ] Rewrite `lib/auth/african-auth.ts` - Better-Auth plugins
- [ ] Rewrite `components/auth/AfricanAuthFlow.tsx`
- [ ] Delete `app/api/auth/passkey/*` (4 routes)
- [ ] Delete `lib/supabase/auth.ts`
- [ ] Delete `lib/supabase/middleware.ts`
- **Validation:** Full auth flow works: sign up -> sign in -> session -> protected routes

### Phase 4: Query Migration
- [ ] Create `lib/db/queries/posts.ts`
- [ ] Create `lib/db/queries/profiles.ts`
- [ ] Create `lib/db/middleware.ts` - ownership guards (replaces RLS)
- [ ] Rewrite `lib/actions/upvote.ts`
- [ ] Rewrite `components/compose/ComposeForm.tsx` (insert)
- [ ] Rewrite `app/(main)/page.tsx` (select with join)
- [ ] Rewrite `app/(main)/layout.tsx` (profile fetch)
- [ ] Rewrite `app/compose/page.tsx` (session + profile)
- [ ] Rewrite `app/onboarding/page.tsx` (profile update)
- [ ] Rewrite `app/api/webhooks/n8n/route.ts`
- [ ] Rewrite `app/api/system/health/route.ts`
- [ ] Delete `lib/supabase/posts.ts`
- [ ] Delete `lib/supabase/client.ts`, `server.ts`, `types.ts`
- **Validation:** Feed loads, posts create, upvotes work, profiles update

### Phase 5: Storage + Analytics
- [ ] Wire R2 upload in `ComposeForm.tsx` (presigned URLs)
- [ ] Add PostHog provider in layout
- [ ] Update CSP headers in `next.config.ts`
- **Validation:** Image upload works, PostHog receives events

### Phase 6: Cleanup + PowerSync Removal
- [ ] Delete `lib/powersync/*` (5 files)
- [ ] Remove all Supabase/PowerSync packages from `package.json`
- [ ] Update `lib/yokk-unified-system.ts`
- [ ] Update `.env.example` - remove Supabase, activate Turso/R2/PostHog
- [ ] Clean any remaining Supabase imports (grep sweep)
- [ ] `npm install` - verify clean dependency tree
- **Validation:** `npm run build` succeeds with zero Supabase references

### Phase 7: Integration Test
- [ ] Auth: sign up (email) -> verify session -> sign out
- [ ] Auth: phone OTP flow (if SMS provider configured)
- [ ] Auth: passkey registration + authentication
- [ ] Auth: OAuth flow (Google/GitHub)
- [ ] Feed: create post -> appears in feed -> upvote -> remove upvote
- [ ] Profile: onboarding -> update profile -> view profile
- [ ] Compose: create post with image upload
- [ ] Middleware: unauthenticated user redirected from protected routes
- [ ] Health: `/api/system/health` returns ok
- [ ] Build: `npm run build` succeeds
- [ ] Deploy: Vercel preview deployment works

---

## ROLLBACK PLAN

If migration fails mid-way:
1. `main` branch remains on Supabase (current state)
2. All migration work happens on `migration/turso-better-auth` branch
3. Supabase project stays active until new stack is proven in production
4. No data migration needed - Supabase DB has no real user data yet
5. If Better-Auth + Turso adapter is unstable: fall back to Drizzle + Postgres (Neon) + Better-Auth

---

## OPEN QUESTIONS

1. **Better-Auth + Turso adapter stability** - GitHub issue #5391 open. Need to test Drizzle adapter with libSQL driver. If blocked, Neon Postgres is fallback.
2. **SMS provider for Phone OTP** - Better-Auth requires custom `sendOTP`. Which provider? Twilio? Africa's Talking?
3. **Turso embedded replicas in Next.js** - Need to verify this works in Vercel's serverless environment.
4. **Data migration** - Is there real user data in Supabase that needs migrating? Or fresh start?

---

## DOCUMENTS TO UPDATE AFTER MIGRATION

- [ ] `ARCHITECT.md` - Update stack table, remove Supabase/PowerSync references
- [ ] `YOKK-STATE.md` - Update infrastructure and feature status
- [ ] `.env.example` - Already mostly correct, remove Supabase section
- [ ] `README.md` - Update setup instructions

---

**This plan is a contract. No execution without review and green light.**
