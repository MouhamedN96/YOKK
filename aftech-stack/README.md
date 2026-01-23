# Aftech-stack Skills System

A **mutative, self-evolving** skill system for building modern, offline-first, AI-powered applications with React Native/Expo, Next.js, PowerSync, Supabase, OpenRouter, and more.

## What Is This?

This is a comprehensive Claude Code skill system that teaches AI agents how to build with the Aftech-stack. Unlike static documentation, this system is designed to be **updated and extended by AI agents** as technologies evolve and new patterns emerge.

## What's Included

### 📚 Core Documentation

- **SKILL.md** - Main meta-skill with architecture overview and quick reference
- **SOURCES.md** - All official documentation links (23+ resources)
- **EXTEND.md** - Complete guide for agents to update and extend the system

### 🔧 Component Skills

Detailed implementation guides for each technology:

1. **powersync.md** - Offline-first sync with SQLite and Postgres
2. **supabase.md** - Backend, auth, realtime, and edge functions
3. **openrouter.md** - AI routing, fallbacks, and multi-model access
4. **upstash-redis.md** - Edge-compatible caching and rate limiting
5. **ai-sdk.md** - React Server Components with AI
6. **react-native-expo.md** - Mobile app development patterns
7. **nextjs-saas.md** - Web application foundation

### 💡 Complete Examples

End-to-end implementations:

1. **offline-first-app.md** - Full offline-first todo app with AI suggestions
2. **auth-flow.md** - Complete auth flow with OAuth and bottom tabs

## Technology Stack

```
Frontend:
├── React Native + Expo (mobile)
├── Next.js + App Router (web)
└── TypeScript (everywhere)

Data & Sync:
├── PowerSync (offline-first sync)
├── Supabase (Postgres backend)
└── Upstash Redis (caching)

AI:
├── OpenRouter (multi-model routing)
├── Groq (fast inference)
└── AI SDK RSC (streaming)

Backend:
├── Supabase Edge Functions
├── Supabase Auth
└── Python/Swift SDKs
```

## How to Use

### For Developers

When building with the Aftech-stack:

1. **Start with SKILL.md** for architecture overview
2. **Check component skills** for specific technology patterns
3. **Review examples** for complete implementations
4. **Reference SOURCES.md** for official docs

### For AI Agents

This system is designed for AI agents to:

1. **Use during development** - Load relevant skills for tasks
2. **Update as needed** - Add new patterns and best practices
3. **Extend with new tech** - Follow EXTEND.md protocols
4. **Keep current** - Update docs and examples

## Quick Start

### Ask Claude to Use This Skill

When working on Aftech-stack projects, Claude will automatically activate this skill. You can also explicitly reference it:

```
"Use the Aftech-stack skill to build an offline-first todo app"
"Following Aftech-stack patterns, add AI suggestions to my app"
"Create a new Supabase edge function using Aftech-stack conventions"
```

### Extend the System

AI agents can extend this system following these patterns:

**Add a new technology:**
```markdown
1. Create `components/[tech-name].md`
2. Update SKILL.md to reference it
3. Add sources to SOURCES.md
4. Create examples if complex
```

**Update existing patterns:**
```markdown
1. Read current component skill
2. Make targeted updates
3. Document changes at bottom
4. Update version date
```

See **EXTEND.md** for complete guidelines.

## Architecture Philosophy

### Offline-First
Apps work without internet, sync when connected. PowerSync handles bidirectional sync between local SQLite and Supabase Postgres.

### AI-Native
Built-in AI capabilities with automatic fallbacks. OpenRouter provides multi-model access with cost optimization.

### Type-Safe
TypeScript throughout frontend and backend. Generate types from Supabase schema.

### Secure
SQLCipher encryption, Row Level Security, edge security patterns.

### Scalable
Edge functions, Redis caching, auto-routing, global deployment.

## File Structure

```
.claude/skills/aftech-stack/
├── SKILL.md                    # Meta-skill (start here)
├── SOURCES.md                  # All documentation links
├── EXTEND.md                   # Extension guide
├── README.md                   # This file
├── components/                 # Individual tech skills
│   ├── powersync.md
│   ├── supabase.md
│   ├── openrouter.md
│   ├── upstash-redis.md
│   ├── ai-sdk.md
│   ├── react-native-expo.md
│   └── nextjs-saas.md
└── examples/                   # Complete patterns
    ├── offline-first-app.md
    └── auth-flow.md
```

## Progressive Disclosure

The system uses progressive disclosure to avoid overwhelming users:

- **SKILL.md** - High-level overview and quick reference
- **Component skills** - Detailed implementation for specific tech
- **Examples** - Complete, working code patterns
- **SOURCES.md** - Links to official documentation

Claude loads only what's needed for the current task.

## Mutative Design

This system is designed to evolve:

✅ **Agents can:**
- Update component skills with new patterns
- Add new technologies to the stack
- Create new examples
- Update sources as docs change
- Improve existing implementations

✅ **Agents should:**
- Follow templates in EXTEND.md
- Document changes with dates
- Maintain consistency
- Link related content
- Test code examples

## Version

**Version**: 1.0.0
**Created**: 2025-12-31
**Last Updated**: 2025-12-31
**Maintainers**: AI agents using Aftech-stack
**Total Sources**: 23+
**Component Skills**: 7
**Examples**: 2

## Contributing (for AI Agents)

When extending this system:

1. Read **EXTEND.md** first
2. Follow existing patterns
3. Keep quality high
4. Document changes
5. Update cross-references
6. Test examples

## Support

For issues with:
- **Claude Code**: Report at https://github.com/anthropics/claude-code/issues
- **This skill system**: Agents can update EXTEND.md with new patterns
- **Specific technologies**: Check SOURCES.md for official docs

## What Makes This Special

🔄 **Self-Evolving**: Agents maintain and improve it
📦 **Modular**: Each component is independent
🎯 **Focused**: Concise skills with deep examples
🔗 **Connected**: Everything cross-references
📚 **Grounded**: Based on official documentation
🚀 **Production-Ready**: Real-world patterns

## Next Steps

1. **Read SKILL.md** for architecture overview
2. **Explore components/** for specific technologies
3. **Review examples/** for complete patterns
4. **Check SOURCES.md** for official docs
5. **Use EXTEND.md** when adding new content

---

Built with ❤️ for the Aftech-stack community.
Maintained by AI agents. Always evolving.
