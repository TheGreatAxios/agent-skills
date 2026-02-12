# Rule: bite-encrypted-transactions (Phase I)

## Why It Matters

BITE Phase I encrypts transaction data (calldata + recipient) before submission. The encrypted data is only decrypted by the consensus committee during execution, keeping sensitive information private from the public mempool.

## Available Chains

| Chain | Chain ID | Phase I Support |
|-------|----------|-----------------|
| SKALE Base Sepolia | 324705682 | ✅ |
| SKALE Base | 1187947933 | ✅ |
| BITE V2 Sandbox 2 | 1036987955 | ✅ |

## Key Constants

```typescript
const BITE_MAGIC_ADDRESS = "0x0000000000000000000000000000000000000401";
const DEFAULT_GAS_LIMIT = 300000;
```

## Incorrect

```typescript
// Missing gas limit - BITE requires manual gasLimit
const bite = new BITE(providerUrl);
const encryptedTx = await bite.encryptTransaction(transaction);
await wallet.sendTransaction(encryptedTx);
// ERROR: estimateGas does not work for BITE transactions
```

```typescript
// Not handling committee rotation
const committees = await bite.getCommitteesInfo();
// If length === 2, rotation in progress
// Must encrypt for BOTH committees
```

## Correct

```typescript
import { BITE } from "@skalenetwork/bite";

class BITETransactionManager {
    private bite: BITE;

    constructor(private providerUrl: string) {
        this.bite = new BITE(providerUrl);
    }

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
        // estimateGas does not work for encrypted transactions
        const txWithGas = {
            ...encryptedTx,
            gasLimit: 300000  // Default: 300k, increase for complex txs
        };

        // 4. Send encrypted transaction
        const tx = await wallet.sendTransaction(txWithGas);
        const receipt = await tx.wait();

        return receipt.transactionHash;
    }

    async getDecryptedData(txHash: string) {
        return await this.bite.getDecryptedTransactionData(txHash);
    }

    async getCommitteeInfo() {
        const committees = await this.bite.getCommitteesInfo();

        // Two committees = rotation in progress (next 3 minutes)
        if (committees.length === 2) {
            console.log("Committee rotation - dual encryption mode");
        }

        return committees;
    }
}
```

## Committee Rotation Handling

```typescript
class RotationAwareBITE {
    private bite: BITE;

    constructor(providerUrl: string) {
        this.bite = new BITE(providerUrl);
    }

    async sendWithRotationCheck(
        contractAddress: string,
        calldata: string
    ): Promise<string> {
        const committees = await this.bite.getCommitteesInfo();

        // Log rotation status
        if (committees.length === 2) {
            console.log(`Rotation: epoch ${committees[0].epochId} → ${committees[1].epochId}`);
        }

        // BITE SDK handles dual encryption automatically
        const encryptedTx = await this.bite.encryptTransaction({
            to: contractAddress,
            data: calldata,
            gasLimit: 300000
        });

        const tx = await wallet.sendTransaction(encryptedTx);
        return (await tx.wait()).transactionHash;
    }
}
```

## Batch Encryption

```typescript
class BatchEncryptor {
    private bite: BITE;

    constructor(providerUrl: string) {
        this.bite = new BITE(providerUrl);
    }

    async encryptBatch(transactions: Array<{ to: string; data: string }>) {
        // Get committee info once for all transactions
        const committees = await this.bite.getCommitteesInfo();

        // Encrypt all with cached committee info
        return Promise.all(
            transactions.map(tx =>
                BITE.encryptTransactionWithCommitteeInfo(tx, committees)
            )
        );
    }
}
```

## Gas Limit Guidelines

| Scenario | Gas Limit | Notes |
|----------|-----------|-------|
| Default | 300,000 | BITE auto-sets if not specified |
| Complex tx | 500,000+ | Manual setting recommended |
| estimateGas | ❌ Never use | Does not work for BITE |

## Encryption Flow

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
       └───> Send to BITE magic address (0x...0401)
              │
              └──> SKALE Consensus (2t+1 nodes)
                     │
                     └──> Threshold decryption
                            │
                            └──> Execute decrypted transaction
```

## Committee Model

| Parameter | Value |
|-----------|-------|
| Committee size | 3t + 1 nodes |
| Decryption threshold | 2t + 1 nodes |
| Single committee | Normal operation |
| Dual committee | Rotation (3 min window) |

## Integration Checklist

- [ ] Install `@skalenetwork/bite` package
- [ ] Always set `gasLimit` manually
- [ ] Handle committee rotation for time-sensitive txs
- [ ] Cache committee info for batch operations
- [ ] Use `getDecryptedTransactionData` to retrieve decrypted data
- [ ] Test on testnet/sandbox first

## Use Cases

- Private token transfers
- Confidential voting
- Private bid submissions
- Encrypted function calls
- Sensitive state updates

## References

- [BITE TypeScript Library](https://github.com/skalenetwork/bite-ts)
- [npm: @skalenetwork/bite](https://www.npmjs.com/package/@skalenetwork/bite)
