# Rule: contracts-deployment

## Why It Matters

SKALE deployments require specific chain targeting, verification, and configuration. Deploying to the wrong chain or missing verification steps creates unusable contracts and poor developer experience.

## Incorrect

```bash
# Hardcoded network - accidentally deploys to mainnet
npx hardhat run scripts/deploy.js --network skale

# No verification - contract remains unverified
npx hardhat deploy --network skale-testnet

# Manual chain ID in deploy script - error-prone
const chainId = 123456789; // What if this changes?
```

```typescript
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
    // Bad: No chain validation
    const Factory = await ethers.getContractFactory("MyContract");
    const contract = await Factory.deploy();

    console.log("Deployed to:", contract.address);
    // Missing: Verification, confirmation, chain checks
}

main().catch(console.error);
```

```typescript
// Hardcoded addresses per environment
const ADDRESSES = {
    1: "0x123...",      // Ethereum mainnet
    5: "0x456...",      // Goerli
    0x727cd5b7: "0x789..." // SKALE
};
// Problem: Not scalable, error-prone
```

## Correct

```bash
# Environment-aware deployment with confirmation
npx hardhat deploy --network skale-testnet --verify

# With pre-deployment confirmation (for mainnet)
npx hardhat deploy --network skale-mainnet --confirm

# Dry-run first
npx hardhat deploy --network skale-testnet --dry-run
```

```typescript
// scripts/deploy.ts
import { ethers, run, network } from "hardhat";

// Type-safe chain configuration
const CHAIN_CONFIG = {
    skale_europa_testnet: {
        chainId: 0x...,
        confirmations: 2,
        verify: true,
        explorerApiKey: process.env.SKALE_EXPLORER_API_KEY
    },
    skale_europa_mainnet: {
        chainId: 0x727cd5b7...,
        confirmations: 5,
        verify: true,
        explorerApiKey: process.env.SKALE_EXPLORER_API_KEY
    }
} as const;

async function main() {
    const { name } = network;
    const config = CHAIN_CONFIG[name as keyof typeof CHAIN_CONFIG];

    if (!config) {
        throw new Error(`Unknown network: ${name}`);
    }

    console.log(`Deploying to ${name} (chain ID: ${config.chainId})`);

    // Verify chain ID matches expected
    const currentChainId = await ethers.provider.getNetwork().then(n => Number(n.chainId));
    if (currentChainId !== config.chainId) {
        throw new Error(
            `Chain ID mismatch! Expected ${config.chainId}, got ${currentChainId}`
        );
    }

    // Deploy with proper logging
    console.log("Deploying MyContract...");
    const Contract = await ethers.getContractFactory("MyContract");
    const contract = await Contract.deploy();

    await contract.deployed();
    console.log(`Deployed to: ${contract.address}`);

    // Wait for confirmations
    if (config.confirmations > 0) {
        console.log(`Waiting for ${config.confirmations} confirmations...`);
        await contract.deployTransaction.wait(config.confirmations);
    }

    // Verify automatically
    if (config.verify && config.explorerApiKey) {
        console.log("Verifying contract...");
        await run("verify:verify", {
            address: contract.address,
            constructorArguments: []
        });
        console.log("Contract verified!");
    }

    // Save deployment info
    const deployment = {
        network: name,
        chainId: currentChainId,
        address: contract.address,
        txHash: contract.deployTransaction.hash,
        timestamp: new Date().toISOString()
    };

    console.log("Deployment:", JSON.stringify(deployment, null, 2));
}

main().catch(console.error);
```

```typescript
// Hardhat config with SKALE networks
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: { enabled: true, runs: 200 }
        }
    },
    networks: {
        skale_europa_testnet: {
            url: process.env.SKALE_TESTNET_RPC || "",
            chainId: 0x...,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        },
        skale_europa_mainnet: {
            url: process.env.SKALE_MAINNET_RPC || "",
            chainId: 0x727cd5b7...,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    },
    etherscan: {
        apiKey: {
            "skale-europa": process.env.SKALE_EXPLORER_API_KEY || ""
        },
        customChains: [
            {
                network: "skale-europa",
                chainId: 0x727cd5b7...,
                urls: {
                    apiURL: "https://europa-explorer.skale.network/api",
                    browserURL: "https://europa-explorer.skale.network"
                }
            }
        ]
    },
    // Require confirmation for mainnet deployments
    mocha: {
        timeout: 100000
    }
};

export default config;
```

```typescript
// Deployment record management
// scripts/deployments.ts
import fs from "fs";
import path from "path";

interface DeploymentRecord {
    network: string;
    chainId: number;
    address: string;
    txHash: string;
    timestamp: string;
}

function saveDeployment(record: DeploymentRecord) {
    const deploymentsPath = path.join(__dirname, "..", "deployments");
    const networkPath = path.join(deploymentsPath, record.network);

    fs.mkdirSync(networkPath, { recursive: true });

    const filename = `${new Date().toISOString().split("T")[0]}.json`;
    fs.writeFileSync(
        path.join(networkPath, filename),
        JSON.stringify(record, null, 2)
    );

    // Also update a summary file
    const summaryPath = path.join(deploymentsPath, "summary.json");
    const summary = fs.existsSync(summaryPath)
        ? JSON.parse(fs.readFileSync(summaryPath, "utf8"))
        : {};

    summary[record.network] = {
        ...record,
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
}
```

```typescript
// Deploy script with mainnet protection
// scripts/deploy.ts
import { ethers, network } from "hardhat";

const MAINNETS = ["skale_europa_mainnet", "skale_calypso_mainnet"];

async function confirmMainnetDeployment(): Promise<boolean> {
    if (!MAINNETS.includes(network.name)) return true;

    console.log("\nWARNING: DEPLOYING TO MAINNET");
    console.log(`Network: ${network.name}`);
    console.log("Press Ctrl+C to cancel, or wait 10 seconds to proceed...");

    await new Promise(resolve => setTimeout(resolve, 10000));
    return true;
}

async function main() {
    await confirmMainnetDeployment();
    // ... rest of deployment
}
```

## Context

### Deployment Checklist

- [ ] Environment variables set (RPC URL, Private Key, API Key)
- [ ] Chain ID validated before deployment
- [ ] Network name matches expected (testnet vs mainnet)
- [ ] Confirmation required for mainnet
- [ ] Wait for block confirmations
- [ ] Automatic verification enabled
- [ ] Deployment record saved
- [ ] Contract addresses committed to repo

### Environment Variables Template

```bash
# .env.example
# SKALE Network RPC Endpoints
SKALE_TESTNET_RPC=https://rpc.testnet-skale.network
SKALE_MAINNET_RPC=https://rpc.europa.skale.network

# Deployment
PRIVATE_KEY=your_private_key_here
SKALE_EXPLORER_API_KEY=your_api_key_here

# Chain IDs (for reference)
SKALE_MAINNET_CHAIN_ID=0x727cd5b7...
SKALE_TESTNET_CHAIN_ID=0x...
```

### Foundry Deployment

```bash
# Foundry supports similar patterns
forge script script/Deploy.s.sol --rpc-url $SKALE_TESTNET_RPC --broadcast --verify

# With confirmation
forge script script/Deploy.s.sol \
    --rpc-url $SKALE_MAINNET_RPC \
    --broadcast \
    --verify \
    --delay 10
```

### Multi-Contract Deployment Order

```typescript
// Correct order for dependent contracts
async function deploySystem() {
    // 1. Deploy base contracts first
    const token = await deploy("Token");

    // 2. Then deploy contracts that depend on base
    const sale = await deploy("TokenSale", [token.address]);

    // 3. Finally deploy contracts that depend on both
    const governance = await deploy("Governance", [sale.address]);

    return { token, sale, governance };
}
```

## References

- [Hardhat Deployment Guide](https://hardhat.org/guides/deploying)
- [Foundry Deployment](https://book.getfoundry.sh/forge/deploying)
- [SKALE Network Documentation](https://docs.skale.network)
