# Exact Scheme — Core Specification

The `exact` scheme transfers a **specific amount** of funds from a client to a resource server. The resource server must know in advance the exact amount required.

## Example Use Cases

- Paying to view an article
- Purchasing digital credits
- An LLM paying to use a tool

## Trade-offs

**EIP-3009** requires the amount to be known upfront—usage-based payments are not supported in this scheme.

## Critical Validation Requirements

While implementation details vary by network, facilitators MUST enforce security constraints that prevent sponsorship abuse.

### SVM Examples

- **Fee payer safety**: The fee payer MUST NOT appear as an account in sensitive instructions or be the transfer authority/source
- **Destination correctness**: The receiver MUST match the `payTo` derived destination for the specified `asset`
- **Amount exactness**: The transferred amount MUST equal `maxAmountRequired`

Network-specific rules and exact instruction layouts are defined in the per-network scheme documents.

## Security: Replay Prevention

Multiple layers protect against replay attacks:

1. **EIP-3009 nonce**: 32-byte random nonce per authorization
2. **Smart contract enforcement**: EIP-3009 contracts reject reused nonces
3. **Time windows**: `validAfter` / `validBefore` bound authorization lifetime
4. **Cryptographic signatures**: All authorizations signed by payer's private key

## General Error Codes

| Code | Meaning |
|------|---------|
| `invalid_network` | Network not supported |
| `invalid_payload` | Malformed payload |
| `invalid_payment_requirements` | Bad requirements object |
| `invalid_scheme` / `unsupported_scheme` | Scheme not supported |
| `invalid_x402_version` | Version ≠ 2 |
| `unexpected_verify_error` | Internal verify failure |
| `unexpected_settle_error` | Internal settle failure |

## Per-Network References

- **EVM**: See [exact-evm.md](exact-evm.md)
- **Solana (SVM)**: See [exact-svm.md](exact-svm.md)
- **Sui**: See [exact-sui.md](exact-sui.md)

## Source

[coinbase/x402](https://github.com/coinbase/x402/tree/main/specs/schemes/exact)
