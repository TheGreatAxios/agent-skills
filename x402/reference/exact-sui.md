# Exact Scheme — Sui

Scheme identifier: `"exact"`

Uses `0x2::coin::Coin<T>` standard to transfer a specific amount of a coin type `T` from payer to resource server. The payer forms a complete signed transaction.

## Protocol Flow

1. Client makes request → receives `402 Payment Required`
2. Client optionally queries RPC for owned Coin objects
3. If sponsorship is supported, client engages with gas station (see Sponsored Transactions below)
4. Client crafts and signs transaction
5. Client resends request with `X-PAYMENT` header
6. Resource server passes payment to facilitator for verification
7. Resource server fulfills request
8. Resource server requests settlement from facilitator
9. If sponsorship used, facilitator provides its signature
10. Facilitator submits transaction to Sui network
11. Resource server returns response to client

## PaymentPayload.payload (Sui Exact)

```json
{
  "signature": "99X8xzbQkOBY3yUnaeCvDslpGdMfB81aqEf7QQC8RhXJ6rripVz2Z21Vboc/CAmodHZkcDjiraFbJlzqQJKkBQ==",
  "transaction": "AAAIAQDi1HwjSnS6M+WGvD73iEyUY2FRKNj0MlRp7+3SHZM3xCvMdB0AAAAA..."
}
```

- `signature`: Base64-encoded user signature over the Sui transaction
- `transaction`: Base64-encoded Sui transaction

## `extra` Field (Sui)

| Field | Type | Description |
|-------|------|-------------|
| `gasStation` | string | URL of gas station for sponsored transactions (optional) |

## Sponsored Transactions (Sui)

If a facilitator supports sponsoring, it provides `extra.gasStation`. The client:

1. Constructs partial transaction (without gas payment)
2. Sends partial transaction to gas station
3. Gas station fills in gas information and returns fully-formed transaction
4. Client signs and sends in `X-PAYMENT` header
5. Facilitator recognizes itself as sponsor and provides signature before broadcast

## Verification Steps

1. Verify network matches agreed chain
2. Verify signature is valid over provided transaction
3. Simulate transaction to ensure it would succeed and hasn't been executed
4. Verify simulation shows resource server's address receiving balance equal to `paymentRequirements.maxAmountRequired` in the agreed `asset`

## Settlement

Facilitator broadcasts the transaction, along with the client's signature, to the network for execution. For sponsored transactions, facilitator adds its signature before broadcast.

## Supported Sui Networks

| Network | CAIP-2 ID | Type |
|---------|-----------|------|
| Sui mainnet | `sui:1` | Production |
| Sui testnet | `sui:2` | Testnet |

## Future Work

One inefficiency is the gas cost for creating a new coin object sent to the resource server. The resource server can merge ("smash") the received coin into an existing coin to recoup storage fees.

The **"Address Balances"** feature (in development) will:
- Reduce overall gas cost by eliminating coin object creation
- Enable non-interactive sponsorship protocol
- Potentially support EIP-3009/EIP-2612 style authorizations

## Source

[coinbase/x402 - scheme_exact_sui.md](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_sui.md)
