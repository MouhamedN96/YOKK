# Upstash Redis - Edge-Compatible Caching

## Overview

Upstash Redis is a serverless Redis service with HTTP-based access, making it perfect for edge environments like Supabase Edge Functions, Vercel Edge, and Cloudflare Workers. In the Aftech-stack, use it for caching AI responses, rate limiting, and session management.

**Key Features:**
- HTTP-based (works in edge/serverless)
- Global replication for low latency
- Pay-per-request pricing
- TypeScript SDK
- Compatible with Redis commands
- Built-in rate limiting

## When to Use

- Cache AI responses to reduce costs
- Implement rate limiting
- Store temporary session data
- Edge-compatible key-value storage
- Real-time counters and analytics
- Distributed locks

## Installation

```bash
npm install @upstash/redis
```

## Setup

```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});
```

## Core Patterns

### Caching AI Responses

```typescript
import { createHash } from 'crypto';

async function cachedAICall(prompt: string) {
  const key = `ai:${createHash('sha256').update(prompt).digest('hex')}`;

  // Try cache first
  const cached = await redis.get(key);
  if (cached) return cached;

  // Call AI
  const response = await callAI(prompt);

  // Cache for 1 hour
  await redis.setex(key, 3600, response);

  return response;
}
```

### Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

async function checkRateLimit(userId: string) {
  const { success, limit, remaining } = await ratelimit.limit(userId);

  if (!success) {
    throw new Error(`Rate limit exceeded. Try again later.`);
  }

  return { remaining, limit };
}
```

### Session Management

```typescript
interface Session {
  userId: string;
  createdAt: number;
  data: Record<string, any>;
}

async function createSession(userId: string, data: Record<string, any>) {
  const sessionId = crypto.randomUUID();
  const session: Session = {
    userId,
    createdAt: Date.now(),
    data,
  };

  // Store for 24 hours
  await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(session));

  return sessionId;
}

async function getSession(sessionId: string): Promise<Session | null> {
  const data = await redis.get(`session:${sessionId}`);
  return data ? JSON.parse(data as string) : null;
}
```

### Counters

```typescript
async function incrementPageView(pageId: string) {
  await redis.incr(`views:${pageId}`);
}

async function getPageViews(pageId: string) {
  return await redis.get(`views:${pageId}`) || 0;
}
```

## Integration with Aftech-stack

### With Supabase Edge Functions

```typescript
import { Redis } from 'https://esm.sh/@upstash/redis@1';

serve(async (req) => {
  const redis = new Redis({
    url: Deno.env.get('UPSTASH_REDIS_URL'),
    token: Deno.env.get('UPSTASH_REDIS_TOKEN'),
  });

  // Use Redis in edge function
  const cached = await redis.get('key');
});
```

### With OpenRouter (Caching)

See OpenRouter component for AI response caching patterns.

## Best Practices

1. **Use TTL**: Always set expiration for cache entries
2. **Hash Keys**: Use SHA-256 for cache keys from user input
3. **Handle Errors**: Redis failures shouldn't break your app
4. **Monitor Usage**: Track Redis operations for cost
5. **Use Pipelines**: Batch operations when possible

## Common Pitfalls

❌ **Wrong:** Storing large objects without compression
✅ **Correct:** Compress large values or use references

❌ **Wrong:** No expiration on cache entries
✅ **Correct:** Always set TTL

## References

- **Redis JS SDK**: https://github.com/upstash/redis-js

---

**Last Updated**: 2025-12-31
