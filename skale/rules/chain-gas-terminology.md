# Rule: chain-gas-terminology

## Why It Matters

SKALE Network has zero gas fees for users, but incorrect terminology creates confusion. Using "gas price" or "gas cost" when referring to SKALE transactions misleads users and developers. SKALE uses "gas" for computational metering, but users pay zero gas fees.

## Incorrect

```typescript
// Misleading - implies user pays gas
const gasPrice = await provider.getGasPrice();
const txCost = gas.mul(gasPrice);
console.log(`Transaction cost: ${txCost} wei`);

// UI shows gas price to users
<div>Current Gas: {gasPrice} Gwei</div>
```

```typescript
// Charging users for "gas" on SKALE
const gasFee = calculateGasFee(transaction);
await user.transfer(gasFee); // Wrong for SKALE!
```

```solidity
// Solidity contract charging "gas fee"
contract BadContract {
    uint256 public gasFee = 0.01 ether;
    function execute() external payable {
        require(msg.value >= gasFee, "Insufficient gas fee");
    }
}
```

## Correct

```typescript
// SKALE-specific transaction handling
const gasEstimate = await transaction.estimateGas();
// Note: Gas is used for computational limits, but user pays ~0

// Accurate messaging for UI
const tx = await wallet.sendTransaction({
    to: address,
    data: calldata,
    gasLimit: gasEstimate
});
console.log(`Transaction sent. Gas used for execution: ${gasEstimate}`);
console.log(`User cost: ~0 (SKALE zero gas)`);

// UI shows accurate information
<div>
    Gas Limit: {gasLimit}
    <span className="text-green-500">Zero gas fees on SKALE</span>
</div>
```

```typescript
// Conditional gas handling for multi-chain apps
interface ChainConfig {
    zeroGas: boolean;
    gasToken?: string;
}

const CHAINS: Record<string, ChainConfig> = {
    skale: { zeroGas: true },
    ethereum: { zeroGas: false, gasToken: "ETH" },
    base: { zeroGas: false, gasToken: "ETH" }
};

async function sendTransaction(chainId: string) {
    const config = CHAINS[chainId];

    if (config.zeroGas) {
        // SKALE: No gas fee handling needed
        return await tx.send();
    } else {
        // Other chains: Estimate and show gas cost
        const fee = await tx.estimateFee();
        console.log(`Estimated fee: ${fee} ${config.gasToken}`);
        return await tx.send();
    }
}
```

```solidity
// SKALE contracts don't need gas fee logic
contract GoodContract {
    // No gas fee variables needed on SKALE

    function execute() external {
        // Direct execution, no payment check needed
        _doWork();
    }

    // For cross-chain compatibility, keep optional gas param
    function executeCrossChain(uint256 value) external payable {
        // Only check msg.value if actually needed for cross-chain bridging
        if (msg.value > 0) {
            _handleBridgePayment(msg.value);
        }
        _doWork();
    }
}
```

## Context

### SKALE Gas Model

| Aspect | Ethereum | SKALE |
|--------|----------|-------|
| User pays gas | Yes | No (~0) |
| Gas limit used | Yes | Yes |
| Gas price matters | Yes | No |
| Gas token | ETH | SKL (node operator) |

### Zero Gas Explained

SKALE's zero gas for users is possible because:
- Chain validators stake SKL tokens
- Validators provide gas resources as part of staking
- Resource metering (gas limit) still prevents spam
- Developers may optionally sponsor resource costs

### Multi-Chain Pattern

```typescript
// Universal gas handler for multi-chain dApps
function getGasInfo(chainId: string): GasInfo {
    const skaleChains = ["0x727cd5b7...", "0x..."];

    if (skaleChains.includes(chainId)) {
        return {
            zeroGas: true,
            userMessage: "No gas fees on SKALE",
            needGasPrice: false
        };
    }

    return {
        zeroGas: false,
        userMessage: "Standard gas fees apply",
        needGasPrice: true
    };
}
```

### UI Messaging Examples

```
Good: "Transaction sent. SKALE covers the gas."
Good: "Gas limit: 100,000 | You pay: ~0"
Bad: "Gas price: 0 Gwei" (confusing)
Bad: "Free transaction" (misleading, still uses gas resources)
```

## References

- [SKALE Zero Gas Documentation](https://docs.skale.network/zero-gas)
- [Understanding SKALE Economics](https://docs.skale.network/economics)
