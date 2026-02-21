# Rule: docs-search-patterns

## Why It Matters

SKALE documentation provides LLM-optimized endpoints for efficient access. Using these endpoints correctly ensures you get the most relevant and up-to-date information.

## Documentation URLs

### LLM-Optimized Endpoints

| URL | Size | Use Case |
|-----|------|----------|
| `https://docs.skale.space/llms.txt` | ~50KB | Index, navigation, key topics |
| `https://docs.skale.space/llms-full.txt` | ~2MB | Complete documentation |
| `https://docs.skale.space/llms-small.txt` | ~200KB | Compact version |

### Page Access Pattern

All pages support `.md` suffix for raw markdown:

```
Base pattern: https://docs.skale.space/{path}
Markdown:     https://docs.skale.space/{path}.md
```

## Key Documentation Paths

### Getting Started

| Path | Content |
|------|---------|
| `/get-started/quick-start/skale-on-base` | SKALE Base chain setup |
| `/get-started/quick-start/skale-on-ethereum` | SKALE Ethereum chains |
| `/get-started/wallet-setup` | Wallet configuration |

### BITE Protocol

| Path | Content |
|------|---------|
| `/developers/bite-protocol` | BITE development guide |
| `/concepts/bite-protocol/phases` | Phase I/II availability per chain |
| `/developers/bite-protocol/encrypted-transactions` | Phase I details |
| `/developers/bite-protocol/conditional-transactions` | Phase II (CTX) details |

### Developer Tools

| Path | Content |
|------|---------|
| `/developers/tools` | SDK and tooling overview |
| `/developers/sdks/bite-ts` | TypeScript SDK |
| `/developers/sdks/bite-solidity` | Solidity library |

### Chain Information

| Path | Content |
|------|---------|
| `/concepts/networks` | Network overview |
| `/developers/network-config` | RPC, Chain IDs, explorers |

## Usage Examples

### Fetch Index

```bash
curl https://docs.skale.space/llms.txt
```

### Fetch Specific Page

```bash
curl https://docs.skale.space/developers/bite-protocol.md
```

### Using Web Reader MCP

```typescript
// With MCP web-reader tool
const docs = await mcp_web_reader({
    url: "https://docs.skale.space/llms.txt",
    return_format: "markdown",
    no_cache: false
});
```

## Search Strategy

1. **Quick lookup**: Start with `llms.txt` for navigation
2. **Deep search**: Use `llms-full.txt` for comprehensive information
3. **Specific topic**: Fetch individual `.md` pages
4. **Verify chain info**: Always check docs for current chain configurations

## Common Lookups

| Need | Path |
|------|------|
| Chain IDs & RPCs | `/developers/network-config.md` |
| BITE availability | `/concepts/bite-protocol/phases.md` |
| SDK installation | `/developers/tools.md` |
| Bridge setup | `/developers/bridge.md` |

## References

- [SKALE Docs](https://docs.skale.space)
- [LLMs.txt Standard](https://llmstxt.org)
