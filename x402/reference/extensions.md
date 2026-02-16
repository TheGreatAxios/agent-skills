# Extensions — Reference Index

Extensions define optional capabilities that can be added to x402 payment flows. They are declared in the `extensions` object of `PaymentRequired` and `PaymentPayload` messages.

## Extension Structure

Each extension follows the v2 pattern:

```json
{
  "extensions": {
    "extension-name": {
      "info": { /* Extension-specific data */ },
      "schema": { /* JSON Schema validating `info` */ }
    }
  }
}
```

- **`info`**: Contains the actual extension data
- **`schema`**: JSON Schema (Draft 2020-12) that validates the structure of `info`

## Available Extensions

### Discovery & Cataloging

| Extension | Description | File |
|-----------|-------------|------|
| `bazaar` | Resource discovery and cataloging for x402 endpoints | [extension-bazaar.md](extension-bazaar.md) |

### Authentication

| Extension | Description | File |
|-----------|-------------|------|
| `sign-in-with-x` | CAIP-122 compliant wallet-based authentication (SIWE/SIWS) | [extension-sign-in-with-x.md](extension-sign-in-with-x.md) |

### Gas Sponsorship

| Extension | Description | File |
|-----------|-------------|------|
| `eip2612GasSponsoring` | Gasless EIP-2612 permit flow for tokens with native permit | [extension-eip2612-gas-sponsoring.md](extension-eip2612-gas-sponsoring.md) |
| `erc20ApprovalGasSponsoring` | Gasless ERC-20 approval flow for tokens without EIP-2612 | [extension-erc20-gas-sponsoring.md](extension-erc20-gas-sponsoring.md) |

### Payment Management

| Extension | Description | File |
|-----------|-------------|------|
| `payment-identifier` | Idempotency keys for request deduplication and response caching | [extension-payment-identifier.md](extension-payment-identifier.md) |

## Extension Flow

1. **Server declares support** in `PaymentRequired.extensions`
2. **Client echoes extension** in `PaymentPayload.extensions`
3. **Client populates `info`** with extension-specific data
4. **Facilitator/Server validates** `info` against `schema`
5. **Facilitator/Server processes** the extension data

## Transport-Specific Handling

### HTTP Transport

Extensions are included in the base64-encoded `PAYMENT-SIGNATURE` header.

### MCP Transport

Extensions are included in `_meta["x402/payment"].extensions`.

### A2A Transport

Extensions are included in `message.metadata["x402.payment.payload"].extensions`.

## Creating Custom Extensions

To create a custom extension:

1. Define the extension name (kebab-case recommended)
2. Specify the `info` structure with field descriptions
3. Create a JSON Schema (Draft 2020-12) for validation
4. Document the verification and settlement logic
5. Update facilitator/server implementations

Extension specifications should be added to the Coinbase x402 repo for standardization.

## Source

[coinbase/x402 extensions](https://github.com/coinbase/x402/tree/main/specs/extensions)
