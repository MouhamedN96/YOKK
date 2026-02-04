# Hugging Face Integration Plan for YOKK/Bo AI

**Document Version:** 1.0  
**Created:** 2026-02-04  
**Status:** PENDING APPROVAL  
**Author:** v0 AI Assistant  

---

## Executive Summary

This document outlines the plan to integrate Hugging Face models into YOKK's Bo AI system using **Option B: Free HF Inference API with alternative models**.

### Target Models
| Role | Original Request | Alternative (Free API) | Reason |
|------|------------------|------------------------|--------|
| Primary Bo AI | `Qwen/Qwen3-Omni-30B-A3B-Thinking` | `Qwen/Qwen2.5-72B-Instruct` | Original requires dedicated endpoints (~$2-4/hr) |
| Audio/Comments Fallback | `LiquidAI/LFM2-Audio-1.5B` | `mistralai/Mistral-7B-Instruct-v0.2` | Original has custom architecture not on free API |

### Future Upgrade Path
When budget allows, upgrade to dedicated Hugging Face Inference Endpoints for the original models.

---

## Current System State

### Repository Health
| Component | Status | Notes |
|-----------|--------|-------|
| Deployment | READY | Previous fixes applied (PowerSync connector, auth hook) |
| Supabase Integration | CONNECTED | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY` available |
| Groq Integration | CONNECTED | `GROQ_API_KEY` available |
| HuggingFace Integration | PARTIAL | `Huggingface_Yokk` env var exists (need to verify key name) |
| Vercel Blob | CONNECTED | `BLOB_READ_WRITE_TOKEN` available |
| Upstash Redis | CONNECTED | `KV_URL`, `REDIS_URL` available |

### Current AI Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    lib/ai/hybrid-router.ts                  │
├─────────────────────────────────────────────────────────────┤
│ Tier 1: On-Device (Simulated Qwen 0.6B)                     │
│ Tier 2: Cloud - Groq (Qwen 3 70B)           ✅ Working     │
│ Tier 3: Premium - OpenRouter (Claude 3.5)   ⚠️ No API Key  │
├─────────────────────────────────────────────────────────────┤
│ NEW: Tier 2-HF: HuggingFace (Qwen 2.5 72B)  🔧 To Implement│
│ NEW: Tier 3-HF: HuggingFace (Mistral 7B)    🔧 To Implement│
└─────────────────────────────────────────────────────────────┘
```

### Existing HuggingFace Provider
File: `lib/ai/huggingface-provider.ts` (already created)
- Uses `@huggingface/inference` package
- Has model configs for target models
- Implements streaming and non-streaming text generation
- Has Bo-specific functions: `boCommentSummary`, `boCommentExplain`, `boCommentTranslate`

**Issue Found:** Uses `HUGGINGFACE_API_KEY` but env var is named `Huggingface_Yokk`

---

## Deployment Blockers Identified

### Critical Issues (Must Fix)
1. **Environment Variable Mismatch**
   - Code expects: `HUGGINGFACE_API_KEY`
   - Available: `Huggingface_Yokk`
   - **Fix:** Update code to use correct env var name

2. **HuggingFace Provider Not Connected to Router**
   - `hybrid-router.ts` imports HF functions but doesn't use them in routing
   - `tier2-hf-qwen` and `tier3-hf-audio` tiers defined but route to nothing

3. **Model Availability**
   - `Qwen3-Omni-30B-A3B-Thinking` - NOT on free Inference API
   - `LFM2-Audio-1.5B` - NOT on free Inference API
   - **Fix:** Use alternative models on free API

### Non-Critical Issues (Can Fix Later)
1. OpenRouter API key missing for Claude fallback
2. PowerSync URL not configured (offline mode works fine)
3. PostHog key missing (analytics disabled, app works)

---

## Implementation Plan

### Phase 1: Fix Deployment Blockers
**Priority:** HIGH  
**Estimated Effort:** Small

| Task | File | Change |
|------|------|--------|
| 1.1 | `lib/ai/huggingface-provider.ts` | Update env var from `HUGGINGFACE_API_KEY` to `Huggingface_Yokk` |
| 1.2 | `lib/ai/huggingface-provider.ts` | Update model IDs to use free API alternatives |
| 1.3 | `lib/ai/hybrid-router.ts` | Connect HF tiers to actual HF provider functions |

### Phase 2: Integration Testing
**Priority:** HIGH  
**Estimated Effort:** Medium

| Task | Description |
|------|-------------|
| 2.1 | Create test route `/api/test/hf` to verify HuggingFace connection |
| 2.2 | Test model availability with `checkModelAvailability()` |
| 2.3 | Test streaming response with Bo AI drawer |
| 2.4 | Test fallback behavior when HF fails |

### Phase 3: Bo AI Feature Enhancement
**Priority:** MEDIUM  
**Estimated Effort:** Medium

| Task | Description |
|------|-------------|
| 3.1 | Update Bo system prompt for HF model specifics |
| 3.2 | Implement @bo mention in comments using `boCommentSummary`, etc. |
| 3.3 | Add model selection indicator in UI (which tier is active) |

---

## Technical Specifications

### Environment Variables Required
```env
# Already Available
Huggingface_Yokk=hf_xxxx  # HuggingFace API Token
GROQ_API_KEY=gsk_xxxx     # Groq for fallback

# Optional (for full feature set)
OPENROUTER_API_KEY=sk-xxxx  # For Claude premium tier
NEXT_PUBLIC_POWERSYNC_URL=  # For offline sync (can be empty)
```

### Model Routing Logic
```typescript
// Simplified decision tree
if (isAudioContext) -> tier3-hf-audio (Mistral 7B for quick responses)
if (needsReasoning) -> tier2-hf-qwen (Qwen 2.5 72B)
if (isPremiumQuery) -> tier3-premium (Claude via OpenRouter, if available)
if (isSimpleQuery) -> tier1-local (On-device simulation)
default -> tier2-cloud (Groq Qwen 70B as reliable fallback)
```

### API Response Format
```typescript
// Streaming response (for Bo AI drawer)
POST /api/bo/chat
Content-Type: application/json
Body: { messages: [{ role: "user", content: "..." }] }
Response: text/event-stream

// Non-streaming (for @bo comments)
POST /api/bo/task
Content-Type: application/json
Body: { content: "...", task: "summary" | "translate" | "explain" }
Response: { result: "..." }
```

---

## Testing Strategy

### Unit Tests (TDD Approach)
```typescript
// tests/ai/huggingface.test.ts
describe('HuggingFace Provider', () => {
  it('should connect with valid API key')
  it('should fallback when model unavailable')
  it('should stream tokens correctly')
  it('should format prompts for Qwen chat template')
})
```

### Integration Tests
```typescript
// tests/integration/bo-ai.test.ts
describe('Bo AI Integration', () => {
  it('should route to HuggingFace for reasoning queries')
  it('should fallback to Groq when HF fails')
  it('should handle @bo mentions in comments')
})
```

### Manual Testing Checklist
- [ ] Open Bo AI drawer and send message
- [ ] Verify streaming response works
- [ ] Test with "Think step by step" prompt (should use HF)
- [ ] Test with simple "Hello" (should use local/Groq)
- [ ] Disconnect network and verify offline behavior

---

## Rollback Plan

If HuggingFace integration causes issues:

1. **Quick Disable:** Set `preferHuggingFace = false` in `determineTier()` options
2. **Full Rollback:** Revert to Groq-only by removing HF imports and tier logic
3. **Graceful Degradation:** HF functions already have try/catch with console.error

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Bo AI responds in drawer | Yes |
| Streaming works smoothly | Yes |
| Fallback to Groq works | Yes |
| No deployment errors | Yes |
| @bo comments work | Phase 3 |

---

## Approval Checklist

- [ ] Plan reviewed by user
- [ ] Development approach approved (TDD / Issue-driven / Incremental)
- [ ] Model alternatives accepted
- [ ] Environment variable names confirmed
- [ ] Ready to proceed with Phase 1

---

## Next Steps After Approval

1. Create GitHub Issue: "Integrate HuggingFace models into Bo AI"
2. Create feature branch: `feature/huggingface-integration`
3. Implement Phase 1 fixes
4. Create PR with tests
5. Deploy and verify

---

**Awaiting your approval to proceed. Please confirm:**
1. Is Option B (free API alternatives) acceptable?
2. Which development approach: TDD, Issue-driven, or Incremental?
3. Any changes to the model routing logic?
