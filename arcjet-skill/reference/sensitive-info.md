# Sensitive Info Detection

Detect PII/secrets in request bodies before app handling.

## Minimal example
```ts
import { sensitiveInfo } from "@arcjet/node";
const rule = sensitiveInfo({ mode: "LIVE", deny: ["email", "credit-card"] });
```

## Production variant
- Add custom `detect` to include domain-specific sensitive tokens.

## Common failure modes
- Applying body scanning to routes with binary or non-text payloads without guards.

## Links
- https://docs.arcjet.com/sensitive-info/quick-start
- https://docs.arcjet.com/sensitive-info
- https://github.com/arcjet/arcjet-js/tree/main/examples
