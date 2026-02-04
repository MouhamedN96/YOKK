# Hugging Face Integration Plan for YOKK/Bo AI

**Document Version:** 1.1  
**Created:** 2026-02-04  
**Last Updated:** 2026-02-04  
**Status:** APPROVED (Option B)  
**Author:** v0 AI Assistant  
**Development Approach:** Issue-Driven Development

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

## Codebase State Analysis

### Project Overview
| Property | Value |
|----------|-------|
| **Name** | yokk-app |
| **Version** | 0.1.0 |
| **Framework** | Next.js 15.1.7 |
| **React** | 19.2.0 |
| **AI SDK** | 6.0.3 |
| **TypeScript** | 5.9.3 |
| **Package Manager** | npm (ESM) |

### File Structure (Key AI/Integration Files)
```
lib/
├── ai/
│   ├── hybrid-router.ts      # Main AI routing logic (294 lines)
│   └── huggingface-provider.ts # HF provider (269 lines, partially implemented)
├── powersync/
│   ├── connector.ts          # Fixed - graceful offline handling
│   ├── client.ts             # Fixed - try/catch for connection
│   ├── Provider.tsx          # React context provider
│   └── schema.ts             # Local DB schema
├── supabase/
│   ├── client.ts             # Browser client
│   ├── server.ts             # Server client
│   └── types.ts              # TypeScript types
app/
├── api/bo/chat/route.ts      # Bo AI endpoint (uses hybrid-router)
├── page.tsx                  # Main page (uses @ai-sdk/react useChat)
└── (main)/                   # Protected routes with AuthProvider
```

### Dependencies Analysis
| Package | Version | Status |
|---------|---------|--------|
| `@ai-sdk/react` | 3.0.3 | Installed, working |
| `@ai-sdk/groq` | 3.0.1 | Installed, working |
| `@ai-sdk/openai` | 3.0.12 | Installed (for OpenRouter) |
| `@huggingface/inference` | 4.13.11 | Installed, needs wiring |
| `ai` | 6.0.3 | Installed, working |

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

## Deployment Status & Blockers

### Current Deployment State
| Check | Status | Notes |
|-------|--------|-------|
| Build | SHOULD PASS | `ignoreBuildErrors: true` in next.config.ts |
| TypeScript | WARNINGS | 24 files with `@ts-ignore` or `any` types |
| Runtime | PARTIAL | HuggingFace won't work due to env var mismatch |

### Critical Issues (MUST FIX before HF works)

#### Issue 1: Environment Variable Mismatch
- **Problem:** Code expects `HUGGINGFACE_API_KEY`, but Vercel has `Huggingface_Yokk`
- **Impact:** HuggingFace provider fails silently
- **File:** `lib/ai/huggingface-provider.ts` line 4
- **Fix:** Change to `process.env.Huggingface_Yokk`

#### Issue 2: HuggingFace Provider Not Connected
- **Problem:** `hybrid-router.ts` imports HF functions but never calls them
- **Impact:** `tier2-hf-qwen` and `tier3-hf-audio` route to Groq fallback, not HF
- **File:** `lib/ai/hybrid-router.ts` lines 185-235
- **Fix:** Add HF routing branches in `routeAiQuery()`

#### Issue 3: Wrong Model IDs
- **Problem:** Using models not available on free Inference API
- **Impact:** 404 errors from HuggingFace
- **File:** `lib/ai/huggingface-provider.ts` lines 7-19
- **Fix:** Update to `Qwen/Qwen2.5-72B-Instruct` and `mistralai/Mistral-7B-Instruct-v0.2`

### Non-Critical Issues (Can Fix Later)
| Issue | Impact | Priority |
|-------|--------|----------|
| `OPENROUTER_API_KEY` missing | Claude premium tier unavailable | LOW |
| `NEXT_PUBLIC_POWERSYNC_URL` missing | Offline mode only (app works) | LOW |
| PostHog key missing | Analytics disabled | LOW |

### Already Fixed (Previous Session)
- PowerSync connector graceful handling
- PowerSync client try/catch for connection
- `useHomeAuth` hook for root page (outside AuthProvider)

---

## Implementation Plan (Issue-Driven)

### GitHub Issues to Create

#### Issue #1: Fix HuggingFace Environment Variable
**Labels:** `bug`, `priority-high`, `ai`
```markdown
## Problem
HuggingFace provider uses wrong env var name.
- Code: `HUGGINGFACE_API_KEY`
- Vercel: `Huggingface_Yokk`

## Acceptance Criteria
- [ ] `lib/ai/huggingface-provider.ts` uses correct env var
- [ ] Connection test passes
```

#### Issue #2: Update HuggingFace Model IDs
**Labels:** `enhancement`, `priority-high`, `ai`
```markdown
## Problem
Current model IDs not available on free HF Inference API.

## Changes
- `Qwen/Qwen3-Omni-30B-A3B-Thinking` -> `Qwen/Qwen2.5-72B-Instruct`
- `LiquidAI/LFM2-Audio-1.5B` -> `mistralai/Mistral-7B-Instruct-v0.2`

## Acceptance Criteria
- [ ] Model configs updated in `huggingface-provider.ts`
- [ ] HF_MODELS export reflects new models
- [ ] `checkModelAvailability()` returns true for new models
```

#### Issue #3: Connect HuggingFace to AI Router
**Labels:** `enhancement`, `priority-high`, `ai`
```markdown
## Problem
`tier2-hf-qwen` and `tier3-hf-audio` defined but not routed to HF.

## Changes
Add HuggingFace routing in `routeAiQuery()`:
- `tier2-hf-qwen` -> `streamChatCompletionHF()` with Qwen model
- `tier3-hf-audio` -> `streamChatCompletionHF()` with Mistral model

## Acceptance Criteria
- [ ] HF tiers route to HuggingFace provider
- [ ] Fallback to Groq works when HF fails
- [ ] Bo AI drawer uses HF for reasoning queries
```

#### Issue #4: Create HuggingFace Test Endpoint
**Labels:** `testing`, `priority-medium`, `ai`
```markdown
## Description
Create `/api/test/hf` endpoint to verify HuggingFace integration.

## Acceptance Criteria
- [ ] Returns model availability status
- [ ] Tests streaming response
- [ ] Returns provider selection info
```

---

### Implementation Phases

#### Phase 1: Fix Critical Blockers (Issues #1-3)
**Priority:** HIGH  
**Branch:** `feature/huggingface-integration`

| Step | File | Change | Issue |
|------|------|--------|-------|
| 1.1 | `lib/ai/huggingface-provider.ts` | Fix env var name | #1 |
| 1.2 | `lib/ai/huggingface-provider.ts` | Update model IDs | #2 |
| 1.3 | `lib/ai/hybrid-router.ts` | Add HF routing logic | #3 |
| 1.4 | Create PR | Review and merge | - |

#### Phase 2: Testing & Verification (Issue #4)
**Priority:** HIGH  

| Step | Description |
|------|-------------|
| 2.1 | Create `/api/test/hf` endpoint |
| 2.2 | Manual test in Bo AI drawer |
| 2.3 | Verify fallback to Groq |
| 2.4 | Deploy to preview |

#### Phase 3: Enhancement (Future)
**Priority:** MEDIUM  

| Task | Description |
|------|-------------|
| 3.1 | Add @bo mention in comments |
| 3.2 | Model indicator in UI |
| 3.3 | Upgrade to dedicated endpoints (when budget allows) |

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

## Approval Status

### Approved Decisions
- [x] **Option B accepted** - Use free API with alternative models
- [x] **Development approach** - Issue-Driven Development
- [x] **Model alternatives** - `Qwen2.5-72B-Instruct` and `Mistral-7B-Instruct-v0.2`

### Pending Confirmation
- [ ] Ready to proceed with Phase 1 implementation?

### Implementation Decision
**Use existing `Huggingface_Yokk` env var** - Update code to match, not rename in Vercel.

---

## Next Steps

1. **Fix env var** - Change `HUGGINGFACE_API_KEY` to `Huggingface_Yokk` in code
2. **Update models** - Use free API alternatives
3. **Wire router** - Make HF tiers actually call HuggingFace
4. **Test** - Verify end-to-end

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-04 | Initial plan created |
| 1.1 | 2026-02-04 | Added codebase analysis, deployment status, issue-driven workflow |
| 1.2 | 2026-02-04 | Synced with actual codebase state, confirmed env var approach |
