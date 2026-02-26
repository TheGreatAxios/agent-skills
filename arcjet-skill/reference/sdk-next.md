# SDK Next.js

## Install
`npm i @arcjet/next @arcjet/inspect`

## Minimal middleware example
```ts
import arcjet, { shield } from "@arcjet/next";
const aj = arcjet({ key: process.env.ARCJET_KEY!, rules: [shield({ mode: "LIVE" })] });
```

## Production variant
- Middleware for edge gating + route handlers for action-specific policies.

## Links
- https://docs.arcjet.com/reference/nextjs
- https://docs.arcjet.com/integrations/openai
- https://github.com/arcjet/example-nextjs
