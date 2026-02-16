# Exact Scheme — EVM

Scheme identifier: `"exact"`

Uses **EIP-3009** (`transferWithAuthorization`) for gasless ERC-20 transfers. The payer signs an EIP-712 typed data message; the facilitator submits it on-chain.

## Why EIP-3009 over EIP-2612?

| Feature | EIP-3009 | EIP-2612 (Permit) |
|---------|----------|-------------------|
| Authorization | Specific amount | Up to an amount |
| Settlement | Single call | Two calls (permit + transferFrom) |
| Routing | No contract needed | Requires routing contract or multicall |
| Usage-based payments | Not supported | Supported |

**EIP-3009 is used for v2** because it enables gasless payments without additional contracts.

### EIP-3009 Pros/Cons

**Pros:**
- Facilitator can broadcast transactions (gasless for client and server)
- No new contracts needed

**Cons:**
- Amount must be known upfront (no usage-based payments)

### EIP-2612 Pros/Cons

**Pros:**
- Allows usage-based payments (up to an amount)

**Cons:**
- Requires multicall or routing contract
- `msg.sender` dependency breaks facilitator multicall flow

## PaymentPayload.payload (EVM Exact)

```json
{
  "signature": "0x2d6a7588d6acca505cbf0d9a4a227e0c52c6c34008c8e8986a1283259764173608a2ce6496642e377d6da8dbbf5836e9bd15092f9ecab05ded3d6293af148b571c",
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

## EIP-712 Authorization Type Structure

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

## EIP-3009 Function Signature

```solidity
function transferWithAuthorization(
    address from,
    address to,
    uint256 value,
    uint256 validAfter,
    uint256 validBefore,
    bytes32 nonce,
    uint8 v,
    bytes32 r,
    bytes32 s
) external
```

## Verification Steps (in order)

Facilitators MUST perform these checks before settling:

1. **Signature validation** — Recover signer from EIP-712 signature; must match `authorization.from`
2. **Balance check** — Query ERC-20 `balanceOf(from)` ≥ `authorization.value`
3. **Amount validation** — `authorization.value` ≥ `paymentRequirements.maxAmountRequired`
4. **Time window** — `validAfter` ≤ current time ≤ `validBefore`
5. **Nonce validation** — Nonce must not have been used (check smart contract state)
6. **Parameter matching** — `authorization.to` == `paymentRequirements.payTo`, asset matches ERC-20 contract, network matches
7. **Transaction simulation** — `eth_call` simulating `transferWithAuthorization` must succeed

## Settlement

Call `transferWithAuthorization(from, to, value, validAfter, validBefore, nonce, v, r, s)` on the ERC-20 contract.

## `extra` Field (EVM)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Token name (e.g. "USDC") |
| `version` | string | Token contract version (e.g. "2") |

## Supported EVM Networks

| Network | CAIP-2 ID | Type |
|---------|-----------|------|
| Base mainnet | `eip155:8453` | Production |
| Base Sepolia | `eip155:84532` | Testnet |
| Avalanche C-Chain | `eip155:43114` | Production |
| Avalanche Fuji | `eip155:43113` | Testnet |

## Supported EVM Assets

ERC-20 tokens implementing EIP-3009. Primary example: **USDC**.

## EVM-Specific Error Codes

| Code | Meaning |
|------|---------|
| `insufficient_funds` | Payer token balance too low |
| `invalid_exact_evm_payload_authorization_valid_after` | Auth not yet valid |
| `invalid_exact_evm_payload_authorization_valid_before` | Auth expired |
| `invalid_exact_evm_payload_authorization_value` | Amount too low |
| `invalid_exact_evm_payload_signature` | Bad EIP-712 signature |
| `invalid_exact_evm_payload_recipient_mismatch` | `to` ≠ `payTo` |
| `invalid_transaction_state` | On-chain tx reverted |

## Source

[coinbase/x402 - scheme_exact_evm.md](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md)
