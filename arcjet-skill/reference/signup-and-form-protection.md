# Signup And Form Protection

Combine bot protection, rate limits, and email validation on registration endpoints.

## Baseline stack
- `detectBot`
- `slidingWindow` or `tokenBucket`
- `validateEmail`

## Minimal route policy
```ts
rules: [detectBot({ mode: "DRY_RUN", deny: ["CATEGORY:AI"] }), slidingWindow({ mode: "DRY_RUN", interval: "1m", max: 10 }), validateEmail({ mode: "DRY_RUN", deny: ["DISPOSABLE"] })]
```

## Links
- https://docs.arcjet.com/blueprints/signup-form-protection/
- https://docs.arcjet.com/bot-protection/quick-start/
- https://docs.arcjet.com/rate-limiting/quick-start/
- https://docs.arcjet.com/email-validation/quick-start
