# YOKK - AI-Native Developer Platform for Africa

## Project Structure

```
yokk-app/                          # Main Next.js web application
├── aftech-stack/                 # Aftech-stack skills system
│   ├── components/               # Individual tech skills
│   ├── examples/                 # Complete patterns
│   ├── README.md                 # Main documentation
│   ├── SKILL.md                  # Meta-skill with architecture overview
│   ├── SOURCES.md                # All documentation links
│   ├── EXTEND.md                 # Extension guide
│   ├── AFRICAN-BENCHMARK.md      # Cost/performance benchmarks
│   ├── AFRICAN-GAPS.md           # Gap analysis and validation
│   └── EXTEND.md                 # Complete guide for agents to update
├── app/                         # Next.js 15 App Router
│   ├── (main)/                  # Main application layout
│   ├── api/                     # API routes (Bo AI chat, webhooks)
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main landing page
├── components/                  # Reusable UI components
│   ├── comments/
│   ├── layout/
│   ├── posts/
│   ├── ui/
│   └── error-boundary.tsx
├── lib/                         # Business logic and utilities
│   ├── ai/                      # AI utilities and routers
│   ├── auth/                    # Authentication utilities
│   ├── harmony/                 # Package harmonization
│   ├── media/                   # Media optimization
│   ├── performance/             # Performance optimization
│   ├── powersync/               # PowerSync integration
│   ├── pwa/                     # PWA optimization
│   ├── storage/                 # Storage utilities
│   ├── supabase/                # Supabase integration
│   ├── sync/                    # Sync utilities
│   └── utils/                   # General utilities
├── hooks/                       # Custom React hooks
├── public/                      # Static assets
├── supabase/                    # Database schema
├── types/                       # TypeScript type definitions
├── n8n-workflows/              # Automation workflows
├── feat/                       # Feature branches
├── .env.local                  # Environment variables
├── COMPONENT_STRUCTURE.md      # Component structure documentation
├── NAVIGATION_README.md        # Navigation documentation
├── QUICK_START.md              # Quick start guide
├── feeds api.md                # Feeds API documentation
├── ARCHITECT.md                # Architect persona documentation
├── package.json                # Dependencies
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Main project documentation
```

## Unified Architecture Principles

### 1. African Optimization First
- **Offline-First**: PowerSync for local SQLite sync
- **Bandwidth-Conscious**: Opus audio, AVIF images, data optimization
- **Device-Optimized**: Performance for low-end devices (1-2GB RAM)
- **Network-Resilient**: Retry patterns, background sync, optimistic UI

### 2. AI-Native Design
- **3-Tier AI Router**:
  - Tier 1 (Local): Fine-tuned Qwen 0.6B INT4 for on-device processing
  - Tier 2 (Cloud): Qwen 3 32B on Groq for cost-effective processing
  - Tier 3 (Premium): Claude Sonnet 4 for complex reasoning
- **Context-Aware**: Understanding of African market realities
- **Voice-First**: Optimized for voice interfaces with low latency

### 3. Community-Centric
- **Developer-Focused**: Stack Overflow + X + Product Hunt hybrid
- **Gamified**: Levels, XP, streaks, achievements
- **Local-Relevant**: Payment systems (Paystack, Wave, M-Pesa), local context

## Core Integrations

### Database Layer
- **Supabase**: PostgreSQL backend, authentication, real-time features
- **PowerSync**: Offline-first sync with local SQLite
- **Sync Rules**: Bidirectional sync between local and remote

### AI Layer
- **Groq**: Fast AI inference (LPU technology)
- **OpenRouter**: Multi-model routing
- **AI SDK**: Streaming responses
- **Hybrid Router**: Intelligent model selection based on query complexity

### Frontend Stack
- **Next.js 15**: App Router, React Server Components
- **React Native + Expo**: Mobile application (future)
- **TypeScript**: Full type safety
- **TailwindCSS**: Styling with "Sunset over Dakar" design system

## Key Features

### 1. Offline-First Architecture
- Local SQLite database with PowerSync
- Seamless offline experience
- Automatic sync when connectivity is restored
- Data encryption with SQLCipher

### 2. AI Assistant (Bo AI)
- Context-aware coding assistant
- Understanding of African market realities
- Voice interface capabilities
- Offline-capable with online sync

### 3. Community Platform
- Questions & Discussions (like Stack Overflow)
- Product Launches (like Product Hunt)
- Developer Showcases
- Gamification (levels, XP, achievements)

### 4. African-Centric Design
- Optimized for 2G/3G networks
- Low data usage patterns
- Local payment integrations
- Cultural awareness (French, Wolof, Nigerian Pidgin support)

## Development Workflow

### Local Development
```bash
cd yokk-app
npm install
npm run dev
```

### Environment Setup
Copy `.env.local.example` to `.env.local` and fill in the required values:
- Supabase URL and keys
- Groq API key
- PowerSync URL
- N8N webhook secrets

### Building for Production
```bash
npm run build
npm start
```

## Deployment

### Recommended Hosting
- **Vercel**: For Next.js web application
- **Supabase**: For PostgreSQL database and auth
- **Cloudflare**: For CDN and R2 storage
- **N8N**: For automation workflows

### Environment Variables for Production
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_POWERSYNC_URL`
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ACCESS_KEY_ID`
- `CLOUDFLARE_SECRET_ACCESS_KEY`

## Performance Targets

### African Market Optimization
- **Database Latency**: <50ms (using edge databases)
- **AI TTFT**: <200ms (using Groq hybrid router)
- **Bundle Size**: <80KB (for fast device parsing)
- **Session Data**: <10MB (for affordable user costs)
- **Install Size**: <5MB (for 90% completion rate)

### Cost Optimization (per user/month)
- **Strategy A (Bootstrap)**: $0.40/user
- **Database**: Turso embedded/edge ($0-15/month)
- **AI**: Groq hybrid + cache ($134/day for 10K MAU)
- **Storage**: Cloudflare R2 ($0.75/month)

## Security

### Security-First Approach
- **Row-Level Security**: On every Supabase table
- **SQLCipher Encryption**: For local PowerSync database
- **Edge Proxies**: For API key protection
- **Secure Auth**: OAuth and bottom tabs pattern

### Best Practices
- No client-side secrets
- Input validation and sanitization
- Rate limiting and abuse prevention
- Regular security audits

## Testing

### Automated Testing
- Unit tests for business logic
- Integration tests for API routes
- E2E tests for critical user flows
- Performance tests for African network conditions

### Manual Testing
- Device testing on low-end phones
- Network testing on 2G/3G connections
- Localization testing for African languages
- Accessibility testing

## Monitoring & Analytics

### Performance Monitoring
- Page load times
- API response times
- Database query performance
- AI response latencies

### Business Metrics
- User engagement
- Content creation
- Community growth
- Monetization metrics

## Contributing

### Development Guidelines
- Follow the African Optimization principles
- Write tests for new features
- Document breaking changes
- Follow the existing code style

### Pull Request Process
1. Create a feature branch
2. Add your changes with tests
3. Update documentation if needed
4. Submit PR with clear description
5. Get review and approval

## Roadmap

### Phase 1: Foundation
- [x] Next.js 15 web application
- [x] Supabase + PowerSync integration
- [x] AI assistant (Bo AI)
- [x] Community features

### Phase 2: Mobile
- [ ] React Native mobile application
- [ ] Native biometric authentication
- [ ] Push notifications
- [ ] Offline-first mobile experience

### Phase 3: Scale
- [ ] Multi-region deployment
- [ ] Advanced monetization
- [ ] Enterprise features
- [ ] Marketplace functionality

---

**Built with ❤️ for the African developer community.**

Maintained by the YOKK team. Always evolving.