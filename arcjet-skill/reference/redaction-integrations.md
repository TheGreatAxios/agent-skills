# Redaction Integrations

Use Arcjet redaction before sending prompts to third-party LLM services.

## Minimal example
```ts
import { ArcjetRedact } from "@langchain/community/llms/arcjet";
```

## Production variant
- Custom `replace` and `detect` callbacks for stable tokenization and reversible placeholders.

## Use when
- You need privacy-preserving LLM usage with local redaction.

## Links
- https://docs.arcjet.com/integrations/langchain
- https://docs.arcjet.com/integrations/openai
- https://github.com/arcjet/arcjet-js
