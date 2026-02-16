# Extension: `payment-identifier`

## Summary

The `payment-identifier` extension enables clients to provide an `id` that serves as an idempotency key. Both resource servers and facilitators consume `PaymentPayload`, so this can be leveraged at either or both points in the stack to deduplicate requests and return cached responses for repeated submissions.

## PaymentRequired

Server advertises support:

```json
{
  "x402Version": 2,
  "extensions": {
    "payment-identifier": {
      "info": {
        "required": false
      },
      "schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "required": { "type": "boolean" },
          "id": { "type": "string", "minLength": 16, "maxLength": 128 }
        },
        "required": ["required"]
      }
    }
  }
}
```

## PaymentPayload

Client echoes the extension and appends an `id`:

```json
{
  "x402Version": 2,
  "extensions": {
    "payment-identifier": {
      "schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "required": { "type": "boolean" },
          "id": { "type": "string", "minLength": 16, "maxLength": 128 }
        },
        "required": ["required"]
      },
      "info": {
        "required": false,
        "id": "pay_7d5d747be160e280504c099d984bcfe0"
      }
    }
  }
}
```

## Fields

### `required`

- **Type**: boolean
- **Purpose**: Indicates whether the server requires clients to include a payment identifier
- **Default**: `false` (payment identifier is optional)

### `id`

- **Length**: 16-128 characters
- **Characters**: alphanumeric, hyphens, underscores
- **Recommendation**: UUID v4 with prefix (e.g., `pay_`)

**Example formats:**
- `pay_7d5d747be160e280504c099d984bcfe0` (UUID with prefix)
- `req_1234567890_abcdef` (custom format)
- `order_abc123def456` (order-based)

## Idempotency Behavior

| Scenario | Server Response |
|----------|-----------------|
| New `id` | Process request normally |
| Same `id`, same payload | Return cached response |
| Same `id`, different payload | Return 409 Conflict |
| `required: true`, no `id` provided | Return 400 Bad Request |

### HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 OK | New payment processed successfully |
| 304 Not Modified | Cached response returned (same `id`, same payload) |
| 409 Conflict | Duplicate `id` with different payload |
| 400 Bad Request | Missing required `id` |

## Responsibilities

Both resource servers and facilitators consume `PaymentPayload`, so this extension can be leveraged at either or both points:

### Resource Server

- May use `id` for request deduplication
- May cache responses for repeated identical requests
- Returns 304 or cached response for duplicate requests

### Facilitator

- May use `id` for verify/settle idempotency
- Prevents duplicate blockchain transactions for the same payment
- Returns cached settlement response for duplicate `id`

### Client

- Generates unique `id` for each new payment request
- Reuses same `id` on retries of the same request
- Must provide `id` if server sets `required: true`

## Transport-Specific Implementation

### HTTP Transport

The payment identifier is included in the `PaymentPayload` in the `PAYMENT-SIGNATURE` header:

```http
PAYMENT-SIGNATURE: eyJ4NDAyVmVyc2lvbiI6MiwicmVzb3VyY2UiOnsidXJsIjoiLi4uIn0sImFjY2VwdGVkIjp7Li4ufSwicGF5bG9hZCI6ey4u.fSwiZXh0ZW5zaW9ucyI6eyJwYXltZW50LWlkZW50aWZpZXIiOnsiaW5mbyI6eyJyZXF1aXJlZCI6ZmFsc2UsImlkIjoicGF5XzdkNWQ3NDdiZTE2MGUyODA1MDRjMDk5ZDk4NGJjZmUwIn19fX0=
```

### MCP Transport

The payment identifier is included in the `_meta["x402/payment"]` field:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "paid_tool",
    "arguments": {},
    "_meta": {
      "x402/payment": {
        "x402Version": 2,
        "extensions": {
          "payment-identifier": {
            "info": {
              "required": false,
              "id": "pay_7d5d747be160e280504c099d984bcfe0"
            }
          }
        }
      }
    }
  }
}
```

### A2A Transport

The payment identifier is included in the message metadata:

```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "taskId": "task-123",
      "role": "user",
      "parts": [{ "kind": "text", "text": "Payment" }],
      "metadata": {
        "x402.payment.payload": {
          "x402Version": 2,
          "extensions": {
            "payment-identifier": {
              "info": {
                "required": false,
                "id": "pay_7d5d747be160e280504c099d984bcfe0"
              }
            }
          }
        }
      }
    }
  }
}
```

## Best Practices

1. **Generate IDs client-side**: Use UUID v4 or similar to ensure uniqueness
2. **Retry with same ID**: When retrying failed requests, reuse the same `id`
3. **Respect `required` flag**: Always provide `id` when server sets `required: true`
4. **Handle 304 responses**: Treat cached responses as successful payment confirmations
5. **Avoid ID collision**: Use prefixes or namespaces to prevent conflicts

## Security Considerations

- **No sensitive data**: Don't include personal information in payment identifiers
- **Unpredictable**: Use cryptographically random values to prevent guessing
- **Scope to session**: Consider tying IDs to user sessions for additional protection

## References

- [Core x402 Specification](../x402-specification.md)
- [Coinbase x402 Payment Identifier Extension](https://github.com/coinbase/x402/blob/main/specs/extensions/payment_identifier.md)
