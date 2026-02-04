import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
// Env var name matches Vercel integration: Huggingface_Yokk
const hf = new HfInference(process.env.Huggingface_Yokk);

// Model configurations for Bo AI
// Using models available on FREE HuggingFace Inference API
export const HF_MODELS = {
  // PRIMARY: Qwen 2.5 72B Instruct - Best reasoning model on free API
  // Chosen as alternative to Qwen3-Omni-30B (requires paid endpoints)
  PRIMARY: 'Qwen/Qwen2.5-72B-Instruct',
  
  // FALLBACK: Mistral 7B Instruct - Fast, lightweight for comments
  // Chosen as alternative to LFM2-Audio-1.5B (requires paid endpoints)
  FALLBACK: 'mistralai/Mistral-7B-Instruct-v0.2',
  
  // FUTURE: Original models (require HuggingFace Inference Endpoints - paid)
  // QWEN_OMNI_THINKING: 'Qwen/Qwen3-Omni-30B-A3B-Thinking',
  // LFM2_AUDIO: 'LiquidAI/LFM2-Audio-1.5B',
} as const;

// Default model for Bo AI
export const DEFAULT_HF_MODEL = HF_MODELS.PRIMARY;

export type HFModelId = typeof HF_MODELS[keyof typeof HF_MODELS];

// Check if a model is available on Hugging Face Inference API
export async function checkModelAvailability(modelId: string): Promise<boolean> {
  try {
    // Try a simple inference to check availability
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.Huggingface_Yokk}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: 'test' }),
    });
    
    // Model is available if we get 200 or 503 (loading)
    return response.status === 200 || response.status === 503;
  } catch {
    return false;
  }
}

// Generate text using Hugging Face Inference API
export async function generateTextHF(
  prompt: string,
  options: {
    model?: HFModelId;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}
): Promise<string> {
  const {
    model = HF_MODELS.PRIMARY,
    maxTokens = 1024,
    temperature = 0.7,
    systemPrompt,
  } = options;

  try {
    // Format prompt with system message if provided
    const formattedPrompt = systemPrompt 
      ? `<|system|>\n${systemPrompt}<|end|>\n<|user|>\n${prompt}<|end|>\n<|assistant|>\n`
      : prompt;

    const response = await hf.textGeneration({
      model,
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature,
        return_full_text: false,
        do_sample: true,
        top_p: 0.95,
        top_k: 50,
      },
    });

    return response.generated_text;
  } catch (error) {
    console.error(`HuggingFace text generation failed for ${model}:`, error);
    throw error;
  }
}

// Stream text generation using Hugging Face Inference API
export async function* streamTextHF(
  prompt: string,
  options: {
    model?: HFModelId;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}
): AsyncGenerator<string, void, unknown> {
  const {
    model = HF_MODELS.PRIMARY,
    maxTokens = 1024,
    temperature = 0.7,
    systemPrompt,
  } = options;

  // Format prompt with system message if provided
  const formattedPrompt = systemPrompt 
    ? `<|system|>\n${systemPrompt}<|end|>\n<|user|>\n${prompt}<|end|>\n<|assistant|>\n`
    : prompt;

  try {
    const stream = hf.textGenerationStream({
      model,
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature,
        return_full_text: false,
        do_sample: true,
        top_p: 0.95,
        top_k: 50,
      },
    });

    for await (const chunk of stream) {
      if (chunk.token?.text) {
        yield chunk.token.text;
      }
    }
  } catch (error) {
    console.error(`HuggingFace streaming failed for ${model}:`, error);
    throw error;
  }
}

// Create a ReadableStream from HuggingFace streaming response
export function createHFStream(
  prompt: string,
  options: {
    model?: HFModelId;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const text of streamTextHF(prompt, options)) {
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

// Chat completion interface for HuggingFace models
export async function chatCompletionHF(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options: {
    model?: HFModelId;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const { model = HF_MODELS.PRIMARY, maxTokens = 1024, temperature = 0.7 } = options;

  // Extract system prompt if present
  const systemMessage = messages.find(m => m.role === 'system');
  const systemPrompt = systemMessage?.content;

  // Format conversation history
  const conversationHistory = messages
    .filter(m => m.role !== 'system')
    .map(m => `<|${m.role}|>\n${m.content}<|end|>`)
    .join('\n');

  const formattedPrompt = systemPrompt
    ? `<|system|>\n${systemPrompt}<|end|>\n${conversationHistory}\n<|assistant|>\n`
    : `${conversationHistory}\n<|assistant|>\n`;

  return generateTextHF(formattedPrompt, { model, maxTokens, temperature });
}

// Stream chat completion for HuggingFace models
export function streamChatCompletionHF(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options: {
    model?: HFModelId;
    maxTokens?: number;
    temperature?: number;
  } = {}
): ReadableStream<Uint8Array> {
  const { model = HF_MODELS.PRIMARY, maxTokens = 1024, temperature = 0.7 } = options;

  // Extract system prompt if present
  const systemMessage = messages.find(m => m.role === 'system');
  const systemPrompt = systemMessage?.content;

  // Format conversation history
  const conversationHistory = messages
    .filter(m => m.role !== 'system')
    .map(m => `<|${m.role}|>\n${m.content}<|end|>`)
    .join('\n');

  const formattedPrompt = systemPrompt
    ? `<|system|>\n${systemPrompt}<|end|>\n${conversationHistory}\n<|assistant|>\n`
    : `${conversationHistory}\n<|assistant|>\n`;

  return createHFStream(formattedPrompt, { model, maxTokens, temperature });
}

// Bo AI specific functions for comment interactions
export async function boCommentSummary(content: string): Promise<string> {
  const systemPrompt = `You are Bo, the AI assistant for YOKK (Pan-African developer community).
Your task is to provide concise, accurate summaries.
Keep summaries brief (1-3 sentences) and focus on key technical points.
Use language appropriate for African developers.`;

  return generateTextHF(
    `Summarize this content:\n\n${content}`,
    { 
      model: HF_MODELS.PRIMARY,
      systemPrompt,
      maxTokens: 256,
      temperature: 0.5,
    }
  );
}

export async function boCommentExplain(content: string): Promise<string> {
  const systemPrompt = `You are Bo, the AI assistant for YOKK (Pan-African developer community).
Your task is to explain technical concepts in simple terms.
Use analogies familiar to African developers.
Consider low-bandwidth contexts when suggesting solutions.`;

  return generateTextHF(
    `Explain this in simple terms:\n\n${content}`,
    { 
      model: HF_MODELS.PRIMARY,
      systemPrompt,
      maxTokens: 512,
      temperature: 0.6,
    }
  );
}

export async function boCommentTranslate(
  content: string, 
  targetLanguage: string
): Promise<string> {
  const systemPrompt = `You are Bo, the AI assistant for YOKK (Pan-African developer community).
Your task is to translate content accurately while preserving technical meaning.
Adapt expressions to be culturally appropriate for the target language.
Support African languages like French, Wolof, Swahili, Hausa, and Nigerian Pidgin.`;

  return generateTextHF(
    `Translate to ${targetLanguage}:\n\n${content}`,
    { 
      model: HF_MODELS.PRIMARY,
      systemPrompt,
      maxTokens: 512,
      temperature: 0.4,
    }
  );
}
