# Payment Schemes — Detailed Reference

Schemes define how payments are formed, validated, and settled. They are independent of the transport layer.

## Exact Scheme — EVM

Scheme identifier: `"exact"`

Uses **EIP-3009** (`transferWithAuthorization`) for gasless ERC-20 transfers. The payer signs an EIP-712 typed data message; the facilitator submits it on-chain.

### EIP-3009 Authorization Type

```javascript
const authorizationTypes = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
};
```

### PaymentPayload.payload (EVM Exact)

```json
{
  "signature": "0x2d6a7588d6acca505cbf0d9a4a227e0c52c6c34...",
  "authorization": {
    "from": "0x857b06519E91e3A54538791bDbb0E22373e36b66",
    "to": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
    "value": "10000",
    "validAfter": "1740672089",
    "validBefore": "1740672154",
    "nonce": "0xf3746613c2d920b5fdabc0856f2aeb2d4f88ee6037b8cc5d04a71a4462f13480"
  }
}
```

### Verification Steps (in order)

1. **Signature validation** — Recover signer from EIP-712 signature; must match `authorization.from`
2. **Balance check** — Query ERC-20 `balanceOf(from)` ≥ `value`
3. **Amount validation** — `authorization.value` ≥ `paymentRequirements.amount`
4. **Time window** — `validAfter` ≤ current time ≤ `validBefore`
5. **Parameter matching** — `authorization.to` == `paymentRequirements.payTo`, asset matches, network matches
6. **Transaction simulation** — `eth_call` simulating `transferWithAuthorization` must succeed

### Settlement

Call `transferWithAuthorization(from, to, value, validAfter, validBefore, nonce, v, r, s)` on the ERC-20 contract.

### `extra` Field (EVM)

| Field | Description |
|-------|-------------|
| `name` | Token name (e.g. "USDC") |
| `version` | Token contract version (e.g. "2") |

### Supported EVM Networks

| Network | CAIP-2 ID | Type |
|---------|-----------|------|
| Base mainnet | `eip155:8453` | Production |
| Base Sepolia | `eip155:84532` | Testnet |
| Avalanche C-Chain | `eip155:43114` | Production |
| Avalanche Fuji | `eip155:43113` | Testnet |

### Supported EVM Assets

ERC-20 tokens implementing EIP-3009. Primary example: **USDC**.

---

## Exact Scheme — SVM (Solana)

Scheme identifier: `"exact"` (same scheme, different network namespace)

Uses `TransferChecked` instruction for SPL token transfers. The client constructs a partially-signed transaction; the facilitator adds its fee payer signature and submits.

### Key Verification Rules

1. **Strict instruction layout**: The transaction must contain exactly 3 instructions in order:
   - Compute Unit Limit
   - Compute Unit Price
   - TransferChecked

2. **Facilitator isolation**: The facilitator's fee payer address must NOT appear in any instruction's account list, and must not be the transfer `authority` or `source`.

3. **Gas abuse prevention**: Compute unit price is bounded to a maximum to prevent the client from extracting value via excessive priority fees.

4. **Destination ATA validation**: The destination Associated Token Account must match the PDA derived from `payTo` and `asset`. Account existence rules apply.

5. **Exact amount**: The `TransferChecked` amount must exactly equal the `amount` in `PaymentRequirements`.

### Supported SVM Networks

| Network | CAIP-2 ID | Type |
|---------|-----------|------|
| Solana mainnet | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | Production |
| Solana devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` | Testnet |

### Supported SVM Assets

- Any SPL token
- Token2022 program tokens

---

## Security: Replay Prevention

Multiple layers protect against replay:

1. **EIP-3009 nonce**: 32-byte random nonce per authorization
2. **Smart contract enforcement**: EIP-3009 contracts reject reused nonces
3. **Time windows**: `validAfter` / `validBefore` bound authorization lifetime
4. **Cryptographic signatures**: All authorizations signed by payer's private key

## Error Codes by Scheme

### EVM Exact Errors

| Code | Meaning |
|------|---------|
| `insufficient_funds` | Payer token balance too low |
| `invalid_exact_evm_payload_authorization_valid_after` | Auth not yet valid |
| `invalid_exact_evm_payload_authorization_valid_before` | Auth expired |
| `invalid_exact_evm_payload_authorization_value` | Amount too low |
| `invalid_exact_evm_payload_signature` | Bad EIP-712 signature |
| `invalid_exact_evm_payload_recipient_mismatch` | `to` ≠ `payTo` |
| `invalid_transaction_state` | On-chain tx reverted |

### General Errors

| Code | Meaning |
|------|---------|
| `invalid_network` | Network not supported |
| `invalid_payload` | Malformed payload |
| `invalid_payment_requirements` | Bad requirements object |
| `invalid_scheme` / `unsupported_scheme` | Scheme not supported |
| `invalid_x402_version` | Version ≠ 2 |
| `unexpected_verify_error` | Internal verify failure |
| `unexpected_settle_error` | Internal settle failure |
