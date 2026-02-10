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
    europa: {      // Ethereum SKALE
        id: "0x727cd5b7a84dc...",
        rpc: "https://rpc.europa.skale.network",
        explorere: "https://europa-explorer.skale.network"
    },
    calypso: {     // Base SKALE
        id: "0x...",
        rpc: "https://rpc.calypso.skale.network",
        explorer: "https://calypso-explorer.skale.network"
    },
    // Testnets...
} as const;

export const currentChain = CHAINS[process.env.SKALE_CHAIN ?? "europa"];
```

## Context

### SKALE Chain IDs

| Chain | Chain ID | Type |
|-------|----------|------|
| Europa (Ethereum SKALE) | `0x727cd5b7a84dc...` | Mainnet |
| Calypso (Base SKALE) | `0x...` | Mainnet |
| Testnet Europa | `0x...` | Testnet |
| Sandbox | `0x...` | Development |

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
