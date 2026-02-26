# Email Validation

Validate and verify email quality for signup and abuse reduction.

## Use when
- You need to block disposable or malformed addresses.

## Minimal example
```ts
import { validateEmail } from "@arcjet/node";
const rule = validateEmail({ mode: "LIVE", deny: ["DISPOSABLE", "INVALID"] });
```

## Production variant
- Combine email validation with bot + rate limit on signup routes.

## Common failure modes
- Applying strict policy to routes where temporary email is valid (support workflows).

## Links
- https://docs.arcjet.com/email-validation/quick-start
- https://docs.arcjet.com/email-validation/reference/
- https://github.com/arcjet/arcjet-js/tree/main/examples
