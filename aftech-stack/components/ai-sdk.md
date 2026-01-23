# AI SDK RSC - React Server Components with AI

## Overview

Vercel's AI SDK provides React Server Components (RSC) integration for AI features, enabling streaming AI responses directly in React Server Components. Use for Next.js web applications in the Aftech-stack.

**Key Features:**
- Streaming text generation
- React Server Components support
- Server Actions integration
- Tool/function calling
- Multi-turn conversations
- Type-safe APIs

## When to Use

- Building AI features in Next.js
- Need streaming responses in React
- Want server-side AI without client exposure
- Implementing chat interfaces
- Building AI-powered forms

## Installation

```bash
npm install ai
```

## Core Patterns

### Streaming Text

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
  });

  return result.toAIStreamResponse();
}
```

### Client-Side Hook

```typescript
'use client';

import { useChat } from 'ai/react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} disabled={isLoading} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### Server Actions

```typescript
'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export async function generate(input: string) {
  const stream = createStreamableValue('');

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-4-turbo'),
      prompt: input,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}
```

### With Tools

```typescript
const result = await streamText({
  model: openai('gpt-4-turbo'),
  messages,
  tools: {
    weather: {
      description: 'Get weather for a location',
      parameters: z.object({
        location: z.string(),
      }),
      execute: async ({ location }) => {
        return await getWeather(location);
      },
    },
  },
});
```

## Integration with Aftech-stack

Works with Next.js SaaS applications. For React Native, use direct API calls to Supabase Edge Functions instead.

## References

- **RSC Overview**: https://ai-sdk.dev/docs/ai-sdk-rsc/overview

---

**Last Updated**: 2025-12-31
