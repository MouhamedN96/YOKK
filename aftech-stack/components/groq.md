# Groq - Ultra-Fast AI Inference

## Overview

Groq uses Language Processing Units (LPUs) - custom silicon designed specifically for AI inference. It runs open-source models (Llama 3, Mixtral, Gemma) at 18x faster speeds than standard GPUs, at 10x lower cost. For African developers building AI features, Groq makes real-time AI economically viable.

**Key Features:**
- 300+ tokens/second (vs 50-80 on GPUs)
- 10-20x cheaper than proprietary models
- Sub-second Time to First Token (TTFT)
- Open-source model support
- Perfect for voice/streaming interfaces

## When to Use

- Need fast AI responses (voice interfaces, chat)
- Cost-constrained (freemium apps, high volume)
- Want 80% quality at 10% cost
- Building for African markets (cost-sensitive users)
- Require streaming responses

## Why Groq for Africa

### The Speed Advantage

```
Claude 3.5 Sonnet (typical GPU):
- TTFT: 800ms - 1.2s
- Throughput: 50-80 tokens/sec
- User experience: Noticeable delay

Groq Llama 3 70B (LPU):
- TTFT: 100-200ms
- Throughput: 300-500 tokens/sec
- User experience: Feels instant
```

**For voice interfaces (YOKK's "Voice-First"):** The difference between 800ms and 150ms TTFT is the difference between "robotic" and "conversational."

### The Cost Advantage

```
1,000 active users, 50 queries/day:

Claude 3.5 Sonnet:
- 50K queries × 500 tokens avg = 25M tokens
- 25M × $3/1M input = $75/day
- Monthly: $2,250

Groq Llama 3 70B:
- Same 25M tokens
- 25M × $0.59/1M input = $14.75/day
- Monthly: $442

Savings: 80% reduction
```

## Installation

```bash
npm install groq-sdk
```

## Setup

```typescript
import Groq from 'groq-sdk';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});
```

## Core Patterns

### Pattern 1: Basic Chat Completion

```typescript
async function chat(userMessage: string) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a helpful assistant for African developers.' },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0].message.content;
}
```

### Pattern 2: Streaming (Critical for UX)

```typescript
async function* streamChat(userMessage: string) {
  const stream = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
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
for await (const token of streamChat('Explain React hooks')) {
  process.stdout.write(token); // User sees tokens appear instantly
}
```

### Pattern 3: Function Calling (Tools)

```typescript
const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_tech_news',
      description: 'Get latest African tech news',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['startup', 'fintech', 'policy'] },
          country: { type: 'string' },
        },
        required: ['category'],
      },
    },
  },
];

async function chatWithTools(userMessage: string) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [{ role: 'user', content: userMessage }],
    tools,
  });

  const message = completion.choices[0].message;

  if (message.tool_calls) {
    for (const toolCall of message.tool_calls) {
      if (toolCall.function.name === 'get_tech_news') {
        const args = JSON.parse(toolCall.function.arguments);
        const news = await getTechNews(args);
        // Return results to model
      }
    }
  }

  return message.content;
}
```

### Pattern 4: JSON Mode (Structured Output)

```typescript
async function extractData(text: string) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'Extract startup information as JSON: {name, country, funding, sector}',
      },
      { role: 'user', content: text },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content);
}
```

## Model Selection

### Llama 3.1 8B (Fast & Cheap)

**Use for:**
- Simple queries: "What is React?"
- Summarization: "Summarize this article"
- Classification: "Is this spam?"
- Code formatting

**Speed:** 500+ tokens/sec
**Cost:** $0.05/1M input tokens

### Llama 3.1 70B (Balanced)

**Use for:**
- Complex reasoning: "Debug this code"
- Detailed explanations
- Code generation
- Most production use cases

**Speed:** 300+ tokens/sec
**Cost:** $0.59/1M input tokens

### Llama 3.1 405B (Maximum Intelligence)

**Use for:**
- Expert-level reasoning
- Complex code architecture
- When you need GPT-4 quality at lower cost

**Speed:** 100-150 tokens/sec
**Cost:** $2.80/1M input tokens (still cheaper than Claude!)

## Integration with Aftech-Stack

### The Hybrid AI Router (CRITICAL Pattern)

For African apps, use Groq for 80% of queries, escalate to Claude for 20%:

```typescript
async function intelligentChat(userMessage: string) {
  // Step 1: Classify query complexity (using fast Groq 8B)
  const classification = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'Classify query complexity: simple, moderate, complex. Respond with one word.',
      },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 10,
  });

  const complexity = classification.choices[0].message.content.toLowerCase();

  // Step 2: Route to appropriate model
  if (complexity === 'simple') {
    // Handle with Groq 8B (cheapest, fastest)
    return await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: userMessage }],
    });
  } else if (complexity === 'moderate') {
    // Handle with Groq 70B (balanced)
    return await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: userMessage }],
    });
  } else {
    // Escalate to Claude 3.5 Sonnet (premium)
    return await openrouter.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: userMessage }],
    });
  }
}
```

**Result:** 80% handled by Groq, 20% by Claude → 70-80% cost reduction

### With Upstash Redis (Caching)

```typescript
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

async function cachedGroqChat(userMessage: string) {
  const cacheKey = `groq:${createHash('sha256').update(userMessage).digest('hex')}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return cached as string;

  // Call Groq
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [{ role: 'user', content: userMessage }],
  });

  const response = completion.choices[0].message.content;

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, response);

  return response;
}
```

### With Supabase Edge Functions

```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Groq from 'https://esm.sh/groq-sdk@0.3.1';

serve(async (req) => {
  const groq = new Groq({
    apiKey: Deno.env.get('GROQ_API_KEY'),
  });

  const { message } = await req.json();

  const stream = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [{ role: 'user', content: message }],
    stream: true,
  });

  // Stream to client
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
});
```

### With React Native (Voice Interface)

```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

function VoiceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  async function sendMessage(text: string) {
    setIsStreaming(true);

    // Call Supabase Edge Function (which uses Groq)
    const { data } = await supabase.functions.invoke('ai-chat', {
      body: { message: text },
    });

    setMessages([...messages, { role: 'user', content: text }, { role: 'assistant', content: data }]);
    setIsStreaming(false);
  }

  return <ChatInterface messages={messages} onSend={sendMessage} loading={isStreaming} />;
}
```

## Best Practices

1. **Use Streaming**: Always stream for real-time feel
2. **Cache Aggressively**: Identical queries = free responses
3. **Start with 8B**: Escalate to 70B/405B only when needed
4. **Monitor Latency**: Groq should feel instant (<200ms TTFT)
5. **Hybrid Routing**: Use Groq for volume, Claude for quality

## Cost Optimization for African Context

### YOKK Example (Real Numbers)

```
Scenario: 10,000 MAU, 50 AI queries/day average

All-Claude approach:
- 500K queries/day × 500 tokens = 250M tokens/day
- 250M × $3/1M = $750/day = $22,500/month
- Unsustainable for freemium app

Hybrid (Groq + Claude):
- 80% on Groq 70B: 400K queries × 500 tokens = 200M tokens/day
  Cost: 200M × $0.59/1M = $118/day
- 20% on Claude: 100K queries × 500 tokens = 50M tokens/day
  Cost: 50M × $3/1M = $150/day
- Total: $268/day = $8,040/month

Savings: 64% reduction

With aggressive caching (50% cache hit rate):
- Effective queries: 250K/day
- Groq: 200K × $0.59/1M = $59/day
- Claude: 50K × $3/1M = $75/day
- Total: $134/day = $4,020/month

Final savings: 82% vs all-Claude
```

## Common Pitfalls

### Pitfall 1: Not Streaming
❌ **Wrong:** Wait for full response before showing user
✅ **Correct:** Stream tokens as they arrive

### Pitfall 2: Using 405B for Everything
❌ **Wrong:** Default to largest model
✅ **Correct:** Start with 8B, escalate if needed

### Pitfall 3: No Caching
❌ **Wrong:** Re-compute identical queries
✅ **Correct:** Cache with Redis (50% hit rate = 50% cost savings)

## Voice Interface Optimization

For YOKK's "Voice-First" strategy:

```typescript
// Real-time voice → AI → voice pipeline
async function voiceToVoiceChat(audioBlob: Blob) {
  // 1. Transcribe (Groq Whisper - fast, cheap)
  const formData = new FormData();
  formData.append('file', audioBlob);

  const transcription = await groq.audio.transcriptions.create({
    file: formData.get('file') as File,
    model: 'whisper-large-v3',
  });

  // 2. Chat (Groq Llama 3 - streaming)
  const stream = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [{ role: 'user', content: transcription.text }],
    stream: true,
  });

  // 3. Stream response to user in real-time
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      // Display text immediately
      displayText(text);
    }
  }
}
```

**Total latency:** <500ms from speaking to seeing response

## References

- **Overview**: https://console.groq.com/docs/overview
- **API Reference**: https://console.groq.com/docs/api-reference#chat-create
- **Cookbook**: https://github.com/groq/groq-api-cookbook

---

**Last Updated**: 2025-12-31
**African Optimization**: CRITICAL for AI cost economics
**YOKK Validation**: Core of hybrid AI strategy
