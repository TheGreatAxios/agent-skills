# Rule: skale-on-ethereum

> **Only use if explicitly requested.** Default to SKALE Base chains. See `chain-hierarchy.md` for chain selection guidance.

## Why It Matters

SKALE Network connects with Ethereum mainnet for asset bridging and cross-chain functionality. Understanding the correct bridge configuration, gas differences, and deployment patterns is essential for building applications that work across both Ethereum and SKALE chains.

**Note:** BITE Protocol is NOT available on SKALE Ethereum chains. For BITE features, use SKALE Base or BITE Sandbox chains.

## Chain Information

### Ethereum Mainnet

| Property | Value |
|----------|-------|
| Chain ID | 1 |
| RPC URL | `https://eth.llamarpc.com` or `https://rpc.ankr.com/eth` |
| Explorer | `https://etherscan.io` |
| Gas Token | ETH |
| Gas Model | EIP-1559 |
| Block Time | ~12 seconds |

### Ethereum Sepolia Testnet

| Property | Value |
|----------|-------|
| Chain ID | 11155111 |
| RPC URL | `https://rpc.sepolia.org` |
| Explorer | `https://sepolia.etherscan.io` |
| Gas Token | Sepolia ETH |
| Gas Model | EIP-1559 |

### SKALE Chains

See `chain-target-correct` rule for complete SKALE chain information (Europa, Calypso, etc.).

## Gas Cost Comparison

| Operation | Ethereum | SKALE | Savings |
|-----------|----------|-------|---------|
| ERC20 Transfer | ~50,000 gas | ~0 | ~100% |
| Token Swap | ~150,000 gas | ~0 | ~100% |
| NFT Mint | ~100,000 gas | ~0 | ~100% |
| Contract Call | ~50,000 gas | ~0 | ~100% |

At 20 gwei, a 150,000 gas transaction costs ~0.003 ETH (~$10-20). On SKALE: ~$0.

## Bridge Integration

### Ethereum → SKALE (Lock & Mint)

```typescript
import { SKALEBridge } from "@skale/bridge";

const bridge = new SKALEBridge({
    sourceChain: "ethereum",
    targetChain: "skale_europa",
    rpcUrl: "https://eth.llamarpc.com"
});

async function bridgeToSKALE(tokenAddress: string, amount: bigint) {
    // 1. Approve bridge on Ethereum (requires gas)
    const token = new ERC20Token(tokenAddress, provider);
    const approveTx = await token.approve(BRIDGE_ADDRESS, amount);
    await approveTx.wait();

    // 2. Initiate bridge (requires gas on Ethereum)
    const tx = await bridge.deposit({
        token: tokenAddress,
        amount: amount,
        destinationChain: "skale_europa"
    });

    await tx.wait();
    // Tokens are locked on Ethereum, minted on SKALE
}
```

### SKALE → Ethereum (Burn & Unlock)

```typescript
async function bridgeToEthereum(tokenAddress: string, amount: bigint) {
    // On SKALE - zero gas for transaction
    const tx = await bridge.exit({
        token: tokenAddress,
        amount: amount,
        destinationChain: "ethereum"
    });

    await tx.wait();
    // Tokens are burned on SKALE, unlocked on Ethereum
}
```

## Incorrect

```typescript
// Not accounting for gas on Ethereum
async function sendToEthereum(tx: Transaction) {
    await wallet.sendTransaction(tx);
    // Fails: No gas parameters set for Ethereum
}

// Using SKALE patterns on Ethereum
const tx = {
    to: address,
    data: calldata
    // Missing maxFeePerGas, gasLimit for Ethereum
};
```

```solidity
// Not handling bridged tokens correctly
contract BadBridgeHandler {
    IERC20 public token;

    function deposit(uint256 amount) external {
        // Problem: Assumes token is already on this chain
        token.transferFrom(msg.sender, address(this), amount);
        // No bridge integration
    }
}
```

## Correct

```typescript
class EthSkaleProvider {
    private ethProvider: JsonRpcProvider;
    private skaleProvider: JsonRpcProvider;

    constructor() {
        this.ethProvider = new JsonRpcProvider("https://eth.llamarpc.com");
        this.skaleProvider = new JsonRpcProvider("https://rpc.europa.skale.network");
    }

    async sendTransaction(
        chain: "ethereum" | "skale",
        tx: Transaction
    ): Promise<TransactionReceipt> {
        const provider = chain === "ethereum" ? this.ethProvider : this.skaleProvider;
        const wallet = new Wallet(PRIVATE_KEY, provider);

        // Ethereum: Estimate and set gas
        if (chain === "ethereum") {
            const feeData = await provider.getFeeData();
            const estimatedGas = await provider.estimateGas(tx);

            return await wallet.sendTransaction({
                ...tx,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                gasLimit: estimatedGas.mul(120).div(100)  // 20% buffer
            });
        } else {
            // SKALE: Zero gas, just gas limit
            return await wallet.sendTransaction({
                ...tx,
                gasLimit: 1000000
            });
        }
    }
}
```

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Ethereum-SKALE Bridge Handler
contract EthSKALEBridge is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public immutable skaleBridge;
    address public immutable skaleChainAddress;

    mapping(bytes32 => bool) public processedDeposits;

    event DepositToSKALE(
        address indexed token,
        address indexed from,
        uint256 amount,
        address skaleRecipient
    );

    constructor(address _skaleBridge, address _skaleChainAddress) {
        skaleBridge = _skaleBridge;
        skaleChainAddress = _skaleChainAddress;
    }

    /// @notice Deposit tokens from Ethereum to SKALE
    function depositToSKALE(
        address token,
        uint256 amount,
        address skaleRecipient
    ) external nonReentrant {
        // Transfer tokens to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Approve SKALE bridge
        IERC20(token).safeApprove(skaleBridge, amount);

        emit DepositToSKALE(token, msg.sender, amount, skaleRecipient);

        // Call SKALE bridge to initiate transfer
        (bool success, ) = skaleBridge.call(
            abi.encodeWithSignature(
                "deposit(address,uint256,uint256,address)",
                token,
                amount,
                skaleChainAddress,
                skaleRecipient
            )
        );

        require(success, "Bridge deposit failed");
    }
}
```

## Scaling Strategy

### Workload Distribution

| Pattern | Ethereum | SKALE | Use Case |
|---------|----------|-------|----------|
| Asset Storage | High-value assets | Active assets | Keep most funds on SKALE for operations |
| Settlement | Final settlements | Daily operations | Batch settle to Ethereum periodically |
| NFT Trading | Final ownership | Marketplace activity | Trade on SKALE, settle to Ethereum |
| DeFi Operations | Large trades | Small/medium trades | Avoid gas for most DeFi operations |

```typescript
class HybridApp {
    // High-frequency operations on SKALE (zero gas)
    async highFrequencyOps(amount: bigint) {
        const skaleContract = new Contract(
            SKALE_CONTRACT_ADDRESS,
            abi,
            new Wallet(PRIVATE_KEY, skaleProvider)
        );
        await skaleContract.highFrequencyFunction(amount);
    }

    // Low-frequency, high-value operations on Ethereum
    async settleToEthereum(amount: bigint) {
        const ethContract = new Contract(
            ETH_CONTRACT_ADDRESS,
            abi,
            new Wallet(PRIVATE_KEY, ethProvider)
        );
        const tx = await ethContract.settleFunction(amount);
        await tx.wait();
    }
}
```

## Configuration

### Environment Variables

```bash
# Ethereum
ETH_RPC_URL=https://eth.llamarpc.com
ETH_EXPLORER_API_KEY=your_etherscan_key

# SKALE
SKALE_EUROPA_RPC=https://rpc.europa.skale.network
SKALE_CALYPSO_RPC=https://rpc.calypso.skale.network

# Bridge
SKALE_BRIDGE_ADDRESS=0x...
```

### Foundry Configuration

```toml
# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]

[rpc_endpoints]
ethereum = "https://eth.llamarpc.com"
sepolia = "https://rpc.sepolia.org"
skale_europa = "https://rpc.europa.skale.network"
```

## Best Practices

1. **Use SKALE for high-frequency operations**: Save gas by doing most operations on SKALE
2. **Batch settlements**: Accumulate operations on SKALE, settle to Ethereum periodically
3. **Bridge strategically**: Only bridge what's needed, when it's needed
4. **Monitor gas prices**: Time Ethereum operations for lower gas periods
5. **Test on testnets**: Always test cross-chain operations on testnets first
6. **Handle bridge timing**: Bridge operations take time, account for this in UX

## Integration Checklist

- [ ] Use correct RPC endpoints for Ethereum and SKALE
- [ ] Handle gas differences (Ethereum requires gas, SKALE does not)
- [ ] Set appropriate gas parameters for Ethereum transactions
- [ ] Test bridge operations on testnet before mainnet
- [ ] Handle bridge timing and confirmations
- [ ] Use scaling strategy to distribute workload

## References

- [SKALE Documentation](https://docs.skale.space)
- [SKALE Bridge Documentation](https://docs.skale.space/bridge)
- [Etherscan](https://etherscan.io)
