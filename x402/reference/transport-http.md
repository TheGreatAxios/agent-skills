# Transport: HTTP

x402 payment flows over standard HTTP/HTTPS. The original x402 transport, using HTTP status codes and headers.

## Headers Summary

| Header | Direction | Encoding | Description |
|--------|-----------|----------|-------------|
| `PAYMENT-REQUIRED` | Server → Client | Base64 JSON | `PaymentRequired` object |
| `PAYMENT-SIGNATURE` | Client → Server | Base64 JSON | `PaymentPayload` object |
| `PAYMENT-RESPONSE` | Server → Client | Base64 JSON | `SettlementResponse` object |

All header values are **base64-encoded JSON**.

## Payment Required Signaling

Server responds with HTTP **402 Payment Required** and `PAYMENT-REQUIRED` header.

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
PAYMENT-REQUIRED: eyJ4NDAyVmVyc2lvbiI6MiwiZXJyb3IiOiJQQVlNRU5ULVNJR05BVFVSRSBoZWFkZXIgaXMgcmVxdWlyZWQiLCJyZXNvdXJjZSI6eyJ1cmwiOiJodHRwczovL2FwaS5leGFtcGxlLmNvbS9wcmVtaXVtLWRhdGEiLCJkZXNjcmlwdGlvbiI6IkFjY2VzcyB0byBwcmVtaXVtIG1hcmtldCBkYXRhIiwibWltZVR5cGUiOiJhcHBsaWNhdGlvbi9qc29uIn0sImFjY2VwdHMiOlt7InNjaGVtZSI6ImV4YWN0IiwibmV0d29yayI6ImVpcDE1NTo4NDUzMiIsImFtb3VudCI6IjEwMDAwIiwiYXNzZXQiOiIweDAzNkNiRDUzODQyYzU0MjY2MzRlNzkyOTU0MWVDMjMxOGYzZENGN2UiLCJwYXlUbyI6IjB4MjA5NjkzQmM2YWZjMEM1MzI4YkEzNkZhRjAzQzUxNEVGMzEyMjg3QyIsIm1heFRpbWVvdXRTZWNvbmRzIjo2MCwiZXh0cmEiOnsibmFtZSI6IlVTREMiLCJ2ZXJzaW9uIjoiMiJ9fV19

{
  "error": "Payment required"
}
```

The `PAYMENT-REQUIRED` header decodes to:

```json
{
  "x402Version": 2,
  "error": "PAYMENT-SIGNATURE header is required",
  "resource": {
    "url": "https://api.example.com/premium-data",
    "description": "Access to premium market data",
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
      "extra": { "name": "USDC", "version": "2" }
    }
  ]
}
```

## Payment Payload Transmission

Client sends payment via `PAYMENT-SIGNATURE` header (base64-encoded `PaymentPayload`).

```http
POST /premium-data HTTP/1.1
Host: api.example.com
Content-Type: application/json
PAYMENT-SIGNATURE: eyJ4NDAyVmVyc2lvbiI6MiwicmVzb3VyY2UiOnsidXJsIjoiaHR0cHM6Ly...

{
  "query": "latest market data"
}
```

The header decodes to a full `PaymentPayload`:

```json
{
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
}
```

## Settlement Response Delivery

Server returns settlement result in `PAYMENT-RESPONSE` header (base64-encoded `SettlementResponse`).

### Success

```http
HTTP/1.1 200 OK
Content-Type: application/json
PAYMENT-RESPONSE: eyJzdWNjZXNzIjp0cnVlLCJ0cmFuc2FjdGlvbiI6IjB4MTIzNDU2Nzg5MGFiY2RlZi4uLiIsIm5ldHdvcmsiOiJlaXAxNTU6ODQ1MzIiLCJwYXllciI6IjB4ODU3YjA2NTE5RTkxZTNBNTQ1Mzg3OTFiRGJiMEUyMjM3M2UzNmI2NiJ9

{
  "data": "premium market data response",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Decodes to:

```json
{
  "success": true,
  "transaction": "0x1234567890abcdef...",
  "network": "eip155:84532",
  "payer": "0x857b06519E91e3A54538791bDbb0E22373e36b66"
}
```

### Failure

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
PAYMENT-RESPONSE: eyJzdWNjZXNzIjpmYWxzZSwiZXJyb3JSZWFzb24iOiJpbnN1ZmZpY2llbnRfZnVuZHMiLC4uLn0=

{
  "x402Version": 2,
  "error": "Payment failed: insufficient funds",
  "accepts": [...]
}
```

## HTTP Status Code Mapping

| x402 Error | HTTP Status | Description |
|------------|-------------|-------------|
| Payment Required | 402 | Payment needed |
| Invalid Payment | 400 | Malformed payload/requirements |
| Payment Failed | 402 | Verification or settlement failed |
| Server Error | 500 | Internal error during processing |
| Success | 200 | Payment verified and settled |

## Key Characteristics

- All payment data is **base64-encoded** in headers (unlike MCP/A2A which use native JSON)
- Resource URLs use standard `https://` scheme
- Leverages existing HTTP 402 status code
- Request body is preserved for the actual resource request (payment is in headers)
