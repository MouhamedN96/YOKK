# YOKK Unified Architecture Documentation

## Overview

This document describes how the scattered components of the YOKK project have been unified into a cohesive, African-optimized architecture. The system integrates multiple technologies and approaches to create a unified platform for African developers.

## Architecture Layers

### 1. Presentation Layer
- **Next.js 15** with App Router
- **React Server Components** for performance
- **TailwindCSS** with "Sunset over Dakar" design system
- **Framer Motion** for smooth animations
- **Responsive Design** optimized for mobile-first

### 2. Business Logic Layer
- **YOKK Unified System** - Central integration point
- **Package Harmonizer** - Ensures consistency across modules
- **Feature Managers** - Orchestrates specific functionality

### 3. Data Layer
- **Supabase** - PostgreSQL backend with auth and real-time
- **PowerSync** - Offline-first sync with local SQLite
- **Cloudflare R2** - Zero-egress storage for media

### 4. AI Layer
- **3-Tier AI Router**:
  - Tier 1: On-device Qwen 0.6B INT4
  - Tier 2: Qwen 3 32B on Groq
  - Tier 3: Claude Sonnet 4 for complex reasoning

### 5. Infrastructure Layer
- **PWA** - Progressive Web App with offline capabilities
- **Service Workers** - Background sync and caching
- **Network Resilience** - Retry patterns for unstable connections

## Unified Components

### Core Integration Points

#### 1. YOKK Unified System (`lib/yokk-unified-system.ts`)
This is the central orchestration layer that brings together all components:

```typescript
// Initializes and manages all subsystems:
- PowerSync with African optimizations
- AI Router with 3-tier architecture  
- Media optimization (Opus/AVIF)
- Authentication (WhatsApp/Passkeys)
- PWA enhancements
- Network resilience
- Cloudflare R2 storage
```

#### 2. Package Harmonizer (`lib/harmony/package-harmonizer.ts`)
Ensures consistency across all modules with unified configuration and standardized interfaces.

#### 3. Enhanced PowerSync (`lib/powersync/enhanced-client.ts`)
Extends basic PowerSync with African market optimizations:
- Network resilience for unstable connections
- Memory management for low-end devices
- Batch processing for data efficiency

#### 4. 3-Tier AI Router (`lib/ai/hybrid-router.ts`)
Intelligent routing system that selects the optimal AI model based on query complexity and user context.

#### 5. African Authentication (`lib/auth/african-auth.ts`)
Authentication system optimized for African market with WhatsApp Auth and Passkeys.

#### 6. Media Optimizer (`lib/media/optimizer.ts`)
Handles Opus audio and AVIF image optimization for data efficiency.

#### 7. PWA Optimizer (`lib/pwa/african-pwa-optimizer.ts`)
PWA enhancements specifically for African network conditions and devices.

#### 8. Background Sync (`lib/sync/background-sync-manager.ts`)
Robust offline-first sync with Paystack-style retry patterns.

#### 9. Cloudflare R2 Integration (`lib/storage/cloudflare-r2.ts`)
Zero-egress storage solution for viral content and media.

## African Optimization Features

### 1. Data Efficiency
- **Opus Audio**: 100x smaller than WAV, 10x smaller than MP3
- **AVIF Images**: 95% smaller than JPEG while maintaining quality
- **Bandwidth-Conscious**: Optimized for expensive data plans

### 2. Network Resilience
- **Extended Timeouts**: Accommodating slower network speeds
- **Exponential Backoff**: Retry logic for unstable connections
- **Offline-First**: Full functionality without internet

### 3. Device Optimization
- **Memory Management**: Optimized for 1-2GB RAM devices
- **Bundle Size**: <80KB for fast parsing on low-end devices
- **Performance**: Optimized for MediaTek and other budget processors

### 4. Cost Optimization
- **Tiered AI**: Cost-effective model selection
- **Zero-Egress Storage**: Cloudflare R2 eliminates bandwidth costs
- **Efficient Sync**: Minimized data transfer between local and remote

## Integration Patterns

### 1. Service Registration Pattern
All services are registered and managed through the YOKK Unified System, ensuring consistent initialization and lifecycle management.

### 2. Feature Flags System
African market optimizations are controlled through feature flags that can be adjusted based on user demographics and network conditions.

### 3. Fallback Chain
Each component has a fallback chain to ensure functionality even when primary services are unavailable:
- AI: On-device → Cloud Groq → Premium Claude
- Storage: R2 → Fallback → Local
- Auth: WhatsApp → Passkeys → Email/Phone

### 4. Event-Driven Architecture
Components communicate through events, allowing for loose coupling while maintaining coordination.

## Performance Metrics

### African Market Targets
- **Database Latency**: <50ms (edge databases)
- **AI TTFT**: <200ms (conversational feel)
- **Bundle Size**: <80KB (fast parsing)
- **Session Data**: <10MB (affordable for users)
- **Install Size**: <5MB (90% completion rate)

### Cost Targets (per user/month)
- **Strategy A (Bootstrap)**: $0.40/user
- **Database**: Turso embedded/edge ($0-15/month)
- **AI**: Groq hybrid + cache ($134/day for 10K MAU)
- **Storage**: Cloudflare R2 ($0.75/month)

## Security Measures

### 1. Defense in Depth
- Row-level security on Supabase
- SQLCipher encryption for local database
- Edge proxies for API key protection
- Input validation and sanitization

### 2. Privacy by Design
- On-device AI processing for sensitive queries
- Local data storage with selective sync
- Minimal data collection

## Deployment Architecture

### Recommended Setup
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   YOKK Web App  │────│   Supabase       │────│   PowerSync     │
│   (Vercel)      │    │   (PostgreSQL)   │    │   (Sync)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                        │
         │              ┌────────▼────────┐               │
         │              │  Cloudflare R2  │               │
         │              │  (Zero Egress)  │               │
         │              └─────────────────┘               │
         │                                              │
         └────────────────── Groq AI ────────────────────┘
```

## Development Workflow

### Local Development
1. Initialize the unified system through `getYOKKSystem()`
2. All components will be automatically coordinated
3. Feature flags control African optimizations
4. Mock services available for offline development

### Testing Strategy
1. Unit tests for individual components
2. Integration tests for unified workflows
3. Performance tests on African network profiles
4. Device testing on low-end hardware simulators

## Maintenance & Evolution

### Modular Design
Each component can be updated independently while maintaining compatibility with the unified system.

### Extensibility Points
- New AI models can be added to the tiered router
- Additional storage backends can be integrated
- Authentication providers can be extended
- Network resilience patterns can be enhanced

## Migration Path

### From Scattered Components to Unified Architecture
1. **Phase 1**: Introduce YOKK Unified System as orchestrator
2. **Phase 2**: Migrate individual services to unified configuration
3. **Phase 3**: Implement cross-service coordination
4. **Phase 4**: Optimize for African market requirements

## Conclusion

The YOKK Unified Architecture successfully consolidates the scattered components into a cohesive, African-optimized platform. The system maintains modularity while ensuring tight integration where needed, providing both flexibility and consistency. The architecture is designed to scale while maintaining the core principles of data efficiency, network resilience, and device optimization that are essential for the African market.