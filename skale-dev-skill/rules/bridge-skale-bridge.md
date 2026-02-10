# Rule: bridge-skale-bridge

## Why It Matters

SKALE Bridge enables secure asset transfers between SKALE chains, Ethereum, and Base. Correct implementation prevents lost funds, failed transfers, and ensures proper handling of bridged assets.

## Incorrect

```typescript
// Not using official SKALE Bridge
async function transferToSKALE(amount: bigint) {
    // Direct transfer - won't work!
    await token.transfer(skaleAddress, amount);
}

// Wrong: Using ETH transfer for ERC20
const tx = await wallet.sendTransaction({
    to: SKALE_BRIDGE_ADDRESS,
    value: amount  // ERC20s don't use value!
});

// Missing approval for bridge
await bridgeContract.deposit(tokenAddress, amount);
// Fails: Bridge can't pull tokens
```

```solidity
// Solidity: Not handling bridged tokens correctly
contract BadBridgeHandler {
    IERC20 public token;

    function deposit(uint256 amount) external {
        // Problem: Assumes token is already on this chain
        token.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) external {
        // Problem: Doesn't handle bridge mint/burn
        token.transfer(msg.sender, amount);
    }
}
```

```typescript
// Missing confirmation and timeout handling
const tx = await bridge.deposit(token, amount);
// What if it fails? What if it takes too long?
```

## Correct

```typescript
// Using SKALE Bridge SDK
import { SKALEBridge, BridgeTransaction } from "@skale/bridge";

class SKALEBridgeManager {
    private bridge: SKALEBridge;
    private chainId: string;

    constructor(
        rpcUrl: string,
        chainId: string,
        privateKey: string
    ) {
        this.bridge = new SKALEBridge({
            rpcUrl,
            chainId,
            privateKey
        });
        this.chainId = chainId;
    }

    /// Bridge tokens from Ethereum to SKALE
    async bridgeToSKALE(
        tokenAddress: string,
        amount: bigint,
        targetChain: string
    ): Promise<string> {
        // 1. Approve bridge to spend tokens
        const approveTx = await this.bridge.approveToken(tokenAddress, amount);
        await approveTx.wait();
        console.log(`Approved ${amount} tokens for bridge`);

        // 2. Get current allowance (verify)
        const allowance = await this.bridge.getAllowance(
            tokenAddress,
            await this.getBridgeAddress()
        );
        if (allowance < amount) {
            throw new Error("Insufficient allowance");
        }

        // 3. Initiate bridge transfer
        const bridgeTx = await this.bridge.deposit({
            token: tokenAddress,
            amount: amount,
            destinationChain: targetChain,
            receiver: await this.getSignerAddress()
        });

        console.log(`Bridge transaction: ${bridgeTx.hash}`);

        // 4. Wait for confirmation with timeout
        const receipt = await this.waitForConfirmation(bridgeTx.hash, 300000);

        if (!receipt.status) {
            throw new Error("Bridge transaction failed");
        }

        console.log(`Bridged ${amount} tokens to ${targetChain}`);
        return receipt.transactionHash;
    }

    /// Bridge tokens from SKALE to Ethereum
    async bridgeToEthereum(
        tokenAddress: string,
        amount: bigint
    ): Promise<string> {
        // SKALE → Ethereum uses exit/withdraw
        const exitTx = await this.bridge.exit({
            token: tokenAddress,
            amount: amount,
            destinationChain: "ethereum",
            receiver: await this.getSignerAddress()
        });

        const receipt = await this.waitForConfirmation(exitTx.hash, 300000);
        return receipt.transactionHash;
    }

    /// Get bridge status
    async getTransferStatus(txHash: string): Promise<BridgeTransaction> {
        return await this.bridge.getTransactionStatus(txHash);
    }

    private async waitForConfirmation(
        txHash: string,
        timeout: number
    ): Promise<any> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const receipt = await this.bridge.provider.getTransactionReceipt(txHash);

            if (receipt) {
                return receipt;
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        throw new Error(`Transaction ${txHash} timed out after ${timeout}ms`);
    }

    private async getBridgeAddress(): Promise<string> {
        return await this.bridge.getBridgeAddress(this.chainId);
    }

    private async getSignerAddress(): Promise<string> {
        return (await this.bridge.signer.getAddress()).toLowerCase();
    }
}
```

```solidity
// Solidity: Handling bridged tokens correctly
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@skale/bridge/contracts/IMessageProxy.sol";

/// @title Bridge handler for SKALE
/// @notice Handles deposits and exits via SKALE Bridge
contract SKALEBridgeHandler {
    using SafeERC20 for IERC20;

    // SKALE Bridge contract addresses (predeployed)
    address public constant SKALE_BRIDGE = 0x...;
    address public constant MESSAGE_PROXY = 0x...;

    // Mapping of bridged tokens
    mapping(address => bool) public isBridgedToken;
    mapping(address => address) public originalToken;

    // Events
    event DepositInitiated(
        address indexed token,
        uint256 amount,
        uint256 targetChain
    );

    event ExitInitiated(
        address indexed token,
        uint256 amount,
        uint256 targetChain
    );

    event TransferReceived(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    modifier onlyBridge() {
        require(msg.sender == SKALE_BRIDGE, "Not bridge");
        _;
    }

    /// @notice Deposit tokens to bridge (to another chain)
    function deposit(
        address token,
        uint256 amount,
        uint256 targetChain
    ) external {
        require(isBridgedToken[token] || originalToken[token] != address(0), "Unknown token");

        // Transfer tokens from user to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Approve bridge contract
        IERC20(token).safeApprove(SKALE_BRIDGE, amount);

        // Call bridge to initiate transfer
        (bool success, ) = SKALE_BRIDGE.call(
            abi.encodeWithSignature(
                "deposit(address,uint256,uint256,address)",
                token,
                amount,
                targetChain,
                msg.sender
            )
        );

        require(success, "Bridge deposit failed");

        emit DepositInitiated(token, amount, targetChain);
    }

    /// @notice Exit tokens back to original chain
    function exit(
        address token,
        uint256 amount,
        uint256 targetChain
    ) external {
        require(isBridgedToken[token], "Not a bridged token");

        // Burn bridged tokens
        _burn(msg.sender, amount);

        // Send exit message via MessageProxy
        IMessageProxy(MESSAGE_PROXY).postMessage(
            targetChain,
            originalToken[token],
            abi.encode(msg.sender, amount),
            200000,  // gas limit
            0,       // gas price (SKALE)
            address(this)
        );

        emit ExitInitiated(token, amount, targetChain);
    }

    /// @notice Receive tokens from bridge (called by bridge contract)
    function receiveTransfer(
        address token,
        address to,
        uint256 amount
    ) external onlyBridge {
        require(to != address(0), "Invalid recipient");

        // Mint or release tokens to recipient
        if (isBridgedToken[token]) {
            _mint(to, amount);
        } else {
            IERC20(token).safeTransfer(to, amount);
        }

        emit TransferReceived(token, to, amount);
    }

    // Token functions for bridged tokens
    mapping(address => uint256) private balances;

    function _burn(address from, uint256 amount) private {
        require(balances[from] >= amount, "Insufficient balance");
        balances[from] -= amount;
    }

    function _mint(address to, uint256 amount) private {
        balances[to] += amount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}
```

```typescript
// Configuration for supported chains
// config/bridge.ts
export const BRIDGE_CONFIG = {
    ethereum: {
        chainId: 1,
        bridgeAddress: "0x...",
        messageProxyAddress: "0x...",
        tokens: {
            USDC: "0x...",
            USDT: "0x...",
            SKL: "0x..."
        }
    },
    skale_europa: {
        chainId: 0x727cd5b7...,
        bridgeAddress: "0x...",
        messageProxyAddress: "0x...",
        tokens: {
            USDC: "0x...",  // Bridged version
            USDT: "0x...",  // Bridged version
            SKL: "0x..."
        }
    },
    skale_calypso: {
        chainId: 0x...,
        bridgeAddress: "0x...",
        messageProxyAddress: "0x...",
        tokens: {
            USDC: "0x...",
            USDT: "0x..."
        }
    },
    base: {
        chainId: 8453,
        bridgeAddress: "0x...",
        tokens: {
            USDC: "0x...",
            SKL: "0x..."
        }
    }
} as const;

export function getBridgeConfig(chainId: string) {
    return Object.values(BRIDGE_CONFIG).find(c => c.chainId === chainId);
}
```

## Context

### SKALE Bridge Architecture

```
┌─────────────┐          SKALE Bridge          ┌─────────────┐
│  Ethereum   │ ──────────────────────────────▶│ SKALE Chain │
│  (ERC20)    │    Lock & Mint Pattern        │ (Bridged)   │
└─────────────┘                                └─────────────┘
       │                                             │
       │ Exit (Burn)                                │ Deposit (Lock)
       │                                             │
       └─────────────────────────────────────────────┘
```

### Bridge Operations

| Direction | Operation | Mechanism |
|-----------|-----------|-----------|
| Ethereum → SKALE | Deposit | Lock on Ethereum, Mint on SKALE |
| SKALE → Ethereum | Exit | Burn on SKALE, Unlock on Ethereum |
| SKALE ↔ SKALE | Transfer | Lock/Mint or Burn/Unlock |
| SKALE ↔ Base | Transfer | Via MessageProxy |

### Supported Token Types

| Type | Notes |
|------|-------|
| Native SKL | Direct transfer |
| ERC20 | Lock/mint pattern |
| ETH | Wrapped SKETH on SKALE |
| NFTs | ERC721 bridge support |

### Transaction Flow

```typescript
// 1. Approve bridge
await token.approve(BRIDGE_ADDRESS, amount);

// 2. Initiate bridge
const tx = await bridge.deposit({
    token: tokenAddress,
    amount: amount,
    destinationChain: targetChainId,
    receiver: recipientAddress
});

// 3. Wait for confirmation
const receipt = await tx.wait();

// 4. Track status
const status = await bridge.getTransactionStatus(receipt.transactionHash);

// 5. Claim on destination (automatic via relayers)
```

### Fee Structure

| Operation | Gas Cost | Additional Fees |
|-----------|----------|-----------------|
| Ethereum → SKALE | Ethereum gas | Bridge fee (~0.1%) |
| SKALE → Ethereum | SKALE gas (~0) | Exit fee |
| SKALE ↔ SKALE | SKALE gas (~0) | Minimal |

### Integration Checklist

- [ ] Import `@skale/bridge` SDK
- [ ] Configure bridge addresses per chain
- [ ] Implement token approval before bridge
- [ ] Add timeout handling for bridge transactions
- [ ] Track transaction status
- [ ] Handle failed bridge transactions
- [ ] Test on testnet before mainnet
- [ ] Implement event listeners for completed transfers

### Error Handling

```typescript
try {
    const tx = await bridge.deposit(params);
    await tx.wait();
} catch (error) {
    if (error.message.includes("Insufficient allowance")) {
        // Approve and retry
    } else if (error.message.includes("Bridge disabled")) {
        // Bridge is paused
    } else if (error.message.includes("Invalid chain")) {
        // Chain not supported
    } else {
        // Unknown error
    }
}
```

## References

- [SKALE Bridge Documentation](https://docs.skale.network/bridge)
- [SKALE Bridge SDK](https://github.com/skalenetwork/bridge-ui)
- [Cross-Chain Messaging](https://docs.skale.network/cross-chain)
