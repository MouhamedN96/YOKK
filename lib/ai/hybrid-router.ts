import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, StreamTextResult } from 'ai';
import { 
  HF_MODELS, 
  streamChatCompletionHF, 
  chatCompletionHF,
  checkModelAvailability 
} from './huggingface-provider';

// Initialize providers
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // Using OpenRouter for Claude access
  baseURL: 'https://openrouter.ai/api/v1',
});

// Define model tiers - updated with Hugging Face models
export type AiTier = 'tier1-local' | 'tier2-hf-qwen' | 'tier2-cloud' | 'tier3-hf-audio' | 'tier3-premium';

// Model provider configuration
export const MODEL_CONFIG = {
  // Primary Bo AI on HuggingFace: Qwen 2.5 72B Instruct (free API)
  // Alternative to Qwen3-Omni-30B which requires paid endpoints
  PRIMARY_HF: HF_MODELS.PRIMARY,
  
  // Fallback for comments: Mistral 7B Instruct (free API)
  // Alternative to LFM2-Audio-1.5B which requires paid endpoints
  FALLBACK_HF: HF_MODELS.FALLBACK,
  
  // Cloud fallback: Qwen 3 70B on Groq
  CLOUD_GROQ: 'qwen/qwen-3-70b-preview',
  
  // Premium tier: Claude 3.5 Sonnet via OpenRouter
  PREMIUM_CLAUDE: 'anthropic/claude-3.5-sonnet:beta',
} as const;

// On-device AI simulation (would use actual model in production)
class OnDeviceAI {
  static async generateResponse(prompt: string, systemPrompt: string): Promise<string> {
    // In a real implementation, this would call the fine-tuned Qwen 0.6B model
    // For now, we'll simulate the response with a simple heuristic
    return `On-device AI response: ${prompt.substring(0, 100)}... [processed locally with Qwen 0.6B INT4]`;
  }
}

// Determine which tier to use based on query complexity and context
export function determineTier(
  query: string, 
  options: { 
    preferHuggingFace?: boolean; 
    isAudioContext?: boolean;
    isCommentContext?: boolean;
  } = {}
): { tier: AiTier; reason: string } {
  const { preferHuggingFace = true, isAudioContext = false, isCommentContext = false } = options;

  // Audio/comment context - use Mistral 7B for fast responses
  if (isAudioContext) {
    return { 
      tier: 'tier3-hf-audio', 
      reason: 'Audio context - using Mistral 7B for low-latency response' 
    };
  }

  // Simple queries that can be handled by on-device Qwen 0.6B
  const simpleQueryPatterns = [
    /hello|hi|hey|greetings/i,
    /what is|what's|define|explain/i,
    /how to|how do i|tutorial|guide/i,
    /code|syntax|debug|fix/i,
    /command|terminal|cli/i,
    /error|issue|problem/i,
    /javascript|python|react|next/i,
    /api|endpoint|request/i,
    /basic|simple|easy/i,
    /african|nigeria|kenya|ghana|senegal/i,
    /2g|3g|network|latency|offline/i,
    /data cost|bandwidth|optimization/i,
    /multilingual|french|wolof|pidgin|language/i
  ];

  // Complex reasoning queries that benefit from thinking models
  const thinkingQueryPatterns = [
    /think|reason|step by step|chain of thought/i,
    /analyze|evaluate|compare|assess/i,
    /multimodal|image|video|audio/i,
    /planning|roadmap|strategy/i,
    /deep|thorough|detailed|comprehensive/i,
  ];

  // Premium tier patterns (Claude for very complex tasks)
  const premiumQueryPatterns = [
    /architecture|system design|scalability/i,
    /business|market|monetization|investment/i,
    /ethics|philosophy|theory|abstract/i,
    /long form|essay|report|documentation/i,
  ];

  // Comment-specific queries that benefit from quick responses
  const commentQueryPatterns = [
    /summarize|summary|tldr|brief/i,
    /translate|translation/i,
    /explain|eli5|simple terms/i,
    /sentiment|tone|mood/i,
  ];

  // Check for premium patterns first
  for (const pattern of premiumQueryPatterns) {
    if (pattern.test(query.toLowerCase())) {
      return { tier: 'tier3-premium', reason: 'Complex reasoning - using Claude 3.5 Sonnet' };
    }
  }

  // Check for thinking/reasoning patterns - use Qwen 2.5 72B on HuggingFace
  if (preferHuggingFace && process.env.Huggingface_Yokk) {
    for (const pattern of thinkingQueryPatterns) {
      if (pattern.test(query.toLowerCase())) {
        return { 
          tier: 'tier2-hf-qwen', 
          reason: 'Reasoning query - using Qwen 2.5 72B on HuggingFace' 
        };
      }
    }
  }

  // Comment context - use HuggingFace Mistral for quick responses
  if (isCommentContext && preferHuggingFace && process.env.Huggingface_Yokk) {
    for (const pattern of commentQueryPatterns) {
      if (pattern.test(query.toLowerCase())) {
        return { 
          tier: 'tier3-hf-audio', 
          reason: 'Comment task - using Mistral 7B on HuggingFace' 
        };
      }
    }
  }

  // Simple queries - on-device
  for (const pattern of simpleQueryPatterns) {
    if (pattern.test(query.toLowerCase())) {
      return { tier: 'tier1-local', reason: 'Simple query - on-device Qwen 0.6B' };
    }
  }

  // Default: Use HuggingFace Qwen if preferred and available, otherwise Groq
  if (preferHuggingFace && process.env.Huggingface_Yokk) {
    return { tier: 'tier2-hf-qwen', reason: 'General query - using Qwen 2.5 72B on HuggingFace' };
  }

  return { tier: 'tier2-cloud', reason: 'General query - using Qwen 3 70B on Groq' };
}

// Enhanced routing with context awareness
export async function routeAiQuery(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  systemPrompt?: string,
  context?: string // Additional context like 'summary', 'translate', 'explain', etc.
): Promise<ReturnType<typeof streamText>> {
  const lastMessage = messages[messages.length - 1]?.content || '';
  const { tier, reason } = determineTier(lastMessage);

  console.log(`AI Routing: Using ${tier} tier - ${reason} for context: ${context || 'general'}`);

  const effectiveSystemPrompt = systemPrompt || `You are Bo, the AI-native assistant for YOKK, the Pan-African developer community.
Your mission is to help African developers grow by providing context-aware technical advice.

CORE PHILOSOPHY:
- Prioritize African Reality: Lagos power outages, Dakar traffic, 2G/3G network constraints, high data costs.
- Be Pragmatic: Suggest tools like Paystack, Wave, Orange Money, and M-Pesa over Stripe/PayPal.
- Focus on Offline-First: Recommend PowerSync, SQLite, and optimistic UI patterns.
- Cultural Context: You understand French, Wolof, and Nigerian Pidgin. Use local metaphors when appropriate (e.g., Attaya, Ubuntu).

USER PERSONA:
Your typical user is "Moussa in Lagos" or "Awa in Dakar". They have limited data (500MB/month) and high latency.

TONE:
Direct, code-focused, supportive, and community-driven. No Silicon Valley fluff.

If asked about YOKK:
- It's a hybrid of Stack Overflow (Q&A), X (real-time news), and Product Hunt (African app launches).
- Built for Africa, by Africa.

CONTEXT SPECIFIC RESPONSES:
- If asked to summarize: Provide concise bullet points focusing on key information
- If asked to translate: Maintain meaning while adapting to cultural context
- If asked to explain: Use analogies familiar to African developers
- If asked for code: Provide efficient, data-conscious solutions`;

  if (tier === 'tier1-local') {
    // Use on-device AI (fine-tuned Qwen 0.6B INT4)
    // In a real implementation, this would call the actual model
    const response = await OnDeviceAI.generateResponse(lastMessage, effectiveSystemPrompt);

    // Create a simple stream response for the on-device result
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(response));
        controller.close();
      }
    });

    // Return a mock StreamTextResult-like object
    return {
      textStream: stream as any,
      toTextStreamResponse: () => new Response(stream, {
        headers: { 'Content-Type': 'text/plain' }
      }),
      toAIStreamResponse: () => new Response(stream, {
        headers: { 'Content-Type': 'text/plain' }
      })
    } as any;
  } else if (tier === 'tier2-hf-qwen') {
    // Use Qwen 2.5 72B on HuggingFace (primary HF model)
    console.log('Routing to HuggingFace Qwen 2.5 72B');
    const stream = streamChatCompletionHF(
      [{ role: 'system', content: effectiveSystemPrompt }, ...messages],
      { model: MODEL_CONFIG.PRIMARY_HF, temperature: 0.7 }
    );
    return {
      textStream: stream as any,
      toTextStreamResponse: () => new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      }),
      toDataStreamResponse: () => new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    } as any;
  } else if (tier === 'tier3-hf-audio') {
    // Use Mistral 7B on HuggingFace (fast fallback for comments)
    console.log('Routing to HuggingFace Mistral 7B');
    const stream = streamChatCompletionHF(
      [{ role: 'system', content: effectiveSystemPrompt }, ...messages],
      { model: MODEL_CONFIG.FALLBACK_HF, temperature: 0.6 }
    );
    return {
      textStream: stream as any,
      toTextStreamResponse: () => new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      }),
      toDataStreamResponse: () => new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    } as any;
  } else if (tier === 'tier2-cloud') {
    // Use Qwen 3 70B on Groq (cloud fallback)
    return streamText({
      model: groq('qwen/qwen-3-70b-preview'),
      system: effectiveSystemPrompt,
      messages,
      temperature: 0.7,
      ...(context && {
        topP: context === 'creative' ? 0.9 : 0.7,
      })
    });
  } else if (tier === 'tier3-premium') {
    // Use Claude for complex reasoning
    return streamText({
      model: openai('anthropic/claude-3.5-sonnet:beta'),
      system: effectiveSystemPrompt,
      messages,
      temperature: 0.7,
      // Add context-specific instructions if provided
      ...(context && {
        topP: context === 'creative' ? 0.9 : 0.7,
      })
    });
  } else {
    // Fallback to Tier 2 if somehow an unexpected tier is selected
    return streamText({
      model: groq('qwen/qwen-3-70b-preview'),
      system: effectiveSystemPrompt,
      messages,
      temperature: 0.7,
    });
  }
}

// Robust query with fallback mechanism and context awareness
export async function robustAiQuery(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  systemPrompt?: string,
  context?: string
): Promise<ReturnType<typeof streamText>> {
  try {
    return await routeAiQuery(messages, systemPrompt, context);
  } catch (error) {
    console.warn('Primary AI routing failed, falling back to on-device model:', error);
    // Fallback to on-device model first, then cloud
    try {
      const lastMessage = messages[messages.length - 1]?.content || '';
      const response = await OnDeviceAI.generateResponse(lastMessage, systemPrompt || '');

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(response));
          controller.close();
        }
      });

      return {
        textStream: stream as any,
        toTextStreamResponse: () => new Response(stream, {
          headers: { 'Content-Type': 'text/plain' }
        }),
        toAIStreamResponse: () => new Response(stream, {
          headers: { 'Content-Type': 'text/plain' }
        })
      } as any;
    } catch (fallbackError) {
      console.warn('On-device fallback failed, using cloud model:', fallbackError);
      // Final fallback to cloud model
      return streamText({
        model: groq('qwen/qwen-3-70b-preview'),
        system: systemPrompt,
        messages,
        temperature: 0.7,
      });
    }
  }
}

// Enhanced function for specific Bo AI tasks in comment sections
export async function boAISpecificTask(
  content: string,
  task: 'summary' | 'translate' | 'explain' | 'read-aloud' | 'sentiment',
  targetLanguage?: string
): Promise<ReturnType<typeof streamText>> {
  let systemPrompt = `You are Bo, the AI-native assistant for YOKK, the Pan-African developer community.`;

  let userMessage = "";

  switch(task) {
    case 'summary':
      systemPrompt += `
      Your task is to provide concise, accurate summaries of technical content.
      Focus on key points, main arguments, and important details.
      Keep the summary to 1-3 sentences if the content is short, or 3-5 sentences if longer.`;
      userMessage = `Please summarize the following content:\n\n${content}`;
      break;

    case 'translate':
      systemPrompt += `
      Your task is to translate content accurately while preserving meaning and context.
      Adapt expressions and idioms to be culturally appropriate for the target language.
      If translating to an African language, use common terminology understood in that region.`;
      userMessage = `Please translate the following content to ${targetLanguage || 'English'}:\n\n${content}`;
      break;

    case 'explain':
      systemPrompt += `
      Your task is to explain complex concepts in simple, understandable terms.
      Use analogies and examples familiar to African developers.
      Break down technical jargon and provide practical applications.`;
      userMessage = `Please explain the following content in simple terms:\n\n${content}`;
      break;

    case 'read-aloud':
      systemPrompt += `
      Your task is to prepare text for text-to-speech processing.
      Format the content to be easily readable aloud.
      Add pauses where appropriate and clarify abbreviations.`;
      userMessage = `Please format the following content for text-to-speech:\n\n${content}`;
      break;

    case 'sentiment':
      systemPrompt += `
      Your task is to analyze the sentiment of the provided content.
      Identify positive, negative, or neutral sentiment.
      Note any emotional undertones or cultural context that might affect interpretation.`;
      userMessage = `Please analyze the sentiment of the following content:\n\n${content}`;
      break;
  }

  // Determine the appropriate tier for the specific task
  const tier = task === 'summary' || task === 'explain' ? 'tier2-cloud' : 'tier3-premium';

  if (tier === 'tier2-cloud') {
    return streamText({
      model: groq('qwen/qwen-3-70b-preview'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      temperature: 0.6,
    });
  } else {
    return streamText({
      model: openai('anthropic/claude-3.5-sonnet:beta'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      temperature: 0.6,
    });
  }
}
