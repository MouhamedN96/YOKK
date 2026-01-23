# Turso - Edge-Distributed SQLite Database

## Overview

Turso is LibSQL (SQLite fork) deployed at the edge. It solves the "Europe-to-Africa" latency penalty by replicating your database to 300+ edge locations worldwide, including Johannesburg. For African developers, this transforms 200ms database calls into <50ms or even 0ms (embedded replicas).

**Key Features:**
- Edge replicas in Johannesburg, Cape Town (and expanding)
- Embedded replicas (database runs inside your app code)
- SQLite compatibility (works with PowerSync!)
- Cost-efficient (pay per rows read, not compute)
- 10-100x cheaper than managed Postgres

## When to Use

- Building for African users (latency-sensitive)
- Read-heavy applications (social feeds, content platforms)
- Need offline-first + cloud sync
- Cost-constrained (startups, bootstrapped projects)
- Want to embed database in edge functions

## Why Turso > Supabase for Africa

### The Latency Math

```
User in Dakar querying Supabase (eu-central-1):
- Network RTT: 200ms
- TLS handshake: 50ms
- Query execution: 10ms
- Total: 260ms

User in Dakar querying Turso (Johannesburg replica):
- Network RTT: 50ms
- HTTP request: 20ms
- Query execution: 5ms
- Total: 75ms

User in Dakar with Turso embedded replica:
- Network RTT: 0ms (local file read!)
- Query execution: 0.5ms
- Total: 0.5ms
```

**Result:** 500x faster for embedded, 3-4x faster for edge

### The Cost Math

```
Supabase Pro (500K MAU):
- $25/month base
- 8GB database
- Connection pooling needed
- Scale up = $50, $100, $200...

Turso (500K MAU, read-heavy social app):
- Rows read: 100M/month
- Cost: $5-15/month
- No connection limits
- Scales linearly
```

**Result:** 5-10x cheaper

## Installation

```bash
npm install @libsql/client
```

## Setup

### Basic Client

```typescript
import { createClient } from '@libsql/client';

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
```

### With Edge Replica

```typescript
// Automatically routes to nearest replica
export const turso = createClient({
  url: 'libsql://your-db-johannesburg.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN!,
  // Replicates to edge closest to request
});
```

### Embedded Replica (0ms Latency!)

```typescript
// For Vercel Edge Functions or Node.js
import { createClient } from '@libsql/client';

export const turso = createClient({
  url: 'file:./local-replica.db',
  syncUrl: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  syncInterval: 60, // Sync every 60 seconds
});

// Database runs IN your edge function
// Reads are local file reads (0ms network latency)
// Writes sync to primary automatically
```

## Core Patterns

### Pattern 1: Basic Queries

```typescript
// Select
const users = await turso.execute('SELECT * FROM users WHERE id = ?', [userId]);

// Insert
await turso.execute(
  'INSERT INTO posts (id, user_id, content) VALUES (?, ?, ?)',
  [postId, userId, content]
);

// Update
await turso.execute(
  'UPDATE posts SET likes = likes + 1 WHERE id = ?',
  [postId]
);
```

### Pattern 2: Batch Operations

```typescript
// Atomic batch (all succeed or all fail)
await turso.batch([
  { sql: 'INSERT INTO posts (id, content) VALUES (?, ?)', args: [id1, 'Post 1'] },
  { sql: 'INSERT INTO posts (id, content) VALUES (?, ?)', args: [id2, 'Post 2'] },
  { sql: 'UPDATE users SET post_count = post_count + 2 WHERE id = ?', args: [userId] },
]);
```

### Pattern 3: Transactions

```typescript
await turso.transaction(async (tx) => {
  await tx.execute('UPDATE accounts SET balance = balance - 100 WHERE id = ?', [fromId]);
  await tx.execute('UPDATE accounts SET balance = balance + 100 WHERE id = ?', [toId]);
  await tx.execute('INSERT INTO transfers (from_id, to_id, amount) VALUES (?, ?, ?)', [
    fromId,
    toId,
    100,
  ]);
});
```

### Pattern 4: Prepared Statements (Performance)

```typescript
// Prepare once, execute many times
const stmt = await turso.prepare('SELECT * FROM posts WHERE user_id = ?');

const userPosts = await stmt.query([userId1]);
const morePosts = await stmt.query([userId2]);
```

## Integration with Aftech-Stack

### With PowerSync (Perfect Combo!)

Turso is SQLite-compatible, so it works perfectly as PowerSync's backend:

```typescript
// PowerSync syncs to Turso instead of Supabase
export const tursoConnector: PowerSyncBackendConnector = {
  fetchCredentials: async () => ({
    endpoint: process.env.TURSO_SYNC_URL!,
    token: process.env.TURSO_AUTH_TOKEN!,
  }),

  uploadData: async (database) => {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    // Upload to Turso
    await turso.batch(
      transaction.crud.map((op) => ({
        sql: convertToSQL(op),
        args: op.opData,
      }))
    );

    await transaction.complete();
  },
};
```

**Result:** Offline-first mobile app syncing to edge SQLite. Best of both worlds!

### With Next.js Edge Functions

```typescript
// app/api/feed/route.ts
import { turso } from '@/lib/turso/client';

export const runtime = 'edge'; // Runs at the edge!

export async function GET(request: Request) {
  // This query hits the embedded replica (0ms latency)
  const posts = await turso.execute(`
    SELECT p.*, u.name, u.avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 50
  `);

  return Response.json(posts.rows);
}
```

### With Supabase Edge Functions

```typescript
// supabase/functions/get-feed/index.ts
import { createClient } from 'https://esm.sh/@libsql/client@0.3.5';

Deno.serve(async (req) => {
  const turso = createClient({
    url: Deno.env.get('TURSO_DATABASE_URL')!,
    authToken: Deno.env.get('TURSO_AUTH_TOKEN')!,
  });

  const result = await turso.execute('SELECT * FROM posts LIMIT 50');

  return new Response(JSON.stringify(result.rows));
});
```

## Migration from Supabase

### Step 1: Export Supabase Schema

```bash
# Export schema
pg_dump -h db.supabase.co -U postgres -s your_db > schema.sql

# Convert Postgres → SQLite (manual adjustments needed)
# Replace SERIAL → INTEGER PRIMARY KEY
# Replace TIMESTAMPTZ → TEXT (ISO 8601)
# Remove Postgres-specific features
```

### Step 2: Create Turso Database

```bash
turso db create aftech-stack --location jnb # Johannesburg
turso db show aftech-stack
turso db tokens create aftech-stack
```

### Step 3: Apply Schema

```bash
turso db shell aftech-stack < schema.sql
```

### Step 4: Migrate Data

```typescript
// Dual-write period (write to both)
async function createPost(data: Post) {
  // Write to Supabase (old)
  await supabase.from('posts').insert(data);

  // Write to Turso (new)
  await turso.execute(
    'INSERT INTO posts (id, user_id, content, created_at) VALUES (?, ?, ?, ?)',
    [data.id, data.user_id, data.content, data.created_at]
  );
}
```

### Step 5: Switch Reads

```typescript
// Read from Turso (verify consistency)
const posts = await turso.execute('SELECT * FROM posts ORDER BY created_at DESC LIMIT 50');

// Compare with Supabase
const verification = await supabase.from('posts').select('*').limit(50);

// If identical, switch all reads to Turso
```

## Best Practices

1. **Use Embedded Replicas for Edge Functions**: 0ms latency
2. **Batch Writes**: Reduce network round trips
3. **Index Properly**: SQLite benefits from good indexes
4. **Monitor Rows Read**: Your primary cost metric
5. **Use Prepared Statements**: Faster execution for repeated queries
6. **Enable WAL Mode**: Better write concurrency

## Cost Optimization

### African Context

For a social app with 10,000 MAU:

```
Read-heavy workload (typical social feed):
- 10,000 users × 50 feed loads/day × 50 posts = 25M rows/day
- 25M rows × 30 days = 750M rows/month
- Turso cost: $15/month

Same on Supabase:
- Need 8GB database instance
- $25/month minimum
- Plus connection pooler: $10/month
- Total: $35/month

Savings: 57%
```

### Write-Heavy Optimization

```typescript
// BAD: Individual writes (expensive rows read)
for (const like of likes) {
  await turso.execute('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [
    like.post_id,
    like.user_id,
  ]);
}

// GOOD: Batch writes (single network call)
await turso.batch(
  likes.map((like) => ({
    sql: 'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
    args: [like.post_id, like.user_id],
  }))
);
```

## Common Pitfalls

### Pitfall 1: Forgetting Edge Replicas
❌ **Wrong:** Using default URL without specifying region
✅ **Correct:** Explicitly create Johannesburg replica

### Pitfall 2: Not Using Embedded Replicas
❌ **Wrong:** Network call from edge function to Turso edge
✅ **Correct:** Embed replica in edge function (0ms latency)

### Pitfall 3: Postgres SQL Syntax
❌ **Wrong:** `RETURNING *` (Postgres)
✅ **Correct:** Use `RETURNING *` is supported in LibSQL now!

## Real-World African Use Case: YOKK

From YOKK's technical architecture:

```typescript
// Content feed with 0ms latency for African users
export async function getFeed(userId: string) {
  // Embedded Turso replica running IN the edge function
  const posts = await turso.execute(`
    SELECT p.*, u.name
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.created_at > datetime('now', '-7 days')
    ORDER BY p.created_at DESC
    LIMIT 50
  `);

  // No network latency - instant response!
  return posts.rows;
}
```

**Result:**
- User in Dakar sees feed in 50ms (vs 260ms with Supabase)
- Cost: $5/month (vs $35/month)
- Better UX, better economics

## References

- **Official Docs**: https://docs.turso.tech/
- **LibSQL**: https://github.com/tursodatabase/libsql
- **Pricing**: https://turso.tech/pricing

---

**Last Updated**: 2025-12-31
**African Optimization**: CRITICAL for latency and cost
