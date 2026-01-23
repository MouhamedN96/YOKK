# Extending the Aftech-stack Skill System

This guide teaches AI agents how to update and extend the Aftech-stack skill system. The system is **mutative by design** - it's meant to grow and evolve.

## Philosophy

The Aftech-stack skill system follows these principles:

1. **Living Documentation**: Skills should stay current with technology updates
2. **Modular Growth**: New technologies can be added without disrupting existing skills
3. **Agent-Driven**: AI agents maintain and extend the system
4. **Source-Grounded**: All patterns reference official documentation
5. **Progressive Disclosure**: Keep main files concise, details in components

## When to Extend

Update or extend this skill system when:

- ✅ A new technology is added to the stack
- ✅ A component (PowerSync, Supabase, etc.) has major updates
- ✅ New patterns or best practices emerge
- ✅ User requests new capabilities
- ✅ Better example code is found
- ✅ Integration patterns are discovered

## How to Extend

### 1. Adding a New Component Skill

When adding a new technology to the stack:

**Step 1**: Create the component file

```bash
# Create in components/ directory
touch .claude/skills/aftech-stack/components/[technology-name].md
```

**Step 2**: Use this template

```markdown
# [Technology Name] - Aftech-stack Component

## Overview

Brief description of what this technology does and why it's in the stack.

## When to Use

- Use case 1
- Use case 2
- Use case 3

## Installation

```bash
# Installation commands
npm install [package-name]
```

## Setup

```typescript
// Basic setup code
import { Client } from '[package]';

const client = new Client({
  // configuration
});
```

## Core Patterns

### Pattern 1: [Name]

Description of when and how to use this pattern.

```typescript
// Example code
```

### Pattern 2: [Name]

Another common pattern.

## Integration with Aftech-stack

How this component works with:
- PowerSync
- Supabase
- OpenRouter
- etc.

## Best Practices

1. Specific best practice
2. Another best practice

## Common Pitfalls

- Pitfall 1 and how to avoid it
- Pitfall 2 and how to avoid it

## References

- Official docs: [URL from SOURCES.md]
- Example repo: [URL from SOURCES.md]
```

**Step 3**: Update SKILL.md

Add reference to the new component in the "Component Skills" section:

```markdown
- `components/[technology-name].md` - Brief description
```

**Step 4**: Update SOURCES.md

Add relevant documentation links:

```markdown
## [Technology Name]

### Documentation
- **[Resource Title]**: [URL]
  - Description
```

### 2. Updating an Existing Component

When technology or patterns change:

**Step 1**: Read the current component skill

```bash
# Check what's currently documented
cat .claude/skills/aftech-stack/components/[technology].md
```

**Step 2**: Make targeted updates

- Update code examples to use new APIs
- Add new patterns that emerged
- Mark deprecated patterns
- Update version numbers if relevant

**Step 3**: Document the change

At the bottom of the component file, note what changed:

```markdown
---

**Updates**:
- 2025-12-31: Added new pattern for [feature]
- 2025-12-31: Updated setup to use [new API]
```

### 3. Adding Example Patterns

When you discover or implement a complete working pattern:

**Step 1**: Create example file

```bash
touch .claude/skills/aftech-stack/examples/[pattern-name].md
```

**Step 2**: Document the full implementation

```markdown
# [Pattern Name] - Complete Example

## Use Case

What problem this solves and when to use it.

## Architecture

```
[ASCII diagram or description of the architecture]
```

## Implementation

### File Structure

```
app/
├── [structure]
```

### Step-by-Step

#### 1. [First Step]

Code and explanation.

#### 2. [Next Step]

Code and explanation.

## Full Code

Complete, runnable implementation.

## Testing

How to test this pattern.

## Production Considerations

What to think about for production use.

## Related Patterns

- Link to other examples
- Link to component skills
```

**Step 3**: Reference in SKILL.md

Add to the "Example Patterns" section.

### 4. Adding New Sources

When you find valuable documentation or examples:

**Step 1**: Update SOURCES.md

Follow the existing format:

```markdown
## [Technology]

### [Category]
- **[Title]**: [URL]
  - What it covers
  - Key value
```

**Step 2**: Reference in component skills

Link to the new source from relevant component files.

## Extension Patterns

### Pattern: Technology Upgrade

When a technology (e.g., PowerSync 2.0) has breaking changes:

1. Create `components/[tech]-v2.md` if drastically different
2. Or update existing file and note breaking changes
3. Update all affected examples
4. Mark old patterns as deprecated

### Pattern: New Integration

When two technologies integrate in a new way:

1. Update both component files to reference the integration
2. Create an example if the integration is complex
3. Add integration code snippets to both components

### Pattern: Stack Addition

When entirely new technology joins the stack:

1. Create component skill (as described above)
2. Create at least one example showing integration
3. Update SKILL.md overview
4. Add to SOURCES.md

## Quality Guidelines

When extending, maintain quality:

### Code Examples

- ✅ Use TypeScript with proper types
- ✅ Include error handling
- ✅ Show both simple and advanced usage
- ✅ Be runnable (not pseudocode)
- ❌ Don't include deprecated APIs
- ❌ Don't use anti-patterns

### Documentation

- ✅ Write concise, scannable text
- ✅ Use clear headings
- ✅ Provide context for when to use
- ✅ Link to official sources
- ❌ Don't duplicate official docs
- ❌ Don't write overly verbose explanations

### Structure

- ✅ Follow existing file patterns
- ✅ Keep main SKILL.md under 500 lines
- ✅ Use progressive disclosure
- ✅ Organize by logical grouping
- ❌ Don't create deeply nested structures
- ❌ Don't duplicate content across files

## Maintenance Checklist

Periodically review and update:

- [ ] Check if component versions changed
- [ ] Verify all links in SOURCES.md still work
- [ ] Update deprecated patterns
- [ ] Add new best practices discovered
- [ ] Remove outdated anti-patterns
- [ ] Ensure examples still run
- [ ] Check for new official documentation

## Agent Instructions

When an AI agent is asked to extend this skill system:

1. **Understand the request**: What needs to be added or updated?
2. **Read existing structure**: Understand current organization
3. **Check sources**: Look at SOURCES.md for official docs
4. **Make minimal changes**: Don't refactor unnecessarily
5. **Follow templates**: Use the templates in this guide
6. **Update cross-references**: Ensure SKILL.md, components, and examples stay linked
7. **Document changes**: Note what was added/changed and why
8. **Test if possible**: Verify code examples work

## Version Control

This skill system doesn't use formal versioning, but:

- Note significant updates in component files
- Update "Last Updated" dates in SKILL.md and SOURCES.md
- Maintain backward compatibility when possible
- Mark breaking changes clearly

## Questions?

If uncertain about how to extend:

1. Look at existing component files for patterns
2. Follow the principle of least surprise
3. Keep it simple and maintainable
4. Document your reasoning
5. Ask the user if you're unsure about a major change

---

**Remember**: The goal is a living, growing knowledge system that helps build better apps with the Aftech-stack. Keep it accurate, current, and useful.

---

**Last Updated**: 2025-12-31
**System Version**: 1.0.0
