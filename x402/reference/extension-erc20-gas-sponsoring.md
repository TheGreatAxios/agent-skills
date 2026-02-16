# Extension: `erc20ApprovalGasSponsoring`

## Summary

The `erc20ApprovalGasSponsoring` extension enables a **gasless ERC-20 approval flow** for the [`scheme_exact_evm.md`](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md) scheme.

Because these tokens lack native gasless approvals (EIP-2612):
- The **Client** must sign a normal EVM transaction calling `approve(Permit2, amount)`.
- The **Facilitator** agrees to:
  - Fund the Client's wallet with enough native gas token **if the Client lacks sufficient funds**.
  - Broadcast the Client's signed approval transaction.
  - Immediately perform settlement via [`x402Permit2Proxy`](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md#reference-implementation-x402permit2proxy) after the approval confirms.

This flow must be executed using an **atomic batch transaction** to mitigate the risk of malicious actors front-running the transaction and intercepting funds between the Facilitator funding step and the final settlement operation.

## PaymentRequired

A Facilitator advertises support for this extension by including an `erc20ApprovalGasSponsoring` entry inside the `extensions` object in the **402 Payment Required** response.

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
    "erc20ApprovalGasSponsoring": {
      "info": {
        "description": "The facilitator accepts a raw signed approval transaction and will sponsor the gas fees.",
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
            "description": "The ERC-20 token contract address to approve."
          },
          "spender": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]{40}$",
            "description": "The address of the spender (Canonical Permit2)."
          },
          "amount": {
            "type": "string",
            "pattern": "^[0-9]+$",
            "description": "Approval amount (uint256). Typically MaxUint."
          },
          "signedTransaction": {
            "type": "string",
            "pattern": "^0x[a-fA-F0-9]+$",
            "description": "RLP-encoded signed transaction calling ERC20.approve()."
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
          "signedTransaction",
          "version"
        ]
      }
    }
  }
}
```

## PaymentPayload

To use this extension:

### Client Steps

1. The **Client constructs** a normal Ethereum transaction calling:
   ```solidity
   token.approve(Permit2, amount)
   ```

2. The Client signs this transaction off-chain.

3. The Client inserts the **raw signed transaction hex** under:
   ```
   extensions.erc20ApprovalGasSponsoring
   ```

### Client Implementation Note

The Client must ensure:
- `maxFee` & `maxPriorityFee` are aligned with the current network prices.
- `nonce` matches the current on-chain nonce of the Client wallet

Incorrect fees or nonce values invalidate the signed transaction.

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
    "erc20ApprovalGasSponsoring": {
      "info": {
        "from": "0x857b06519E91e3A54538791bDbb0E22373e36b66",
        "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        "spender": "0xCanonicalPermit2",
        "amount": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        "signedTransaction": "0x02f8760103018459682f008459682f118252089436cbd53842c5426634e7929541ec2318f3dcf7e80b844095ea7b300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000022d473030f1168dee496645a04b8f7bf2044c784c0a2be80403ae90f9adc822e8a1f49207cf86ac6fb6083a3ac2485ee53ce48b02a22c61e8e13b9b9f1cb",
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
| `asset` | string | Yes | The ERC-20 token contract address to approve |
| `spender` | string | Yes | The address of the spender - typically the Canonical Permit2 contract |
| `amount` | string | Yes | Approval amount (uint256 as string). Typically MaxUint for unlimited approval |
| `signedTransaction` | string | Yes | RLP-encoded signed transaction calling `ERC20.approve()` |
| `version` | string | Yes | Schema version identifier (e.g., "1", "1.0") |

## Verification Logic

Upon receiving a `PaymentPayload` containing `erc20ApprovalGasSponsoring`:

### 1. Decode the Raw Signed Transaction

Perform RLP decoding to extract transaction fields.

### 2. Validate Transaction Fields

- **Signer**: Must match `from`
- **`to` address**: Must equal the `asset` contract
- **calldata**: Must correspond to `approve(spender, amount)`
  - Function selector: `0xd505accf` (for older tokens) or custom for Permit2
  - **Note**: The Facilitator MUST verify that `spender` in the extension data matches the spender in the decoded transaction and matches the expected contract (e.g., [Canonical Permit2](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md#canonical-permit2)).
- **nonce**: Must match user's current on-chain nonce
- **maxFee** and **maxPriorityFee**: Must match current network prices

### 3. Check User Balance

- Check if the user (`from`) has enough native gas tokens to cover the transaction cost.
- If the user has enough balance, the Facilitator skips the funding step.
- If the user lacks balance, the Facilitator calculates the deficit.

### 4. Simulate the Full Execution Sequence

The Facilitator must simulate in a single atomic batch transaction:
1. **Funding** → sending native gas token to the user (if needed)
2. **Approval Relay** → broadcasting the user's signed approval
3. **Settlement** → calling `x402Permit2Proxy.settle`

## Settlement Logic

The Facilitator constructs an **atomic bundle** with the following ordered operations:

### 1. Gas Funding (Conditional)

If the user has insufficient native gas:
- Calculate gas needed for approval transaction
- Send enough native gas token to the user (`from`) to pay for gas
- This uses the Facilitator's own funds

### 2. Broadcast Approval

Broadcast the Client-provided `signedTransaction` which calls:
```solidity
ERC20.approve(Permit2, amount)
```

### 3. x402PermitProxy Settlement

Call `x402Permit2Proxy.settle()` with the Permit2 authorization from the payment payload.

### Atomicity

All three operations must be submitted as an atomic batch to prevent front-running:
- Use EIP-4337 account abstraction bundling
- Or use Flashbots/MEV bundle protection
- Or use network-specific mempool mechanisms

## ERC-20 approve() Function Signature

```solidity
function approve(address spender, uint256 amount) external returns (bool)
```

**Function Selector**: `0x095ea7b3`

**Encoded Parameters:**
- `spender`: 32-byte padded address
- `amount`: 32-byte uint256

## Transaction Structure

The signed transaction follows EIP-1559 format:

```
0x02 || rlp([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, v, r, s])
```

Where `data` is the encoded `approve(spender, amount)` call.

## Gas Sponsorship Benefits

- **Gasless for User**: No native token required
- **Universal Compatibility**: Works with any ERC-20 token
- **Atomic Settlement**: Approval and transfer happen together
- **No Separate Approval**: Eliminates two-transaction flow

## Use Cases

This extension is ideal for:
- Tokens without EIP-2612 support
- Legacy ERC-20 tokens
- Tokens with custom approval logic
- Networks without EIP-2612 adoption

## Security Considerations

- **Atomic Batch Required**: Must use bundling to prevent front-running
- **Gas Price Validation**: Verify fees are current to prevent stuck transactions
- **Nonce Management**: Ensure transaction nonce matches on-chain state
- **Spender Validation**: Verify spender matches expected Permit2 address
- **Funding Limits**: Set maximum gas amounts to prevent drain attacks
- **Replay Protection**: Use unique nonces in settlement payload

## Comparison with EIP-2612 Gas Sponsoring

| Feature | EIP-2612 Gas Sponsoring | ERC-20 Approval Gas Sponsoring |
|---------|------------------------|-------------------------------|
| Token Support | EIP-2612 tokens only | All ERC-20 tokens |
| Client Signing | Off-chain permit | On-chain transaction |
| Gas Required | None (after permit) | Facilitator sponsors gas |
| Transaction Count | 1 atomic | 3 operations in bundle |
| Complexity | Lower | Higher |

## References

- [Core x402 Specification](../x402-specification.md)
- [ERC-20 Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [Permit2: Unlocked Permissions](https://github.com/Uniswap/permit2)
- [EIP-1559: Fee Market](https://eips.ethereum.org/EIPS/eip-1559)
- [EIP-4337: Account Abstraction](https://eips.ethereum.org/EIPS/eip-4337)
- [Coinbase x402 ERC-20 Gas Sponsoring Extension](https://github.com/coinbase/x402/blob/main/specs/extensions/erc20_gas_sponsoring.md)
- [Exact EVM Scheme](../schemes/exact/scheme_exact_evm.md)
