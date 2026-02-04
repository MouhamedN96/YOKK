import { NextRequest, NextResponse } from 'next/server';
import { 
  HF_MODELS, 
  checkModelAvailability,
  generateTextHF 
} from '@/lib/ai/huggingface-provider';
import { determineTier, MODEL_CONFIG } from '@/lib/ai/hybrid-router';

export const runtime = 'edge';

/**
 * HuggingFace Integration Test Endpoint
 * 
 * GET /api/test/hf - Returns integration status
 * POST /api/test/hf - Tests text generation
 */

export async function GET() {
  const hasApiKey = !!process.env.Huggingface_Yokk;
  
  // Check model availability
  const modelChecks = await Promise.all([
    checkModelAvailability(HF_MODELS.PRIMARY),
    checkModelAvailability(HF_MODELS.FALLBACK),
  ]);

  return NextResponse.json({
    status: 'HuggingFace Integration Status',
    timestamp: new Date().toISOString(),
    config: {
      apiKeyConfigured: hasApiKey,
      envVarName: 'Huggingface_Yokk',
    },
    models: {
      primary: {
        id: HF_MODELS.PRIMARY,
        available: modelChecks[0],
        purpose: 'Main Bo AI (reasoning, complex queries)',
      },
      fallback: {
        id: HF_MODELS.FALLBACK,
        available: modelChecks[1],
        purpose: 'Fast responses (comments, summaries)',
      },
    },
    routing: {
      primaryHF: MODEL_CONFIG.PRIMARY_HF,
      fallbackHF: MODEL_CONFIG.FALLBACK_HF,
      cloudGroq: MODEL_CONFIG.CLOUD_GROQ,
      premiumClaude: MODEL_CONFIG.PREMIUM_CLAUDE,
    },
    tierExamples: {
      simpleQuery: determineTier('hello how are you'),
      reasoningQuery: determineTier('analyze this code step by step'),
      commentQuery: determineTier('summarize this', { isCommentContext: true }),
      premiumQuery: determineTier('design a scalable architecture'),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, model } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.Huggingface_Yokk) {
      return NextResponse.json(
        { error: 'HuggingFace API key not configured' },
        { status: 500 }
      );
    }

    const selectedModel = model === 'fallback' ? HF_MODELS.FALLBACK : HF_MODELS.PRIMARY;
    
    const startTime = Date.now();
    const response = await generateTextHF(prompt, {
      model: selectedModel,
      maxTokens: 256,
      temperature: 0.7,
      systemPrompt: 'You are Bo, the AI assistant for YOKK. Be concise and helpful.',
    });
    const endTime = Date.now();

    return NextResponse.json({
      success: true,
      model: selectedModel,
      prompt,
      response,
      latencyMs: endTime - startTime,
    });
  } catch (error) {
    console.error('HuggingFace test failed:', error);
    return NextResponse.json(
      { 
        error: 'HuggingFace generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
