# Blueprints: AI Quota, OpenAI, LangChain

## Goal
Control token costs and abuse for LLM-backed products.

## Minimal policy
```ts
rules: [tokenBucket({ mode: "LIVE", interval: "1h", refillRate: 2000, capacity: 5000 }), detectBot({ mode: "LIVE", deny: ["CATEGORY:AI"] })]
```

## Production variant
- Key by authenticated `user.id` or billing account.
- Pass estimated token cost into request accounting path.
- Add redaction before third-party LLM calls.

## Links
- https://docs.arcjet.com/blueprints/ai-quota-control/
- https://docs.arcjet.com/integrations/openai
- https://docs.arcjet.com/integrations/langchain
