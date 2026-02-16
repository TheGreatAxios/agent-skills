# Payment Schemes — Reference Index

Schemes define how payments are formed, validated, and settled. They are independent of the transport layer.

## Available Schemes

### Exact Scheme

The `exact` scheme transfers a **specific amount** of funds from a client to a resource server. The resource server must know in advance the exact amount required.

**Use cases:** Paying to view an article, purchasing digital credits, an LLM paying to use a tool.

**Per-Network References:**

| File | Description |
|------|-------------|
| [exact-core.md](exact-core.md) | Core exact scheme specification, security, and general error codes |
| [exact-evm.md](exact-evm.md) | EVM implementation using EIP-3009 `transferWithAuthorization` |
| [exact-svm.md](exact-svm.md) | Solana (SVM) implementation using `TransferChecked` |
| [exact-sui.md](exact-sui.md) | Sui implementation using `0x2::coin::Coin<T>` |

## Quick Reference: EIP-3009 (EVM Exact)

```javascript
const authorizationTypes = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
};
```

## Supported Networks

| Network | CAIP-2 ID | Type |
|---------|-----------|------|
| Base mainnet | `eip155:8453` | Production |
| Base Sepolia | `eip155:84532` | Testnet |
| Avalanche C-Chain | `eip155:43114` | Production |
| Avalanche Fuji | `eip155:43113` | Testnet |
| Solana mainnet | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | Production |
| Solana devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` | Testnet |

## Source

[coinbase/x402](https://github.com/coinbase/x402/tree/main/specs/schemes/exact)
