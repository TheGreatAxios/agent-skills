# SDK Node

## Install
`npm i @arcjet/node @arcjet/inspect`

## Minimal example
```ts
import arcjet, { shield } from "@arcjet/node";
export const aj = arcjet({ key: process.env.ARCJET_KEY!, rules: [shield({ mode: "LIVE" })] });
```

## Production variant
- Shared singleton, explicit deny reason handling, metrics/log correlation by decision ID.

## Links
- https://docs.arcjet.com/reference/nodejs/
- https://github.com/arcjet/arcjet-js/tree/main/examples/express
