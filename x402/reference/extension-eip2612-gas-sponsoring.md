# Extension: `eip2612GasSponsoring`

## Summary

The `eip2612GasSponsoring` extension enables a "gasless" approval flow to the `Permit` Contract for tokens that implement **EIP-2612** for the [`scheme_exact_evm.md`](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md) scheme.

When this extension is active, the Facilitator agrees to accept this off-chain signature and submit it to the blockchain on the user's behalf, paying the gas fees.

## PaymentRequired

A Facilitator advertises support for this extension by including the `eip2612GasSponsoring` key in the `extensions` object of the **402 Payment Required** response.

```json
{
  "x402Version": "2",
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:84532",
      "amount": "10000",
      "payTo": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
      "maxTimeoutSeconds": 60,
      "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "extra": {
        "assetTransferMethod": "permit2",
        "name": "USDC",
        "version": "2"
      }
    }
  ],
  "extensions": {
    "eip2612GasSponsoring": {
      "info": {
        "description": "The facilitator accepts EIP-2612 gasless Permit to `Permit2` canonical contract.",
        "version": "1"
      },
      "schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "from": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$",
            "description": "The address of the sender."
          },
          "asset": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$",
            "description": "The address of the ERC-20 token contract."
          },
          "spender": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$",
            "description": "The address of the spender (Canonical Permit2)."
          },
          "amount": {
            "type": "string",
            "pattern": "^[0-9]+$",
            "description": "The amount to approve (uint256). Typically MaxUint."
          },
          "nonce": {
            "type": "string",
            "pattern": "^[0-9]+$",
            "description": "The current nonce of the sender."
          },
          "deadline": {
            "type": "string",
            "pattern": "^[0-9]+$",
            "description": "The timestamp at which the signature expires."
          },
          "signature": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]+$",
            "description": "The 65-byte concatenated signature (r, s, v) as a hex string."
          },
          "version": {
            "type": "string",
            "pattern": "^[0-9]+(\\.[0-9]+)*$",
            "description": "Schema version identifier."
          }
        },
        "required": [
          "from",
          "asset",
          "spender",
          "amount",
          "nonce",
          "deadline",
          "signature",
          "version"
        ]
      }
    }
  }
}
```

## PaymentPayload

To utilize this extension, the client must generate a valid EIP-2612 signature and include it in the `eip2612GasSponsoring` under the key `extensions`.

### Example PaymentPayload

```json
{
  "x402Version": "2",
  "resource": {
    "url": "https://api.example.com/premium-data",
    "description": "Access to premium market data",
    "mimeType": "application/json"
  },
  "accepted": {
    "scheme": "exact",
    "network": "eip155:84532",
    "amount": "10000",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "payTo": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
    "maxTimeoutSeconds": 60,
    "extra": {
      "assetTransferMethod": "permit2",
      "name": "USDC",
      "version": "2"
    }
  },
  "payload": {
    "signature": "0x2d6a7588d6acca505cbf0d9a4a227e0c52c6c34008c8e8986a1283259764173608a2ce6496642e377d6da8dbbf5836e9bd15092f9ecab05ded3d6293af148b571c",
    "permit2Authorization": {
      "permitted": {
        "token": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        "amount": "10000"
      },
      "from": "0x857b06519E91e3A54538791bDbb0E22373e36b66",
      "spender": "0x402Permit2ProxyAddress",
      "nonce": "0xf3746613c2d920b5fdabc0856f2aeb2d4f88ee6037b8cc5d04a71a4462f13480",
      "deadline": "1740672154",
      "witness": {
        "to": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
        "validAfter": "1740672089",
        "extra": {}
      }
    }
  },
  "extensions": {
    "eip2612GasSponsoring": {
      "info": {
        "from": "0x857b06519E91e3A54538791bDbb0E22373e36b66",
        "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        "spender": "0xCanonicalPermit2",
        "amount": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        "nonce": "0",
        "deadline": "1740672154",
        "signature": "0x2d6a7588d6acca505cbf0d9a4a227e0c52c6c34008c8e8986a1283259764173608a2ce6496642e377d6da8dbbf5836e9bd15092f9ecab05ded3d6293af148b571c",
        "version": "1"
      }
    }
  }
}
```

## Extension Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | string | Yes | The address of the sender (0x-prefixed, 40 hex characters) |
| `asset` | string | Yes | The address of the ERC-20 token contract (0x-prefixed, 40 hex characters) |
| `spender` | string | Yes | The address of the spender - typically the Canonical Permit2 contract |
| `amount` | string | Yes | The amount to approve (uint256 as string). Typically MaxUint for unlimited approval |
| `nonce` | string | Yes | The current nonce of the sender (uint256 as string) |
| `deadline` | string | Yes | Unix timestamp at which the signature expires (uint256 as string) |
| `signature` | string | Yes | The 65-byte concatenated signature (r, s, v) as hex string |
| `version` | string | Yes | Schema version identifier (e.g., "1", "1.0") |

## Verification Logic

When the Facilitator receives a payload containing `eip2612GasSponsoring` data, they must verify the following:

### 1. Verify Token Supports EIP-2612

Verify the `asset` address actually implements `IERC20Permit` by checking:
- Contract has `permit` function with correct selector: `0xd505accf`
- Or query contract interface via ERC-165

### 2. Verify Signature

Verify the `signature` was signed for the `spender` and recovers to `from`:

- **Note**: The Facilitator MUST verify that `spender` matches the expected contract (e.g., [Canonical Permit2](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md#canonical-permit2)).

The signature should be the result of signing the EIP-2612 permit message:
```solidity
Permit(owner, spender, amount, deadline, nonce)
```

### 3. Simulate Settlement

Simulate `x402Permit2Proxy.settleWithPermit` to ensure:
- Permit can be successfully executed
- Sufficient allowance will be granted
- Transaction will not revert

## Settlement Logic

The Settlement is performed by calling the [`x402Permit2Proxy.settleWithPermit`](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md#reference-implementation-x402permit2proxy).

### Settlement Flow

1. Facilitator receives the `PaymentPayload` with EIP-2612 `permit` signature
2. Facilitator verifies the signature against the Permit2 contract
3. Facilitator calls `x402Permit2Proxy.settleWithPermit` with:
   - The EIP-2612 permit signature
   - The Permit2 authorization
   - The payment details
4. The proxy contract:
   - Executes `permit` on the token contract
   - Executes `permitTransferFrom` via Permit2
   - Transfers tokens to the recipient
5. Facilitator returns `SettlementResponse` with transaction hash

## EIP-2612 Message Format

The EIP-2612 permit message format:

```solidity
struct Permit {
    address owner;
    address spender;
    uint256 amount;
    uint256 deadline;
    uint256 nonce;
}
```

The message is typed according to the token's `PERMIT_TYPEHASH` and signed using EIP-712.

## Integration with Permit2

This extension is designed to work with Permit2, the canonical approval mechanism:

1. **EIP-2612 Permit**: Grants approval to Permit2 contract
2. **Permit2 Authorization**: Authorizes specific transfer
3. **Atomic Settlement**: Both approvals and transfer happen in one transaction

## Gas Sponsorship Benefits

- **Gasless for User**: No native token required in user's wallet
- **Single Transaction**: Permit and settlement happen atomically
- **Reduced Friction**: No separate approval transaction needed

## Supported Tokens

This extension works with any ERC-20 token that implements EIP-2612:
- USDC (Circle)
- DAI (MakerDAO)
- USDT (Tether) - on some networks
- Many other DeFi tokens

## Security Considerations

- **Signature Expiration**: Facilitators must respect the `deadline` field
- **Nonce Management**: Tokens manage nonces on-chain to prevent replay attacks
- **Spender Validation**: Always verify `spender` matches expected Permit2 address
- **Amount Validation**: Ensure approval amount covers the payment amount

## References

- [Core x402 Specification](../x402-specification.md)
- [EIP-2612: permit - ERC-20 extension](https://eips.ethereum.org/EIPS/eip-2612)
- [Permit2: Unlocked Permissions](https://github.com/Uniswap/permit2)
- [Coinbase x402 EIP-2612 Gas Sponsoring Extension](https://github.com/coinbase/x402/blob/main/specs/extensions/eip2612_gas_sponsoring.md)
- [Exact EVM Scheme](../schemes/exact/scheme_exact_evm.md)
