---
name: bite-dev
description: BITE Protocol development for encrypted and conditional transactions on SKALE. Use for privacy features, threshold encryption, CTX, and Rock-Paper-Scissors style games.
license: MIT
metadata:
  author: thegreataxios
  version: "1.0.0"
---

# BITE Protocol Development

BITE (Blockchain Integrated Threshold Encryption) provides privacy primitives on SKALE Network. Use this skill when building encrypted transactions or conditional transactions (CTX).

## When to Apply

Reference these guidelines when:
- Implementing encrypted transactions (Phase I)
- Building CTX-enabled contracts (Phase II)
- Private games (Rock-Paper-Scissors, etc.)
- Voting or bidding applications
- Using `@skalenetwork/bite-solidity` library
- Using `@skalenetwork/bite` TypeScript SDK

## BITE Phases

| Phase | Feature | Chains Available |
|-------|---------|------------------|
| Phase I | Encrypted Transactions | SKALE Base, SKALE Base Sepolia, BITE Sandbox |
| Phase II | Conditional Transactions (CTX) | BITE V2 Sandbox 2 only |

## Quick Reference

### Phase I: Encrypted Transactions

- `bite-encrypted-transactions` - encryptTransaction() flow
- `bite-sdk-usage` - TypeScript SDK usage

### Phase II: Conditional Transactions (CTX)

- `bite-conditional-transactions` - CTX contract patterns
- `bite-solidity-helpers` - Solidity library usage

## Chain Selection

| Need | Chain |
|------|-------|
| BITE Phase I only | SKALE Base Sepolia → SKALE Base |
| BITE Phase II (CTX) | BITE V2 Sandbox 2 (Chain ID: 1036987955) |

## Key Addresses

### Phase I
- Magic Address: `0x0000000000000000000000000000000000000401`

### Phase II (CTX)
- BITE Submit CTX: `0x000000000000000000000000000000000000001B`

## Compiler Requirements

| Feature | Solidity | EVM |
|---------|----------|-----|
| Phase I | Any supported | Any |
| Phase II (CTX) | ≥0.8.27 | istanbul |

## Resources

- **bite-solidity**: `github.com/skalenetwork/bite-solidity`
- **bite-ts**: `github.com/skalenetwork/bite-ts`
- **Demo**: `github.com/TheGreatAxios/ctxs` (thegreataxios/rps branch) - Full E2E RPS game with CTX
- **Starter**: `github.com/thegreataxios/skale-ctxs-foundry-starter` - Basic CTX template

## How to Work

1. **Identify Phase**: Phase I (encrypted tx) or Phase II (CTX)?
2. **Select Chain**: Based on phase requirements
3. **Use Correct Compiler**: Istanbul for CTX
4. **Implement**: Follow patterns in rules files
5. **Test**: Use BITE Sandbox for CTX development

## Related Skills

- `skale-dev` - General SKALE development
- `solidity-dev-tips` - Solidity best practices
