# Rule: chain-target-correct

## Why It Matters

Deploying to the wrong SKALE chain can result in lost funds, unrefundable gas costs, contracts in an unverified environment, or testing on production. SKALE has multiple chains including Ethereum-connected SKALE, Base-connected SKALE, and various testnets/sandboxes.

## Incorrect

```typescript
// Hardcoded to mainnet - accidentally deploys to production during testing
const targetChain = "0x727cd5b7a84dc..."; // SKALE Mainnet
await deployToChain(targetChain);
```

```solidity
// Contract hardcodes chain ID - breaks deployment to other SKALE chains
contract MyContract {
    uint256 constant CHAIN_ID = 0x727cd5b7a84dc; // Mainnet only
}
```

## Correct

```typescript
// Environment-aware chain selection with validation
const CHAIN_IDS = {
    MAINNET: "0x727cd5b7a84dc...",
    TESTNET: "0x...",
    SANDBOX: "0x...",
    BASE_SKALE: "0x...",
} as const;

const targetChain = process.env.SKALE_CHAIN_ID ?? CHAIN_IDS.SANDBOX;

if (!Object.values(CHAIN_IDS).includes(targetChain)) {
    throw new Error(`Unknown chain ID: ${targetChain}`);
}

await deployToChain(targetChain);
```

```solidity
// Contract uses constructor for flexible chain deployment
contract MyContract {
    uint256 public chainId;
    uint256 constant TESTNET_CHAIN_ID = 0x...;
    uint256 constant MAINNET_CHAIN_ID = 0x727cd5b7a84dc...;

    constructor() {
        chainId = block.chainid;
    }

    modifier onlyChain(uint256 expectedChainId) {
        require(chainId == expectedChainId, "Wrong chain");
        _;
    }
}
```

```typescript
// Config file approach (recommended for projects)
// config/chains.ts
export const CHAINS = {
    // SKALE Base (Recommended)
    base_sepolia: {
        id: 324705682,
        name: "SKALE Base Sepolia",
        rpc: "https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha",
        explorer: "https://base-sepolia-testnet-explorer.skalenodes.com",
        faucet: "https://base-sepolia-faucet.skale.space"
    },
    base: {
        id: 1187947933,
        name: "SKALE Base",
        rpc: "https://skale-base.skalenodes.com/v1/base",
        explorer: "https://skale-base-explorer.skalenodes.com"
    },
    // SKALE Ethereum (ETH-native only)
    europa: {
        id: 2046399126,
        name: "Europa Hub",
        rpc: "https://mainnet.skalenodes.com/v1/honest-liquid-giant",
        explorer: "https://europa-explorer.skale.network"
    },
    // BITE Sandbox
    bite_sandbox: {
        id: 1036987955,
        name: "BITE V2 Sandbox 2",
        rpc: "https://staging-v3.skalenodes.com/v1/feeble-sky-crater",
        explorer: "https://staging-v3-explorer.skalenodes.com"
    }
} as const;

// Default to SKALE Base Sepolia for development
export const currentChain = CHAINS[process.env.SKALE_CHAIN ?? "base_sepolia"];
```

## Context

### Chain Selection Priority

**Default to SKALE Base chains for new projects.** Use SKALE Ethereum chains only for ETH-native applications.

```
SKALE Base Sepolia (Testnet) → SKALE Base (Mainnet) → SKALE Europa/Nebula (Ethereum L1)
```

See `chain-hierarchy.md` for complete decision flow.

### SKALE Chain IDs

| Chain | Chain ID | Hex | Type | Recommended |
|-------|----------|-----|------|-------------|
| SKALE Base Sepolia | 324705682 | 0x135A9D92 | Testnet | ✅ Default for testing |
| SKALE Base | 1187947933 | 0x46cea59d | Mainnet | ✅ Default for production |
| Europa Hub | 2046399126 | 0x7A23... | Mainnet | ETH-native only |
| Nebula Gaming Hub | 1517929550 | 0x5A6E... | Mainnet | ETH-native only |
| BITE V2 Sandbox 2 | 1036987955 | 0x3DC4... | Sandbox | CTX development |

### Deployment Checklist

- [ ] Chain ID loaded from environment variable
- [ ] Validate chain ID before deployment
- [ ] RPC endpoint matches selected chain
- [ ] Explorer URL matches selected chain
- [ ] Require explicit `--network` flag for production deployments
- [ ] Use `.env.example` to document required chain IDs

### Prevention Tips

```bash
# Add to package.json scripts to prevent accidental mainnet deploys
{
  "scripts": {
    "deploy:test": "hardhat deploy --network skale-testnet",
    "deploy:mainnet": "hardhat deploy --network skale-mainnet --verify",
    "predeploy:mainnet": "echo 'Deploying to MAINNET. Press Ctrl+C to cancel.' && sleep 5"
  }
}
```

## References

- [SKALE Network Documentation](https://docs.skale.network/)
- [Chain List](https://chainlist.org/)
