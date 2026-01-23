# Aftech-stack Source References

This file contains all official documentation and reference repositories for the Aftech-stack. Agents can update this list as new resources become available.

## PowerSync

### Documentation
- **React Native & Expo SDK**: https://docs.powersync.com/client-sdk-references/react-native-and-expo
  - Installation, setup, hooks, queries
  - Offline-first patterns
  - Sync configuration

### Announcements
- **SQLCipher Support**: https://releases.powersync.com/announcements/announcing-sqlcipher-support
  - Database encryption
  - Security features
  - Migration guides

## Supabase

### Official Documentation
- **Supabase Functions**: https://supabase.com/docs/guides/functions
  - Edge functions (Deno/TypeScript)
  - Local development
  - Deployment strategies

### Official SDKs
- **Python SDK**: https://github.com/supabase/supabase-py
  - Auth, database, storage, realtime for Python
  - Backend service integration

- **Swift SDK**: https://github.com/supabase/supabase-swift
  - Native iOS integration
  - Auth and database for Swift/SwiftUI

### Example Projects
- **Realtime Chat**: https://github.com/shwosner/realtime-chat-supabase-react
  - Supabase realtime subscriptions
  - React implementation patterns

- **Slack Clone (Next.js)**: https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone
  - Complete realtime messaging app
  - Next.js + Supabase integration
  - Channel-based architecture

## AI Integration

### AI SDK (Vercel)
- **RSC Overview**: https://ai-sdk.dev/docs/ai-sdk-rsc/overview
  - React Server Components with AI
  - Streaming responses
  - Server actions integration

### Groq

#### Official Documentation
- **Overview**: https://console.groq.com/docs/overview
  - High-speed inference engine
  - Getting started guide
  - Platform overview

- **API Reference**: https://console.groq.com/docs/api-reference#chat-create
  - Chat completions API
  - Request/response formats
  - Authentication and rate limits

#### Resources
- **API Cookbook**: https://github.com/groq/groq-api-cookbook
  - Code examples and recipes
  - Integration patterns
  - Best practices

### OpenRouter

#### SDK & Tools
- **Dev Tools**: https://openrouter.ai/docs/sdks/dev-tools/devtools
  - Debugging and development
  - Testing tools

- **Call Model Overview**: https://openrouter.ai/docs/sdks/call-model/overview
  - Basic API usage
  - Request/response patterns

#### Routing Features
- **Auto Model Selection**: https://openrouter.ai/docs/guides/routing/auto-model-selection
  - Automatic model routing based on prompt
  - Cost and performance optimization

- **Model Fallbacks**: https://openrouter.ai/docs/guides/routing/model-fallbacks
  - Automatic failover to backup models
  - Reliability patterns

#### Plugins & Skills
- **Plugins Overview**: https://openrouter.ai/docs/guides/features/plugins/overview
  - Extending AI capabilities
  - Custom tool integration

- **Skills Loader**: https://openrouter.ai/docs/sdks/call-model/examples/skills-loader
  - Dynamic skill loading
  - Runtime skill composition

#### TypeScript SDK
- **Embeddings**: https://openrouter.ai/docs/sdks/typescript/embeddings#errors
  - Vector embeddings generation
  - Error handling patterns

- **Parameters**: https://openrouter.ai/docs/sdks/typescript/parameters
  - Configuration options
  - Type definitions

## State & Caching

### Upstash Redis
- **Redis JS SDK**: https://github.com/upstash/redis-js
  - Edge-compatible Redis client
  - REST-based (works in edge functions)
  - TypeScript support

## Frontend Frameworks

### React Native / Expo
- **Template (TypeScript + Tabs + Auth)**: https://github.com/codingki/react-native-expo-template/tree/master/template-typescript-bottom-tabs-supabase-auth-flow
  - Bottom tabs navigation
  - Supabase authentication flow
  - TypeScript configuration
  - Project structure conventions

### Next.js
- **SaaS Starter**: https://github.com/nextjs/saas-starter
  - Complete SaaS boilerplate
  - Authentication, billing, teams
  - Best practices for production apps

---

## How to Update This File

Agents should update this file when:
1. New official documentation becomes available
2. Better example repositories are found
3. Technologies are updated with new versions
4. New integrations or SDKs are released

### Update Format

When adding new sources:

```markdown
## [Technology Name]

### [Category]
- **[Resource Title]**: [URL]
  - Brief description of what it covers
  - Key topics or features
```

Keep sources organized by technology and category for easy reference.

---

**Last Updated**: 2025-12-31
**Total Sources**: 23+
**Maintainers**: AI agents using Aftech-stack skill system
