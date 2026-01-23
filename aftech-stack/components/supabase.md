# Supabase - Backend as a Service

## Overview

Supabase is an open-source Firebase alternative providing Postgres database, authentication, storage, edge functions, and realtime subscriptions. In the Aftech-stack, Supabase serves as the primary backend, syncing with PowerSync for offline-first capabilities.

**Key Features:**
- PostgreSQL database with REST API
- Row Level Security (RLS)
- Authentication (email, OAuth, magic links)
- Edge Functions (Deno/TypeScript)
- Realtime subscriptions
- File storage
- Python and Swift SDKs

## When to Use

- Need managed Postgres database
- Require authentication and authorization
- Want serverless edge functions
- Need realtime data subscriptions
- Require file/media storage
- Building full-stack applications
- Need backend for mobile and web

## Installation

### JavaScript/TypeScript (React Native, Next.js)

```bash
npm install @supabase/supabase-js

# For React Native (required native modules)
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

### Python (Backend Services)

```bash
pip install supabase
```

### Swift (iOS Native)

```swift
// In Package.swift
dependencies: [
    .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
]
```

## Setup

### React Native/Expo

Create `lib/supabase/client.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Next.js (Server Components)

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### Python

```python
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
```

## Core Patterns

### Pattern 1: Authentication

#### Email/Password Sign Up

```typescript
async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'myapp://auth/callback',
    },
  });

  if (error) throw error;
  return data;
}
```

#### Email/Password Sign In

```typescript
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}
```

#### OAuth (Google, GitHub, etc.)

```typescript
async function signInWithOAuth(provider: 'google' | 'github' | 'apple') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'myapp://auth/callback',
    },
  });

  if (error) throw error;
  return data;
}
```

#### Magic Link

```typescript
async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'myapp://auth/callback',
    },
  });

  if (error) throw error;
}
```

#### Session Management

```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});

// Sign out
await supabase.auth.signOut();
```

### Pattern 2: Database Operations

#### Select (Query)

```typescript
// Simple select
const { data: todos, error } = await supabase
  .from('todos')
  .select('*');

// With filters
const { data } = await supabase
  .from('todos')
  .select('*')
  .eq('completed', false)
  .order('created_at', { ascending: false })
  .limit(10);

// With joins
const { data } = await supabase
  .from('todos')
  .select(`
    *,
    list:lists(id, name)
  `)
  .eq('list_id', listId);
```

#### Insert

```typescript
const { data, error } = await supabase
  .from('todos')
  .insert({
    description: 'New todo',
    list_id: listId,
    completed: false,
  })
  .select()
  .single();
```

#### Update

```typescript
const { error } = await supabase
  .from('todos')
  .update({ completed: true, completed_at: new Date().toISOString() })
  .eq('id', todoId);
```

#### Delete

```typescript
const { error } = await supabase
  .from('todos')
  .delete()
  .eq('id', todoId);
```

#### Upsert

```typescript
const { data, error } = await supabase
  .from('todos')
  .upsert({
    id: todoId,
    description: 'Updated or created',
  })
  .select();
```

### Pattern 3: Realtime Subscriptions

#### Subscribe to Table Changes

```typescript
import { useEffect } from 'react';

function TodoList() {
  useEffect(() => {
    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // 'INSERT' | 'UPDATE' | 'DELETE' | '*'
          schema: 'public',
          table: 'todos',
        },
        (payload) => {
          console.log('Change received!', payload);
          // Refetch or update local state
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
```

#### Subscribe with Filters

```typescript
const channel = supabase
  .channel('my-list-todos')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'todos',
      filter: `list_id=eq.${listId}`,
    },
    handleChange
  )
  .subscribe();
```

#### Presence (Track Online Users)

```typescript
const channel = supabase.channel('room-1', {
  config: {
    presence: {
      key: userId,
    },
  },
});

// Track presence
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Online users:', Object.keys(state));
  })
  .on('presence', { event: 'join' }, ({ key }) => {
    console.log('User joined:', key);
  })
  .on('presence', { event: 'leave' }, ({ key }) => {
    console.log('User left:', key);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ online_at: new Date().toISOString() });
    }
  });
```

### Pattern 4: Edge Functions

#### Calling from Client

```typescript
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'Functions' },
});
```

#### Function Implementation

Create `supabase/functions/hello-world/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Parse request
    const { name } = await req.json();

    // Get auth from header
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Do work
    const message = `Hello ${name}!`;

    return new Response(JSON.stringify({ message }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

### Pattern 5: Storage

#### Upload File

```typescript
const file = /* File from picker */;

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true,
  });
```

#### Get Public URL

```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`);

const publicUrl = data.publicUrl;
```

#### Download File

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .download(`${userId}/avatar.png`);

// data is a Blob
```

## Integration with Aftech-stack

### With PowerSync

Supabase serves as the backend for PowerSync:

```typescript
// PowerSync syncs with Supabase Postgres
export const supabaseConnector: PowerSyncBackendConnector = {
  fetchCredentials: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL!,
      token: session.access_token,
    };
  },
  uploadData: async (database) => {
    // Upload local changes to Supabase
  },
};
```

### With OpenRouter/AI SDK

Use Edge Functions to call AI:

```typescript
// In edge function
import OpenAI from 'https://esm.sh/openai@4';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: Deno.env.get('OPENROUTER_API_KEY'),
});

const completion = await openrouter.chat.completions.create({
  model: 'anthropic/claude-3-sonnet',
  messages: [{ role: 'user', content: prompt }],
});
```

### With Upstash Redis

Edge Functions can use Redis for caching:

```typescript
import { Redis } from 'https://esm.sh/@upstash/redis@1';

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_URL'),
  token: Deno.env.get('UPSTASH_REDIS_TOKEN'),
});

// Cache AI responses
const cached = await redis.get(`ai:${promptHash}`);
if (cached) return cached;
```

## Best Practices

1. **Use Row Level Security (RLS)**: Always enable RLS on tables
2. **Type Generation**: Generate TypeScript types from schema
3. **Error Handling**: Always check for errors in responses
4. **Connection Pooling**: Use connection pooler for high traffic
5. **Index Queries**: Add indexes for frequently queried columns
6. **Batch Operations**: Use upsert for multiple records
7. **Edge Functions**: Keep functions small and focused

## Row Level Security (RLS)

Essential for security:

```sql
-- Enable RLS on table
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own todos
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own todos
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own todos
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own todos
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);
```

## TypeScript Types

Generate types from your database:

```bash
npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
```

Use in code:

```typescript
import { Database } from '@/lib/supabase/types';

export const supabase = createClient<Database>(url, key);

// Now you have full type safety
const { data } = await supabase.from('todos').select('*');
// data is typed as Database['public']['Tables']['todos']['Row'][]
```

## Common Pitfalls

### Pitfall 1: Forgetting RLS
❌ **Wrong:** Creating tables without RLS
✅ **Correct:** Always enable RLS and create policies

### Pitfall 2: Not Handling Errors
❌ **Wrong:**
```typescript
const { data } = await supabase.from('todos').select('*');
return data; // data could be null!
```

✅ **Correct:**
```typescript
const { data, error } = await supabase.from('todos').select('*');
if (error) throw error;
return data;
```

### Pitfall 3: Exposing Service Role Key
❌ **Wrong:** Using service_role key in client code
✅ **Correct:** Only use anon key in client, service_role in backend

## References

- **Supabase Functions**: https://supabase.com/docs/guides/functions
- **Python SDK**: https://github.com/supabase/supabase-py
- **Swift SDK**: https://github.com/supabase/supabase-swift
- **Realtime Chat Example**: https://github.com/shwosner/realtime-chat-supabase-react
- **Slack Clone**: https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone

---

**Last Updated**: 2025-12-31
