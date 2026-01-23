# Next.js SaaS - Web Application Foundation

## Overview

Next.js provides the web application layer for the Aftech-stack. Use with Supabase for backend, AI SDK for AI features, and follow SaaS starter patterns for production-ready applications.

**Key Features:**
- App Router with React Server Components
- Server Actions
- TypeScript
- Supabase integration
- Authentication and authorization
- Billing and subscription management

## Project Structure

```
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── (dashboard)/
│   ├── page.tsx
│   └── settings/
├── api/
│   └── chat/route.ts
└── layout.tsx
lib/
├── supabase/
│   ├── client.ts
│   └── server.ts
├── ai/
└── stripe/
components/
├── ui/
└── ...
```

## Core Patterns

### Server Components

```typescript
// app/(dashboard)/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1>Dashboard</h1>
      <TodoList todos={todos} />
    </div>
  );
}
```

### Server Actions

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTodo(formData: FormData) {
  const supabase = createClient();
  const description = formData.get('description') as string;

  const { error } = await supabase
    .from('todos')
    .insert({ description, completed: false });

  if (error) throw error;

  revalidatePath('/dashboard');
}
```

### Middleware (Auth)

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## Best Practices

1. **Use Server Components**: Default to server components
2. **Server Actions**: For mutations
3. **Type Safety**: Generate types from Supabase schema
4. **Auth Middleware**: Protect routes
5. **Streaming**: Use Suspense for loading states

## References

- **SaaS Starter**: https://github.com/nextjs/saas-starter

---

**Last Updated**: 2025-12-31
