# Rule: bite-sdk-usage

## Why It Matters

The `@skalenetwork/bite` TypeScript SDK provides utilities for encrypting transactions and interacting with BITE Protocol from JavaScript/TypeScript applications.

## Installation

```bash
npm install @skalenetwork/bite
# or
bun add @skalenetwork/bite
```

## Basic Usage

```typescript
import { BITE } from '@skalenetwork/bite';

// Initialize with SKALE RPC URL
const bite = new BITE('https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha');
```

## Phase I: Encrypted Transactions

### Encrypt Transaction

```typescript
import { BITE } from '@skalenetwork/bite';
import { ethers } from 'ethers';

const bite = new BITE(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

async function sendEncryptedTx(to: string, data: string) {
    // 1. Encrypt the transaction
    const encryptedTx = await bite.encryptTransaction({
        to,
        data
    });

    // 2. CRITICAL: Set gas limit manually
    const tx = await wallet.sendTransaction({
        ...encryptedTx,
        gasLimit: 300_000
    });

    return await tx.wait();
}
```

### Get Decrypted Data

```typescript
// Retrieve decrypted transaction data after execution
async function getDecryptedData(txHash: string) {
    const { data, to } = await bite.getDecryptedTransactionData(txHash);
    console.log('Decrypted calldata:', data);
    console.log('Original recipient:', to);
    return { data, to };
}
```

### Committee Info

```typescript
async function checkCommittees() {
    const committees = await bite.getCommitteesInfo();

    console.log(`Active committees: ${committees.length}`);

    committees.forEach((committee, i) => {
        console.log(`Committee ${i}:`);
        console.log(`  Epoch: ${committee.epochId}`);
        console.log(`  BLS Key: ${committee.commonBLSPublicKey.slice(0, 20)}...`);
    });

    // Rotation detection
    if (committees.length === 2) {
        console.log('⚠️ Committee rotation in progress');
    }

    return committees;
}
```

### Batch Encryption

```typescript
// Encrypt multiple transactions with shared committee info
async function encryptBatch(transactions: Array<{ to: string; data: string }>) {
    // Fetch committee info once
    const committees = await bite.getCommitteesInfo();

    // Encrypt all with cached info
    return transactions.map(tx =>
        BITE.encryptTransactionWithCommitteeInfo(tx, committees)
    );
}
```

## Phase II: Message Encryption (CTX Support)

```typescript
// Encrypt arbitrary data for CTX
async function encryptForCTX(data: string) {
    const encrypted = await bite.encryptMessage(
        ethers.toUtf8Bytes(data)
    );
    return encrypted;
}
```

## Complete Example: Private Transfer

```typescript
import { BITE } from '@skalenetwork/bite';
import { ethers, Contract } from 'ethers';

const ERC20_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address) view returns (uint256)'
];

class PrivateTokenTransfer {
    private bite: BITE;
    private wallet: ethers.Wallet;

    constructor(rpcUrl: string, privateKey: string) {
        this.bite = new BITE(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(rpcUrl));
    }

    async transferPrivate(tokenAddress: string, to: string, amount: bigint) {
        // 1. Encode transfer calldata
        const token = new Contract(tokenAddress, ERC20_ABI, this.wallet);
        const calldata = token.interface.encodeFunctionData('transfer', [to, amount]);

        // 2. Encrypt the transaction
        const encryptedTx = await this.bite.encryptTransaction({
            to: tokenAddress,
            data: calldata
        });

        // 3. Send with manual gas limit
        const tx = await this.wallet.sendTransaction({
            ...encryptedTx,
            gasLimit: 300_000
        });

        console.log(`Private transfer sent: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`Confirmed in block ${receipt.blockNumber}`);

        return receipt;
    }

    async verifyTransfer(txHash: string) {
        // Get decrypted data to verify
        const { data, to } = await this.bite.getDecryptedTransactionData(txHash);

        const token = new Contract(to, ERC20_ABI, this.wallet);
        const decoded = token.interface.decodeFunctionData('transfer', data);

        console.log('Transfer details:');
        console.log(`  To: ${decoded[0]}`);
        console.log(`  Amount: ${decoded[1]}`);

        return decoded;
    }
}
```

## Error Handling

```typescript
async function safeEncrypt(transaction: { to: string; data: string }) {
    try {
        const encrypted = await bite.encryptTransaction(transaction);
        return { success: true, data: encrypted };
    } catch (error) {
        if (error.message.includes('committee')) {
            // Committee rotation issue - retry
            console.log('Committee rotation detected, retrying...');
            await new Promise(r => setTimeout(r, 3000));
            return safeEncrypt(transaction);
        }
        return { success: false, error: error.message };
    }
}
```

## API Reference

| Method | Description | Phase |
|--------|-------------|-------|
| `encryptTransaction(tx)` | Encrypt transaction data | I |
| `getDecryptedTransactionData(hash)` | Get decrypted data | I |
| `getCommitteesInfo()` | Get committee BLS keys | I |
| `encryptTransactionWithCommitteeInfo(tx, info)` | Encrypt with cached info | I |
| `encryptMessage(data)` | Encrypt arbitrary data | II |

## Resources

- **GitHub**: `github.com/skalenetwork/bite-ts`
- **npm**: `@skalenetwork/bite`
