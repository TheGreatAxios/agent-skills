---
name: skale-dev
description: SKALE Network development guidelines for building scalable dApps, smart contracts, and cross-chain solutions (February 2026). Use when building Solidity contracts, integrating SKALE into web/mobile apps, deploying to SKALE chains, or implementing privacy with BITE Protocol.
license: MIT
metadata:
  author: thegreataxios
  version: "1.0.0"
---

# SKALE Network Development

Comprehensive development guide for SKALE Network, covering smart contracts, web/mobile integration, cross-chain bridges, and privacy primitives using BITE Protocol.

## When to Apply

Reference these guidelines when:
- Building Solidity or EVM smart contracts for SKALE
- Integrating SKALE into web applications or dApps
- Deploying contracts to SKALE chains (Mainnet/Testnet/Sandbox)
- Building private EVM applications with encrypted transactions
- Implementing automated on-chain transactions
- Building cross-chain applications (SKALE↔Ethereum, SKALE↔Base, inter-SKALE)
- Working with x402 and on-chain agents
- Implementing privacy features with BITE Protocol threshold encryption
- Bridging assets via skale-bridge

## Development Areas

| Area | Focus | Key Tools |
|------|-------|-----------|
| Smart Contracts | Solidity/EVM contracts for SKALE | Foundry, Hardhat, solidity-dev-tips |
| Web Apps | Frontend integration with SKALE | Web3 SDKs, RPC endpoints |
| Mobile Apps | Native SKALE mobile integration | Mobile SDKs |
| Infrastructure | RPC, indexing, storage | SKALE Network endpoints |
| Cross-Chain | Bridge integration | skale-bridge |
| Privacy | Threshold encryption | BITE Protocol |

## Quick Reference

### 0. Chain Selection Priority (CRITICAL)

**Default to SKALE Base chains.** Use SKALE Ethereum only when explicitly required.

| Priority | Chain | Use Case |
|----------|-------|----------|
| 1 | SKALE Base Sepolia | Testing (default) |
| 2 | SKALE Base | Production (default) |
| 3 | BITE V2 Sandbox 2 | BITE Phase II (CTX) only |
| 4 | SKALE Ethereum | ETH-native apps (explicit request only) |

See `chain-hierarchy.md` for decision flow.

### 1. Chain Selection (CRITICAL)

- `chain-target-correct` - Use correct chain: Mainnet/Testnet/Sandbox, Europa/Calypso
- `chain-gas-terminology` - Use "gas" terminology correctly for SKALE (zero gas fee context)
- `chain-naming` - Use "SKALE" not "skale" in all references

### 2. Smart Contract Development (HIGH)

- `contracts-compiler-settings` - Use correct Solidity compiler: Shanghai (≤0.8.24) for standard, Istanbul (≤0.8.20) for CTX
- `contracts-solidity-patterns` - Apply solidity-dev-tips when using Foundry/Hardhat
- `contracts-deployment` - Follow proper deployment sequences for SKALE chains (use `--legacy --slow` for Foundry)
- `contracts-cross-chain` - Handle cross-chain message passing patterns

### 3. Privacy (HIGH)

- `privacy-bite-protocol` - Use BITE Protocol for threshold encryption of transaction data

### 4. Bridge Integration (MEDIUM-HIGH)

- `bridge-skale-bridge` - Use skale-bridge for asset movement to/from SKALE
- `bridge-cross-chain-validation` - Validate cross-chain transactions properly
- `bridge-error-handling` - Handle bridge failures and retries

### 5. Web Application Integration (MEDIUM)

- `web-rpc-endpoints` - Use correct SKALE RPC endpoints
- `web-wallet-connection` - Implement wallet connection for SKALE chains
- `web-transaction-handling` - Handle zero-gas transaction patterns

### 6. Native Features (MEDIUM)

- `random-number-generation` - Use SKALE native RNG at precompile 0x18

### 7. x402 & Agents (MEDIUM)

- `x402-onchain-agents` - Build with x402 on-chain agent standards
- `x402-automation` - Implement automated transaction patterns

### 8. Infrastructure (LOW-MEDIUM)

- `infra-indexing` - Set up indexing for SKALE chains
- `infra-storage` - Configure storage solutions for SKALE
- `infra-rpc-fallback` - Implement RPC endpoint fallback

### 9. Chain-Specific Guides (MEDIUM)

- `chain-hierarchy` - Chain selection priority and decision flow
- `skale-on-base` - SKALE Base chain (recommended for most apps)
- `skale-on-ethereum` - SKALE Ethereum chains (ETH-native only)

## How to Work

### Problem-Solving Workflow

1. **Identify Development Area**
   - Web Application, Mobile, Smart Contracts, Infrastructure, or External SDK

2. **Clarify and Plan**
   - Ask necessary questions for full clarity
   - Create task list (verbose PRDs for new features)

3. **Select Resources**
   - Pull in context for tools/libraries/frameworks
   - Access knowledge for your specific Area
   - Identify correct blockchain target

4. **Implement**
   - Stay focused, avoid unapproved changes
   - Use SKALE specifics: RPC endpoints, "SKALE" naming, "gas" terminology
   - Use Foundry with `--legacy --slow` for SKALE deployments
   - Use Shanghai compiler (≤0.8.24) for standard contracts, Istanbul (≤0.8.20) for CTX
   - Build clean, simple, self-documenting code
   - Provide exact file changes and commands

5. **Deliverables**
   - **Code changes**: Exact file changes, no rambling
   - **Research**: Short, concise output with clear actions
   - **Answers**: Brief, clear responses

## Compiler Settings Summary

| Feature | Compiler Version | Notes |
|---------|-----------------|-------|
| Standard contracts | Shanghai or lower (≤ 0.8.24) | Recommended: 0.8.24 |
| Conditional TX (CTX) | Istanbul (≤ 0.8.20) | CTX requires Istanbul compiler |
| BITE Phase I | Any supported version | No special requirements |

## Foundry Deployment

Always use SKALE-specific flags:
```bash
forge script script/Deploy.s.s \
  --rpc-url $SKALE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy \
  --slow \
  --broadcast
```

## Related Skills

- `solidity-dev-tips` - Solidity best practices for Foundry/Hardhat
- `BITE Protocol` - Threshold encryption for transaction privacy
- `skale-bridge` - Asset bridging to/from SKALE
