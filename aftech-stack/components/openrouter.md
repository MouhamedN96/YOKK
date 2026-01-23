# OpenRouter - AI Model Routing & Fallbacks

## Overview

OpenRouter is an AI gateway that provides unified access to multiple AI models (GPT-4, Claude, Gemini, etc.) with automatic routing, fallbacks, and cost optimization. In the Aftech-stack, OpenRouter enables robust AI features with automatic failover and model selection.

**Key Features:**
- Unified API for 200+ AI models
- Automatic model selection based on prompt
- Model fallbacks for reliability
- Dynamic skills loading
- Cost optimization
- Usage tracking and analytics
- TypeScript SDK with full typing

## When to Use

- Need access to multiple AI models
- Want automatic model fallbacks for reliability
- Require cost optimization across providers
- Building AI features that adapt to availability
- Need embeddings from various providers
- Want to experiment with different models
- Require production-grade AI reliability

## Installation

```bash
npm install openai
# OpenRouter uses OpenAI SDK with custom base URL
```

## Setup

### Basic Client

Create `lib/ai/openrouter.ts`:

```typescript
import OpenAI from 'openai';

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.YOUR_SITE_URL, // Optional
    'X-Title': process.env.YOUR_SITE_NAME, // Optional
  },
});
```

### Environment Variables

```bash
OPENROUTER_API_KEY=sk-or-v1-...
YOUR_SITE_URL=https://yourapp.com
YOUR_SITE_NAME=YourApp
```

## Core Patterns

### Pattern 1: Basic Chat Completion

```typescript
async function chat(userMessage: string) {
  const completion = await openrouter.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: userMessage },
    ],
  });

  return completion.choices[0].message.content;
}
```

### Pattern 2: Auto Model Selection

Let OpenRouter choose the best model for your prompt:

```typescript
async function chatWithAutoSelection(userMessage: string) {
  const completion = await openrouter.chat.completions.create({
    model: 'openrouter/auto', // Automatically selects best model
    messages: [{ role: 'user', content: userMessage }],
    route: 'fallback', // Use fallback routing
  });

  return completion.choices[0].message.content;
}
```

### Pattern 3: Model Fallbacks

Automatic failover to backup models:

```typescript
async function chatWithFallbacks(userMessage: string) {
  const completion = await openrouter.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    // If primary model fails, try these in order
    models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4-turbo',
      'google/gemini-pro',
    ],
    route: 'fallback',
    messages: [{ role: 'user', content: userMessage }],
  });

  // Check which model was actually used
  console.log('Used model:', completion.model);

  return completion.choices[0].message.content;
}
```

### Pattern 4: Streaming Responses

Stream tokens as they're generated:

```typescript
async function* streamChat(userMessage: string) {
  const stream = await openrouter.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [{ role: 'user', content: userMessage }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// Usage
for await (const token of streamChat('Tell me a story')) {
  process.stdout.write(token);
}
```

### Pattern 5: Function Calling (Tools)

Use tools/function calling:

```typescript
const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get the current weather in a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'City and state, e.g. San Francisco, CA',
          },
          unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
        },
        required: ['location'],
      },
    },
  },
];

async function chatWithTools(userMessage: string) {
  const completion = await openrouter.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [{ role: 'user', content: userMessage }],
    tools,
  });

  const message = completion.choices[0].message;

  if (message.tool_calls) {
    // Handle tool calls
    for (const toolCall of message.tool_calls) {
      if (toolCall.function.name === 'get_weather') {
        const args = JSON.parse(toolCall.function.arguments);
        const weather = await getWeather(args.location);
        // Send result back to model
      }
    }
  }

  return message.content;
}
```

### Pattern 6: Embeddings

Generate embeddings for semantic search:

```typescript
async function generateEmbedding(text: string) {
  const response = await openrouter.embeddings.create({
    model: 'openai/text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

// Batch embeddings
async function generateEmbeddings(texts: string[]) {
  const response = await openrouter.embeddings.create({
    model: 'openai/text-embedding-3-small',
    input: texts,
  });

  return response.data.map((d) => d.embedding);
}
```

### Pattern 7: Dynamic Skills Loading

Load skills at runtime for specialized behaviors:

```typescript
async function chatWithSkills(userMessage: string, skills: string[]) {
  const completion = await openrouter.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [{ role: 'user', content: userMessage }],
    // Load specific skills for this conversation
    transforms: skills,
  });

  return completion.choices[0].message.content;
}

// Usage
const response = await chatWithSkills('Help me code', ['code-expert', 'debugging']);
```

## Integration with Aftech-stack

### With Supabase Edge Functions

Create AI-powered edge functions:

```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import OpenAI from 'https://esm.sh/openai@4';

serve(async (req) => {
  const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: Deno.env.get('OPENROUTER_API_KEY'),
  });

  const { message } = await req.json();

  const completion = await openrouter.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4-turbo'],
    route: 'fallback',
    messages: [{ role: 'user', content: message }],
  });

  return new Response(JSON.stringify({
    response: completion.choices[0].message.content,
    model: completion.model,
  }));
});
```

### With Upstash Redis (Caching)

Cache AI responses to reduce costs:

```typescript
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

async function cachedChat(userMessage: string) {
  // Create cache key from message
  const cacheKey = `ai:${createHash('sha256').update(userMessage).digest('hex')}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached as string;
  }

  // Call AI
  const completion = await openrouter.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [{ role: 'user', content: userMessage }],
  });

  const response = completion.choices[0].message.content;

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, response);

  return response;
}
```

### With React Native/Expo

Use AI in mobile apps:

```typescript
import { useState } from 'react';

function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(text: string) {
    setLoading(true);
    try {
      // Call your Supabase Edge Function
      const { data } = await supabase.functions.invoke('ai-chat', {
        body: { message: text },
      });

      setMessages([
        ...messages,
        { role: 'user', content: text },
        { role: 'assistant', content: data.response },
      ]);
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setLoading(false);
    }
  }

  return <ChatUI messages={messages} onSend={sendMessage} loading={loading} />;
}
```

### With AI SDK RSC

Use with Vercel AI SDK for streaming:

```typescript
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    messages,
  });

  return result.toAIStreamResponse();
}
```

## Best Practices

1. **Always Use Fallbacks**: Specify backup models for reliability
2. **Cache Responses**: Use Redis to cache and reduce costs
3. **Stream When Possible**: Better UX for long responses
4. **Monitor Costs**: Use OpenRouter dashboard to track usage
5. **Handle Errors**: Model failures happen, handle gracefully
6. **Use Auto-Selection**: Let OpenRouter optimize for cost/performance
7. **Secure API Keys**: Never expose keys in client code

## Cost Optimization

### Pattern: Tiered Model Selection

Use cheaper models for simple tasks, expensive for complex:

```typescript
function selectModel(complexity: 'simple' | 'medium' | 'complex') {
  const models = {
    simple: 'anthropic/claude-3-haiku',
    medium: 'anthropic/claude-3-sonnet',
    complex: 'anthropic/claude-3.5-sonnet',
  };

  return models[complexity];
}

async function optimizedChat(message: string, complexity: 'simple' | 'medium' | 'complex') {
  const model = selectModel(complexity);

  const completion = await openrouter.chat.completions.create({
    model,
    messages: [{ role: 'user', content: message }],
  });

  return completion.choices[0].message.content;
}
```

### Pattern: Rate Limiting

Prevent excessive API usage:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

async function rateLimitedChat(userId: string, message: string) {
  const { success } = await ratelimit.limit(userId);

  if (!success) {
    throw new Error('Rate limit exceeded');
  }

  return await chat(message);
}
```

## Error Handling

```typescript
async function robustChat(message: string) {
  try {
    const completion = await openrouter.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      models: [
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4-turbo',
        'google/gemini-pro',
      ],
      route: 'fallback',
      messages: [{ role: 'user', content: message }],
    });

    return {
      success: true,
      response: completion.choices[0].message.content,
      model: completion.model,
    };
  } catch (error) {
    if (error.status === 429) {
      // Rate limited
      return { success: false, error: 'Rate limit exceeded' };
    } else if (error.status === 402) {
      // Payment required
      return { success: false, error: 'Insufficient credits' };
    } else {
      // Other errors
      return { success: false, error: 'AI request failed' };
    }
  }
}
```

## Common Pitfalls

### Pitfall 1: Not Using Fallbacks
❌ **Wrong:** Single model without fallback
✅ **Correct:** Always specify fallback models

### Pitfall 2: Exposing API Key
❌ **Wrong:** Using OpenRouter directly from client
✅ **Correct:** Call through Supabase Edge Functions

### Pitfall 3: No Caching
❌ **Wrong:** Making identical requests repeatedly
✅ **Correct:** Cache responses with Redis

### Pitfall 4: Ignoring Costs
❌ **Wrong:** Always using most expensive models
✅ **Correct:** Use appropriate model for task complexity

## References

- **Dev Tools**: https://openrouter.ai/docs/sdks/dev-tools/devtools
- **Call Model**: https://openrouter.ai/docs/sdks/call-model/overview
- **Auto Selection**: https://openrouter.ai/docs/guides/routing/auto-model-selection
- **Fallbacks**: https://openrouter.ai/docs/guides/routing/model-fallbacks
- **Plugins**: https://openrouter.ai/docs/guides/features/plugins/overview
- **Skills Loader**: https://openrouter.ai/docs/sdks/call-model/examples/skills-loader
- **Embeddings**: https://openrouter.ai/docs/sdks/typescript/embeddings#errors
- **Parameters**: https://openrouter.ai/docs/sdks/typescript/parameters

---

**Last Updated**: 2025-12-31
