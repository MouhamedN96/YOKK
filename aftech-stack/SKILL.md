---
name: aftech-stack
description: Use when building modern web/mobile applications optimized for African markets (expensive data, high latency, low-end devices, unreliable networks). Covers React Native, Next.js, PowerSync, Supabase, Turso, Groq, cost optimization strategies, media compression, network resilience, and PWA patterns for African constraints. Use when user mentions African app, offline-first, budget constraints, data costs, low-end devices, emerging markets, cost optimization, bootstrap startup, freemium model, or technologies like Opus audio, AVIF images, edge databases, fast AI inference.
---

# Aftech-Stack - Modern African Tech Stack

A comprehensive skill system for building offline-first, AI-powered applications optimized for African market constraints.

## When to Use This Skill

Activate this skill when the user is:
- Building apps for African markets or emerging economies
- Concerned about data costs, bandwidth, or network reliability
- Targeting low-end devices (1-2GB RAM, MediaTek processors)
- Building offline-first or local-first applications
- Optimizing costs for bootstrap/freemium models
- Implementing voice interfaces or AI features on a budget
- Using React Native, Next.js, Supabase, or similar modern stack
- Asking about: PWA, cost optimization, media compression, network resilience

## Core Philosophy

**African Optimization = Global Best Practices**
- Offline-first architecture
- Aggressive cost optimization
- Bandwidth minimization
- Network resilience
- Progressive enhancement

These aren't "African compromises" - they're engineering excellence that benefits users worldwide.

## Architecture Overview

### Technology Stack

**Frontend:**
- React Native + Expo (mobile)
- Next.js 15 + App Router (web)
- TypeScript (full stack)
- TailwindCSS + NativeWind (styling)

**Backend:**
- Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- Turso (LibSQL edge-distributed database)
- Cloudflare Workers (edge compute)

**Data Layer:**
- PowerSync (offline-first SQLite sync)
- Upstash Redis (edge caching)
- Cloudflare R2 (zero-egress storage)

**AI/ML:**
- Groq (LPU-based ultra-fast inference)
- OpenRouter (multi-model routing)
- Hybrid AI router (80% Groq, 20% Claude)

## Quick Start: Architecture Decision Guide

When user asks about architecture, guide them through these questions:

### 1. Database Strategy

**Ask:** "What's your user base and query pattern?"

**Options:**
- **<10K MAU, simple queries** → Supabase Free (PostgreSQL)
- **10K-100K MAU, cost-sensitive** → Turso (edge SQLite)
- **Need offline-first** → PowerSync + Supabase
- **Complex queries, funded** → Supabase Pro
- **Best balance** → Hybrid (Supabase + Turso)

See [components/turso.md](components/turso.md) for implementation details.

### 2. AI Strategy

**Ask:** "What's your AI usage and budget?"

**Options:**
- **Voice/streaming interfaces** → Groq (150ms TTFT)
- **Complex reasoning** → Claude 3.5 Sonnet
- **Bootstrap/high volume** → Groq hybrid router (82% cost savings)
- **Simple tasks** → Groq Llama 3.1 8B

See [components/groq.md](components/groq.md) for hybrid routing patterns.

### 3. Cost Optimization Strategy

**Ask:** "What's your budget and ARPU?"

**Options:**
- **Strategy A+** (<$0.04/user): NGO, free service, massive scale
- **Strategy A** ($0.40/user): Bootstrap, freemium, pre-revenue
- **Strategy B** ($0.81/user): Funded startup, balanced approach
- **Strategy C** ($2.31/user): Enterprise, premium SaaS

See [components/cost-optimization.md](components/cost-optimization.md) for detailed strategy selection.

### 4. Media Strategy

**Ask:** "Do you handle voice messages or photos?"

**Optimizations:**
- **Voice** → Opus codec (100x compression vs WAV)
- **Photos** → AVIF format (95% smaller than JPEG)
- **Progressive loading** → WhatsApp pattern
- **Lazy loading** → FlashList for lists

See [components/media-optimization.md](components/media-optimization.md) for implementation.

### 5. Network Strategy

**Ask:** "How reliable is your users' network?"

**Patterns:**
- **Retry with exponential backoff** → Handle packet loss
- **Request queuing** → Paystack pattern
- **Service Worker sync** → Background operations
- **Optimistic UI** → Instant feedback

See [components/network-resilience.md](components/network-resilience.md) for patterns.

### 6. App Distribution

**Ask:** "How important is install friction?"

**Options:**
- **PWA first** → 800KB install, 90% completion (recommended)
- **Native app** → 50-200MB, 40-60% completion
- **Hybrid** → PWA + optional native for power users

See [components/pwa-optimization.md](components/pwa-optimization.md) for PWA setup.

## Using the Components

Each component provides:
1. **Overview** - What it is and why it matters for Africa
2. **When to Use** - Decision criteria
3. **Implementation** - Production-ready code examples
4. **Best Practices** - Dos and don'ts
5. **Real-world Examples** - Validation from African companies
6. **Common Pitfalls** - What to avoid

### Available Components

Read these files when implementing specific features:

- **[components/groq.md](components/groq.md)** - Ultra-fast AI inference (Groq LPU)
- **[components/turso.md](components/turso.md)** - Edge SQLite database
- **[components/cost-optimization.md](components/cost-optimization.md)** - Strategy-based cost optimization
- **[components/media-optimization.md](components/media-optimization.md)** - Opus audio, AVIF images
- **[components/network-resilience.md](components/network-resilience.md)** - Retry patterns, queuing
- **[components/pwa-optimization.md](components/pwa-optimization.md)** - Progressive Web Apps

### Reference Documents

- **[AFRICAN-BENCHMARK.md](AFRICAN-BENCHMARK.md)** - Cost/performance benchmarks
- **[AFRICAN-GAPS.md](AFRICAN-GAPS.md)** - Gap analysis and validation
- **[examples/auth-flow.md](examples/auth-flow.md)** - Complete auth implementation

## Key Benchmarks (Quick Reference)

From [AFRICAN-BENCHMARK.md](AFRICAN-BENCHMARK.md):

**Cost per user (10K MAU):**
- Strategy A+: $0.04/month
- Strategy A: $0.40/month
- Strategy B: $0.81/month
- Strategy C: $2.31/month

**User data cost:**
- Unoptimized: $28.75/month
- Optimized: $0.98/month (97% reduction)

**AI costs (250M tokens):**
- All Claude: $22,500/month
- Groq hybrid + cache: $4,020/month (82% savings)

**Latency from Africa:**
- Supabase (US): 180ms
- Turso (Johannesburg): 50ms
- Embedded database: 0ms

**Install size:**
- Native app: 50-200MB
- PWA: 0.8MB (250x smaller)

## Workflow: Building a New Feature

1. **Read relevant component docs** - Use Read tool on specific .md files
2. **Choose appropriate strategy** - Based on budget/constraints
3. **Implement with best practices** - Follow code examples
4. **Optimize for African context** - Apply compression, caching, resilience
5. **Validate against benchmarks** - Compare to targets in AFRICAN-BENCHMARK.md

## Progressive Disclosure

**Don't read all files upfront** - this skill system uses progressive disclosure:

1. Start with this SKILL.md (overview)
2. Read specific component when implementing that feature
3. Reference AFRICAN-BENCHMARK.md for cost/performance validation
4. Use examples/ directory for complete implementations

Each component is self-contained with all necessary implementation details.

## Example Interactions

**User:** "I'm building a voice messaging app for Nigeria. What stack should I use?"

**Response:**
1. Read [components/groq.md](components/groq.md) - Fast AI for voice transcription
2. Read [components/media-optimization.md](components/media-optimization.md) - Opus codec for voice
3. Read [components/network-resilience.md](components/network-resilience.md) - Handle unreliable networks
4. Recommend: React Native + Expo, Groq for transcription, Opus audio, Service Worker sync
5. Show cost projection from AFRICAN-BENCHMARK.md

**User:** "How do I reduce my database costs?"

**Response:**
1. Read [AFRICAN-BENCHMARK.md](AFRICAN-BENCHMARK.md) - Database cost comparison table
2. Read [components/turso.md](components/turso.md) - Edge SQLite implementation
3. Show hybrid approach: Supabase + Turso for 87% savings
4. Provide migration code examples

**User:** "My app uses too much data. How do I optimize?"

**Response:**
1. Read [components/media-optimization.md](components/media-optimization.md) - Opus, AVIF compression
2. Read [AFRICAN-BENCHMARK.md](AFRICAN-BENCHMARK.md) - User data cost impact section
3. Show: 97% data reduction (28.75MB → 0.98MB per month)
4. Implement progressive loading, lazy loading patterns

## Important Notes

- **Always quantify impact** - Use numbers from AFRICAN-BENCHMARK.md
- **Provide real examples** - Reference Wave, Paystack, WhatsApp patterns
- **Show cost comparisons** - Help users make informed decisions
- **Validate with benchmarks** - Ensure recommendations meet African targets
- **Progressive implementation** - Don't over-engineer, start simple

## Success Criteria

An implementation using this skill should achieve:

✅ **Cost**: <$0.50/user/month for bootstrap apps
✅ **Performance**: <500ms API latency from Africa
✅ **Reliability**: Works on 3G with 2-5% packet loss
✅ **Storage**: <50MB memory footprint
✅ **Data**: <10MB per session
✅ **Install**: <5MB download size (preferably PWA)

If not meeting these targets, refer to specific component docs for optimization patterns.

---

**Version**: 2.0.0 (African Optimization Focus)
**Last Updated**: 2025-12-31
**Maintainable**: Yes - this is a living skill system
