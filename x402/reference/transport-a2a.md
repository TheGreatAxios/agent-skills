# Transport: A2A (Agent-to-Agent Protocol)

x402 payment flows over the A2A protocol using JSON-RPC messages and task-based state management for agent-to-agent payments.

## Payment Metadata Keys

| Key | Direction | Description |
|-----|-----------|-------------|
| `x402.payment.status` | Both | Payment lifecycle status |
| `x402.payment.required` | Server → Client | `PaymentRequired` object |
| `x402.payment.payload` | Client → Server | `PaymentPayload` object |
| `x402.payment.receipts` | Server → Client | Array of `SettlementResponse` |
| `x402.payment.error` | Server → Client | Error code string |

## Payment Status Lifecycle

| Status | Description | Task State |
|--------|-------------|------------|
| `payment-required` | Requirements sent to client | `input-required` |
| `payment-rejected` | Client rejected requirements | `failed` or `input-required` |
| `payment-submitted` | Payload received by server | `input-required` → `working` |
| `payment-verified` | Payload verified by server | `working` |
| `payment-completed` | Settled on-chain successfully | `working` → `completed` |
| `payment-failed` | Verification or settlement failed | `failed` |

## Payment Required Signaling

Server indicates payment required via task state `input-required` with payment metadata.

```json
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "result": {
    "kind": "task",
    "id": "task-123",
    "status": {
      "state": "input-required",
      "message": {
        "kind": "message",
        "role": "agent",
        "parts": [
          {
            "kind": "text",
            "text": "Payment is required to generate the image."
          }
        ],
        "metadata": {
          "x402.payment.status": "payment-required",
          "x402.payment.required": {
            "x402Version": 2,
            "error": "Payment required to access this resource",
            "resource": {
              "url": "https://api.example.com/generate-image",
              "description": "Generate an image",
              "mimeType": "image/png"
            },
            "accepts": [
              {
                "scheme": "exact",
                "network": "eip155:8453",
                "amount": "48240000",
                "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913",
                "payTo": "0xServerWalletAddressHere",
                "maxTimeoutSeconds": 600,
                "extra": { "name": "USD Coin", "version": "2" }
              }
            ]
          }
        }
      }
    }
  }
}
```

## Payment Payload Transmission

Client sends payment via `message/send` with `taskId` for correlation.

```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "id": "req-003",
  "params": {
    "message": {
      "taskId": "task-123",
      "role": "user",
      "parts": [
        { "kind": "text", "text": "Here is the payment authorization." }
      ],
      "metadata": {
        "x402.payment.status": "payment-submitted",
        "x402.payment.payload": {
          "x402Version": 2,
          "resource": {
            "url": "https://api.example.com/generate-image",
            "description": "Generate an image",
            "mimeType": "image/png"
          },
          "accepted": {
            "scheme": "exact",
            "network": "eip155:8453",
            "amount": "48240000",
            "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913",
            "payTo": "0xServerWalletAddressHere",
            "maxTimeoutSeconds": 600,
            "extra": { "name": "USD Coin", "version": "2" }
          },
          "payload": {
            "signature": "0x2d6a7588d6acca505cbf0d9a4a227e0c52c6c34...",
            "authorization": {
              "from": "0x857b06519E91e3A54538791bDbb0E22373e36b66",
              "to": "0xServerWalletAddressHere",
              "value": "48240000",
              "validAfter": "1740672089",
              "validBefore": "1740672154",
              "nonce": "0xf3746613c2d920b5fdabc0856f2aeb2d4f88ee6037b8cc5d04a71a4462f13480"
            }
          }
        }
      }
    }
  }
}
```

## Settlement Response Delivery

### Successful Settlement

```json
{
  "jsonrpc": "2.0",
  "id": "req-003",
  "result": {
    "kind": "task",
    "id": "task-123",
    "status": {
      "state": "completed",
      "message": {
        "kind": "message",
        "role": "agent",
        "parts": [
          { "kind": "text", "text": "Payment successful. Your image is ready." }
        ],
        "metadata": {
          "x402.payment.status": "payment-completed",
          "x402.payment.receipts": [
            {
              "success": true,
              "transaction": "0x1234567890abcdef...",
              "network": "eip155:8453",
              "payer": "0x857b06519E91e3A54538791bDbb0E22373e36b66"
            }
          ]
        }
      }
    },
    "artifacts": [
      {
        "kind": "image",
        "name": "generated-image.png",
        "mimeType": "image/png",
        "data": "base64-encoded-image-data"
      }
    ]
  }
}
```

### Payment Failure

```json
{
  "jsonrpc": "2.0",
  "id": "req-003",
  "result": {
    "kind": "task",
    "id": "task-123",
    "status": {
      "state": "failed",
      "message": {
        "kind": "message",
        "role": "agent",
        "parts": [
          {
            "kind": "text",
            "text": "Payment verification failed: The signature has expired."
          }
        ],
        "metadata": {
          "x402.payment.status": "payment-failed",
          "x402.payment.error": "EXPIRED_PAYMENT",
          "x402.payment.receipts": [
            {
              "success": false,
              "errorReason": "Payment authorization was submitted after its 'validBefore' timestamp.",
              "network": "eip155:8453",
              "transaction": ""
            }
          ]
        }
      }
    }
  }
}
```

## Error Handling

| x402 Error | Task State | Payment Status | Description |
|------------|------------|----------------|-------------|
| Payment Required | `input-required` | `payment-required` | Payment needed |
| Payment Rejected | `failed` | `payment-rejected` | Client declined |
| Invalid Payment | `failed` | `payment-failed` | Malformed payload |
| Payment Failed | `failed` | `payment-failed` | Verification/settlement failed |
| Server Error | `failed` | `payment-failed` | Internal error |
| Success | `completed` | `payment-completed` | Settled successfully |

## AgentCard Extension Declaration

Agents supporting x402 MUST declare the extension in their AgentCard:

```json
{
  "capabilities": {
    "extensions": [
      {
        "uri": "https://github.com/google-a2a/a2a-x402/v0.1",
        "description": "Supports payments using the x402 protocol for on-chain settlement.",
        "required": true
      }
    ]
  }
}
```

## Client Extension Activation

Clients MUST activate the extension via HTTP header on every request:

```http
X-A2A-Extensions: https://github.com/google-a2a/a2a-x402/v0.1
```

## Key Differences from Other Transports

- Uses **task state machine** (`input-required` → `working` → `completed`/`failed`) for payment lifecycle
- Payment data lives in **message metadata** (dot-notation keys like `x402.payment.status`)
- Supports **receipts as arrays** — multiple settlements per task
- Requires **AgentCard declaration** and **HTTP header activation** for extension
- Task correlation via `taskId` enables multi-turn payment flows
- Artifacts (tool results) delivered alongside settlement in the same response

## References

- [A2A Protocol Specification](https://a2a-protocol.org/latest/specification)
- [A2A Extensions Documentation](https://github.com/a2aproject/A2A/blob/main/docs/topics/extensions.md)
- [A2A x402 Extension Specification](https://github.com/google-agentic-commerce/a2a-x402/blob/main/spec/v0.1/spec.md)
