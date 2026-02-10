# Rule: privacy-bite-protocol

## Why It Matters

BITE Protocol provides threshold encryption for transaction data on SKALE Network. It encrypts transaction data before submitting to the blockchain, keeping it private until decrypted by the consensus committee. This enables truly private transactions without revealing sensitive data to the public mempool or chain state.

## Incorrect

```typescript
// Sending unencrypted transaction data - visible to everyone
async function sendTransaction(contractAddress: string, calldata: string) {
    const tx = await wallet.sendTransaction({
        to: contractAddress,
        data: calldata  // Visible in mempool and on-chain!
    });
    await tx.wait();
}

// Not using BITE encryption for sensitive data
const transaction = {
    to: tokenContract,
    data: tokenInterface.encodeFunctionData("transfer", [recipient, amount])
};
// Amount and recipient visible to all
```

```typescript
// Missing gas limit - BITE requires manual gasLimit
const bite = new BITE(providerUrl);
const encryptedTx = await bite.encryptTransaction(transaction);
await wallet.sendTransaction(encryptedTx);
// ERROR: gasLimit not set, transaction may fail
```

## Correct

```typescript
import { BITE } from "@skalenetwork/bite";

class BITETransactionManager {
    private bite: BITE;

    constructor(private providerUrl: string) {
        this.bite = new BITE(providerUrl);
    }

    /// Encrypt and send transaction with threshold encryption
    async sendEncryptedTransaction(
        contractAddress: string,
        calldata: string
    ): Promise<string> {
        // 1. Prepare transaction
        const transaction = {
            to: contractAddress,
            data: calldata
        };

        // 2. Encrypt using BLS threshold encryption
        const encryptedTx = await this.bite.encryptTransaction(transaction);

        // 3. CRITICAL: Set gasLimit manually
        // estimateGas does not work properly for encrypted transactions
        // BITE defaults to 300000 if not set
        const txWithGas = {
            ...encryptedTx,
            gasLimit: 300000
        };

        // 4. Send encrypted transaction
        const tx = await wallet.sendTransaction(txWithGas);
        const receipt = await tx.wait();

        return receipt.transactionHash;
    }

    /// Get decrypted transaction data from chain
    async getDecryptedData(txHash: string): Promise<{ data: string; to: string }> {
        return await this.bite.getDecryptedTransactionData(txHash);
    }

    /// Check committee info for rotation monitoring
    async getCommitteeInfo(): Promise<CommitteeInfo[]> {
        const committees = await this.bite.getCommitteesInfo();

        // Two committees = rotation in progress (next 3 minutes)
        if (committees.length === 2) {
            console.log("Committee rotation scheduled - dual encryption mode");
        }

        return committees;
    }

    /// Encrypt with cached committee info (no RPC call)
    async encryptWithCachedInfo(
        transaction: any,
        committeeInfo: CommitteeInfo[]
    ): Promise<any> {
        return BITE.encryptTransactionWithCommitteeInfo(transaction, committeeInfo);
    }
}

interface CommitteeInfo {
    commonBLSPublicKey: string;  // 256-char hex (128-byte BLS public key)
    epochId: number;
}
```

```typescript
// Handling committee rotation gracefully
class RotationAwareBITE {
    private bite: BITE;
    private cachedCommittees: CommitteeInfo[] = [];

    constructor(private providerUrl: string) {
        this.bite = new BITE(providerUrl);
    }

    async sendTransactionWithRotationCheck(
        contractAddress: string,
        calldata: string
    ): Promise<string> {
        // Check committee status
        const committees = await this.bite.getCommitteesInfo();
        this.cachedCommittees = committees;

        // Log rotation status
        if (committees.length === 2) {
            console.log(`Rotation imminent: epoch ${committees[0].epochId} -> ${committees[1].epochId}`);
        }

        // Encrypt transaction (handles single/dual committee automatically)
        const encryptedTx = await this.bite.encryptTransaction({
            to: contractAddress,
            data: calldata,
            gasLimit: 300000  // Always set gasLimit
        });

        const tx = await wallet.sendTransaction(encryptedTx);
        return (await tx.wait()).transactionHash;
    }
}
```

```typescript
// Batch encryption with shared committee info
class BatchEncryptor {
    private bite: BITE;

    constructor(providerUrl: string) {
        this.bite = new BITE(providerUrl);
    }

    async encryptBatch(transactions: Array<{ to: string; data: string }>): Promise<any[]> {
        // Get committee info once for all transactions
        const committees = await this.bite.getCommitteesInfo();

        // Encrypt all transactions using cached committee info
        return Promise.all(
            transactions.map(tx =>
                BITE.encryptTransactionWithCommitteeInfo(tx, committees)
            )
        );
    }
}
```

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BITE-enabled contract
/// @notice Contract that handles BITE-encrypted transactions
/// @dev BITE transactions are sent to the magic address and decrypted by consensus
contract BITEHandler {
    // BITE magic address - receives encrypted transactions
    address public constant BITE_MAGIC_ADDRESS = 0x0000000000000000000000000000000000000401;

    event DecryptedCallReceived(
        address indexed originalTo,
        bytes data,
        uint256 value
    );

    /// @notice Handle data that was decrypted by BITE consensus
    /// @dev This is called after consensus decrypts the transaction
    function handleDecryptedCall(
        address originalTo,
        bytes calldata data,
        uint256 value
    ) external {
        // Verify this was called by BITE protocol
        // (Implementation depends on SKALE's BITE integration)

        // Execute the intended call
        (bool success, bytes memory result) = originalTo.call{ value: value }(data);
        require(success, "Call failed");

        emit DecryptedCallReceived(originalTo, data, value);
    }

    /// @notice Example: Private token transfer
    function privateTransfer(
        address token,
        address recipient,
        uint256 amount
    ) external {
        // This would be called via BITE-decrypted transaction
        IERC20(token).transfer(recipient, amount);
    }
}
```

## Context

### BITE Protocol Architecture

```
User Transaction
       │
       ├───> BITE.encryptTransaction()
       │        │
       │        ├── 1. RLP encode (data, to)
       │        ├── 2. AES encrypt with random key
       │        ├── 3. BLS threshold encrypt AES key
       │        └── 4. Create payload: [EPOCH_ID, ENCRYPTED_DATA]
       │
       └───> Send to BITE magic address
              │
              └──> SKALE Consensus (2t+1 nodes)
                     │
                     └──> Threshold decryption
                            │
                            └──> Execute decrypted transaction
```

### Committee Model

| Parameter | Description |
|-----------|-------------|
| Committee size | `3t + 1` nodes |
| Decryption threshold | `2t + 1` nodes |
| Single committee mode | Normal operation |
| Dual committee mode | During rotation (3 min window) |

### Encryption Process

1. **RLP Encoding**: Original `data` and `to` fields are RLP encoded
2. **AES Encryption**: Encoded data encrypted with randomly generated AES key
3. **BLS Threshold Encryption**: AES key encrypted using committee's BLS public key
4. **Final Payload**: RLP format `[EPOCH_ID, ENCRYPTED_BITE_DATA]`

### Gas Limit Behavior

| Scenario | Gas Limit | Notes |
|----------|-----------|-------|
| Not set | 300,000 (default) | BITE auto-sets |
| Manual set | User-defined | Recommended for complex txs |
| estimateGas | Does not work | Never use for BITE txs |

### Committee Rotation

- **Rotation window**: 3 minutes before scheduled rotation
- **Detection**: `getCommitteesInfo()` returns 2 committees
- **Behavior**: Data encrypted with BOTH current and next committee keys
- **Monitoring**: Check array length to detect rotation periods

### JSON-RPC Methods

| Method | Purpose |
|--------|---------|
| `bite_getCommitteesInfo` | Get current committee BLS public keys |
| `bite_getDecryptedTransactionData` | Retrieve decrypted transaction data |

### Transaction Visibility

| Data Type | Without BITE | With BITE |
|-----------|--------------|-----------|
| Calldata | Public | Encrypted |
| Recipient | Public | Encrypted |
| Sender | Public | Public (signed by sender) |
| Value | Public | Public |
| Decrypted data | N/A | Available via RPC after consensus |

### Integration Checklist

- [ ] Install `@skalenetwork/bite` package
- [ ] Always set `gasLimit` manually (never use estimateGas)
- [ ] Handle committee rotation for time-sensitive transactions
- [ ] Cache committee info for batch operations
- [ ] Use `getDecryptedTransactionData` to retrieve decrypted data
- [ ] Test on testnet before mainnet

### Use Cases

- Private token transfers
- Confidential voting
- Private bid submissions
- Encrypted function calls
- Sensitive state updates

### Limitations

- Sender address remains public (transaction is signed)
- ETH/value transfers remain visible
- Decrypted data retrievable via JSON-RPC
- Only works on BITE-enabled SKALE chains

## References

- [BITE TypeScript Library](https://github.com/skalenetwork/bite-ts)
- [npm package](https://www.npmjs.com/package/@skalenetwork/bite)
- [SKALE Network Documentation](https://docs.skale.space)
