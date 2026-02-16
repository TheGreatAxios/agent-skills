# Exact Scheme — SVM (Solana)

Scheme identifier: `"exact"`

Uses `TransferChecked` instruction for SPL token transfers. The client constructs a partially-signed transaction; the facilitator adds its fee payer signature and submits.

## Protocol Flow

1. Client receives `402 Payment Required` with `extra.feePayer` (facilitator's public key)
2. Client creates transaction with transfer instruction
3. Client signs → partially-signed transaction
4. Client serializes and base64-encodes the transaction
5. Client sends request with `X-PAYMENT` header containing encoded transaction
6. Facilitator verifies transaction structure and signs as fee payer
7. Facilitator submits fully-signed transaction to Solana
8. Resource server grants access to client

## PaymentPayload.payload (SVM Exact)

```json
{
  "transaction": "AAAAAAAAAAAAA...AAAAAAAAAAAAA="
}
```

The `transaction` field contains the base64-encoded, serialized, **partially-signed** versioned Solana transaction.

## `extra` Field (SVM)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `feePayer` | string | ✓ | Public key of the account that will pay transaction fees (typically facilitator) |

## Critical Verification Rules (MUST)

A facilitator MUST enforce all checks before sponsoring and signing:

### 1. Instruction Layout

Transaction MUST contain 3 or 4 instructions in this exact order:
1. Compute Budget: Set Compute Unit Limit
2. Compute Budget: Set Compute Unit Price (bounded to ≤ 5 lamports per CU)
3. Optional: Associated Token Account Create (if destination ATA doesn't exist)
4. SPL Token or Token-2022 `TransferChecked`

### 2. Fee Payer Safety

The fee payer address MUST NOT:
- Appear in the `accounts` of any instruction
- Be the `authority` for TransferChecked
- Be the `source` of the transferred funds

### 3. Compute Budget Validity

- Program for instructions (1) and (2) MUST be `ComputeBudget` with correct discriminators (2 = SetLimit, 3 = SetPrice)
- Compute unit price MUST be bounded to prevent gas abuse (reference: ≤ 5 lamports per CU)

### 4. Transfer Intent and Destination

- TransferChecked program MUST be `spl-token` or `token-2022`
- Destination MUST equal ATA PDA for `(owner = payTo, mint = asset)`

### 5. Account Existence

- The `source` ATA MUST exist
- The destination ATA MUST exist if Create ATA instruction is NOT present
- If Create ATA is present, destination ATA MAY be absent prior to execution

### 6. Amount Exactness

The `amount` in TransferChecked MUST equal `maxAmountRequired` exactly

## Supported SVM Networks

| Network | CAIP-2 ID | Type |
|---------|-----------|------|
| Solana mainnet | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | Production |
| Solana devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` | Testnet |

## Supported SVM Assets

- Any SPL token
- Token-2022 program tokens

## SVM-Specific Error Codes

| Code | Meaning |
|------|---------|
| `invalid_exact_svm_payload_instruction_layout` | Instruction order/structure invalid |
| `invalid_exact_svm_payload_fee_payer_exposed` | Fee payer appears in instruction accounts |
| `invalid_exact_svm_payload_destination_mismatch` | Destination ATA doesn't match payTo/asset |
| `invalid_exact_svm_payload_amount_mismatch` | Amount ≠ maxAmountRequired |
| `invalid_exact_svm_payload_compute_unit_exceeded` | Compute unit price exceeds maximum |

## Source

[coinbase/x402 - scheme_exact_svm.md](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_svm.md)
