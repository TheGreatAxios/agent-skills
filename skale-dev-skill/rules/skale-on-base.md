# Rule: skale-on-base

> **Preferred chain for new projects.** Default to SKALE Base chains unless BITE Phase II (CTX) is required or Ethereum integration is explicitly needed.

## Why It Matters

SKALE Base is a SKALE Chain deployed on Base blockchain. Understanding the correct chain configuration, RPC endpoints, and bridged tokens is essential for building applications that work correctly on SKALE Base.

## Chain Information

### SKALE Base Mainnet

| Property | Value |
|----------|-------|
| Name | SKALE Base |
| RPC URL | `https://skale-base.skalenodes.com/v1/base` |
| WSS URL | `wss://skale-base.skalenodes.com/v1/ws/base` |
| Explorer | `https://skale-base-explorer.skalenodes.com/` |
| Portal | `https://base.skalenodes.com/chains/base` |
| Chain ID | 1187947933 |
| Chain ID Hex | 0x46cea59d |
| Native Token | CREDIT |
| Decimals | 18 |

### SKALE Base Testnet (Base Sepolia)

| Property | Value |
|----------|-------|
| Name | SKALE Base Sepolia |
| RPC URL | `https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha` |
| Explorer | `https://base-sepolia-testnet-explorer.skalenodes.com/` |
| Portal | `https://base-sepolia.skalenodes.com` |
| Faucet | `https://base-sepolia-faucet.skale.space` |
| Chain ID | 324705682 |
| Chain ID Hex | 0x135A9D92 |
| Native Token | CREDIT |
| Decimals | 18 |

## Incorrect

```typescript
// Wrong RPC URL
const provider = new ethers.JsonRpcProvider("https://rpc.europa.skale.network");
// This is Europa, not SKALE Base

// Wrong chain ID
const chainId = 0x727cd5b7;  // This is Europa, not SKALE Base

// Not using faucet for testnet
// User has no CREDIT to interact with the chain
```

```solidity
// Wrong token addresses
contract MyContract {
    address constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    // This is Base address, not SKALE Base address
}
```

## Correct

```typescript
import { ethers } from "ethers";

// Testnet configuration
const SKALE_BASE_TESTNET = {
    chainId: 324705682,
    name: "SKALE Base Sepolia",
    rpcUrl: "https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha",
    explorerUrl: "https://base-sepolia-testnet-explorer.skalenodes.com",
    faucetUrl: "https://base-sepolia-faucet.skale.space"
};

// Mainnet configuration
const SKALE_BASE_MAINNET = {
    chainId: 1187947933,
    name: "SKALE Base",
    rpcUrl: "https://skale-base.skalenodes.com/v1/base",
    explorerUrl: "https://skale-base-explorer.skalenodes.com"
};

// Connect to testnet
const provider = new ethers.JsonRpcProvider(SKALE_BASE_TESTNET.rpcUrl);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Get CREDIT from faucet
async function getFaucetCredits(address: string) {
    const response = await fetch(SKALE_BASE_TESTNET.faucetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address })
    });
    return await response.json();
}
```

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SKALEBaseTokens {
    // SKALE Base mainnet token addresses
    address public constant USDC = 0x85889c8c714505E0c94b30fcfcF64fE3Ac8FCb20;
    address public constant USDT = 0x2bF5bF154b515EaA82C31a65ec11554fF5aF7fCA;
    address public constant WBTC = 0x1aeeCFE5454c83B42D8A316246CAc9739E7f690e;
    address public constant WETH = 0x7bD39ABBd0Dd13103542cAe3276C7fA332bCA486;
    address public constant ETHC = 0xD2Aaa00700000000000000000000000000000000;

    // Deployed contracts
    address public constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
}
```

```typescript
// Foundry configuration
// foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.24"

[rpc_endpoints]
skale_base_mainnet = "https://skale-base.skalenodes.com/v1/base"
skale_base_testnet = "https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha"

// Deployment
// forge script script/Deploy.s.s \
//   --rpc-url $SKALE_BASE_TESTNET_RPC \
//   --private-key $PRIVATE_KEY \
//   --legacy \
//   --slow \
//   --broadcast
```

## Bridged Tokens

### Mainnet Tokens

| Token | Symbol | Base Address | SKALE Base Address |
|-------|--------|--------------|-------------------|
| USDC | USDC.e | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | `0x85889c8c714505E0c94b30fcfcF64fE3Ac8FCb20` |
| USDT | USDT | `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2` | `0x2bF5bF154b515EaA82C31a65ec11554fF5aF7fCA` |
| WBTC | WBTC | `0x0555E30da8f98308EdB960aa94C0Db47230d2B9c` | `0x1aeeCFE5454c83B42D8A316246CAc9739E7f690e` |
| WETH | WETH | `0x4200000000000000000000000000000000000006` | `0x7bD39ABBd0Dd13103542cAe3276C7fA332bCA486` |
| ETH (ERC-20) | ETHC | Native ETH (Gas) | `0xD2Aaa00700000000000000000000000000000000` |

### Testnet Tokens

| Token | Symbol | Base Sepolia Address | SKALE Base Sepolia Address |
|-------|--------|---------------------|---------------------------|
| SKALE | SKL | `0xC20874EB2D51e4e61bBC07a4E7CA1358F449A2cF` | `0xaf2e0ff5b5f51553fdb34ce7f04a6c3201cee57b` |
| USDC | USDC.e | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | `0x2e08028E3C4c2356572E096d8EF835cD5C6030bD` |
| USDT | USDT | `0x0eda7df37785f570560dA74ceCFD435AB60D84a8` | `0x3ca0a49f511c2c89c4dcbbf1731120d8919050bf` |
| WBTC | WBTC | `0xC3893AEC98b41c198A11AcD9db17688D858588Bc` | `0x4512eacd4186b025186e1cf6cc0d89497c530e87` |
| WETH | WETH | `0x4200000000000000000000000000000000000006` | `0xf94056bd7f6965db3757e1b145f200b7346b4fc0` |
| ETH (ERC-20) | ETHC | Native ETH (Gas) | `0xD2Aaa00700000000000000000000000000000000` |

## Deployed Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| Permit2 | `0x000000000022D473030F116dDEE9F6B43aC78BA3` | Uniswap signature-based approvals |

## Chain Notes

- **ETH Bridging**: When bridging ETH from Base to SKALE Base, ETH is locked as native ETH (msg.value) and minted as an ERC-20 called ETHC on SKALE Base. Display it as ETH in frontend.
- **WETH vs ETHC**: Both are ERC-20 on SKALE Base, but deposited differently. WETH is deposited as WETH on Base.
- **Testnet Access**: SKALE Base Sepolia testnet is 100% permissionless.
- **Canonical Addresses**: CREATE2Factory, SingletonFactory, Multicall3, and Permit2 are deployed to their canonical addresses.
- **Additional Tokens**: Join SKALE Telegram to request additional tokens on testnet.
- **No Factory Contracts**: Current SKALE Base does not have standard factory contracts deployed (CREATE2Factory exists but not Uniswap-style factory).

## Mainnet Deployment

### CREDIT Purchase and Chain Operations

SKALE Base uses a subscription-based pricing model with CREDIT tokens for chain operations.

### Purchasing CREDIT for Chain Operations

1. Go to **https://portal.skale.space/chains**
2. Select **SKALE Base** chain
3. Click **Manage**
4. Connect your wallet
5. Input number of months to pre-pay
6. Follow prompts to bridge SKL tokens if needed
7. Pay for chain operations

### Pricing

| Chain Type | Cost per Month |
|------------|----------------|
| Hub Chain (1/8 node) | ~$7,200 (governed by SKALE DAO) |
| Performance Chain (1/32) | ~$7,200 (governed by SKALE DAO) |

**Note**: Prices are governed by SKALE DAO and can change.

### Payment Details

- **Payment Location**: SKALE Europa Hub
- **Paymaster Contract**: `0x0d66cA00CbAD4219734D7FDF921dD7Caadc1F78D`
- **Prepayment**: Can pre-pay up to 24 months to lock in pricing
- **Timing**: Payments occur before the 1st of each month

### sFUEL Distribution for Users

Your dApp needs to distribute sFUEL to users since:
- sFUEL has no market value (cannot be purchased by users)
- Users need sFUEL to transact on SKALE Base
- You distribute sFUEL, not users purchasing gas

**Distribution Methods**:
1. **dApp-integrated**: Distribute sFUEL during user onboarding
2. **Public faucet**: Use or deploy a public faucet
3. **Operator distribution**: Coordinate with chain operator

```typescript
// Example: Distribute sFUEL on user signup
async function onboardUser(userAddress: string) {
    // 1. Check user's sFUEL balance
    const balance = await provider.getBalance(userAddress);

    // 2. If low, distribute sFUEL
    if (balance < 1000000000000000000n) {  // 0.001 CREDIT
        await distributeSFuel(userAddress);
    }
}

async function distributeSFuel(to: string) {
    // Call your sFUEL distribution contract
    const distributor = new Contract(
        SFUEL_DISTRIBUTOR_ADDRESS,
        ["function distribute(address,uint256)"],
        wallet
    );

    await distributor.distribute(to, 10000000000000000000n);  // 0.01 CREDIT
}
```

### Mainnet Deployment Checklist

Before deploying to SKALE Base mainnet:

- [ ] Deploy and test on SKALE Base testnet
- [ ] Verify Solidity version ≤ 0.8.24
- [ ] Ensure no `msg.value` usage for payments (sFUEL has no value)
- [ ] Set up sFUEL distribution for users
- [ ] Purchase CREDIT for chain operations (if applicable)
- [ ] Review contract for factory patterns (flag during SKALE team review)
- [ ] Contact SKALE team for deployment review
- [ ] Verify bridged tokens are available for your use case

### Getting Mainnet Access

SKALE Base mainnet is currently in **private beta**. To get access:

1. Join SKALE Discord: https://discord.gg/skale
2. Contact the SKALE team about SKALE Base mainnet access
3. Submit your dApp for review
4. Complete go-live checklist with Developer Success team

## Environment Variables

```bash
# SKALE Base Mainnet
SKALE_BASE_MAINNET_RPC=https://skale-base.skalenodes.com/v1/base
SKALE_BASE_MAINNET_CHAIN_ID=1187947933
SKALE_BASE_MAINNET_EXPLORER=https://skale-base-explorer.skalenodes.com

# SKALE Base Testnet
SKALE_BASE_TESTNET_RPC=https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha
SKALE_BASE_TESTNET_CHAIN_ID=324705682
SKALE_BASE_TESTNET_EXPLORER=https://base-sepolia-testnet-explorer.skalenodes.com
SKALE_BASE_TESTNET_FAUCET=https://base-sepolia-faucet.skale.space

# Base Mainnet (for bridging)
BASE_MAINNET_RPC=https://mainnet.base.org
BASE_MAINNET_CHAIN_ID=8453

# Base Testnet (for bridging)
BASE_TESTNET_RPC=https://sepolia.base.org
BASE_TESTNET_CHAIN_ID=84532
```

## Integration Checklist

- [ ] Use correct RPC URL for SKALE Base (not Europa or Calypso)
- [ ] Use correct chain ID (1187947933 for mainnet, 324705682 for testnet)
- [ ] Get CREDIT from faucet for testnet development
- [ ] Use SKALE Base token addresses (not Base addresses)
- [ ] Use Foundry with `--legacy --slow` flags for deployment
- [ ] Test on testnet before mainnet

## References

- [SKALE Base Documentation](https://docs.skale.space/get-started/quick-start/skale-on-base)
- [SKALE Base Portal (Mainnet)](https://base.skalenodes.com/chains/base)
- [SKALE Base Portal (Testnet)](https://base-sepolia.skalenodes.com)
- [SKALE Discord](https://discord.gg/skale)
