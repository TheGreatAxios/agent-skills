# Rule: chain-hierarchy

## Priority: SKALE Base > SKALE Ethereum

**Default to SKALE Base chains for new projects.** SKALE Ethereum chains are for ETH-native applications only.

## Chain Selection Priority

```
SKALE Base Sepolia (Testnet) → SKALE Base (Mainnet) → SKALE Europa/Nebula (Ethereum L1)
```

## Chain Categories

| Category | Chains | Use Case |
|----------|--------|----------|
| **SKALE Base** | SKALE Base Sepolia, SKALE Base | Most dApps, gaming, DeFi, social |
| **SKALE Ethereum** | Europa, Nebula, Calypso | ETH-native apps, Ethereum bridging |

## When to Use Each

### SKALE Base (Recommended)

- Most new applications
- Gaming and social apps
- DeFi applications
- Applications requiring BITE Protocol
- Fast finality needs

### SKALE Ethereum

- ETH-native applications
- Direct Ethereum L1 integration
- Applications needing specific Ethereum bridge features
- Legacy applications

## Chain Comparison

### SKALE Base Chains

| Chain | Chain ID | Type | BITE Phase I | BITE Phase II (CTX) |
|-------|----------|------|--------------|---------------------|
| SKALE Base Sepolia | 324705682 | Testnet | ✅ | ❌ |
| SKALE Base | 1187947933 | Mainnet | ✅ | ❌ |

### SKALE Ethereum Chains

| Chain | Chain ID | Type | BITE Support |
|-------|----------|------|--------------|
| Europa Hub | 2046399126 | Mainnet | ❌ |
| Nebula Gaming Hub | 1517929550 | Mainnet | ❌ |
| Calypso Hub | 1564830818 | Mainnet | ❌ |

### BITE Sandbox Chains

| Chain | Chain ID | Type | BITE Phase I | BITE Phase II (CTX) |
|-------|----------|------|--------------|---------------------|
| BITE V2 Sandbox 2 | 1036987955 | Sandbox | ✅ | ✅ |

## Environment Variables

```bash
# SKALE Base (Recommended)
SKALE_BASE_SEPOLIA_RPC=https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha
SKALE_BASE_SEPOLIA_CHAIN_ID=324705682
SKALE_BASE_RPC=https://skale-base.skalenodes.com/v1/base
SKALE_BASE_CHAIN_ID=1187947933

# SKALE Ethereum
SKALE_EUROPA_RPC=https://mainnet.skalenodes.com/v1/honest-liquid-giant
SKALE_EUROPA_CHAIN_ID=2046399126

# BITE Sandbox
BITE_SANDBOX_RPC=https://staging-v3.skalenodes.com/v1/feeble-sky-crater
BITE_SANDBOX_CHAIN_ID=1036987955
```

## Foundry Configuration

```toml
# foundry.toml
[rpc_endpoints]
skale_base_sepolia = "https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha"
skale_base = "https://skale-base.skalenodes.com/v1/base"
skale_europa = "https://mainnet.skalenodes.com/v1/honest-liquid-giant"
bite_sandbox = "https://staging-v3.skalenodes.com/v1/feeble-sky-crater"
```

## Decision Flow

```
Need BITE Phase II (CTX)?
├─ Yes → BITE V2 Sandbox 2 (only chain with CTX support)
└─ No → SKALE Base Sepolia (testnet) → SKALE Base (mainnet)

Use SKALE Ethereum chains ONLY if:
- Developer explicitly specifies
- Codebase/requirements require it
```

## Quick Rules

1. **Default**: SKALE Base Sepolia (testnet) or SKALE Base (mainnet)
2. **BITE Phase II (CTX)**: BITE V2 Sandbox 2 only
3. **SKALE Ethereum**: Never default here - only on explicit request

## References

- `skale-on-base.md` - SKALE Base detailed configuration
- `skale-on-ethereum.md` - SKALE Ethereum detailed configuration
- `privacy-bite-protocol.md` - BITE Protocol usage
