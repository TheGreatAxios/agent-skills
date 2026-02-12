---
name: skale-docs
description: Search and reference SKALE documentation. Use when looking up API references, chain configurations, or BITE Protocol details.
license: MIT
metadata:
  author: thegreataxios
  version: "1.0.0"
---

# SKALE Documentation Search

Access SKALE documentation efficiently using LLM-optimized endpoints.

## When to Apply

Reference this skill when:
- Looking up SKALE API references
- Finding chain configurations
- Reading BITE Protocol documentation
- Getting started guides

## Documentation Endpoints

| Endpoint | Use Case |
|----------|----------|
| `https://docs.skale.space/llms.txt` | Index/overview |
| `https://docs.skale.space/llms-full.txt` | Complete documentation |
| `https://docs.skale.space/llms-small.txt` | Compact version |

## Page Access

All documentation pages support `.md` suffix for markdown format:

```
https://docs.skale.space/get-started/quick-start/skale-on-base.md
https://docs.skale.space/developers/bite-protocol.md
```

## Quick Reference

### Key Sections

| Path | Content |
|------|---------|
| `/get-started/quick-start/skale-on-base` | SKALE Base setup |
| `/developers/bite-protocol` | BITE Protocol usage |
| `/concepts/bite-protocol/phases` | BITE phase availability |
| `/developers/tools` | SDK and tooling |

### Using with Web Reader

```typescript
// Fetch documentation via MCP web reader
const docs = await webReader({
    url: "https://docs.skale.space/llms.txt",
    return_format: "markdown"
});
```

## How to Work

1. **Start with index**: Use `llms.txt` for overview
2. **Deep dive**: Use `llms-full.txt` for comprehensive search
3. **Specific pages**: Append `.md` to any page URL
4. **BITE specifics**: Check `/concepts/bite-protocol/phases` for chain availability

## Related Skills

- `skale-dev` - SKALE development guidelines
- `bite-dev` - BITE Protocol development
