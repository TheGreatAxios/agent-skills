# Facilitator API — Detailed Reference

## POST /verify

Verifies a payment authorization without executing on-chain.

### Request Body

```json
{
  "paymentPayload": {
    "x402Version": 2,
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
      "extra": { "name": "USDC", "version": "2" }
    },
    "payload": {
      "signature": "0x2d6a7588d6acca505cbf0d9a4a227e0c52c6c34008c8e8986a1283259764173608a2ce6496642e377d6da8dbbf5836e9bd15092f9ecab05ded3d6293af148b571c",
      "authorization": {
        "from": "0x857b06519E91e3A54538791bDbb0E22373e36b66",
        "to": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
        "value": "10000",
        "validAfter": "1740672089",
        "validBefore": "1740672154",
        "nonce": "0xf3746613c2d920b5fdabc0856f2aeb2d4f88ee6037b8cc5d04a71a4462f13480"
      }
    },
    "extensions": {}
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "eip155:84532",
    "amount": "10000",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "payTo": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
    "maxTimeoutSeconds": 60,
    "extra": { "name": "USDC", "version": "2" }
  }
}
```

### Success Response

```json
{
  "isValid": true,
  "payer": "0x857b06519E91e3A54538791bDbb0E22373e36b66"
}
```

### Error Response

```json
{
  "isValid": false,
  "invalidReason": "insufficient_funds",
  "payer": "0x857b06519E91e3A54538791bDbb0E22373e36b66"
}
```

## POST /settle

Executes a verified payment by broadcasting to the blockchain.

### Request Body

Same structure as `/verify`.

### Success Response

```json
{
  "success": true,
  "payer": "0x857b06519E91e3A54538791bDbb0E22373e36b66",
  "transaction": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "network": "eip155:84532"
}
```

### Error Response

```json
{
  "success": false,
  "errorReason": "insufficient_funds",
  "payer": "0x857b06519E91e3A54538791bDbb0E22373e36b66",
  "transaction": "",
  "network": "eip155:84532"
}
```

## GET /supported

Returns facilitator capabilities.

### Response

```json
{
  "kinds": [
    { "x402Version": 2, "scheme": "exact", "network": "eip155:84532" },
    { "x402Version": 2, "scheme": "exact", "network": "eip155:8453" },
    { "x402Version": 2, "scheme": "exact", "network": "eip155:43113" },
    { "x402Version": 2, "scheme": "exact", "network": "eip155:43114" }
  ],
  "extensions": [],
  "signers": {
    "eip155:*": ["0x1234567890abcdef1234567890abcdef12345678"],
    "solana:*": ["CKPKJWNdJEqa81x7CkZ14BVPiY6y16Sxs7owznqtWYp5"]
  }
}
```

### SupportedResponse Fields

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `kinds` | SupportedKind[] | ✓ | Supported payment kinds |
| `extensions` | string[] | ✓ | Implemented extension identifiers |
| `signers` | object | ✓ | Map of CAIP-2 patterns → signer addresses |

### SupportedKind Fields

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `x402Version` | number | ✓ | Protocol version (2) |
| `scheme` | string | ✓ | e.g. "exact" |
| `network` | string | ✓ | CAIP-2 network ID |
| `extra` | object | | Scheme-specific config |

## Discovery API

### GET /discovery/resources

| Param | Type | Req | Default | Description |
|-------|------|-----|---------|-------------|
| `type` | string | | — | Filter by type (e.g. "http") |
| `limit` | number | | 20 | Max results (1-100) |
| `offset` | number | | 0 | Pagination offset |

### Response

```json
{
  "x402Version": 2,
  "items": [
    {
      "resource": "https://api.example.com/premium-data",
      "type": "http",
      "x402Version": 2,
      "accepts": [
        {
          "scheme": "exact",
          "network": "eip155:84532",
          "amount": "10000",
          "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          "payTo": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
          "maxTimeoutSeconds": 60,
          "extra": { "name": "USDC", "version": "2" }
        }
      ],
      "lastUpdated": 1703123456,
      "metadata": {
        "category": "finance",
        "provider": "Example Corp"
      }
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

### Discovered Resource Fields

| Field | Type | Req | Description |
|-------|------|-----|-------------|
| `resource` | string | ✓ | Resource URL |
| `type` | string | ✓ | Resource type (e.g. "http") |
| `x402Version` | number | ✓ | Protocol version |
| `accepts` | PaymentRequirements[] | ✓ | Accepted payment methods |
| `lastUpdated` | number | ✓ | Unix timestamp |
| `metadata` | object | | Category, provider, etc. |
