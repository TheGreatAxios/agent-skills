# Transport: MCP (Model Context Protocol)

x402 payment flows over the Model Context Protocol using JSON-RPC messages. This enables AI agents and MCP clients to seamlessly pay for tools and resources independent of the underlying MCP transport.

The flow described below can be used for any MCP request/response cycle: tool calls, resources, or client/server initialization.

## Metadata Keys

| Key | Direction | Location | Description |
|-----|-----------|----------|-------------|
| `x402/payment` | Client → Server | `_meta` field | `PaymentPayload` object |
| `x402/payment-response` | Server → Client | `_meta` field | `SettlementResponse` object |

## Payment Flow

1. Client calls a paid tool without payment
2. Server returns tool result with `isError: true` and `PaymentRequired` data
3. Client extracts payment requirements, creates `PaymentPayload`
4. Client retries tool call with payment in `_meta["x402/payment"]`
5. Server verifies payment, executes tool, settles payment
6. Server returns tool result with settlement info in `_meta["x402/payment-response"]`

## Payment Required Signaling

The server indicates payment is required using JSON-RPC's native error format with a 402 status code.

**Mechanism**: JSON-RPC error response with `code: 402` and `PaymentRequirementsResponse` in `error.data`
**Data Format**: `PaymentRequirementsResponse` schema in `error.data` field

### Response Format

Servers MUST provide `PaymentRequired` in **both** formats:
1. **`structuredContent`** (REQUIRED): Direct `PaymentRequired` object
2. **`content[0].text`** (REQUIRED): `JSON.stringify(structuredContent)` for clients that cannot access structured content

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": 402,
    "message": "Payment required",
    "data": {
      "x402Version": 2,
      "error": "Payment required to access this resource",
      "resource": {
        "url": "mcp://tool/financial_analysis",
        "description": "Advanced financial analysis tool",
        "mimeType": "application/json"
      },
      "accepts": [
        {
          "scheme": "exact",
          "network": "eip155:84532",
          "amount": "10000",
          "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          "payTo": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
          "maxTimeoutSeconds": 60,
          "extra": {
            "name": "USDC",
            "version": "2"
          }
        }
      ]
    }
  }
}
```

### Client Detection

Clients SHOULD prefer `structuredContent`, falling back to `content[0].text`:
1. Check if `result.structuredContent` exists and contains `x402Version` and `accepts` fields
2. If not, parse `result.content[0].text` as JSON and check for the same fields

## Payment Payload Transmission

Clients send payment data using the MCP `_meta` field with key `x402/payment`.

**Mechanism**: `_meta["x402/payment"]` field in request parameters
**Data Format**: `PaymentPayload` schema in metadata field

### Tool Call with Payment

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "financial_analysis",
    "arguments": {
      "ticker": "AAPL",
      "analysis_type": "deep"
    },
    "_meta": {
      "x402/payment": {
        "x402Version": 2,
        "resource": {
          "url": "mcp://tool/financial_analysis",
          "description": "Advanced financial analysis tool",
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
            "name": "USDC",
            "version": "2"
          }
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
        }
      }
    }
  }
}
```

## Settlement Response Delivery

Servers communicate payment settlement results using the `_meta["x402/payment-response"]` field.

**Mechanism**: `_meta["x402/payment-response"]` field in response result
**Data Format**: `SettlementResponse` schema in metadata field

### Successful Settlement

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Financial analysis for AAPL: Strong fundamentals with positive outlook..."
      }
    ],
    "_meta": {
      "x402/payment-response": {
        "success": true,
        "transaction": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "network": "eip155:84532",
        "payer": "0x857b06519E91e3A54538791bDbb0E22373e36b66"
      }
    }
  }
}
```

### Settlement Failure

When settlement fails, servers return `isError: true` with `PaymentRequired` data (same format as initial payment required signaling). If settlement fails after tool execution, the server MUST NOT return tool content — only the payment error.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": 402,
    "message": "Payment settlement failed: insufficient funds",
    "data": {
      "x402Version": 2,
      "error": "Payment settlement failed: insufficient funds",
      "resource": {
        "url": "mcp://tool/financial_analysis",
        "description": "Advanced financial analysis tool",
        "mimeType": "application/json"
      },
      "accepts": [
        {
          "scheme": "exact",
          "network": "eip155:84532",
          "amount": "10000",
          "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          "payTo": "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
          "maxTimeoutSeconds": 60,
          "extra": {
            "name": "USDC",
            "version": "2"
          }
        }
      ],
      "x402/payment-response": {
        "success": false,
        "errorReason": "insufficient_funds",
        "transaction": "",
        "network": "eip155:84532",
        "payer": "0x857b06519E91e3A54538791bDbb0E22373e36b66"
      }
    }
  }
}
```

## Error Handling

MCP transport maps x402 errors to appropriate JSON-RPC mechanisms:

| x402 Error | JSON-RPC Response | Code | Description |
|------------|-------------------|------|-------------|
| Payment Required | Error Response | 402 | Payment required with `PaymentRequirementsResponse` in `data` |
| Payment Failed | Error Response | 402 | Payment settlement failed with failure details in `data` |
| Invalid Payment | Error Response | -32602 | Malformed payment payload or invalid parameters |
| Server Error | Error Response | -32603 | Internal server error during payment processing |
| Parse Error | Error Response | -32700 | Invalid JSON in payment payload |
| Method Error | Error Response | -32601 | Unsupported x402 method or capability |

### Payment-Related Errors (402)

Payment-related errors use JSON-RPC's native error format with code 402 and structured data:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": 402,
    "message": "Payment required to access this resource",
    "data": {
      "x402Version": 2,
      "error": "Payment required to access this resource",
      "accepts": [
        /* PaymentRequirements array */
      ]
    }
  }
}
```

### Protocol Errors (Technical Issues)

Technical errors use standard JSON-RPC error responses:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid parameters: malformed payment payload in _meta['x402/payment']"
  }
}
```

**Common Protocol Error Examples:**
- **Parse Error (-32700)**: Invalid JSON in `_meta["x402/payment"]` field
- **Invalid Params (-32602)**: Missing required payment fields or invalid payment schema
- **Internal Error (-32603)**: Payment processor unavailable or blockchain network error
- **Method Not Found (-32601)**: Server doesn't support x402 payments for the requested method

## Full Flow Example

```json
// 1. Client calls tool without payment
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "financial_analysis",
    "arguments": { "ticker": "AAPL" }
  }
}

// 2. Server returns payment required
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": 402,
    "message": "Payment required",
    "data": { /* PaymentRequired */ }
  }
}

// 3. Client retries with payment
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "financial_analysis",
    "arguments": { "ticker": "AAPL" },
    "_meta": {
      "x402/payment": { /* PaymentPayload */ }
    }
  }
}

// 4. Server returns result with settlement
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{ "type": "text", "text": "Analysis result..." }],
    "_meta": {
      "x402/payment-response": { /* SettlementResponse */ }
    }
  }
}
```

## Key Differences from HTTP Transport

- Uses `_meta` fields instead of HTTP headers
- Payment data is native JSON (not base64-encoded)
- Resource URLs use `mcp://tool/{name}` scheme
- Error signaling uses JSON-RPC error responses instead of HTTP status codes
- Can be used for tools, resources, and initialization flows

## References

- [Core x402 Specification](../x402-specification.md)
- [MCP Specification](https://modelcontextprotocol.io/specification/)
- [MCP _meta Field Documentation](https://modelcontextprotocol.io/specification/2025-06-18/basic#meta)
- [Coinbase x402 MCP Transport](https://github.com/coinbase/x402/blob/master/specs/transports/mcp.md)
- [x402-mcp Implementation](https://github.com/ethanniser/x402-mcp)
- [agents/x402-mcp](https://github.com/cloudflare/agents/blob/main/packages/agents/src/mcp/x402.ts)
